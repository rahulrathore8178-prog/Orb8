importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBvgghXpjzHJAVmZ1SlsivNQVN5_fe3n8k",
  authDomain: "orbit-661b7.firebaseapp.com",
  projectId: "orbit-661b7",
  storageBucket: "orbit-661b7.firebasestorage.app",
  messagingSenderId: "591248543459",
  appId: "1:591248543459:web:af20e16794dc34947b3fd6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Orbit";
  const options = {
    body: payload.notification?.body || "",
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});