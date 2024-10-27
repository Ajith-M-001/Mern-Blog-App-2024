import express from "express";
import verifyJWT from "../Middleware/verifyJWT.js";
import {
  getNotificationAlert,
  getNotification,
  getTotalNotificationCount,
} from "../controllers/notificationAlert.js";

const router = express.Router();

// get /api/notigication/new - get get new notification alert
router.get("/new", verifyJWT, getNotificationAlert);

// get /api/notitication/getNotificatons - get  notification
router.post("/getNotificatons", verifyJWT, getNotification);

router.post("/all-notification-count", verifyJWT, getTotalNotificationCount);

export default router;
