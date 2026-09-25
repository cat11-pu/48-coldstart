// plan.js：加载顺序。依赖在前（分层拓扑），同层按优先级降序、编号（输入下标）升序。
// 依赖成环抛 E_CYCLE；指向不存在分片的依赖忽略（不阻塞排序）。

function cycleError() {
  const error = new Error("E_CYCLE");
  error.code = "E_CYCLE";
  return error;
}

export function order(parts) {
  const known = new Set();
  for (const part of parts) known.add(part.id);

  const depsOf = new Map();
  for (const part of parts) {
    const deps = [];
    const seen = new Set();
    for (const dep of part.deps || []) {
      if (known.has(dep) && !seen.has(dep)) {
        seen.add(dep);
        deps.push(dep);
      }
    }
    depsOf.set(part.id, deps);
  }

  // 迭代式 DFS 求层级（level = 1 + max(依赖层级)），顺带做环检测。
  // state: 1=访问中, 2=完成；十万分片也不会爆栈。
  const state = new Map();
  const level = new Map();

  for (const root of parts) {
    if (state.get(root.id) === 2) continue;
    state.set(root.id, 1);
    const stack = [[root.id, 0]];
    while (stack.length > 0) {
      const frame = stack[stack.length - 1];
      const id = frame[0];
      const deps = depsOf.get(id);
      if (frame[1] < deps.length) {
        const dep = deps[frame[1]];
        frame[1] += 1;
        const depState = state.get(dep);
        if (depState === 1) throw cycleError();
        if (depState === 2) continue;
        state.set(dep, 1);
        stack.push([dep, 0]);
      } else {
        let lv = 0;
        for (const dep of deps) {
          const depLevel = level.get(dep) + 1;
          if (depLevel > lv) lv = depLevel;
        }
        level.set(id, lv);
        state.set(id, 2);
        stack.pop();
      }
    }
  }

  return parts
    .map((part, index) => ({
      id: part.id,
      level: level.get(part.id),
      priority: part.priority ?? 0,
      index,
    }))
    .sort((a, b) => a.level - b.level || b.priority - a.priority || a.index - b.index)
    .map((item) => item.id);
}
