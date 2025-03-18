import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getLatestPosts } from "../postService";
import { List, ListItem, Typography, Container, Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, CardContent, Card } from "@mui/material";


export default function ViewPosts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title"); // 🔥 검색 기준 추가
  const [latestPosts, setLatestPosts] = useState([]); // 🔥 전체 최신 게시글
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 URL에서 카테고리 값 가져오기
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category") || "";

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getLatestPosts();
      setLatestPosts(posts);
    };

    fetchPosts();
  }, []);

  const filteredPosts = latestPosts.filter(post => {
    if (!searchTerm) return true; // 검색어가 없으면 모든 게시글 표시
    const value = post[searchType]?.toLowerCase() || ""; // 검색 기준(title, content, author)에 따라 값 선택
    return value.includes(searchTerm.toLowerCase()); // 검색어 포함 여부 확인
  });

  return (
    <>
      <Container maxWidth="md">
        {/* 🔥 게시글 목록 제목 */}
        <Typography variant="h4" gutterBottom>
          게시글 목록 ({category || "전체"})
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
            <Typography variant="body2">게시글이 없습니다.</Typography>
        )}


        {/* 🔥 홈으로 가기 버튼 */}
        <Button variant="contained" color="primary" fullWidth onClick={() => navigate("/")}>
          🏠 홈으로
        </Button>
      </Container>
    </>
  );
}