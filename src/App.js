import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthComponent from "./components/AuthComponent";
import CreatePost from "./components/CreatePost";
import Home from "./components/Home";
import ViewPosts from "./components/ViewPosts";
import SignupComponent from "./components/SignupComponent";
import UserInfo from "./components/UserInfo";
import EditPost from "./components/EditPost";
import PostPage from "./components/PostPage";
import CategoryPage from "./components/CategoryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthComponent />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/view-posts" element={<ViewPosts />} />
        <Route path="/signup" element={<SignupComponent />} />
        <Route path="/user-info" element={<UserInfo />} />
        <Route path="/edit-post/:postId" element={<EditPost />} />
        <Route path="/post/:postId" element={<PostPage />} /> {/* 🔥 게시글 상세 페이지 */}
        <Route path="/category/:categoryName" element={<CategoryPage />} /> {/* 🔥 카테고리 페이지 추가 */}
      </Routes>
    </Router>
  );
}

export default App;