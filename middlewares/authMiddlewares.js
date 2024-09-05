import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "token format not valid",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "please provide a token",
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "token has expired , please login again",
          });
        }
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "authentication failed",
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "only Admin has access",
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};
export const isAccountant = async (req, res, next) => {
  try {
    const { empDepartment } = req.user;
    if (empDepartment !== "accounts") {
      return res.status(400).json({
        success: false,
        message: "only Accountant has access",
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};
