# ero-radio.de

Statische Website des griechischen Webradios ERO Radio (Ελληνικό Ραδιόφωνο Ομογένειας),
Monheim am Rhein. Kein Framework, kein Build — der Ordnerinhalt ist der Webroot.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `index.html` | die Seite |
| `assets/css/style.css` | Stylesheet |
| `assets/js/main.js` | Player, Sendeplan, Bewegungen |
| `assets/fonts/` | Inter als WOFF2, Latein + Griechisch (SIL OFL) |
| `assets/vendor/` | GSAP, ScrollTrigger, SplitText, Lenis |
| `assets/img/` | Bilder als AVIF mit WebP-Ersatz, Favicons |
| `robots.txt`, `sitemap.xml`, `llms.txt` | SEO |

## Grundsätze

- **Keine Fremdanfragen vor Einwilligung.** Schriften und Bibliotheken liegen lokal,
  Video-Vorschaubilder ebenfalls. YouTube wird erst eingebettet, wenn jemand auf
  Abspielen klickt (dann über youtube-nocookie.com).
- Einzige Verbindung nach außen: der eigene Icecast-Stream auf
  `stream.ero-radio.de:8000` für Ton und Titelanzeige.
- Bilder als AVIF mit WebP-Ersatz. Ausnahmen: Favicon (PNG) und `og:image` (JPG,
  weil Facebook und WhatsApp AVIF nicht zuverlässig anzeigen).
- Schriften mit griechischem Zeichensatz — die meisten Display-Schriften haben keinen.

## Deployment

Plesk zieht per Git von GitHub (`main`). Nach einem Push auf `main` aktualisiert
der Webhook den Webroot auf dem Server.
