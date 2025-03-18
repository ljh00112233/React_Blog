import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCategories, addCategory, deleteCategory } from "../categoryService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { logout } from "../auth";
import { ADMIN_EMAIL } from "../config";
import { getLatestPostsByCategory, getLatestPosts } from "../postService"; // 🔥 최신 게시글 함수 가져오기
import { Button, Container, Typography, Card, CardContent, Grid, List, ListItem, TextField, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [latestPosts, setLatestPosts] = useState([]); // 🔥 전체 최신 게시글
  const [categoryPosts, setCategoryPosts] = useState({}); // 🔥 카테고리별 최신 게시글
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCategoriesAndPosts = async () => {
      const categoryData = await getCategories();
      setCategories(categoryData);

      // 🔥 전체 최신 게시글 불러오기
      const latest = await getLatestPosts();
      setLatestPosts(latest);

      // 🔥 각 카테고리별 최신 게시글 불러오기
      const postsByCategory = {};
      for (const category of categoryData) {
        postsByCategory[category] = await getLatestPostsByCategory(category);
      }
      setCategoryPosts(postsByCategory);
    };

    fetchCategoriesAndPosts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryData = await getCategories();
      setCategories(categoryData);
    };
    fetchCategories();
  }, []);
  
  const handleAddCategory = async () => {
    const newCategory = prompt("추가할 카테고리를 입력하세요:");
    if (!newCategory) return;
    
    const existingCategories = await getCategories();
    if (existingCategories.includes(newCategory)) {
      alert("이미 존재하는 카테고리입니다.");
      return;
    }
    
    await addCategory(newCategory);
    setCategories(await getCategories());
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`'${category}' 카테고리를 삭제하시겠습니까? 모든 게시글도 삭제됩니다.`)) {
      await deleteCategory(category);
      setCategories(await getCategories());
    }
  };

  const filteredCategories = searchTerm.trim() === ""
    ? categories // 🔥 검색어가 비어있으면 전체 카테고리 반환
    : categories.filter(category =>
      category.toLowerCase() === searchTerm.toLowerCase() // 완전 일치 검색
    );

  return (
    <>
      <Container maxWidth="md">
        {/* 🔥 헤더 */}
        <Typography variant="h3" gutterBottom>BLOG</Typography>

        {/* 🔥 로그인 상태 */}
        {user ? (
          <Typography variant="body1">
            현재 로그인한 사용자: {user.displayName} 
            <Button 
              variant="contained" 
              color="secondary" 
              size="small"
              startIcon={<ExitToAppIcon />} 
              onClick={logout} 
              style={{ marginLeft: "10px" }}
            >
              로그아웃
            </Button>
          </Typography>
        ) : (
          <Typography variant="body1" color="error">❌ 로그인되지 않음</Typography>
        )}

        {/* 🔥 사용자 정보 버튼 */}
        {user && (
          <Button variant="outlined" color="primary" onClick={() => navigate("/user-info")} style={{ marginTop: "10px" }}>
            사용자 정보
          </Button>
        )}

        {/* 🔥 로그인/게시글 작성 버튼 */}
        {!user ? (
          <Button variant="contained" color="primary" component={Link} to="/auth" style={{ marginTop: "10px" }}>
            로그인
          </Button>
        ) : (
          <Button variant="contained" color="success" component={Link} to="/create-post" style={{ marginTop: "10px" }}>
            게시글 작성
          </Button>
        )}

        {/* 🔥 최신 게시글 */}
        <Typography variant="h5" style={{ marginTop: "20px" }}>
          📢 전체 최신 게시글
          <Button variant="text" color="primary" onClick={() => navigate(`/view-posts`)}>
            더보기
          </Button>
        </Typography>

        <List>
          {latestPosts.length > 0 ? (
            latestPosts.map(post => (
              <ListItem key={post.id} button onClick={() => navigate(`/post/${post.id}`)}>
                <Card style={{ width: "100%" }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{post.title}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </ListItem>
            ))
          ) : (
            <Typography variant="body2">게시글이 없습니다.</Typography>
          )}
        </List>

        {/* 🔥 카테고리별 최신 게시글 */}
        <Typography variant="h5" style={{ marginTop: "20px" }}>카테고리별 최신 게시글</Typography>

        <Grid container spacing={2}>
          {filteredCategories.map(category => (
            <Grid item xs={12} sm={6} md={4} key={category}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{category}</Typography>
                  <Button variant="text" color="primary" onClick={() => navigate(`/category/${category}`)}>
                    더보기
                  </Button>
                  {isAdmin && (
                    <IconButton size="small" color="error" onClick={() => handleDeleteCategory(category)}>
                      <DeleteIcon />
                    </IconButton>
                  )}

                  <List>
                    {categoryPosts[category]?.length > 0 ? (
                      categoryPosts[category].map(post => (
                        <ListItem key={post.id} button onClick={() => navigate(`/post/${post.id}`)}>
                          {post.title}
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2">이 카테고리에 게시글이 없습니다.</Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 🔥 카테고리 검색 및 추가 */}
        <Typography variant="h5" style={{ marginTop: "20px" }}>카테고리</Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="카테고리 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "10px" }}
        />

        {isAdmin && (
          <Button variant="contained" color="primary" onClick={handleAddCategory} style={{ marginBottom: "10px" }}>
            카테고리 추가
          </Button>
        )}

        {/* 🔥 카테고리 목록 */}
        <List>
          <ListItem>
            <Button variant="contained" color="secondary" onClick={() => navigate(`/view-posts`)}>
              📂 전체 카테고리 보기
            </Button>
          </ListItem>
          {filteredCategories.map(category => (
            <ListItem key={category}>
              <Button variant="outlined" color="primary" onClick={() => navigate(`/category/${category}`)}>
                {category}
              </Button>
              {isAdmin && (
                <IconButton size="small" color="error" onClick={() => handleDeleteCategory(category)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
      </Container>
    </>
  );
}
