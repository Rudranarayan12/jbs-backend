import { uploadOnCloudinary } from "./cloudinary.js";

export const uploadSingleDocument = async (req, res) => {
  try {
    const doc = await uploadOnCloudinary(req.file.path);
    if (!doc) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload document",
      });
    }
    return res.status(201).json({
      success: true,
      message: "document uploaded successfully",
      doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error while uploading document",
    });
  }
};
export const uploadMultipleDocument = async (req, res) => {
  try {
    const files = req.files;
    const docs = await Promise.all(
      files.map((file) => uploadOnCloudinary(file.path))
    );

    if (docs.some((url) => !url)) {
      return res.status(500).json({
        success: false,
        message: "failed to upload documents",
      });
    }
    return res.status(201).json({
      success: true,
      message: "documents uploaded successfully",
      docs,
    });
  } catch (error) {
    console.log(error, "---------------------------->");
    return res.status(500).json({
      success: false,
      message: "error while uploading image",
    });
  }
};
