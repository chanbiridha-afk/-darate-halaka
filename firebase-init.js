// تهيئة Firebase — المدرسة النموذجية النهضة بالقرآن الكريم
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKlXVKYeztWZ2BDl5gkkCfPzNpuxJcXes",
  authDomain: "halakah-quaran.firebaseapp.com",
  projectId: "halakah-quaran",
  storageBucket: "halakah-quaran.firebasestorage.app",
  messagingSenderId: "482761087558",
  appId: "1:482761087558:web:486a095e24aab41e9e4847",
  measurementId: "G-WK0JS3FCQ8"
};
export { firebaseConfig };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
setPersistence(auth, browserLocalPersistence).catch(()=>{});

// رمز دعوة المدير الإداري (مسيّر المدرسة) — غيّروه من هنا عند الحاجة (حماية أولية لمنع التسجيل العشوائي كمدير)
// حسابات المعلمين لا تُنشأ عبر هذا الرمز؛ ينشئها المدير الإداري مباشرة من لوحة "حسابات المعلمين"
export const ADMIN_INVITE_CODE = "NAHDA-2026";
