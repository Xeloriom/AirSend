// modal.js
let deleteAllMode = false;

document.getElementById('cancelDelete').addEventListener('click', () => {
    deleteIndex = null;
    deleteAllMode = false;
    document.getElementById('deleteModal').classList.add('hidden');
});

document.getElementById('confirmDelete').addEventListener('click', () => {
    if(deleteAllMode){
        users = [];
        deleteAllMode = false;
    } else if(deleteIndex !== null){
        users.splice(deleteIndex, 1);
        deleteIndex = null;
    }
    localStorage.setItem('users', JSON.stringify(users));
    renderTable();
    document.getElementById('deleteModal').classList.add('hidden');
});

// Supprimer tous les utilisateurs
document.getElementById('deleteAllBtn').addEventListener('click', () => {
    if(users.length === 0) return alert("Aucun utilisateur à supprimer.");
    deleteAllMode = true;
    document.getElementById('deleteModal').querySelector('h2').textContent = "Supprimer tous les utilisateurs ?";
    document.getElementById('deleteModal').classList.remove('hidden');
});
