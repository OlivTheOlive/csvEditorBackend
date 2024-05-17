const express = require("express");
const multer = require("multer");
const { uploadCSV } = require("../controllers/uploadController");

const router = express.Router();

// Set up multer for handling file uploads
const upload = multer({ dest: "uploads/" });

// Define the route for file upload
router.post("/upload", upload.single("csvFile"), uploadCSV);

module.exports = router;
