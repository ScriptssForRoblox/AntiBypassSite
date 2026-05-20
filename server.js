const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de Sessão (para saber se o usuário passou pelo index)
app.use(session({
    secret: process.env.SESSION_SECRET || 'chave-padrao-desenvolvimento',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 600000 } // Sessão expira em 10 min
}));

app.use(express.static(__dirname)); // Serve os arquivos HTML

// Rota 1: O usuário clica no botão do index.html
app.post('/api/start-checkpoint', (req, res) => {
    req.session.passedCheckpoint = true;
    res.json({ success: true });
});

// Rota 2: O gerador (Untitled-1.html) pede a key aqui
app.get('/api/generate-key', (req, res) => {
    // SEGURANÇA: Verifica se o usuário realmente passou pelo checkpoint
    if (!req.session.passedCheckpoint) {
        return res.status(403).json({ error: 'Bypass detectado!' });
    }

    // Limpa o checkpoint para que ele precise clicar de novo na próxima vez
    req.session.passedCheckpoint = false;

    // Gera uma key segura no SERVIDOR (impossível de prever)
    const secureKey = "REAL-KEY-" + crypto.randomBytes(6).toString('hex').toUpperCase();
    
    res.json({ key: secureKey });
});

app.listen(PORT, () => {
    console.log(`
    =========================================
       SITE ONLINE: http://localhost:${PORT}
    =========================================
    `);
});