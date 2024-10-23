import React, { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import BlogIntraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer, {
  fetchComment,
} from "../components/comments.component";

export const blogStructure = {
  title: "",
  des: "",
  content: {},
  author: { personal_info: {} },
  banner: "",
  publishedAt: "",
  activity: {},
  comments: { results: [] },
  blog_id: "",
  _id: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blog_id } = useParams();
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  let [blog, setBlog] = useState(blogStructure);
  const [similarblogs, setSimilarBlogs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  let [isLikedByUser, setIsLikedByUser] = useState(false);

  const [commentWrapper, setContentWrapper] = useState(false);
  const [totalParentCommentIsLoaded, setTotalParentCommentIsLoaded] =
    useState(0);

  let {
    title,
    des,
    content,
    banner,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    publishedAt,
    _id,
  } = blog;

  const fetchBlog = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/blog/get-blog`, {
        blog_id,
      });

      data.comments = await fetchComment({
        blog_id: data._id,
        setParentCommentCountFun: setTotalParentCommentIsLoaded,
      });

      setBlog(data);
      fetchSimilarBlogs(data.tags);
      // console.log("123", data);
      setIsLoading(false);
    } catch (error) {
      console.log("error", error.message);
      setIsLoading(false);
    }
  };

  const fetchSimilarBlogs = async (tags) => {
    try {
      const { data } = await axios.post(`${baseURL}/blog/search-blogs`, {
        tag: tags[0],
        limit: 6,
        eliminate_blog: blog_id,
      });

      setSimilarBlogs(data);
    } catch (error) {
      console.log("error", error.message);
    }
  };

  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blog_id]);

  const resetState = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setIsLoading(false);
    setIsLikedByUser(false);
    setContentWrapper(false);
    setTotalParentCommentIsLoaded(0);
  };

  return (
    <AnimationWrapper>
      {isLoading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            isLikedByUser,
            setIsLikedByUser,
            commentWrapper,
            setContentWrapper,
            totalParentCommentIsLoaded,
            setTotalParentCommentIsLoaded,
          }}
        >
          <CommentsContainer />
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={banner} alt="blog banner" />
            <div className="mt-12">
              <h2>{title}</h2>
              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-center">
                  <img
                    className="w-12 h-12 rounded-full"
                    src={profile_img}
                    alt="profile img"
                  />
                  <p className="capitalize">
                    {fullname}
                    <br />@
                    <Link className="underline" to={`/user/${author_username}`}>
                      {author_username}
                    </Link>
                  </p>
                </div>
                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published on {new Date(publishedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <BlogIntraction />

            {/* blog content will go over here */}
            <div className="my-12 font-gelasio blog-page-content">
              {content[0]?.blocks.map((block, i) => {
                return (
                  <div key={i} className="my-4 md:my-8">
                    <BlogContent block={block} />
                  </div>
                );
              })}
            </div>

            <BlogIntraction />

            {similarblogs && similarblogs.length ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Similar Blogs
                </h1>

                {similarblogs.map((blog, i) => {
                  let {
                    author: { personal_info },
                  } = blog;
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.08 }}
                    >
                      <BlogPostCard content={blog} author={personal_info} />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : (
              <p>No Similar Blogs</p>
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
