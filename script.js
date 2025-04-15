// URLs dos endpoints
const messagesApiUrl = "https://revealit.onrender.com/messages";
const dateApiUrl = "https://revealit.onrender.com/date";

// Variável global para armazenar a data de revelação
let storedRevelationDate = null;

// Obtém a data de revelação do back-end (chamada única)
async function getRevelationDate() {
    try {
        const res = await fetch(dateApiUrl);
        const data = await res.json();
        // Formato recebido: { "id": 8, "revelationDay": "2025-04-15T10:30:45" }
        return new Date(data.revelationDay);
    } catch (err) {
        console.error("Erro ao buscar data de revelação:", err);
        return null;
    }
}

// Verifica se já passou da data de revelação usando o valor armazenado
function isRevealTime() {
    if (!storedRevelationDate) return false;
    // Converte a hora local para horário de Brasília:
    const agoraBrasilia = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return agoraBrasilia >= storedRevelationDate;
}

// Renderiza as mensagens, sem alteração no front (tudo vem do back)
function renderMessages(messages) {
    const messagesDiv = document.getElementById("messages");
    if (!messagesDiv) return;
    messagesDiv.innerHTML = ""; // Limpa mensagens antigas

    messages.forEach(entry => {
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.innerHTML = `<strong>${entry.name}</strong><br>${entry.message}`;
        messagesDiv.appendChild(bubble);
    });
}

// Faz o fetch do endpoint /messages e renderiza na tela
async function fetchAndRenderMessages() {
    try {
        const res = await fetch(messagesApiUrl);
        const data = await res.json();
        renderMessages(data);
    } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
    }
}

// Variável global para controlar se a requisição pós-revelação já foi feita
let fetchedAfterReveal = false;

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("message-form");
    const warning = document.getElementById("form-warning");

    // Chama o endpoint /date uma única vez e armazena o resultado
    storedRevelationDate = await getRevelationDate();

    // Verifica o período de revelação para definir se o form deve ser exibido
    if (form && warning) {
        if (isRevealTime()) {
            form.classList.add("hidden");
            warning.classList.remove("hidden");
        } else {
            form.classList.remove("hidden");
            warning.classList.add("hidden");
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const message = document.getElementById("message").value;

            await fetch(messagesApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, message })
            });

            window.location.href = "view.html";
        });
    }

    // Renderiza as mensagens iniciais – o back já retorna oculto ou revelado conforme a data de revelação
    await fetchAndRenderMessages();
});

// LOOP DE VERIFICAÇÃO: A cada 5 segundos, verifica se já passou o horário da revelação.
// Uma vez que o horário seja atingido, faz uma única requisição para atualizar as mensagens.
(function watchRevealTime() {
    setInterval(async () => {
        if (isRevealTime() && !fetchedAfterReveal) {
            console.log("✨ Período de revelação detectado! Atualizando mensagens...");
            await fetchAndRenderMessages();

            // Ajusta visibilidade do form se necessário
            const form = document.getElementById("message-form");
            const warning = document.getElementById("form-warning");
            if (form && warning) {
                form.classList.add("hidden");
                warning.classList.remove("hidden");
            }
            fetchedAfterReveal = true;
        } else {
            console.log("⏳ Ainda não é hora da revelação...");
        }
    }, 5000); // verifica a cada 5 segundos
})();
