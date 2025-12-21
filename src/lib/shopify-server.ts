import "server-only";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION;

const assertEnv = () => {
  if (!domain || !token || !version) {
    throw new Error(
      "Missing Shopify env vars: SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN / SHOPIFY_API_VERSION"
    );
  }
};

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  assertEnv();

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Shopify-Storefront-Access-Token": token as string,
    },
    body: JSON.stringify({ query, variables }),
  });

  const raw = await res.text();
  let json: { data?: T; errors?: Array<{ message: string }> } | null = null;
  try {
    json = JSON.parse(raw) as { data?: T; errors?: Array<{ message: string }> };
  } catch (_error) {
    const contentType = res.headers.get("content-type") ?? "unknown";
    const snippet = raw.slice(0, 200);
    throw new Error(
      `Shopify response is not JSON. status=${res.status} content-type=${contentType} body=${snippet}`
    );
  }

  if (!res.ok) {
    throw new Error(
      `Shopify request failed: ${res.status} ${JSON.stringify(
        json?.errors ?? []
      )}`
    );
  }
  if (json.errors?.length) {
    throw new Error(JSON.stringify(json.errors));
  }

  if (!json.data) {
    throw new Error("Shopify response missing data");
  }

  return json.data;
}
