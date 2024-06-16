import { Request, Response } from "express";
import { CsvDataDTO } from "../models/csvModel";
import path from "path";
import { addHistoryEntry } from "./historyController";
const fs = require("fs");
const Papa = require("papaparse");

interface CsvRowWithId {
  id: number;
}
/**
 * Handle inital file minipulation data received from client.
 * @param req Express Request object.
 * @param res Express Response object.
 */
export const uploadFile = (req: Request, res: Response) => {
  // read the uploaded file
  console.log("Received file upload request");
  const csvFilePath = req.file?.path;
  console.log("Uploaded file path:", csvFilePath);
  const fileStream = fs.createReadStream(csvFilePath);
  Papa.parse(fileStream, {
    header: true,
    dynamicTyping: true,
    transform: (value: any, column: string) => {
      if (column === "AADT") {
        return undefined; // Return undefined to remove this column
      } else if (column === "85PCT") {
        return undefined; // Return undefined to remove this column
      } else if (column === "PRIORITY_POINTS") {
        return undefined; // Return undefined to remove this column
      }
      return value;
    },
    complete: (result: any) => {
      console.log("CSV parsing complete");
      let data = result.data;
      console.log("Parsing data");

      // Add incremental IDs
      let dataWithIds: CsvRowWithId[] = data.map((row: any, index: any) => {
        return { id: index + 1, ...row };
      });

      data = dataWithIds.slice(0, 100); // 100 rows slice

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

/**
 * Handle saving data received from client as a CSV file and respond with CsvDataDTO.
 * @param req Express Request object.
 * @param res Express Response object.
 */
export const saveFile = async (req: Request, res: Response): Promise<void> => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    res.status(400).send("Invalid data format: data should be an array");
    return;
  }

  try {
    // Convert data to CSV format using PapaParse
    const csv = Papa.unparse(data, {
      header: true, // Ensure the first row is treated as headers
    });

    // Generate a temporary file path
    const filePath = path.join(__dirname, "../temp/data.csv");

    // Write CSV data to a temporary file
    fs.writeFileSync(filePath, csv, { encoding: "utf-8" });

    const fileName = "data.csv";

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    // Save to history
    await addHistoryEntry(data);

    // Send the CSV file as a download
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file");
      } else {
        console.log("File sent successfully");
        // After sending the file, delete the temporary file
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error("Error saving data as CSV:", error);
    res.status(500).send("Internal server error");
  }
};
