// Detecta en qué página está
const currentPage = window.location.pathname;


// Login.html
if (currentPage.includes('login.html')) {
  document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const correo = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';

    try {
      const res = await fetch('http://localhost:3000/users');
      const usuarios = await res.json();

      const usuario = usuarios.find(u => u.email === correo && u.password === password);

      if (usuario && usuario.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        errorMessage.textContent = 'Credenciales incorrectas o acceso no autorizado.';
      }
    } catch (err) {
      errorMessage.textContent = 'Error al conectar con el servidor.';
    }
  });

  window.togglePassword = function () {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('eyeIcon');
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  }
}

// Admin.html
if (currentPage.includes('admin.html')) {
  const apiUrl = 'http://localhost:3000/events';
  const eventsTable = document.getElementById('eventsTableBody');
  const eventForm = document.getElementById('eventForm');
  const eventModal = document.getElementById('eventModal');
  const loadingSpinner = document.getElementById('loadingSpinner');

  let editEventId = null;

  window.showSection = function (id) {
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  window.logout = function () {
    window.location.href = 'login.html';
  }

  function showAlert(msg, isError = false) {
    const alert = document.createElement('div');
    alert.textContent = msg;
    alert.className = isError ? 'alert error' : 'alert success';
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
  }

  function toggleModal(show = true) {
    eventModal.style.display = show ? 'block' : 'none';
  }

  window.showEventModal = function () {
    editEventId = null;
    eventForm.reset();
    document.getElementById('eventModalTitle').textContent = 'Nuevo Evento';
    toggleModal(true);
  }

  window.closeEventModal = function () {
    toggleModal(false);
  }

  async function fetchEvents() {
    loadingSpinner.style.display = 'flex';
    try {
      const res = await fetch(apiUrl);
      const eventos = await res.json();

      eventsTable.innerHTML = '';
      eventos.forEach(evento => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${evento.id}</td>
          <td>${evento.title}</td>
          <td>${evento.date} ${evento.time}</td>
          <td>${evento.location}</td>
          <td>${evento.capacity}</td>
          <td>${evento.registered}</td>
          <td>${evento.status}</td>
          <td>
            <button class="primary-btn" onclick="editEvent(${evento.id})">Editar</button>
            <button class="danger-btn" onclick="deleteEvent(${evento.id})">Eliminar</button>
          </td>
        `;
        eventsTable.appendChild(row);
      });
    } catch (err) {
      showAlert('Error al cargar eventos', true);
    } finally {
      loadingSpinner.style.display = 'none';
    }
  }

  window.editEvent = async function (id) {
    try {
      const res = await fetch(`${apiUrl}/${id}`);
      const evento = await res.json();
      editEventId = id;

      document.getElementById('eventTitle').value = evento.title;
      document.getElementById('eventDate').value = evento.date;
      document.getElementById('eventTime').value = evento.time;
      document.getElementById('eventLocation').value = evento.location;
      document.getElementById('eventCapacity').value = evento.capacity;
      document.getElementById('eventPrice').value = evento.price;
      document.getElementById('eventCategory').value = evento.category;
      document.getElementById('eventImage').value = evento.image || '';
      document.getElementById('eventOrganizer').value = evento.organizer || '';
      document.getElementById('eventDescription').value = evento.description || '';
      document.getElementById('eventRequirements').value = evento.requirements || '';

      document.getElementById('eventModalTitle').textContent = 'Editar Evento';
      toggleModal(true);
    } catch (err) {
      showAlert('Error al cargar evento', true);
    }
  }

  window.deleteEvent = async function (id) {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      showAlert('Evento eliminado con éxito');
      fetchEvents();
    } catch (err) {
      showAlert('Error al eliminar evento', true);
    }
  }

  eventForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
      title: document.getElementById('eventTitle').value.trim(),
      date: document.getElementById('eventDate').value,
      time: document.getElementById('eventTime').value,
      location: document.getElementById('eventLocation').value.trim(),
      capacity: parseInt(document.getElementById('eventCapacity').value, 10),
      price: parseFloat(document.getElementById('eventPrice').value),
      category: document.getElementById('eventCategory').value,
      image: document.getElementById('eventImage').value.trim(),
      organizer: document.getElementById('eventOrganizer').value.trim(),
      description: document.getElementById('eventDescription').value.trim(),
      requirements: document.getElementById('eventRequirements').value.trim(),
      registered: 0,
      status: 'active',
      created_at: new Date().toISOString()
    };

    try {
      const method = editEventId ? 'PATCH' : 'POST';
      const url = editEventId ? `${apiUrl}/${editEventId}` : apiUrl;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showAlert(editEventId ? 'Evento actualizado' : 'Evento creado');
      toggleModal(false);
      fetchEvents();
    } catch (err) {
      showAlert('Error al guardar evento', true);
    }
  });

  // Inicializa eventos al cargar
  window.addEventListener('DOMContentLoaded', fetchEvents);
}
