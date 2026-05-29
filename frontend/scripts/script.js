/* SCRIPT PRINCIPAL
CONFIGURAÇÃo DO CANVAS */

const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");

function ajustarCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

ajustarCanvas();
window.addEventListener("resize", () => {
    ajustarCanvas();
    render();
});

let blocos = [];

/* CONSTANTES DE LAYOUT DOS CARDS */
const RAIO_CARD     = 12;   // raio dos cantos arredondados
const ALCA_RESIZE   = 16;   // tamanho da alça de redimensionar (canto inferior-direito)
const RAIO_FECHAR   = 9;    // raio do botão de fechar
const MIN_TEXTO_W   = 150, MIN_TEXTO_H = 100;  // tamanho mínimo de um card de texto
const MIN_IMG_W     = 80,  MIN_IMG_H   = 60;   // tamanho mínimo de um card de imagem
const MAX_IMG_LADO  = 320;  // maior lado de uma imagem recém adicionada

/* CACHE DE IMAGENS
mantém cada imagem carregada uma única vez */

const imageCache = {};

function getImage(src) {
    if (!imageCache[src]) {
        const img = new Image();
        img.onload = () => {
            ajustarBlocosDaImagem(src, img); // dimensiona os cards no tamanho real da imagem
            render();
        };
        img.onerror = () => { img.failed = true; render(); };
        img.src = src;
        imageCache[src] = img;
    }
    return imageCache[src];
}

/* Ajusta o tamanho dos cards de imagem que ainda não foram dimensionados,
   usando a proporção real da imagem (limitada a MAX_IMG_LADO). */
function ajustarBlocosDaImagem(src, img) {
    let mudou = false;

    blocos.forEach(b => {
        if (b.imageSrc === src && b.autoTamanho && img.naturalWidth) {
            const escala = Math.min(1, MAX_IMG_LADO / Math.max(img.naturalWidth, img.naturalHeight));
            b.width  = Math.max(MIN_IMG_W, Math.round(img.naturalWidth  * escala));
            b.height = Math.max(MIN_IMG_H, Math.round(img.naturalHeight * escala));
            b.autoTamanho = false;

            // mantém o card dentro do canvas
            b.x = Math.max(0, Math.min(b.x, canvas.width  - b.width));
            b.y = Math.max(0, Math.min(b.y, canvas.height - b.height));

            mudou = true;
        }
    });

    if (mudou) saveBloco();
}

/* CLASSE BLOCO
blocos que serão colocados no mural */

class Bloco {
        /**
        * @param {number} x
        * @param {number} y
        * @param {string} title
        * @param {string} content
        * @param {string} color
        * @param {string} font
        * @param {string|null} imageSrc  caminho da imagem (quando o bloco é uma imagem)
    */
    constructor(x, y, title, content, color, font = "18px TimesNewRoman", imageSrc = null) {
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 150;
        this.title = title;
        this.content = content;
        this.color = color;
        this.font = font;
        this.imageSrc = imageSrc;
        this.autoTamanho = false; // true => ainda será dimensionado pela imagem

        //propriedades de arrastar
        this.isDragging = false;
        this.resizing = false;
        this.offsetX = 0;
        this.offsetY = 0;

    }

    /** @returns {boolean} este card é uma imagem? */
    isImagem() {
        return !!this.imageSrc;
    }

        /**
        * @param {string} text
        * @param {number} x
        * @param {number} y
        * @param {number} maxWidth
        * @param {number} lineHeight
        */

    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = "";
        let currentY = y;
        const maxLines = Math.max(1, Math.floor((this.height - 40) / lineHeight));
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + " ";
                currentY += lineHeight;
                lineCount++;

                if (lineCount >= maxLines) {
                    ctx.fillText('...', x, currentY);
                    return;
                }
            } else {
                line = testLine;
            }
        }

        ctx.fillText(line, x, currentY);

    }
        /**
        * Está dentro do corpo do card? (clique para arrastar/selecionar)
        * @param {number} x
        * @param {number} y
        * @returns {boolean}
        */

    contains(x, y) {
        return(
        x >= this.x &&
        x <= this.x + this.width &&
        y >= this.y &&
        y <= this.y + this.height);

    }
        /**
        * Clique no botão de fechar (círculo no canto superior-direito).
        * @param {number} x
        * @param {number} y
        * @returns {boolean}
        */
    isCloseButton(x, y) {
        const closeX = this.x + this.width - 15;
        const closeY = this.y + 15;

        const distance = Math.sqrt((x - closeX) ** 2 + (y - closeY) ** 2);
        return distance <= RAIO_FECHAR + 2;
    }

    /**
     * Clique na alça de redimensionar — uma caixa PEQUENA e DELIMITADA
     * no canto inferior-direito (antes era um semiplano infinito, o que
     * fazia qualquer clique embaixo/à direita "agarrar" o card).
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isResizeHandle(x, y) {
        return (
            x >= this.x + this.width  - ALCA_RESIZE &&
            x <= this.x + this.width &&
            y >= this.y + this.height - ALCA_RESIZE &&
            y <= this.y + this.height
        );
    }

}

function getFontSize(bloco) {
    const baseWidth = 200; //tamanho padrão do bloco
    const scaleFactor = bloco.width / baseWidth;

    let size = 18 * scaleFactor;

    size = Math.max(10, size);
    size = Math.min(25, size);

    return size;
}

/* DESENHO AUXILIAR */

/* desenha o caminho de um retângulo com cantos arredondados */
function caminhoArredondado(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

/* desenha a imagem inteira dentro do card preservando a proporção
   (estilo object-fit: contain), recortada nos cantos arredondados.
   Como o card já nasce com a proporção da imagem, normalmente ela
   preenche tudo; ao redimensionar para outra proporção, sobra uma
   borda branca em vez de cortar a imagem. */
function desenharImagemContain(img, x, y, w, h, r) {
    const proporcaoImg   = img.naturalWidth / img.naturalHeight;
    const proporcaoBloco = w / h;
    let dw, dh;

    if (proporcaoImg > proporcaoBloco) {
        dw = w;
        dh = w / proporcaoImg;
    } else {
        dh = h;
        dw = h * proporcaoImg;
    }

    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;

    ctx.save();
    caminhoArredondado(x, y, w, h, r);
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
}

/* botão de fechar (comum a cards de texto e de imagem) */
function desenharBotaoFechar(bloco) {
    ctx.beginPath();
    ctx.arc(bloco.x + bloco.width - 15, bloco.y + 15, RAIO_FECHAR, 0, Math.PI * 2);
    ctx.fillStyle = "#eb686f";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("×", bloco.x + bloco.width - 15, bloco.y + 15);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
}

/* alça de redimensionar — marca visual discreta no canto inferior-direito */
function desenharAlcaResize(bloco) {
    const x2 = bloco.x + bloco.width;
    const y2 = bloco.y + bloco.height;

    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x2 - 4,  y2 - 11); ctx.lineTo(x2 - 11, y2 - 4);
    ctx.moveTo(x2 - 4,  y2 - 6);  ctx.lineTo(x2 - 6,  y2 - 4);
    ctx.stroke();
}

/* GERENCIAMENTO DE BLOCOS */

function loadBloco() {
    const savedBloco = localStorage.getItem('muralBloco');
    const bemVindoCriado = localStorage.getItem('mural_bemVindoCriado');

    if (savedBloco) {
        try {
            const blocoData = JSON.parse(savedBloco);
            blocos = blocoData.map(p => {
                const b = new Bloco(p.x, p.y, p.title, p.content, p.color, p.font, p.imageSrc || null);
                // restaura o tamanho salvo (corrige cards perdendo dimensão ao recarregar)
                if (p.width)  b.width  = p.width;
                if (p.height) b.height = p.height;
                b.autoTamanho = p.autoTamanho ?? false;
                return b;
            });
        } catch (e) {
            console.log("Erro ao carregar blocos:", e);
            blocos = [];
        }
    }

    if (!bemVindoCriado) {
        blocos.push(
            new Bloco (50, 50,
            "Bem-Vindo!", "Este é o Feli's Box, crie seu primeiro bloco!",
            "#ffe4b5",
        ));

        saveBloco();
        localStorage.setItem('mural_bemVindoCriado', 'true');

        }
    }


function saveBloco() {
    const blocoData = blocos.map(p => ({
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        title: p.title,
        content: p.content,
        color: p.color,
        font: p.font,
        imageSrc: p.imageSrc,
        autoTamanho: p.autoTamanho
    }));

    localStorage.setItem('muralBloco', JSON.stringify(blocoData));
}

/* UTILIDADES */

/**
 * Posição do mouse em coordenadas do canvas, corrigindo qualquer
 * diferença entre o tamanho em pixels do canvas e o tamanho exibido (CSS).
 * Isso evita o "descasamento" entre onde se clica e onde o card está.
 * @param {MouseEvent} e
 * @returns {{x:number, y:number}}
*/

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top)  * scaleY
    };
}

    /* RENDERIZAÇÃO GERAL */

function render() {

    // limpa deixando o fundo do canvas (definido no CSS) aparecer — acompanha o tema
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (blocos.length === 0) {
        ctx.fillStyle = "#95a5a6";
        ctx.font = "18px TimesNewRoman";
        ctx.textAlign = "center";
        ctx.fillText("Nenhum bloco criado ainda... Crie seu primeiro bloco!",
        canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "left";
        return;
    }

    blocos.forEach(bloco => {

        // sombra suave aplicada ao corpo do card
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.18)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;

        if (bloco.isImagem()) {
            /* ===== CARD DE IMAGEM ===== */
            caminhoArredondado(bloco.x, bloco.y, bloco.width, bloco.height, RAIO_CARD);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.restore(); // remove a sombra antes de desenhar a imagem

            const img = getImage(bloco.imageSrc);
            if (img.complete && img.naturalWidth) {
                desenharImagemContain(img, bloco.x, bloco.y, bloco.width, bloco.height, RAIO_CARD);
            } else {
                ctx.fillStyle = img.failed ? "#c0392b" : "#95a5a6";
                ctx.font = "14px Arial";
                ctx.textAlign = "center";
                ctx.fillText(img.failed ? "imagem não encontrada" : "carregando...",
                    bloco.x + bloco.width / 2, bloco.y + bloco.height / 2);
                ctx.textAlign = "left";
            }

        } else {
            /* ===== CARD DE TEXTO ===== */
            caminhoArredondado(bloco.x, bloco.y, bloco.width, bloco.height, RAIO_CARD);
            ctx.fillStyle = bloco.color;
            ctx.fill();
            ctx.restore(); // remove a sombra antes do texto

            const fontSize = getFontSize(bloco);
            const titleSize = fontSize + 2;

            ctx.fillStyle = "#333";
            ctx.font = `bold ${titleSize}px TimesNewRoman`;
            bloco.wrapText(
                bloco.title,
                bloco.x + 12,
                bloco.y + 26,
                bloco.width - 36,
                titleSize + 2
            );

            // linha divisória sutil abaixo do título (combina com a prévia da criação)
            ctx.strokeStyle = "rgba(0,0,0,0.12)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bloco.x + 12, bloco.y + 34);
            ctx.lineTo(bloco.x + bloco.width - 12, bloco.y + 34);
            ctx.stroke();

            ctx.fillStyle = "#333";
            ctx.font = `${fontSize}px TimesNewRoman`;
            bloco.wrapText(
                bloco.content,
                bloco.x + 12,
                bloco.y + 26 + titleSize + 14,
                bloco.width - 24,
                fontSize + 4
            );
        }

        // controles comuns: botão de fechar + alça de redimensionar
        desenharBotaoFechar(bloco);
        desenharAlcaResize(bloco);
    });

}


    /* EVENT LISTENERS
    (interações com o mouse) */

    canvas.addEventListener('mousedown', (e) => {
        const pos = getMousePos(e);

        /* A ordem importa: do card mais à frente (fim do array) para trás,
           e por prioridade: fechar > redimensionar > arrastar.
           Tudo só acontece se o clique cair DENTRO da região correta. */
        for (let i = blocos.length - 1; i >= 0; i--) {
            const bloco = blocos[i];

            // 1) Fechar
            if (bloco.isCloseButton(pos.x, pos.y)) {
                blocos.splice(i, 1);
                saveBloco();
                render();
                return;
            }

            // 2) Redimensionar (só na alça do canto inferior-direito)
            if (bloco.isResizeHandle(pos.x, pos.y)) {
                bloco.resizing = true;
                // traz para frente
                blocos.splice(i, 1);
                blocos.push(bloco);
                canvas.style.cursor = 'nwse-resize';
                return;
            }

            // 3) Arrastar (clique no corpo do card)
            if (bloco.contains(pos.x, pos.y)) {
                bloco.isDragging = true;
                bloco.offsetX = pos.x - bloco.x;
                bloco.offsetY = pos.y - bloco.y;
                canvas.style.cursor = 'grabbing';
                // traz para frente
                blocos.splice(i, 1);
                blocos.push(bloco);
                return;
            }
        }
    });

        /* MOVIMENTAÇÃO DO MOUSE */

        canvas.addEventListener('mousemove', (e) => {
        const pos = getMousePos(e);

        let interagindo = false;

        blocos.forEach(bloco => {
            if (bloco.resizing) {
                const minW = bloco.isImagem() ? MIN_IMG_W : MIN_TEXTO_W;
                const minH = bloco.isImagem() ? MIN_IMG_H : MIN_TEXTO_H;

                bloco.width  = Math.max(minW, pos.x - bloco.x);
                bloco.height = Math.max(minH, pos.y - bloco.y);

                interagindo = true;
                render();
            }
            else if (bloco.isDragging) {
                bloco.x = pos.x - bloco.offsetX;
                bloco.y = pos.y - bloco.offsetY;

                // limita a posição aos limites do canvas
                bloco.x = Math.max(0, Math.min(bloco.x, canvas.width  - bloco.width));
                bloco.y = Math.max(0, Math.min(bloco.y, canvas.height - bloco.height));

                interagindo = true;
                render();
            }
        });

        /* Atualiza o cursor conforme a região sob o mouse */
        if (!interagindo) {
            let cursor = 'default';
            for (let i = blocos.length - 1; i >= 0; i--) {
                const bloco = blocos[i];
                if (bloco.isCloseButton(pos.x, pos.y)) { cursor = 'pointer'; break; }
                if (bloco.isResizeHandle(pos.x, pos.y)) { cursor = 'nwse-resize'; break; }
                if (bloco.contains(pos.x, pos.y)) { cursor = 'grab'; break; }
            }
            canvas.style.cursor = cursor;
        }

});

    /* MOUSEUP (detectar quando soltar
        o botão do mouse) */

    canvas.addEventListener('mouseup', () => {
        blocos.forEach(bloco => {
            bloco.isDragging = false;
            bloco.resizing = false;
        });

        saveBloco();
        canvas.style.cursor = 'default';
    });

    /* MOUSELEAVE (detectar quando o mouse
        sair da area do canvas) */

    canvas.addEventListener('mouseleave', () => {
        blocos.forEach(bloco => {
            bloco.isDragging = false;
            bloco.resizing = false;
        });

        saveBloco();
        canvas.style.cursor = 'default';
    });

    /* AUXILIARES */

    /**
    * @param {string} title
    * @param {string} content
    * @param {string} color
    */

    window.addNewBloco = function(title, content, color) {
        const x = Math.random() * (canvas.width - 220) + 10;
        const y = Math.random() * (canvas.height - 170) + 10;

        blocos.push(new Bloco(x, y, title, content, color));
        saveBloco();
        render();

    };

    /**
    * Adiciona um card de imagem ao mural. O tamanho real é definido
    * quando a imagem carrega (ver ajustarBlocosDaImagem).
    * @param {string} src caminho da imagem (ex.: ../uploads/arquivo.jpg)
    */
    window.addImageBloco = function(src) {
        const x = Math.random() * (canvas.width - 220) + 10;
        const y = Math.random() * (canvas.height - 170) + 10;

        const bloco = new Bloco(x, y, "", "", "#ffffff", "18px TimesNewRoman", src);
        bloco.autoTamanho = true; // será dimensionado pela imagem
        blocos.push(bloco);

        const img = getImage(src);
        if (img.complete && img.naturalWidth) {
            ajustarBlocosDaImagem(src, img); // imagem já em cache: dimensiona na hora
        }

        saveBloco();
        render();
    };

    /* Se o upload mandou ?img=arquivo, adiciona a imagem ao mural */
    function checarImagemEnviada() {
        const params = new URLSearchParams(window.location.search);
        const img = params.get('img');
        if (img) {
            window.addImageBloco('../uploads/' + img);
            // limpa a URL para a imagem não ser readicionada ao recarregar a página
            history.replaceState(null, '', window.location.pathname);
        }
    }

    /* Listener para Storage Events que sincroniza entre abas,
    atualmente não utilizado */

    window.addEventListener('storage', (e) => {
        if (e.key === 'newBloco') {
            const newBlocoData = JSON.parse(e.value);
            blocos.push(new Bloco(
                newBlocoData.x,
                newBlocoData.y,
                newBlocoData.title,
                newBlocoData.content,
                newBlocoData.color
            ));
            saveBloco();
            render();
            localStorage.removeItem('newBloco');
        }
    });

    /* INICIALIZAÇÃO DO SITE */

    loadBloco();            //carrega os blocos salvos
    checarImagemEnviada();  //adiciona imagem recém enviada, se houver
    render();               //renderiza o mural pela primeira vez

    console.log('FelisBox carregando!');
    console.log(`${blocos.length} Blocos carregados.`);
