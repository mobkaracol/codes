// SCRIPT DA PÁGINA DE CRIAÇÃO (externalizado)

// ============================================
// REFERÊNCIAS DOS ELEMENTOS DO FORMULÁRIO
// ============================================
const tituloInput = document.getElementById('titulo');
const conteudoInput = document.getElementById('conteudo');
const tituloCounter = document.getElementById('tituloCounter');
const conteudoCounter = document.getElementById('conteudoCounter');
const preview = document.getElementById('preview');
const form = document.getElementById('postForm');

// ============================================
// EVENT LISTENERS - CONTADORES DE CARACTERES
// ============================================

// Atualiza contador do título e preview ao digitar
tituloInput.addEventListener('input', () => {
    tituloCounter.textContent = `${tituloInput.value.length}/30`;
    updatePreview();
});

// Atualiza contador do conteúdo e preview ao digitar
conteudoInput.addEventListener('input', () => {
    conteudoCounter.textContent = `${conteudoInput.value.length}/200`;
    updatePreview();
});

// Atualiza preview ao mudar a cor selecionada
document.querySelectorAll('input[name="cor"]').forEach(radio => {
    radio.addEventListener('change', updatePreview);
});

// ============================================
// FUNÇÃO: ATUALIZAR PREVIEW EM TEMPO REAL
// ============================================
function updatePreview() {
    // Pega valores dos campos (ou usa textos padrão)
    const titulo = tituloInput.value || 'Título do Post';
    const conteudo = conteudoInput.value || 'Digite o conteúdo para visualizar...';
    const cor = document.querySelector('input[name="cor"]:checked').value;

    // Atualiza o preview visual
    preview.style.backgroundColor = cor;
    preview.querySelector('.preview-title').textContent = titulo;
    preview.querySelector('.preview-content').textContent = conteudo;
}

// ============================================
// SUBMISSÃO DO FORMULÁRIO (evita 404)
// ============================================
// Intercepta o submit para não fazer GET com querystring (que causava 404)
form.addEventListener('submit', (e) => {
    e.preventDefault(); // evita navegação padrão

    // Coleta e valida
    const titulo = tituloInput.value.trim();
    const conteudo = conteudoInput.value.trim();
    const cor = document.querySelector('input[name="cor"]:checked').value;

    if (!titulo || !conteudo) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Monta o objeto do post
    const newPost = {
        title: titulo,
        content: conteudo,
        color: cor,
        // posição inicial no canvas
        x: Math.random() * 800 + 50,
        y: Math.random() * 300 + 50
    };

    // Persiste no localStorage
    const posts = JSON.parse(localStorage.getItem('muralPosts') || '[]');
    posts.push(newPost);
    localStorage.setItem('muralPosts', JSON.stringify(posts));

    // Feedback visual
    showSuccessMessage();

    // Redireciona para o mural (sem querystring)
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
});

// ============================================
// FUNÇÃO: MENSAGEM DE SUCESSO ANIMADA
// ============================================
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = '✓ Post criado com sucesso!';
    document.body.appendChild(message);

    setTimeout(() => message.classList.add('show'), 10);
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 1000);
}

// Inicializa a preview com valores padrão
updatePreview();

/*
================================================================================
EXPLICAÇÃO DO PROBLEMA DO 404 E DA SOLUÇÃO APLICADA (LINGUAGEM SIMPLES)
================================================================================

1) O QUE ACONTECIA (o erro 404)
--------------------------------
- Quando você clicava no botão "Criar Post", o formulário enviava os dados do
    jeito padrão do navegador.
- O comportamento padrão é fazer um GET na mesma página (criacao.html), só que
    com os dados adicionados na URL como "query string". Exemplo:

        http://localhost:3000/criacao.html?titulo=Teste&conteudo=Algum+texto...

- O nosso servidor é bem simples: ele tenta abrir exatamente o arquivo pedido
    pela URL. Como a URL agora tinha "?alguma_coisa" no final, o servidor tentava
    encontrar um arquivo literalmente chamado:

        criacao.html?titulo=Teste&conteudo=...

- Esse arquivo não existe no disco, então o servidor devolvia 404 (Página não
    encontrada).

2) EXEMPLO RÁPIDO DO ERRO
-------------------------
- Clicar em "Criar Post" com o formulário padrão causava uma requisição assim:

        GET /criacao.html?titulo=Meu+post&conteudo=Texto... HTTP/1.1

- Servidor tentava mapear isso para um caminho de arquivo dentro de "frontend",
    o que falhava, pois não existe arquivo com "?" no nome.

3) COMO RESOLVEMOS (o que o código faz agora)
---------------------------------------------
- Interceptamos o envio do formulário via JavaScript usando:

        form.addEventListener('submit', (e) => { e.preventDefault(); ... })

- Esse e.preventDefault() cancela o comportamento padrão (a navegação GET com
    query string), então a página não tenta carregar um arquivo inexistente.

- A partir daí, fazemos tudo no lado do cliente (no navegador):
    a) Lemos os valores dos campos (título, conteúdo, cor).
    b) Validamos se estão preenchidos.
    c) Criamos um objeto do post e salvamos em localStorage (chave: 'muralPosts').
    d) Mostramos uma mensagenzinha de sucesso (opcional, só visual).
    e) Redirecionamos manualmente para index.html:

             window.location.href = 'index.html';

- Essa navegação não tem query string, então o servidor simplesmente entrega o
    arquivo index.html normalmente. Ao abrir, o mural lê o localStorage e mostra
    o novo post.

4) POR QUE ESSA É UMA BOA SOLUÇÃO AQUI
--------------------------------------
- Não precisamos mudar o servidor simples que só serve arquivos estáticos.
- A UX fica melhor: salvamos e redirecionamos com controle total no cliente.
- Mantemos a responsabilidade de "criar post" no front, usando localStorage,
    que já era a proposta do projeto nesta etapa (sem backend/BD real).

5) OUTRAS FORMAS (caso um dia queira)
-------------------------------------
- Poderia colocar method="post" e um backend de responsa para receber os dados.
- Poderia alterar o servidor para ignorar a parte da query string ao mapear o
    caminho (parsear req.url), mas isso adiciona complexidade no servidor.
- Poderia também usar action="#" no form e tratar tudo via JS (similar ao que
    já fazemos com e.preventDefault()).

Resumo em 1 linha:
"O 404 acontecia porque o formulário adicionava ?dados na URL e o servidor
    tentava abrir um arquivo com esse sufixo; cancelamos o submit padrão, salvamos
    no localStorage e redirecionamos manualmente sem query string."
================================================================================
*/