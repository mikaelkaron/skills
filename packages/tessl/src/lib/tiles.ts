import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type TileState = Record<string, string>;

const STATE_FILE = "tiles.json";

export function stateDir(dataDir: string): string {
  return process.env["TESSL_STATE_DIR"] ?? dataDir;
}

export function readTiles(dir: string): TileState {
  const file = join(dir, STATE_FILE);
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, "utf8")) as TileState;
}

export function writeTiles(dir: string, tiles: TileState): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, STATE_FILE), JSON.stringify(tiles, null, 2));
}
