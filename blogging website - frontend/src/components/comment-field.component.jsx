import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setIsReplying,
}) => {
  const [comment, setComment] = useState("");
  const { userAuth } = useContext(UserContext);
  const { blog, setBlog, setTotalParentCommentIsLoaded } =
    useContext(BlogContext);
  const { _id, author, comments, activity } = blog;
  const { access_token, user } = userAuth;
  const { results: commentsArr } = comments;
  const { total_comments, total_parent_comments } = activity;
  const {
    _id: blog_author,
    personal_info: { fullname, username, profile_img },
  } = author;
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

  const handleComment = async () => {
    if (!access_token) {
      return toast.error("Please Login first to leave a comment");
    }
    if (!comment.trim()) {
      toast.error("Write something to leave a comment...");
      return; // Return early to stop the execution
    }

    axios
      .post(
        `${baseURL}/comment/add-comment`,
        {
          _id,
          blog_author,
          comment,
          replying_to: replyingTo,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setComment("");
        data.commented_by = {
          personal_info: { fullname, username, profile_img },
        };

        let newCommentArr;
        if (replyingTo) {
          commentsArr[index].children.push(data._id);
          data.childrenLevel = commentsArr[index].childrenLevel + 1;
          data.parentIndex = index;
          commentsArr[index].isReplyLoaded = true;
          commentsArr.splice(index + 1, 0, data);
          newCommentArr = commentsArr;
          setIsReplying(false);
        } else {
          data.childrenLevel = 0;
          newCommentArr = [data, ...commentsArr];
        }

        let parentCommentIncrementVal = replyingTo ? 0 : 1;
        setBlog({
          ...blog,
          comments: { ...comments, results: newCommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments:
              total_parent_comments + parentCommentIncrementVal,
          },
        });
        setTotalParentCommentIsLoaded(
          (preValue) => preValue + parentCommentIncrementVal
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a Comment..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button onClick={handleComment} className="btn-dark mt-5 px-10">
        {action}
      </button>
    </>
  );
};

export default CommentField;
