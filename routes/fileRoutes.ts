const express = require("express"); // Express.js framework for building web applications and APIs
import { uploadFile } from "../controllers/fileController";
const multer = require("multer"); // Middleware for handling file uploads

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("csvFile"), uploadFile);

export default router;
