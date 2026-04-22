/* ==================
SCRIPT DA PÁGINA DE CRIAÇÃO DE BLOCOS
================== */

let tituloInput = document.getElementById('titulo');
let conteudoInput = document.getElementById('conteudo');
let tituloCounter = document.getElementById('contador_titulo');
let conteudoCounter = document.getElementById('contador_conteudo');

let preview = document.getElementById('preview');
let form = document.getElementById('bloco_criacao');

/* ================== 
EVENT LISTENERS 
(CONTADORES DE CARACTERES)
================== */
        

    /*ATUALIZA O CONTADOR DO TITULO NA PREVIEW */
    tituloInput.addEventListener('input', () => {
        tituloCounter.textContent = `${tituloInput.value.length}/50`;
        updatePreview();
    });

    /*ATUALIZA O CONTADOR DO CONTEUDO NA PREVIEW */
    conteudoInput.addEventListener('input', () => {
        conteudoCounter.textContent = `${conteudoInput.value.length}/200`;
        updatePreview();
    });

    /*ATUALIZA A COR DO BLOCO NA PREVIEW */
    document.querySelectorAll('input[name="cor"]').forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });


/* ==================
FUNÇÃO QUE ATUALIZA A PREVIEW
================== */

function updatePreview() {

    /* VALORES DOS CAMPOS */
    let titulo = tituloInput.value.trim() || 'Título do Bloco...';
    let conteudo = conteudoInput.value.trim() || 'Contéudo do Bloco...';
    let cor = document.querySelector('input[name="cor"]:checked').value;

    /* ATUALIZA A PREVIEW */
    preview.querySelector('.preview_titulo').textContent = titulo;
    preview.querySelector('.preview_conteudo').textContent = conteudo;
    preview.style.backgroundColor = cor;
}

/* SUBMISSÃO DO FORMULARIO 
(evita o error 404) */

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titulo = tituloInput.value.trim();
    const conteudo = conteudoInput.value.trim();
    const cor = document.querySelector('input[name="cor"]:checked').value;

    if (!titulo || !conteudo) {
        alert('Preencha todos os campos!');
        return;
    }

    const newBloco = {
        title: titulo,
        content: conteudo,
        color: cor,
        font: "18px TimesNewRoman",

        x: Math.random() * 800 + 50,
        y: Math.random() * 500 + 50
    };

    const blocos = JSON.parse(localStorage.getItem('muralBloco') || '[]');
    blocos.push(newBloco);
    localStorage.setItem('muralBloco', JSON.stringify(blocos));

    showSucessMessage();

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
});

    /* MENSAGEM DE SUCESSO */

function showSucessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = 'Bloco criado com sucesso!';
    document.body.appendChild(message);

    setTimeout(() => message.classList.add('show'), 10);
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 2000);
    
}

updatePreview();