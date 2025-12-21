# Shopify Headless 对接指南（基于当前代码结构）

> 目标：保留 Next.js 前端（`jewelryWeb`），外部托管，只接入 Shopify 后端（Storefront API）。
> 本文基于你当前项目结构编写，重点说明哪些文件需要改、如何映射数据、以及具体接入步骤。

---

## 0. 你当前代码的关键数据入口（已检查）

前端所有业务数据都集中在 `src/lib/backend.ts`，并被以下组件调用：

- `src/components/StepExperience.tsx`
  - `fetchPendantProducts` / `fetchProductDetail` / `fetchStoneDetail`
- `src/components/DiamondGrid.tsx`
  - `fetchStones`
- `src/components/StoneSelectionSection.tsx`
  - `fetchStoneFilters`
- `src/components/ProductContainer.tsx`
  - `fetchProductDetail` / `fetchStoneDetail` / `fetchStoneFilters` / `fetchProductCategories`
- `src/components/StepOneLanding.tsx`
  - `fetchProductDetail`
- `src/components/AddSettingModal.tsx`
  - `fetchProductCategories`
- `src/components/ProductDetails.tsx`
  - `fetchMaterials` / `fetchStoneFilters`

因此，**你只需要把 `src/lib/backend.ts` 替换为 Shopify 适配层**，就能最大程度保持现有 UI 逻辑不改。

---

## 1. Shopify 侧数据建模建议（对接要点）

你的页面有“饰品（Setting）+ 石头（Stone）”的组合逻辑。Shopify 没有“钻石库”内置结构，需要你自定义数据。这里给你两种可行方案：

### 方案 A（推荐，最少改 UI）：
**把 Stone 也建成 Shopify 商品**，并放在单独集合里。

- 集合（Collection）
  - `pendant`（吊坠/项链）
  - `ring`（戒指）
  - `earring`（耳饰）
  - `stones`（钻石/宝石集合）

- 商品（Product）
  - Setting 商品：常规商品
  - Stone 商品：每颗钻一个商品，价格就是钻石价格

- Stone 商品必备字段（推荐用 metafield）：
  - `stone.carat`（number）
  - `stone.color`（text）
  - `stone.clarity`（text）
  - `stone.cut`（text）
  - `stone.shape`（text）
  - `stone.ratio`（number）
  - `stone.certificate`（text）
  - `stone.type`（text，lab_grown / natural）
  - `stone.m1`/`stone.m2`/`stone.m3`（数字，尺寸）
  - `stone.primary_image`（可用产品主图代替）

> 这样前端可以直接把石头当商品展示，也能直接加入购物车结算（最省事）。

### 方案 B（更复杂，不推荐现在做）：
**Stone 用 Metaobject 存储，前端只展示，不直接结算。**
这种方式无法直接结算石头价格，需要额外的自定义结算逻辑或 App，不适合当前项目。

---

## 2. Shopify 后台准备步骤（必须做）

1. **创建 Headless 销售渠道（可选但推荐）**
2. **创建自定义 App → 打开 Storefront API**
3. **勾选权限**（至少）：
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_products`
   - `unauthenticated_write_checkouts`（或购物车相关）
4. **生成 Storefront Access Token**
5. **确认商品已发布到对应集合**（前端要按集合读取）
6. **为 Stone 和 Setting 设置 metafields**（见上方字段建议）

---

## 3. 前端环境变量配置

在 `jewelryWeb` 下新增/更新：

```
SHOPIFY_STORE_DOMAIN=你的店铺域名（xxx.myshopify.com）
SHOPIFY_STOREFRONT_ACCESS_TOKEN=你的token
SHOPIFY_API_VERSION=2024-10（示例，按你后台支持版本填写）
```

> 如果你打算在浏览器直接请求（不走后端代理），可将 token 改为 `NEXT_PUBLIC_` 前缀。

---

## 4. 对接改造方式（推荐：替换 backend.ts 适配层）

### 4.1 新增 Shopify 请求封装
建议新建：`src/lib/shopify.ts`

主要功能：封装 Storefront GraphQL 请求。

伪代码结构：
```ts
export async function shopifyFetch<T>(query: string, variables?: Record<string, any>) {
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}
```

### 4.2 官方文档示例（Storefront API Learning Kit）

以下 GraphQL 示例来自 Shopify 官方 Storefront API Learning Kit，用于确认**集合商品读取**和**购物车加购**的标准写法：

**按集合 handle 读取商品列表**（用来替代你当前的 `fetchPendantProducts` / `fetchStones`）：
```graphql
query getProductsInCollection($handle: String!) {
  collection(handle: $handle) {
    id
    title
    products(first: 50, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          title
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
}
```

**购物车加购（cartLinesAdd）**（用于“Add pendant / Checkout”流程）：
```graphql
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      lines {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

> 这些示例能直接映射到你当前的列表与加购需求。真实项目里把字段补全即可。

### 4.3 改造 `src/lib/backend.ts`

保留函数名不变，把内部实现改成 Shopify 调用并映射返回数据，重点函数如下：

#### `fetchPendantProducts()`
- Shopify 查询：读取 `pendant` 集合商品列表
- 映射到 `BackendProductSummary`

#### `fetchProductDetail(id)`
- Shopify 查询：按 `handle` 或 `id` 取详情
- 映射到 `ProductDetailDto`

#### `fetchStones(params)`
- Shopify 查询：读取 `stones` 集合商品
- 在前端做筛选（颜色、切工、carat、预算）

#### `fetchStoneDetail(id)`
- Shopify 查询：按 `handle` 或 `id` 获取 stone 商品详情

#### `fetchStoneFilters()`
- 两种方式：
  1) 遍历 stones 商品列表，动态聚合颜色/净度/切工/形状
  2) 在 Shopify 建 `stone_filters` metaobject，直接读

#### `fetchMaterials()`
- 可从 setting 商品的 `option`（如 Metal）读取
- 或用 metaobject 自定义材料列表

#### `fetchProductCategories()`
- 直接返回固定 3 个 category（pendant/ring/earring）
- 或使用 collection + metafield（icon svg）

---

## 5. ID / URL 参数改造建议（非常关键）

你当前代码使用 **数字 ID**：
- `StepExperience` 会从 URL 解析 `productId` / `stoneId` 为数字
- Shopify 的产品 ID 是 `gid://shopify/Product/xxxx`（字符串）

推荐做法（二选一）：

### 方案 1（推荐）：改成使用 `handle`
- URL 参数用 `productHandle` / `stoneHandle`
- `StepOneProduct.id` 改成 `string`
- 所有解析方法改为 `string`

### 方案 2：继续用数字 ID（兼容）
- Storefront API 请求时构造 `gid://shopify/Product/数字`
- 但你需要确保能拿到 `legacyResourceId`

**建议选方案 1，改动更彻底但最稳定。**

---

## 6. 购物车/结账（可选，但建议提前规划）

Shopify 推荐用 Storefront API 的 `cartCreate` / `cartLinesAdd`。

如果你把 Stone 当商品：
- 购物车里同时加入 “Setting 商品” + “Stone 商品”
- 结账时跳转 `cart.checkoutUrl`

如果你想把 Stone 附加到 Setting 上：
- 可以用 `cartAttributes` / `lineAttributes` 保存 stone 信息
- 但价格仍取决于商品本身

**参考（官方 Storefront API Learning Kit 中的 cartLinesAdd 示例）：**
```graphql
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart { id }
    userErrors { field message }
  }
}
```

---

## 7. 当前 UI 与 Shopify 字段映射建议（关键对照表）

| 前端需要字段 | 当前来源 | Shopify 建议来源 |
|---|---|---|
| `BackendProductSummary.id` | 后端数字 | `product.handle` 或 `id` |
| `name` | `product.name` | `product.title` |
| `price` | `basePrice` | `priceRange.minVariantPrice.amount` |
| `image` | `image` | `featuredImage.url` |
| `colors` | `availableColors` | 商品 `option` 或 `metafield` |
| `Stone.carat` | 后端字段 | `metafield: stone.carat` |
| `Stone.color` | 后端字段 | `metafield: stone.color` |
| `Stone.clarity` | 后端字段 | `metafield: stone.clarity` |
| `Stone.cut` | 后端字段 | `metafield: stone.cut` |
| `Stone.shape` | 后端字段 | `metafield: stone.shape` |
| `Stone.price` | 后端字段 | `variant.price` |
| `Stone.primaryImageUrl` | 后端字段 | `featuredImage.url` |
| 分类图标 | `product.category.iconSvg` | collection metafield (icon_svg) |

---

## 8. 对接步骤清单（按顺序操作）

1. **Shopify 后台完成：**
   - 建好 4 个集合：`pendant` / `ring` / `earring` / `stones`
   - 为 Stone 商品添加 metafield 字段
   - 生成 Storefront Access Token

2. **前端新增环境变量**
   - `SHOPIFY_STORE_DOMAIN`
   - `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
   - `SHOPIFY_API_VERSION`

3. **新增 `src/lib/shopify.ts`**
4. **改造 `src/lib/backend.ts` → Shopify 适配层**
5. **处理 ID 逻辑**（推荐改为 handle）
6. **检查所有调用处是否需要调整参数名称**
7. **部署到 Vercel/Netlify**

---

## 9. 可选优化（后期再做）

- 使用 Shopify Search & Discovery / Algolia 做筛选加速
- 如果石头数据量大，考虑另建搜索服务（比如独立 API）
- 用 `cartCreate` + `cartLinesAdd` 完成完整下单链路

---

## 10. 如果你要我帮你直接改代码

你可以直接告诉我：
- 你选择 **handle 还是 id** 作为主键
- Shopify 里 `pendant/ring/earring/stones` 的集合是否已建好
- 你想先做哪些页面（例如：只做列表 + 详情）

我可以帮你：
- 改 `backend.ts`
- 新增 `shopify.ts`
- 把 StepExperience 的参数逻辑改为 handle

---

如需安装依赖（例如 `graphql-request` 或 Shopify SDK），你手动运行：
```
pnpm add graphql-request
```
或
```
pnpm add @shopify/storefront-api-client
```

但你也可以不装任何依赖，直接用 `fetch`。
