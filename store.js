import { db } from "./firebase-init.js";
import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, documentId, getDocs, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export let DB = { years:[], groups:[], students:[], sessions:[], exams:[], payments:[], teachers:[] };
export let currentUser = null; // {uid, email, profile:{role, name, assignedGroupIds?, linkedStudentIds?}}

let unsubs = [];
function clearListeners(){ unsubs.forEach(u=>u&&u()); unsubs = []; }

function chunk(arr, size){
  const out = [];
  for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size));
  return out;
}

function mergeSnapshotInto(key, snapshots){
  const all = [];
  snapshots.forEach(list=> all.push(...list));
  const seen = new Set();
  DB[key] = all.filter(d=>{ if(seen.has(d.id)) return false; seen.add(d.id); return true; });
}

// يشترك في مجموعة مقسّمة حسب قائمة معرفات (لتفادي حد 30 عنصرًا في where...in)
function listenChunkedIn(colName, field, ids, key, onChange){
  if(!ids || !ids.length){ DB[key] = []; onChange(); return; }
  const groups = chunk(ids, 30);
  const buckets = groups.map(()=>[]);
  groups.forEach((g, idx)=>{
    const qy = field==="__id__"
      ? query(collection(db,colName), where(documentId(), "in", g))
      : query(collection(db,colName), where(field, "in", g));
    const unsub = onSnapshot(qy, snap=>{
      buckets[idx] = snap.docs.map(d=>({id:d.id, ...d.data()}));
      mergeSnapshotInto(key, buckets);
      onChange();
    });
    unsubs.push(unsub);
  });
}

function listenAll(colName, key, onChange, order){
  const qy = order? query(collection(db,colName), orderBy(order)) : collection(db,colName);
  const unsub = onSnapshot(qy, snap=>{
    DB[key] = snap.docs.map(d=>({id:d.id, ...d.data()}));
    onChange();
  });
  unsubs.push(unsub);
}

export function startListeners(user, onChange){
  clearListeners();
  currentUser = user;
  const role = user.profile?.role;

  if(role === "admin"){
    listenAll("years","years",onChange);
    listenAll("groups","groups",onChange);
    listenAll("students","students",onChange);
    listenAll("sessions","sessions",onChange);
    listenAll("exams","exams",onChange);
    listenAll("payments","payments",onChange);
    const unsub = onSnapshot(query(collection(db,"users"), where("role","==","teacher")), snap=>{
      DB.teachers = snap.docs.map(d=>({id:d.id, ...d.data()}));
      onChange();
    });
    unsubs.push(unsub);
  }
  else if(role === "teacher"){
    const myGroups = user.profile.assignedGroupIds || [];
    listenAll("years","years",onChange);
    listenChunkedIn("groups","__id__", myGroups, "groups", onChange);
    // إعادة الاشتراك في الجلسات/الاختبارات/الاشتراكات كلما تغيّرت قائمة متعلمي الفوج
    const rewireStudentDependents = ()=>{
      const ids = DB.students.map(s=>s.id);
      listenChunkedIn("sessions","studentId", ids, "sessions", onChange);
      listenChunkedIn("exams","studentId", ids, "exams", onChange);
    };
    const studentsUnsubWrap = onSnapshot(
      myGroups.length? query(collection(db,"students"), where("groupId","in", myGroups.slice(0,30))) : query(collection(db,"students"), where("groupId","==","__none__")),
      snap=>{
        DB.students = snap.docs.map(d=>({id:d.id, ...d.data()}));
        onChange();
        rewireStudentDependents();
      }
    );
    unsubs.push(studentsUnsubWrap);
  }
  else if(role === "parent"){
    const ids = user.profile.linkedStudentIds || [];
    listenChunkedIn("students","__id__", ids, "students", onChange);
    listenChunkedIn("sessions","studentId", ids, "sessions", onChange);
    listenChunkedIn("exams","studentId", ids, "exams", onChange);
    listenChunkedIn("payments","studentId", ids, "payments", onChange);
  }
}

export function stopListeners(){ clearListeners(); DB = { years:[], groups:[], students:[], sessions:[], exams:[], payments:[], teachers:[] }; }

// ===================== أدوات عامة =====================
function genCode(){
  return "NHD-" + Math.floor(100000 + Math.random()*900000);
}
export function generateUniqueStudentCode(){
  let code;
  do { code = genCode(); } while(DB.students.some(s=>s.code===code));
  return code;
}

// ===================== السنوات الدراسية =====================
export async function addYear(data){ return addDoc(collection(db,"years"), {...data, createdAt:new Date().toISOString()}); }
export async function updateYear(id,data){ return updateDoc(doc(db,"years",id), data); }
export async function deleteYear(id){ return deleteDoc(doc(db,"years",id)); }

// ===================== الأفواج =====================
export async function addGroup(data){ return addDoc(collection(db,"groups"), {...data, createdAt:new Date().toISOString()}); }
export async function updateGroup(id,data){ return updateDoc(doc(db,"groups",id), data); }
export async function deleteGroup(id){ return deleteDoc(doc(db,"groups",id)); }

// ===================== المتعلمون =====================
export async function addStudent(data){
  const code = generateUniqueStudentCode();
  return addDoc(collection(db,"students"), {...data, code, parentUids:[], createdAt:new Date().toISOString()});
}
export async function updateStudent(id,data){ return updateDoc(doc(db,"students",id), data); }
export async function deleteStudent(id){ return deleteDoc(doc(db,"students",id)); }

// ===================== الجلسات =====================
export async function addSession(data){ return addDoc(collection(db,"sessions"), {...data, createdAt:new Date().toISOString(), createdBy: currentUser?.uid||null}); }
export async function deleteSession(id){ return deleteDoc(doc(db,"sessions",id)); }

// ===================== الاختبارات والفروض والتقويم المستمر =====================
export async function addExam(data){ return addDoc(collection(db,"exams"), {...data, createdAt:new Date().toISOString(), createdBy: currentUser?.uid||null}); }
export async function updateExam(id,data){ return updateDoc(doc(db,"exams",id), data); }
export async function deleteExam(id){ return deleteDoc(doc(db,"exams",id)); }

// ===================== الاشتراكات =====================
export async function addPayment(data){ return addDoc(collection(db,"payments"), {...data, createdAt:new Date().toISOString(), recordedBy: currentUser?.uid||null}); }
export async function updatePayment(id,data){ return updateDoc(doc(db,"payments",id), data); }
export async function deletePayment(id){ return deleteDoc(doc(db,"payments",id)); }
