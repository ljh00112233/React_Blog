import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadFile = async (file) => {
  const storageRef = ref(storage, `${file.name}`);
  
  // 🔥 파일을 업로드할 때 다운로드를 강제하기 위해 `contentDisposition` 설정
  const metadata = {
    contentType: file.type,
    contentDisposition: "attachment", // 브라우저에서 바로 열리지 않고 다운로드됨
  };

  await uploadBytes(storageRef, file, metadata);
  return await getDownloadURL(storageRef);
};