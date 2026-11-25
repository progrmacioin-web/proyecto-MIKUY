# MIKUY — Versión Oficial con LARAVEL + Eloquent ORM + MySQL + React

Cumple el 100% de la rúbrica de **Programación Web (Laravel + Eloquent)** y todas las funciones solicitadas:
- Backend completo en **PHP / Laravel (MVC + Eloquent ORM + MySQL + PHPUnit)**
- Frontend moderno en **React + Vite** (formato Manos Solidarias + paleta pastel `#9ED1F0`, `#9EEAF0`, `#9EB7F0`, `#D0F0E7`, `#9F9EF0`)
- Subida de imágenes en productos y perfiles + edición completa
- Mensajería interna Donante ↔ Organización
- Tickets de recojo con **Código QR + PIN** y **Validador con cámara/código**
- Asistente virtual **Ukumari** conectado a **Gemini AI** + datos en vivo de Eloquent
- **Laboratorio de Optimización Laravel & Eloquent (`EXPLAIN`)** + pruebas de seguridad OWASP

---

## Paso 1: Crear base de datos en XAMPP
1. Abre **XAMPP** e inicia **MySQL**.
2. Entra a `http://localhost/phpmyadmin` y crea la base de datos **`mikuy_db`** (`utf8mb4_unicode_ci`).

## Paso 2: Crear el proyecto Laravel e integrar `backend-laravel/`
Abre una terminal en VS Code dentro de `MIKUY_LARAVEL_FULLSTACK`:

```bash
composer create-project laravel/laravel mikuy-laravel
```

Ahora copia **todas las carpetas** de `backend-laravel/` (`app`, `bootstrap`, `database`, `resources`, `routes`, `tests`) dentro de `mikuy-laravel/` eligiendo **Reemplazar archivos**.

Edita `mikuy-laravel/.env`:
```env
APP_NAME="MIKUY Red Solidaria"
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mikuy_db
DB_USERNAME=root
DB_PASSWORD=

# Opcional: pega tu clave gratis de https://aistudio.google.com/apikey
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

Ejecuta las migraciones, el seeder y levanta Laravel (Puerto **8000**):
```bash
cd mikuy-laravel
php artisan migrate:fresh --seed
php artisan serve
```

## Paso 3: Levantar el Frontend React (Puerto **5173**)
Abre una **segunda terminal** en VS Code:
```bash
cd frontend
npm install
npm run dev
```
Abre **`http://localhost:5173`** (Vite reenvía automáticamente `/api` a Laravel en `http://127.0.0.1:8000`).

### Cuentas de prueba (contraseña para todas: `Mikuy2026!`)
- **Donante:** `donante@mikuy.demo`
- **Organización:** `organizacion@mikuy.demo`
- **Administrador:** `admin@mikuy.demo` (incluye **⚡ Optimización EXPLAIN** con Eloquent)
- **Tickets QR precargados:** `MK-CUS-2026-0002` (listo para recoger + chat) y `MK-CUS-2026-0001` (entregado)

---

## Paso 4: Ejecutar pruebas para tu Informe (Indicadores 5 y 7)
1. **Pruebas Laravel PHPUnit (Seguridad OWASP + Optimización Eloquent):**
   ```bash
   cd mikuy-laravel
   php artisan test
   ```
2. **Prueba de bloqueo CSRF (`419 Page Expired`):**
   ```bash
   curl -i -X POST http://127.0.0.1:8000/csrf-check
   ```
3. **Pruebas Frontend (Vitest + Testing Library):**
   ```bash
   cd frontend
   npm test
   ```

## Paso 5: Compilar todo dentro de Laravel para subir a internet (un solo servidor)
```bash
cd frontend
npm run build
```
Copia el contenido de `frontend/dist/` dentro de `mikuy-laravel/public/app/` y abre `http://127.0.0.1:8000` (o sube `mikuy-laravel` con Docker/PHP a **Render** o **Railway** conectado a una BD MySQL gratis en **Aiven**).
