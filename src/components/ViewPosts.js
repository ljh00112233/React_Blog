// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { getPostsByCategory, deletePost } from "../postService";
// import { auth } from "../firebase";
// import { onAuthStateChanged } from "firebase/auth";

// export default function ViewPosts() {
//   const [posts, setPosts] = useState([]);
//   const [category, setCategory] = useState("");
//   const [loading, setLoading] = useState(true); // 🔥 로딩 상태 추가
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       setLoading(true); // 🔥 데이터 불러오기 시작
//       const postsData = await getPostsByCategory(category);
//       setPosts(postsData);
//       setLoading(false); // 🔥 데이터 로딩 완료
//     };
//     fetchPosts();
//   }, [category]);

//   const handleDelete = async (postId) => {
//     if (!user) {
//       alert("로그인해야 게시글을 삭제할 수 있습니다.");
//       return;
//     }
//     if (window.confirm("게시글을 삭제하시겠습니까?")) {
//       await deletePost(postId);
//       setPosts(posts.filter(post => post.id !== postId));
//     }
//   };

//   const handleDownload = (fileUrl, fileName) => {
//     const link = document.createElement("a");
//     link.href = fileUrl; // Firebase Storage URL 직접 사용
//     link.download = fileName || "downloaded_file";
//     link.target = "_blank"; // 새 창에서 열기
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div>
//       <h2>게시글 목록</h2>
//       {user ? <p>현재 로그인한 사용자: {user.email}</p> : <p>❌ 로그인되지 않음</p>}
//       <input
//         type="text"
//         placeholder="카테고리 입력 (비워두면 전체 게시글)"
//         value={category}
//         onChange={(e) => setCategory(e.target.value)}
//       />
//       <button onClick={() => navigate("/")}>🏠 홈으로</button>
      // {loading ? (
      //   <p>⏳ 게시글 불러오는 중...</p> // 🔥 로딩 상태 표시
      // ) : posts.length === 0 ? (
      //   <p>❌ 게시글이 없습니다.</p> // 🔥 게시글이 없을 경우 메시지 추가
      // ) : (
      // <ul>
//         {posts.map((post) => (
//           <li key={post.id}>
//             <h3>{post.title}</h3>
//             <p>{post.content}</p>
//             <small>카테고리: {post.category}</small>
//             {post.fileUrl && (
//               <div>
//                 <button onClick={() => handleDownload(post.fileUrl, post.fileName)}>
//                   📥 {post.fileName || "파일 다운로드"}
//                 </button>
//               </div>
//             )}
//             {user && (
//               <button onClick={() => handleDelete(post.id)}>🗑️ 삭제</button>
//             )}
//           </li>
//         ))}
//       </ul>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPostsByCategory, deletePost } from "../postService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ViewPosts() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const postsData = await getPostsByCategory(category);
      // 최신 글이 위로 오도록 정렬 (작성 시간이 최신일수록 먼저)
      const sortedPosts = postsData.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(sortedPosts);
      setLoading(false);
    };
    fetchPosts();
  }, [category]);

  const handleDelete = async (postId) => {
    if (!user) {
      alert("로그인해야 게시글을 삭제할 수 있습니다.");
      return;
    }
    if (window.confirm("게시글을 삭제하시겠습니까?")) {
      await deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "downloaded_file";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>게시글 목록</h2>
      {user ? <p>현재 로그인한 사용자: {user.email}</p> : <p>❌ 로그인되지 않음</p>}
      <input
        type="text"
        placeholder="카테고리 입력 (비워두면 전체 게시글)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button onClick={() => navigate("/")}>🏠 홈으로</button>
      {loading ? (
        <p>⏳ 게시글 불러오는 중...</p> // 🔥 로딩 상태 표시
      ) : posts.length === 0 ? (
        <p>❌ 게시글이 없습니다.</p> // 🔥 게시글이 없을 경우 메시지 추가
      ) : (
      <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>카테고리: {post.category}</small>
              <br />
              <small>작성 시간: {new Date(post.createdAt).toLocaleString()}</small>
              {post.fileUrl && (
                <div>
                  <button onClick={() => handleDownload(post.fileUrl, post.fileName)}>
                    📥 {post.fileName || "파일 다운로드"}
                  </button>
                </div>
              )}
              {user && (
                <button onClick={() => handleDelete(post.id)}>🗑️ 삭제</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
