// uploadPDF.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebaseConfig";
export const uploadPDFToFirebase = async (blob: Blob, fileName: string) => {
  const storageRef = ref(storage, `contracts/${fileName}`);
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
