import { useState } from "react";
import { login } from "../auth";
import { useNavigate } from "react-router-dom";
import { isReferralCodeValid } from "../referralService"; // 추천인 코드 검증 함수 가져오기

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
  
  // 🔥 회원가입 버튼 클릭 시 추천인 코드 검증 후 이동
  const handleSignUpClick = async () => {
    const referralCode = prompt("추천인 코드를 입력하세요:");
    if (!referralCode) {
      alert("추천인 코드를 입력해야 합니다.");
      return;
    }

    try {
      // Firestore에서 추천인 코드 검증
      const isValid = await isReferralCodeValid(referralCode);
      if (!isValid) {
        alert("유효하지 않은 추천인 코드입니다. 다시 입력해주세요.");
        return; // 🚫 회원가입 페이지로 이동하지 않음
      }

      // ✅ 유효한 추천인 코드일 경우에만 이동
      navigate(`/signup?referral=${referralCode}`);

    } catch (error) {
      console.error("추천인 코드 확인 중 오류 발생:", error);
      alert("추천인 코드 확인 중 오류가 발생했습니다. 다시 시도해주세요.");
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
      <button onClick={handleSignUpClick}>회원가입</button>
      <button onClick={() => navigate("/")}>🏠 홈으로</button>
    </div>
  );
}