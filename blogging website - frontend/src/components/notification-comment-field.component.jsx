import React, { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentField = ({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setReplying,
  notification_id,
  notificationData,
}) => {
  const [comment, setComment] = useState();

  const { _id: user_id } = blog_author;
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const { notifications, setNotifications } = notificationData;
  const { results, totalDocs } = notifications;
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

  const handleComment = async () => {
    if (!comment.trim()) {
      toast.error("Write something to leave a comment...");
      return; // Return early to stop the execution
    }

    axios
      .post(
        `${baseURL}/comment/add-comment`,
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setReplying(false);
        results[index].reply = { comment, _id: data._id };
        setNotifications({ ...notifications, results });
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
        placeholder="Leave a reply..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button onClick={handleComment} className="btn-dark mt-5 px-10">
        Reply
      </button>
    </>
  );
};

export default NotificationCommentField;
