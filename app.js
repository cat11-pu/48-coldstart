// app.js：渲染结果（返回结构固定为七个键，顺序与 loader 共用一次拓扑排序）
import { load } from "./loader.js";

export function render(spec) {
  const result = load(spec.parts, spec.budget, spec.cancel_after, spec.done || []);
  return {
    order: result.order,
    loaded: result.loaded,
    resumed_from: result.resumed_from,
    skipped: result.skipped,
    deferred: result.deferred,
    cancelled_at: result.cancelled_at,
    budget_used: result.budget_used,
  };
}
