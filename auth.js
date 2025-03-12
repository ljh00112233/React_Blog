import { auth } from "./firebase";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { deleteUser } from "firebase/auth";

const db = getFirestore();
const usersCollection = collection(db, "users");

// 닉네임 중복 확인 함수
const isNicknameTaken = async (nickname) => {
  const q = query(usersCollection, where("nickname", "==", nickname));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; // 닉네임이 존재하면 true 반환
};

// 회원가입 (닉네임 포함, 닉네임 중복 검사)
export const signUp = async (email, password, nickname) => {
  try {
    if (password.length < 6) {
      throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
    }

    // 닉네임 중복 검사
    if (await isNicknameTaken(nickname)) {
      throw new Error("이미 사용 중인 닉네임입니다.");
    }

    // Firebase Authentication 회원가입
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: nickname });

    // Firestore에 사용자 정보 저장
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
      uid: userCredential.user.uid,
      email,
      nickname
    });

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      throw new Error("이미 사용 중인 이메일입니다.");
    } else if (error.code === "auth/weak-password") {
      throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
    }
    console.error("회원가입 오류:", error);
    throw error;
  }
};

// 계정 삭제 함수
export const deleteUserAccount = async () => {
  if (!auth.currentUser) {
    throw new Error("로그인된 사용자가 없습니다.");
  }

  if (!window.confirm("정말 계정을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.")) {
    return;
  }

  try {
    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);

    // Firestore에서 사용자 데이터 삭제
    await deleteDoc(userRef);

    // Firebase Authentication에서 계정 삭제
    await deleteUser(user);
    alert("계정이 삭제되었습니다.");
  } catch (error) {
    console.error("계정 삭제 오류:", error);
    alert("계정 삭제 중 오류가 발생했습니다.");
  }
};

//로그인 함수
export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("로그인 오류:", error);
    throw error;
  }
};

//로그아웃 함수
export const logout = async () => {
  if (window.confirm("로그아웃하시겠습니까?")) {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
  }
};