document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/generate-key');
        const data = await response.json();

        // Simula um tempo de carregamento para ficar bonito
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');

            if (response.ok) {
                // Sucesso: Mostra a key gerada pelo servidor
                document.getElementById('result').classList.remove('hidden');
                document.getElementById('keyDisplay').innerText = data.key;
            } else {
                // Erro ou Bypass: Mostra mensagem de erro
                document.getElementById('bypassDetected').classList.remove('hidden');
                
                // Redireciona após 3 segundos
                setTimeout(() => {
                    window.location.href = "/";
                }, 3000);
            }
        }, 2000);

    } catch (error) {
        console.error("Erro na requisição:", error);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('bypassDetected').innerText = "Erro ao conectar com o servidor.";
        document.getElementById('bypassDetected').classList.remove('hidden');
    }
});

function copyKey() {
    const keyText = document.getElementById('keyDisplay').innerText;
    if (keyText) {
        navigator.clipboard.writeText(keyText);
        const btn = document.querySelector('.copy-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => { btn.innerHTML = '<i class="far fa-copy"></i> Clique para copiar'; }, 2000);
    }
}