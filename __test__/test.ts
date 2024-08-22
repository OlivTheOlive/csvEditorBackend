import { Request, Response } from "express";
import { getHistory } from "../controllers/fileController";
import { CsvModel } from "../models/newCSVModel";

// Mock the CsvModel to simulate database interactions
jest.mock("../models/newCSVModel");

describe("getHistory", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockSend: jest.Mock;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Initialize mock functions
    mockSend = jest.fn();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ send: mockSend, json: mockJson });

    // Set up mock request and response objects
    req = {}; 
    res = {
      status: mockStatus,
      json: mockJson,
    };
  });

  it("should return history data successfully", async () => {
    // Mock the behavior of CsvModel.find to return dummy data 
    const mockFind = jest.fn().mockResolvedValue([
      {
        _id: "mockId1",
        createdAt: "2024-01-01T00:00:00.000Z",
        records: [{ id: 1, field1: "value1" }],
        name: "file1.csv",
      },
      {
        _id: "mockId2",
        createdAt: "2024-01-02T00:00:00.000Z",
        records: [{ id: 2, field1: "value2" }],
        name: "file2.csv",
      },
    ]);

    // Mock the implementation of CsvModel.find to return the mock data and sort by createdAt
    (CsvModel.find as jest.Mock).mockImplementation(() => ({
      sort: jest.fn().mockReturnValue(mockFind()),
    }));

    // Call the getHistory function with the mock request and response objects
    await getHistory(req as Request, res as Response);

    // Assertions to verify the expected behavior
    expect(CsvModel.find).toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith([
      {
        _id: "mockId1",
        createdAt: "2024-01-01T00:00:00.000Z",
        records: [{ id: 1, field1: "value1" }],
        name: "file1.csv",
      },
      {
        _id: "mockId2",
        createdAt: "2024-01-02T00:00:00.000Z",
        records: [{ id: 2, field1: "value2" }],
        name: "file2.csv",
      },
    ]);
  });

  it("should handle errors when fetching history data", async () => {
    // Mock the behavior of CsvModel.find to throw an error
    const mockFind = jest.fn().mockRejectedValue(new Error("Database error"));

    // Mock the implementation of CsvModel.find to return the error
    (CsvModel.find as jest.Mock).mockImplementation(() => ({
      sort: jest.fn().mockReturnValue(mockFind()),
    }));

    // Call the getHistory function with the mock request and response objects
    await getHistory(req as Request, res as Response);

    // Assertions to verify the expected error handling behavior
    expect(CsvModel.find).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockSend).toHaveBeenCalledWith("Failed to fetch history");
  });
});