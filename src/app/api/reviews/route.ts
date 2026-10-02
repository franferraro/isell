const GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places";
const GOOGLE_TEXT_SEARCH_URL = `${GOOGLE_PLACES_URL}:searchText`;
const DEFAULT_SPREADSHEET_ID = "1YOfRqKW60BDbpMFgEzju57R253828Yph4OI63emqGm8";
const REVIEWS_SHEET = "Reseñas";
const MAPS_REVIEW_URL = "https://www.google.com/maps/place/Isell.cba/@-31.3915159,-64.2211381,17z/data=!4m8!3m7!1s0x9432990078c340f9:0x13af009e4028cba9!8m2!3d-31.3915159!4d-64.2211381!9m1!1b1!16s%2Fg%2F11nvvbmww9";
const OBSERVED_GOOGLE_REVIEW_COUNT = 9;

export const dynamic = "force-dynamic";

type GoogleLocalizedText = {
  text?: string;
  languageCode?: string;
};

type GoogleReview = {
  name?: string;
  rating?: number;
  text?: GoogleLocalizedText;
  originalText?: GoogleLocalizedText;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  googleMapsUri?: string;
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
};

type GooglePlaceResponse = {
  id?: string;
  displayName?: GoogleLocalizedText;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GoogleReview[];
};

type GoogleTextSearchResponse = {
  places?: Array<{
    id?: string;
    displayName?: GoogleLocalizedText;
    formattedAddress?: string;
  }>;
  error?: { message?: string };
};

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

function toNumber(value?: string) {
  const parsed = Number(String(value || "").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "IS";
}

async function fetchSheetReviews() {
  const spreadsheetId = process.env.GOOGLE_PRODUCTS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
  const response = await fetch(csvUrl(spreadsheetId, REVIEWS_SHEET), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudo leer la pestaña ${REVIEWS_SHEET}.`);
  }

  const rows = parseCsv(await response.text());
  const reviews = rows
    .filter((review) => (review.activo || "Si").toLowerCase() === "si" && review.nombre && review.comentario)
    .map((review) => ({
      id: `${review.nombre}-${review.orden || review.fecha}`,
      quote: review.comentario,
      name: review.nombre,
      initials: review.iniciales || initialsFromName(review.nombre),
      location: review.fecha ? `${review.fecha} · ${review.origen || "Google Maps"}` : review.origen || "Google Maps",
      rating: Math.round(toNumber(review.estrellas) || 5),
      url: review.link || MAPS_REVIEW_URL,
      order: toNumber(review.orden),
    }))
    .sort((a, b) => a.order - b.order);

  if (!reviews.length) return null;

  const rating = reviews.reduce((sum, review) => sum + (review.rating || 5), 0) / reviews.length;

  return {
    source: "google-sheets",
    placeName: "Isell.cba",
    rating,
    userRatingCount: Math.max(reviews.length, OBSERVED_GOOGLE_REVIEW_COUNT),
    url: MAPS_REVIEW_URL,
    reviews: reviews.slice(0, 6),
  };
}

async function resolvePlaceId(apiKey: string) {
  const configuredPlaceId = process.env.GOOGLE_PLACE_ID;

  if (configuredPlaceId) {
    return configuredPlaceId;
  }

  const textQuery = process.env.GOOGLE_PLACE_QUERY;

  if (!textQuery) {
    return null;
  }

  const response = await fetch(GOOGLE_TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "es-419",
      regionCode: "AR",
      pageSize: 1,
    }),
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  const result = await response.json() as GoogleTextSearchResponse;

  if (!response.ok) {
    throw new Error(result.error?.message || "Google Text Search rechazó la solicitud.");
  }

  return result.places?.[0]?.id || null;
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    const sheetReviews = await fetchSheetReviews();
    if (sheetReviews) return Response.json(sheetReviews);

    return Response.json({ error: "No hay reseñas configuradas." }, { status: 503 });
  }

  try {
    const placeId = await resolvePlaceId(apiKey);

    if (!placeId) {
      return Response.json(
        { error: "Falta configurar GOOGLE_PLACE_ID o GOOGLE_PLACE_QUERY." },
        { status: 503 },
      );
    }

    const url = new URL(`${GOOGLE_PLACES_URL}/${placeId}`);
    url.searchParams.set("languageCode", "es-419");
    url.searchParams.set("regionCode", "AR");

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "id",
          "displayName",
          "googleMapsUri",
          "rating",
          "userRatingCount",
          "reviews.rating",
          "reviews.text",
          "reviews.originalText",
          "reviews.relativePublishTimeDescription",
          "reviews.publishTime",
          "reviews.googleMapsUri",
          "reviews.authorAttribution",
        ].join(","),
      },
      next: { revalidate: 60 * 60 * 12 },
    });

    const place = await response.json() as GooglePlaceResponse & {
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(place.error?.message || "Google Places rechazó la solicitud.");
    }

    const reviews = (place.reviews || [])
      .filter((review) => review.rating && (review.text?.text || review.originalText?.text))
      .slice(0, 3)
      .map((review) => {
        const author = review.authorAttribution?.displayName || "Cliente de isell.cba";

        return {
          id: review.name || `${author}-${review.publishTime || review.relativePublishTimeDescription || ""}`,
          quote: review.text?.text || review.originalText?.text || "",
          name: author,
          initials: initialsFromName(author),
          location: review.relativePublishTimeDescription || "Reseña en Google",
          rating: Math.round(review.rating || 5),
          url: review.googleMapsUri || review.authorAttribution?.uri || place.googleMapsUri || MAPS_REVIEW_URL,
        };
      });

    return Response.json({
      source: "google",
      placeName: place.displayName?.text || "isell.cba",
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      url: place.googleMapsUri || MAPS_REVIEW_URL,
      reviews,
    });
  } catch (error) {
    console.error("Google reviews fetch failed:", error);
    const sheetReviews = await fetchSheetReviews();
    if (sheetReviews) return Response.json(sheetReviews);

    return Response.json({ error: "No pudimos cargar las reseñas de Google en este momento." }, { status: 502 });
  }
}
