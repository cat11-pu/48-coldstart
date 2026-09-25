// plan.js：加载顺序（基线：按输入顺序、不看依赖）
export function order(parts) {
  return parts.map((part) => part.id);
}
