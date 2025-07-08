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
  const apiUrl = 'http://localhost:3000/eventos';
  const eventsTable = document.getElementById('eventsTableBody');
  const eventForm = document.getElementById('eventForm');
  const eventModal = document.getElementById('eventModal');
  const loadingSpinner = document.getElementById('loadingSpinner');

  let editEventId = null;

  // Mostrar y ocultar secciones
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
          <td>${evento.nombre || 'Sin título'}</td>
          <td>${evento.fecha}</td>
          <td>${evento.ubicacion || ''}</td>
          <td>${evento.cupos || 0}</td>
          <td>${evento.inscritos || 0}</td>
          <td>${evento.estado || 'Activo'}</td>
          <td>
            <button onclick="editEvent(${evento.id})">Editar</button>
            <button onclick="deleteEvent(${evento.id})">Eliminar</button>
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

      document.getElementById('eventTitle').value = evento.nombre;
      document.getElementById('eventDate').value = evento.fecha;
      document.getElementById('eventLocation').value = evento.ubicacion;
      document.getElementById('eventCapacity').value = evento.cupos;
      document.getElementById('eventOrganizer').value = evento.organizador || '';
      document.getElementById('eventDescription').value = evento.descripcion || '';
      document.getElementById('eventTime').value = evento.hora || '';
      document.getElementById('eventPrice').value = evento.precio || 0;
      document.getElementById('eventImage').value = evento.imagen || '';
      document.getElementById('eventRequirements').value = evento.requisitos || '';
      document.getElementById('eventCategory').value = evento.categoria || '';

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
      nombre: document.getElementById('eventTitle').value.trim(),
      fecha: document.getElementById('eventDate').value,
      ubicacion: document.getElementById('eventLocation').value.trim(),
      cupos: parseInt(document.getElementById('eventCapacity').value, 10),
      organizador: document.getElementById('eventOrganizer').value.trim(),
      descripcion: document.getElementById('eventDescription').value.trim(),
      hora: document.getElementById('eventTime').value,
      precio: parseFloat(document.getElementById('eventPrice').value),
      imagen: document.getElementById('eventImage').value.trim(),
      requisitos: document.getElementById('eventRequirements').value.trim(),
      categoria: document.getElementById('eventCategory').value,
      inscritos: 0,
      estado: 'Activo'
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

  fetchEvents();
}