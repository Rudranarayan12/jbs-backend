import { firebaseApp } from "../configs/firebaseConfig.js";
import { transporter } from "../configs/nodeMailerConfig.js";
import { Notification } from "../models/NotificationModel.js";

export const NotificationTitle = {
  order_creation: "New Order Created",
  order_assignment: "New Order Assigned",
  task_assignment: "New Task Assigned",
  task_update: "Task Completed",
  material_request: "New Material Request",
  material_request_approval: "Material Request Approved",
  out_for_delivery: "Out For Delivery",
  order_delivered: "Order Delivered",
  leave_applied: "Applied For Leave",
  leave_approved: "Leave Approved",
  leave_rejected: "Leave Rejected",
};

export const sendPushNotification = async (notifyData) => {
  try {
    if (!notifyData?.fcmToken) {
      throw new Error("provide recipient token");
    }
    console.log(notifyData);
    const response = await firebaseApp.messaging().send({
      token: notifyData?.fcmToken,
      notification: {
        title: notifyData?.title || "",
        body: notifyData?.body || "",
        imageUrl:
          notifyData?.imgUrl ||
          "https://res.cloudinary.com/subhendu-spbp/image/upload/v1716891129/szqubydwarndfs771dfk.png",
      },
    });
    console.log("message sent ------------------>", response);
  } catch (error) {
    // throw Error(error);
  }
};

export const sendNotification = async (data) => {
  try {
    await Notification.create(data);
    if (data?.fcmToken) {
      await sendPushNotification(data);
    }
  } catch (error) {
    // throw Error(error);
  }
};

export const sendOrderConfirmationEmail = async ({
  to,
  customerName,
  orderID,
  productName,
  productPrice,
  productQuantity,
  productFinalPrice,
}) => {
  const mailOptions = {
    from: '"MM HOME TOWN" <raja.bbsr001@gmail.com>',
    to: to,
    subject: "Order Confirmation - Your Order with MM HOMETOWN",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Thank you for your order!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your purchase! We're excited to inform you that we've received your order and it's currently being processed. Here are your order details:</p>
        <h3>Order #${orderID}</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
            </tr>
          </thead>
          <tbody>
           
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${productName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${productQuantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₹${
                  productPrice ? parseFloat(productPrice).toFixed(2) : 0
                }</td>
              </tr>
           
          </tbody>
        </table>
        <p><strong>Total:</strong> ₹${
          productFinalPrice ? parseFloat(productFinalPrice).toFixed(2) : 0
        }</p>
        <p>We will send you another email once your order has been shipped.</p>
        <p>If you have any questions, feel free to contact us at <a href="mailto:admin@mm.com">support@mmhometown.com</a>.</p>
        <p>Best regards,</p>
        <p>MM HOMETOWN</p>
      </div>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info);
  } catch (error) {
    // throw Error(error);
  }
};
