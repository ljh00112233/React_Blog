import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPostsByCategory } from "../postService";
import { Typography, List, ListItem, Card, CardContent, Button, Container, Box, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function CategoryPage() {
  const { categoryName } = useParams(); // 🔥 URL 파라미터에서 카테고리 이름 가져오기
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title"); // 🔥 검색 기준 추가
  const navigate = useNavigate();

  useEffect(() => {
    if (!categoryName) return;

    const fetchPosts = async () => {
      const fetchedPosts = await getPostsByCategory(categoryName);
      setPosts(fetchedPosts);
    };

    fetchPosts();
  }, [categoryName]);

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

  return (
    <>
      <Container maxWidth="md">
      {/* 🔥 카테고리 제목 */}
      <Typography variant="h4" gutterBottom>
        {categoryName} 카테고리
      </Typography>

      {/* 🔥 검색 UI */}
      <Box display="flex" gap={2} alignItems="center" marginBottom={2}>
        {/* 🔹 검색 기준 선택 드롭다운 */}
        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel>검색 기준</InputLabel>
          <Select value={searchType} onChange={(e) => setSearchType(e.target.value)} label="검색 기준">
            <MenuItem value="title">제목</MenuItem>
            <MenuItem value="content">내용</MenuItem>
            <MenuItem value="author">작성자</MenuItem>
          </Select>
        </FormControl>

        {/* 🔹 검색 입력 필드 */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="검색어 입력"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </Box>

      {/* 🔥 게시글 목록 */}
      {filteredPosts.length > 0 ? (
        <List>
          {filteredPosts.map((post) => (
            <ListItem key={post.id} button onClick={() => navigate(`/post/${post.id}`)}>
              <Card style={{ width: "100%" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    {/* 🔹 제목 */}
                    <Typography variant="h6">{post.title}</Typography>

                    {/* 🔹 작성자 (오른쪽 정렬) */}
                    <Typography variant="body2" color="textSecondary">
                      {post.author.nickname}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="textSecondary">
          검색 결과가 없습니다.
        </Typography>
      )}

      {/* 🔥 홈으로 가기 버튼 */}
      <Button variant="contained" color="primary" fullWidth onClick={() => navigate("/")}>
        🏠 홈으로
      </Button>

    </Container>
    </>
  );
}
