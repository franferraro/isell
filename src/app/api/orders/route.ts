type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  variantId?: string;
  color?: string;
  model?: string;
};

type OrderPayload = {
  items?: OrderItem[];
  total?: number;
  currency?: string;
  totalLabel?: string;
  totalsByCurrency?: Array<{ currency: string; total: number }>;
  source?: string;
};

function createOrderId() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = Math.floor(100 + Math.random() * 900);
  return `PED-${stamp}-${suffix}`;
}

export async function POST(request: Request) {
  const webhookUrl = process.env.GOOGLE_COMMERCE_WEBHOOK_URL;
  const webhookSecret = process.env.GOOGLE_COMMERCE_WEBHOOK_SECRET;
  const orderId = createOrderId();

  try {
    const payload = await request.json() as OrderPayload;
    const items = (payload.items || []).filter((item) => item.id && item.quantity > 0);

    if (!items.length) {
      return Response.json({ error: "El carrito está vacío." }, { status: 400 });
    }

    const order = {
      secret: webhookSecret,
      action: "create_whatsapp_order",
      orderId,
      submittedAt: new Date().toISOString(),
      source: payload.source || "web-catalog",
      currency: payload.currency || "ARS",
      total: payload.total ?? (payload.currency && payload.currency !== "MULTI"
        ? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        : 0),
      totalLabel: payload.totalLabel,
      totalsByCurrency: payload.totalsByCurrency,
      items,
    };

    if (webhookUrl && webhookSecret) {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({})) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || "Google Sheets rechazó el pedido.");
      }
    }

    return Response.json({ id: orderId, recorded: Boolean(webhookUrl && webhookSecret) });
  } catch (error) {
    console.error("Order draft failed:", error);
    if (webhookUrl && webhookSecret) {
      return Response.json(
        { error: "No pudimos registrar el pedido antes de abrir WhatsApp." },
        { status: 502 },
      );
    }
    return Response.json({ id: orderId, recorded: false });
  }
}
