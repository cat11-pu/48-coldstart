// loader.js：沿拓扑顺序一次线性装入。预算门控、中断点、续传跳过与推迟登记。
import { order } from "./plan.js";

export function load(parts, budget, cancelAfter, done, ordered) {
  const list = ordered || order(parts);
  const byId = new Map();
  for (const part of parts) byId.set(part.id, part);

  const doneSet = new Set(done || []);
  const loaded = [];
  const deferred = [];
  let budgetUsed = 0;
  let actions = 0;
  let skipped = 0;
  let resumedFrom = -1;
  let cancelledAt = -1;

  for (let i = 0; i < list.length; i++) {
    const part = byId.get(list[i]);
    if (!part) continue;

    if (cancelAfter === 0) {
      cancelledAt = 0;
      break;
    }

    if (doneSet.has(part.id)) {
      skipped += 1;
      if (resumedFrom === -1) resumedFrom = i;
      continue;
    }

    const size = Number(part.size) || 0;
    if (budgetUsed + size > budget) {
      deferred.push(part.id);
      continue;
    }

    const depUnmet = (part.deps || []).some((dep) => !byId.has(dep));
    if (depUnmet) {
      deferred.push(part.id);
      continue;
    }

    loaded.push(part.id);
    budgetUsed += size;
    actions += 1;

    if (cancelAfter >= 0 && actions >= cancelAfter) {
      cancelledAt = actions;
      break;
    }
  }

  return {
    loaded,
    resumed_from: resumedFrom,
    skipped,
    deferred,
    cancelled_at: cancelledAt,
    budget_used: budgetUsed
  };
}
