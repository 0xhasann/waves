import type { Request, Response } from "express";
import * as service from "./conn.service";
import { sendResponse } from "../units/apiResponse";

export const search = async (req: Request, res: Response) => {
    console.log(req);
    const result = await service.search(req.body);
    sendResponse(res, 200, result, "User found");
};