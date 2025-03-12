import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";

const categoriesCollection = collection(db, "categories");
const postsCollection = collection(db, "posts");

// 카테고리 추가
export const addCategory = async (categoryName) => {
  try {
    await addDoc(categoriesCollection, { name: categoryName });
  } catch (error) {
    console.error("카테고리 추가 오류:", error);
  }
};

// 모든 카테고리 가져오기
export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categories = querySnapshot.docs.map(doc => doc.data().name); // 🔥 카테고리 이름만 반환
    console.log("불러온 카테고리 목록:", categories); // ✅ 콘솔에서 확인
    return categories || []; // 🔥 undefined 방지
  } catch (error) {
    console.error("카테고리 가져오기 오류:", error);
    return [];
  }
};

// 카테고리 삭제 (해당 카테고리의 게시글도 삭제)
export const deleteCategory = async (categoryName) => {
  try {
    // 해당 카테고리의 모든 게시글 삭제
    const q = query(postsCollection, where("category", "==", categoryName));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (postDoc) => {
      await deleteDoc(doc(db, "posts", postDoc.id));
    });

    // 카테고리 삭제
    const categoryQuery = query(categoriesCollection, where("name", "==", categoryName));
    const categorySnapshot = await getDocs(categoryQuery);
    categorySnapshot.forEach(async (categoryDoc) => {
      await deleteDoc(doc(db, "categories", categoryDoc.id));
    });
  } catch (error) {
    console.error("카테고리 삭제 오류:", error);
  }
};