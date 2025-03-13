import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, addCategory, deleteCategory } from "../categoryService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { logout } from "../auth";
import { ADMIN_EMAIL } from "../config";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
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

  const filteredCategories = searchTerm.trim() === ""
    ? categories // 🔥 검색어가 비어있으면 전체 카테고리 반환
    : categories.filter(category =>
      category.toLowerCase() === searchTerm.toLowerCase() // 완전 일치 검색
    );

  return (
    <div>
      <h1>홈 화면</h1>
      {user ? <p>현재 로그인한 사용자: {user.displayName} <button onClick={logout}>로그아웃</button></p> : <p>❌ 로그인되지 않음</p>}
      {user && (
        <div>
          <button onClick={() => navigate("/user-info")}>사용자 정보</button>
        </div>
      )}
      {user ? '' : <li><Link to="/auth">로그인</Link></li>}
      {user && <li><Link to="/create-post">게시글 작성</Link></li>} {/* 🔥 로그인한 사용자만 게시글 작성 가능 */}
      
      <h2>카테고리</h2>
      <input
        type="text"
        placeholder="카테고리 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isAdmin && (
        <div>
          <button onClick={handleAddCategory}>카테고리 추가</button>
        </div>
      )}
      <ul>
        <li>
          <button onClick={() => navigate(`/view-posts`)}>📂 전체 카테고리 보기</button>
        </li>
        {filteredCategories.map((category) => (
          <li key={category}>
            <button onClick={() => navigate(`/view-posts?category=${category}`)}>{category}</button>
            {isAdmin && <button onClick={() => handleDeleteCategory(category)}>🗑️ 삭제</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
