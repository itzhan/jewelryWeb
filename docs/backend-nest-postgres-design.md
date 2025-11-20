# 定制珠宝后台服务设计（NestJS + PostgreSQL）

> 目标：基于现有前端（石头筛选 + 产品列表），用 NestJS + PostgreSQL 实现一套干净的后端服务，仅覆盖：  
> - 石头筛选接口（支持所有现有前端过滤条件）；  
> - 产品类型 / 产品列表 / 产品详情接口；  
> - 统一的错误处理与返回结构。  
> 暂不实现“定制组合、购物车、订单、支付”等后续功能。

数据库结构参考：`docs/customization-db-schema.md`。

---

## 一、整体架构概览

### 1. 技术栈

- 框架：NestJS（基于 `@nestjs/core`, `@nestjs/common`）。
- ORM：TypeORM（推荐）或 Prisma（二选一，这里以 TypeORM 为例）。
- 数据库：PostgreSQL。
- 配置：`@nestjs/config` 读取 `.env`（数据库连接、端口等）。

### 2. 模块划分

建议模块：

- `DatabaseModule`：数据库连接和实体注册。
- `StonesModule`：石头相关（库存 + 过滤项）。
- `ProductsModule`：产品类型 / 产品 / 图片。
- `CommonModule`：公共工具（拦截器、异常过滤器、分页 DTO 等）。

目录示例：

- `src/app.module.ts`
- `src/config`（配置）
- `src/common`（拦截器、管道、DTO 基类）
- `src/database`（数据库 module / config）
- `src/stones`（石头 domain）
- `src/products`（产品 domain）

---

## 二、实体设计（TypeORM + PostgreSQL）

以下实体与 `customization-db-schema.md` 对应，只列出关键字段。

### 1. 石头相关实体

#### 1.1 `StoneShape`（stone_shapes）

- `id: number`（PK, smallint）
- `code: string`（唯一，例如 `round`）
- `displayName: string`
- `description?: string`
- `displayOrder: number`
- `isActive: boolean`
- 关系：`shapes` 一对多 `Stone`。

#### 1.2 `StoneColorGrade`（stone_color_grades）

- `id: number`
- `code: string`（`D` / `E` / ...）
- `displayName: string`
- `description?: string`
- `displayOrder: number`
- `isActive: boolean`
- 关系：一对多 `Stone`。

#### 1.3 `StoneClarityGrade`（stone_clarity_grades）

- 字段同理：`id`, `code`, `displayName`, `description`, `displayOrder`, `isActive`。

#### 1.4 `StoneCutGrade`（stone_cut_grades）

- `id`, `code`（`good` / `veryGood` / `excellent`）, `displayName`, `description`, `displayOrder`, `isActive`。

#### 1.5 `StoneCertificate`（stone_certificates）

- `id`, `code`（`GIA` / `IGI`）, `displayName`, `website?`, `isActive`。

#### 1.6 `Stone`（stones）

- `id: number`
- `type: 'natural' | 'lab_grown'`（Postgres `enum` 或 `varchar` + 校验）
- `shape: StoneShape`（ManyToOne）
- `carat: number`
- `colorGrade: StoneColorGrade`（ManyToOne）
- `clarityGrade: StoneClarityGrade`（ManyToOne）
- `cutGrade: StoneCutGrade`（ManyToOne）
- `certificate?: StoneCertificate`（ManyToOne, nullable）
- `ratio: number`
- `lengthMm?: number`
- `widthMm?: number`
- `depthMm?: number`
- `price: number`
- `currency: string`（3 字符，如 `USD`）
- `isAvailable: boolean`
- `createdAt: Date`
- `updatedAt: Date`

索引建议：

- `(shape_id, carat, color_grade_id, clarity_grade_id, cut_grade_id, price)` 组合索引用于筛选。

### 2. 产品相关实体

#### 2.1 `ProductCategory`（product_categories）

- `id: number`
- `code: string`（`necklace` / `earring` / `ring` / `pendant`）
- `name: string`
- `description?: string`
- `displayOrder: number`
- `createdAt`, `updatedAt`
- 关系：一对多 `Product`。

#### 2.2 `Product`（products）

- `id: number`
- `category: ProductCategory`（ManyToOne）
- `name: string`（如 `The Amelia`）
- `sku: string`
- `basePrice: number`
- `currency: string`
- `defaultImageUrl: string`
- `availableColors: string[]`（Postgres `text[]`，映射前端 `["white","yellow","rose"]`）
- `description: string`
- `minCarat?: number`
- `maxCarat?: number`
- `isCustomizable: boolean`
- `createdAt`, `updatedAt`
- 关系：一对多 `ProductImage`。

#### 2.3 `ProductImage`（product_images）

- `id: number`
- `product: Product`（ManyToOne）
- `imageUrl: string`
- `altText: string`
- `badge?: string`
- `aspectRatio: 'square' | 'portrait'`
- `sortOrder: number`
- `isPrimary: boolean`
- `createdAt: Date`

---

## 三、API 设计（HTTP 接口）

### 1. 通用返回结构

建议统一为：

```ts
interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}
```

错误使用 Nest 内置 `HttpException`，由全局 `ExceptionFilter` 统一转成：

```ts
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string; // 错误类型或简短描述
}
```

### 2. 石头相关接口（`/stones`）

#### 2.1 获取过滤项枚举

- `GET /stones/filters`
- 说明：一次性返回 shapes / colors / clarity / cut / certificates，供前端构建筛选 UI。
- 响应：

```ts
type StoneFiltersResponse = ApiResponse<{
  shapes: { code: string; label: string }[];
  colors: { code: string; label: string }[];
  clarities: { code: string; label: string }[];
  cuts: { code: string; label: string }[];
  certificates: { code: string; label: string }[];
}>;
```

实现要点：

- 从 `stone_shapes` 等表中查询 `isActive = true` 的记录；
- 使用 `display_order` 排序。

#### 2.2 按条件分页查询石头

- `GET /stones`
- 查询参数（与前端 `StoneFilters` / `selectedShape` 对齐）：

```ts
interface ListStonesQuery {
  page?: number;          // 默认 1
  pageSize?: number;      // 默认 20
  shape?: string;         // 例如 'round'
  color?: string[];       // 多选，例如 ['D','E','F']
  clarity?: string[];     // ['VS1','VVS1', ...]
  cut?: string;           // 'excellent'
  minCarat?: number;
  maxCarat?: number;
  minBudget?: number;
  maxBudget?: number;
  certificate?: string[]; // ['GIA','IGI']
  type?: 'natural' | 'lab_grown';
}
```

- 响应：

```ts
type ListStonesResponse = ApiResponse<{
  items: {
    id: number;
    type: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    certificate?: string;
    ratio: number;
    price: number;
    currency: string;
  }[];
}>;
```

实现要点（Service 中）：

- 使用 QueryBuilder，join 各枚举表：
  - `stone_shapes` / `stone_color_grades` / `stone_clarity_grades` / `stone_cut_grades` / `stone_certificates`。
- 按前端字段做 where 映射（与 `customization-db-schema.md` 中示例 SQL 一致）。
- 分页逻辑通过 `LIMIT` / `OFFSET` 或 `take` / `skip` 实现。

#### 2.3 获取石头详情

- `GET /stones/:id`
- 用途：如果后面详情页需要查看单颗石头详细信息。
- 响应包含：
  - 基础字段；
  - shape/color/clarity/cut/certificate 的人类可读名称。

### 3. 产品相关接口（`/products`）

#### 3.1 获取产品类型列表

- `GET /products/categories`
- 响应：

```ts
type ListCategoriesResponse = ApiResponse<{
  items: {
    id: number;
    code: string;
    name: string;
    description?: string;
  }[];
}>;
```

用途：如果后续前端要做 “项链 / 耳钉 / 戒指” 顶部切 tab。

#### 3.2 获取产品列表（支持按类型过滤）

- `GET /products`
- 查询参数：

```ts
interface ListProductsQuery {
  categoryCode?: string; // necklace / earring / ring / pendant
  page?: number;
  pageSize?: number;
}
```

- 响应：

```ts
type ListProductsResponse = ApiResponse<{
  items: {
    id: number;
    name: string;
    price: number;
    currency: string;
    image: string;
    colors: ('white' | 'yellow' | 'rose')[];
  }[];
}>;
```

说明：结构基本对齐前端的 `StepOneProduct`。

#### 3.3 获取产品详情（含图集）

- `GET /products/:id`
- 响应：

```ts
type ProductDetailResponse = ApiResponse<{
  id: number;
  name: string;
  sku: string;
  basePrice: number;
  currency: string;
  description: string;
  category: { code: string; name: string };
  availableColors: string[];
  images: {
    url: string;
    alt: string;
    badge?: string;
    aspect: 'square' | 'portrait';
  }[];
}>;
```

用途：驱动 `ProductContainer` 和 `ProductDetails` 所需的信息。

---

## 四、模块与服务层设计（Nest）

### 1. StonesModule

- `stones.module.ts`
  - 导入：`TypeOrmModule.forFeature([Stone, StoneShape, StoneColorGrade, StoneClarityGrade, StoneCutGrade, StoneCertificate])`
- `stones.service.ts`
  - 方法：
    - `getFilters()`：查询并组装所有枚举表数据。
    - `findAll(query: ListStonesQuery)`：按条件分页查询。
    - `findOne(id: number)`：根据 id 获取详情。
- `stones.controller.ts`
  - 路由：
    - `GET /stones/filters` → `getFilters()`
    - `GET /stones` → `findAll(query)`
    - `GET /stones/:id` → `findOne(id)`

### 2. ProductsModule

- `products.module.ts`
  - 导入：`TypeOrmModule.forFeature([ProductCategory, Product, ProductImage])`
- `products.service.ts`
  - 方法：
    - `getCategories()`
    - `findAll(query: ListProductsQuery)`
    - `findOne(id: number)`
- `products.controller.ts`
  - 路由：
    - `GET /products/categories`
    - `GET /products`
    - `GET /products/:id`

### 3. CommonModule

按需包含：

- 全局异常过滤器 `HttpExceptionFilter`。
- 日志拦截器、响应包装拦截器等。

在 `main.ts` 中：

- 设置全局前缀如 `/api`；
- 注册全局管道（ValidationPipe）；
- 注册全局过滤器 / 拦截器。

---

## 五、配置与环境变量

### 1. 环境变量示例（`.env`）

```bash
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASS=your_db_password
```

### 2. `DatabaseModule` 配置要点

- 使用 `TypeOrmModule.forRootAsync` + `ConfigModule`：
  - 从环境变量读取 host / port / username / password / database。
  - `synchronize` 仅在开发环境开启。
  - `entities` 指向 `src/**/*.entity.ts`。

依赖安装（你后面手动执行即可）：

- Nest + TypeORM + Postgres 驱动（示例命令）：

```bash
pnpm add @nestjs/typeorm typeorm pg
pnpm add @nestjs/config
```

---

## 六、与前端对接小结

- 前端筛选石头：
  - 初次加载：调用 `GET /stones/filters` 获取所有过滤选项；
  - 用户调整过滤：调用 `GET /stones` 携带 query 参数，返回分页列表用于填充 `DiamondGrid`。
- 前端产品列表与详情：
  - StepOne 商品列表：`GET /products?categoryCode=pendant`；
  - 商品详情页：`GET /products/:id`，填充 `ProductContainer` 和 `ProductDetails`。
- 当前「选石头 + 选产品」的组合：
  - 仅在前端状态（React state）里拼接，不入库；
  - 未来要做购物车 / 支付时，可以在此设计基础上新加“定制组合 + 订单”相关表和接口。

