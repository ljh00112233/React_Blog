import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, getDoc, updateDoc, orderBy, limit } from "firebase/firestore";

export const addPost = async (postData) => {
  console.log("🔥 Firestore에 저장할 postData:", postData); // 🔥 postData 확인

  if (!postData.title || !postData.content || !postData.category || !postData.author) {
    console.error("🔥 postData에 필수 값이 없습니다!", postData);
    throw new Error("게시글 데이터가 올바르지 않습니다.");
  }

  return await addDoc(collection(db, "posts"), {
    ...postData,
    createdAt: postData.createdAt || new Date() // 🔥 Firestore에서 시간 자동 추가
  });
};

// 🔥 특정 카테고리의 게시글 목록 가져오기 (제목만 포함)
export const getPostsByCategory = async (categoryName) => {
  let q;
  if (categoryName) {
    q = query(collection(db, "posts"), where("category", "==", categoryName));
  } else {
    q = query(collection(db, "posts")); // 전체 게시글 가져오기
  }

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();

      // 🔥 undefined 체크 추가
      return {
        id: doc.id,
        title: data.title || "제목 없음",
        content: data.content || "내용 없음",
        category: data.category || "카테고리 없음",
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // 🔥 Timestamp 변환
        author: data.author || { uid: "unknown", nickname: "알 수 없음", email: "" }
      };
    });
  } catch (error) {
    console.error("🔥 게시글 가져오기 오류:", error.message);
    return [];
  }
};

// 🔥 특정 게시글 가져오기
export const fetchPostDetails = async (postId) => {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) return null;

  // 🔥 댓글 가져오기
  const comments = await getCommentsByPostId(postId);

  return {
    id: postSnap.id,
    ...postSnap.data(),
    comments // 🔥 댓글 포함
  };
};

// 🔥 특정 게시글의 댓글 가져오기
export const getCommentsByPostId = async (postId) => {
  const q = query(
    collection(db, `posts/${postId}/comments`),
    orderBy("createdAt", "asc") // 🔥 오래된 댓글부터 정렬
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 🔥 댓글 추가하기
export const addComment = async (postId, user, content) => {
  await addDoc(collection(db, `posts/${postId}/comments`), {
    author: {
      uid: user.uid,
      nickname: user.displayName || "익명",
      email: user.email
    },
    content,
    createdAt: new Date()
  });
};

// 🔥 댓글 삭제하기 (본인만 가능)
export const deleteComment = async (postId, commentId, userUid) => {
  const commentRef = doc(db, `posts/${postId}/comments/${commentId}`);
  const commentSnap = await getDoc(commentRef);

  if (!commentSnap.exists()) {
    throw new Error("해당 댓글을 찾을 수 없습니다."); // 🔥 댓글이 존재하지 않으면 삭제 불가
  }

  if (commentSnap.data().author.uid !== userUid) {
    throw new Error("본인만 댓글을 삭제할 수 있습니다."); // 🔥 작성자가 아니면 삭제 불가
  }

  await deleteDoc(commentRef);
  return true;
};

// 🔥 댓글 수정하기 (본인만 가능)
export const updateComment = async (postId, commentId, userUid, newContent) => {
  const commentRef = doc(db, `posts/${postId}/comments/${commentId}`);
  const commentSnap = await getDoc(commentRef);

  if (!commentSnap.exists()) {
    throw new Error("해당 댓글을 찾을 수 없습니다.");
  }

  if (commentSnap.data().author.uid !== userUid) {
    throw new Error("본인만 댓글을 수정할 수 있습니다.");
  }

  await updateDoc(commentRef, {
    content: newContent,
    editedAt: new Date(), // 🔥 Firestore에 수정 시간 저장
  });

  return true;
};

// 🔥 게시글 수정 가능 여부 확인 (본인이 작성한 글인지 확인)
export const getPostById = async (postId) => {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) return null;
  return { id: postSnap.id, ...postSnap.data() };
};

// 🔥 게시글 수정 함수 (본인만 가능)
export const updatePost = async (postId, newTitle, newContent) => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    title: newTitle,
    content: newContent,
    editedAt: new Date(),
  });
};

// 🔥 게시글 삭제 가능 여부 확인 (본인만 가능, 관리자 제외)
export const canDeletePost = async (postId, userUid) => {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) return false; // 게시글이 존재하지 않으면 false
  return postSnap.data().author.uid === userUid; // 작성자 UID와 현재 사용자 UID 비교
};

// 🔥 게시글 삭제 함수 (본인만 가능)
export const deletePost = async (postId) => {
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
};

// 🔥 특정 카테고리의 최신 게시글 5개 가져오기
export const getLatestPostsByCategory = async (category) => {
  const q = query(
    collection(db, "posts"),
    where("category", "==", category),
    orderBy("createdAt", "desc"), // 🔥 최신순 정렬
    limit(5) // 🔥 최대 5개만 가져오기
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 🔥 전체 최신 게시글 5개 가져오기
export const getLatestPosts = async () => {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllPosts = async () => {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc") // 🔥 최신순 정렬 (전체 게시글)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};