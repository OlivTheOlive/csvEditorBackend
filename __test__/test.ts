import { Request, Response } from "express";

const fs = require("fs");
const Papa = require("papaparse");
import { uploadFile } from "../controllers/fileController";

jest.mock("fs");
jest.mock("papaparse");

describe("uploadFile", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      file: {
        path: "/path/to/uploaded/file.csv"
      }
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    (fs.createReadStream as jest.Mock).mockReturnValue("mockStream");
    (fs.unlink as jest.Mock).mockImplementation((path, callback) => callback(null));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should parse the CSV file and return the correct response", (done) => {
    const mockData = [
      { column1: "value1", column2: "value2" },
      // add more mock rows as needed
    ];

    const mockParsedResult = {
      data: mockData
    };

    (Papa.parse as jest.Mock).mockImplementation((fileStream, options) => {
      options.complete(mockParsedResult);
    });

    uploadFile(req as Request, res as Response);

    process.nextTick(() => {
      expect(fs.createReadStream).toHaveBeenCalledWith("/path/to/uploaded/file.csv");
      expect(Papa.parse).toHaveBeenCalledWith("mockStream", expect.any(Object));

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            column1: "value1",
            column2: "value2"
          })
        ])
      }));

      expect(fs.unlink).toHaveBeenCalledWith("/path/to/uploaded/file.csv", expect.any(Function));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();

      done();
    });
  });

  it("should handle CSV parsing errors", (done) => {
    const mockError = new Error("Parsing error");

    (Papa.parse as jest.Mock).mockImplementation((fileStream, options) => {
      options.error(mockError);
    });

    uploadFile(req as Request, res as Response);

    process.nextTick(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error parsing CSV file");

      done();
    });
  });

  it("should handle file deletion errors", (done) => {
    const mockData = [
      { column1: "value1", column2: "value2" },
      // add more mock rows as needed
    ];

    const mockParsedResult = {
      data: mockData
    };

    (Papa.parse as jest.Mock).mockImplementation((fileStream, options) => {
      options.complete(mockParsedResult);
    });

    (fs.unlink as jest.Mock).mockImplementation((path, callback) => callback(new Error("Deletion error")));

    uploadFile(req as Request, res as Response);

    process.nextTick(() => {
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            column1: "value1",
            column2: "value2"
          })
        ])
      }));

      expect(fs.unlink).toHaveBeenCalledWith("/path/to/uploaded/file.csv", expect.any(Function));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();

      done();
    });
  });
});
