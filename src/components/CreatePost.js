import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPost } from "../postService";
import { uploadFile } from "../fileService";
import { serverTimestamp } from "firebase/firestore";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title || !content || !category) {
      alert("모든 필드를 입력하세요!");
      return;
    }
    
    let fileUrl = "";
    let fileName = "";
    if (file) {
      fileUrl = await uploadFile(file);
      fileName = file.name;
    }

    await addPost(title, content, category, fileUrl, fileName, serverTimestamp());
    if (window.confirm("게시글 작성 완료! 게시글 목록으로 이동하시겠습니까?")) {
      navigate("/view-posts");
    }
  };

  return (
    <div>
      <h2>게시글 작성</h2>
      <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="내용" value={content} onChange={(e) => setContent(e.target.value)} />
      <input type="text" placeholder="카테고리" value={category} onChange={(e) => setCategory(e.target.value)} />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleSubmit}>게시글 작성</button>
      <button onClick={() => navigate("/")}>🏠 홈으로</button>
    </div>
  );
}
