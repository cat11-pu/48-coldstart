// loader.js：加载与中断（基线：一口气全加载、不记断点）
import { order } from "./plan.js";

export function load(parts, budget, cancelAfter, done) {
  const list = order(parts);
  return { loaded: list, resumed_from: 0, skipped: 0, deferred: [], cancelled_at: -1 };
}
