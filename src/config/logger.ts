import { now } from "../server/units/timeUtils";

export const log = (text: string) => {
    console.log(`[${now()}] ${text}`);
};