# SetCompressData Design

## Goal

Build a pure Node.js command line tool that sets or removes Cocos `.png.meta` compression metadata under a target folder.

## Command

```bash
node ./SetCompressData.js <targetDir> <true|false> [ignoreJsonPath]
```

- `targetDir`: folder to scan recursively.
- `true|false`: `true` adds compression settings, `false` removes them.
- `ignoreJsonPath`: optional JSON file containing relative paths to skip.

## File Matching

The tool recursively scans `targetDir` and processes files whose names end with `.png.meta`.

Ignore entries are interpreted as paths relative to `targetDir`. Path separators are normalized to `/`.

- `aaaa.png.meta` ignores only `<targetDir>/aaaa.png.meta`.
- `ui/aaaa.png.meta` ignores only `<targetDir>/ui/aaaa.png.meta`.

## JSON Mutation

Each target file is parsed as JSON.

When setting compression, the tool writes:

```json
"compressSettings": {
  "useCompressTexture": true
}
```

under the root object's `userData` object.

When disabling compression, the tool removes `userData.compressSettings`.

Files with invalid JSON or missing object-shaped `userData` are reported as errors and the tool continues with the remaining files. If any processing error occurs, the process exits with a non-zero code after printing the completion summary.

## Output

After scanning finishes, the tool prints:

```text
======All Completed======
Ignored files:
<absolute skipped file path>
```

Only files that actually matched an ignore entry and were skipped are printed.
