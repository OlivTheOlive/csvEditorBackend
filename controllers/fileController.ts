import { Request, Response } from "express";
import { CsvDataDTO } from "../models/csvModel";
const fs = require("fs");
const Papa = require("papaparse");

interface CsvRowWithId {
  id: number;
}
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
    transform: (value: any, column: string) => {
      if (column === 'AADT') {
        return undefined; // Return undefined to remove this column
      }else if(column === '85PCT'){
        return undefined; // Return undefined to remove this column
      }else if(column === 'PRIORITY_POINTS'){
        return undefined; // Return undefined to remove this column
      }
      return value;
    },
    complete: (result: any) => {
      console.log("CSV parsing complete");
      let data = result.data;
      console.log("Parsing data");

      // Add incremental IDs
      let dataWithIds: CsvRowWithId[] = data.map((row:any, index:any) => {
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
