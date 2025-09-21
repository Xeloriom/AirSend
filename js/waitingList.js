function waitlistApp() {
    return {
        PEOPLE_KEY: 'airsend_people_count',
        EMAILS_KEY: 'airsend_emails',
        peopleCount: 45,
        popPeople: false,
        helpMsg: '',
        error: false,
        success: false,
        loading: false,
        email: '',

        // Charger le compteur et la liste des emails depuis localStorage
        init() {
            const savedCount = Number(localStorage.getItem(this.PEOPLE_KEY));
            if (!Number.isNaN(savedCount) && savedCount > 0) this.peopleCount = savedCount;

            const savedEmails = JSON.parse(localStorage.getItem(this.EMAILS_KEY) || '[]');
            this.savedEmails = Array.isArray(savedEmails) ? savedEmails : [];
        },

        // Vérifier validité de l'email
        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
        },

        // Ajouter email et mettre à jour compteur
        addEmail(email) {
            if (!this.savedEmails.includes(email)) {
                this.savedEmails.push(email);
                localStorage.setItem(this.EMAILS_KEY, JSON.stringify(this.savedEmails));
                this.peopleCount++;
                localStorage.setItem(this.PEOPLE_KEY, this.peopleCount);
                this.popPeople = false;
                this.$nextTick(() => { this.popPeople = true; });
                return true; // succès
            }
            return false; // existe déjà
        },

        handleSubmit() {
            this.error = false;
            this.success = false;
            this.helpMsg = '';
            const email = this.email.trim();

            if (!email) {
                this.error = true;
                this.helpMsg = 'Veuillez saisir votre adresse e-mail.';
                this.shakeBtn();
                return;
            }

            if (!this.isValidEmail(email)) {
                this.error = true;
                this.helpMsg = 'Adresse e-mail invalide.';
                this.shakeBtn();
                return;
            }

            this.loading = true;

            setTimeout(() => { // Simuler traitement
                const added = this.addEmail(email);
                if (added) {
                    this.success = true;
                    this.helpMsg = 'Merci ! Vous êtes inscrit.';
                    this.bellAnimation('success');
                } else {
                    this.error = true;
                    this.helpMsg = 'Cet email existe déjà.';
                    this.bellAnimation('error');
                }
                this.loading = false;
                this.email = '';
                setTimeout(() => { this.success = false; this.error = false; }, 1200);
            }, 300);
        },

        // Animations bouton
        shakeBtn() {
            const btn = document.querySelector('button[type="submit"]');
            if (btn) {
                btn.classList.add('animate-shake', 'bg-red-500', 'text-white');
                setTimeout(() => btn.classList.remove('animate-shake'), 400);
            }
        },

        // Animation cloche
        bellAnimation(type) {
            const bell = document.querySelector('button[type="submit"] svg');
            if (!bell) return;
            bell.classList.remove('animate-bell-success', 'animate-bell-error');
            void bell.offsetWidth;
            bell.classList.add(type === 'success' ? 'animate-bell-success' : 'animate-bell-error');
        }
    }
}