// loader.js：按 plan.order 的顺序线性装入，单遍扫描（十万分片不重排）。
// - 累计大小不超过 budget；装不下的记入 deferred（不静默丢弃）。
// - 装入动作达到 cancelAfter 次后停止，cancelled_at 记录停止时的装入次数。
// - done 中的分片视为已完成：计入 skipped、不重复装入；resumed_from 为首个已完成分片在顺序中的位置。
import { order } from "./plan.js";

export function load(parts, budget, cancelAfter, done) {
  const sequence = order(parts);
  const sizeById = new Map();
  for (const part of parts) sizeById.set(part.id, part.size);

  const doneSet = new Set(done || []);
  const loaded = [];
  const deferred = [];
  let skipped = 0;
  let resumedFrom = -1;
  let budgetUsed = 0;
  let installs = 0;
  let cancelledAt = -1;

  for (let position = 0; position < sequence.length; position += 1) {
    const id = sequence[position];

    if (doneSet.has(id)) {
      skipped += 1;
      if (resumedFrom === -1) resumedFrom = position;
      continue;
    }

    if (cancelledAt !== -1) break;

    const size = sizeById.get(id);
    if (budgetUsed + size <= budget) {
      loaded.push(id);
      budgetUsed += size;
      installs += 1;
      if (cancelAfter >= 0 && installs >= cancelAfter) cancelledAt = installs;
    } else {
      deferred.push(id);
    }
  }

  if (resumedFrom === -1) resumedFrom = 0;

  return {
    order: sequence,
    loaded,
    resumed_from: resumedFrom,
    skipped,
    deferred,
    cancelled_at: cancelledAt,
    budget_used: budgetUsed,
  };
}
