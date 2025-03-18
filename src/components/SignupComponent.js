import { useState, useEffect } from "react";
import { signUp } from "../auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Typography, TextField, Button, Container, Box } from "@mui/material";

export default function SignupComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [referralCode, setReferralCode] = useState(""); // 추천인 코드 저장
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // URL에서 추천인 코드 가져오기

  useEffect(() => {
    const codeFromUrl = searchParams.get("referral");
    if (codeFromUrl) {
      setReferralCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleSignUp = async () => {
    try {
      await signUp(email, password, nickname, referralCode);
      alert("회원가입 성공! 로그인해주세요.");
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>회원가입</Typography>

        {/* 🔥 이메일 입력 */}
        <TextField
          label="이메일"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* 🔥 비밀번호 입력 */}
        <TextField
          label="비밀번호"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* 🔥 닉네임 입력 */}
        <TextField
          label="닉네임"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(e) => setNickname(e.target.value)}
        />

        {/* 🔥 버튼 그룹 */}
        <Box display="flex" flexDirection="column" gap={2} marginTop={2}>
          <Button variant="contained" color="primary" fullWidth onClick={handleSignUp}>
            회원가입
          </Button>
          <Button variant="outlined" color="secondary" fullWidth onClick={() => navigate("/auth")}>
            로그인으로 돌아가기
          </Button>
        </Box>
      </Container>
    </>
  );
}