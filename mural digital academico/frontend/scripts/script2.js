/* SCRIPT DA PÁGINA DE CRIAÇÃO */

const tituloInput = document.getElementById('titulo');
const conteudoInput = document.getElementById('conteudo');
const tituloContador = document.getElementById('contador_titulo');
const conteudoContador = document.getElementById('contador_conteudo');

const preview = document.getElementById('preview');
const form = document.getElementById('bloco_criacao');

/* EVENT LISTENERS (CONTADORES DE CARACTERES)*/
        

    /*ATUALIZA O CONTADOR 
    DO TITULO NA PREVIEW */
    tituloInput.addEventListener('input', () => {
        tituloContador.textContent = `${tituloInput.value.length}/30`;
        updatePreview();
    });

    /*ATUALIZA O CONTADOR 
    DO CONTEUDO NA PREVIEW */
    conteudoInput.addEventListener('input', () => {
        conteudoContador.textContent = `${tituloInput.value.length}/200`;
        updatePreview();
    });

    /*ATUALIZA A COR DO 
    BLOCO NA PREVIEW */
    document.querySelector('input[name="cor"]').forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });

/* FUNÇÃO QUE ATUALIZA A PREVIEW*/

function updatePreview() {

    /* VALORES DOS CAMPOS */
    const titulo = tituloInput.value || 'Título do Bloco...';
    const conteudo = conteudoInput.value || 'Contéudo do Bloco...';
    const cor = document.querySelector('input[name="cor"]:checked').value;

    /* ATUALIZA A PREVIEW */
    preview.querySelector('.preview_titulo').textContent = titulo;
    preview.querySelector('.preview_conteudo').textContent = conteudo;
    preview.style.backgroundColor = cor;
}

updatePreview();

