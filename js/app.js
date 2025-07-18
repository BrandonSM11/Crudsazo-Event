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
      // Solo renderiza filas si el evento tiene un título válido
      if (evento.title) {
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
      }
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
};

// Agregar nuevos eventos al index.html
if (currentPage.includes('index.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/events')
      .then(response => response.json())
      .then(eventos => {
        const eventsSection = document.getElementById('events');

        eventos.forEach(evento => {
          const eventCard = document.createElement('div');
          eventCard.classList.add('event-card');

          eventCard.innerHTML = `
            <div class="event-img">
              <img src="${evento.image || './assets/pronto.png'}" alt="${evento.title}">
            </div>
            <div class="event-info">
              <h3>${evento.title}</h3>
              <p>${evento.description || 'Sin descripción'}</p>
              <a href="./gestor.html" class="button-link" target="_blank">Ver detalles</a>
            </div>
          `;

          eventsSection.appendChild(eventCard);
        });
      })
      .catch(error => console.error('Error al cargar eventos:', error));
  });
}

// Función para mostrar datos en tabla con opción a eliminar
function renderTable(key, tbodyId, columns, enableDelete = false) {
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = '';

  if (data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length + (enableDelete ? 1 : 0);
    td.textContent = 'No hay datos registrados.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  data.forEach(item => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      td.textContent = Array.isArray(item[col]) ? item[col].join(', ') : item[col] || '';
      tr.appendChild(td);
    });

    if (enableDelete) {
      const td = document.createElement('td');
      const btn = document.createElement('button');
      btn.textContent = 'Eliminar';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        if (confirm('¿Deseas eliminar este registro?')) {
          deleteRecord(key, item.id);
        }
      };
      td.appendChild(btn);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });
}

// Función para eliminar un registro por ID y actualizar la tabla
function deleteRecord(key, id) {
  let data = JSON.parse(localStorage.getItem(key) || '[]');
  data = data.filter(item => item.id !== id);
  localStorage.setItem(key, JSON.stringify(data));

  // Re-renderizar la tabla correspondiente
  if (key === 'subscriptions') {
    renderTable('subscriptions', 'suscripcionesTableBody', ['id', 'name', 'email', 'interests', 'date'], true);
  } else if (key === 'registrations') {
    renderTable('registrations', 'inscripcionesTableBody', ['id', 'participantName', 'participantEmail', 'eventName', 'pin', 'status'], true);
  } else if (key === 'messages') {
    renderTable('messages', 'mensajesTableBody', ['id', 'name', 'email', 'message', 'date'], true);
  }
}

// Al cargar la página, renderizamos todas las tablas con opción a eliminar
window.addEventListener('DOMContentLoaded', () => {
  renderTable('subscriptions', 'suscripcionesTableBody', ['id', 'name', 'email', 'interests', 'date'], true);
  renderTable('registrations', 'inscripcionesTableBody', ['id', 'participantName', 'participantEmail', 'eventName', 'pin', 'status'], true);
  renderTable('messages', 'mensajesTableBody', ['id', 'name', 'email', 'message', 'date'], true);
});
