# CDI Certificate Verifier

Single-page certificate lookup site designed for GitHub Pages. Instead of encrypted QR payloads, the verifier reads a public `data.json` registry and displays the matching record based on a URL query parameter.

## Repository Layout

```
docs/
  index.html   → Verifier UI + inline JS
  data.json    → Public registry of certificates
  styles.css   → Minimal overrides (background + print)
```
