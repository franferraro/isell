const MAX_FILES = 5;
const MAX_FILE_SIZE = 3 * 1024 * 1024;

type PhotoPayload = {
  name: string;
  type: string;
  data: string;
};

function isNonEmpty(value: FormDataEntryValue | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return Response.json(
      { error: "La integración con Google Sheets todavía no está configurada." },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const requiredFields = ["name", "phone", "brand", "model", "storage", "condition"] as const;

    for (const field of requiredFields) {
      if (!isNonEmpty(formData.get(field))) {
        return Response.json({ error: `Falta completar el campo ${field}.` }, { status: 400 });
      }
    }

    const files = formData
      .getAll("photos")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)
      .slice(0, MAX_FILES);

    const photos: PhotoPayload[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/") || file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: "Cada foto debe ser una imagen de hasta 3 MB." },
          { status: 400 },
        );
      }

      photos.push({
        name: file.name,
        type: file.type,
        data: Buffer.from(await file.arrayBuffer()).toString("base64"),
      });
    }

    const payload = {
      secret: webhookSecret,
      submittedAt: new Date().toISOString(),
      name: String(formData.get("name")).trim(),
      phone: String(formData.get("phone")).trim(),
      brand: String(formData.get("brand")).trim(),
      model: String(formData.get("model")).trim(),
      storage: String(formData.get("storage")).trim(),
      condition: String(formData.get("condition")).trim(),
      comments: String(formData.get("comments") ?? "").trim(),
      photos,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await response.json() as {
      ok?: boolean;
      id?: string;
      error?: string;
    };

    if (!response.ok || !result.ok || !result.id) {
      throw new Error(result.error || "Google Sheets rechazó la solicitud.");
    }

    return Response.json({ id: result.id });
  } catch (error) {
    console.error("Quote submission failed:", error);
    return Response.json(
      { error: "No pudimos guardar la solicitud. Probá nuevamente en unos minutos." },
      { status: 502 },
    );
  }
}
