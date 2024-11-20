if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/SW/service-worker.js')
        .then(registration => {
          console.log('Service Worker registrado con éxito:', registration.scope);
        })
        .catch(error => {
          console.error('Error al registrar el Service Worker:', error);
        });
    });
  }


  // Configuración de IndexedDB para las notificaciones
let db;
const request = indexedDB.open('TaquitosDB', 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log('IndexedDB inicializada');
};

request.onerror = (event) => {
  console.error('Error al abrir IndexedDB:', event.target.errorCode);
};

// Función para obtener notificaciones guardadas
function getNotifications() {
  return new Promise((resolve) => {
    const transaction = db.transaction(['notifications'], 'readonly');
    const store = transaction.objectStore('notifications');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}


// Función para solicitar permiso de notificaciones
function requestNotificationPermission() {
  Push.Permission.request(
    () => console.log("Permiso para notificaciones concedido"),
    () => console.error("Permiso para notificaciones denegado")
  );
}

// Función para guardar notificación en IndexedDB y localStorage
function saveNotificationToDB(title, body, icon) {
  const notification = {
    title: title,
    body: body,
    icon: icon,
    timestamp: Date.now()
  };

  // Guardar en IndexedDB
  const transaction = db.transaction(['notifications'], 'readwrite');
  const store = transaction.objectStore('notifications');
  store.add(notification);

  // Guardar en localStorage
  let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
  notifications.push(notification);
  localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Función para obtener notificaciones guardadas desde localStorage
function getNotificationsFromLocalStorage() {
  return JSON.parse(localStorage.getItem('notifications')) || [];
}

// Declaración de funciones en el ámbito global
function sendNotification(title, body, icon) {
  saveNotificationToDB(title, body, icon); // Guarda en IndexedDB

  Push.create(title, {
    body: body,
    icon: icon,
    timeout: 5000,
    vibrate: [200, 100, 200],
    onClick: () => window.focus()
  });
}

// Funciones para enviar notificaciones específicas
// Notificación de promoción especial
window.sendNotificationPromo = function () {
  sendNotification(
    "¡Promoción Especial en Taquitos Anett!",
    "¡Ordena 3 tacos al pastor y obtén un refresco gratis! Solo por hoy.",
    "images/oferta.png"
  );
};

// Notificación de pedido listo para recoger
window.sendNotificationOrderReady = function (orderNumber) {
  sendNotification(
    "Tu pedido está listo",
    `¡Pedido listo para recoger en Taquitos Anett!`,
    "images/orden.png"
  );
};


// Notificación de recordatorio de hora pico
window.sendNotificationPeakHour = function () {
  sendNotification(
    "¡Hora de los Tacos!",
    "Recuerda que en la hora pico (de 1-3 pm), tenemos ofertas especiales. ¡Te esperamos!",
    "images/hrPico.png"
  );
};

// Función para enviar notificaciones guardadas de forma masiva
window.sendStoredNotifications = function () {
  getNotifications().then((notifications) => {
    notifications.forEach((notif) => {
      Push.create(notif.title, {
        body: notif.body,
        icon: notif.icon,
        timeout: 5000,
        vibrate: [200, 100, 200],
        onClick: () => window.focus()
      });
    });
  });
};



  // Referencia al banner offline
  const offlineBanner = document.getElementById('offlineBanner');

  // Función para actualizar el estado de la conexión
  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineBanner.style.display = 'none';  // Oculta el banner si hay conexión
    } else {
      offlineBanner.style.display = 'block'; // Muestra el banner si está offline
    }
  }
  
  // Escucha los eventos de conexión y desconexión
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Llamada inicial para configurar el estado correcto al cargar la página
  updateOnlineStatus();
  
  
  