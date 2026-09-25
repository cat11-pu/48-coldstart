// plan.js：加载顺序。分层 Kahn 拓扑：依赖在前；同层按优先级降序、编号升序。
function idKey(id) {
  const m = /(\d+)$/.exec(String(id));
  return m ? { numeric: true, value: Number(m[1]) } : { numeric: false, value: String(id) };
}

function compare(a, b) {
  const pa = Number(a.priority) || 0;
  const pb = Number(b.priority) || 0;
  if (pb !== pa) return pb - pa;
  const ka = idKey(a.id);
  const kb = idKey(b.id);
  if (ka.numeric !== kb.numeric) return ka.numeric ? -1 : 1;
  if (ka.numeric) return ka.value - kb.value;
  return ka.value < kb.value ? -1 : ka.value > kb.value ? 1 : 0;
}

export function order(parts) {
  const byId = new Map();
  const indegree = new Map();
  const dependents = new Map();

  for (const part of parts) {
    byId.set(part.id, part);
  }
  for (const part of parts) {
    indegree.set(part.id, (part.deps || []).filter((dep) => byId.has(dep)).length);
  }
  for (const part of parts) {
    for (const dep of part.deps || []) {
      if (byId.has(dep)) {
        let children = dependents.get(dep);
        if (!children) { children = []; dependents.set(dep, children); }
        children.push(part.id);
      }
    }
  }

  let ready = parts.filter((part) => indegree.get(part.id) === 0);
  const result = [];

  while (ready.length > 0) {
    ready.sort(compare);
    const nextReady = [];
    for (const part of ready) {
      result.push(part.id);
      for (const child of dependents.get(part.id) || []) {
        const remaining = indegree.get(child) - 1;
        indegree.set(child, remaining);
        if (remaining === 0) nextReady.push(byId.get(child));
      }
    }
    ready = nextReady;
  }

  if (result.length !== parts.length) {
    const error = new Error("dependency cycle detected");
    error.code = "E_CYCLE";
    throw error;
  }
  return result;
}
