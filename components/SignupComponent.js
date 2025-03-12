import { useState } from "react";
import { signUp } from "../auth";
import { useNavigate } from "react-router-dom";

export default function SignupComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      await signUp(email, password, nickname);
      alert("회원가입 성공! 로그인해주세요.");
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <input type="email" placeholder="이메일" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} />
      <input type="text" placeholder="닉네임" onChange={(e) => setNickname(e.target.value)} />
      <button onClick={handleSignUp}>회원가입</button>
      <button onClick={() => navigate("/auth")}>로그인으로 돌아가기</button>
    </div>
  );
}