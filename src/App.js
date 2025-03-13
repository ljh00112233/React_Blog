import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthComponent from "./components/AuthComponent";
import CreatePost from "./components/CreatePost";
import Home from "./components/Home";
import ViewPosts from "./components/ViewPosts";
import SignupComponent from "./components/SignupComponent";
import UserInfo from "./components/UserInfo";
import EditPost from "./components/EditPost";

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
      </Routes>
    </Router>
  );
}

export default App;