let users = JSON.parse(localStorage.getItem('users')) || [];
const tableBody = document.getElementById('tableBody');
const addBtn = document.getElementById('addBtn');
const autoToggle = document.getElementById('autoToggle');

let deleteIndex = null;

// Charger le template existant
let emailTemplate = localStorage.getItem("emailTemplate") || "";

function renderTable() {
    tableBody.innerHTML = '';
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2">${user.firstName}</td>
            <td class="px-4 py-2">${user.lastName}</td>
            <td class="px-4 py-2">${user.company}</td>
            <td class="px-4 py-2">${user.email}</td>
            <td class="px-4 py-2 font-medium ${
            user.status === 'Envoyé' ? 'text-green-500' :
                user.status === 'En cours' ? 'text-yellow-500' :
                    user.status === 'Erreur' ? 'text-red-500' : 'text-gray-400'
        }">${user.status}</td>
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

function addUser() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const company = document.getElementById('company').value.trim();
    const email = document.getElementById('email').value.trim();
    if (!firstName || !lastName || !company || !email) return alert('Veuillez remplir tous les champs.');

    const newUser = { firstName, lastName, company, email, status: 'En attente' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    renderTable();

    if(autoToggle.checked) {
        sendEmail(users.length - 1); // envoi automatique
    }

    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('company').value = '';
    document.getElementById('email').value = '';
}

// Modal suppression
function deleteUser(index) {
    deleteIndex = index;
    document.getElementById('deleteModal').classList.remove('hidden');
}

document.getElementById('cancelDelete').addEventListener('click', () => {
    deleteIndex = null;
    document.getElementById('deleteModal').classList.add('hidden');
});

document.getElementById('confirmDelete').addEventListener('click', () => {
    if(deleteIndex !== null){
        users.splice(deleteIndex, 1);
        localStorage.setItem('users', JSON.stringify(users));
        renderTable();
        deleteIndex = null;
        document.getElementById('deleteModal').classList.add('hidden');
    }
});

// Envoi d'email
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
            to: users[index].email, // ← l'email du tableau
            template: emailTemplate // ← ton template sauvegardé
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

// Gestion Template
const templateBtn = document.getElementById("templateBtn");
const templateModal = document.getElementById("templateModal");
const closeTemplate = document.getElementById("closeTemplate");
const saveTemplate = document.getElementById("saveTemplate");
const templateInput = document.getElementById("templateInput");
const templatePreview = document.getElementById("templatePreview");

// Init valeurs
if(templateInput){
    templateInput.value = emailTemplate;
    templatePreview.innerHTML = emailTemplate || "<p>Aperçu vide...</p>";
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

// Aperçu live
if(templateInput){
    templateInput.addEventListener("input", () => {
        templatePreview.innerHTML = templateInput.value;
    });
}

addBtn.addEventListener('click', addUser);
renderTable();
