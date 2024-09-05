import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) {
      console.log("local files not found");
      return false;
    }

    const result = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localfilePath);
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(localfilePath)) {
      fs.unlinkSync(localfilePath);
    }

    console.error("Cloudinary upload failed", error);
    return false;
  }
};
