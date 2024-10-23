import React, { useContext, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import toast, { Toaster } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";

const PublishFormComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const characterLimit = 200;
  const tagLimit = 10;
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const navigate = useNavigate();
  const { blog_id } = useParams();

  const {
    blog: { banner, title, tags, des, content },
    setEditorState,
    setBlog,
    blog,
  } = useContext(EditorContext);
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    setBlog((prevBlog) => ({ ...prevBlog, title: e.target.value }));
  };

  const handleBlogDesChange = (e) => {
    setBlog((prevBlog) => ({ ...prevBlog, des: e.target.value }));
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleKeyDownFunction = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      let tag = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can add max ${tagLimit} tags`);
      }
      e.target.value = "";
    }
  };

  const handlePublishBlog = async (e) => {
    e.preventDefault();
    if (!title) {
      return toast.error("Write blog title before publishing");
    }
    if (!des || des.length > characterLimit) {
      return toast.error(
        `Please provide a description for your blog. Keep it within ${characterLimit} characters to publish.`
      );
    }

    if (!tags || tags.length === 0) {
      return toast.error(
        "Please enter at least one tag to help us categorize and rank your blog effectively."
      );
    }

    let loadingToast = toast.loading("Publishing...");
    setIsLoading(true);

    let blogObj = { title, banner, des, content, tags, draft: false };
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
        toast.success("Blog created successfully");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen  grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <Toaster />
        <button
          onClick={handleCloseEvent}
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
        >
          <i className="fi fi-rr-circle-xmark"></i>
        </button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>

          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} alt="bannerimage" />
          </div>

          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>

          <p className="font-gelasio line-clamp-2 text-xl mt-4">{des}</p>
        </div>

        <div className="">
          <p className="text-dark-grey mb-2 mt-9 ">Blog Title</p>
          <input
            className="input-box pl-4"
            type="text"
            placeholder="Blog Title"
            defaultValue={title}
            onChange={handleBlogTitleChange}
          />
          <p className="text-dark-grey mb-2 mt-9 ">
            Short description about your blog..
          </p>
          <textarea
            onChange={handleBlogDesChange}
            className="h-40 resize-none leading-7 input-box  pl-4"
            maxLength={characterLimit}
            defaultValue={des}
            onKeyDown={handleTitleKeyDown}
          ></textarea>
          <p className="mt-1 text-dark-grey text-sm text-right ">
            {characterLimit - des.length} Characters Left
          </p>

          <p className="text-dark-grey mb-2 mt-0">
            Topics - (Helps is searching and ranking your blog post)
          </p>
          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              type="text"
              placeholder="Topics"
              className="sticky bg-white top-0 left-0 pl-4 mb-3 input-box focus:bg-white"
              onKeyDown={handleKeyDownFunction}
            />
            {tags.map((tag, index) => (
              <Tag key={index} tagIndex={index} tag={tag} />
            ))}
          </div>
          <p className="mt-1 mb-4 to-dark-grey text-right">
            {tagLimit - tags.length} tags left
          </p>
          <button
            onClick={handlePublishBlog}
            disabled={isLoading}
            className="btn-dark px-8"
          >
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishFormComponent;
