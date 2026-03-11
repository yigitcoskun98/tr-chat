import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// BURAYA KENDİ FİREBASE AYARLARINI YAPIŞTIR (Aşağıdaki örnek kısımdır, seninkilerle değiştir)
const firebaseConfig = {
  apiKey: "AIzaSyAj8mIbtxkXN-B9qh598Tg7SlzNe--JnrU",
  authDomain: "tr-chat-6f1db.firebaseapp.com",
  databaseURL: "https://tr-chat-6f1db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tr-chat-6f1db",
  storageBucket: "tr-chat-6f1db.firebasestorage.app",
  messagingSenderId: "551126375000",
  appId: "1:551126375000:web:ddebca706664ad8ba0882d"
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML Elemanlarını Seçme
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');

// Kullanıcıya şimdilik rastgele bir isim veriyoruz (Anonim_145 gibi)
const username = "Anonim_" + Math.floor(Math.random() * 1000);

// Mesaj Gönderme İşlemi
async function sendMessage() {
    const text = messageInput.value.trim();
    if (text === "") return; // Boş mesaj gitmesin

    messageInput.value = ""; // Kutuyu temizle

    try {
        await addDoc(collection(db, "messages"), {
            username: username,
            text: text,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("Mesaj gönderilemedi: ", e);
    }
}

// Butona veya Enter'a basınca gönder
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Veritabanını Canlı Olarak Dinleme (Sayfa yenilemeye gerek kalmaz)
const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = ""; // Ekranı temizle
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        
        // GÜVENLİK (XSS KORUMASI): innerHTML KULLANMIYORUZ!
        // Sadece textContent kullanarak kötü amaçlı kodların çalışmasını engelliyoruz.
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message-box');
        
        const userDiv = document.createElement('div');
        userDiv.classList.add('username');
        userDiv.textContent = data.username; 
        
        const textDiv = document.createElement('div');
        textDiv.classList.add('text');
        textDiv.textContent = data.text; // Biri <script> yazsa bile sadece düz yazı olarak görünür, site patlamaz.
        
        msgDiv.appendChild(userDiv);
        msgDiv.appendChild(textDiv);
        
        messagesContainer.appendChild(msgDiv);
    });

    // Yeni mesaj gelince sayfayı en alta kaydır
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
