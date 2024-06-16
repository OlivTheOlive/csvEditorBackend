const express = require("express"); // Express.js framework for building web applications and APIs
import { saveFile, uploadFile } from "../controllers/fileController";
import { getHistory } from "../controllers/historyController";
const multer = require("multer"); // Middleware for handling file uploads

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("csvFile"), uploadFile);
router.post("/update", saveFile);
router.get("/history", getHistory);

export default router;
