// 校验 mcp-config 下所有 JSON 文件可被解析
// 只读 mcp-config/，不修改任何文件
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const targets = [
  join(root, "mcp-config", "mcp.json"),
  join(root, "mcp-config", "mcp.dev.json"),
];

const serversDir = join(root, "mcp-config", "servers");
if (existsSync(serversDir)) {
  const { readdirSync, statSync } = await import("node:fs");
  for (const entry of readdirSync(serversDir)) {
    const full = join(serversDir, entry);
    if (statSync(full).isFile() && entry.endsWith(".json")) {
      targets.push(full);
    }
  }
}

let failed = false;
for (const file of targets) {
  if (!existsSync(file)) continue;
  try {
    JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    failed = true;
    console.error(`FAIL ${file}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
  }
}

if (failed) {
  process.exit(1);
}
console.log(`OK: ${targets.length} JSON file(s) valid`);
