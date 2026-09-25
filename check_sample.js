import fs from "node:fs";
import { order } from "./plan.js";
import { load } from "./loader.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/startup.json", "utf8"));
const list = order(spec.parts);
const result = load(spec.parts, spec.budget, spec.cancel_after, spec.done || []);
const view = render(spec);

emit("加载顺序 =", JSON.stringify(list));
emit("已加载分片 =", JSON.stringify(result.loaded));
emit("中断位置 =", result.cancelled_at);
emit("续传起点 =", result.resumed_from);
emit("重复跳过的分片数 =", result.skipped);
emit("因依赖未满足推迟的分片 =", JSON.stringify(result.deferred));
emit("预算消耗 =", view.budget_used);
emit("依赖成环的错误码 =", spec.cycle_code);


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "加载顺序": [
    "p4",
    "p1",
    "p0",
    "p2",
    "p3"
  ],
  "已加载分片": [
    "p4",
    "p0",
    "p3"
  ],
  "中断位置": 3,
  "续传起点": 1,
  "重复跳过的分片数": 1,
  "因依赖未满足推迟的分片": [
    "p2"
  ],
  "预算消耗": 6,
  "依赖成环的错误码": "E_CYCLE"
};
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
