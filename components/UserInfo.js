import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { updateProfile, deleteUser } from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function UserInfo() {
  const [nickname, setNickname] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(auth.currentUser);
    setNickname(auth.currentUser?.displayName || "");
  }, []);

  const handleUpdateNickname = async () => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: nickname });
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { nickname });
      alert("닉네임이 업데이트되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("닉네임 업데이트 오류:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!window.confirm("정말 계정을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.")) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef); // Firestore 데이터 삭제
      await deleteUser(user); // Firebase Authentication 계정 삭제
      alert("계정이 삭제되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 오류:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h2>사용자 정보</h2>
      {user ? (
        <>
          <p>이메일: {user.email}</p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={handleUpdateNickname}>닉네임 수정</button>
          <button onClick={() => navigate("/")}>홈으로 돌아가기</button>
          <button onClick={handleDeleteAccount} style={{ color: "red" }}>회원 탈퇴</button>
        </>
      ) : (
        <p>로그인된 사용자가 없습니다.</p>
      )}
    </div>
  );
}