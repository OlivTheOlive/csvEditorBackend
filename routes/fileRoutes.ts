import express from "express"; // Express.js framework for building web applications and APIs
import multer from "multer"; // Middleware for handling file uploads
import {
  getHistory,
  saveFile,
  uploadFile,
} from "../controllers/fileController";
import { CsvModel } from "../models/newCSVModel"; // Ensure correct import path

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route to handle file upload and processing
router.post("/upload", upload.single("csvFile"), uploadFile);

// Route to handle saving data and updating MongoDB
router.post("/update", saveFile);

// Route to fetch history from MongoDB
router.get("/history", getHistory);

export default router;
