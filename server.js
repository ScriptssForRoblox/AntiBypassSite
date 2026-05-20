const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicialização do Firebase Admin
// Lê as credenciais do Firebase de uma variável de ambiente
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const keysCollection = db.collection('generated_keys');

// Configuração de CORS para aceitar seu site do GitHub
app.use(cors({
    origin: ['https://seu-usuario.github.io', 'http://localhost:3000'],
    credentials: true
}));

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
app.get('/api/generate-key', async (req, res) => {
    console.log('--- Requisição de Key Recebida ---');
    
    // SEGURANÇA: Verifica se o usuário realmente passou pelo checkpoint
    if (!req.session.passedCheckpoint) {
        console.log('ALERTA: Tentativa de Bypass detectada!');
        return res.status(403).json({ success: false, message: 'Bypass detectado!' });
    }

    // Limpa o checkpoint para que ele precise clicar de novo na próxima vez
    req.session.passedCheckpoint = false;

    // Gera uma key segura no SERVIDOR (impossível de prever)
    const secureKey = "REAL-KEY-" + crypto.randomBytes(6).toString('hex').toUpperCase();
    
    try {
        // Salva a chave no Firebase com metadados
        await keysCollection.doc(secureKey).set({
            key: secureKey,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // Expira em 24 horas
            used: false,
            ip: req.ip
        });
        
        console.log('Sucesso: Key gerada ->', secureKey);
        res.json({ success: true, key: secureKey });
    } catch (error) {
        console.error("Erro ao salvar key no Firebase:", error);
        res.status(500).json({ success: false, message: 'Erro interno ao gerar a chave.' });
    }
});

// Rota 3: Testar/Resgatar a key
app.post('/api/redeem-key', async (req, res) => {
    const { key } = req.body;
    
    try {
        const keyDoc = await keysCollection.doc(key).get();

        if (keyDoc.exists) {
            const data = keyDoc.data();
            
            if (!data.used && data.expiresAt > Date.now()) {
                // Marca como usada para não poderem usar a mesma key várias vezes
                await keysCollection.doc(key).update({ used: true, redeemedAt: admin.firestore.FieldValue.serverTimestamp() });
                return res.json({ success: true, message: 'Key válida! Acesso liberado.' });
            }
        }
        
        return res.status(400).json({ success: false, message: 'Key inválida, já usada ou expirada.' });
    } catch (error) {
        console.error("Erro ao validar no Firebase:", error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

// Rota para a documentação da API
app.get('/api-docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-docs.html'));
});

// Endpoint para Scripts Externos (Roblox / Discord Bot)
app.post('/api/external/validate', async (req, res) => {
    const { key } = req.body;
    
    if (!key) return res.status(400).json({ success: false, message: 'Chave não fornecida.' });

    try {
        const keyDoc = await keysCollection.doc(key).get();

        if (keyDoc.exists) {
            const data = keyDoc.data();
            
            // Verifica se a key não foi usada e se não expirou
            if (!data.used && data.expiresAt > Date.now()) {
                // OPCIONAL: Você pode marcar como 'used' aqui se quiser que a key seja de uso único
                // await keysCollection.doc(key).update({ used: true }); 
                return res.json({ success: true, message: 'Acesso autorizado!' });
            }
        }
        
        return res.status(403).json({ success: false, message: 'Chave inválida, expirada ou já utilizada.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro interno na API.' });
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

module.exports = app;