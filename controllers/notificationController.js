import { isValidObjectId } from "mongoose";
import { User } from "../models/UserModel.js";
import { Notification } from "../models/NotificationModel.js";

export const getAllNotificationsByRecipient = async (req, res, next) => {
  try {
    const { recipientID } = req.params;
    if (!isValidObjectId(recipientID)) {
      return res.status(400).json({
        success: false,
        message: "invalid recipient id",
      });
    }
    const recipient = await User.findOne({ _id: recipientID });
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "recipient not found",
      });
    }
    const notifications = await Notification.find({
      recipient: recipientID,
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationID } = req.params;
    if (!isValidObjectId(notificationID)) {
      return res.status(400).json({
        success: false,
        message: "invalid notification id",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationID,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "notification not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const deleteAllNotificationsOfRecipient = async (req, res, next) => {
  try {
    const { recipientID } = req.params;

    if (!isValidObjectId(recipientID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID",
      });
    }

    const notifications = await Notification.find({
      recipient: recipientID,
    });

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notifications found for this recipient",
      });
    }

    await Notification.deleteMany({
      recipient: recipientID,
    });

    return res.status(200).json({
      success: true,
      message: "Notifications deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
