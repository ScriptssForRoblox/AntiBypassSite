const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Armazenamento temporário de chaves válidas (em memória)
const validKeys = new Set();

// Configuração de Sessão (para saber se o usuário passou pelo index)
app.use(session({
    secret: process.env.SESSION_SECRET || 'chave-padrao-desenvolvimento',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 600000 } // Sessão expira em 10 min
}));

// Para aceitar JSON no corpo das requisições
app.use(express.json());
// Serve arquivos estáticos da pasta atual (ajustado para o contexto)
app.use(express.static(__dirname));

// Rota 1: O usuário clica no botão do index.html
app.post('/api/start-checkpoint', (req, res) => {
    console.log('--- Novo Checkpoint Iniciado ---');
    req.session.passedCheckpoint = true;
    res.json({ success: true });
});

// Rota 2: O gerador (Untitled-1.html) pede a key aqui
app.get('/api/generate-key', (req, res) => {
    console.log('--- Requisição de Key Recebida ---');
    
    // SEGURANÇA: Verifica se o usuário realmente passou pelo checkpoint
    if (!req.session.passedCheckpoint) {
        console.log('ALERTA: Tentativa de Bypass detectada!');
        return res.status(403).json({ error: 'Bypass detectado!' });
    }

    // Limpa o checkpoint para que ele precise clicar de novo na próxima vez
    req.session.passedCheckpoint = false;

    // Gera uma key segura no SERVIDOR (impossível de prever)
    const secureKey = "REAL-KEY-" + crypto.randomBytes(6).toString('hex').toUpperCase();
    
    // Salva a chave como válida para teste posterior
    validKeys.add(secureKey);
    
    console.log('Sucesso: Key gerada ->', secureKey);
    res.json({ key: secureKey });
});

// Rota 3: Testar/Resgatar a key
app.post('/api/redeem-key', (req, res) => {
    const { key } = req.body;
    if (validKeys.has(key)) {
        return res.json({ success: true, message: 'Key válida! Acesso liberado.' });
    } else {
        return res.status(400).json({ success: false, message: 'Key inválida ou expirada.' });
    }
});

// Rota padrão para garantir que o index sempre carregue
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
    =========================================
       SITE ONLINE: http://localhost:${PORT}
       Pressione CTRL+C para parar.
    =========================================
    `);
});