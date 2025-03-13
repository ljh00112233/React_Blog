import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";

export const addPost = async (postData) => {
  return await addDoc(collection(db, "posts"), {
    ...postData, // 🔥 전달된 모든 데이터 저장 (title, content, category, author 등 포함)
    createdAt: postData.createdAt || new Date(), // 🔥 Firestore에서 시간 자동 추가
  });
};

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
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // 🔥 Timestamp 변환
      };
    });
  } catch (error) {
    console.error("게시글 가져오기 오류:", error.message);
    return [];
  }
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
    content: newContent
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