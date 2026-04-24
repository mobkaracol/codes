/*
╔════════════════════════════════════════════════════════════════════════╗
║          SERVIDOR HTTP PARA MURAL DIGITAL ACADÊMICO                    ║
║                                                                        ║
║  Servidor Node.js para servir arquivos estáticos e gerenciar auth.     ║
║  Autenticação via users.json com senhas hasheadas (SHA-256).           ║
║                                                                        ║
║  Como usar:                                                            ║
║  1. Certifique-se de ter Node.js instalado                             ║
║  2. Execute: node server.js  (na pasta backend/)                       ║
║  3. Acesse: http://localhost:3000                                      ║
║                                                                        ║
║  Usuários padrão:                                                      ║
║    admin     / admin123                                                ║
║    aluno     / aluno123                                                ║
║    professor / prof123                                                 ║
╚════════════════════════════════════════════════════════════════════════╝
*/

// ============================================
// IMPORTAÇÃO DE MÓDULOS
// ============================================
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

// ============================================
// CONFIGURAÇÕES DO SERVIDOR
// ============================================
const PORT     = 3000;
const HOST     = 'localhost';
const FRONTEND = path.join(__dirname, '..', 'frontend');
const USERS_DB = path.join(__dirname, 'users.json');

// ============================================
// SESSÕES EM MEMÓRIA
// ============================================
// Map<token, { id, username, name, role, createdAt }>
const sessions = new Map();

// ============================================
// HELPERS
// ============================================
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function loadUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_DB, 'utf-8'));
    } catch {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2), 'utf-8');
}

function sendJSON(res, statusCode, data) {
    const body = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try { resolve(JSON.parse(body || '{}')); }
            catch { reject(new Error('JSON inválido')); }
        });
        req.on('error', reject);
    });
}

// ============================================
// TIPOS MIME
// ============================================
const mimeTypes = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'text/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon'
};

// ============================================
// ROTEADOR DE API
// ============================================
async function handleAPI(req, res) {
    const url = req.url.split('?')[0];

    // ----- POST /api/register -----
    if (url === '/api/register' && req.method === 'POST') {
        let body;
        try { body = await readBody(req); }
        catch { return sendJSON(res, 400, { error: 'Requisição inválida.' }); }

        const { name, username, password } = body;

        if (!name || !username || !password) {
            return sendJSON(res, 400, { error: 'Nome, usuário e senha são obrigatórios.' });
        }

        const cleanName = String(name).trim();
        const cleanUsername = String(username).trim().toLowerCase();
        const cleanPassword = String(password);

        if (cleanName.length < 3) {
            return sendJSON(res, 400, { error: 'Nome deve ter pelo menos 3 caracteres.' });
        }

        if (!/^[a-z0-9._-]{3,20}$/.test(cleanUsername)) {
            return sendJSON(res, 400, { error: 'Usuário deve ter 3 a 20 caracteres (a-z, 0-9, ., _ ou -).' });
        }

        if (cleanPassword.length < 6) {
            return sendJSON(res, 400, { error: 'Senha deve ter pelo menos 6 caracteres.' });
        }

        const users = loadUsers();
        const exists = users.some(u => u.username === cleanUsername);

        if (exists) {
            return sendJSON(res, 409, { error: 'Esse usuário já existe.' });
        }

        const nextId = users.length ? Math.max(...users.map(u => Number(u.id) || 0)) + 1 : 1;
        const newUser = {
            id: nextId,
            username: cleanUsername,
            name: cleanName,
            role: 'aluno',
            passwordHash: hashPassword(cleanPassword)
        };

        users.push(newUser);

        try {
            saveUsers(users);
        } catch {
            return sendJSON(res, 500, { error: 'Falha ao salvar usuário.' });
        }

        console.log(`[AUTH] Cadastro: ${newUser.username} (${newUser.role})`);
        return sendJSON(res, 201, { ok: true, message: 'Cadastro realizado com sucesso.' });
    }

    // ----- POST /api/login -----
    if (url === '/api/login' && req.method === 'POST') {
        let body;
        try { body = await readBody(req); }
        catch { return sendJSON(res, 400, { error: 'Requisição inválida.' }); }

        const { username, password } = body;
        if (!username || !password) {
            return sendJSON(res, 400, { error: 'Usuário e senha são obrigatórios.' });
        }

        const users = loadUsers();
        const user  = users.find(u => u.username === username);

        if (!user || user.passwordHash !== hashPassword(password)) {
            return sendJSON(res, 401, { error: 'Usuário ou senha incorretos.' });
        }

        const token = generateToken();
        sessions.set(token, {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            createdAt: Date.now()
        });

        console.log(`[AUTH] Login: ${user.username} (${user.role})`);
        return sendJSON(res, 200, { token, name: user.name, role: user.role });
    }

    // ----- POST /api/logout -----
    if (url === '/api/logout' && req.method === 'POST') {
        const token = (req.headers['authorization'] || '').replace('Bearer ', '');
        if (token && sessions.has(token)) {
            const user = sessions.get(token);
            sessions.delete(token);
            console.log(`[AUTH] Logout: ${user.username}`);
        }
        return sendJSON(res, 200, { ok: true });
    }

    // ----- GET /api/me -----
    if (url === '/api/me' && req.method === 'GET') {
        const token = (req.headers['authorization'] || '').replace('Bearer ', '');
        const session = sessions.get(token);
        if (!session) return sendJSON(res, 401, { error: 'Não autenticado.' });
        return sendJSON(res, 200, { id: session.id, username: session.username, name: session.name, role: session.role });
    }

    // Rota de API não encontrada
    return sendJSON(res, 404, { error: 'Rota não encontrada.' });
}

// ============================================
// CRIAÇÃO DO SERVIDOR HTTP
// ============================================
const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Preflight CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
        return res.end();
    }

    // Rotas de API
    if (req.url.startsWith('/api/')) {
        return handleAPI(req, res);
    }

    // Arquivos estáticos (frontend)
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') urlPath = '/index.html';

    const filePath   = path.join(FRONTEND, urlPath);
    const safeFront  = path.resolve(FRONTEND);

    // Proteção contra path traversal
    if (!path.resolve(filePath).startsWith(safeFront)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('Forbidden');
    }

    const extname    = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Página não encontrada</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Erro no servidor: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================
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
