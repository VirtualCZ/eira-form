# HR form deployment

Employees open: **`/forms/hr/?code=INVITE_CODE`**.

## How API calls work

| Environment | URL in the app | What happens |
|-------------|----------------|--------------|
| **Production** (`forms.war/hr/`) | `/rest/sm/{gas\|icuk}/v1/...` (relative) | Browser calls the **same JBoss host** — no Vite, no proxy |
| **Local `yarn dev`** | Same relative paths | **Vite dev proxy** forwards `/rest/sm` → `HR_REST_TARGET` (e.g. `http://localhost:8880`) |

There is **no proxy in production**. Only `yarn dev` uses `vite.config.ts` proxy.

## Auth (temporary)

HTTP Basic with a limited service user, set at **build time**:

- `VITE_GAS_NAME` / `VITE_GAS_PASS` (GAS build)
- `VITE_ICUK_NAME` / `VITE_ICUK_PASS` (ICUK build; falls back to GAS if unset)

Credentials are inlined into `dist`. Planned replacement: one-time invite codes.

## Build & deploy

```bash
# ICUK example
VITE_FORM_VARIANT=icuk
VITE_ICUK_NAME=icuk_test
VITE_ICUK_PASS=***
yarn build
```

Copy `dist/*` → `standalone/deployments/forms.war/hr/`.

`.env` is for **local dev + build machine** only (not shipped in `forms.war`).

## Local dev

```env
VITE_FORM_VARIANT=icuk
VITE_ICUK_NAME=icuk_test
VITE_ICUK_PASS=***
HR_REST_TARGET=http://localhost:8880
```

```bash
yarn dev
# http://localhost:5173/?code=SUBJECT_ID
```

Restart dev server after `.env` changes.

## Backend

**rest-war** requires Basic auth on `/*`. Redeploy **sm-jar** for ICUK path aliases on `SMRest`.
