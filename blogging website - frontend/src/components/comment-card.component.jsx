import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  const [isReplying, setIsReplying] = useState(false);
  const { commented_by, commentedAt, comment, children } = commentData;
  const {
    personal_info: { fullname, username: commented_by_username, profile_img },
  } = commented_by;
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const { userAuth } = useContext(UserContext);
  const {
    access_token,
    user: { username },
  } = userAuth;
  const {
    blog,
    setBlog,
    blog: {
      comments,
      comments: { results: commentsArr },
      author,
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setTotalParentCommentIsLoaded,
  } = useContext(BlogContext);

  const {
    personal_info: { username: blog_author_username },
  } = author;

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return dateObj.toLocaleDateString("en-US", options);
  };

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("Login first to leave a reply");
    }

    setIsReplying((preval) => !preval);
  };

  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentsArr.startingPoint.childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch (error) {
      startingPoint = undefined;
    }
  };

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);

        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();
      if (parentIndex !== undefined) {
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children.filter((child) => child !== commentData._id);

        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }

      commentsArr.splice(index, 1);
    }

    if (commentData.childrenLevel === 0 && isDelete) {
      setTotalParentCommentIsLoaded((preval) => preval - 1);
    }

    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel === 0 && isDelete ? 1 : 0),
      },
    });
  };

  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCards(index + 1);
  };

  const showReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentsArr[currentIndex].children.length) {
      hideReplies();
      axios
        .post(`${baseURL}/comment/get-replies `, {
          _id: commentsArr[currentIndex]._id,
          skip,
        })
        .then(({ data: { replies } }) => {
          commentsArr[currentIndex].isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel =
              commentsArr[currentIndex].childrenLevel + 1;
            commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }
          setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const deleteComments = (e) => {
    e.target.setAttribute("disabled", true);

    axios
      .post(
        `${baseURL}/comment/delete-comment`,
        { _id: commentData._id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`, // Replace with your actual token
          },
        }
      )
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentsCards(index + 1, true);
      })
      .catch((err) => console.log(err.message));
  };

  const LoadMoreRepliesButton = () => {
    const parentIndex = getParentIndex();
    if (commentsArr[index + 1]) {
      if (
        commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel
      ) {
        if (index - parentIndex < commentsArr[parentIndex]) {
          return (
            <button
              onClick={() => showReplies({ skip: index - parentIndex })}
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2 "
            >
              Load More Replies
            </button>
          );
        }
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentsArr[parentIndex]) {
          return (
            <button
              onClick={() => showReplies({ skip: index - parentIndex })}
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2 "
            >
              Load More Replies
            </button>
          );
        }
      }
    }
  };

  return (
    <div
      className="w-full  bg-grey/60 "
      style={{ paddingLeft: `${leftVal * 10}px` }}
    >
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex justify-between gap-3 items-center mb-8 ">
          {profile_img && (
            <img src={profile_img} className="w-10 h-10 rounded-full" />
          )}
          <p className="line-clamp-1 ">
            {fullname} @{commented_by_username}
          </p>
          <p className="max-w-fit">{formatDate(commentedAt)}</p>
        </div>
        <p className="font-gelasio text-xl ml-3">{comment}</p>

        <div className="flex gap-5 items-center my-5 ">
          {commentData.isReplyLoaded ? (
            <button
              onClick={hideReplies}
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-s-md flex items-center gap-2"
            >
              <i className="fi fi-rr-comment-dots"></i>
              Hide Reply
            </button>
          ) : (
            <button
              onClick={showReplies}
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-s-md flex items-center gap-2"
            >
              <i className="fi fi-rr-comment-dots"></i>
              {children.length} Reply
            </button>
          )}
          <button onClick={handleReplyClick} className="underline">
            Reply
          </button>
          {username === commented_by_username ||
          username === blog_author_username ? (
            <button
              onClick={deleteComments}
              className="p-2 px-3 rounded-full  border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center  "
            >
              <i className="fi fi-rr-trash pointer-events-none"></i>
            </button>
          ) : (
            ""
          )}
        </div>
        {isReplying ? (
          <div>
            <CommentField
              action="Reply"
              index={index}
              replyingTo={commentData._id}
              setIsReplying={setIsReplying}
            />
          </div>
        ) : (
          ""
        )}
      </div>
      <LoadMoreRepliesButton />
    </div>
  );
};

export default CommentCard;
