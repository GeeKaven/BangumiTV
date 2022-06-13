# BangumiTV

> 在静态页面中渲染你的 Bangumi 追番进度

[![](https://img.shields.io/npm/v/bangumi-tv)](https://www.npmjs.com/package/bangumi-tv) [![](https://img.shields.io/badge/Author-GeeKaven-blueviolet)](https://github.com/GeeKaven) [![](https://img.shields.io/npm/l/bangumi-tv)](https://github.com/geekaven/BangumiTV/blob/main/LICENSE) [![](https://data.jsdelivr.com/v1/package/npm/bangumi-tv/badge)](https://www.jsdelivr.com/package/npm/bangumi-tv)

一个基于 Vercel Severless Function 的 [Bangumi.tv](https://bgm.tv) 追番进度展示页面

## 起源

## Demo
-   https://bangumi-tv.vercel.app

## 安装
### 后端安装
#### 方案一：Vercel
1.  Fork 本项目
2.  在本项目 `Settings -> Secrets -> Actions` 中点击 `New repository secret`，`Name` 填 `BANGUMI_USER`，`Value` 填 ` 你的 bgm.tv 的用户名 `，之后点击 `Add secret` 按钮
3.  前往 Vercel 官网注册或登录。
在 Vercel Dashboard 中点击 New Project，授权 GitHub，选择账户下 Fork 出来的本项目，点击 Deploy 完成部署。
4.  记录下 Vercel 分配的 Production 域名 ( 如 bangumi-tv.vercel.app )

**⚠️Github Action 会每两小时读取用户收藏状况生成数据，如需要可在。github/workflows/buildSubject.yml 中修改 cron**

#### 方案二：自建服务器
1.  Clone 本项目
2.  安装 Node 环境
3.  运行 `npm install` 或 `pnpm install` 安装依赖
4.  设置环境变量
   ```shell
   echo "BANGUMI_USER={你的 bgm.tv 用户名}" >> .env
   ```
5.  生成追番数据 `npm run buildSubject` 或者 `pnpm buildSubject`
6.  启动服务 `npm run start` 或者 `pnpm start`
7.  服务运行在 `localhost:3000` 上，服务器域名，SSL 等自行设置

### 前端安装
在需要添加追番列表的页面中直接引入 CSS 。
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bangumi-tv@latest/dist/bangumi.css">
<script>
  const bgmConfig = {
      apiUrl: "https://bangumi-tv.vercel.app",   // 替换成自己的后端域名
      quote: "生命不止，追番不息！"
    }
</script>
```
在 `</body>` 之前引入 JS
```html
<script src="https://cdn.jsdelivr.net/npm/bangumi-tv@latest/dist/bangumi.js"></script>
```

引入完成后在需要添加番剧进度的地方添加容器
```html
<div class="bgm-container">
</div>
```

## 感谢❤️
-   [Bangumi-Subject](https://github.com/GeeKaven/BangumiTV-Subject) 离线Bgm数据
-   [bangumi/api](https://github.com/bangumi/api) 提供 API
-   [hans362/Bilibili-Bangumi-JS](https://github.com/hans362/Bilibili-Bangumi-JS) 提供前端展示逻辑
-   [AlanDecode/PandaBangumi-Typecho-Plugin](https://github.com/AlanDecode/PandaBangumi-Typecho-Plugin) 提供前端展示样式
-   [HCLonely/hexo-bilibili-bangumi](https://github.com/HCLonely/hexo-bilibili-bangumi) 提供分页逻辑
