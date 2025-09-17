// csv.js
const csvMenuBtn = document.getElementById('csvMenuBtn');
const csvMenu = document.getElementById('csvMenu');

// Toggle menu CSV
csvMenuBtn.addEventListener('click', () => {
    csvMenu.classList.toggle('hidden');
});

// Fermer menu si clic en dehors
window.addEventListener('click', (e) => {
    if(!csvMenuBtn.contains(e.target) && !csvMenu.contains(e.target)){
        csvMenu.classList.add('hidden');
    }
});

// Export CSV
document.getElementById('exportCSV').addEventListener('click', () => {
    if(users.length === 0) return alert("Aucun utilisateur à exporter.");
    const header = ["Prénom", "Nom", "Entreprise", "Email", "Téléphone", "Statut"];
    const rows = users.map(u => [u.firstName, u.lastName, u.company, u.email, u.phone, u.status]);
    let csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Parser CSV
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const header = lines.shift().split(";").map(h => h.trim());
    return lines.map(line => {
        const values = line.split(";").map(val => val.trim());
        let obj = {};
        header.forEach((h, idx) => obj[h] = values[idx] ? values[idx] : "");
        return {
            firstName: obj["Prénom"] || "",
            lastName: obj["Nom"] || "",
            company: obj["Entreprise"] || "",
            email: obj["Email"] || "",
            phone: obj["Téléphone"] || "",
            status: obj["Statut"] || "En attente"
        };
    });
}

// Import CSV
document.getElementById('importCSV').addEventListener('click', () => {
    document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event){
        const usersFromCSV = parseCSV(event.target.result);
        users.push(...usersFromCSV);
        localStorage.setItem('users', JSON.stringify(users));
        renderTable();
        if(autoToggle.checked){
            const start = users.length - usersFromCSV.length;
            usersFromCSV.forEach((user, i) => sendEmail(start + i));
        }
        e.target.value = "";
    };
    reader.readAsText(file);
});
