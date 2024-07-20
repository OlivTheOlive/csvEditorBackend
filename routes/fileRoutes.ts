import express from "express"; // Express.js framework for building web applications and APIs
import multer from "multer"; // Middleware for handling file uploads
import { saveFile, uploadFile } from "../controllers/fileController";
import { CsvModel } from "../models/newCSVModel"; // Ensure correct import path

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route to handle file upload and processing
router.post("/upload", upload.single("csvFile"), uploadFile);

// Route to handle saving data and updating MongoDB
router.post("/update", saveFile);

// Route to fetch history from MongoDB
router.get("/history", async (req, res) => {
  try {
    const history = await CsvModel.find().sort({ timestamp: -1 }); // Sort by timestamp in descending order

    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).send("Failed to fetch history");
  }
});

export default router;
