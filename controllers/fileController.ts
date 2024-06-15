import { Request, Response } from "express";
import { CsvDataDTO } from "../models/csvModel";
const fs = require("fs");
const Papa = require("papaparse");

export const uploadFile = (req: Request, res: Response) => {
  // read the uploaded file
  console.log("Received file upload request");
  const csvFilePath = req.file?.path;
  console.log("Uploaded file path:", csvFilePath);
  // parse CSV file asynchronously
  const fileStream = fs.createReadStream(csvFilePath);
  Papa.parse(fileStream, {
    header: true,
    dynamicTyping: true,
    complete: (result: any) => {
      console.log("CSV parsing complete");
      let data = result.data;
      console.log("Parsing data");

      data = data.slice(0, 200);

      const csvDataDTO = new CsvDataDTO(data);

      res.json(csvDataDTO);
      console.log("Response sent to client");

      fs.unlink(csvFilePath, (err: any) => {
        if (err) {
          console.error("Failed to delete temporary file:", err);
        } else {
          console.log("Temporary file deleted");
        }
      });
    },
    error: (error: any) => {
      console.error("Error parsing CSV:", error);
      res.status(500).send("Error parsing CSV file");
    },
  });
};
