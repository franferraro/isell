# Integración de carrito con Google Sheets

Este script registra los pedidos que nacen en el carrito antes de abrir
WhatsApp. La compra no se cobra en la web: queda como `Iniciado` y se gestiona
por WhatsApp.

## Hoja vinculada

`https://docs.google.com/spreadsheets/d/1YOfRqKW60BDbpMFgEzju57R253828Yph4OI63emqGm8/edit`

Usa estas pestañas:

- `Pedidos WhatsApp`: una fila por pedido.
- `Lineas de pedido`: una fila por producto del pedido.

## 1. Instalar el Apps Script

1. En la hoja de productos, abrí `Extensiones > Apps Script`.
2. Creá un proyecto aparte para comercio o un archivo separado si ya tenés uno.
3. Pegá el contenido de [Commerce.gs](./Commerce.gs).
4. En `Configuración del proyecto > Propiedades de la secuencia de comandos`,
   agregá:
   - Nombre: `COMMERCE_WEBHOOK_SECRET`
   - Valor: una clave larga propia.
5. Configurá la zona horaria como `America/Argentina/Cordoba`.

Si lo combinás con otro Apps Script que ya tenga `doPost`, hay que unificar la
ruta por `payload.action` para que no queden dos funciones `doPost`.

## 2. Publicar el webhook

1. Elegí `Implementar > Nueva implementación`.
2. Tipo: `Aplicación web`.
3. Ejecutar como: `Yo`.
4. Quién tiene acceso: `Cualquier persona`.
5. Autorizá el acceso a Sheets.
6. Copiá la URL terminada en `/exec`.

## 3. Variables para Next.js/Vercel

```env
GOOGLE_COMMERCE_WEBHOOK_URL=https://script.google.com/macros/s/PEGAR_URL_EXEC_AQUI/exec
GOOGLE_COMMERCE_WEBHOOK_SECRET=LA_MISMA_CLAVE_DEL_SCRIPT
```

Con esto, cada vez que alguien toca `Enviar pedido`, la web crea un pedido en
Sheets y abre WhatsApp con el detalle listo para enviar.
