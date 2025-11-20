# 定制珠宝（石头 → 产品）数据库设计

> 结合当前前端代码（`StoneSelectionSection`、`DiamondGrid`、`StepOneLanding`、`ProductContainer`、`ProductDetails`、`CustomizationSteps`），为「先选石头 → 选产品类型/款式」这条链路设计的数据结构说明。  
> 目前**不落地支付与订单表**，支付部分后期再单独设计。

建议默认按关系型数据库（如 MySQL / PostgreSQL）来设计，字段类型仅供参考，可按实际数据库稍作调整。

---

## 一、整体流程与实体

### 1. 流程对应前端

- **步骤 1：选石头**
  - 前端：`StoneSelectionSection` + `DiamondGrid`
  - 使用过滤条件：形状 `selectedShape`、颜色 `color`、净度 `clarity`、切工 `cut`、克拉范围 `carat`、预算 `budget`、证书 `certificate`。
  - 数据实体：
    - `stone_shapes` / `stone_color_grades` / `stone_clarity_grades` / `stone_cut_grades` / `stone_certificates`（过滤条件枚举表）。
    - `stones`（具体石头库存）。

- **步骤 2：选产品类型 + 产品款式**
  - 前端：`StepOneLanding`（当前标题是 Pendants，可拓展为项链 / 耳钉 / 戒指）。
  - 数据实体：
    - `product_categories`：产品类型（necklace / earring / ring / pendant）。
    - `products`：具体款式（如 “The Amelia”、“The Riley”），包含价格、首图、可选颜色等。
    - `product_images`：详情页图集（对应 `ProductContainer` 中的图片数组）。

- **步骤 3：确认搭配（仅前端状态，不入库）**
  - 前端：`ProductContainer` + `ProductDetails`，展示「已选石头 + 已选款式」信息和总价。
  - 数据来源：
    - 石头信息来自后端 `stones` 查询结果；
    - 产品信息来自后端 `products` / `product_images` 查询结果；
    - 当前组合只在前端状态里暂存，**不单独建“定制组合”表**。

---

## 二、核心表结构概览（ER 关系）

### 1. 枚举 / 过滤条件表

- `stone_shapes`（石头形状）
  - 一对多到 `stones.shape_id`。
- `stone_color_grades`（石头颜色等级）
  - 一对多到 `stones.color_grade_id`。
- `stone_clarity_grades`（石头净度等级）
  - 一对多到 `stones.clarity_grade_id`。
- `stone_cut_grades`（石头切工等级）
  - 一对多到 `stones.cut_grade_id`。
- `stone_certificates`（证书机构）
  - 一对多到 `stones.certificate_id`。

### 2. 石头 & 产品相关表

- `stones`（石头库存）
- `product_categories`（产品类型）
  - 一对多到 `products.category_id`。
- `products`（具体款式）
  - 被 `product_images.product_id` 多对一引用。
- `product_images`（产品图片）

> 注：是否需要单独 `users` 表取决于你是否有登录注册体系；如果只是游客下单，可以先不设计用户表。

---

## 三、详细表结构设计

### 1. 过滤条件枚举表

#### 1.1 `stone_shapes` —— 石头形状（Shape）

对应前端：`StoneSelectionSection` 中的 `shapes` 常量（Round / Emerald / Heart / Marquise / Oval / Pear / Princess / Radiant / Cushion / E. Cushion）。

| 字段名        | 类型         | 说明                          | 示例           |
| ------------- | ------------ | ----------------------------- | -------------- |
| `id`          | SMALLINT PK  | 形状 ID                       | 1              |
| `code`        | VARCHAR(32)  | 编码，建议英文小写            | `round`       |
| `display_name`| VARCHAR(64)  | 展示名称（和前端 label 对应） | `Round`       |
| `description` | TEXT NULL    | 描述                          |                |
| `display_order`| INT         | 前端展示排序                  | 1              |
| `is_active`   | BOOLEAN      | 是否启用                      | `true`         |
| `created_at`  | TIMESTAMP    |                               |                |
| `updated_at`  | TIMESTAMP    |                               |                |

#### 1.2 `stone_color_grades` —— 颜色等级（Color）

对应前端：`colorOptions = ["J","I","H","G","F","E","D"]`。

| 字段名        | 类型         | 说明                     | 示例  |
| ------------- | ------------ | ------------------------ | ----- |
| `id`          | SMALLINT PK  | 颜色等级 ID              | 1     |
| `code`        | VARCHAR(4)   | 颜色代码                 | `D`   |
| `display_name`| VARCHAR(16)  | 展示名称                 | `D`   |
| `description` | TEXT NULL    | 解释，如“完全无色”       |       |
| `display_order`| INT         | 排序（J → D 由低到高等） | 1..7  |
| `is_active`   | BOOLEAN      | 是否启用                 | true  |

#### 1.3 `stone_clarity_grades` —— 净度等级（Clarity）

对应前端：`clarityOptions = ["SI1", "VS2", "VS1", "VVS2", "VVS1", "IF", "FL"]`。

| 字段名        | 类型         | 说明              | 示例  |
| ------------- | ------------ | ----------------- | ----- |
| `id`          | SMALLINT PK  | 净度等级 ID       | 1     |
| `code`        | VARCHAR(8)   | 净度代码          | `VS1` |
| `display_name`| VARCHAR(16)  | 展示名称          | `VS1` |
| `description` | TEXT NULL    | 解释              |       |
| `display_order`| INT         | 排序              |       |
| `is_active`   | BOOLEAN      | 是否启用          | true  |

#### 1.4 `stone_cut_grades` —— 切工等级（Cut）

对应前端类型：`StoneCutGrade = "good" | "veryGood" | "excellent"`。

| 字段名        | 类型         | 说明                 | 示例        |
| ------------- | ------------ | -------------------- | ----------- |
| `id`          | SMALLINT PK  | 切工等级 ID          | 1           |
| `code`        | VARCHAR(16)  | 编码                 | `excellent` |
| `display_name`| VARCHAR(32)  | 展示名称             | `Excellent` |
| `description` | TEXT NULL    | 解释                 |             |
| `display_order`| INT         | 排序                 |             |
| `is_active`   | BOOLEAN      | 是否启用             | true        |

#### 1.5 `stone_certificates` —— 证书机构（Certificate）

对应前端：`certificateOptions = ["IGI", "GIA"]`。

| 字段名        | 类型         | 说明                      | 示例   |
| ------------- | ------------ | ------------------------- | ------ |
| `id`          | SMALLINT PK  | 证书机构 ID               | 1      |
| `code`        | VARCHAR(16)  | 编码                      | `GIA`  |
| `display_name`| VARCHAR(64)  | 展示名称                  | `GIA`  |
| `website`     | VARCHAR(255) NULL | 官网链接（可选）     |        |
| `is_active`   | BOOLEAN      | 是否启用                  | true   |
| `created_at`  | TIMESTAMP    |                           |        |
| `updated_at`  | TIMESTAMP    |                           |        |

---

### 2. `stones` —— 石头 / 主石库存

对应前端：`StoneSelectionSection` 中的过滤条件 + `DiamondGrid.sampleDiamonds` 中展示的字段。

| 字段名             | 类型                | 说明                                                                 | 示例                              |
| ------------------ | ------------------- | -------------------------------------------------------------------- | --------------------------------- |
| `id`               | BIGINT PK           | 石头唯一 ID                                                          | 1                                 |
| `type`             | ENUM(`natural`,`lab_grown`) | 石头类型：天然 / 培育                                       | `lab_grown`                       |
| `shape_id`         | SMALLINT FK         | 外键 → `stone_shapes.id`，对应前端 `selectedShape`                |                                   |
| `carat`            | DECIMAL(4,2)        | 克拉数                                                               | `0.70`                            |
| `color_grade_id`   | SMALLINT FK         | 外键 → `stone_color_grades.id`                                      |                                   |
| `clarity_grade_id` | SMALLINT FK         | 外键 → `stone_clarity_grades.id`                                    |                                   |
| `cut_grade_id`     | SMALLINT FK         | 外键 → `stone_cut_grades.id`                                        |                                   |
| `certificate_id`   | SMALLINT FK         | 外键 → `stone_certificates.id`                                      |                                   |
| `ratio`            | DECIMAL(4,2)        | 长宽比（DiamondGrid 中 `ratio`）                                    | `1.35`                            |
| `length_mm`        | DECIMAL(5,2) NULL   | 长（mm），用于详情页尺寸展示                                        | `6.00`                            |
| `width_mm`         | DECIMAL(5,2) NULL   | 宽（mm）                                                             | `6.00`                            |
| `depth_mm`         | DECIMAL(5,2) NULL   | 深度（mm）                                                           | `3.50`                            |
| `price`            | DECIMAL(10,2)       | 石头单价，用于预算过滤 `budget`                                     | `1430.00`                         |
| `currency`         | CHAR(3)             | 币种                                                                 | `USD`                             |
| `is_available`     | BOOLEAN             | 是否可售                                                             | `true`                            |
| `created_at`       | TIMESTAMP           | 创建时间                                                             |                                   |
| `updated_at`       | TIMESTAMP           | 更新时间                                                             |                                   |

**与前端过滤的对应关系示意（伪 SQL）：**

```sql
SELECT s.*
FROM stones s
JOIN stone_shapes sh ON s.shape_id = sh.id
JOIN stone_color_grades cg ON s.color_grade_id = cg.id
JOIN stone_clarity_grades cl ON s.clarity_grade_id = cl.id
JOIN stone_cut_grades cu ON s.cut_grade_id = cu.id
LEFT JOIN stone_certificates sc ON s.certificate_id = sc.id
WHERE
  sh.code = :selectedShape
  AND s.carat BETWEEN :minCarat AND :maxCarat
  AND cg.code = ANY(:colors)         -- 对应 StoneFilters.color
  AND cl.code = ANY(:clarities)      -- 对应 StoneFilters.clarity
  AND cu.code = :cut                 -- 对应 StoneFilters.cut
  AND s.price BETWEEN :minBudget AND :maxBudget
  AND ( :certificates IS NULL OR sc.code = ANY(:certificates) ); -- 对应 StoneFilters.certificate
```

---

### 3. `product_categories` —— 产品类型（项链 / 耳钉 / 戒指 / 吊坠）

对应你的业务中的「选择要制作的产品类型」这一步。

| 字段名         | 类型        | 说明                                   | 示例            |
| -------------- | ----------- | -------------------------------------- | --------------- |
| `id`           | SMALLINT PK | 类型 ID                                | 1               |
| `code`         | VARCHAR(32) UNIQUE | 英文编码（用于程序和枚举）          | `necklace`      |
| `name`         | VARCHAR(64) | 展示名称（可中文）                     | `项链`          |
| `description`  | TEXT NULL   | 说明文案                               | `定制项链`      |
| `display_order`| INT         | 在前端列表中的排序                     | 1               |
| `created_at`   | TIMESTAMP   |                                       |                 |
| `updated_at`   | TIMESTAMP   |                                       |                 |

建议基础数据：

- `necklace`（项链 / 吊坠）
- `earring`（耳钉）
- `ring`（戒指）
- 如需兼容现有 UI 的 “Pendants”，可以把 `necklace` 业务上当作 pendants 来展示。

---

### 4. `products` —— 产品款式（Setting）

对应前端：

- `StepOneLanding` 中的 `products: StepOneProduct[]`（id / name / price / image / colors）。
- `ProductDetails` / `ProductContainer` 中的款式名称、基础价格、描述等。

| 字段名             | 类型          | 说明                                                                 | 示例                                       |
| ------------------ | ------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `id`               | BIGINT PK     | 产品 ID                                                              | 1                                          |
| `category_id`      | SMALLINT FK   | 外键 → `product_categories.id`                                      | 对应项链/耳钉/戒指                         |
| `name`             | VARCHAR(128)  | 名称                                                                 | `The Amelia`                               |
| `sku`              | VARCHAR(64)   | 产品 SKU（与 `pendantDetails` 中的 SKU 对应）                       | `243Q-DP-R-YG-14`                          |
| `base_price`       | DECIMAL(10,2) | 基础价格（不含石头）                                                 | `670.00`                                   |
| `currency`         | CHAR(3)       | 币种                                                                 | `USD`                                      |
| `default_image_url`| TEXT          | 列表页/详情页默认主图                                                |                                           |
| `available_colors` | JSON          | 可选金属颜色列表，对应 `StepOneProduct.colors`                      | `["white","yellow","rose"]`               |
| `description`      | TEXT          | 产品描述，对应 `ProductDetails` 中的文案                             |                                           |
| `min_carat`        | DECIMAL(4,2) NULL | 允许的最小主石克拉，用于约束搭配                               |                                           |
| `max_carat`        | DECIMAL(4,2) NULL | 允许的最大主石克拉                                               |                                           |
| `is_customizable`  | BOOLEAN       | 是否支持选石头定制                                                   | `true`                                    |
| `created_at`       | TIMESTAMP     |                                                                      |                                           |
| `updated_at`       | TIMESTAMP     |                                                                      |                                           |

> 如果你不想引入 JSON，也可以把 `available_colors` 拆到单独表 `product_available_colors`（product_id + color）。

---

### 5. `product_images` —— 产品图片（详情页图集）

对应前端：`ProductContainer` 中 `images: ProductImage[]`。

| 字段名        | 类型      | 说明                                     | 示例                            |
| ------------- | --------- | ---------------------------------------- | ------------------------------- |
| `id`          | BIGINT PK |                                         |                                 |
| `product_id`  | BIGINT FK | 外键 → `products.id`                    | 1                               |
| `image_url`   | TEXT      | 图片链接                                |                                 |
| `alt_text`    | VARCHAR(256) | `alt` 文案                           | `The Amelia YG PR`             |
| `badge`       | VARCHAR(128) NULL | 如 “Shown with 2 ct”           | `Shown with 2 ct`              |
| `aspect_ratio`| VARCHAR(32) | 与前端 `aspect: 'square' | 'portrait'` 对应 | `square` / `portrait`          |
| `sort_order`  | INT       | 显示顺序                                | 1,2,3...                        |
| `is_primary`  | BOOLEAN   | 是否是主图                              | `true`                          |
| `created_at`  | TIMESTAMP |                                         |                                 |

---

### 6.（预留）定制组合表

当前版本**不落地“定制组合”数据**，所有“当前选中的石头 + 产品 + 金属颜色”等信息由前端状态管理即可。  
在未来接入购物车 / 支付时，可以重新引入类似 `custom_jewelry_configs` 的表，用来做：

- 将“当前组合”生成可分享 / 可重复下单的配置；
- 作为订单行（order items）的数据来源；
- 支持用户在多个设备之间同步草稿。

## 四、与前端组件的字段映射小结

- **`StoneSelectionSection` / `DiamondGrid`**
  - 过滤条件：
    - 形状：`stone_shapes.code` ↔ `selectedShape`
    - 颜色：`stone_color_grades.code` ↔ `StoneFilters.color`
    - 净度：`stone_clarity_grades.code` ↔ `StoneFilters.clarity`
    - 切工：`stone_cut_grades.code` ↔ `StoneFilters.cut`
    - 克拉：`stones.carat` ↔ `StoneFilters.carat`
    - 预算：`stones.price` ↔ `StoneFilters.budget`
    - 证书：`stone_certificates.code` ↔ `StoneFilters.certificate`
  - 列表展示：
    - 从 `stones` + 各枚举表 join 后读取 `carat` / 颜色名 / 净度名 / `ratio` / `price`。

- **`StepOneLanding`**
  - `StepOneProduct.id` → `products.id`
  - `StepOneProduct.name` → `products.name`
  - `StepOneProduct.price` → `products.base_price`
  - `StepOneProduct.image` → `products.default_image_url`
  - `StepOneProduct.colors` → `products.available_colors`

- **`ProductContainer` / `ProductDetails`**
  - 图集 `images` → `product_images` 表。
  - SKU、材质、链长等 → `products.sku` + `custom_jewelry_configs.metal_color` / `metal_karat` / `chain_length_mm`。
  - “Your Sapphire info” → 根据 `custom_jewelry_configs.stone_id` 查询 `stones`。
  - 总价展示 → 使用 `custom_jewelry_configs.config_price`。

---

## 五、后续实现建议

1. **API 设计顺序**
   - GET `/api/stones`：根据前端的 `StoneFilters` 查询 `stones`（内部 join 各枚举表）。
   - GET `/api/stone-filters`：一次性返回所有过滤选项枚举（shapes / colors / clarity / cut / certificates）。
   - GET `/api/products`：支持按 `category_code`（necklace / earring / ring）过滤。
   - POST `/api/custom-configs`：创建 / 更新 `custom_jewelry_configs`。

2. **支付与订单**
   - 订单 / 支付相关表（`orders` / `order_items` / `payments`）可在后期接第三方支付时单独设计；
   - 设计时直接复用 `custom_jewelry_configs` 作为订单行快照来源即可。

3. **ORM / 迁移工具**
   - 如果你打算用 Prisma / Drizzle / TypeORM 等，可以根据这里的表结构直接建模型；
   - 依赖安装和具体迁移命令可以在你确定数据库类型后再补充。
