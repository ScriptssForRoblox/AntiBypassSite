const express = require('express');
const cookieSession = require('cookie-session');
const crypto = require('crypto');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicialização do Firebase Admin
if (!admin.apps.length) {
    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            throw new Error("Variável FIREBASE_SERVICE_ACCOUNT_KEY não configurada.");
        }
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error.message);
    }
}

const db = admin.firestore();
const keysCollection = db.collection('generated_keys');

app.use(cors({
    origin: ['https://seu-usuario.github.io', 'http://localhost:3000'],
    credentials: true
}));

app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'chave-padrao-desenvolvimento'],
    maxAge: 10 * 60 * 1000
}));

app.use(express.json());

// API Routes
app.post('/api/start-checkpoint', (req, res) => {
    req.session.passedCheckpoint = true;
    res.json({ success: true });
});

app.get('/api/generate-key', async (req, res) => {
    if (!req.session.passedCheckpoint) {
        return res.status(403).json({ success: false, message: 'Bypass detectado!' });
    }
    req.session.passedCheckpoint = false;
    const secureKey = "REAL-KEY-" + crypto.randomBytes(6).toString('hex').toUpperCase();
    try {
        await keysCollection.doc(secureKey).set({
            key: secureKey,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000),
            used: false,
            ip: req.ip
        });
        res.json({ success: true, key: secureKey });
    } catch (error) {
        console.error("Erro no Firebase:", error);
        res.status(500).json({ success: false, message: 'Erro interno ao gerar a chave.' });
    }
});

app.post('/api/redeem-key', async (req, res) => {
    const { key } = req.body;
    try {
        const keyDoc = await keysCollection.doc(key).get();
        if (keyDoc.exists) {
            const data = keyDoc.data();
            if (!data.used && data.expiresAt > Date.now()) {
                await keysCollection.doc(key).update({ used: true, redeemedAt: admin.firestore.FieldValue.serverTimestamp() });
                return res.json({ success: true, message: 'Key válida! Acesso liberado.' });
            }
        }
        return res.status(400).json({ success: false, message: 'Key inválida ou expirada.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

app.post('/api/external/validate', async (req, res) => {
    const { key } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Chave não fornecida.' });
    try {
        const keyDoc = await keysCollection.doc(key).get();
        if (keyDoc.exists) {
            const data = keyDoc.data();
            if (!data.used && data.expiresAt > Date.now()) {
                return res.json({ success: true, message: 'Acesso autorizado!' });
            }
        }
        return res.status(403).json({ success: false, message: 'Chave inválida ou utilizada.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro interno na API.' });
    }
});

// Local development listener
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Servidor local rodando em http://localhost:${PORT}`));
}

module.exports = app;