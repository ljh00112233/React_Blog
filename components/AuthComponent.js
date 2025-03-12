import { useState } from "react";
import { login } from "../auth";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = 'admin@admin.admin';
const ADMIN_PASSWORD = 'admin1234';

export default function AuthComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // 🔥 관리자 계정인지 확인 후 로그인 시도
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        await login(ADMIN_EMAIL, ADMIN_PASSWORD);
        alert(`관리자로 로그인 성공!`);
      } else {
        await login(email, password);
        alert(`로그인 성공!`);
      }
      navigate("/");
    } catch (error) {
      alert(`로그인 실패: 이메일 또는 비밀번호를 확인하세요.`);
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <input
        type="email"
        placeholder="이메일"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>로그인</button>
      <button onClick={() => navigate("/signup")}>회원가입</button>
      <button onClick={() => navigate("/")}>🏠 홈으로</button>
    </div>
  );
}