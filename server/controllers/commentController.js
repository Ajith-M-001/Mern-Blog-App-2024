import Blog from "../Schema/Blog.js";
import Comment from "../Schema/Comment.js";
import Notification from "../Schema/Notification.js";

export const addComment = async (req, res) => {
  const user_id = req.user.id;
  const { _id, comment, blog_author, replying_to } = req.body;

  if (!comment.length) {
    return res
      .status(403)
      .json({ message: "write something to leave a ceomment" });
  }

  //creating a  comment doc
  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }

  new Comment(commentObj).save().then(async (commentFile) => {
    let { comment, commentedAt, children } = commentFile;
    Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    ).then((blog) => {
      console.log("new comment created");
    });

    let notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;
      await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      ).then((replyingToCommentDoc) => {
        notificationObj.notification_for = replyingToCommentDoc.commented_by;
      });
    }
    new Notification(notificationObj).save().then((notification) => {
      console.log("new notification created");
    });

    return res
      .status(200)
      .json({ comment, commentedAt, _id: commentFile._id, user_id, children });
  });
};

export const getComments = async (req, res) => {
  let { blog_id, skip } = req.body;
  let maxLimit = 5;
  Comment.find({ blog_id, isReply: false })
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .skip(skip)
    .limit(maxLimit)
    .sort({ commentedAt: -1 })
    .then((comment) => {
      return res.status(200).json(comment);
    })
    .catch((error) => {
      console.log(error.message);
      return res.status(500).json({ message: error.message });
    });
};

export const getReplies = async (req, res) => {
  const { _id, skip } = req.body;
  let maxLimit = 5;
  Comment.findOne({ _id })
    .populate({
      path: "children",
      options: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select:
          "personal_info.profile_img personal_info.fullname personal_info.username",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
};

export const deleteComment = async (req, res) => {
  const { _id } = req.body;

  Comment.findOne({ _id }).then((comment) => {
    deleteComments(_id);
    return res.status(200).json({ status: "Done" });
  });
};

const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id })
    .then((comment) => {
      if (comment.parent) {
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } }
        )
          .then((data) => console.log("comment deleted from parent"))
          .catch((err) => console.log(err));
      }

      Notification.findOneAndDelete({ comment: _id }).then((notification) =>
        console.log("comment notification deleted")
      );

      Notification.findOneAndDelete({ reply: _id }).then((notification) =>
        console.log("reply notification deleted")
      );

      Blog.findOneAndDelete(
        { _id: comment.blog_id },
        {
          $pull: { comments: _id },
          $inc: {
            "activity.total_comments": -1,
            "activity.total_parent_comments": comment.parent ? 0 : -1,
          },
        }
      ).then((blog) => {
        if (comment.children.length) {
          comment.children.map((replies) => {
            deleteComments(replies);
          });
        }
      });
    })
    .catch((err) => console.log(err.message));
};
