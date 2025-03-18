import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPostById, updatePost } from "../postService";
import { auth } from "../firebase";
import { Typography, TextField, Button, Container, Box } from "@mui/material";

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
    navigate(-1);
  };

  return (
    <>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>게시글 수정</Typography>

        {post ? (
          <>
            {/* 🔥 제목 입력 */}
            <TextField
              label="제목"
              variant="outlined"
              fullWidth
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* 🔥 내용 입력 */}
            <TextField
              label="내용"
              variant="outlined"
              fullWidth
              multiline
              rows={5}
              margin="normal"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* 🔥 수정 완료 & 취소 버튼 */}
            <Box display="flex" gap={2} marginTop={2}>
              <Button variant="contained" color="primary" fullWidth onClick={handleUpdate}>
                수정 완료
              </Button>
              <Button variant="outlined" color="secondary" fullWidth onClick={() => navigate(-1)}>
                취소
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="textSecondary">게시글을 불러오는 중...</Typography>
        )}
      </Container>
    </>
  );
}
