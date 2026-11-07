const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/server");

test("provides an API health check without exposing credentials", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.deepEqual(Object.keys(body.providers).sort(), ["igdb", "rawgFallback"]);
  assert.equal(JSON.stringify(body).includes("secret"), false);
});

test("does not allow unconfigured cross-origin requests", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`, {
    headers: { Origin: "https://not-allowed.example" },
  });
  assert.equal(response.status, 403);
});

test("allows localhost development origins on alternate ports", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`, {
    headers: { Origin: "http://localhost:3001" },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:3001");
});

test("allows private LAN origins during development", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`, {
    headers: { Origin: "http://192.168.1.25:3001" },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "http://192.168.1.25:3001");
});

test("validates a missing search query", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/games/search`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Search query is required." });
});
