const PRODUCT_SHEET = "Catalogo web";
const VARIANT_SHEET = "Variantes y colores";

export const dynamic = "force-dynamic";

type SheetRow = Record<string, string>;

function csvUrl(spreadsheetId: string, sheetName: string) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`);
  url.searchParams.set("tqx", "out:csv");
  url.searchParams.set("sheet", sheetName);
  url.searchParams.set("_", String(Date.now()));
  return url.toString();
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"" && inQuotes && next === "\"") {
      field += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);

  const [headers = [], ...dataRows] = rows;
  return dataRows.map((values) => headers.reduce<SheetRow>((record, header, index) => {
    record[header.trim()] = (values[index] || "").trim();
    return record;
  }, {}));
}

function splitList(value?: string) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value?: string) {
  const normalized = normalizeNumericText(value || "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeNumericText(value: string) {
  const cleaned = value.trim().replace(/[^\d,.-]/g, "");
  if (!cleaned) return "0";

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const lastSeparator = Math.max(lastComma, lastDot);

  if (lastSeparator === -1) return cleaned;

  const decimalLength = cleaned.length - lastSeparator - 1;
  const separator = cleaned[lastSeparator];
  const sameSeparatorCount = cleaned.split(separator).length - 1;
  const looksDecimal = decimalLength > 0 && decimalLength <= 2 && sameSeparatorCount === 1;

  if (!looksDecimal) return cleaned.replace(/[,.]/g, "");

  const thousandsSeparator = separator === "," ? "." : ",";
  return cleaned
    .replace(new RegExp(`\\${thousandsSeparator}`, "g"), "")
    .replace(separator, ".");
}

async function fetchSheetRows(spreadsheetId: string, sheetName: string) {
  const response = await fetch(csvUrl(spreadsheetId, sheetName), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudo leer la pestaña ${sheetName}.`);
  }

  return parseCsv(await response.text());
}

export async function GET() {
  const spreadsheetId = process.env.GOOGLE_PRODUCTS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    return Response.json(
      { error: "Falta configurar GOOGLE_PRODUCTS_SPREADSHEET_ID." },
      { status: 503 },
    );
  }

  try {
    const [productRows, variantRows] = await Promise.all([
      fetchSheetRows(spreadsheetId, PRODUCT_SHEET),
      fetchSheetRows(spreadsheetId, VARIANT_SHEET),
    ]);

    const variantsByProduct = new Map<string, SheetRow[]>();
    variantRows
      .filter((variant) => (variant.activo_web || "Si").toLowerCase() === "si")
      .forEach((variant) => {
        const productId = variant.producto_id;
        if (!variantsByProduct.has(productId)) variantsByProduct.set(productId, []);
        variantsByProduct.get(productId)?.push(variant);
      });

    const products = productRows
      .filter((product) => product.producto_id && (product.activo_web || "Si").toLowerCase() === "si")
      .map((product) => {
        const variants = variantsByProduct.get(product.producto_id) || [];
        const variantColors = variants.map((variant) => ({
          name: variant.color,
          hex: variant.codigo_color_hex,
          model: variant.modelo_compatible,
          stock: toNumber(variant.stock),
          variantId: variant.variante_id,
        }));

        return {
          id: product.producto_id,
          name: product.producto,
          category: product.categoria,
          family: product.familia_web,
          type: product.tipo_producto,
          price: toNumber(product.precio_venta),
          currency: product.moneda || "ARS",
          featured: (product.destacado || "").toLowerCase() === "si",
          stockStatus: product.stock_estado || "Consultar",
          colors: variantColors.length
            ? variantColors
            : splitList(product.colores_disponibles).map((color) => ({ name: color, hex: "", model: "", stock: 0, variantId: "" })),
          compatibleModels: splitList(product.modelos_compatibles),
          imageUrl: product.imagen_url,
          description: product.descripcion_corta,
          order: toNumber(product.orden_home),
          tags: splitList(product.tags),
        };
      })
      .sort((a, b) => a.order - b.order);

    return Response.json({
      source: "google-sheets",
      spreadsheetId,
      updatedAt: new Date().toISOString(),
      products,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Products fetch failed:", error);
    return Response.json(
      { error: "No pudimos cargar el catálogo desde Google Sheets." },
      { status: 502 },
    );
  }
}
