import express from "express";
import {
  uploadMultipleDocument,
  uploadSingleDocument,
} from "../utils/uploadDoc.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();
// upload documents
router.post("/upload-single-doc", upload.single("doc"), uploadSingleDocument);
router.post(
  "/upload-multiple-doc",
  upload.array(["docs"]),
  uploadMultipleDocument
);
export default router;
