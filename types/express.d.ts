import { Request, Response } from 'express';

// Extend the Request interface to include the file property
declare global {
  namespace Express {
    interface Request {
      file?: {
        path: string;
      };
    }
  }
}
