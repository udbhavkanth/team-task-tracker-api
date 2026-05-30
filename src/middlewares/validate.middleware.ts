import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestSource = 'body' | 'query' | 'params';

export const validate =
  <T>(schema: ZodSchema<T>, source: RequestSource = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }

    // Express 5: req.query is a read-only getter — assignment is ignored on read.
    // Store validated query on res.locals so controllers get coerced types (numbers, enums).
    if (source === 'query') {
      res.locals.validatedQuery = parsed.data;
    } else {
      req[source] = parsed.data;
    }

    next();
  };
