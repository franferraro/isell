const OPTIONS_SHEET = "Opciones cotización";

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
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function isActive(value?: string) {
  const normalized = (value || "Si")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return ["si", "yes", "true", "1", "activo"].includes(normalized);
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
    const response = await fetch(csvUrl(spreadsheetId, OPTIONS_SHEET), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`No se pudo leer la pestaña ${OPTIONS_SHEET}.`);
    }

    const rows = parseCsv(await response.text())
      .filter((row) => isActive(row.activo))
      .sort((a, b) => toNumber(a.orden) - toNumber(b.orden));

    const brandMap = new Map<string, { name: string; storage: string[] }[]>();
    const states: string[] = [];

    rows.forEach((row) => {
      if (row.estado) {
        states.push(row.estado);
        return;
      }

      if (!row.marca || !row.modelo) return;
      if (!brandMap.has(row.marca)) brandMap.set(row.marca, []);
      brandMap.get(row.marca)?.push({
        name: row.modelo,
        storage: splitList(row.almacenamiento),
      });
    });

    return Response.json({
      source: "google-sheets",
      updatedAt: new Date().toISOString(),
      brands: Array.from(brandMap.keys()),
      catalog: Object.fromEntries(brandMap.entries()),
      states,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Quote options fetch failed:", error);
    return Response.json(
      { error: "No pudimos cargar las opciones de cotización desde Google Sheets." },
      { status: 502 },
    );
  }
}
