import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import NotificationCommentField from "./notification-comment-field.component";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCard = ({ data, index, notificationState }) => {
  const {
    user,
    type,
    replied_on_comment,
    blog,
    comment,
    createdAt,
    _id: notification_id,
    reply,
    seen,
  } = data;
  const {
    personal_info: { profile_img, username, fullname },
  } = user;
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const blog_id = blog?.blog_id;
  const _id = blog?._id;
  const title = blog?.title;

  const { notifications, setNotifications } = notificationState;
  const { results, totalDocs } = notifications;

  const { userAuth } = useContext(UserContext);
  const { user: author_user, access_token } = userAuth;
  const {
    profile_img: author_profile_pic,
    fullname: author_fullname,
    username: author_username,
  } = author_user;

  // console.log(data);
  // console.log(title);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const [isReplying, setIsReplying] = useState(false);

  const handleReplyClick = () => {
    setIsReplying((preval) => !preval);
  };

  const handleDelete = (comment_id, type, target) => {
    target.setAttribute("disabled", true);
    axios
      .post(
        `${baseURL}/comment/delete-comment`,
        { _id: comment_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        if (type === "comment") {
          results.splice(index, 1);
        } else {
          delete results[index].reply;
        }

        target.removeAttribute("disabled");
        setNotifications({
          ...notifications,
          results,
          totalDocs: totalDocs - 1,
          deleteDocCount: notifications.deleteDocCount + 1,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log(seen);

  return (
    <div
      className={`p-6 border-b border-grey ${
        seen ? "" : "border-l-4 border-blue-500"
      }`}
    >
      <div className="flex gap-5 mb-3">
        <img
          className="w-24 h-24 flex-none rounded-full"
          src={profile_img}
          alt="profile img"
        />
        <div className="w-full">
          <h1 className="font-medium text-xl text-dark-grey">
            <span className="lg:inline-block hidden capitalize">
              {fullname}
            </span>
            <Link
              className="mx-1 text-black underline"
              to={`/user/${username}`}
            >
              @{username}
            </Link>
            <span className="font-normal">
              {type === "like"
                ? "liked your blog"
                : type === "comment"
                ? "commented on"
                : "replied on"}
            </span>
          </h1>
          {type === "reply" ? (
            <div className="p-4 mt-4 rounded-md bg-grey ">
              <p>{replied_on_comment.comment}</p>
            </div>
          ) : (
            <Link
              className="font-medium text-dark-grey hover:underline line-clamp-1"
              to={`/blog/${blog_id}`}
            >{` "${title}" `}</Link>
          )}
        </div>
      </div>

      {type !== "like" ? (
        <p className="ml-14 pl-5 font-gelasio text-xl my-5">
          {comment?.comment}
        </p>
      ) : (
        ""
      )}

      <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8 ">
        <p>{new Date(createdAt).toLocaleDateString("en-US", options)}</p>
        {type !== "like" ? (
          <>
            {!reply ? (
              <button
                className="underline hover:text-black"
                onClick={handleReplyClick}
              >
                Reply
              </button>
            ) : (
              "you Replied"
            )}
            <button
              className="underline hover:text-black "
              onClick={(e) => handleDelete(comment._id, "comment", e.target)}
            >
              Delete
            </button>
          </>
        ) : (
          ""
        )}
      </div>

      {isReplying ? (
        <div className="mt-8">
          <NotificationCommentField
            _id={_id}
            blog_author={user}
            index={index}
            replyingTo={comment._id}
            notification_id={notification_id}
            notificationData={notificationState}
            setReplying={setIsReplying}
          />
        </div>
      ) : (
        ""
      )}

      {reply ? (
        <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
          <div className="flex gap-3 mb-3">
            <img
              className="w-8 h-8 rounded-full"
              src={author_profile_pic}
              alt="profile pic"
            />

            <div>
              <h1 className="font-medium text-xl text-dark-grey ">
                <Link
                  className="mx-1 text-black underline"
                  to={`/user/${author_username}`}
                >
                  @{author_username}
                </Link>
                <span className="font-normal">replied to</span>
                <Link
                  className="mx-1 text-black underline"
                  to={`/user/${username}`}
                >
                  @{username}
                </Link>
              </h1>
            </div>
          </div>

          <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>
          <button
            className="underline hover:text-black ml-14 mt-2"
            onClick={(e) => handleDelete(comment._id, "reply", e.target)}
          >
            Delete
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default NotificationCard;
