/*
╔════════════════════════════════════════════════════════════════════════╗
║          SERVIDOR HTTP PARA MURAL DIGITAL ACADÊMICO                    ║
║                                                                        ║
║  Servidor Node.js simples para servir arquivos estáticos do projeto.   ║
║  Funciona como um servidor web local para desenvolvimento.             ║
║                                                                        ║
║  Como usar:                                                            ║
║  1. Certifique-se de ter Node.js instalado                             ║
║  2. Execute: node server.js                                            ║
║  3. Acesse: http://localhost:3000                                      ║
╚════════════════════════════════════════════════════════════════════════╝
*/

// ============================================
// IMPORTAÇÃO DE MÓDULOS
// ============================================
const http = require('http');   // Módulo HTTP do Node.js
const fs = require('fs');        // File System para ler arquivos
const path = require('path');    // Path para manipular caminhos

// ============================================
// CONFIGURAÇÕES DO SERVIDOR
// ============================================
const PORT = 3000;              // Porta onde o servidor vai rodar
const HOST = 'localhost';        // Host (127.0.0.1)

// ============================================
// TIPOS MIME (Content-Type)
// ============================================
/**
 * Mapeia extensões de arquivos para seus tipos MIME corretos.
 * Necessário para que o navegador interprete os arquivos adequadamente.
 */
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// ============================================
// CRIAÇÃO DO SERVIDOR HTTP
// ============================================
/**
 * Cria servidor que processa cada requisição HTTP:
 * - Determina qual arquivo servir baseado na URL
 * - Lê o arquivo do sistema
 * - Envia o conteúdo com o Content-Type correto
 * - Trata erros 404 (não encontrado) e 500 (erro do servidor)
 */
const server = http.createServer((req, res) => {
    // Log da requisição no console
    console.log(`${req.method} ${req.url}`);

    // ===== NORMALIZAR A URL =====
    // Remove a query string (?a=b) e decodifica caracteres especiais (%20 etc.)
    let urlPath = decodeURIComponent(req.url.split('?')[0]);

    // ===== DETERMINAR DIRETÓRIO BASE E ARQUIVO =====
    // A pasta "images" fica fora de /frontend, então tem sua própria base;
    // todo o resto é servido a partir de /frontend.
    let baseDir;
    let filePath;
    if (urlPath === '/' || urlPath === '') {
        baseDir = path.resolve('./frontend');
        filePath = path.join(baseDir, 'index.html');
    } else if (urlPath.startsWith('/images/')) {
        baseDir = path.resolve('./images');
        filePath = path.join(baseDir, urlPath.replace('/images/', ''));
    } else {
        baseDir = path.resolve('./frontend');
        filePath = path.join(baseDir, urlPath);
    }

    // ===== PROTEÇÃO CONTRA PATH TRAVERSAL =====
    // Garante que o caminho resolvido permaneça dentro do diretório base
    // (impede acessar, por ex., backend/users.json via "/../backend/...").
    const resolved = path.resolve(filePath);
    if (resolved !== baseDir && !resolved.startsWith(baseDir + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>403 - Acesso negado</h1>', 'utf-8');
        return;
    }

    // ===== OBTER TIPO MIME DO ARQUIVO =====
    const extname = String(path.extname(filePath)).toLowerCase();
    let contentType = mimeTypes[extname] || 'application/octet-stream';
    // Acentos só aparecem corretos se o charset for declarado nos arquivos de texto
    if (/^(text\/|application\/(json|javascript))/.test(contentType)) {
        contentType += '; charset=utf-8';
    }

    // ===== LER E SERVIR O ARQUIVO =====
    fs.readFile(filePath, (error, content) => {
        if (error) {
            // ===== TRATAMENTO DE ERROS =====
            if (error.code === 'ENOENT' || error.code === 'EISDIR') {
                // Arquivo não encontrado (404)
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - Página não encontrada</h1>', 'utf-8');
            } else {
                // Erro no servidor (500)
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`Erro no servidor: ${error.code}`, 'utf-8');
            }
        } else {
            // ===== SUCESSO - ENVIAR ARQUIVO =====
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================
/**
 * Inicia o servidor e exibe informações no console
 */
server.listen(PORT, HOST, () => {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Mural Digital Acadêmico - Servidor      ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  🌐 Servidor rodando em:                  ║`);
    console.log(`║     http://${HOST}:${PORT}              ║`);
    console.log('║                                            ║');
    console.log('║  📝 Pressione Ctrl+C para parar           ║');
    console.log('╚════════════════════════════════════════════╝');
});

// ============================================
// TRATAMENTO DE ENCERRAMENTO
// ============================================
/**
 * Captura o sinal SIGINT (Ctrl+C) para encerrar graciosamente
 */
process.on('SIGINT', () => {
    console.log('\n\n🛑 Servidor encerrado.');
    process.exit();
});
