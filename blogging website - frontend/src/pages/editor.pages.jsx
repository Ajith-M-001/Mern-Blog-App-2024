import React, { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditorComponent from "../components/blog-editor.component";
import PublishFormComponent from "../components/publish-form.component";
import Loader from "../components/loader.component";
import axios from "axios";
import { model } from "mongoose";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const EditorPages = () => {
  const [blog, setBlog] = useState(blogStructure);
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const { blog_id } = useParams();

  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [isLoadig, seteIsLoading] = useState(true);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

  useEffect(() => {
    if (!blog_id) {
      seteIsLoading(false);
    }

    const fetchGetBlog = async () => {
      try {
        const { data } = await axios.post(`${baseURL}/blog/get-blog`, {
          blog_id,
          draft: true,
          mode: "edit",
        });
        setBlog(data);
        seteIsLoading(false);
      } catch (error) {
        console.log("error", error.message);
        seteIsLoading(false);
      }
    };

    fetchGetBlog();
  }, [blog_id]);


  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {access_token === null ? (
        <Navigate to={"/signin"} />
      ) : isLoadig ? (
        <Loader />
      ) : editorState === "editor" ? (
        <BlogEditorComponent />
      ) : (
        <PublishFormComponent />
      )}
    </EditorContext.Provider>
  );
};

export default EditorPages;
