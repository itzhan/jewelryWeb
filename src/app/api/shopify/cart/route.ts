import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify-server";

const CART_CREATE_MUTATION = `
mutation cartCreate($lines: [CartLineInput!]) {
  cartCreate(input: { lines: $lines }) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}
`;

const CART_LINES_ADD_MUTATION = `
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}
`;

interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<{ key: string; value: string }>;
}

interface CartRequestBody {
  cartId?: string | null;
  lines: CartLineInput[];
}

type CartResponse = {
  cart: { id: string; checkoutUrl: string } | null;
  userErrors?: Array<{ field?: string[] | null; message: string }>;
};

const normalizeLines = (lines: CartLineInput[]) =>
  lines
    .filter((line) =>
      Boolean(
        line &&
          typeof line.merchandiseId === "string" &&
          line.merchandiseId.length > 0 &&
          typeof line.quantity === "number" &&
          line.quantity > 0
      )
    )
    .map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: Math.floor(line.quantity),
      attributes: line.attributes?.filter(
        (attr) =>
          attr &&
          typeof attr.key === "string" &&
          typeof attr.value === "string" &&
          attr.key.length > 0
      ),
    }));

export async function POST(req: Request) {
  let body: CartRequestBody | null = null;

  try {
    body = (await req.json()) as CartRequestBody;
  } catch (_error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body?.lines || !Array.isArray(body.lines)) {
    return NextResponse.json(
      { error: "Missing lines" },
      { status: 400 }
    );
  }

  const lines = normalizeLines(body.lines);
  if (!lines.length) {
    return NextResponse.json(
      { error: "No valid lines" },
      { status: 400 }
    );
  }

  try {
    if (body.cartId) {
      const data = await shopifyFetch<{ cartLinesAdd: CartResponse }>(
        CART_LINES_ADD_MUTATION,
        { cartId: body.cartId, lines }
      );

      const payload = data.cartLinesAdd;
      if (payload.userErrors?.length) {
        return NextResponse.json(
          { error: "SHOPIFY_USER_ERRORS", userErrors: payload.userErrors },
          { status: 400 }
        );
      }

      return NextResponse.json({
        cartId: payload.cart?.id ?? null,
        checkoutUrl: payload.cart?.checkoutUrl ?? null,
      });
    }

    const data = await shopifyFetch<{ cartCreate: CartResponse }>(
      CART_CREATE_MUTATION,
      { lines }
    );

    const payload = data.cartCreate;
    if (payload.userErrors?.length) {
      return NextResponse.json(
        { error: "SHOPIFY_USER_ERRORS", userErrors: payload.userErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      cartId: payload.cart?.id ?? null,
      checkoutUrl: payload.cart?.checkoutUrl ?? null,
    });
  } catch (error) {
    console.error("Shopify cart error", error);
    return NextResponse.json(
      {
        error: "Shopify request failed",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
