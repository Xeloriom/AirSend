// emails.js

let emailTemplate = localStorage.getItem("emailTemplate") || "";
const templateBtn = document.getElementById("templateBtn");
const templateModal = document.getElementById("templateModal");
const closeTemplate = document.getElementById("closeTemplate");
const saveTemplate = document.getElementById("saveTemplate");
const templateInput = document.getElementById("templateInput");
const templatePreview = document.getElementById("templatePreview");

// Initialisation template
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

// Fonction pour vérifier si le mail a été ouvert
function checkEmailOpened(index) {
    const user = users[index];
    fetch('https://www.alhambra-web.com/get_opens.php')
        .then(res => res.json())
        .then(data => {
            // data = objet UID -> infos utilisateur avec 'openedAt'
            const opened = Object.values(data).some(entry => entry.email === user.email && entry.openedAt);
            if(opened){
                users[index].status = 'Ouvert';
                localStorage.setItem('users', JSON.stringify(users));
                renderTable();
            }
        })
        .catch(err => console.error('Erreur check opens:', err));
}

// Fonction envoi d'email avec tracking
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

                // Vérifie après quelques secondes si le mail a été ouvert
                setTimeout(() => checkEmailOpened(index), 5000);
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

// Fonction pour rendre le tableau avec tous les statuts
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2">${user.firstName}</td>
            <td class="px-4 py-2">${user.lastName}</td>
            <td class="px-4 py-2">${user.company}</td>
            <td class="px-4 py-2">${user.email}</td>
            <td class="px-4 py-2">${user.phone || '-'}</td>
            <td class="px-4 py-2">
                <span class="px-3 py-1 text-xs font-medium text-white ${
            user.status === 'Envoyé' ? 'bg-green-500' :
                user.status === 'En cours' ? 'bg-yellow-500' :
                    user.status === 'Ouvert' ? 'bg-blue-500' :
                        'bg-red-500'
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

// Initial render
renderTable();
