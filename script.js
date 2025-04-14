const apiUrl = "https://revealit.onrender.com/messages";

function isViewingPeriod() {
    const now = new Date();
    const start = new Date('2025-04-11T20:00:00'); // início da revelação
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

    // Exibe mensagens com ou sem revelação no início
    fetchAndRenderMessages(isViewingPeriod());
});

// === LOOP DE VERIFICAÇÃO DE REVELAÇÃO COM ATUALIZAÇÃO DINÂMICA ===
(function watchRevealTime() {
    let alreadyRevealed = isViewingPeriod();

    let intervalId = setInterval(async () => {
        if (isViewingPeriod() && !alreadyRevealed) {
            alreadyRevealed = true;
            console.log("✨ Hora da revelação! Atualizando mensagens...");
            await fetchAndRenderMessages(true); // Atualiza mensagens com conteúdo real
        } else {
            console.log("⏳ Ainda não é hora da revelação...");
        }
    }, 5000);
})();
