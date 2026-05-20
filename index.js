document.addEventListener('DOMContentLoaded', () => {
    checkAdBlocker(); // Verifica AdBlock assim que a página carrega
});

function checkAdBlocker() {
    const adBlockDetector = document.getElementById('adBlockDetector');
    const adBlockMessage = document.getElementById('adBlockMessage');
    const startButton = document.getElementById('startButton');

    // Verifica se o elemento isca foi bloqueado (geralmente terá offsetHeight/Width = 0)
    // Ou se o AdBlocker o escondeu com display: none
    if (adBlockDetector.offsetHeight === 0 || adBlockDetector.style.display === 'none' || adBlockDetector.style.visibility === 'hidden') {
        adBlockMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> AdBlock detectado! Por favor, desative-o para continuar.';
        adBlockMessage.classList.remove('hidden');
        startButton.disabled = true; // Desabilita o botão de iniciar
        return true; // AdBlock detectado
    } else {
        adBlockMessage.classList.add('hidden');
        startButton.disabled = false; // Habilita o botão se não houver AdBlock
        return false; // Nenhum AdBlock detectado
    }
}

async function startCheckpoint() {
    const startButton = document.getElementById('startButton');
    const startLoading = document.getElementById('startLoading');
    const startError = document.getElementById('startError');

    // Verifica AdBlock novamente antes de iniciar o checkpoint
    if (checkAdBlocker()) {
        return; // Se AdBlock estiver ativo, não prossegue
    }

    // Esconde mensagens de erro anteriores
    startError.classList.add('hidden');
    startError.innerText = '';

    if (window.location.protocol === 'file:') {
        alert("Erro: Você abriu o arquivo direto. Por favor, rode o servidor Node.js e acesse http://localhost:3000");
        return;
    }

    // Desabilita o botão e mostra o carregamento
    startButton.disabled = true;
    startLoading.classList.remove('hidden');

    try {
        console.log("Iniciando checkpoint e redirecionando para anúncios...");
        
        // Se o backend estiver no Render, use a URL do Render aqui:
        const BACKEND_URL = "https://seu-app-no-render.onrender.com";
        const response = await fetch(`${BACKEND_URL}/api/start-checkpoint`, { method: 'POST' });
        
        if (response.ok) {
            // AQUI É ONDE VOCÊ GANHA DINHEIRO:
            // Substitua 'SUA_URL_ENCURTADA' pelo link que o Linkvertise/Ad-Network te der. (Ex: Linkvertise, AdMaven, ShrinkMe)
            // Este link deve ser configurado para, após o usuário passar pelos anúncios, redirecioná-lo para:
            // http://seu-dominio.com/generator.html
            const adLink = "https://linkvertise.com/123456/exemplo"; // <-- **MUDE ESTE LINK**
            
            // Abre o link de anúncio em uma nova aba e redireciona a aba atual para o gerador
            window.open(adLink, '_blank'); // Abre o anúncio em uma nova aba
            window.location.href = "generator.html"; // Redireciona a aba atual para o gerador
        } else {
            const errorData = await response.json();
            startError.innerText = `Erro do servidor: ${errorData.message || 'Falha desconhecida.'}`;
            startError.classList.remove('hidden');
        }
    } catch (e) {
        console.error("Erro ao iniciar checkpoint:", e);
        startError.innerText = "Erro ao conectar com o servidor. Verifique se o Node.js está rodando.";
        startError.classList.remove('hidden');
    } finally {
        // Reabilita o botão e esconde o carregamento em caso de falha
        startButton.disabled = false;
        startLoading.classList.add('hidden');
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