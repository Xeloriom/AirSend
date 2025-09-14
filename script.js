document.addEventListener("DOMContentLoaded", () => {
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    let selectedIndex = null;
    let toDeleteIndex = null;
    let globalMailTemplate = JSON.parse(localStorage.getItem('globalMailTemplate')) || {name:'Nom template', type:'Texte', content:''};

    const customerTableBody = document.getElementById('customerTable');
    const rightPanel = document.getElementById('rightPanel');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const errorPopup = document.getElementById('errorPopup');
    const successPopup = document.getElementById('successPopup');
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    const editTemplateBtn = document.getElementById('editTemplateBtn');

    function showError(message) {
        errorPopup.textContent = message;
        errorPopup.classList.remove('hidden');
        errorPopup.classList.add('active');
        setTimeout(() => {
            errorPopup.classList.add('hidden');
            errorPopup.classList.remove('active');
        }, 3500);
    }

    function showSuccess(message) {
        successPopup.textContent = message;
        successPopup.classList.remove('hidden');
        successPopup.classList.add('active');
        setTimeout(() => {
            successPopup.classList.add('hidden');
            successPopup.classList.remove('active');
        }, 3000);
    }

    function saveCustomers() {
        localStorage.setItem('customers', JSON.stringify(customers));
        renderTable();
    }

    function saveGlobalTemplate() {
        localStorage.setItem('globalMailTemplate', JSON.stringify(globalMailTemplate));
    }

    function renderTable() {
        if (customers.length === 0) {
            customerTableBody.innerHTML = '<tr><td colspan="4" class="p-6 text-gray-400 text-center">Aucun client</td></tr>';
            return;
        }
        customerTableBody.innerHTML = customers.map((c, i) => `
      <tr class="hover:bg-white/50 cursor-pointer transition" data-index="${i}">
        <td class="p-6 text-xl font-thin">${c.name}</td>
        <td class="p-6 text-xl font-thin">${c.company}</td>
        <td class="p-6 text-lg font-thin">${c.email || ''}</td>
        <td class="p-6 flex gap-3 items-center">
          <button aria-label="Voir client" title="Voir" class="icon-btn" data-action="view" data-index="${i}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 hover:text-violet-700 transition" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button aria-label="Éditer client" title="Éditer" class="icon-btn" data-action="edit" data-index="${i}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 hover:text-blue-600 transition"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L12 16.828H9v-3.828z" />
            </svg>
          </button>
          <button aria-label="Supprimer client" title="Supprimer" class="icon-btn" data-action="delete" data-index="${i}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 hover:text-red-600 transition"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 7h12M9 7V6a2 2 0 012-2h2a2 2 0 012 2v1m-9 4h10l-1 9a2 2 0 01-2 2H9a2 2 0 01-2-2l-1-9z" />
            </svg>
          </button>
          <button aria-label="Envoyer mail" title="Envoyer mail" class="icon-btn" data-action="send" data-index="${i}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 hover:text-green-600 transition"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </button>
        </td>
      </tr>`).join('');
        attachRowEvents();
    }

    function attachRowEvents() {
        customerTableBody.querySelectorAll('button.icon-btn').forEach(btn => {
            const action = btn.dataset.action;
            const index = parseInt(btn.dataset.index);
            if (action === 'view') btn.onclick = () => { selectedIndex = index; showCustomerDetails(customers[index], false, true); };
            if (action === 'edit') btn.onclick = () => { selectedIndex = index; showCustomerDetails(customers[index], true, false); };
            if (action === 'delete') btn.onclick = () => askDeleteCustomer(index);
            if (action === 'send') btn.onclick = () => sendMail(index);
        });
    }

    function askDeleteCustomer(i) {
        toDeleteIndex = i;
        confirmDelete.classList.add('active');
    }

    cancelDeleteBtn.onclick = () => {
        toDeleteIndex = null;
        confirmDelete.classList.remove('active');
    };

    confirmDeleteBtn.onclick = () => {
        if (toDeleteIndex !== null) {
            customers.splice(toDeleteIndex, 1);
            if (selectedIndex === toDeleteIndex) selectedIndex = null;
            toDeleteIndex = null;
            saveCustomers();
            confirmDelete.classList.remove('active');
            hideRightPanel();
        }
    };

    function showCustomerDetails(c, editMode = false, viewMode = false) {
        rightPanel.classList.remove('hidden');
        closePanelBtn.style.display = "block";
        closePanelBtn.onclick = () => hideRightPanel();

        if (editMode) {
            rightPanel.innerHTML = `
        <button id="closePanelBtn" title="Fermer" 
          class="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-300 transition focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h3 class="text-4xl font-thin mb-10">Éditer Client</h3>
        <div class="flex flex-col space-y-7">
          <input id="name" value="${c.name || ''}" placeholder="Nom"
            class="border p-4 rounded shadow-inner text-2xl font-thin glass" />
          <input id="company" value="${c.company || ''}" placeholder="Entreprise"
            class="border p-4 rounded shadow-inner text-2xl font-thin glass" />
          <input id="email" value="${c.email || ''}" placeholder="Email"
            class="border p-4 rounded shadow-inner text-2xl font-thin glass" />
          <div class="flex gap-4 mt-12">
            <button id="saveEditBtn" class="px-8 py-4 text-2xl glass font-thin shadow hover:bg-blue-300/50 transition rounded-xl">
              Enregistrer
            </button>
            <button id="cancelEditBtn" class="px-8 py-4 text-2xl glass font-thin shadow hover:bg-gray-400/40 transition rounded-xl">
              Annuler
            </button>
          </div>
        </div>
      `;

            document.getElementById('cancelEditBtn').onclick = () => showCustomerDetails(c, false);

            document.getElementById('saveEditBtn').onclick = () => {
                const name = document.getElementById('name').value.trim();
                if (!name) {
                    showError('Le nom est obligatoire');
                    return;
                }
                const company = document.getElementById('company').value.trim();
                const email = document.getElementById('email').value.trim();
                if(email && !validateEmail(email)){
                    showError('Email invalide');
                    return;
                }

                c.name = name;
                c.company = company;
                c.email = email;

                saveCustomers();
                showSuccess('Client mis à jour');
            };

        } else if (viewMode) {
            rightPanel.innerHTML = `
        <button id="closePanelBtn" title="Fermer" 
                class="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-300 transition focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h3 class="text-4xl font-thin mb-8">${c.name}</h3>
        <p class="mb-6 text-2xl font-thin"><strong>Entreprise :</strong> ${c.company}</p>
        <p class="mb-6 text-xl font-thin"><strong>Email :</strong> ${c.email || ''}</p>
      `;

            document.getElementById('closePanelBtn').onclick = () => hideRightPanel();

        } else {
            rightPanel.innerHTML = `<p class="text-gray-400 text-center mt-20">Cliquez sur "Ajouter" ou un client pour éditer</p>`;
            closePanelBtn.style.display = "none";
        }
    }

    function hideRightPanel() {
        rightPanel.classList.add('hidden');
        selectedIndex = null;
    }

    addCustomerBtn.onclick = () => {
        showCustomerDetails({ name: '', company: '', email: '' }, true);
    };

    editTemplateBtn.onclick = () => {
        showTemplateEditor();
    };

    function showTemplateEditor() {
        rightPanel.classList.remove('hidden');
        closePanelBtn.style.display = "block";
        closePanelBtn.onclick = () => hideRightPanel();

        rightPanel.innerHTML = `
      <button id="closePanelBtn" title="Fermer" 
        class="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-300 transition focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h3 class="text-4xl font-thin mb-10">Modifier Template Global</h3>
      <input id="templateName" value="${globalMailTemplate.name}" placeholder="Nom du template"
             class="border p-4 rounded-xl glass shadow-inner text-2xl font-thin"/>
      <label class="text-xl font-thin mt-4">Type de template :</label>
      <select id="templateType" class="border p-4 rounded-xl glass shadow-inner text-xl font-thin">
        <option ${globalMailTemplate.type === 'Texte' ? 'selected' : ''}>Texte</option>
        <option ${globalMailTemplate.type === 'HTML' ? 'selected' : ''}>HTML</option>
      </select>
      <label class="text-xl font-thin mt-4">Contenu du mail :</label>
      <textarea id="templateContent" rows="8"
        class="border p-4 rounded-xl glass shadow-inner text-lg font-thin"
        placeholder="Message ${globalMailTemplate.type === 'HTML' ? 'HTML' : 'texte'}">${globalMailTemplate.content}</textarea>
      <div class="flex gap-4 mt-12">
        <button id="saveTemplateBtn" class="px-8 py-4 text-2xl glass font-thin shadow hover:bg-blue-300/50 transition rounded-xl">
          Enregistrer
        </button>
        <button id="cancelTemplateBtn" class="px-8 py-4 text-2xl glass font-thin shadow hover:bg-gray-400/40 transition rounded-xl">
          Annuler
        </button>
      </div>
    `;

        document.getElementById('closePanelBtn').onclick = () => hideRightPanel();
        document.getElementById('cancelTemplateBtn').onclick = () => hideRightPanel();
        document.getElementById('saveTemplateBtn').onclick = () => {
            globalMailTemplate.name = document.getElementById('templateName').value.trim();
            globalMailTemplate.type = document.getElementById('templateType').value;
            globalMailTemplate.content = document.getElementById('templateContent').value;
            saveGlobalTemplate();
            showSuccess('Template global mis à jour');
            hideRightPanel();
        };
        document.getElementById('templateType').onchange = function () {
            const val = this.value;
            const txt = val === 'HTML' ? 'HTML' : 'texte';
            document.getElementById('templateContent').placeholder = `Message ${txt}`;
        };
    }

    function sendMail(idx) {
        const c = customers[idx];
        if (!c.email) {
            showError("Veuillez saisir un email valide dans le client.");
            return;
        }
        if (!globalMailTemplate.name || !globalMailTemplate.content) {
            showError("Le template global doit être configuré avant l'envoi.");
            return;
        }
        fetch('send_mail.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: globalMailTemplate.name,
                type: globalMailTemplate.type,
                content: globalMailTemplate.content,
                to: c.email
            })
        }).then(res => res.json())
            .then(data => {
                if (data.success) showSuccess(data.message || 'Mail envoyé !');
                else showError(data.message || "Erreur à l'envoi.");
            }).catch(() => {
            showError("Erreur réseau lors de l'envoi du mail.");
        });
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    renderTable();
});
