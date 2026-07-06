const fs = require("fs");
const path = require("path");

function printUsage() {
  console.error("Usage: node ./SetCompressData.js <targetDir> <true|false> [ignoreJsonPath]");
}

function normalizeRelativePath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\/+/, "");
}

function parseCompressFlag(value) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error('Second argument must be "true" or "false".');
}

function loadIgnoreSet(ignoreJsonPath) {
  if (!ignoreJsonPath) {
    return new Set();
  }

  const raw = fs.readFileSync(ignoreJsonPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new Error("Ignore JSON must be an array of strings.");
  }

  return new Set(parsed.map(normalizeRelativePath));
}

function walkMetaFiles(directory) {
  const results = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkMetaFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".png.meta")) {
      results.push(fullPath);
    }
  }

  return results;
}

function mutateMetaFile(filePath, shouldCompress) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!data || typeof data !== "object" || !data.userData || typeof data.userData !== "object" || Array.isArray(data.userData)) {
    throw new Error('Missing object "userData".');
  }

  if (shouldCompress) {
    data.userData.compressSettings = {
      useCompressTexture: true,
    };
  } else {
    delete data.userData.compressSettings;
  }

  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function run(argv) {
  const [targetDirArg, compressFlagArg, ignoreJsonPath] = argv;

  if (!targetDirArg || !compressFlagArg) {
    printUsage();
    return 1;
  }

  let shouldCompress;
  try {
    shouldCompress = parseCompressFlag(compressFlagArg);
  } catch (error) {
    console.error(error.message);
    printUsage();
    return 1;
  }

  const targetDir = path.resolve(targetDirArg);

  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error(`Target directory does not exist or is not a directory: ${targetDir}`);
    return 1;
  }

  let ignoreSet;
  try {
    ignoreSet = loadIgnoreSet(ignoreJsonPath ? path.resolve(ignoreJsonPath) : undefined);
  } catch (error) {
    console.error(`Failed to read ignore JSON: ${error.message}`);
    return 1;
  }

  const ignoredFiles = [];
  let hasErrors = false;

  for (const filePath of walkMetaFiles(targetDir)) {
    const relativePath = normalizeRelativePath(path.relative(targetDir, filePath));

    if (ignoreSet.has(relativePath)) {
      ignoredFiles.push(filePath);
      continue;
    }

    try {
      mutateMetaFile(filePath, shouldCompress);
    } catch (error) {
      hasErrors = true;
      console.error(`Failed to process ${filePath}: ${error.message}`);
    }
  }

  console.log("======All Completed======");
  console.log("Ignored files:");
  for (const filePath of ignoredFiles) {
    console.log(filePath);
  }

  return hasErrors ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = run(process.argv.slice(2));
}

module.exports = {
  normalizeRelativePath,
  parseCompressFlag,
  run,
};
