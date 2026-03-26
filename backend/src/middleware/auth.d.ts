import type { Request, Response, NextFunction } from 'express';
export type AuthedRequest = Request & {
    user?: {
        id: string;
    };
};
export declare const verifyToken: (req: AuthedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map