const SHEET_NAME = "Cotizaciones equipos";
const DEFAULT_QUOTES_SPREADSHEET_ID = "1YOfRqKW60BDbpMFgEzju57R253828Yph4OI63emqGm8";
const PHOTOS_FOLDER_NAME = "isell.cba - Fotos de cotizaciones";
const HEADERS = [
  "ID",
  "Fecha",
  "Nombre",
  "WhatsApp",
  "Marca",
  "Modelo",
  "Capacidad",
  "Capacidad batería",
  "Estado del equipo",
  "Comentarios",
  "Fotos",
  "Estado de gestión",
  "Valor interno",
  "Precio de venta",
  "Observaciones internas",
  "Origen",
];

function doPost(event) {
  const lock = LockService.getScriptLock();
  let lockAcquired = false;

  try {
    lock.waitLock(10000);
    lockAcquired = true;
    const payload = JSON.parse(event.postData.contents);
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty("WEBHOOK_SECRET");

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "No autorizado." });
    }

    const spreadsheetId = properties.getProperty("QUOTES_SPREADSHEET_ID") || DEFAULT_QUOTES_SPREADSHEET_ID;
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = getOrCreateSheet(spreadsheet);
    const quoteId = createQuoteId();
    const folder = getPhotosFolder(properties).createFolder(quoteId);
    const photoUrls = savePhotos(folder, payload.photos || []);
    const batteryHealth = Number(payload.batteryHealth || 0);

    if (!Number.isInteger(batteryHealth) || batteryHealth < 1 || batteryHealth > 100) {
      throw new Error("La capacidad de bateria debe ser un numero del 1 al 100.");
    }

    sheet.appendRow([
      quoteId,
      new Date(payload.submittedAt || new Date()),
      safeCell(payload.name),
      safeCell(payload.phone),
      safeCell(payload.brand),
      safeCell(payload.model),
      safeCell(payload.storage),
      batteryHealth,
      safeCell(payload.condition),
      safeCell(payload.comments),
      photoUrls.join("\n"),
      "Recibido",
      "",
      "",
      "",
      safeCell(payload.source || "web-plan-canje"),
    ]);

    return jsonResponse({
      ok: true,
      id: quoteId,
      folderUrl: folder.getUrl(),
      photoUrls: photoUrls,
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  } finally {
    if (lockAcquired) lock.releaseLock();
  }
}

function getRequiredScriptProperty(properties, name) {
  const value = properties.getProperty(name);
  if (!value) {
    throw new Error("Falta configurar la propiedad " + name + ".");
  }
  return value;
}

function getPhotosFolder(properties) {
  const savedFolderId = properties.getProperty("DRIVE_FOLDER_ID");

  if (savedFolderId) {
    try {
      return DriveApp.getFolderById(savedFolderId);
    } catch (error) {
      properties.deleteProperty("DRIVE_FOLDER_ID");
    }
  }

  const existingFolders = DriveApp.getFoldersByName(PHOTOS_FOLDER_NAME);
  const folder = existingFolders.hasNext()
    ? existingFolders.next()
    : DriveApp.createFolder(PHOTOS_FOLDER_NAME);

  properties.setProperty("DRIVE_FOLDER_ID", folder.getId());
  return folder;
}

function getOrCreateSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground("#0a0a0a")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
  }

  return sheet;
}

function savePhotos(folder, photos) {
  return photos.map(function(photo, index) {
    const bytes = Utilities.base64Decode(photo.data);
    const blob = Utilities.newBlob(
      bytes,
      photo.type || "image/jpeg",
      (index + 1) + "-" + safeFileName(photo.name || "foto.jpg")
    );
    return folder.createFile(blob).getUrl();
  });
}

function createQuoteId() {
  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMdd-HHmmss"
  );
  const suffix = Math.floor(100 + Math.random() * 900);
  return "IS-" + timestamp + "-" + suffix;
}

function safeCell(value) {
  const text = String(value || "").trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function safeFileName(value) {
  return String(value).replace(/[^\w.\-]+/g, "-");
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
