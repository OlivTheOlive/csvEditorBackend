import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const historyFilePath = path.join(__dirname, "../temp/history.json");

// Load history from file
const loadHistory = () => {
  if (!fs.existsSync(historyFilePath)) {
    return [];
  }
  const historyData = fs.readFileSync(historyFilePath, { encoding: "utf-8" });
  console.log(historyData);
  return JSON.parse(historyData);
};

// Save history to file
const saveHistory = (history: any[]) => {
  fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), {
    encoding: "utf-8",
  });
};

// Get history
export const getHistory = (req: Request, res: Response) => {
  try {
    const history = loadHistory();
    res.json(history);
  } catch (error) {
    console.error("Error saving data as CSV:", error);
    res.status(500).send("Internal server error");
  }
};

// Save new entry to history
export const addHistoryEntry = (data: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const history = loadHistory();
      const newEntry = { id: history.length, timestamp: new Date(), data };
      history.push(newEntry);
      saveHistory(history);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
