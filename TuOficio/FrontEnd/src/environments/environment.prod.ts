export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com', // URL de producción
  streamChat: {
    apiKey: 'YOUR_PRODUCTION_STREAM_API_KEY', // ⚠️ Usar variable de entorno en CI/CD
    apiUrl: 'https://your-production-api.com/api/v1/chat'
  },
  firebase: {
    apiKey: "AIzaSyCFosWOyraIAZL1J2aAyFK_CSdqj0UPVJc",
    authDomain: "tu-oficio.firebaseapp.com",
    projectId: "tu-oficio",
    storageBucket: "tu-oficio.firebasestorage.app",
    messagingSenderId: "166489156056",
    appId: "1:166489156056:web:f3005cf7fe8c143189eaad",
    measurementId: "G-TZV3JFD5M8"
  }
};
