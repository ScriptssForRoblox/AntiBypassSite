async function startCheckpoint() {
    if (window.location.protocol === 'file:') {
        alert("Erro: Você abriu o arquivo direto. Por favor, rode o servidor Node.js e acesse http://localhost:3000");
        return;
    }
    try {
        console.log("Iniciando checkpoint e redirecionando para anúncios...");
        
        const response = await fetch('/api/start-checkpoint', { method: 'POST' });
        
        if (response.ok) {
            // Simulação de redirecionamento para encurtador
            // Em um cenário real, aqui seria: window.location.href = "https://linkvertise.com/..."
            alert("Você será redirecionado para os anúncios agora.");
            window.location.href = "generator.html";
        }
    } catch (e) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function redeemKey() {
    const key = document.getElementById('keyInput').value;
    if (!key) return alert("Digite uma key!");

    try {
        const response = await fetch('/api/redeem-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: key })
        });
        const data = await response.json();
        
        if (response.ok) {
            alert("✅ " + data.message);
        } else {
            alert("❌ " + data.message);
        }
    } catch (e) {
        alert("Erro ao validar a key.");
    }
}