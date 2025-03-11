import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, addCategory, deleteCategory } from "../categoryService";
import { auth } from "../firebase";
import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { Link } from "react-router-dom";
import { logout } from "../auth";

const ADMIN_EMAIL = "admin@admin.admin"; // 🔥 관리자 이메일 설정

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryData = await getCategories();
      setCategories(categoryData);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const newCategory = prompt("추가할 카테고리를 입력하세요:");
    if (!newCategory) return;
    
    // 카테고리 중복 확인
    const existingCategories = await getCategories();
    if (existingCategories.includes(newCategory)) {
      alert("이미 존재하는 카테고리입니다.");
      return;
    }
    
    await addCategory(newCategory);
    setCategories(await getCategories());
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`'${category}' 카테고리를 삭제하시겠습니까? 모든 게시글도 삭제됩니다.`)) {
      await deleteCategory(category);
      setCategories(await getCategories());
    }
  };

  const handleVerifyPassword = async () => {
    const password = prompt("비밀번호를 입력하세요:");
    if (!password) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      navigate("/user-info");
    } catch (error) {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div>
      <h1>홈 화면</h1>
      {user ? <p>현재 로그인한 사용자: {user.displayName} <button onClick={logout}>로그아웃</button></p> : <p>❌ 로그인되지 않음</p>}
      {user && (
        <div>
          <button onClick={handleVerifyPassword}>사용자 정보</button>
        </div>
      )}
      {user ? '' : <li><Link to="/auth">로그인</Link></li>}
      <li><Link to="/create-post">게시글 작성</Link></li>
      <h2>카테고리</h2>
      {isAdmin && (
        <div>
          <button onClick={handleAddCategory}>카테고리 추가</button>
        </div>
      )}
      <ul>
        {categories.map((category) => (
          <li key={category}>
            <button onClick={() => navigate(`/view-posts?category=${category}`)}>{category}</button>
            {isAdmin && <button onClick={() => handleDeleteCategory(category)}>🗑️ 삭제</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}