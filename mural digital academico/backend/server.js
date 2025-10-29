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
// Alteração: caminhos agora apontam para a pasta "frontend" (um nível acima)
// e a URL "/" serve o arquivo frontend/index.html. Isso evita 404 ao pedir
// páginas e assets estáticos.
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

    // ===== DETERMINAR ARQUIVO A SER SERVIDO =====
    // Aponta para a pasta frontend (um nível acima)
    let filePath = path.join(__dirname, '..', 'frontend', req.url);
    // Se a URL for apenas '/', serve o index.html
    if (req.url === '/') {
        filePath = path.join(__dirname, '..', 'frontend', 'index.html');
    }

    // ===== OBTER TIPO MIME DO ARQUIVO =====
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // ===== LER E SERVIR O ARQUIVO =====
    fs.readFile(filePath, (error, content) => {
        if (error) {
            // ===== TRATAMENTO DE ERROS =====
            if (error.code === 'ENOENT') {
                // Arquivo não encontrado (404)
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Página não encontrada</h1>', 'utf-8');
            } else {
                // Erro no servidor (500)
                res.writeHead(500);
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
