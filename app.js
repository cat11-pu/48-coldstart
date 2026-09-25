// app.js：渲染结果
import { order } from "./plan.js";
import { load } from "./loader.js";

export function render(spec) {
  const list = order(spec.parts);
  const result = load(spec.parts, spec.budget, spec.cancel_after, spec.done || [], list);
  return { order: list, loaded: result.loaded, resumed_from: result.resumed_from,
           skipped: result.skipped, deferred: result.deferred,
           cancelled_at: result.cancelled_at, budget_used: result.budget_used };
}
