const apiUrl = "https://revealit.onrender.com/messages";

function isViewingPeriod() {
    const now = new Date();
    const start = new Date('2025-04-11T20:00:00'); // início da revelação
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // +24 horas

    return now >= start && now <= end;
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

    const messagesDiv = document.getElementById("messages");
    if (messagesDiv) {
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                data.forEach(entry => {
                    const bubble = document.createElement("div");
                    bubble.className = "bubble";
                    bubble.innerHTML = `
                        <strong>${entry.name}</strong><br>
                        ${isViewingPeriod() ? entry.message : "?"}
                    `;
                    messagesDiv.appendChild(bubble);
                });
            });
    }
});

// === LOOP DE VERIFICAÇÃO DE REVELAÇÃO COM PARADA ===
(function watchRevealTime() {
    let alreadyReloaded = false;

    let intervalId = setInterval(() => {
        if (isViewingPeriod()) {
            if (!alreadyReloaded) {
                alreadyReloaded = true;
                console.log("✨ Hora da revelação! Recarregando...");
                clearInterval(intervalId); // parar o loop
                location.reload();
            }
        } else {
            console.log("⏳ Ainda não é hora da revelação...");
        }
    }, 5000); // verifica a cada 5 segundos
})();
