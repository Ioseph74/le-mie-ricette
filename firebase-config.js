var firebaseConfig = {
    apiKey: "AIzaSyC5S6uMSTZHvUemBSk1PDcsL25OihcbgoE",
    authDomain: "le-mie-ricette-ef1fd.firebaseapp.com",
    projectId: "le-mie-ricette-ef1fd",
    storageBucket: "le-mie-ricette-ef1fd.firebasestorage.app",
    messagingSenderId: "64494547961",
    appId: "1:64494547961:web:b2e81eca3f15722b3dc328"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var ricetteRef = db.collection("ricette");
var auth = firebase.auth();
var googleProvider = new firebase.auth.GoogleAuthProvider();

// ========================================
// AUTENTICAZIONE
// ========================================

function login() {
    auth.signInWithPopup(googleProvider).then(function(result) {
        console.log("Login OK:", result.user.displayName);
        aggiornaUIAuth(result.user);
    }).catch(function(error) {
        console.error("Login error:", error);
        if (error.code === "auth/popup-closed-by-user") return;
        mostraToast(t("auth.error.login") + error.message, "error");
    });
}

function logout() {
    auth.signOut().then(function() {
        console.log("Logout OK");
        aggiornaUIAuth(null);
    }).catch(function(error) {
        console.error("Logout error:", error);
    });
}

function getUtenteCorrente() {
    return auth.currentUser;
}

function isLoggato() {
    return auth.currentUser !== null;
}

// Ascolta cambi di stato auth
function initAuth(callback) {
    auth.onAuthStateChanged(function(user) {
        aggiornaUIAuth(user);
        if (callback) callback(user);
    });
}

function aggiornaUIAuth(user) {
    var loginBtn = document.getElementById("loginBtn");
    var logoutBtn = document.getElementById("logoutBtn");
    var userInfo = document.getElementById("userInfo");
    var userName = document.getElementById("userName");
    var userAvatar = document.getElementById("userAvatar");

    if (!loginBtn) return;

    if (user) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "flex";
        if (userInfo) userInfo.style.display = "flex";
        if (userName) userName.textContent = user.displayName || "User";
        if (userAvatar) userAvatar.src = user.photoURL || "";

        // Mostra elementi solo per utenti loggati
        document.querySelectorAll(".auth-only").forEach(function(el) {
            el.style.display = "";
        });
        document.querySelectorAll(".no-auth-only").forEach(function(el) {
            el.style.display = "none";
        });
    } else {
        loginBtn.style.display = "flex";
        logoutBtn.style.display = "none";
        if (userInfo) userInfo.style.display = "none";

        // Nascondi elementi solo per utenti loggati
        document.querySelectorAll(".auth-only").forEach(function(el) {
            el.style.display = "none";
        });
        document.querySelectorAll(".no-auth-only").forEach(function(el) {
            el.style.display = "";
        });
    }
}

// ========================================
// CRUD DATABASE
// ========================================

async function salvaRicetta(ricetta) {
    if (!auth.currentUser) {
        throw new Error("Authentication required");
    }
    ricetta.dataCreazione = new Date().toISOString();
    ricetta.ultimaModifica = new Date().toISOString();
    ricetta.autore = auth.currentUser.uid;
    var docRef = await ricetteRef.add(ricetta);
    return docRef.id;
}

async function aggiornaRicetta(id, ricetta) {
    if (!auth.currentUser) {
        throw new Error("Authentication required");
    }
    ricetta.ultimaModifica = new Date().toISOString();
    await ricetteRef.doc(id).update(ricetta);
}

async function eliminaRicetta(id) {
    if (!auth.currentUser) {
        throw new Error("Authentication required");
    }
    await ricetteRef.doc(id).delete();
}

async function caricaRicette() {
    var snapshot = await ricetteRef.orderBy("dataCreazione", "desc").get();
    var ricette = [];
    snapshot.forEach(function(doc) {
        ricette.push({id: doc.id, ...doc.data()});
    });
    return ricette;
}

async function caricaRicetta(id) {
    var doc = await ricetteRef.doc(id).get();
    if (doc.exists) {
        return {id: doc.id, ...doc.data()};
    }
    return null;
}

function comprimiImmagine(file, maxWidth, quality) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement("canvas");
                var width = img.width;
                var height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                var base64 = canvas.toDataURL("image/jpeg", quality);
                resolve(base64);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}