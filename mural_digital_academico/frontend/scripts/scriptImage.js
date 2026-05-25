/* ==================================================
   UPLOAD DE IMAGEM PARA O MURAL
   Le um arquivo escolhido na sidebar, valida o formato
   (apenas imagens) e o tamanho, redimensiona para um
   tamanho convencional mantendo a proporcao e adiciona
   como um bloco no mural (persistido via saveBloco()).
   ================================================== */

/* ----- Limites ----- */
const TAMANHO_MAXIMO_MB = 8;                                  // tamanho maximo do arquivo
const TAMANHO_MAXIMO_BYTES = TAMANHO_MAXIMO_MB * 1024 * 1024;
const DIMENSAO_MAXIMA = 400;                                  // maior lado da imagem no mural (px)

document.addEventListener("change", (e) => {
    const input = e.target;

    // so reage ao input de arquivo da sidebar (classe "file")
    if (!input || input.type !== "file" || !input.classList.contains("file")) return;

    const arquivo = input.files && input.files[0];
    if (!arquivo) return;

    // 1) valida o formato — apenas imagens
    if (!arquivo.type.startsWith("image/")) {
        alert("Formato inválido! Selecione um arquivo de imagem (PNG, JPG, GIF, etc).");
        input.value = "";
        return;
    }

    // 2) valida o tamanho do arquivo
    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
        alert(`Imagem muito grande! O tamanho máximo é ${TAMANHO_MAXIMO_MB} MB.`);
        input.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
            // redimensiona mantendo a proporcao e regrava ja reduzida
            const base64Reduzido = redimensionarImagem(img, arquivo.type);
            const { width, height } = calcularDimensoes(img.naturalWidth, img.naturalHeight);

            // posicao variada para as imagens nao empilharem exatamente
            const { x, y } = posicaoInicial(width, height);
            blocos.push(new ImagemBloco(x, y, base64Reduzido, width, height));
            saveBloco();
            render();
        };

        img.onerror = () => alert("Não foi possível carregar a imagem.");
        img.src = event.target.result;

        input.value = ""; // permite reenviar o mesmo arquivo depois
    };

    reader.onerror = () => alert("Erro ao ler o arquivo.");
    reader.readAsDataURL(arquivo);
});

/* Sorteia uma posicao inicial dentro da area visivel do canvas,
   deixando uma margem para o bloco nao nascer colado na borda */
function posicaoInicial(largura, altura) {
    const tela = document.getElementById("tela");
    const limiteX = Math.max(10, (tela ? tela.clientWidth : 800) - largura - 10);
    const limiteY = Math.max(10, (tela ? tela.clientHeight : 600) - altura - 10);
    return {
        x: 10 + Math.random() * (limiteX - 10),
        y: 10 + Math.random() * (limiteY - 10),
    };
}

/* Calcula dimensoes que cabem em DIMENSAO_MAXIMA mantendo a proporcao */
function calcularDimensoes(largura, altura) {
    if (largura <= DIMENSAO_MAXIMA && altura <= DIMENSAO_MAXIMA) {
        return { width: largura, height: altura };
    }

    const escala = Math.min(DIMENSAO_MAXIMA / largura, DIMENSAO_MAXIMA / altura);
    return {
        width: Math.round(largura * escala),
        height: Math.round(altura * escala),
    };
}

/* Desenha a imagem reduzida num canvas auxiliar e devolve o base64 leve.
   Mantem transparencia para PNG; usa JPEG (mais leve) para os demais. */
function redimensionarImagem(img, tipoOriginal) {
    const { width, height } = calcularDimensoes(img.naturalWidth, img.naturalHeight);

    const canvasTmp = document.createElement("canvas");
    canvasTmp.width = width;
    canvasTmp.height = height;
    canvasTmp.getContext("2d").drawImage(img, 0, 0, width, height);

    const formato = tipoOriginal === "image/png" ? "image/png" : "image/jpeg";
    return canvasTmp.toDataURL(formato, 0.85);
}
