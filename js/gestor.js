const defaultEvents = [
    {
        id: 1,
        name: "Campeonato de Ajedrez",
        discipline: "Ajedrez",
        date: "2024-08-15",
        time: "14:00",
        location: "Centro Deportivo Municipal",
        maxParticipants: 15,
        currentParticipants: 8,
        description: "Torneo de ajedrez para descubrir nuevos talentos",
        hasSponsorship: true,
        type: "campeonato"
    },
    {
        id: 2,
        name: "Torneo de Tenis de Mesa",
        discipline: "Tenis de Mesa",
        date: "2024-08-22",
        time: "16:00",
        location: "Polideportivo Norte",
        maxParticipants: 12,
        currentParticipants: 12,
        description: "Competencia de tenis de mesa con premios",
        hasSponsorship: true,
        type: "torneo"
    },
    {
        id: 3,
        name: "Encuentro de Tejo",
        discipline: "Tejo",
        date: "2024-08-30",
        time: "18:00",
        location: "Cancha de Tejo La Tradición",
        maxParticipants: 10,
        currentParticipants: 5,
        description: "Evento recreativo de tejo para principiantes",
        hasSponsorship: false,
        type: "recreativo"
    }
];

if (!localStorage.getItem('events')) {
    localStorage.setItem('events', JSON.stringify(defaultEvents));
}

// API Key de MailerSend
const MAILERSEND_API_TOKEN = 'mlsn.b33485bfa2132992febc0cf995265c9cbb1a535e9c60e9c819a5500e1614013d';

class FormManager {
    constructor() {
        this.initializeEvents();
        this.populateEventsList();
        this.populateEventSelect();
    }

    initializeEvents() {
        document.getElementById('subscriptionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubscription(e);
        });

        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContact(e);
        });

        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEventRegistration(e);
        });

        document.getElementById('eventSelect').addEventListener('change', (e) => {
            this.handleEventChange(e);
        });

        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
            input.addEventListener('input', () => this.clearError(input));
        });

        const nameInputs = document.querySelectorAll('input[name="name"]');
        nameInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateName(input));
            input.addEventListener('input', () => this.clearError(input));
        });

        const phoneInput = document.getElementById('participantPhone');
        phoneInput.addEventListener('blur', () => this.validatePhone(phoneInput));
        phoneInput.addEventListener('input', () => this.clearError(phoneInput));
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errorElement = document.getElementById(input.id + 'Error');

        if (!input.value.trim()) {
            if (input.required) {
                this.showError(errorElement, 'El correo electrónico es obligatorio');
                return false;
            }
        } else if (!emailRegex.test(input.value)) {
            this.showError(errorElement, 'Ingrese un correo electrónico válido');
            return false;
        } else {
            this.hideError(errorElement);
            return true;
        }
        return true;
    }

    validateName(input) {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,50}$/;
        const errorElement = document.getElementById(input.id + 'Error');

        if (!input.value.trim()) {
            this.showError(errorElement, 'El nombre es obligatorio');
            return false;
        } else if (!nameRegex.test(input.value)) {
            this.showError(errorElement, 'El nombre debe contener solo letras y espacios (2-50 caracteres)');
            return false;
        } else {
            this.hideError(errorElement);
            return true;
        }
    }

    validatePhone(input) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
        const errorElement = document.getElementById(input.id + 'Error');

        if (input.value.trim() && !phoneRegex.test(input.value)) {
            this.showError(errorElement, 'Ingrese un número de teléfono válido');
            return false;
        } else {
            this.hideError(errorElement);
            return true;
        }
    }

    showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }

    hideError(element) {
        element.style.display = 'none';
    }

    clearError(input) {
        const errorElement = document.getElementById(input.id + 'Error');
        this.hideError(errorElement);
    }

    handleSubscription(e) {
        const formData = new FormData(e.target);
        const data = {
            type: 'subscription',
            name: formData.get('name'),
            email: formData.get('email'),
            interests: formData.getAll('interests'),
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        if (!this.validateSubscriptionForm(data)) {
            return;
        }

        this.saveData('subscriptions', data);
        this.sendSubscriptionEmail(data);
        this.showConfirmation('¡Gracias por suscribirte! Te hemos enviado un email de confirmación.');
        e.target.reset();
    }

    validateSubscriptionForm(data) {
        let isValid = true;

        if (!data.name.trim()) {
            this.showError(document.getElementById('subNameError'), 'El nombre es obligatorio');
            isValid = false;
        }

        if (!data.email.trim()) {
            this.showError(document.getElementById('subEmailError'), 'El email es obligatorio');
            isValid = false;
        }

        return isValid;
    }

    handleContact(e) {
        const formData = new FormData(e.target);
        const data = {
            type: 'contact',
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        if (!this.validateContactForm(data)) {
            return;
        }

        this.saveData('contacts', data);
        this.sendContactEmail(data);
        this.showConfirmation('¡Mensaje enviado! Te responderemos pronto.');
        e.target.reset();
    }

    validateContactForm(data) {
        let isValid = true;

        if (!data.name.trim()) {
            this.showError(document.getElementById('contactNameError'), 'El nombre es obligatorio');
            isValid = false;
        }

        if (!data.email.trim()) {
            this.showError(document.getElementById('contactEmailError'), 'El email es obligatorio');
            isValid = false;
        }

        if (!data.subject.trim()) {
            this.showError(document.getElementById('contactSubjectError'), 'El asunto es obligatorio');
            isValid = false;
        }

        if (!data.message.trim()) {
            this.showError(document.getElementById('contactMessageError'), 'El mensaje es obligatorio');
            isValid = false;
        }

        return isValid;
    }

    handleEventRegistration(e) {
        const formData = new FormData(e.target);
        const selectedEvent = this.getEventById(formData.get('event'));

        const data = {
            type: 'event_registration',
            eventId: formData.get('event'),
            eventName: selectedEvent ? selectedEvent.name : '',
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            shirtSize: formData.get('shirtSize'),
            participantType: formData.get('type'),
            experience: formData.get('experience'),
            comments: formData.get('comments'),
            pin: this.generateUniquePin(),
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        if (!this.validateEventForm(data, selectedEvent)) {
            return;
        }

        if (data.participantType === 'participante' && selectedEvent.currentParticipants >= selectedEvent.maxParticipants) {
            this.showError(document.getElementById('participantTypeError'), 'No hay cupos disponibles para participantes');
            return;
        }

        this.saveData('eventRegistrations', data);

        if (data.participantType === 'participante') {
            this.updateEventParticipants(selectedEvent.id);
        }

        this.sendEventRegistrationEmail(data, selectedEvent);
        this.showConfirmation(`¡Inscripción exitosa! Tu PIN es: ${data.pin}. Enseña este PIN al ingreso del evento. Te hemos enviado un email de confirmación.`);

        e.target.reset();
        document.getElementById('shirtSizeGroup').style.display = 'none';
        this.populateEventsList();
        this.populateEventSelect();
    }

    validateEventForm(data, selectedEvent) {
        let isValid = true;

        if (!data.eventId) {
            this.showError(document.getElementById('eventSelectError'), 'Seleccione un evento');
            isValid = false;
        }

        if (!data.name.trim()) {
            this.showError(document.getElementById('participantNameError'), 'El nombre es obligatorio');
            isValid = false;
        }

        if (!data.email.trim()) {
            this.showError(document.getElementById('participantEmailError'), 'El email es obligatorio');
            isValid = false;
        }

        if (!data.participantType) {
            this.showError(document.getElementById('participantTypeError'), 'Seleccione el tipo de participación');
            isValid = false;
        }

        if (selectedEvent && selectedEvent.hasSponsorship && !data.shirtSize) {
            this.showError(document.getElementById('shirtSizeError'), 'La talla de camiseta es obligatoria para este evento');
            isValid = false;
        }

        return isValid;
    }

    handleEventChange(e) {
        const eventId = e.target.value;
        const event = this.getEventById(eventId);
        const shirtSizeGroup = document.getElementById('shirtSizeGroup');

        if (event && event.hasSponsorship) {
            shirtSizeGroup.style.display = 'block';
            document.getElementById('shirtSize').required = true;
        } else {
            shirtSizeGroup.style.display = 'none';
            document.getElementById('shirtSize').required = false;
        }
    }

    getEventById(id) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        return events.find(event => event.id == id);
    }

    updateEventParticipants(eventId) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const eventIndex = events.findIndex(event => event.id == eventId);

        if (eventIndex !== -1) {
            events[eventIndex].currentParticipants += 1;
            localStorage.setItem('events', JSON.stringify(events));
        }
    }

    generateUniquePin() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    populateEventsList() {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const eventsList = document.getElementById('eventsList');

        eventsList.innerHTML = '';

        events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';

            const isAvailable = event.currentParticipants < event.maxParticipants;
            const statusClass = isAvailable ? 'status-available' : 'status-full';
            const statusText = isAvailable ? 'Cupos Disponibles' : 'Cupos Agotados';

            eventItem.innerHTML = `
                <h4>${event.name}</h4>
                <p><strong>Disciplina:</strong> ${event.discipline}</p>
                <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleDateString('es-ES')} a las ${event.time}</p>
                <p><strong>Lugar:</strong> ${event.location}</p>
                <p><strong>Cupos:</strong> ${event.currentParticipants}/${event.maxParticipants}</p>
                <p><strong>Descripción:</strong> ${event.description}</p>
                ${event.hasSponsorship ? '<p><strong>🎁 Incluye camiseta de marca patrocinadora</strong></p>' : ''}
                <span class="event-status ${statusClass}">${statusText}</span>
            `;

            eventsList.appendChild(eventItem);
        });
    }

    populateEventSelect() {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const eventSelect = document.getElementById('eventSelect');

        eventSelect.innerHTML = '<option value="">Seleccione un evento</option>';

        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} - ${new Date(event.date).toLocaleDateString('es-ES')}`;

            if (event.currentParticipants >= event.maxParticipants) {
                option.textContent += ' (Sin cupos para participantes)';
            }

            eventSelect.appendChild(option);
        });
    }

    saveData(type, data) {
        const existingData = JSON.parse(localStorage.getItem(type) || '[]');
        existingData.push(data);
        localStorage.setItem(type, JSON.stringify(existingData));
    }

    showConfirmation(message) {
        document.getElementById('confirmationMessage').textContent = message;
        document.getElementById('confirmationModal').style.display = 'block';
    }

    // ✅ ENVÍO REAL MailerSend
    async sendSubscriptionEmail(data) {
        const payload = {
            from: {
                email: "no-reply@test-nrw7gym1eokg2k8e.mlsender.net",
                name: "Eventos Deportivos"
            },
            to: [
                {
                    email: data.email,
                    name: data.name
                }
            ],
            subject: "¡Gracias por suscribirte!",
            text: `Hola ${data.name}, gracias por suscribirte.`,
            html: `<p>Hola <strong>${data.name}</strong>, gracias por suscribirte a nuestros eventos deportivos.</p>`
        };
        await this.sendEmail(payload);
    }

    async sendContactEmail(data) {
        const payload = {
            from: {
                email: "no-reply@test-nrw7gym1eokg2k8e.mlsender.net",
                name: "Eventos Deportivos"
            },
            to: [
                {
                    email: "equipo@test-nrw7gym1eokg2k8e.mlsender.net",
                    name: "Equipo Eventos"
                }
            ],
            subject: `${data.subject}`,
            text: `Mensaje de ${data.name} (${data.email}): ${data.message}`,
            html: `<p><strong>Nombre:</strong> ${data.name}</p>
                   <p><strong>Email:</strong> ${data.email}</p>
                   <p><strong>Mensaje:</strong> ${data.message}</p>`
        };
        await this.sendEmail(payload);
    }

    async sendEventRegistrationEmail(data, event) {
        const payload = {
            from: {
                email: "admin@test-nrw7gym1eokg2k8e.mlsender.net",
                name: "Eventos Deportivos"
            },
            to: [
                {
                    email: data.email,
                    name: data.name
                }
            ],
            subject: `Confirmación de Inscripción: ${event.name}`,
            text: `Hola ${data.name}, estás inscrito en ${event.name}. Tu PIN es: ${data.pin}`,
            html: `<p>Hola <strong>${data.name}</strong>,</p>
                   <p>Te confirmamos tu inscripción en <strong>${event.name}</strong>.</p>
                   <p><strong>PIN:</strong> ${data.pin}</p>
                   <p>Gracias por participar.</p>`
        };
        await this.sendEmail(payload);
    }

    async sendEmail(payload) {
        try {
            const response = await fetch("https://api.mailersend.com/v1/email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${MAILERSEND_API_TOKEN}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error('❌ Error al enviar email:', await response.text());
            } else {
                console.log('✅ Email enviado correctamente.');
            }
        } catch (error) {
            console.error('❌ Error al enviar email:', error);
        }
    }
}

function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    window.formManager = new FormManager();
});

window.onclick = function (event) {
    const modal = document.getElementById('confirmationModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
