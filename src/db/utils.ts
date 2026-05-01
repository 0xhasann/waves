import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

export const database = new Database("./wavesChat.db");
export type DB = typeof database;
const dir = "./migrations";


export function runMigration() {

    // create migrations table
    database.run(`
  CREATE TABLE IF NOT EXISTS migrations (
    id TEXT PRIMARY KEY,
    checksum TEXT NOT NULL,
    run_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

    function checksum(content: string) {
        return createHash("sha256").update(content).digest("hex");
    }

    // read applied migrations
    const applied = new Map(
        database.query("SELECT id, checksum FROM migrations").all()
            .map((r: any) => [r.id, r.checksum])
    );

    // read files
    const files = readdirSync(dir)
        .filter(f => f.endsWith(".sql"))
        .sort();

    for (const file of files) {
        const id = file.replace(".sql", "");
        const sql = readFileSync(join(dir, file), "utf-8");
        const hash = checksum(sql);

        if (!applied.has(id)) {
            database.run("BEGIN");
            try {
                database.run(sql);
                database.run(
                    "INSERT INTO migrations (id, checksum) VALUES (?, ?)",
                    [id, hash]
                );
                database.run("COMMIT");
                console.log("Applied:", id);
            } catch (e) {
                console.log(e);
                database.run("ROLLBACK");
                throw e;
            }
        } else {
            console.log(`Migration is already done for file:: ${id}`);
            const oldHash = applied.get(id);
            if (oldHash !== hash) {
                throw new Error(`Migration modified: ${id}`);
            }
        }
    }
}
