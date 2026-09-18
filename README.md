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

1. 执行 `npm run build`。
2. 打开 Chrome 的 `chrome://extensions`。
3. 开启“开发者模式”。
4. 选择“加载已解压的扩展程序”，选择项目下的 `dist/` 目录。

选中网页中的 JSON 后右键选择“用 JSON Lens 打开”，扩展会在独立标签页载入选区内容。核心处理全部在浏览器本地完成，不申请站点访问权限。
