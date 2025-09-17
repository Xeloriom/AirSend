// emails.js
let emailTemplate = localStorage.getItem("emailTemplate") || "";

const templateBtn = document.getElementById("templateBtn");
const templateModal = document.getElementById("templateModal");
const closeTemplate = document.getElementById("closeTemplate");
const saveTemplate = document.getElementById("saveTemplate");
const templateInput = document.getElementById("templateInput");
const templatePreview = document.getElementById("templatePreview");

// Initialisation valeurs
if(templateInput){
    templateInput.value = emailTemplate;
    templatePreview.innerHTML = emailTemplate || "<p>Aperçu vide...</p>";
}

// Aperçu live
if(templateInput){
    templateInput.addEventListener("input", () => {
        templatePreview.innerHTML = templateInput.value;
    });
}

// Ouvrir modale
if(templateBtn){
    templateBtn.addEventListener("click", () => {
        templateModal.classList.remove("hidden");
    });
}

// Fermer modale
if(closeTemplate){
    closeTemplate.addEventListener("click", () => {
        templateModal.classList.add("hidden");
    });
}

// Enregistrer template
if(saveTemplate){
    saveTemplate.addEventListener("click", () => {
        emailTemplate = templateInput.value;
        localStorage.setItem("emailTemplate", emailTemplate);
        templatePreview.innerHTML = emailTemplate || "<p>Aperçu vide...</p>";
        templateModal.classList.add("hidden");
    });
}

// Fonction envoi d'email
function sendEmail(index) {
    users[index].status = 'En cours';
    renderTable();

    fetch('https://www.alhambra-web.com/send_mail_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                users[index].status = 'Envoyé';
                console.log(data.message);
            } else {
                users[index].status = 'Erreur';
                console.error(data.message);
            }
            localStorage.setItem('users', JSON.stringify(users));
            renderTable();
        })
        .catch(error => {
            users[index].status = 'Erreur';
            localStorage.setItem('users', JSON.stringify(users));
            renderTable();
            console.error('Fetch error:', error);
        });
}
