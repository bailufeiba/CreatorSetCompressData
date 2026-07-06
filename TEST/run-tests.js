const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const scriptPath = path.join(projectRoot, "SetCompressData.js");

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runTool(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

function createMetaData(hasCompressSettings) {
  const userData = {
    type: "sprite-frame",
    fixAlphaTransparencyArtifacts: false,
    hasAlpha: true,
    redirect: "a9bb0cde-3a72-444d-92ec-03dc77f7f98f@6c48a",
  };

  if (hasCompressSettings) {
    userData.compressSettings = {
      useCompressTexture: true,
    };
  }

  return {
    ver: "1.0.0",
    importer: "image",
    userData,
  };
}

function assertSuccess(result) {
  assert.strictEqual(
    result.status,
    0,
    `Expected exit code 0.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
  );
}

function main() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "set-compress-data-"));
  const targetDir = path.join(fixtureRoot, "assets");
  const ignorePath = path.join(fixtureRoot, "SetCompressDataIgnore.json");

  const rootIgnored = path.join(targetDir, "root-ignore.png.meta");
  const rootProcessed = path.join(targetDir, "root-process.png.meta");
  const nestedIgnored = path.join(targetDir, "ui", "nested-ignore.png.meta");
  const nestedProcessed = path.join(targetDir, "ui", "nested-process.png.meta");
  const nonTarget = path.join(targetDir, "ui", "plain.meta");

  writeJson(rootIgnored, createMetaData(false));
  writeJson(rootProcessed, createMetaData(false));
  writeJson(nestedIgnored, createMetaData(false));
  writeJson(nestedProcessed, createMetaData(false));
  writeJson(nonTarget, createMetaData(false));
  writeJson(ignorePath, ["root-ignore.png.meta", "ui/nested-ignore.png.meta"]);

  const enableResult = runTool([targetDir, "true", ignorePath]);
  assertSuccess(enableResult);
  assert.match(enableResult.stdout, /======All Completed======/);
  assert.match(enableResult.stdout, /Ignored files:/);
  assert.match(enableResult.stdout, new RegExp(rootIgnored.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")));
  assert.match(enableResult.stdout, new RegExp(nestedIgnored.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")));

  assert.strictEqual(readJson(rootIgnored).userData.compressSettings, undefined);
  assert.strictEqual(readJson(nestedIgnored).userData.compressSettings, undefined);
  assert.deepStrictEqual(readJson(rootProcessed).userData.compressSettings, {
    useCompressTexture: true,
  });
  assert.deepStrictEqual(readJson(nestedProcessed).userData.compressSettings, {
    useCompressTexture: true,
  });
  assert.strictEqual(readJson(nonTarget).userData.compressSettings, undefined);

  const disableResult = runTool([targetDir, "false", ignorePath]);
  assertSuccess(disableResult);

  assert.deepStrictEqual(readJson(rootIgnored).userData.compressSettings, undefined);
  assert.deepStrictEqual(readJson(nestedIgnored).userData.compressSettings, undefined);
  assert.strictEqual(readJson(rootProcessed).userData.compressSettings, undefined);
  assert.strictEqual(readJson(nestedProcessed).userData.compressSettings, undefined);

  console.log("All tests passed");
}

main();
