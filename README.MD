# SetCompressData

一个纯 Node.js 命令行工具，用来批量设置或移除 Cocos `.png.meta` 文件中的压缩标记。

## 环境要求

- Node.js
- 不需要安装第三方依赖

## 用法

```bash
node ./SetCompressData.js <目标文件夹路径> <是否设置压缩> [忽略文件json路径]
```

参数说明：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `<目标文件夹路径>` | 是 | 要递归扫描的资源目录 |
| `<是否设置压缩>` | 是 | `true` 表示设置压缩，`false` 表示取消压缩 |
| `[忽略文件json路径]` | 否 | 忽略列表 JSON 文件路径 |

示例：

```bash
node ./SetCompressData.js D:\Projects\Game\assets true D:\Projects\Game\SetCompressDataIgnore.json
```

取消压缩示例：

```bash
node ./SetCompressData.js D:\Projects\Game\assets false D:\Projects\Game\SetCompressDataIgnore.json
```

## 忽略文件格式

忽略文件是一个 JSON 数组，数组项是相对于目标文件夹的文件路径。

```json
[
  "xxxx.png.meta",
  "ui/aaaa.png.meta"
]
```

说明：

- `xxxx.png.meta` 只忽略目标文件夹根目录下的 `xxxx.png.meta`。
- `ui/aaaa.png.meta` 只忽略目标文件夹下 `ui` 目录里的 `aaaa.png.meta`。
- 路径分隔符支持 `/` 和 `\`，工具内部会统一处理。

## 设置压缩

当第二个参数为 `true` 时，工具会递归读取目标文件夹下所有文件名以 `.png.meta` 结尾的文件。

如果文件没有被忽略，工具会解析 JSON，并在根对象的 `userData` 下写入：

```json
"compressSettings": {
  "useCompressTexture": true
}
```

示例：

```json
"userData": {
  "type": "sprite-frame",
  "fixAlphaTransparencyArtifacts": false,
  "hasAlpha": true,
  "redirect": "a9bb0cde-3a72-444d-92ec-03dc77f7f98f@6c48a"
}
```

设置后：

```json
"userData": {
  "type": "sprite-frame",
  "fixAlphaTransparencyArtifacts": false,
  "hasAlpha": true,
  "redirect": "a9bb0cde-3a72-444d-92ec-03dc77f7f98f@6c48a",
  "compressSettings": {
    "useCompressTexture": true
  }
}
```

## 取消压缩

当第二个参数为 `false` 时，工具会递归读取目标文件夹下所有文件名以 `.png.meta` 结尾的文件。

如果文件没有被忽略，工具会解析 JSON，并移除根对象 `userData` 下的 `compressSettings`。

示例：

```json
"userData": {
  "type": "sprite-frame",
  "fixAlphaTransparencyArtifacts": false,
  "hasAlpha": true,
  "redirect": "a9bb0cde-3a72-444d-92ec-03dc77f7f98f@6c48a",
  "compressSettings": {
    "useCompressTexture": true
  }
}
```

取消后：

```json
"userData": {
  "type": "sprite-frame",
  "fixAlphaTransparencyArtifacts": false,
  "hasAlpha": true,
  "redirect": "a9bb0cde-3a72-444d-92ec-03dc77f7f98f@6c48a"
}
```

## 输出

执行完成后会打印：

```text
======All Completed======
Ignored files:
<被忽略文件的完整路径>
```

`Ignored files` 下面只会打印实际匹配到忽略列表并跳过的文件。

## 错误处理

- 目标文件夹不存在时，工具会报错并退出。
- 第二个参数不是 `true` 或 `false` 时，工具会报错并打印用法。
- 忽略文件不是合法 JSON，或不是字符串数组时，工具会报错并退出。
- 某个 `.png.meta` 文件不是合法 JSON，或缺少对象类型的 `userData` 时，工具会打印该文件错误，继续处理其它文件，最后以非 0 状态码退出。

## 测试

运行：

```bash
node TEST\run-tests.js
```

预期输出：

```text
All tests passed
```
