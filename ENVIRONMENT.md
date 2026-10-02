# Variables de entorno

Configurar estas variables en `.env.local` para desarrollo y en Vercel en
`Project Settings > Environment Variables`.

## Cotizaciones

```env
GOOGLE_SHEETS_WEBHOOK_URL=
GOOGLE_SHEETS_WEBHOOK_SECRET=
```

## Reseñas de Google

```env
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
GOOGLE_PLACE_QUERY=isell.cba Córdoba Argentina
GOOGLE_MAPS_REVIEW_URL=
```

`GOOGLE_PLACE_ID` es el identificador oficial del local en Google Maps. Se puede
obtener con Place Details, Text Search o Place Autocomplete de Google Places.
Si todavía no lo tenemos, `GOOGLE_PLACE_QUERY` permite resolverlo por búsqueda de
texto, aunque para producción conviene dejar fijo el `GOOGLE_PLACE_ID`.

## Catálogo y carrito

```env
GOOGLE_PRODUCTS_SPREADSHEET_ID=
GOOGLE_COMMERCE_WEBHOOK_URL=
GOOGLE_COMMERCE_WEBHOOK_SECRET=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_WHATSAPP_LABEL=
NEXT_PUBLIC_GOOGLE_MAPS_URL=
```

`GOOGLE_PRODUCTS_SPREADSHEET_ID` lee las pestañas `Catalogo web` y
`Variantes y colores`. Para que funcione sin una base de datos, la hoja debe
estar publicada o compartida de manera que Vercel pueda leer el CSV público.

`GOOGLE_COMMERCE_WEBHOOK_URL` y `GOOGLE_COMMERCE_WEBHOOK_SECRET` son opcionales.
Si no están configuradas, el carrito igual abre WhatsApp con el pedido. Si están
configuradas, además registra el pedido en las pestañas `Pedidos WhatsApp` y
`Lineas de pedido`.

Las variables `NEXT_PUBLIC_*` quedan visibles en el navegador. No guardar secrets
en variables con ese prefijo.
