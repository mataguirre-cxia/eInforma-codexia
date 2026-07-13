# Pendiente: activar Upstash Redis para el rate-limit

Nota de implementación para más adelante. **No es un bloqueante**: la app funciona sin
esto. Es hardening recomendado **antes de abrir campañas reales** en producción.

---

## Qué resuelve

El rate-limit vive en [`lib/rate-limit.ts`](../lib/rate-limit.ts) y protege dos sitios:

| Endpoint | Límite | Por qué |
|---|---|---|
| Login ([`app/auth/actions.ts`](../app/auth/actions.ts)) | 5 / 15 min por IP | Frena fuerza bruta de contraseñas |
| Test-call ([`app/api/test-call/route.ts`](../app/api/test-call/route.ts)) | 5 / 5 min por IP | Cada llamada **cuesta dinero** (ElevenLabs/Twilio) |

**El problema del estado actual**: sin Upstash, el contador es **en memoria**. En Vercel
(serverless) cada request puede caer en una instancia distinta y las lambdas se reciclan,
así que el contador se resetea y **el límite es prácticamente inefectivo**. Upstash da un
contador único y persistente que todas las instancias comparten → el límite se cumple de verdad.

Mitigantes que ya existen (por eso no es urgente en fase POC): `login` y `test-call` exigen
**sesión autenticada** (no son anónimos), y Supabase Auth aplica su propio rate-limit al login.

---

## Cambios de código necesarios: NINGUNO

- Las dependencias ya están instaladas: `@upstash/ratelimit` y `@upstash/redis`.
- [`lib/rate-limit.ts`](../lib/rate-limit.ts) ya detecta Upstash solo: si existen las dos
  variables de entorno → usa Redis; si no → cae a memoria. No hay que tocar código.

```ts
// lib/rate-limit.ts — ya escrito
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
```

---

## Pasos (todo es configuración)

1. **Crear cuenta** en [upstash.com](https://upstash.com) (gratis, login con GitHub/Google).
2. **Crear base de datos Redis**: "Create Database" → tipo **Regional** (no Global) →
   región cercana al deploy de Vercel (Europa, ej. `eu-west-1`) → tier **Free**.
3. **Copiar credenciales REST** (sección "REST API" de la DB) — deben ser las REST
   (empiezan por `https://…upstash.io`), **no** la connection string `redis://…`:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. **Añadir las dos variables en dos sitios**:
   - **Local**: en `.env.local` (el hueco ya está reservado en `.env.example`).
   - **Vercel**: Project → Settings → Environment Variables → **redeploy** (no se recogen
     hasta un nuevo deploy).

**No hace falta** crear tablas, schema ni índices: Upstash guarda solo las claves de
rate-limit (prefijo `einforma-rl`, ya fijado en el código) y expiran solas.

---

## Verificación (tras configurarlo)

- Disparar 6 logins seguidos con credenciales malas → el 6º debe devolver
  "Demasiados intentos" **y persistir** aunque se recargue (con memoria a veces se resetea).

---

## Coste / esfuerzo

| Paso | Esfuerzo |
|---|---|
| Cuenta + DB Redis en Upstash | ~3 min (UI) |
| 2 env vars en local + Vercel | ~2 min |
| Código / dependencias / migraciones | nada |

Tier Free de Upstash suficiente para el volumen del POC.
