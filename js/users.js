// users.js
let users = JSON.parse(localStorage.getItem('users')) || [];
const tableBody = document.getElementById('tableBody');
const addBtn = document.getElementById('addBtn');
const autoToggle = document.getElementById('autoToggle');

let deleteIndex = null;

// Affiche le tableau
function renderTable() {
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
                    user.status === 'Erreur' ? 'bg-red-500' : 'bg-gray-400'
        } rounded-full inline-block">
                    ${user.status}
                </span>
            </td>
            <td class="px-4 py-2 flex gap-2">
                <button onclick="sendEmail(${index})" 
                    class="glass text-black px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition transform icon-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
                <button onclick="deleteUser(${index})" 
                    class="glass text-black px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition transform icon-btn">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Ajoute un utilisateur
function addUser() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const company = document.getElementById('company').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!firstName || !lastName || !company || !email || !phone) {
        return alert('Veuillez remplir tous les champs.');
    }

    const newUser = { firstName, lastName, company, email, phone, status: 'En attente' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    renderTable();

    if(autoToggle.checked) {
        sendEmail(users.length - 1); // envoi automatique
    }

    // Réinitialise les champs
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('company').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
}

// Supprime un utilisateur (modale)
function deleteUser(index) {
    deleteIndex = index;
    document.getElementById('deleteModal').classList.remove('hidden');
}

addBtn.addEventListener('click', addUser);
