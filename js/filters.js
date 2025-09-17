const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const companyFilter = document.getElementById('companyFilter');

// Met à jour la liste des entreprises dans le filtre
function updateCompanyFilter() {
    const companies = [...new Set(users.map(u => u.company).filter(c => c))];
    companyFilter.innerHTML = '<option value="">Toutes les entreprises</option>';
    companies.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        companyFilter.appendChild(option);
    });
}

// Render table avec filtres appliqués
function renderFilteredTable() {
    const search = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    const company = companyFilter.value;

    tableBody.innerHTML = '';
    users.forEach((user, index) => {
        if (
            (status && user.status !== status) ||
            (company && user.company !== company) ||
            ![user.firstName, user.lastName, user.company, user.email, user.phone]
                .some(field => field.toLowerCase().includes(search))
        ) return;

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

// Écouteurs
searchInput.addEventListener('input', renderFilteredTable);
statusFilter.addEventListener('change', renderFilteredTable);
companyFilter.addEventListener('change', renderFilteredTable);

// Met à jour la liste des entreprises à chaque ajout/import
function refreshFilters() {
    updateCompanyFilter();
    renderFilteredTable();
}

refreshFilters();
