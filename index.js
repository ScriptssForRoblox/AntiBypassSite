async function startCheckpoint() {
    if (window.location.protocol === 'file:') {
        alert("Erro: Você abriu o arquivo direto. Por favor, rode o servidor Node.js e acesse http://localhost:3000");
        return;
    }
    try {
        // Simulando a ida para um encurtador com anúncios
        const adUrl = "https://linkvertise.com/seulink-aqui"; // Coloque seu link de anúncios aqui
        
        alert("Para obter a key, você passará por uma página de anúncios. Aguarde!");
        
        // Em um sistema real, você redirecionaria para o encurtador.
        // O encurtador, ao final, mandaria o usuário para a página de geração.
        
        await fetch('/api/start-checkpoint', { method: 'POST' });
        
        // Simula o redirecionamento após passar pelo "anúncio"
        window.location.href = "generator.html";
        
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