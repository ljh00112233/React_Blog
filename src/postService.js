import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

export const addPost = async (title, content, category, fileUrl = "", fileName = "", createdAt) => {
  return await addDoc(collection(db, "posts"), {
    title,
    content,
    category,
    fileUrl,
    fileName,
    createdAt, // 🔥 Firestore에서 시간 자동 추가
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

export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, "posts", postId));
  } catch (error) {
    console.error("게시글 삭제 오류:", error.message);
  }
};