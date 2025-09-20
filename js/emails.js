// --- Récupération template depuis localStorage ---
let emailTemplate = localStorage.getItem("emailTemplate") || "";

// --- Modales ---
const templateBtn = document.getElementById("templateBtn");
const templateModal = document.getElementById("templateModal");
const closeTemplate = document.getElementById("closeTemplate");
const saveTemplate = document.getElementById("saveTemplate");
const templateInput = document.getElementById("templateInput");
const templatePreview = document.getElementById("templatePreview");

if(templateInput){
    templateInput.value = emailTemplate;
    templatePreview.innerHTML = emailTemplate || "<p>Aperçu vide...</p>";
    templateInput.addEventListener("input", () => {
        templatePreview.innerHTML = templateInput.value;
    });
}

if(templateBtn) templateBtn.addEventListener("click", () => templateModal.classList.remove("hidden"));
if(closeTemplate) closeTemplate.addEventListener("click", () => templateModal.classList.add("hidden"));
if(saveTemplate) saveTemplate.addEventListener("click", () => {
    emailTemplate = templateInput.value;
    localStorage.setItem("emailTemplate", emailTemplate);
    templatePreview.innerHTML = emailTemplate || "<p>Aperçu vide...</p>";
    templateModal.classList.add("hidden");
});

// --- Envoi d'email ---
function sendEmail(index){
    users[index].status = "En cours";
    renderTable();

    fetch("https://www.alhambra-web.com/send_mail_api.php", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            firstName: users[index].firstName,
            lastName: users[index].lastName,
            company: users[index].company,
            email: users[index].email,
            phone: users[index].phone,
            to: users[index].email,
            template: emailTemplate
        })
    })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                users[index].status = "Envoyé";
                users[index].uid = data.uid; // pour tracking pixel
            } else {
                users[index].status = "Erreur";
                console.error(data.message);
            }
            localStorage.setItem("users", JSON.stringify(users));
            renderTable();
        })
        .catch(err => {
            users[index].status = "Erreur";
            localStorage.setItem("users", JSON.stringify(users));
            renderTable();
            console.error("Fetch error:", err);
        });
}

// --- Clic manuel "Vous n'êtes pas un robot" ---
function manualConfirm(uid){
    fetch(`https://www.alhambra-web.com/open.php?uid=${uid}&manual=1`)
        .then(() => checkConfirmedOpens()) // mise à jour statuts
        .catch(err => console.error("Erreur clic manuel:", err));
}

// --- Vérification automatique des ouvertures ---
function checkConfirmedOpens(){
    fetch("https://www.alhambra-web.com/get_opens.php")
        .then(res => res.json())
        .then(data => {
            users.forEach((user, index) => {
                const entry = Object.values(data).find(e => e.email === user.email);
                if(entry){
                    if(entry.instantOpenDetected){
                        users[index].status = "Suspect"; // ouverture instantanée
                    } else if(entry.openedAt){
                        users[index].status = "Ouvert"; // ouverture confirmée
                    }
                    users[index].clicks = entry.clicks || 0;
                }
            });
            localStorage.setItem("users", JSON.stringify(users));
            renderTable();
        })
        .catch(err => console.error("Erreur check opens:", err));
}

// --- Render tableau ---
function renderTable(){
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-4 py-2">${user.firstName}</td>
            <td class="px-4 py-2">${user.lastName}</td>
            <td class="px-4 py-2">${user.company}</td>
            <td class="px-4 py-2">${user.email}</td>
            <td class="px-4 py-2">${user.phone||'-'}</td>
            <td class="px-4 py-2">
                <span class="px-3 py-1 text-xs font-medium text-white ${
            user.status === "Envoyé" ? "bg-green-500" :
                user.status === "En cours" ? "bg-yellow-500" :
                    user.status === "Ouvert" ? "bg-blue-500" :
                        user.status === "Suspect" ? "bg-red-700" :
                            "bg-gray-500"
        } rounded-full inline-block">
                    ${user.status}
                </span>
            </td>
            <td class="px-4 py-2 flex gap-2">
                <button onclick="sendEmail(${index})" class="glass text-black px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition transform icon-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
                <button onclick="deleteUser(${index})" class="glass text-black px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition transform icon-btn">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// --- Initial render ---
renderTable();

// --- Vérifie les confirmations toutes les 5 secondes ---
setInterval(checkConfirmedOpens, 5000);
