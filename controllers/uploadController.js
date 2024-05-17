const { parseCSV } = require("../models/csvModel");

const uploadCSV = (req, res) => {
  console.log("Received file upload request");
  const csvFilePath = req.file.path;
  console.log("Uploaded file path:", csvFilePath);

  parseCSV(csvFilePath, (data) => {
    console.log("CSV parsing complete");
    console.log("Parsing data");
    res.json(data);
    console.log("Response sent to client");
  });
};

module.exports = { uploadCSV };
