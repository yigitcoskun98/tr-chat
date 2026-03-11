import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// BURAYA KENDİ FİREBASE KODLARINI YAPIŞTIR
const firebaseConfig = {
  apiKey: "AIzaSyAj8mIbtxkXN-B9qh598Tg7SlzNe--JnrU",
  authDomain: "tr-chat-6f1db.firebaseapp.com",
  databaseURL: "https://tr-chat-6f1db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tr-chat-6f1db",
  storageBucket: "tr-chat-6f1db.firebasestorage.app",
  messagingSenderId: "551126375000",
  appId: "1:551126375000:web:ddebca706664ad8ba0882d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML Elemanları
const loginOverlay = document.getElementById('loginOverlay');
const appContainer = document.getElementById('appContainer');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');

let currentUser = ""; // Kullanıcının adını tutacağımız değişken

// --- GİRİŞ YAPMA İŞLEMİ ---
function joinChat() {
    const enteredName = usernameInput.value.trim();
    if (enteredName === "") {
        alert("Lütfen bir kullanıcı adı girin!");
        return;
    }
    
    currentUser = enteredName; // İsmi kaydet
    loginOverlay.style.display = "none"; // Giriş ekranını gizle
    appContainer.style.display = "flex"; // Ana sohbeti göster
}

joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinChat();
});

// --- MESAJ GÖNDERME İŞLEMİ ---
async function sendMessage() {
    const text = messageInput.value.trim();
    if (text === "") return; 

    messageInput.value = ""; 

    try {
        await addDoc(collection(db, "messages"), {
            username: currentUser, // Artık adamın kendi girdiği isim gidiyor
            text: text,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("Hata: ", e);
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// --- MESAJLARI CANLI ÇEKME ---
const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = ""; 
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message-box');
        
        const userDiv = document.createElement('div');
        userDiv.classList.add('username');
        
        // Eğer mesajı yazan bizsek ismimiz farklı renkte görünsün
        if(data.username === currentUser) {
            userDiv.style.color = "#5865F2"; // Kendi adımız mavi olsun
        }
        userDiv.textContent = data.username; 
        
        const textDiv = document.createElement('div');
        textDiv.classList.add('text');
        textDiv.textContent = data.text; 
        
        msgDiv.appendChild(userDiv);
        msgDiv.appendChild(textDiv);
        
        messagesContainer.appendChild(msgDiv);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
