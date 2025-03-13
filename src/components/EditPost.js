import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPostById, updatePost } from "../postService";
import { auth } from "../firebase";

export default function EditPost() {
  const { postId } = useParams(); // 🔥 URL에서 postId 가져오기
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const fetchedPost = await getPostById(postId);
      if (fetchedPost) {
        console.log("불러온 게시글 데이터:", fetchedPost);
        setPost(fetchedPost);
        setTitle(fetchedPost.title);
        setContent(fetchedPost.content);
      } else {
        alert("게시글을 찾을 수 없습니다.");
        navigate("/");
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleUpdate = async () => {
    if (!auth.currentUser || auth.currentUser.uid !== post.author.uid) {
      alert("본인만 게시글을 수정할 수 있습니다.");
      return;
    }

    if (!title || !content) {
      alert("제목과 내용을 입력하세요!");
      return;
    }

    await updatePost(postId, title, content);
    alert("게시글이 수정되었습니다.");
    navigate(`/view-posts`); // 수정 후 게시글 목록으로 이동
  };

  return (
    <div>
      <h2>게시글 수정</h2>
      {post ? (
        <>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={handleUpdate}>수정 완료</button>
          <button onClick={() => navigate(-1)}>취소</button>
        </>
      ) : (
        <p>게시글을 불러오는 중...</p>
      )}
    </div>
  );
}
