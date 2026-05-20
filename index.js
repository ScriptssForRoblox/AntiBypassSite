async function startCheckpoint() {
    if (window.location.protocol === 'file:') {
        alert("Erro: Você abriu o arquivo direto. Por favor, rode o servidor Node.js e acesse http://localhost:3000");
        return;
    }
    try {
        const response = await fetch('/api/start-checkpoint', { method: 'POST' });
        if (response.ok) {
            window.location.href = "generator.html";
        }
    } catch (e) {
        alert("Erro ao conectar com o servidor. Verifique se o Node.js está rodando.");
    }
}