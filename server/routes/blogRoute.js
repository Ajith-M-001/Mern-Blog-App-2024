import express from "express";
import {
  createBlog,
  LatestBlog,
  trendingBlogs,
  searchBlogs,
  latestBlogCount,
  searchBlogCount,
  searchUsers,
  getUser,
  getBlog,
  likePosts,
  getLikeDetailsOfPost,
  updateUserProfie,
  updateUser,
} from "../controllers/blogController.js";
import verifyJWT from "../Middleware/verifyJWT.js";

const router = express.Router();

// POST /api/blog/create - Create a blog
router.post("/create", verifyJWT, createBlog);

// get /api/blog/latest-blogs - get all latest blog
router.post("/latest-blogs", LatestBlog);

// get /api/blog/trending-blogs - get tranding blog
router.get("/trending-blogs", trendingBlogs);

// get /api/blog/all-latest-blogs-count - get count of latest blog
router.post("/all-latest-blogs-count", latestBlogCount);

// get /api/blog/search-blogs-count - get count of search blog
router.post("/search-blogs-count", searchBlogCount);

router.post("/search-users", searchUsers);
router.post("/get-user", getUser);
router.post("/update-profile-img", verifyJWT, updateUserProfie);
router.post("/update-profile", verifyJWT, updateUser);

// get /api/blog/trending-blogs - get tranding blog
router.post("/search-blogs", searchBlogs);

router.post("/like-blog", verifyJWT, likePosts);
router.post("/isLiked-by-blog", verifyJWT, getLikeDetailsOfPost);

router.post("/get-blog", getBlog);

export default router;
