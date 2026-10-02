const SHEET_NAME = "Cotizaciones";
const SPREADSHEET_ID = "1QFiPhg-hNc8tsA2DQ-pLcnQCr9Q6Npiehy7m7LuFT9w";
const PHOTOS_FOLDER_NAME = "isell.cba - Fotos de cotizaciones";
const HEADERS = [
  "ID",
  "Fecha",
  "Nombre",
  "WhatsApp",
  "Marca",
  "Modelo",
  "Capacidad",
  "Estado del equipo",
  "Comentarios",
  "Fotos",
  "Estado de gestión",
  "Valor interno",
  "Precio de venta",
  "Observaciones internas",
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

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet);
    const quoteId = createQuoteId();
    const folder = getPhotosFolder(properties).createFolder(quoteId);
    const photoUrls = savePhotos(folder, payload.photos || []);

    sheet.appendRow([
      quoteId,
      new Date(payload.submittedAt || new Date()),
      safeCell(payload.name),
      safeCell(payload.phone),
      safeCell(payload.brand),
      safeCell(payload.model),
      safeCell(payload.storage),
      safeCell(payload.condition),
      safeCell(payload.comments),
      photoUrls.join("\n"),
      "Recibido",
      "",
      "",
      "",
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
