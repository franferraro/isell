# isell.cba

Landing + catalogo web para isell.cba, con productos administrados desde Google Sheets y cierre de compra por WhatsApp.

## Stack

- Next.js 16.2.7 con App Router
- React 19
- TypeScript
- CSS global custom
- Framer Motion para animaciones
- Lucide React para iconos
- Google Sheets como fuente de datos operativa
- Google Apps Script para registrar cotizaciones/pedidos en Sheets
- Deploy objetivo: Vercel

## Requisitos

- Node.js 22.x
- npm

```bash
npm install
npm run dev
```

La app local corre en:

```text
http://localhost:3000
```

Rutas principales:

- `/`: landing principal
- `/catalogo`: tienda/catalogo

## Scripts

```bash
npm run dev      # servidor local
npm run lint     # eslint
npm run build    # build de produccion
npm run start    # servir build
```

## Variables de entorno

Crear `.env.local` para desarrollo. No se commitea porque `.env*` esta en `.gitignore`.

```env
GOOGLE_PRODUCTS_SPREADSHEET_ID=

GOOGLE_SHEETS_WEBHOOK_URL=
GOOGLE_SHEETS_WEBHOOK_SECRET=

GOOGLE_COMMERCE_WEBHOOK_URL=
GOOGLE_COMMERCE_WEBHOOK_SECRET=

GOOGLE_PLACE_QUERY=isell.cba Cordoba Argentina
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
GOOGLE_MAPS_REVIEW_URL=

NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_WHATSAPP_LABEL=
NEXT_PUBLIC_GOOGLE_MAPS_URL=
```

Notas:

- `GOOGLE_PRODUCTS_SPREADSHEET_ID` es obligatorio para leer productos y reseñas desde Sheets.
- `GOOGLE_PLACES_API_KEY` es opcional. Si no existe, las reseñas salen desde la pestaña `Reseñas` del Sheet.
- Los webhooks de cotizaciones y comercio son opcionales para la UI, pero necesarios si se quiere registrar leads/pedidos automaticamente en Sheets.
- Las variables `NEXT_PUBLIC_*` se exponen al navegador. Usarlas solo para datos publicos del negocio.

## Google Sheets

El proyecto usa una hoja operativa privada como fuente de datos. La URL y el ID
real de esa hoja no se guardan en el repo; se configuran por variable de entorno.

Pestanas esperadas:

- `Catalogo web`: productos, precios, destacados, imagenes, stock y metadata para la tienda.
- `Variantes y colores`: colores/modelos disponibles por producto.
- `Reseñas`: opiniones curadas desde Google Maps para mostrar sin usar Places API.
- `Pedidos WhatsApp`: pedidos iniciados desde carrito, si el webhook de comercio esta configurado.
- `Lineas de pedido`: detalle de productos por pedido.
- `Clientes`: base inicial para futuras acciones de data/CRM.
- `Guia de carga`: instrucciones para que el equipo mantenga el Sheet.

Para que Vercel pueda leer el catalogo, el Sheet debe estar publicado o compartido de forma que el CSV sea accesible.

## APIs internas

- `GET /api/products`: lee `Catalogo web` y `Variantes y colores`.
- `GET /api/reviews`: usa Google Places si hay API key; si no, lee `Reseñas` desde Sheets.
- `POST /api/quotes`: registra cotizaciones de equipos usados.
- `POST /api/orders`: registra pedidos del carrito y arma el disparador a WhatsApp.

## WhatsApp y carrito

La compra no se cobra en la web. El carrito arma el pedido y lo dispara a WhatsApp para confirmar stock, pago y entrega.

El carrito soporta productos en ARS y USD. Cuando hay monedas mezcladas, no suma importes incompatibles: muestra totales separados por moneda.

## Reseñas

Actualmente la solucion sin costo usa la pestaña `Reseñas` del Sheet:

- Se cargaron reseñas reales visibles de Google Maps.
- La landing muestra rating 5.0 y link al perfil real de Google Maps.
- Si en el futuro se configura `GOOGLE_PLACES_API_KEY`, la API puede traer reseñas desde Google Places.

## Vercel

Para deploy:

1. Subir este repo a GitHub.
2. Crear proyecto en Vercel importando el repo.
3. Verificar que Vercel use Node 22.x. El proyecto incluye:

```json
{
  "engines": {
    "node": "22.x"
  }
}
```

4. Cargar variables de entorno en `Project Settings > Environment Variables`.
5. Deploy.

Variables minimas recomendadas en Vercel:

```env
GOOGLE_PRODUCTS_SPREADSHEET_ID=
GOOGLE_PLACE_QUERY=isell.cba Cordoba Argentina
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_WHATSAPP_LABEL=
NEXT_PUBLIC_GOOGLE_MAPS_URL=
```

Variables para registrar pedidos/cotizaciones:

```env
GOOGLE_SHEETS_WEBHOOK_URL=
GOOGLE_SHEETS_WEBHOOK_SECRET=
GOOGLE_COMMERCE_WEBHOOK_URL=
GOOGLE_COMMERCE_WEBHOOK_SECRET=
```

## Cosas a considerar

- No subir `.env.local` ni secretos al repo.
- Mantener el Sheet como fuente de verdad para productos, colores, reseñas y pedidos.
- Revisar imagenes de productos: hoy hay URLs iniciales cargadas, pero el equipo puede reemplazarlas desde `Catalogo web`.
- Si se usa Google Places API, activar billing y restringir la key solo a Places API.
- Si se agregan pagos online en el futuro, separar el checkout de este flujo actual por WhatsApp.
- Antes de deployar, correr:

```bash
npm run lint
npm run build
```
