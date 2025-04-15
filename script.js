const messagesApiUrl = "https://revealit.onrender.com/messages";
const dateApiUrl = "https://revealit.onrender.com/date";

let storedRevelationDate = null;
let fetchedAfterReveal = false;

// Função para obter a data de revelação
async function getRevelationDate() {
    try {
        const res = await fetch(dateApiUrl);
        const data = await res.json();
        return new Date(data.revelationDay);
    } catch (err) {
        console.error("Erro ao buscar data de revelação:", err);
        return null;
    }
}

// Verifica se já passou a data de revelação
function isRevealTime() {
    if (!storedRevelationDate) return false;
    const agoraBrasilia = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return agoraBrasilia >= storedRevelationDate;
}

// Renderiza mensagens
function renderMessages(messages) {
    const messagesDiv = document.getElementById("messages");
    if (!messagesDiv) return;
    messagesDiv.innerHTML = "";

    messages.forEach(entry => {
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.innerHTML = `<strong>${entry.name}</strong><br>${entry.message}`;
        messagesDiv.appendChild(bubble);
    });
}

// Busca mensagens
async function fetchAndRenderMessages() {
    try {
        const res = await fetch(messagesApiUrl);
        const data = await res.json();
        renderMessages(data);
    } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
    }
}

// Contador regressivo
function startCountdown(targetDate) {
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    function updateCountdown() {
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        const diff = targetDate - now;

        if (diff <= 0) {
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minutesEl.textContent = "00";
            secondsEl.textContent = "00";
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("message-form");
    const warning = document.getElementById("form-warning");

    storedRevelationDate = await getRevelationDate();

    if (storedRevelationDate) {
        startCountdown(storedRevelationDate);
    }

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

    await fetchAndRenderMessages();
});

// Verifica se é hora da revelação a cada 5s
(function watchRevealTime() {
    setInterval(async () => {
        if (isRevealTime() && !fetchedAfterReveal) {
            console.log("✨ Período de revelação detectado! Atualizando mensagens...");
            await fetchAndRenderMessages();

            const form = document.getElementById("message-form");
            const warning = document.getElementById("form-warning");
            if (form && warning) {
                form.classList.add("hidden");
                warning.classList.remove("hidden");
            }

            fetchedAfterReveal = true;
        }
    }, 5000);
})();
