import assert from "node:assert";
import { order } from "../plan.js";
import { load } from "../loader.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const parts = [{ id: "a", size: 1, deps: [], priority: 1 }];

check("order returns ids", () => {
  assert.deepStrictEqual(order(parts), ["a"]);
});

check("load returns loaded list", () => {
  assert.ok(Array.isArray(load(parts, 4, -1, []).loaded));
});

check("load reports skipped", () => {
  assert.strictEqual(typeof load(parts, 4, -1, []).skipped, "number");
});

check("load reports deferred list", () => {
  assert.ok(Array.isArray(load(parts, 4, -1, []).deferred));
});

check("render exposes budget_used", () => {
  assert.strictEqual(typeof render({ parts: parts, budget: 4, cancel_after: -1, done: [] }).budget_used, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
