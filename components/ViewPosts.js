// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { getPostsByCategory, deletePost } from "../postService";
// import { auth } from "../firebase";
// import { onAuthStateChanged } from "firebase/auth";

// export default function ViewPosts() {
//   const [posts, setPosts] = useState([]);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchType, setSearchType] = useState("title"); // 🔥 검색 기준 추가
//   const navigate = useNavigate();
//   const location = useLocation();

//   // 🔥 URL에서 카테고리 값 가져오기
//   const queryParams = new URLSearchParams(location.search);
//   const category = queryParams.get("category") || "";

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       setLoading(true);
//       const postsData = await getPostsByCategory(category);
//       // 최신 글이 위로 오도록 정렬 (작성 시간이 최신일수록 먼저)
//       const sortedPosts = postsData.sort((a, b) => b.createdAt - a.createdAt);
//       setPosts(sortedPosts);
//       setLoading(false);
//     };
//     fetchPosts();
//   }, [category]);

//   // 🔥 선택된 검색 기준에 따라 필터링
//   const filteredPosts = posts.filter((post) => {
//     if (searchType === "title") {
//       return post.title.toLowerCase().includes(searchTerm.toLowerCase());
//     } else if (searchType === "content") {
//       return post.content.toLowerCase().includes(searchTerm.toLowerCase());
//     } else if (searchType === "author") {
//       return (post.author?.nickname || "익명").toLowerCase().includes(searchTerm.toLowerCase());
//     }
//     return true;
//   });

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
//     link.href = fileUrl;
//     link.download = fileName || "downloaded_file";
//     link.target = "_blank";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div>
//       <h2>게시글 목록 ({category || "전체"})</h2>
//       {user ? <p>현재 로그인한 사용자: {user.email}</p> : <p>❌ 로그인되지 않음</p>}

//       <div>
//         <select value={searchType} onChange={(e) => setSearchType(e.target.value)}> {/* 🔥 검색 기준 선택 */}
//           <option value="title">제목</option>
//           <option value="content">내용</option>
//           <option value="author">작성자</option>
//         </select>
//         <input
//           type="text"
//           placeholder="검색어 입력"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       <button onClick={() => navigate("/")}>🏠 홈으로</button>
//       {loading ? (
//         <p>⏳ 게시글 불러오는 중...</p>
//       ) : filteredPosts.length === 0 ? (
//         <p>❌ 검색 결과가 없습니다.</p>
//       ) : (
//       <ul>
//           {filteredPosts.map((post) => (
//             <li key={post.id}>
//               <h3>{post.title}</h3>
//               <p>{post.content}</p>
//               <small>카테고리: {post.category}</small>
//               <small>작성자: {post.author?.nickname || "익명"}</small>
//               <br />
//               <small>작성 시간: {new Date(post.createdAt).toLocaleString()}</small>
//               {post.fileUrl && (
//                 <div>
//                   <button onClick={() => handleDownload(post.fileUrl, post.fileName)}>
//                     📥 {post.fileName || "파일 다운로드"}
//                   </button>
//                 </div>
//               )}
//               {user && (
//                 <button onClick={() => handleDelete(post.id)}>🗑️ 삭제</button>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getPostsByCategory, deletePost } from "../postService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ViewPosts() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title"); // 🔥 검색 기준 추가
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 URL에서 카테고리 값 가져오기
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category") || "";

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

  // 🔥 선택된 검색 기준에 따라 완전 일치 검색 적용, 검색어가 비어있으면 전체 게시글 표시
  const filteredPosts = searchTerm.trim() === "" ? posts : posts.filter((post) => {
    if (searchType === "title") {
      return post.title.toLowerCase() === searchTerm.toLowerCase();
    } else if (searchType === "content") {
      return post.content.toLowerCase() === searchTerm.toLowerCase();
    } else if (searchType === "author") {
      return (post.author?.nickname || "익명").toLowerCase() === searchTerm.toLowerCase();
    }
    return true;
  });

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
      <h2>게시글 목록 ({category || "전체"})</h2>
      {user ? <p>현재 로그인한 사용자: {user.email}</p> : <p>❌ 로그인되지 않음</p>}

      <div>
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}> {/* 🔥 검색 기준 선택 */}
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="author">작성자</option>
        </select>
        <input
          type="text"
          placeholder="검색어 입력"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button onClick={() => navigate("/")}>🏠 홈으로</button>
      {loading ? (
        <p>⏳ 게시글 불러오는 중...</p>
      ) : filteredPosts.length === 0 ? (
        <p>❌ 검색 결과가 없습니다.</p>
      ) : (
      <ul>
          {filteredPosts.map((post) => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>카테고리: {post.category}</small>
              <small>작성자: {post.author?.nickname || "익명"}</small>
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