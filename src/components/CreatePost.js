// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { addPost } from "../postService";
// import { uploadFile } from "../fileService";
// import { auth } from "../firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { serverTimestamp } from "firebase/firestore";

// export default function CreatePost() {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [category, setCategory] = useState("");
//   const [file, setFile] = useState(null);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleSubmit = async () => {
//     if (!title || !content || !category) {
//       alert("모든 필드를 입력하세요!");
//       return;
//     }

//     if (!user) {
//       alert("로그인한 사용자만 게시글을 작성할 수 있습니다.");
//       return;
//     }

//     let fileUrl = "";
//     let fileName = "";
//     if (file) {
//       fileUrl = await uploadFile(file);
//       fileName = file.name;
//     }

//     const postData = {
//       title,
//       content,
//       category,
//       fileUrl,
//       fileName,
//       createdAt: serverTimestamp(),
//       author: {
//         uid: user.uid,
//         nickname: user.displayName || "익명", // 🔥 작성자 닉네임 추가
//         email: user.email
//       }
//     };

//     await addPost(postData);
//     alert("게시글 작성 완료!");
//     navigate("/view-posts");
//   };

//   return (
//     <div>
//       <h2>게시글 작성</h2>
//       {user && <p>작성자: {user.displayName || "익명"}</p>}
//       <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
//       <textarea placeholder="내용" value={content} onChange={(e) => setContent(e.target.value)} />
//       <input type="text" placeholder="카테고리" value={category} onChange={(e) => setCategory(e.target.value)} />
//       <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//       <button onClick={handleSubmit}>게시글 작성</button>
//       <button onClick={() => navigate("/")}>🏠 홈으로</button>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addPost } from "../postService";
import { uploadFile } from "../fileService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { getCategories } from "../categoryService";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryData = await getCategories();
      setCategories(categoryData);
      if (categoryData.length > 0) {
        setCategory(categoryData[0]); // 기본 선택값 설정
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!title || !content || !category) {
      alert("모든 필드를 입력하세요!");
      return;
    }

    if (!user) {
      alert("로그인한 사용자만 게시글을 작성할 수 있습니다.");
      return;
    }

    let fileUrl = "";
    let fileName = "";
    if (file) {
      fileUrl = await uploadFile(file);
      fileName = file.name;
    }

    const postData = {
      title,
      content,
      category,
      fileUrl,
      fileName,
      createdAt: serverTimestamp(),
      author: {
        uid: user.uid,
        nickname: user.displayName || "익명", // 🔥 작성자 닉네임 추가
        email: user.email
      }
    };

    await addPost(postData);
    alert("게시글 작성 완료!");
    navigate("/view-posts");
  };

  return (
    <div>
      <h2>게시글 작성</h2>
      {user && <p>작성자: {user.displayName || "익명"}</p>} {/* 🔥 작성자 닉네임 표시 */}
      <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="내용" value={content} onChange={(e) => setContent(e.target.value)} />
      <label>
        카테고리 : 
        <select value={category} onChange={(e) => setCategory(e.target.value)}> {/* 🔥 드롭다운으로 변경 */}
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </label>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleSubmit}>게시글 작성</button>
      <button onClick={() => navigate("/")}>🏠 홈으로</button>
    </div>
  );
}