// assets/js/firebase-config.js

// Firebase SDK の v9 以降のモジュラースタイルでインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// TODO: ここに自分のFirebaseプロジェクトの設定を貼り付ける
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:XXXXXXXXXXXXXXXXXXXXXX"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);
// Firestoreのインスタンスを取得
const db = getFirestore(app);

// 他のファイルで使えるようにエクスポート
export { db };