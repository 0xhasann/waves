import { IncomingMessage, ServerResponse } from "http";
import { readFile, existsSync } from "fs";
import { extname, join } from "path";
import { authRoutes } from "../models/auth/auth.route";

export const PORT = process.env.PORT || 3000;


const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".ico": "image/x-icon",
    ".txt": "text/plain"
};
// reads the file from the filepath and 
// if read fail then handle error 
// else set the res, writeHead as code and content-type and the content into it.
const serveStaticFile = (
    res: ServerResponse,
    filePath: string,
    contentType: string
): void => {
    readFile(filePath, (err, content) => {
        res.setHeader(
            "Content-Security-Policy",
            "connect-src 'self' wss://waves-irft.onrender.com"
        );
        if (err) {
            res.writeHead(500);
            res.end("Internal Server Error");
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        }
    });
};

export const log = (text: string): void => {
    const time = new Date();
    console.log(`[${time.toLocaleTimeString()}] ${text}`);
};

// handle req and serve res
// fetch the process path and goto html file
// 
// if req.url is '/' then fetches index.html under public directory file path
// else set the file path as req.url as suffix on path under public directory.
// if filepath doesn't exist we send 404
export const handleWebRequest = async (
    req: IncomingMessage,
    res: ServerResponse
): Promise<void> => {
    log(`Received request for ${req.url}`);
    // backend APIs for user flow
    if (req.url?.startsWith("/api")) {

        const body =
            req.method !== "GET" && req.method !== "HEAD"
                ? await new Promise<string>((resolve) => {
                    let data = ""
                    req.on("data", chunk => (data += chunk))
                    req.on("end", () => resolve(data))
                })
                : undefined

        const request = new Request(`http://localhost:3000${req.url}`, {
            method: req.method,
            headers: req.headers as any,
            body,
        });

        const response = await authRoutes(request);

        if (response) {
            const headers: Record<string, string> = {}
            response.headers.forEach((value, key) => {
                headers[key] = value
            })

            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

            if (req.method === "OPTIONS") {
                res.writeHead(200);
                res.end();
                return;
            }

            
            res.writeHead(
                response.status,
                headers
            );

            const buffer = Buffer.from(await response.arrayBuffer());
            res.end(buffer);
            return;
        }

        res.writeHead(404);
        res.end("API Route Not Found");
        return;
    }

    const filePath = req.url === "/"
        ? join(process.cwd(), "public", "index.html")
        : join(process.cwd(), "public", req.url!);
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || "application/octet-stream";

    if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end("404 Not Found");
        return;
    }

    serveStaticFile(res, filePath, contentType);
};