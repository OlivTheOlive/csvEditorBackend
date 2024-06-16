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
        path: "/__test__/data.csv"
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
      expect(fs.createReadStream).toHaveBeenCalledWith("/__test__/data.csv");
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

      expect(fs.unlink).toHaveBeenCalledWith("/__test__/data.csv", expect.any(Function));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();

      done();
    });
  });


});
