import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, getCommentsByPostId, addComment, deleteComment, updateComment, deletePost } from "../postService";
import { auth } from "../firebase";
import { ADMIN_EMAIL } from "../config";
import { Typography, TextField, Button, Card, CardContent, Container, List, ListItem, Box } from "@mui/material";

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostAndComments = async () => {
      const fetchedPost = await getPostById(postId);
      if (fetchedPost) {
        setPost({
          ...fetchedPost,
          createdAt: fetchedPost.createdAt ? fetchedPost.createdAt.toDate() : null, // 🔥 Firestore Timestamp 변환
        });
        setComments(await getCommentsByPostId(postId));
      }
    };

    fetchPostAndComments();
  }, [postId]);

  // 🔥 게시글 수정 핸들러 (본인만 가능)
  const handleEdit = async (postId, title, content, postAuthorUid) => {
    if (!user) {
      alert("로그인해야 게시글을 수정할 수 있습니다.");
      return;
    }
  
    if (postAuthorUid !== user.uid) {
      alert("본인만 게시글을 수정할 수 있습니다.");
      return;
    }
  
    // 🔥 새 탭에서 수정 페이지 열기 (수정할 제목과 내용을 쿼리 파라미터로 전달)
    navigate(`/edit-post/${postId}?title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}`);
  };

  const handleDelete = async (postId, postAuthorUid) => {
    if (!user) {
      alert("로그인해야 게시글을 삭제할 수 있습니다.");
      return;
    }
  
    const isAdmin = user.email === ADMIN_EMAIL;
    const isOwner = postAuthorUid === user.uid;
  
    if (!isOwner && !isAdmin) {
      alert("본인 또는 관리자만 게시글을 삭제할 수 있습니다.");
      return;
    }
  
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deletePost(postId);
      alert("게시글이 삭제되었습니다.");
      navigate("/"); // 🔥 삭제 후 홈으로 이동
    }
  };
  
    const handleDownload = (fileUrl, fileName) => {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "downloaded_file";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  const handleAddComment = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인해야 댓글을 작성할 수 있습니다.");
      return;
    }

    if (!commentContent.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }

    await addComment(postId, user, commentContent);
    setComments(await getCommentsByPostId(postId));
    setCommentContent("");
  };

  const handleDeleteComment = async (commentId) => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인해야 댓글을 삭제할 수 있습니다.");
      return;
    }

    try {
      await deleteComment(postId, commentId, user.uid);
      setComments(await getCommentsByPostId(postId));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!user) {
      alert("로그인해야 댓글을 수정할 수 있습니다.");
      return;
    }
  
    if (!editedContent.trim()) {
      alert("수정할 내용을 입력하세요.");
      return;
    }
  
    try {
      await updateComment(postId, commentId, user.uid, editedContent); // 🔥 Firestore 업데이트 실행
      setEditingComment(null); // 수정 모드 해제
      setEditedContent(""); // 수정 내용 초기화
      setComments(await getCommentsByPostId(postId)); // 🔥 Firestore에서 최신 댓글 가져오기
    } catch (error) {
      console.error("댓글 수정 오류:", error);
      alert("댓글 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <Container maxWidth="md">
        {post ? (
          <>
            {/* 🔥 게시글 제목 */}
            <Typography variant="h2" gutterBottom>{post.title}</Typography>

            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }} >
              카테고리: {post.category} | 작성 시간: {post.createdAt ? new Date(post.createdAt).toLocaleString() : "알 수 없음"}
              {post.editedAt && ` (수정됨: ${new Date(post.editedAt.toDate()).toLocaleString()})`}
            </Typography>

            {/* 🔥 파일 다운로드 버튼 추가 */}
            {post.fileUrl && (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => handleDownload(post.fileUrl, post.fileName)}
                sx={{ mb: 2 }} // 🔥 아래쪽 여백 추가
                style={{ marginTop: "10px" }}
              >
                📥 {post.fileName || "파일 다운로드"}
              </Button>
            )}

            {/* 🔥 게시글 내용 */}
            <Typography variant="h4" paragraph>{post.content}</Typography>

            {/* 🔹 수정 버튼 (작성자만 가능) */}
            {user && post.author.uid === user.uid && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => navigate(`/edit-post/${post.id}`)}
                style={{ marginTop: "10px", marginLeft: "10px" }}
              >
                ✏ 수정
              </Button>
            )}

            {/* 🔹 삭제 버튼 (작성자 또는 관리자 가능) */}
            {user && (post.author.uid === user.uid || user.email === ADMIN_EMAIL) && (
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => {
                  if (window.confirm("정말 삭제하시겠습니까?")) {
                    deletePost(postId);
                    navigate("/");
                  }
                }}
                style={{ marginTop: "10px", marginLeft: "10px" }}
              >
                🗑 삭제
              </Button>
            )}

            {/* 🔥 댓글 목록 */}
            <Typography variant="h5" gutterBottom marginTop={3}>댓글</Typography>
            <List>
              {comments.length > 0 ? (
                comments.map(comment => (
                  <ListItem key={comment.id} alignItems="flex-start">
                    <Card style={{ width: "100%" }}>
                      <CardContent>
                        {editingComment === comment.id ? (
                          <Box display="flex" flexDirection="column" gap={1}>
                            {/* 🔥 댓글 수정 입력 필드 */}
                            <TextField
                              variant="outlined"
                              size="small"
                              fullWidth
                              multiline
                              rows={2}
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                            />
                            <Box display="flex" gap={1}>
                              {/* 🔥 수정 완료 버튼 */}
                              <Button variant="contained" color="primary" size="small" onClick={() => handleEditComment(comment.id)}>
                                수정 완료
                              </Button>
                              {/* 🔥 수정 취소 버튼 */}
                              <Button variant="outlined" color="secondary" size="small" onClick={() => setEditingComment(null)}>
                                취소
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            {/* 🔥 댓글 내용 */}
                            <Typography variant="body1">{comment.content}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              작성자: {comment.author.nickname} | 작성일: {new Date(comment.createdAt.seconds * 1000).toLocaleString()}
                              {comment.editedAt && ` (수정됨: ${new Date(comment.editedAt.seconds * 1000).toLocaleString()})`}
                            </Typography>

                            {user?.uid === comment.author.uid && (
                              <Box display="flex" gap={1} marginTop={1}>
                                {/* 🔥 수정 버튼 */}
                                <Button variant="outlined" size="small" onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditedContent(comment.content);
                                }}>
                                  ✏ 수정
                                </Button>
                                {/* 🔥 삭제 버튼 */}
                                <Button variant="contained" color="error" size="small" onClick={() => handleDeleteComment(comment.id)}>
                                  🗑 삭제
                                </Button>
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">댓글이 없습니다.</Typography>
              )}
            </List>

            {/* 🔥 댓글 입력 폼 */}
            <Box marginTop={3}>
              <TextField
                variant="outlined"
                placeholder="댓글을 입력하세요..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
              <Button variant="contained" color="primary" fullWidth onClick={() => handleAddComment()} style={{ marginTop: "10px" }}>
                댓글 작성
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="textSecondary">게시글을 불러오는 중...</Typography>
        )}

        {/* 🔥 홈으로 가기 버튼 */}
        <Button variant="contained" color="secondary" fullWidth onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
          🏠 홈으로
        </Button>
      </Container>
    </>
  );
}
