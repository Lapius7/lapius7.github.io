// assets/js/main.js

import { db } from './firebase-config.js'; // 拡張子を省略しない
import { collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// --- 定数定義 ---
const BASE_URL = "https://lapius7.github.io/shorturl/";
const URLS_COLLECTION = 'urls';
const LOGS_COLLECTION = 'logs';

// --- 短縮ID生成 ---
function generateShortId(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// --- index.html の処理 ---
// index.html内に直接記述するため、このブロックは不要になりました。
if (document.getElementById('generateBtn')) {
    // このロジックは index.html の <script type="module"> タグ内に移動しました。
}


// --- 404.html のリダイレクト処理 ---
export async function handleRedirect() {
    const path = window.location.pathname.replace('/shorturl/', '').replace(/\/$/, '');
    
    // パスが空、または主要なHTMLファイルであればトップへ
    if (!path || path === 'index.html' || path === '404.html' || path === 'log.html') {
        window.location.replace(BASE_URL);
        return;
    }

    // ログ表示ページへのリクエストか判定
    if (path.endsWith('/+')) {
        const shortId = path.slice(0, -2);
        window.location.replace(`${BASE_URL}log.html?id=${shortId}`);
        return;
    }

    const shortId = path;
    const urlDocRef = doc(db, URLS_COLLECTION, shortId);

    try {
        const docSnap = await getDoc(urlDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // アクセスログを記録
            await logAccess(shortId);
            // 元のURLにリダイレクト
            window.location.replace(data.longUrl);
        } else {
            // ドキュメントが存在しない場合はトップページへ
            console.warn(`Short ID not found: ${shortId}`);
            window.location.replace(BASE_URL);
        }
    } catch (error) {
        console.error("Error getting document:", error);
        window.location.replace(BASE_URL);
    }
}

// --- アクセスログ記録 ---
async function logAccess(shortId) {
    try {
        const logCollectionRef = collection(db, URLS_COLLECTION, shortId, LOGS_COLLECTION);
        await addDoc(logCollectionRef, {
            accessedAt: new Date(),
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'N/A'
        });
    } catch (error) {
        console.error("Error logging access: ", error);
    }
}

// --- log.html のログ表示処理 ---
export async function displayLogs() {
    const params = new URLSearchParams(window.location.search);
    const shortId = params.get('id');

    if (!shortId) {
        document.body.innerHTML = '<h1>エラー: 短縮IDが指定されていません。</h1>';
        return;
    }

    const shortUrlDisplay = document.getElementById('shortUrlDisplay');
    const originalUrlLink = document.getElementById('originalUrlDisplay');
    const logList = document.getElementById('logList');

    shortUrlDisplay.textContent = `${BASE_URL}${shortId}`;

    try {
        // 元のURLを取得
        const urlDocRef = doc(db, URLS_COLLECTION, shortId);
        const urlDocSnap = await getDoc(urlDocRef);
        if (urlDocSnap.exists()) {
            originalUrlLink.href = urlDocSnap.data().longUrl;
            originalUrlLink.textContent = urlDocSnap.data().longUrl;
        } else {
            originalUrlLink.textContent = '元のURLが見つかりませんでした。';
        }

        // ログを取得して表示
        const logCollectionRef = collection(db, URLS_COLLECTION, shortId, LOGS_COLLECTION);
        const q = query(logCollectionRef, orderBy('accessedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="2" style="text-align: center; padding: 20px;">まだアクセスはありません。</td>';
            logList.appendChild(tr);
            return;
        }

        querySnapshot.forEach((doc) => {
            const log = doc.data();
            const tr = document.createElement('tr');
            const accessTime = log.accessedAt.toDate().toLocaleString('ja-JP');
            tr.innerHTML = `<td>${accessTime}</td><td>${log.userAgent}</td>`;
            logList.appendChild(tr);
        });

    } catch (error) {
        console.error("Error fetching logs: ", error);
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="2" style="text-align: center; color: #ff6b6b; padding: 20px;">ログの取得中にエラーが発生しました。</td>';
        logList.appendChild(tr);
    }
}