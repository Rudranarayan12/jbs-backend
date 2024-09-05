import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
dotenv.config();

const adminData = {
  email: process.env.ADMIN_EMAIL,
  name: process.env.ADMIN_NAME,

  phoneNo: process.env.ADMIN_PHONE,
  role: process.env.ADMIN_ROLE,
};
export const adminSeeder = async () => {
  const userExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!userExists || userExists.length == 0) {
    const password = await bcryptjs.hash(process.env.ADMIN_PASSWORD, 10);
    await User.create({ ...adminData, password });
  } else {
    return;
  }
};
