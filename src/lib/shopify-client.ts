export type ShopifyLineAttribute = { key: string; value: string };

export type ShopifyCartLine = {
  merchandiseId: string;
  quantity: number;
  attributes?: ShopifyLineAttribute[];
};

export type ShopifyCartResponse = {
  cartId: string | null;
  checkoutUrl: string | null;
};

export async function createOrUpdateCart(
  lines: ShopifyCartLine[],
  cartId?: string | null
): Promise<ShopifyCartResponse> {
  const res = await fetch("/api/shopify/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, lines }),
  });

  const json = (await res.json()) as ShopifyCartResponse & {
    error?: string;
    userErrors?: Array<{ field?: string[] | null; message: string }>;
  };

  if (!res.ok) {
    const message = json.userErrors?.[0]?.message || json.error || "请求失败";
    throw new Error(message);
  }

  return json;
}
