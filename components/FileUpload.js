import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "../fileService";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택하세요!");
    const url = await uploadFile(file);
    alert(`파일 업로드 완료! 다운로드 링크: ${url}`);
  };

  return (
    <div>
      <h2>파일 업로드</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>업로드</button>
      <button onClick={() => navigate("/")}>🏠 홈으로</button>
    </div>
  );
};