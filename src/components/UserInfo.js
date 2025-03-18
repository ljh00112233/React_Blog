import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { updateProfile, deleteUser } from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Typography, TextField, Button, Container, Box } from "@mui/material";


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
    <>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>사용자 정보</Typography>

        {user ? (
          <>
            {/* 🔥 이메일 정보 */}
            <Typography variant="body1" gutterBottom>
              <strong>이메일:</strong> {user.email}
            </Typography>

            {/* 🔥 닉네임 입력 필드 */}
            <TextField
              label="닉네임"
              variant="outlined"
              fullWidth
              margin="normal"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            {/* 🔥 버튼 그룹 */}
            <Box display="flex" flexDirection="column" gap={2} marginTop={2}>
              <Button variant="contained" color="primary" fullWidth onClick={handleUpdateNickname}>
                닉네임 수정
              </Button>
              <Button variant="outlined" color="secondary" fullWidth onClick={() => navigate("/")}>
                홈으로 돌아가기
              </Button>
              <Button variant="contained" color="error" fullWidth onClick={handleDeleteAccount}>
                회원 탈퇴
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="textSecondary">로그인된 사용자가 없습니다.</Typography>
        )}
      </Container>
    </>
  );
}