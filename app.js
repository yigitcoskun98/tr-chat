import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// BURAYA KENDİ AYARLARINI YAPIŞTIR
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
const myAvatar = document.getElementById('myAvatar');
const myNameDisplay = document.getElementById('myNameDisplay');

let currentUser = ""; 
// Engellenen kullanıcıları tarayıcı hafızasında tutuyoruz
let blockedUsers = JSON.parse(localStorage.getItem('blockedUsers')) || [];

// Profil Fotosu (Avatar) Oluşturucu API (İsme göre resim üretir)
function getAvatarUrl(name) {
    return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${name}&backgroundColor=1f2833`;
}

// --- GİRİŞ YAP ---
function joinChat() {
    const enteredName = usernameInput.value.trim();
    if (enteredName === "") return alert("Karanlık tarafa geçmek için bir isim şart!");
    
    currentUser = enteredName;
    myAvatar.src = getAvatarUrl(currentUser);
    myNameDisplay.textContent = currentUser;
    
    loginOverlay.style.display = "none";
    appContainer.style.display = "flex";
}

joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') joinChat(); });

// --- MESAJ GÖNDER ---
async function sendMessage() {
    const text = messageInput.value.trim();
    if (text === "") return; 
    messageInput.value = ""; 

    try {
        await addDoc(collection(db, "messages"), {
            username: currentUser,
            text: text,
            avatar: getAvatarUrl(currentUser),
            timestamp: serverTimestamp()
        });
    } catch (e) { console.error("Hata: ", e); }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// --- KULLANICI ENGELLEME ---
function blockUser(username) {
    if(confirm(`${username} adlı kişiyi engellemek istiyor musun? Mesajlarını bir daha göremezsin.`)) {
        blockedUsers.push(username);
        localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
        alert(`${username} engellendi! Siteni yenilemene gerek yok.`);
        messagesContainer.innerHTML = ""; // Ekranı temizle, engellenenler giderek yeniden yüklesin
    }
}

// --- MESAJ SİLME ---
async function deleteMessage(docId) {
    if(confirm("Bu mesajı silmek istediğine emin misin?")) {
        await deleteDoc(doc(db, "messages", docId));
    }
}

// --- MESAJLARI CANLI ÇEKME ---
const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = ""; 
    
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docId = docSnap.id; // Silme işlemi için ID lazım
        
        // Eğer adam engelliler listesindeyse, ekrana hiç basma (Görmezden gel)
        if (blockedUsers.includes(data.username)) return;

        const isMyMessage = (data.username === currentUser);
        
        // Ana Mesaj Kutusu
        const msgBox = document.createElement('div');
        msgBox.classList.add('message-box');
        if(isMyMessage) msgBox.classList.add('my-message');

        // Avatar
        const avatarImg = document.createElement('img');
        avatarImg.src = data.avatar || getAvatarUrl(data.username);
        avatarImg.classList.add('msg-avatar');

        // Mesaj İçeriği (İsim + Tarih + Yazı)
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('msg-content');

        const headerDiv = document.createElement('div');
        headerDiv.classList.add('msg-header');

        const userSpan = document.createElement('span');
        userSpan.classList.add('msg-username');
        userSpan.textContent = data.username;

        // Tarih ve Saat (Timestamp varsa formatla)
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('msg-time');
        if(data.timestamp) {
            const date = data.timestamp.toDate();
            timeSpan.textContent = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
        }

        const textDiv = document.createElement('div');
        textDiv.classList.add('msg-text');
        textDiv.textContent = data.text; 

        headerDiv.appendChild(userSpan);
        headerDiv.appendChild(timeSpan);
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(textDiv);
        
        msgBox.appendChild(avatarImg);
        msgBox.appendChild(contentDiv);

        // --- AKSİYON BUTONLARI (Sil / Engelle) ---
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('msg-actions');

        if(isMyMessage) {
            // Benim mesajımsa SİL butonu ekle
            const delBtn = document.createElement('button');
            delBtn.classList.add('action-btn', 'delete');
            delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            delBtn.onclick = () => deleteMessage(docId);
            actionsDiv.appendChild(delBtn);
        } else {
            // Başkasının mesajıysa ENGELLE butonu ekle
            const blockBtn = document.createElement('button');
            blockBtn.classList.add('action-btn', 'block');
            blockBtn.innerHTML = '<i class="fa-solid fa-ban"></i>';
            blockBtn.onclick = () => blockUser(data.username);
            actionsDiv.appendChild(blockBtn);
        }

        msgBox.appendChild(actionsDiv);
        messagesContainer.appendChild(msgBox);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
