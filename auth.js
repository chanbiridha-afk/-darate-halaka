import { auth, db, ADMIN_INVITE_CODE } from "./firebase-init.js";
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile, sendPasswordResetEmail, getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-init.js";

export function watchAuth(cb){
  return onAuthStateChanged(auth, async (user)=>{
    if(!user){ cb(null); return; }
    const udoc = await getDoc(doc(db,"users",user.uid));
    cb({ uid:user.uid, email:user.email, profile: udoc.exists()? udoc.data() : null });
  });
}

// ===== تسجيل مدير الإدارة (مسيّر المدرسة) — يحتاج رمز دعوة =====
export async function signUpAdmin(name, email, password, inviteCode){
  if((inviteCode||"").trim() !== ADMIN_INVITE_CODE){
    throw new Error("رمز دعوة المدير الإداري غير صحيح. تأكدوا من الرمز مع إدارة المدرسة.");
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, {displayName:name});
  await setDoc(doc(db,"users",cred.user.uid), {
    uid:cred.user.uid, name, email, role:"admin", createdAt: new Date().toISOString()
  });
  return cred.user;
}

// ===== تسجيل ولي أمر (ذاتي) =====
export async function signUpParent(name, email, password){
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, {displayName:name});
  await setDoc(doc(db,"users",cred.user.uid), {
    uid:cred.user.uid, name, email, role:"parent", linkedStudentIds:[], createdAt: new Date().toISOString()
  });
  return cred.user;
}

// ===== إنشاء حساب معلّم من طرف المدير الإداري (بدون قطع جلسة المدير) =====
// يستخدم تطبيق Firebase ثانويًا مؤقتًا حتى لا يُسجَّل خروج المدير من حسابه
export async function createTeacherAccount(name, email, tempPassword, assignedGroupIds){
  const secondary = initializeApp(firebaseConfig, "secondary-"+Date.now());
  try{
    const secAuth = getAuth(secondary);
    const cred = await createUserWithEmailAndPassword(secAuth, email, tempPassword);
    await updateProfile(cred.user, {displayName:name});
    await setDoc(doc(db,"users",cred.user.uid), {
      uid:cred.user.uid, name, email, role:"teacher",
      assignedGroupIds: assignedGroupIds||[], createdAt: new Date().toISOString()
    });
    await signOut(secAuth);
    return cred.user.uid;
  } finally {
    await deleteApp(secondary).catch(()=>{});
  }
}

export async function updateTeacherGroups(uid, assignedGroupIds){
  await updateDoc(doc(db,"users",uid), { assignedGroupIds });
}

export async function login(email, password){
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout(){
  await signOut(auth);
}

export async function resetPassword(email){
  await sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid){
  const udoc = await getDoc(doc(db,"users",uid));
  return udoc.exists()? udoc.data() : null;
}

// ربط ولي الأمر بابنه عبر الرقم التعريفي + تاريخ الميلاد (كتحقق ثانٍ)
export async function linkParentToStudent(uid, studentCode, birthDate){
  const q = query(collection(db,"students"), where("code","==", studentCode.trim()));
  const snap = await getDocs(q);
  if(snap.empty) throw new Error("لا يوجد متعلم بهذا الرقم التعريفي.");
  const sdoc = snap.docs[0];
  const sdata = sdoc.data();
  if((sdata.birthDate||"") !== (birthDate||"")){
    throw new Error("تاريخ الميلاد المدخل لا يطابق سجلات المتعلم. تحققوا من التاريخ مع إدارة المدرسة.");
  }
  await updateDoc(doc(db,"students",sdoc.id), { parentUids: arrayUnion(uid) });
  await updateDoc(doc(db,"users",uid), { linkedStudentIds: arrayUnion(sdoc.id) });
  return sdoc.id;
}
