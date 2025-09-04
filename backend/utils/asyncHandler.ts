import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: AsyncFunction): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
  console.log("asyncHandler: fn type is", typeof fn, "fn is", fn);
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;