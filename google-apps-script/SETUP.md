# Integración con Google Sheets

## Hoja vinculada

El script se instala en la hoja de cotizaciones del cliente.

La carpeta `isell.cba - Fotos de cotizaciones` se crea automáticamente
en Google Drive con la primera solicitud.

## 1. Instalar el Apps Script

1. En la hoja, abrí `Extensiones > Apps Script`.
2. Reemplazá el contenido de `Code.gs` por el archivo [Code.gs](./Code.gs).
3. En `Configuración del proyecto > Propiedades de la secuencia de comandos`, agregá:
   - Nombre: `QUOTES_SPREADSHEET_ID`
   - Valor: `1YOfRqKW60BDbpMFgEzju57R253828Yph4OI63emqGm8`
   - Nombre: `WEBHOOK_SECRET`
   - Valor: una clave larga propia.
4. Configurá la zona horaria del proyecto como `America/Argentina/Cordoba`.

## 2. Publicar el webhook

1. Elegí `Implementar > Nueva implementación`.
2. Tipo: `Aplicación web`.
3. Ejecutar como: `Yo`.
4. Quién tiene acceso: `Cualquier persona`.
5. Autorizá el acceso a Sheets y Drive.
6. Copiá la URL terminada en `/exec`.

## 3. Completar la URL en Next.js

En `.env.local`, reemplazá `PEGAR_URL_EXEC_AQUI` por la URL copiada:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/PEGAR_URL_EXEC_AQUI/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=LA_MISMA_CLAVE_DEL_SCRIPT
```

Reiniciá `npm run dev` después de crear o modificar `.env.local`.

La primera solicitud crea o usa la pestaña `Cotizaciones equipos` con columnas para datos,
fotos, estado de gestión, valor interno, precio de venta y observaciones.
