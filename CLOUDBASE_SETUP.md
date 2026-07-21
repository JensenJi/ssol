# 腾讯云开发（CloudBase）配置指南

## 1. 注册腾讯云账号
访问 https://cloud.tencent.com 注册账号

## 2. 开通云开发服务
1. 登录腾讯云控制台
2. 搜索「云开发 CloudBase」
3. 点击「免费试用」或「开通」
4. 创建一个环境（选择「基础版 1」免费额度）

## 3. 获取环境 ID
1. 进入云开发控制台
2. 在「环境」页面找到你的环境 ID（格式如：`prod-xxxxx`）
3. 复制环境 ID

## 4. 配置项目
打开 `src/lib/cloudbase.ts`，将 `your-env-id` 替换为你的环境 ID：

```typescript
const config = {
  env: 'prod-xxxxx', // 替换为你的环境 ID
};
```

## 5. 配置数据库权限
1. 在云开发控制台进入「数据库」
2. 创建以下集合：
   - `users` - 用户数据
   - `visitors` - 访客记录
3. 设置权限为「所有用户可读，仅创建者可读写」

## 6. 免费额度说明
- 数据库存储：2GB
- 数据库读操作：5 万次/天
- 数据库写操作：3 万次/天
- 云函数调用：10 万次/月
- CDN 流量：5GB/月

## 7. 测试连接
运行项目后，打开浏览器控制台，如果看到：
```
云开发初始化成功
```
说明连接成功。

## 8. 部署（可选）
```bash
npm run build
# 使用腾讯云开发 CLI 部署
tcb hosting deploy dist -e your-env-id
```

## 参考文档
- 云开发文档：https://cloud.tencent.com/document/product/876
- JavaScript SDK：https://cloud.tencent.com/document/product/876/20215
