const { parseCSV } = require("../models/csvModel");

const uploadCSV = (req, res) => {
  /**
   * Handles a file upload request.
   *
   * Logs the received file upload request and the path of the uploaded file.
   * Calls the `parseCSV` function to parse the CSV file and passes a callback function to handle the parsed data.
   * Sends the parsed data as a JSON response to the client and logs that the response has been sent.
   *
   * @param {Object} req - The request object containing information about the file upload.
   * @param {Object} res - The response object used to send the JSON response to the client.
   * @returns {void}
   */
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
