import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addPost } from "../postService";
import { uploadFile } from "../fileService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { getCategories } from "../categoryService";
import { TextField, Button, Container, Typography, Select, MenuItem, FormControl, InputLabel, Box, Input } from "@mui/material";

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
    <>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>게시글 작성</Typography>
        <FormControl fullWidth>
          <InputLabel>카테고리 선택</InputLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="제목" variant="outlined" fullWidth margin="normal" onChange={(e) => setTitle(e.target.value)} />
        <TextField label="내용" variant="outlined" multiline rows={4} fullWidth margin="normal" onChange={(e) => setContent(e.target.value)} />
        <Box display="flex" alignItems="center" marginTop={2} gap={2}>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && <Typography variant="body2">선택된 파일: {file.name}</Typography>}
        </Box>
        <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
          게시글 작성
        </Button>
        <Button variant="contained" color="primary" fullWidth onClick={() => navigate("/")}>
          🏠 홈으로
        </Button>
      </Container>
    </>
  );
}