const apiUrl = "https://revealit.onrender.com/messages";

function isViewingPeriod() {
    const now = new Date();
    const start = new Date('2025-04-14T13:08:00'); // início da revelação
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // +24 horas
    return now >= start && now <= end;
}

function renderMessages(messages, reveal = false) {
    const messagesDiv = document.getElementById("messages");
    if (!messagesDiv) return;

    messagesDiv.innerHTML = ""; // Limpa as mensagens antigas

    messages.forEach(entry => {
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.innerHTML = `
            <strong>${entry.name}</strong><br>
            ${reveal ? entry.message : "?"}
        `;
        messagesDiv.appendChild(bubble);
    });
}

async function fetchAndRenderMessages(reveal = false) {
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        renderMessages(data, reveal);
    } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("message-form");
    const warning = document.getElementById("form-warning");

    if (form) {
        // Inicialmente, se estiver no período de revelação, esconde o formulário.
        if (isViewingPeriod()) {
            form.classList.add("hidden");
            warning.classList.remove("hidden");
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const message = document.getElementById("message").value;

            await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, message })
            });

            window.location.href = "view.html";
        });
    }

    // Renderiza as mensagens na página inicialmente (com "?" ou reveladas, conforme a data)
    fetchAndRenderMessages(isViewingPeriod());
});

// LOOP DE VERIFICAÇÃO DE REVELAÇÃO - ATUALIZA DINAMICAMENTE SEM PRECISAR DAR F5
(function watchRevealTime() {
    setInterval(async () => {
        // Se já estiver no período de revelação, refaz o fetch e atualiza as mensagens.
        if (isViewingPeriod()) {
            console.log("✨ Período de revelação detectado! Atualizando mensagens...");
            await fetchAndRenderMessages(true);

            // Se desejar, também pode atualizar a visibilidade do formulário:
            const form = document.getElementById("message-form");
            const warning = document.getElementById("form-warning");
            if (form && warning) {
                form.classList.add("hidden");
                warning.classList.remove("hidden");
            }
        } else {
            console.log("⏳ Ainda não é hora da revelação...");
        }
    }, 5000); // verifica a cada 5 segundos
})();
