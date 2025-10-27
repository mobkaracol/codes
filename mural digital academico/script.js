/*
╔════════════════════════════════════════════════════════════════════════╗
║                   MURAL DIGITAL ACADÊMICO - SCRIPT PRINCIPAL           ║
║                                                                        ║
║  Este arquivo gerencia toda a interatividade do mural digital:        ║
║  - Renderização de posts no canvas HTML5                              ║
║  - Sistema de drag & drop para reorganizar posts                      ║
║  - Adicionar e remover posts                                          ║
║  - Persistência de dados com localStorage                             ║
║  - Detecção de cliques e interações do mouse                          ║
╚════════════════════════════════════════════════════════════════════════╝
*/

// ============================================
// CONFIGURAÇÃO INICIAL DO CANVAS
// ============================================

// Obtém referência do elemento canvas do HTML
const canvas = document.getElementById('tela');
// Contexto 2D para desenhar no canvas
const ctx = canvas.getContext('2d');

// Define dimensões do canvas (deve corresponder ao CSS)
canvas.width = 1100;
canvas.height = 500;

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

// Variáveis para modo de desenho livre (não implementado ainda)
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let drawingMode = false;

// Array que armazena todos os posts do mural
let posts = [];

// ============================================
// CLASSE POST
// ============================================
/**
 * Representa um post individual no mural.
 * Cada post é um retângulo com título, conteúdo, cor e botão de fechar.
 */
class Post {
    /**
     * Construtor do Post
     * @param {number} x - Posição horizontal no canvas
     * @param {number} y - Posição vertical no canvas
     * @param {string} title - Título do post
     * @param {string} content - Conteúdo/texto do post
     * @param {string} color - Cor de fundo em hexadecimal
     */
    constructor(x, y, title, content, color) {
        this.x = x;
        this.y = y;
        this.width = 200;  // Largura fixa do post
        this.height = 150; // Altura fixa do post
        this.title = title;
        this.content = content;
        this.color = color;
        
        // Propriedades para o sistema de arrastar
        this.isDragging = false; // Se está sendo arrastado
        this.offsetX = 0;        // Offset do mouse em relação ao canto do post
        this.offsetY = 0;
    }

    /**
     * Desenha o post no canvas
     * Renderiza: fundo colorido, borda, título, conteúdo e botão de fechar
     */
    draw() {
        // ===== EFEITO DE SOMBRA =====
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // ===== FUNDO COLORIDO DO POST =====
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // ===== RESETAR SOMBRA =====
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // ===== BORDA DO POST =====
        ctx.strokeStyle = '#2460c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // ===== TÍTULO DO POST =====
        ctx.fillStyle = '#1e3a5f';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(this.title, this.x + 10, this.y + 25, this.width - 20);

        // ===== LINHA DIVISÓRIA =====
        ctx.strokeStyle = '#5f92f8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 35);
        ctx.lineTo(this.x + this.width - 10, this.y + 35);
        ctx.stroke();

        // ===== CONTEÚDO DO POST =====
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        // Quebra o texto em múltiplas linhas se necessário
        this.wrapText(this.content, this.x + 10, this.y + 55, this.width - 20, 18);

        // ===== BOTÃO DE FECHAR (X) =====
        // Círculo vermelho
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.x + this.width - 15, this.y + 15, 8, 0, Math.PI * 2);
        ctx.fill();
        // X branco
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('×', this.x + this.width - 19, this.y + 20);
    }

    /**
     * Quebra texto em múltiplas linhas para caber na largura máxima
     * @param {string} text - Texto a ser quebrado
     * @param {number} x - Posição X inicial
     * @param {number} y - Posição Y inicial
     * @param {number} maxWidth - Largura máxima de cada linha
     * @param {number} lineHeight - Altura entre linhas
     */
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        const maxLines = 5; // Máximo de linhas visíveis
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            // Se a linha ultrapassar a largura máxima, quebra
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
                lineCount++;

                // Se atingir o máximo de linhas, adiciona "..."
                if (lineCount >= maxLines) {
                    ctx.fillText('...', x, currentY);
                    return;
                }
            } else {
                line = testLine;
            }
        }
        // Desenha a última linha
        ctx.fillText(line, x, currentY);
    }

    /**
     * Verifica se um ponto (x, y) está dentro do post
     * @param {number} x - Coordenada X do ponto
     * @param {number} y - Coordenada Y do ponto
     * @returns {boolean} True se o ponto está dentro do post
     */
    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    /**
     * Verifica se um ponto (x, y) está sobre o botão de fechar
     * @param {number} x - Coordenada X do ponto
     * @param {number} y - Coordenada Y do ponto
     * @returns {boolean} True se o ponto está sobre o botão X
     */
    isCloseButton(x, y) {
        const closeX = this.x + this.width - 15;
        const closeY = this.y + 15;
        // Calcula distância do ponto ao centro do botão
        const distance = Math.sqrt((x - closeX) ** 2 + (y - closeY) ** 2);
        return distance <= 8; // Raio do botão
    }
}

// ============================================
// GERENCIAMENTO DE POSTS - PERSISTÊNCIA
// ============================================

/**
 * Carrega posts salvos do localStorage
 * Se não houver posts salvos, cria posts de exemplo/boas-vindas
 */
function loadPosts() {
    const savedPosts = localStorage.getItem('muralPosts');
    
    if (savedPosts) {
        // Recupera posts salvos e recria objetos Post
        const postsData = JSON.parse(savedPosts);
        posts = postsData.map(p => new Post(p.x, p.y, p.title, p.content, p.color));
    } else {
        // Posts de exemplo para primeira visita
        posts.push(new Post(50, 50, 'Bem-vindo!', 'Este é o Mural Digital Acadêmico. Clique no ícone do lápis para criar novos posts!', '#ffe4b5'));
        posts.push(new Post(300, 200, 'Dica', 'Você pode arrastar os posts para reorganizá-los no mural.', '#e0f7fa'));
        posts.push(new Post(600, 80, 'Importante', 'Clique no X vermelho para remover um post do mural.', '#ffccbc'));
    }
}

/**
 * Salva todos os posts no localStorage
 * Converte objetos Post em objetos simples (sem métodos)
 */
function savePosts() {
    // Extrai apenas os dados necessários de cada post
    const postsData = posts.map(p => ({
        x: p.x,
        y: p.y,
        title: p.title,
        content: p.content,
        color: p.color
    }));
    // Salva no localStorage como string JSON
    localStorage.setItem('muralPosts', JSON.stringify(postsData));
}

// ============================================
// RENDERIZAÇÃO
// ============================================

/**
 * Renderiza tudo no canvas
 * - Limpa o canvas
 * - Desenha todos os posts
 * - Mostra mensagem se não houver posts
 */
function render() {
    // ===== LIMPAR CANVAS =====
    ctx.fillStyle = 'rgb(240, 242, 247)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ===== DESENHAR TODOS OS POSTS =====
    posts.forEach(post => post.draw());

    // ===== MENSAGEM SE VAZIO =====
    if (posts.length === 0) {
        ctx.fillStyle = '#95a5a6';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nenhum post ainda. Crie seu primeiro post!', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left'; // Restaura alinhamento padrão
    }
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Obtém posição do mouse relativa ao canvas
 * Necessário porque o canvas pode ter offset na página
 * @param {MouseEvent} e - Evento do mouse
 * @returns {Object} Objeto com propriedades x e y
 */
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// ============================================
// EVENT LISTENERS - INTERAÇÃO COM O MOUSE
// ============================================

/**
 * MOUSEDOWN - Detecta cliques no canvas
 * - Verifica se clicou no botão de fechar
 * - Inicia arrastar se clicou em um post
 */
canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);
    
    // ===== VERIFICAR CLIQUE NO BOTÃO DE FECHAR =====
    // Itera de trás para frente (post mais à frente primeiro)
    for (let i = posts.length - 1; i >= 0; i--) {
        if (posts[i].isCloseButton(pos.x, pos.y)) {
            // Remove o post do array
            posts.splice(i, 1);
            // Salva alterações
            savePosts();
            // Re-renderiza
            render();
            return; // Para após remover
        }
    }

    // ===== VERIFICAR CLIQUE PARA ARRASTAR =====
    // Itera de trás para frente (post mais à frente primeiro)
    for (let i = posts.length - 1; i >= 0; i--) {
        if (posts[i].contains(pos.x, pos.y)) {
            // Marca post como sendo arrastado
            posts[i].isDragging = true;
            // Calcula offset do mouse em relação ao canto do post
            posts[i].offsetX = pos.x - posts[i].x;
            posts[i].offsetY = pos.y - posts[i].y;
            // Muda cursor para "grabbing"
            canvas.style.cursor = 'grabbing';
            
            // Move post para o final do array (topo da pilha visual)
            const post = posts.splice(i, 1)[0];
            posts.push(post);
            break; // Para após encontrar o primeiro post
        }
    }
});

/**
 * MOUSEMOVE - Detecta movimento do mouse
 * - Arrasta post se algum estiver sendo arrastado
 * - Atualiza cursor conforme posição
 */
canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(e);
    
    // ===== ARRASTAR POST =====
    let isDragging = false;
    posts.forEach(post => {
        if (post.isDragging) {
            // Atualiza posição do post
            post.x = pos.x - post.offsetX;
            post.y = pos.y - post.offsetY;
            
            // Limita posição aos limites do canvas
            post.x = Math.max(0, Math.min(post.x, canvas.width - post.width));
            post.y = Math.max(0, Math.min(post.y, canvas.height - post.height));
            
            isDragging = true;
            render(); // Re-renderiza a cada movimento
        }
    });

    // ===== ATUALIZAR CURSOR =====
    if (!isDragging) {
        let overPost = false;
        // Verifica se o mouse está sobre algum post
        for (let i = posts.length - 1; i >= 0; i--) {
            if (posts[i].contains(pos.x, pos.y) || posts[i].isCloseButton(pos.x, pos.y)) {
                canvas.style.cursor = 'pointer';
                overPost = true;
                break;
            }
        }
        // Se não está sobre nenhum post, cursor padrão
        if (!overPost) {
            canvas.style.cursor = 'default';
        }
    }
});

/**
 * MOUSEUP - Detecta soltar botão do mouse
 * - Finaliza arrasto de post e salva nova posição
 */
/**
 * MOUSEUP - Detecta soltar botão do mouse
 * - Finaliza arrasto de post e salva nova posição
 */
canvas.addEventListener('mouseup', () => {
    posts.forEach(post => {
        if (post.isDragging) {
            post.isDragging = false;
            savePosts(); // Salva nova posição
        }
    });
    canvas.style.cursor = 'default';
});

/**
 * MOUSELEAVE - Detecta mouse saindo do canvas
 * - Finaliza arrasto se o mouse sair do canvas
 */
canvas.addEventListener('mouseleave', () => {
    posts.forEach(post => {
        if (post.isDragging) {
            post.isDragging = false;
            savePosts();
        }
    });
    canvas.style.cursor = 'default';
});

// ============================================
// FUNÇÕES AUXILIARES (não utilizadas atualmente)
// ============================================

/**
 * Função global para adicionar novo post (pode ser chamada de outras páginas)
 * @param {string} title - Título do post
 * @param {string} content - Conteúdo do post
 * @param {string} color - Cor de fundo
 */
window.addNewPost = function(title, content, color) {
    // Calcula posição aleatória no canvas
    const x = Math.random() * (canvas.width - 220) + 10;
    const y = Math.random() * (canvas.height - 170) + 10;
    posts.push(new Post(x, y, title, content, color));
    savePosts();
    render();
};

/**
 * Listener para Storage Events (sincronização entre abas)
 * Detecta quando um novo post é criado em outra aba
 * NOTA: Atualmente não utilizado, pois usamos apenas localStorage direto
 */
window.addEventListener('storage', (e) => {
    if (e.key === 'newPost') {
        const newPostData = JSON.parse(e.newValue);
        posts.push(new Post(
            newPostData.x,
            newPostData.y,
            newPostData.title,
            newPostData.content,
            newPostData.color
        ));
        savePosts();
        render();
        localStorage.removeItem('newPost');
    }
});

// ============================================
// INICIALIZAÇÃO DO APLICATIVO
// ============================================

// Carrega posts salvos (ou cria posts de exemplo)
loadPosts();
// Renderiza o mural pela primeira vez
render();

// Mensagens de debug no console
console.log('🎨 Mural Digital Acadêmico carregado!');
console.log(`📌 ${posts.length} posts carregados.`);
