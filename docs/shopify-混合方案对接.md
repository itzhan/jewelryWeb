# Shopify 混合方案对接（保持现有 UI / 继续用 Next）

> 目标：保留 `jewelryBackend` 作为数据源，只把下单/结账交给 Shopify（Draft Order / Admin API）。

---

## 1. 必要资源从哪里获取

### 1.1 店铺域名
- Shopify 后台右上角可以看到你的店铺地址：`xxx.myshopify.com`

### 1.2 Admin API Access Token
- 进入 Shopify 后台：
  - `设置 → Apps and sales channels → Develop apps`
  - 新建自定义 App
  - 在 App 配置里启用 **Admin API** 权限
  - 安装 App 后生成 **Admin API Access Token**

### 1.3 Shopify API 版本
- 建议用 Shopify 后台支持的**最新稳定版本**
- 示例：`2024-10`

### 1.4 不需要绑定 Shopify Variant ID
- Draft Order 方案不依赖 Shopify 商品/变体
- 石头/饰品数据仍由 `jewelryBackend` 提供

---

## 2. 前端所需环境变量

在 `jewelryWeb` 根目录设置：

```
NEXT_PUBLIC_BACKEND_URL=http://你的后端地址
```

---

## 3. 已接入位置（前端）

- `src/components/ProductContainer.tsx`
  - “Secure Checkout / Get Payment Link” 已调用后端 `/checkout/draft-order`
  - 成功后跳转或复制 Shopify 付款链接

---

## 4. 后端接口

- `POST /checkout/draft-order`
  - 入参：`productId` / `stoneId`（至少一个）
  - 返回：`invoiceUrl` 付款链接

---

## 5. 结账行为说明

- “Secure Checkout” → 创建 Draft Order 并跳转 `invoiceUrl`
- “Get Payment Link” → 创建 Draft Order 并复制付款链接

---

如需我继续做：
- 自动发送草稿订单发票邮件
- 在管理端显示 Draft Order / invoiceUrl
- 增加订单记录与回写状态

直接告诉我即可。
