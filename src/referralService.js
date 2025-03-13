import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// 추천인 코드가 Firestore에 존재하는지 확인하는 함수
export const isReferralCodeValid = async (code) => {
  if (!code) return false; // 추천인 코드가 없으면 false 반환

  const codeRef = doc(db, "referralCodes", code); // 문서 ID가 추천인 코드
  const codeSnapshot = await getDoc(codeRef);

  return codeSnapshot.exists(); // 추천인 코드가 존재하면 true 반환
};
