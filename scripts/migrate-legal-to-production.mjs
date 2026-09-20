#!/usr/bin/env node
// scripts/migrate-legal-to-production.mjs
// 用途：法务审核通过后（M-01 反馈绿），将 legal 三页从"noindex 草稿"切换为"正式收录"。
// 用法：node scripts/migrate-legal-to-production.mjs [--dry-run]
// 安全机制：默认 dry-run 打印预览；加 --execute 才落地；落地前自动备份原行。

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DRY_RUN = !process.argv.includes("--execute");

const FILES = [
  {
    path: "src/pages/legal/privacy.astro",
    removals: [
      { from: "// 骨架页：内容未通过法务审核前保持 noindex，审核通过后移除 noindex 并补全条款\n", to: "" },
      { from: "  noindex\n", to: "" },
      { from: "（草稿）", to: new Date().toISOString().slice(0, 10) },
      { from: "⚠️ 本页为占位草稿，尚未通过法务审核，正式上线前需由专业人员审定。", to: "本页内容已通过法务审核（DS-202609-08）。" },
    ],
  },
  {
    path: "src/pages/legal/terms.astro",
    removals: [
      { from: "// 骨架页：内容未通过法务审核前保持 noindex，审核通过后移除 noindex 并补全条款\n", to: "" },
      { from: "  noindex\n", to: "" },
      { from: "（草稿）", to: new Date().toISOString().slice(0, 10) },
      { from: "⚠️ 本页为占位草稿，尚未通过法务审核，正式上线前需由专业人员审定。", to: "本页内容已通过法务审核（DS-202609-08）。" },
    ],
  },
  {
    path: "src/pages/legal/disclaimer.astro",
    removals: [
      { from: "// 骨架页：内容未通过法务审核前保持 noindex，审核通过后移除 noindex 并补全条款\n", to: "" },
      { from: "  noindex\n", to: "" },
      { from: "（草稿）", to: new Date().toISOString().slice(0, 10) },
      { from: "⚠️ 本页为占位草稿，尚未通过法务审核，正式上线前需由专业人员审定。", to: "本页内容已通过法务审核（DS-202609-08）。" },
    ],
  },
  {
    path: "astro.config.mjs",
    removals: [
      { from: "      filter: (page) => !page.includes(\"/legal/\") && !page.includes(\"/search/\"),\n", to: "      filter: (page) => !page.includes(\"/search/\"),\n" },
      { from: "  // legal 三页为 noindex 草稿（P1-10 法务审核后移除 noindex 时同步去掉 filter 排除）；\n", to: "  // legal 三页已通过法务审核（DS-202609-08），正常收录；/search/ 仍为 noindex 功能页；\n" },
    ],
  },
  {
    path: "src/components/SiteFooter.astro",
    removals: [
      { from: "// legal 三页为骨架草稿（noindex），内容通过法务审核后移除 noindex 正式收录\n", to: "// legal 三页已通过法务审核（DS-202609-08），正式收录\n" },
    ],
  },
  {
    path: "scripts/smoke-dist.mjs",
    removals: [],
    note: "页数仍 75（legal 已建，仅去 noindex/sitemap filter，sitemap URL+1 但 page 数不变）；不动断言",
  },
];

const BACKUP_DIR = join(ROOT, ".tmp-legal-backup");

async function main() {
  console.log(`\n🔍 M-01 法务反馈后切换脚本（${DRY_RUN ? "DRY-RUN 预览模式" : "EXECUTE 执行模式"}）`);
  console.log(`📋 涉及 ${FILES.length} 个文件，共 ${FILES.reduce((a, f) => a + f.removals.length, 0)} 处修改`);
  console.log(`📅 计划生效日期：${new Date().toISOString().slice(0, 10)}（写入各页"最近更新"）`);
  console.log(`🆔 双签编号：DS-202609-08\n`);

  if (!DRY_RUN) {
    console.log("💾 备份原文件到 .tmp-legal-backup/");
    const { mkdir } = await import("node:fs/promises");
    await mkdir(BACKUP_DIR, { recursive: true });
  }

  for (const file of FILES) {
    const full = join(ROOT, file.path);
    const original = await readFile(full, "utf8");
    let next = original;
    let hitCount = 0;

    for (const r of file.removals) {
      if (next.includes(r.from)) {
        if (r.from === r.to) {
          // 自反替换（占位用），不计入命中也不修改
          continue;
        }
        next = next.replace(r.from, r.to);
        hitCount++;
      } else {
        console.warn(`   ⚠️ 未匹配（可能已修改）：${file.path} → ${r.from.slice(0, 50)}…`);
      }
    }

    if (file.note) console.log(`   ℹ️  ${file.path}: ${file.note}`);

    if (hitCount === 0) {
      console.log(`   ⏭️  ${file.path}: 无需变更`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`   📝 ${file.path}: 计划 ${hitCount} 处变更（未落地）`);
    } else {
      const backupName = file.path.replace(/\//g, "__");
      await writeFile(join(BACKUP_DIR, backupName), original, "utf8");
      await writeFile(full, next, "utf8");
      console.log(`   ✅ ${file.path}: ${hitCount} 处已变更（备份已保存）`);
    }
  }

  console.log(DRY_RUN ? "\n⚠️  DRY-RUN 完成。加 --execute 落地。" : "\n✅ 切换完成。建议立即执行：\n   PATH=/usr/bin:$PATH /usr/bin/pnpm verify:dist\n   git add -A && git commit -m 'docs(M-01): 法务审核通过 — legal 三页正式收录' && git push");
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});