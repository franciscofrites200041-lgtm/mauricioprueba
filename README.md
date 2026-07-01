# Limpio — tienda de productos de limpieza

Sitio mobile-first, 100% estático (HTML + CSS + JS + `localStorage`). Sin build, sin backend.

## Correr en local

Cualquier servidor estático:

```bash
npx serve .
# o
python -m http.server 5173
```

Abrir `http://localhost:5173`.

## Deploy en Vercel

1. Subir la carpeta a un repo de GitHub.
2. En Vercel: **Add New → Project → Import Git Repository**.
3. Framework Preset: **Other**. Build: (vacío). Output: (vacío). Deploy.

O directo por CLI:

```bash
npm i -g vercel
vercel
```

Vercel sirve `index.html` como está.

## Cuentas

- **Admin**: `admin@limpio.com` / `admin123` → habilita el panel para publicar/borrar productos.
- **Usuario**: registrate desde la pestaña *Registrarse* (se guarda en `localStorage`).

## Notas de arquitectura

- Todos los datos (productos, carrito, usuarios, sesión) viven en `localStorage`.
- Las fotos subidas por el admin se guardan como Data URL — perfecto para demo, hay que migrar a un storage real (S3/Cloudinary/Vercel Blob) cuando la tienda crezca.
- Reemplazar `store.get/set` por `fetch()` a una API cuando haga falta multi-dispositivo.
