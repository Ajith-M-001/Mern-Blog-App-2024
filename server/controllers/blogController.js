import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";

// export const createBlog = async (req, res) => {
//   try {
//   const authorId = req.user.id;
//   let { title, des, banner, tags, content, draft, id } = req.body;

//   console.log("id", id);

//   tags = Array.isArray(tags) ? tags : [];

//   // Convert all tags to lowercase and remove duplicates
//   tags = [...new Set(tags.map((tag) => tag.toLowerCase()))];

//   // tags = tags.map((tag) => tag.toLowerCase());

//   let blog_id = title
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/gi, "")
//     .trim()
//     .replace(/\s+/g, "-");

//   blog_id = id || `${blog_id}-${nanoid(8)}`;

//   if (id) {
//     try {
//       let blog = await Blog.findOneAndUpdate(
//         { blog_id },
//         { title, des, banner, tags, content, draft: draft ? draft : false }
//       );
//       return res.status(200).json(blog);
//     } catch (error) {
//       return res.status(500).json({ message: error.message });
//     }
//   } else {
//     let blog = new Blog({
//       title,
//       des,
//       banner,
//       content,
//       tags,
//       author: authorId,
//       blog_id,
//       draft: Boolean(draft),
//     });
//     const newblog = await blog.save();
//     let incrementvalue = draft ? 0 : 1;
//     await User.findByIdAndUpdate(
//       authorId,
//       {
//         $inc: { "account_info.total_posts": incrementvalue },
//         $push: { blogs: newblog._id },
//       },
//       { new: true }
//     );
//   }

//   return res.status(200).json({ newblog });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

export const createBlog = async (req, res) => {
  try {
    const authorId = req.user.id;
    let { title, des, banner, tags, content, draft, id } = req.body;

    tags = Array.isArray(tags)
      ? [...new Set(tags.map((tag) => tag.toLowerCase()))]
      : [];

    let blog_id = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, "")
      .trim()
      .replace(/\s+/g, "-");

    blog_id = id || `${blog_id}-${nanoid(8)}`;

    if (id) {
      const blog = await Blog.findOneAndUpdate(
        { blog_id },
        { title, des, banner, tags, content, draft: draft ?? false },
        { new: true }
      );
      return res.status(200).json(blog);
    } else {
      const newBlog = new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author: authorId,
        blog_id,
        draft: Boolean(draft),
      });
      const savedBlog = await newBlog.save();
      let incrementValue = draft ? 0 : 1;
      await User.findByIdAndUpdate(
        authorId,
        {
          $inc: { "account_info.total_posts": incrementValue },
          $push: { blogs: savedBlog._id },
        },
        { new: true }
      );
      return res.status(201).json(savedBlog); // Return 201 for creation
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const LatestBlog = async (req, res) => {
  const page = req.body.page || 1;

  const maxLimit = 5;
  try {
    const blogs = await Blog.find({ draft: false })
      .sort({ publishedAt: -1 })
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);
    res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const latestBlogCount = async (req, res) => {
  try {
    const count = await Blog.countDocuments({ draft: false });
    res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.error("Error counting documents:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const searchBlogCount = async (req, res) => {
  const { tag, query, author } = req.body;
  let findQuery = {};

  if (tag) {
    findQuery = { draft: false, tags: tag };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { draft: false, author };
  }
  try {
    const count = await Blog.countDocuments(findQuery);
    res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.error("Error counting documents:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const trendingBlogs = async (req, res) => {
  try {
    const maxLimit = 5;
    const trendingBlogs = await Blog.find({ draft: false })
      .sort({
        "activity.total_reads": -1,
        "activity.total_likes": -1,
        "activity.publishedAt": -1,
      })
      .limit(maxLimit)
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .select("blog_id title publishedAt -_id");

    res.status(200).json(trendingBlogs);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch trending blogs",
      error: error.message,
    });
  }
};

export const searchBlogs = async (req, res) => {
  const { tag, page = 1, query, author, limit, eliminate_blog } = req.body;

  page;
  let findQuery = {};

  if (tag) {
    findQuery = { draft: false, tags: tag, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { draft: false, author };
  }

  const maxLimit = limit ? limit : 2;

  try {
    const blogs = await Blog.find(findQuery)
      .sort({ publishedAt: -1 })
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found." });
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching blogs." });
  }
};

export const searchUsers = async (req, res) => {
  const { query } = req.body;

  try {
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required." });
    }

    // Perform a case-insensitive search on the username field
    const users = await User.find({
      "personal_info.username": new RegExp(query, "i"),
    })
      .select(
        "personal_info.username personal_info.fullname personal_info.profile_img -_id"
      )
      .limit(10); // Limit the results to 10 users (optional, adjust as needed)

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res
      .status(500)
      .json({ message: "An error occurred while searching for users." });
  }
};

export const getUser = async (req, res) => {
  const { username } = req.body; // Destructure the username from the request body
  try {
    // Check if the username was provided
    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    // Find the user by username
    const user = await User.findOne({
      "personal_info.username": username,
    }).select("-personal_info.password -google_auth -updatedAt -blogs");
    // If the user is not found, send a 404 response
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the user data if found
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the user." });
  }
};

export const getBlog = async (req, res) => {
  const { blog_id, draft, mode } = req.body;
  let incrementValue = mode === "mode" ? 0 : 1;

  // Check if blog_id exists in the request body
  if (!blog_id) {
    return res.status(400).json({ message: "Blog ID is required" });
  }

  try {
    // Find and update the blog with incremented total_reads
    const blog = await Blog.findOneAndUpdate(
      { blog_id: blog_id },
      { $inc: { "activity.total_reads": incrementValue } },
      { new: true }
    )
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .select("title des content banner activity publishedAt blog_id tags");

    // Check if the blog exists before updating user info
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Update the author's total_reads in the User collection if the blog exists
    if (
      blog.author &&
      blog.author.personal_info &&
      blog.author.personal_info.username
    ) {
      await User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementValue } },
        { new: true }
      );
    } else {
      console.error("Author information is missing in the blog data");
    }

    if (blog.draft && !draft) {
      return res.status(500).json({ error: "you can not access draft blog" });
    }

    // Return the updated blog data
    return res.status(200).json(blog);
  } catch (error) {
    // Log the error and send a response
    console.error("Error fetching blog:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching the blog data" });
  }
};

// export const likePosts = async (req, res) => {
//   try {
//     const user_id = req.user.id; // Using req.user._id instead of destructuring for clarity
//     const { _id, isLikedByUser } = req.body;

//     console.log("user", user_id, _id, isLikedByUser);

//     // Determine the increment value based on whether the user has liked the post or not
//     const incrementVal = isLikedByUser ? -1 : 1;

//     // Update the total likes in the blog post
//     const blog = await Blog.findByIdAndUpdate(
//       _id,
//       { $inc: { "activity.total_likes": incrementVal } }, // Make sure "activity.total_likes" path matches your schema
//       { new: true } // Return the updated document
//     );

//     if (!blog) {
//       return res.status(404).json({ message: "Blog not found" });
//     }

//     // If the user liked the blog, create a new notification
//     if (!isLikedByUser) {
//       const likeNotification = new Notification({
//         type: "like",
//         blog: _id,
//         notification_for: blog.author,
//         user: user_id,
//       });

//       await likeNotification.save();
//     } else {
//        await Notification.findOneAndDelete({
//         user: user_id,
//         type: "like",
//         blog: _id,
//       });
//     }

//     // Return the updated like status
//     res.status(200).json({ isLikedByUser: !isLikedByUser });
//   } catch (error) {
//     console.error("Error liking the post:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getLikeDetailsOfPost = async (req, res) => {
//   const user_id = req.user.id;
//   const { _id } = req.body; // Assuming you're using a POST request

//   try {
//     // Check if a notification of type 'like' exists for the given user and blog
//     const isLiked = await Notification.exists({
//       user: user_id,
//       type: "like",
//       blog: _id,
//     });

//     // Return a boolean response indicating whether the user has liked the blog
//     return res.status(200).json({ isLiked: Boolean(isLiked) });
//   } catch (error) {
//     // Return a 500 status code with the error message in case of failure
//     return res.status(500).json({ message: error.message });
//   }
// };

export const likePosts = async (req, res) => {
  try {
    const user_id = req.user.id; // Using req.user._id instead of destructuring for clarity
    const { _id, isLikedByUser } = req.body;

    // Determine the increment value based on whether the user has liked the post or not
    const incrementVal = isLikedByUser ? -1 : 1;

    // Update the total likes in the blog post
    const blog = await Blog.findByIdAndUpdate(
      _id,
      { $inc: { "activity.total_likes": incrementVal } }, // Make sure "activity.total_likes" path matches your schema
      { new: true } // Return the updated document
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // If the user liked the blog, create a new notification
    if (!isLikedByUser) {
      const likeNotification = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      await likeNotification.save();
    } else {
      await Notification.findOneAndDelete({
        user: user_id,
        type: "like",
        blog: _id,
      });
    }

    // Return the updated like status
    res.status(200).json({ isLikedByUser: !isLikedByUser });
  } catch (error) {
    console.error("Error liking the post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLikeDetailsOfPost = async (req, res) => {
  const user_id = req.user.id;
  const { _id } = req.body; // Assuming you're using a POST request

  try {
    // Check if a notification of type 'like' exists for the given user and blog
    const isLiked = await Notification.exists({
      user: user_id,
      type: "like",
      blog: _id,
    });

    // Return a boolean response indicating whether the user has liked the blog
    return res.status(200).json({ isLiked: Boolean(isLiked) });
  } catch (error) {
    // Return a 500 status code with the error message in case of failure
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfie = async (req, res) => {
  const { url } = req.body;
  const { id: _id } = req.user;
  console.log("id", _id);
  User.findOneAndUpdate(
    { _id },
    { "personal_info.profile_img": url },
    { new: true }
  )
    .then(() => {
      return res.status(200).json({ profile_img: url });
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
};

export const updateUser = async (req, res) => {
  const { fullname, bio, social_links } = req.body;
  const { id: _id } = req.user;

  if (!social_links || typeof social_links !== "object") {
    return res.status(400).json({ message: "Invalid social links provided." });
  }

  let socialLinksArr = Object.keys(social_links);
  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] !== "website"
        ) {
          return res.status(403).json({
            message: `${socialLinksArr[i]} link is invalid. You must enter a full link with http(s)://`,
          });
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: "You must provide full social links with http(s) included.",
    });
  }

  let updateObj = {
    "personal_info.fullname": fullname,
    "personal_info.bio": bio,
    social_links,
  };

  try {
    const updatedUser = await User.findByIdAndUpdate(_id, updateObj, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res
      .status(200)
      .json({ fullname: updatedUser.personal_info.fullname });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
