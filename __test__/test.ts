import { Request, Response } from "express";
import fs from "fs";
const Papa = require("papaparse");
import { uploadFile } from "../controllers/fileController";

// Mocking the fs and PapaParse modules
jest.mock("fs");
jest.mock("papaparse");

describe("uploadFile", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      file: {
        fieldname: "csvFile",
        originalname: "data.csv",
        encoding: "7bit",
        mimetype: "text/csv",
        buffer: Buffer.from("column1,column2\nvalue1,value2"), // Mock CSV content
        size: 100,
        path: "/__test__/data.csv",
        // Include additional properties as necessary
      } as unknown as Express.Multer.File, // Cast to match expected type
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock the fs.createReadStream method to return a mock stream
    (fs.createReadStream as jest.Mock).mockReturnValue("mockStream");

    // Mock the fs.unlink method using jest.spyOn
    jest
      .spyOn(fs, "unlink")
      .mockImplementation((path, callback) => callback(null));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should parse the CSV file and return the correct response", (done) => {
    const mockData = [{ column1: "value1", column2: "value2" }];

    const mockParsedResult = {
      data: mockData,
    };

    (Papa.parse as jest.Mock).mockImplementation((fileStream, options) => {
      options.complete(mockParsedResult);
    });

    uploadFile(req as Request, res as Response);

    // Use process.nextTick to wait for asynchronous operations
    process.nextTick(() => {
      expect(fs.createReadStream).toHaveBeenCalledWith("/__test__/data.csv");
      expect(Papa.parse).toHaveBeenCalledWith("mockStream", expect.any(Object));

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              column1: "value1",
              column2: "value2",
            }),
          ]),
        })
      );

      expect(fs.unlink).toHaveBeenCalledWith(
        "/__test__/data.csv",
        expect.any(Function)
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();

      done();
    });
  });

  it("should handle errors during file parsing", (done) => {
    const mockError = new Error("Parse error");

    (Papa.parse as jest.Mock).mockImplementation((fileStream, options) => {
      options.error(mockError);
    });

    uploadFile(req as Request, res as Response);

    process.nextTick(() => {
      expect(fs.createReadStream).toHaveBeenCalledWith("/__test__/data.csv");
      expect(Papa.parse).toHaveBeenCalledWith("mockStream", expect.any(Object));

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error parsing CSV file");

      expect(fs.unlink).toHaveBeenCalledWith(
        "/__test__/data.csv",
        expect.any(Function)
      );

      done();
    });
  });
});
