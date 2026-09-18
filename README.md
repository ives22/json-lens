# JSON Lens

JSON Lens 是一个本地优先的 Chrome Manifest V3 扩展，用于格式化、压缩、校验和转换 JSON。

## 开发

```bash
npm install
npm run dev
npm test
npm run build
```

## 安装扩展

### 直接使用

仓库已经包含预构建的 `dist/` 扩展目录，不需要安装 Node.js、执行 `npm install` 或自行打包。

1. 下载仓库 ZIP 并解压。
2. 打开 Chrome 的 `chrome://extensions`。
3. 开启“开发者模式”。
4. 选择“加载已解压的扩展程序”，选择解压后的 `dist/` 目录。

也可以直接下载 [最新 Release 扩展包](https://github.com/ives22/json-lens/releases/latest/download/json-lens-extension.zip)。压缩包根目录已经包含 `manifest.json`，解压后直接选择解压目录加载即可。

### 从源码开发

```bash
npm install
npm run dev
npm test
npm run build
```

网页中选中 JSON 后右键选择“用 JSON Lens 打开选中内容”，可以直接载入选区；没有选中文本时，右键选择“打开 JSON Lens”即可直接打开工具。核心处理全部在浏览器本地完成，不申请站点访问权限。
