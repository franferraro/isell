const COMMERCE_SPREADSHEET_ID = "1YOfRqKW60BDbpMFgEzju57R253828Yph4OI63emqGm8";
const ORDERS_SHEET_NAME = "Pedidos WhatsApp";
const ORDER_LINES_SHEET_NAME = "Lineas de pedido";

const ORDER_HEADERS = [
  "pedido_id",
  "fecha_inicio",
  "origen",
  "cliente_nombre",
  "cliente_whatsapp",
  "estado",
  "canal_cierre",
  "total_estimado",
  "moneda",
  "cantidad_items",
  "mensaje_whatsapp",
  "utm_source",
  "utm_campaign",
  "notas",
  "fecha_finalizado",
  "motivo_no_finalizado",
];

const ORDER_LINE_HEADERS = [
  "pedido_id",
  "linea_id",
  "producto_id",
  "producto",
  "variante_id",
  "color",
  "modelo",
  "cantidad",
  "precio_unitario",
  "subtotal",
  "moneda",
  "estado_linea",
  "notas",
  "fecha",
];

function doPost(event) {
  const lock = LockService.getScriptLock();
  let lockAcquired = false;

  try {
    lock.waitLock(10000);
    lockAcquired = true;

    const payload = JSON.parse(event.postData.contents);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("COMMERCE_WEBHOOK_SECRET");

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "No autorizado." });
    }

    if (payload.action !== "create_whatsapp_order") {
      return jsonResponse({ ok: false, error: "Accion no soportada." });
    }

    const spreadsheet = SpreadsheetApp.openById(COMMERCE_SPREADSHEET_ID);
    const ordersSheet = getOrCreateSheet(spreadsheet, ORDERS_SHEET_NAME, ORDER_HEADERS);
    const linesSheet = getOrCreateSheet(spreadsheet, ORDER_LINES_SHEET_NAME, ORDER_LINE_HEADERS);
    const submittedAt = new Date(payload.submittedAt || new Date());
    const items = Array.isArray(payload.items) ? payload.items : [];
    const orderId = safeCell(payload.orderId);
    const currency = safeCell(payload.currency || "ARS");
    const total = Number(payload.total || 0);
    const totalLabel = safeCell(payload.totalLabel || buildTotalLabel(payload.totalsByCurrency, total, currency));

    ordersSheet.appendRow([
      orderId,
      submittedAt,
      safeCell(payload.source || "web-catalog"),
      "",
      "",
      "Iniciado",
      "WhatsApp",
      total,
      currency,
      items.reduce(function(sum, item) {
        return sum + Number(item.quantity || 0);
      }, 0),
      buildWhatsappSummary(items, totalLabel),
      safeCell(payload.utmSource),
      safeCell(payload.utmCampaign),
      "Pedido creado desde la web. Completar datos del cliente al cerrar por WhatsApp.",
      "",
      "",
    ]);

    items.forEach(function(item, index) {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      linesSheet.appendRow([
        orderId,
        orderId + "-" + String(index + 1).padStart(2, "0"),
        safeCell(item.id),
        safeCell(item.name),
        safeCell(item.variantId),
        safeCell(item.color),
        safeCell(item.model),
        quantity,
        price,
        quantity * price,
        safeCell(item.currency || currency),
        "Pendiente",
        "",
        submittedAt,
      ]);
    });

    return jsonResponse({ ok: true, id: orderId, lines: items.length });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  } finally {
    if (lockAcquired) lock.releaseLock();
  }
}

function getOrCreateSheet(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground("#17127A")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
  }

  return sheet;
}

function buildWhatsappSummary(items, totalLabel) {
  const lines = items.map(function(item) {
    const detail = [item.color, item.model].filter(Boolean).join(" / ");
    return item.quantity + " x " + item.name + (detail ? " (" + detail + ")" : "");
  });

  return lines.join("\n") + "\nTotal estimado: " + totalLabel;
}

function buildTotalLabel(totalsByCurrency, total, currency) {
  if (Array.isArray(totalsByCurrency) && totalsByCurrency.length) {
    return totalsByCurrency.map(function(item) {
      return safeCell(item.currency) + " " + Number(item.total || 0);
    }).join(" + ");
  }

  return currency + " " + total;
}

function safeCell(value) {
  const text = String(value || "").trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
