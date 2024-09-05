import { User } from "../models/UserModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createOTP,
  generateRandomID,
  generateToken,
  isEmpty,
} from "../utils/helper.js";
import { OTP } from "../models/OtpModel.js";

export const login = async (req, res, next) => {
  try {
    // console.log(req);
    const { email, password, role, fcmToken } = req.body;

    if ([email, password, role].some(isEmpty)) {
      return res
        .status(400)
        .json({ success: false, message: "please provide all fields" });
    }

    // check existing user
    const existingUser = await User.findOne({ email, role });

    // user not found
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    // match password
    const isPasswordMatched = await bcryptjs.compare(
      password,
      existingUser.password
    );

    if (!isPasswordMatched) {
      return res
        .status(400)
        .json({ success: false, message: "please enter valid password" });
    }
    if (fcmToken) {
      existingUser.FCM_TOKEN = fcmToken;
    }

    await existingUser.save();

    // generate jwt token
    const token = generateToken(existingUser?._id);
    existingUser.password = undefined;

    return res.status(200).json({
      success: true,
      token,
      data: existingUser,
      message: "logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const subAdminLogin = async (req, res, next) => {
  try {
    // console.log(req);
    const { email, password, role } = req.body;

    if ([email, password, role].some(isEmpty)) {
      return res
        .status(400)
        .json({ success: false, message: "please provide all fields" });
    }

    // check existing user
    const existingUser = await User.findOne({ email, role });

    // user not found
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    if (
      existingUser?.empDepartment === "procurement_and_inventory" ||
      existingUser?.empDepartment === "accounts"
    ) {
      // match password
      const isPasswordMatched = await bcryptjs.compare(
        password,
        existingUser.password
      );

      if (!isPasswordMatched) {
        return res
          .status(400)
          .json({ success: false, message: "please enter valid password" });
      }
      // generate jwt token
      const token = generateToken(existingUser?._id);
      existingUser.password = undefined;

      return res.status(200).json({
        success: true,
        token,
        data: existingUser,
        message: "logged in successfully",
      });
    }

    return res.status(404).json({ success: false, message: "user not found" });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phoneNo, password, role } = req.body;

    if ([name, email, phoneNo, password, role].some(isEmpty)) {
      return res
        .status(400)
        .json({ success: false, message: "please provide valid info" });
    }
    if (role === "admin") {
      return res.status(400).json({
        success: false,
        message: "admin registration not allowed",
      });
    }
    // check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNo }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user already exists with same credentials",
      });
    }

    // hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      empEmployeeID: generateRandomID(7, "EMP"),
    });
    newUser.password = undefined;
    return res.status(201).json({
      success: true,
      data: newUser,
      message: "user registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const userRegistration = async (req, res, next) => {
  try {
    const { phoneNo, name, email, otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    if ([name, email].some(isEmpty)) {
      return res.status(400).json({
        success: false,
        message: "please provide all fields",
      });
    }

    const existingOtp = await OTP.findOne({ phoneNo });

    if (!existingOtp || existingOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "invalid OTP",
      });
    }

    const currentTime = new Date();
    const otpExpiryTime = new Date(
      existingOtp.creationTime.getTime() + 5 * 60 * 1000
    );

    if (currentTime > otpExpiryTime) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const existingUser = await User.findOne({ phoneNo, role: "user" });

    if (existingUser) {
      // User already exists, update user details
      const updatedUser = await User.findByIdAndUpdate(
        existingUser._id,
        req.body,
        { new: true }
      );

      await OTP.deleteOne({ _id: existingOtp._id });

      const token = generateToken(existingUser?._id);

      updatedUser.password = undefined;

      return res.status(202).json({
        success: true,
        message: "User details updated successfully",
        data: updatedUser,
        token,
      });
    } else {
      // User does not exist, create a new user
      try {
        const newUser = await User.create({ ...req.body, role: "user" });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
          expiresIn: "10d",
        });
        newUser.password = undefined;
        await OTP.deleteOne({ _id: existingOtp._id });

        return res.status(201).json({
          success: true,
          message: "User created successfully",
          data: newUser,
          token,
        });
      } catch (err) {
        if (err.code === 11000) {
          return res.status(400).json({
            success: false,
            message: "User with this phone number already exists",
          });
        }
        next(err);
      }
    }
  } catch (error) {
    next(error);
  }
};
export const sendOtp = async (req, res, next) => {
  try {
    const { phoneNo } = req.body;
    if (!phoneNo) {
      return res.status(400).json({
        success: false,
        message: "provide email or phone no",
      });
    }
    let otp = createOTP();
    const existingOTP = await OTP.findOne({ phoneNo });
    if (!existingOTP) {
      const newOTP = await OTP.create({ ...req.body, otp });
      return res.status(201).json({
        success: true,
        message: "otp sent successfully",
        data: newOTP?.otp,
      });
    }
    existingOTP.creationTime = Date.now();
    existingOTP.otp = otp;
    await existingOTP.save();
    return res.status(201).json({
      success: true,
      message: "otp sent successfully",
      data: existingOTP?.otp,
    });
  } catch (error) {
    next(error);
  }
};

export const validateOtp = async (req, res, next) => {
  try {
    const { otp, phoneNo } = req.body;
    if (!otp || !phoneNo) {
      return res.status(400).json({
        success: false,
        message: "please provide required fields",
      });
    }
    const existingOTP = await OTP.findOne({ phoneNo });

    if (!existingOTP || existingOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "invalid OTP",
      });
    }
    const currentTime = new Date();
    const otpCreationTime = new Date(existingOTP.creationTime);
    const otpExpiryTime = new Date(otpCreationTime.getTime() + 5 * 60 * 1000);

    if (currentTime > otpExpiryTime) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }
    await OTP.deleteOne({ _id: existingOTP._id });
    return res.status(200).json({
      success: true,
      message: "otp verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const mobileLogin = async (req, res, next) => {
  console.log(req.body);
  try {
    const { phoneNo, otp } = req.body;

    if (!phoneNo || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "phone number and OTP are required" });
    }

    const existingOtp = await OTP.findOne({ phoneNo: phoneNo });
    if (!existingOtp || existingOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: "invalid OTP" });
    }

    const currentTime = new Date();
    const otpCreationTime = new Date(existingOtp.creationTime);
    const otpExpiryTime = new Date(otpCreationTime.getTime() + 5 * 60 * 1000);

    if (currentTime > otpExpiryTime) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }
    let user = await User.findOne({ phoneNo, role: "user" });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const token = generateToken(user._id);

    await OTP.deleteOne({ _id: existingOtp._id });
    user.password = undefined;
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      token,
    });
  } catch (error) {
    next(error);
  }
};
