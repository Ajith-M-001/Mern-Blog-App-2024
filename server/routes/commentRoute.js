import express from "express";
import verifyJWT from "../Middleware/verifyJWT.js";
import {
  addComment,
  getComments,
  getReplies,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// POST /api/comment/add-comment - add new Comment
router.post("/add-comment", verifyJWT, addComment);

router.post("/get-blog-comment", getComments);

router.post("/get-replies", getReplies);

router.post("/delete-comment", deleteComment);

export default router;
