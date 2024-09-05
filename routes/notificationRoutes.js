import express from "express";
import {
  getAllNotificationsByRecipient,
  deleteAllNotificationsOfRecipient,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/get-notification/:recipientID", getAllNotificationsByRecipient);
router.delete("/delete-notification/:notificationID", deleteNotification);
router.delete(
  "/delete-all-notification/:recipientID",
  deleteAllNotificationsOfRecipient
);

export default router;
