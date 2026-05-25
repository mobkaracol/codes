/* ==================================================
   MURAL — SCRIPT PRINCIPAL
   Desenha, arrasta e redimensiona os blocos no canvas.

   Esta versao foi reescrita do zero para corrigir os
   bugs de movimentacao e redimensionamento. As tres
   causas principais eram:

   1) O canvas era medido UMA vez, antes da sidebar
      carregar (ela entra via fetch e muda o tamanho da
      area). Resultado: o ponto do clique nao batia com
      o ponto desenhado. Agora um ResizeObserver remede
      o canvas sempre que o tamanho muda.

   2) Nao havia suporte a telas HiDPI (escala 125%/150%
      do Windows). Tudo ficava borrado e o mouse errava
      por uns pixels. Agora desenhamos em pixels logicos
      e escalamos o contexto pelo devicePixelRatio.

   3) Usava eventos de "mouse" — ao arrastar rapido e sair
      do canvas a nota travava, e nao funcionava no toque.
      Agora usamos Pointer Events com captura do ponteiro:
      o arrasto continua firme mesmo fora do canvas e
      funciona no celular.
   ================================================== */

const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");

/* ----- Constantes de estilo / limites ----- */
const RAIO_BLOCO = 16;          // arredondamento dos cantos
const PADDING = 16;             // respiro interno do texto
const RAIO_FECHAR = 11;         // raio do botao de fechar
const ALCA_RESIZE = 22;         // area sensivel da alca de redimensionar
const LARGURA_MIN = 140;
const ALTURA_MIN = 100;
const FONTE = '"Poppins", "Segoe UI", sans-serif';

/* Tamanho LOGICO do canvas (em pixels de CSS, nao fisicos).
   Todo o desenho e toda a interacao usam estas medidas. */
let larguraTela = 0;
let alturaTela = 0;

let blocos = [];

/* ==================================================
   AJUSTE DO CANVAS (HiDPI + remedicao automatica)
   ================================================== */

/* Redimensiona o buffer interno do canvas para a resolucao
   fisica da tela (nitidez) e escala o contexto para que o
   resto do codigo continue trabalhando em pixels de CSS. */
function ajustarCanvas() {
    const dpr = window.devicePixelRatio || 1;

    larguraTela = canvas.clientWidth;
    alturaTela = canvas.clientHeight;

    canvas.width = Math.round(larguraTela * dpr);
    canvas.height = Math.round(alturaTela * dpr);

    // 1 unidade de desenho = 1 pixel de CSS, em qualquer escala
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = "high";

    // garante que nenhum bloco fique preso fora da nova area
    manterBlocosVisiveis();
}

/* Mantem cada bloco dentro dos limites visiveis do canvas
   (util quando a janela encolhe ou a sidebar recolhe) */
function manterBlocosVisiveis() {
    for (const b of blocos) {
        b.width = Math.min(b.width, larguraTela);
        b.height = Math.min(b.height, alturaTela);
        b.x = Math.max(0, Math.min(b.x, larguraTela - b.width));
        b.y = Math.max(0, Math.min(b.y, alturaTela - b.height));
    }
}

/* O ResizeObserver dispara sempre que o tamanho exibido do
   canvas muda: carga da pagina, resize da janela, ou quando
   a sidebar recolhe/expande (ela altera o padding da area).
   Esse era o pulo do gato que faltava. */
const observador = new ResizeObserver(() => {
    ajustarCanvas();
    render();
});
observador.observe(canvas);

// impede o navegador de rolar/dar zoom durante o arrasto no toque
canvas.style.touchAction = "none";

/* ==================================================
   CLASSES DOS BLOCOS
   ================================================== */

/* Base com a geometria comum (posicao, tamanho e zonas
   de interacao: corpo, botao de fechar e alca de resize) */
class BlocoBase {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /** Centro do botao de fechar (canto superior direito) */
    centroFechar() {
        return { x: this.x + this.width - 16, y: this.y + 16 };
    }

    /** O ponto esta sobre o corpo do bloco? */
    contains(x, y) {
        return (
            x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height
        );
    }

    /** O ponto esta sobre o botao de fechar? */
    isCloseButton(x, y) {
        const c = this.centroFechar();
        return Math.hypot(x - c.x, y - c.y) <= RAIO_FECHAR + 2;
    }

    /** O ponto esta sobre a alca de redimensionar?
        (so o canto inferior direito, numa area de ALCA_RESIZE px) */
    isResizeHandle(x, y) {
        return (
            x >= this.x + this.width - ALCA_RESIZE && x <= this.x + this.width &&
            y >= this.y + this.height - ALCA_RESIZE && y <= this.y + this.height
        );
    }
}

/* Bloco de texto (titulo + conteudo + cor) */
class Bloco extends BlocoBase {
    constructor(x, y, title, content, color, font = "18px") {
        super(x, y, 220, 160);
        this.title = title;
        this.content = content;
        this.color = color;
        this.font = font;
        this.type = "texto";
    }

    /** Quebra o texto em varias linhas dentro do bloco */
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = String(text).split(" ");
        let line = "";
        let currentY = y;
        const maxLines = Math.max(1, Math.floor((this.height - 2 * PADDING - 20) / lineHeight));
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + " ";
                currentY += lineHeight;
                lineCount++;
                if (lineCount >= maxLines) {
                    ctx.fillText("...", x, currentY);
                    return;
                }
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
}

/* Bloco de imagem (base64 guardado no localStorage) */
class ImagemBloco extends BlocoBase {
    constructor(x, y, base64Data, width = 200, height = 200) {
        super(x, y, width, height);
        this.base64Data = base64Data;
        this.type = "imagem";

        this.imgElement = new Image();
        if (base64Data) {
            this.imgElement.onload = () => render();
            this.imgElement.src = base64Data;
        }
    }
}

/* Tamanho da fonte proporcional a largura do bloco */
function getFontSize(bloco) {
    const scaleFactor = bloco.width / 220;
    let size = 18 * scaleFactor;
    return Math.min(24, Math.max(12, size));
}

/* ==================================================
   PERSISTENCIA (localStorage)
   ================================================== */

function loadBloco() {
    const savedBloco = localStorage.getItem("muralBloco");
    const bemVindoCriado = localStorage.getItem("mural_bemVindoCriado");

    if (savedBloco) {
        try {
            const blocoData = JSON.parse(savedBloco);
            blocos = [];

            for (const item of blocoData) {
                if (item.type === "imagem") {
                    blocos.push(new ImagemBloco(item.x, item.y, item.base64Data, item.width, item.height));
                } else {
                    const novo = new Bloco(item.x, item.y, item.title, item.content, item.color, item.font);
                    if (item.width) novo.width = item.width;
                    if (item.height) novo.height = item.height;
                    blocos.push(novo);
                }
            }
        } catch (e) {
            console.error("Erro ao carregar blocos:", e);
            blocos = [];
        }
    }

    if (!bemVindoCriado) {
        blocos.push(new Bloco(60, 60, "Bem-Vindo!",
            "Este é o Feli's Box — arraste, redimensione e crie seu primeiro bloco!", "#d8c8ff"));
        saveBloco();
        localStorage.setItem("mural_bemVindoCriado", "true");
    }
}

function saveBloco() {
    const blocoData = blocos.map((p) => {
        if (p.type === "imagem") {
            return { type: "imagem", x: p.x, y: p.y, width: p.width, height: p.height, base64Data: p.base64Data };
        }
        return {
            x: p.x, y: p.y, width: p.width, height: p.height,
            title: p.title, content: p.content, color: p.color, font: p.font,
        };
    });

    try {
        localStorage.setItem("muralBloco", JSON.stringify(blocoData));
    } catch (e) {
        // QuotaExceededError: normalmente excesso de imagens guardadas
        console.error("Erro ao salvar no localStorage:", e);
        alert("Não foi possível salvar: o armazenamento do navegador está cheio. "
            + "Remova alguns blocos ou imagens e tente novamente.");
    }
}

/* ==================================================
   UTILIDADES
   ================================================== */

/** Posicao do ponteiro em coordenadas do canvas.
    Como desenhamos em pixels de CSS, basta subtrair a
    origem do canvas — sem fator de escala (era ai que a
    versao antiga errava quando o layout mudava). */
function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

/** Desenha um caminho de retangulo arredondado no ctx atual */
function caminhoArredondado(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, r);
    } else {
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
}

/** Procura, do topo para baixo, qual bloco e qual zona estao sob o ponto */
function blocoNoPonto(x, y) {
    for (let i = blocos.length - 1; i >= 0; i--) {
        const b = blocos[i];
        if (b.isCloseButton(x, y)) return { bloco: b, indice: i, zona: "fechar" };
        if (b.isResizeHandle(x, y)) return { bloco: b, indice: i, zona: "redimensionar" };
        if (b.contains(x, y)) return { bloco: b, indice: i, zona: "corpo" };
    }
    return null;
}

/* ==================================================
   RENDERIZAÇÃO
   ================================================== */

function render() {
    const dark = document.body.classList.contains("dark");

    // fundo do mural conforme o tema
    ctx.fillStyle = dark ? "#1d1b27" : "#ffffff";
    ctx.fillRect(0, 0, larguraTela, alturaTela);

    if (blocos.length === 0) {
        ctx.fillStyle = dark ? "#6f6b88" : "#b6b2c9";
        ctx.font = `500 18px ${FONTE}`;
        ctx.textAlign = "center";
        ctx.fillText("Nenhum bloco ainda — crie seu primeiro bloco!", larguraTela / 2, alturaTela / 2);
        ctx.textAlign = "left";
        return;
    }

    ctx.textAlign = "left";

    blocos.forEach((bloco) => {
        // ----- cartao com sombra suave -----
        ctx.save();
        ctx.shadowColor = dark ? "rgba(0,0,0,0.45)" : "rgba(60,50,110,0.20)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;
        caminhoArredondado(bloco.x, bloco.y, bloco.width, bloco.height, RAIO_BLOCO);
        ctx.fillStyle = bloco.type === "imagem" ? (dark ? "#2a2838" : "#ffffff") : bloco.color;
        ctx.fill();
        ctx.restore();

        if (bloco.type === "imagem") {
            // imagem recortada nos cantos arredondados
            ctx.save();
            caminhoArredondado(bloco.x, bloco.y, bloco.width, bloco.height, RAIO_BLOCO);
            ctx.clip();
            if (bloco.imgElement.complete && bloco.imgElement.src) {
                ctx.drawImage(bloco.imgElement, bloco.x, bloco.y, bloco.width, bloco.height);
            } else {
                ctx.fillStyle = dark ? "#2a2838" : "#ece9f5";
                ctx.fillRect(bloco.x, bloco.y, bloco.width, bloco.height);
            }
            ctx.restore();
        } else {
            // borda sutil no cartao de texto
            caminhoArredondado(bloco.x, bloco.y, bloco.width, bloco.height, RAIO_BLOCO);
            ctx.strokeStyle = "rgba(0,0,0,0.08)";
            ctx.lineWidth = 1;
            ctx.stroke();

            const fontSize = getFontSize(bloco);
            const titleSize = fontSize + 2;

            // titulo
            ctx.fillStyle = "#2c2a3b";
            ctx.font = `600 ${titleSize}px ${FONTE}`;
            bloco.wrapText(bloco.title, bloco.x + PADDING, bloco.y + PADDING + titleSize,
                bloco.width - 2 * PADDING, titleSize + 4);

            // linha divisoria
            ctx.strokeStyle = "rgba(44,42,59,0.18)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bloco.x + PADDING, bloco.y + PADDING + titleSize + 8);
            ctx.lineTo(bloco.x + bloco.width - PADDING, bloco.y + PADDING + titleSize + 8);
            ctx.stroke();

            // conteudo
            ctx.fillStyle = "rgba(44,42,59,0.82)";
            ctx.font = `400 ${fontSize}px ${FONTE}`;
            bloco.wrapText(bloco.content, bloco.x + PADDING, bloco.y + PADDING + titleSize + 28,
                bloco.width - 2 * PADDING, fontSize + 6);
        }

        desenharBotaoFechar(bloco);
        desenharAlcaResize(bloco, dark);
    });
}

/* Botao circular de fechar com um "x" */
function desenharBotaoFechar(bloco) {
    const c = bloco.centroFechar();

    ctx.beginPath();
    ctx.arc(c.x, c.y, RAIO_FECHAR, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(c.x - 3.4, c.y - 3.4);
    ctx.lineTo(c.x + 3.4, c.y + 3.4);
    ctx.moveTo(c.x + 3.4, c.y - 3.4);
    ctx.lineTo(c.x - 3.4, c.y + 3.4);
    ctx.stroke();
}

/* Alca discreta de redimensionar (duas linhas no canto) */
function desenharAlcaResize(bloco, dark) {
    const hx = bloco.x + bloco.width;
    const hy = bloco.y + bloco.height;

    ctx.strokeStyle = dark ? "rgba(255,255,255,0.40)" : "rgba(44,42,59,0.32)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(hx - 6, hy - 13);
    ctx.lineTo(hx - 13, hy - 6);
    ctx.moveTo(hx - 6, hy - 7);
    ctx.lineTo(hx - 7, hy - 6);
    ctx.stroke();
}

/* ==================================================
   INTERAÇÃO (arrastar / redimensionar / fechar)

   Usamos Pointer Events e captura do ponteiro: depois do
   pointerdown, todos os movimentos vao para o canvas mesmo
   que o cursor saia da area — o arrasto nunca mais "trava".
   ================================================== */

// interacao em andamento; null quando ocioso
let interacao = null; // { bloco, modo, offsetX, offsetY, pointerId }

canvas.addEventListener("pointerdown", (e) => {
    const pos = getPointerPos(e);
    const alvo = blocoNoPonto(pos.x, pos.y);
    if (!alvo) return;

    // fechar remove o bloco
    if (alvo.zona === "fechar") {
        blocos.splice(alvo.indice, 1);
        saveBloco();
        render();
        return;
    }

    // traz o bloco clicado para a frente
    blocos.splice(alvo.indice, 1);
    blocos.push(alvo.bloco);

    if (alvo.zona === "redimensionar") {
        interacao = { bloco: alvo.bloco, modo: "redimensionar", pointerId: e.pointerId };
        canvas.style.cursor = "nwse-resize";
    } else {
        interacao = {
            bloco: alvo.bloco,
            modo: "arrastar",
            offsetX: pos.x - alvo.bloco.x,
            offsetY: pos.y - alvo.bloco.y,
            pointerId: e.pointerId,
        };
        canvas.style.cursor = "grabbing";
    }

    // captura o ponteiro: o arrasto segue firme mesmo fora do canvas
    canvas.setPointerCapture(e.pointerId);
    render();
});

canvas.addEventListener("pointermove", (e) => {
    const pos = getPointerPos(e);

    // 1) interacao ativa
    if (interacao) {
        const b = interacao.bloco;

        if (interacao.modo === "redimensionar") {
            b.width = Math.max(LARGURA_MIN, Math.min(pos.x - b.x, larguraTela - b.x));
            b.height = Math.max(ALTURA_MIN, Math.min(pos.y - b.y, alturaTela - b.y));
        } else {
            b.x = Math.max(0, Math.min(pos.x - interacao.offsetX, larguraTela - b.width));
            b.y = Math.max(0, Math.min(pos.y - interacao.offsetY, alturaTela - b.height));
        }
        render();
        return;
    }

    // 2) ocioso: cursor conforme a zona sob o ponteiro
    const alvo = blocoNoPonto(pos.x, pos.y);
    if (!alvo) {
        canvas.style.cursor = "default";
    } else if (alvo.zona === "fechar") {
        canvas.style.cursor = "pointer";
    } else if (alvo.zona === "redimensionar") {
        canvas.style.cursor = "nwse-resize";
    } else {
        canvas.style.cursor = "grab";
    }
});

function encerrarInteracao(e) {
    if (interacao) {
        saveBloco();
        if (e && canvas.hasPointerCapture(interacao.pointerId)) {
            canvas.releasePointerCapture(interacao.pointerId);
        }
        interacao = null;
    }
    canvas.style.cursor = "default";
}

canvas.addEventListener("pointerup", encerrarInteracao);
canvas.addEventListener("pointercancel", encerrarInteracao);

/* ==================================================
   AUXILIARES E INICIALIZAÇÃO
   ================================================== */

/** Cria um novo bloco de texto numa posicao aleatoria */
window.addNewBloco = function (title, content, color) {
    const x = Math.random() * Math.max(10, larguraTela - 240) + 10;
    const y = Math.random() * Math.max(10, alturaTela - 180) + 10;
    blocos.push(new Bloco(x, y, title, content, color));
    saveBloco();
    render();
};

/* Sincroniza blocos criados em outra aba (storage event) */
window.addEventListener("storage", (e) => {
    if (e.key === "newBloco" && e.newValue) {
        try {
            const d = JSON.parse(e.newValue);
            blocos.push(new Bloco(d.x, d.y, d.title, d.content, d.color));
            saveBloco();
            render();
            localStorage.removeItem("newBloco");
        } catch (err) {
            console.error("Erro ao sincronizar bloco:", err);
        }
    }
});

loadBloco();
ajustarCanvas();
render();

// redesenha quando a fonte Poppins terminar de carregar (evita texto torto)
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(render);
}

console.log("Feli's Box carregado —", blocos.length, "bloco(s).");
