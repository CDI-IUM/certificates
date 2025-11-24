# Certificate Verification Suite

Static, dependency-light workflow for minting encrypted certificate payloads, generating QR codes, and verifying authenticity entirely in the browser. Everything required to host on GitHub Pages lives under `docs/`.

## Repository Layout

```
docs/
  index.html         → Landing page
  verify.html        → Verification flow
  generate.html      → Certificate + QR generator
  styles.css         → Shared styling
  crypto.js          → XOR/Base64 helpers
  verify.js          → Verification logic
  generate.js        → Generator logic
  config.json        → Secret + issuer metadata (replace before deploy)
samples/
  qrcodes/           → Example QR PNG exports
  examples.json      → Sample payloads (base64 + URLs)
cert_verification.md → Full product spec
```

## Quick Start

1. **Clone & install tooling (optional).** No build step is required, but QR generation scripts expect `python3` + `qrcode` if you want to regenerate sample assets.
2. **Customize `docs/config.json`.**
   - Replace `SECRET_KEY` with a unique value **before** publishing.
   - Update `BASE_URL` to your GitHub Pages slug (`https://<user>.github.io/<repo>/docs`).
   - Provide real `ISSUER` name and preferred `CERTIFICATE_PREFIX`.
3. **Serve locally.** Any static file server aimed at the repo root works:
   ```bash
   npx serve .
   ```
   Visit `http://localhost:3000/docs/generate.html` and `.../verify.html` to test.

## Deployment (GitHub Pages)

1. Push this repository to GitHub.
2. In **Settings → Pages**, select the `main` branch and `/docs` folder.
3. After Pages finishes deploying, verify the site at `https://<user>.github.io/<repo>/docs/`.
4. Re-scan any printed QR codes whenever `SECRET_KEY` changes—old payloads will no longer validate.

## Workflow Overview

1. **Generate certificates** via `generate.html`.
   - Form validation, auto ID, copyable URL, PNG download, CSV batch processing, and ZIP export for QR codes are built in.
2. **Embed/share** the verification URL or QR image in your certificate templates.
3. **Verify certificates** via `verify.html`.
   - Decrypts payload with your `SECRET_KEY`, validates fields, and displays a "Valid Certificate" state with print-friendly layout. Bad or tampered payloads surface detailed error messaging.

## Sample Assets

Two example payloads + QR images live under `samples/`. They were generated with the default `config.json` values; regenerate them after changing your secret key:

```bash
python3 -m pip install 'qrcode[pil]'
# rerun the inline script from cert_verification.md or adapt samples/examples.json
```

## Security Notes

- Keep `docs/config.json` out of public history if you ever swap to a private deployment—add it to `.gitignore` or inject via CI/CD instead.
- XOR/base64 provides light obfuscation, not cryptographic-grade secrecy. Rotate keys periodically and avoid storing PII beyond what is necessary for verification.

For deeper requirements, see [`cert_verification.md`](./cert_verification.md).