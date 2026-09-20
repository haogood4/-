// 首页「我的工具」区块渲染（P2-10；数据由 kit 在计算器页写入 localStorage）
import { requireEl } from "./_page-kit";
import {
  browserStore,
  listRecent,
  listFav,
  removeFav,
  type ToolEntry,
} from "../lib/tool-store";

const section = requireEl<HTMLElement>("#my-tools");
const recentBlock = requireEl<HTMLElement>("#recent-block");
const recentList = requireEl<HTMLElement>("#recent-list");
const favBlock = requireEl<HTMLElement>("#fav-block");
const favList = requireEl<HTMLElement>("#fav-list");

const store = browserStore();

function chip(entry: ToolEntry): HTMLAnchorElement {
  const a = document.createElement("a");
  a.className = "chip";
  a.href = entry.h;
  a.textContent = entry.l;
  return a;
}

function render(): void {
  const recent = listRecent(store);
  const favs = listFav(store);

  recentList.textContent = "";
  for (const entry of recent) recentList.appendChild(chip(entry));
  recentBlock.hidden = recent.length === 0;

  favList.textContent = "";
  for (const entry of favs) {
    const wrap = document.createElement("span");
    wrap.className = "my-tools__row";
    wrap.appendChild(chip(entry));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "fav-remove";
    remove.textContent = "移除";
    remove.setAttribute("aria-label", `从收藏中移除 ${entry.l}`);
    remove.addEventListener("click", () => {
      removeFav(store, entry.h);
      render();
    });
    wrap.appendChild(remove);
    favList.appendChild(wrap);
  }
  favBlock.hidden = favs.length === 0;

  section.hidden = recent.length === 0 && favs.length === 0;
}

render();
