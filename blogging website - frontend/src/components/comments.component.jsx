import React from "react";
import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import axios from "axios";
import NodataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";

const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

export const fetchComment = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}) => {
  let res;
  await axios
    .post(`${baseURL}/comment/get-blog-comment`, {
      blog_id,
      skip,
    })
    .then(({ data }) => {
      data.map((comment) => {
        comment.childrenLevel = 0;
      });
      setParentCommentCountFun((preValue) => preValue + data.length);
      if (comment_array === null) {
        res = { results: data };
      } else {
        res = { results: [...comment_array, ...data] };
      }
    })
    .catch((error) => {
      console.error("Error fetching comments:", error.message);
    });

  return res;
};

const CommentsContainer = () => {
  const {
    commentWrapper,
    blog,
    setContentWrapper,
    setBlog,
    totalParentCommentIsLoaded,
    setTotalParentCommentIsLoaded,
  } = useContext(BlogContext);
  const { title, comments, activity, _id } = blog;
  const { results: commentArr } = comments;
  const { total_parent_comments } = activity;

  const loadMoreComments = async () => {
    let newCommentsArr = await fetchComment({
      skip: totalParentCommentIsLoaded,
      blog_id: _id,
      setParentCommentCountFun: setTotalParentCommentIsLoaded,
      comment_array: commentArr,
    });

    setBlog({ ...blog, comments: newCommentsArr });
  };

  return (
    <div
      className={`max-sm:w-full fixed ${
        commentWrapper ? "top-0 sm:right-0 " : "top-[100%] sm:right-[-100%]"
      } duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-10 overflow-y-auto overflow-x-hidden`}
    >
      <div className="relative">
        <h1 className="text-xl font-medium">Comments</h1>
        <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
          {title}
        </p>
        <button
          onClick={() => setContentWrapper((prevValue) => !prevValue)}
          className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
        >
          <i className="fi fi-rr-cross-small text-2xl mt-1"></i>
        </button>
      </div>
      <hr className="border-grey my-8 w-[120%] -ml-10" />
      <CommentField action="comment" />

      {commentArr?.length ? (
        commentArr.map((comment, i) => {
          return (
            <AnimationWrapper key={i}>
              <CommentCard
                commentData={comment}
                index={i}
                leftVal={comment.childrenLevel * 4}
              />
            </AnimationWrapper>
          );
        })
      ) : (
        <NodataMessage message="No Comments" />
      )}

      {total_parent_comments > totalParentCommentIsLoaded ? (
        <button
          onClick={loadMoreComments}
          className="text-dark-grey p-2 px-3 hover:bg-grey/90 rounded-md flex items-center gap-2"
        >
          Load more
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default CommentsContainer;
