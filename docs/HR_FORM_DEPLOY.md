# HR form deployment

Employees open: **`/forms/hr/?code=INVITE_CODE`** (email link from `CoreActionService`).

The SPA calls **`/rest/sm/{gas|icuk}/v1/*`** on the same host (public on **rest-war** — no HTTP login, no proxy servlet).

| Variant | Browser path | Handler |
|---------|--------------|---------|
| GAS | `/rest/sm/gas/v1/getCodeInfo/{code}` | `SMRest` → `SmSubjectServiceBean` |
| GAS | `/rest/sm/gas/v1/createHrRequest` | same |
| ICUK | `/rest/sm/icuk/v1/...` | delegates to GAS handlers |

## Static app (existing forms.war)

`forms.war` is **not** built from this repo. Copy **eira-form** `dist/*` into the deployed WAR:

```text
standalone/deployments/forms.war/hr/
  index.html
  assets/...
```

Rebuild the React app (`yarn build`), copy output into `hr/`, redeploy or touch the deployment.

## Backend (eira repo)

Redeploy **rest-war** so HR URLs are in the public security constraint (`rest-war/WEB-INF/web.xml`).

No servlet on **impl-war** or a new **forms-war** — REST already accepts HR payloads.

## Local development

1. JBoss + **rest-war** running.
2. `.env`: `VITE_FORM_VARIANT=gas` or `icuk`, `HR_REST_TARGET=http://localhost:8880` (JBoss HTTP root; Vite proxies `/rest/sm` there).
3. `yarn dev` → `http://localhost:5173/?code=INVITE_CODE`.

Optional: `VITE_HR_API_BASE=/rest/sm/icuk/v1` to override the API base.

Do not set `HR_REST_USER` / `HR_REST_PASS` unless REST still requires Basic auth on other paths.

## orgUnitName

`getCodeInfo` returns `orgUnitName` from the subject’s team. The form uses it in GDPR text and sends it on `createHrRequest`.
