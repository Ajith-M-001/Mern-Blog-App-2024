import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { storage } from "../common/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, Toaster } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import tools from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";

const BlogEditorComponent = () => {
  const [progresspercent, setProgresspercent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const navigate = useNavigate();
  let {
    blog,
    blog: { title, banner, content, tags, des, author },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const { blog_id } = useParams();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: document.getElementById("textEditor"), // Use the holder property
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Let's Write an awesome story",
        })
      );
    }
  }, []);

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    if (!title) {
      return toast.error("Write blog title before saving it as a draft");
    }

    let loadingToast = toast.loading("saving draft...");
    setIsLoading(true);

    // if (textEditor.isReady) {
    //   textEditor.save().then(content => {

    //   })
    // }

    let blogObj = { title, banner, des, content, tags, draft: true };
    try {
      const { data } = await axios.post(
        `${baseURL}/blog/create`,
        { ...blogObj, id: blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (data) {
        toast.success("Blog saved as draft successfully");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleBannerUpload = (e) => {
    let file = e.target.files[0];

    if (!file) return;
    const uniqueFileName = new Date().getTime() + file.name;
    console.log(uniqueFileName);
    const storageRef = ref(storage, `files/${uniqueFileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    const toastId = toast.loading(`Uploading... ${progresspercent}`);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Progress updates
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgresspercent(progress);
      },
      (error) => {
        toast.error("Upload failed! Please try again.", { id: toastId });
        console.error("File upload error:", error);
      },
      () => {
        // File uploaded successfully, get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setBlog({ ...blog, banner: downloadURL });
          toast.success("Upload successful!", { id: toastId });
        });
      }
    );
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyDown === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };


  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("upload a blog banner to publish it");
    }

    if (!title) {
      return toast.error("write blog title to publish it");
    }
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length > 0) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("write something in your blog to publish it");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <>
      <Toaster />
      <nav className="navbar">
        <Link className="flex-none w-10" to={"/"}>
          <img src={logo} alt="logo" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Post"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button onClick={handlePublishEvent} className="btn-dark py-2">
            Publish
          </button>
          <button
            disabled={isLoading}
            onClick={handleSaveDraft}
            className="btn-light py-2"
          >
            Save Draft
          </button>
        </div>
      </nav>
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner" style={{ cursor: "pointer" }}>
                <img
                  className="z-20"
                  src={banner || defaultBanner}
                  alt="blog banner"
                />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              placeholder="Blog Title"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
            <hr className="w-full opacity-10 my-5" />
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditorComponent;
