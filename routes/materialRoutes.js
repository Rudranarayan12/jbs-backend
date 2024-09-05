import express from "express";
import {
  addMaterial,
  deleteMaterial,
  getAllMaterials,
  updateMaterial,
} from "../controllers/materialController.js";

const router = express.Router();

router.post("/add-material", addMaterial);
router.get("/get-all-materials", getAllMaterials);
router.put("/update-material/:matID", updateMaterial);
router.delete("/delete-material/:matID", deleteMaterial);

export default router;
