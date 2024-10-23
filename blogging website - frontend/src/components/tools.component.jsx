//  importing tools

import Header from "@editorjs/header";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Quote from "@editorjs/quote";
import Embed from "@editorjs/embed";
import LinkTool from "@editorjs/link";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Code from "@editorjs/code";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { storage } from "../common/firebase";

const uploadImageByUrl = (e) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (error) {
      reject(error);
    }
  });

  return link.then((url) => {
    return { success: 1, file: url };
  });
};

const uploadImageByFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file selected");
      return;
    }

    const uniqueFileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, `files/${uniqueFileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    const toastId = toast.loading("Uploading...");

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Progress updates (optional: you can also pass this to the UI)
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
      },
      (error) => {
        toast.error("Upload failed! Please try again.", { id: toastId });
        console.error("File upload error:", error);
        reject(error);
      },
      () => {
        // File uploaded successfully, get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          toast.success("Upload successful!", { id: toastId });
          resolve({
            success: 1,
            file: {
              url: downloadURL, // Provide the download URL of the uploaded image
            },
          });
        });
      }
    );
  });
};


const tools = {
  header: {
    class: Header,
    config: { placeholder: "Type Heading...", levels: [2, 3], default: 2 },
  },
  list: { class: List, inlineCode: true },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByUrl,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  quote: { class: Quote, inlineCode: true },
  embed: Embed,
  linkTool: LinkTool,
  marker: Marker,
  inlineCode: InlineCode,
  code: Code,
};

export default tools;
