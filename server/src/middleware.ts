import { Request, Response, NextFunction, Send } from 'express';
import NodeCache from 'node-cache';

interface MiddlewareResponse extends Response {
  sendResponse?: Send;
}

export function iconCacher(cache: NodeCache) {
  return (req: Request, res: MiddlewareResponse, next: NextFunction) => {
    const name = req.params.name;
    const cachedImage = cache.get(name);

    if (cachedImage) {
      res.type('image/svg+xml');
      res.status(200).send(cachedImage);
      return;
    } else {
      res.sendResponse = res.send;

      res.send = (data: Buffer) => {
        cache.set(name, data);

        return res.sendResponse(data);
      };
    }
    next();
  };
}
