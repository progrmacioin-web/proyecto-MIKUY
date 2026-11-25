<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>MIKUY · Backend Laravel + Eloquent Activo</title>
  <style>
    body{font-family:system-ui,sans-serif;background:#f1faf7;color:#16203d;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;}
    .card{max-width:640px;background:#fff;border:1px solid #c7ddf5;border-radius:18px;padding:28px;box-shadow:0 12px 32px rgba(22,32,61,.08);}
    .badge{display:inline-block;padding:5px 12px;border-radius:999px;background:linear-gradient(120deg,#9ED1F0,#9F9EF0);color:#101830;font-size:12px;font-weight:800;}
    code{background:#D0F0E7;padding:3px 7px;border-radius:6px;}
    a.btn{display:inline-block;margin-top:14px;padding:10px 16px;border-radius:10px;background:#16203d;color:#9EEAF0;text-decoration:none;font-weight:700;}
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">LARAVEL + ELOQUENT ORM + MYSQL ACTIVO</span>
    <h1>MIKUY — Servidor Laravel en Puerto 8000</h1>
    <p>El backend MVC en <strong>PHP / Laravel</strong> y la base de datos <strong>MySQL</strong> están respondiendo correctamente.</p>
    <ul>
      <li><strong>Modo Desarrollo:</strong> abre la interfaz React en <code>http://localhost:5173</code></li>
      <li><strong>API Health:</strong> <a href="/api/health">/api/health</a> · <a href="/api/donations">/api/donations</a></li>
      <li><strong>Modo Producción (un solo puerto):</strong> compila <code>frontend/</code> con <code>npm run build</code> y copia <code>frontend/dist/*</code> a <code>public/app/</code>.</li>
    </ul>
    <a class="btn" href="http://localhost:5173">Abrir Interfaz MIKUY (Puerto 5173) ↗</a>
  </div>
</body>
</html>
