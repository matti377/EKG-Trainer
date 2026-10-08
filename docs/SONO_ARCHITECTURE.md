# SONO: Architektur und Erweiterung

## Bestand erhalten

Vanilla-JavaScript mit IIFE-Globals und dem vorhandenen `UI.h`-DOM-Helfer; keine Frameworkmigration. EKG-Dateien `app.js`, `content.js`, `ekg.js`, `heart.js`, `ui.js` und `challenge.js` wurden nicht verändert. Das gemeinsame Designsystem, Buttons, Navigation und DOM-/Shuffle-Helfer werden weitergenutzt. SONO lädt keine EKG-Wellenengine; beide Anwendungen werden unabhängig gestartet.

Der EKG-Fortschritt bleibt unverändert unter `ekg-lernen-v1`. SONO benötigt eigene einfache Fortschrittslogik, weil Lesen und Wissenscheck getrennt zählen und ungeprüfte Inhalte kein klinisches Kompetenzsystem darstellen. Es gibt keinen Eingriff in die bestehenden Herzen, Streaks und Challenge-Punkte.

## Dateikarte

| Datei | Aufgabe |
|---|---|
| `index.html` | Gemeinsame Shell, fehlertoleranter dynamischer Einstieg, Dateivorschau und rootrelative HTTP-Assets |
| `assets/js/platform.js` | Testbare Hostauswahl, Produkt-URLs und Hash-/Pfadrouten |
| `assets/js/bootstrap.js` | Produktwechsel, Branding, Metadaten, kanonische Links und bedingtes Laden |
| `assets/css/style.css` | Bestehendes Designsystem plus Produktumschalter |
| `assets/js/sono/content.js` | 6 Module, 73 Kurzlektionen, 16 Fragen, 6 Zeichen, 5 Fälle, 5 Medienanfragen, 15 Quellen |
| `assets/js/sono/core.js` | Schemaprüfung, Bewertung, Fortschritt, Koordinaten, Review- und Medienfreigabe |
| `assets/js/sono/app.js` | SONO-Ansichten, Lehrdiagramme, Filter, Quizformulare und Simulator |
| `assets/css/sono.css` | Auf SONO begrenzte responsive Erweiterungen |
| `server.py` | Zusätzlich gezielter SPA-Fallback für bekannte Routen; API und Dienstbetrieb unverändert |
| `scripts/validate-medical.cjs` | Normale Metadatenprüfung und strenger Publikationsmodus |
| `scripts/build.cjs` | Optionale statische Paketierung inklusive EKG-PDF |
| `tests/platform.test.cjs`, `tests/sono.test.cjs` | Domain-/Daten-/Fortschritts-/Orientierungs- und Konsistenztests |
| `tests/fixtures/medical-baseline.json` | Noch nicht klinisch freigegebener quellenbezogener Regressionsstand |
| `tests/browser.spec.cjs`, `playwright.config.cjs` | Desktop-/Mobiltests im echten Chromium-Browser |
| `tests/test_server.py` | Bestehende API-Tests plus SPA-/Asset-/404-Verhalten |
| `package.json`, `package-lock.json` | Reproduzierbare optionale Entwicklungswerkzeuge; keine Runtime-Dependencies |
| `.gitignore` | Ignoriert Build, Testausgaben und Node-Werkzeuge |
| `MEDICAL_REVIEW.md` | Alle offenen fachlichen Prüfungen und Medienanforderungen |
| `docs/SONO_DEPLOYMENT.md`, `docs/nginx.sono.conf.example` | Lokaler Start und manuelle Domain-/Proxykonfiguration |

## Inhaltsvertrag

`SONO_CONTENT` ist ein statisches versioniertes Datenobjekt, kein ausführbarer HTML-Inhalt. Texte werden über `textContent` gerendert. Inhalte enthalten mindestens:

- `id`, `title`, `objectives`, `sources`, `lastUpdated`, `lastReviewed`, `reviewStatus`, `reviewer`, `limitations`, `relatedModules`, `quizRefs`.
- Lektionen/Zeichen/Fälle: `content` mit typisierten Blöcken (`kind`, `text`, `sources`). Fallanamnese ist ausdrücklich fiktiv und kein Quellenzitat.
- Fragen: `kind`, `prompt`, `options[{id,text,explanation}]`, `correctAnswers[]`. Mehrfachwahl wird nur bei exakter Mengenübereinstimmung bestanden.
- Quellen: `title`, `organization`, `publicationDate` (null bei unbekanntem Datum), `url`, `accessDate`, `section`, `verification`.
- Medien: `kind`, `status`, `url`, `mimeType`, Region/Befund/Zeichen/Mode/Probe/Schwierigkeit, `positionId`, Orientierung, Interpretation, Artefakte, `license`, `provenance`, `attribution`, `recording`, `annotations`.

IDs bleiben bei redaktionellen Änderungen stabil. Bei didaktisch wesentlich geänderten Fragen neue Frage-ID vergeben, damit alte Antworten nicht als neuer Wissensnachweis zählen. `locale: de` und stabile IDs trennen Inhalte von UI-Strings; weitere Sprachen können später parallele Inhaltskataloge und ein UI-Wörterbuch erhalten. Übersetzungsoberfläche oder automatische Übersetzung sind noch nicht implementiert.

Statuswerte: `draft`, `awaiting-medical-review`, `medically-reviewed`, `revision-required`. Es gibt keinen automatischen Übergang zu medizinisch geprüft. Normale Validierung akzeptiert klar gekennzeichnete Entwürfe. Publikationsvalidierung fordert für alle medizinischen Einträge abgeschlossene Review-Metadaten.

## Neue Originalaufnahme einpflegen

Erst die in `MEDICAL_REVIEW.md` beschriebenen Rechte- und Fachprüfungen abschließen. Dann:

1. Anonymisierte Datei unter `/assets/media/` ablegen, neuen Medieneintrag anlegen und `mediaRefs` im Fall ergänzen.
2. Lizenz und Quelle konkret belegen, `redistribution` nur bei tatsächlich erlaubter Weiterverbreitung setzen. `derivatives` steuert, ob eine reine Anzeigehelligkeitsänderung überhaupt erlaubt ist. Keine externen Hotlinks.
3. `mimeType` auf `video/mp4`, `video/webm`, `image/jpeg` oder `image/png` setzen. `status: available` erst nach tatsächlicher medizinischer Prüfung.
4. Unter `recording` die real zugeordnete `patientPosition: {x,y,z}`, `pose: {rotation,tilt,rock}`, `depthCm`, `screenMarker: left`, `positionTolerance` und `angleTolerance` hinterlegen. Die Anwendung akzeptiert keine ungeprüfte Spiegelung rechtsmarkierter Aufnahmen. Eine andere Originalkonvention bedarf einer expliziten Erweiterung und klinischen Prüfung.
5. Akquisitionsbeschreibung, Differenzialdiagnosen und Limitationen überprüfen. Die aktuelle konservative Tiefenauswahl akzeptiert nur eine genau passende aufgezeichnete Tiefe; kein Crop/Zoom als neue Anatomie. Mehrere aufgezeichnete Zustände benötigen mehrere Medieneinträge.
6. Tests mit freigegebenen, anonymisierten Beispielen ergänzen. Die derzeitigen Medien-Tests verwenden ausschließlich Metadaten-Fakes ohne reale Clips und sind keine medizinische Validierung.

`authorizedMedia` prüft Metadaten, erlaubte lokale URL, Privacy-Bestätigung und Rechte. `resolveRecording` prüft zusätzlich Fall, Position, Probe, Mode, Lage, Winkel, Kontakt und Tiefe. Nur dann entsteht ein Video-/Bildelement. Nicht endliche Koordinaten oder fehlende Mappingdaten dürfen nie einen Match liefern. Toleranzen sind didaktische Zuordnungen, keine Simulation physikalischer Schallausbreitung.

## Koordinaten

Normierter Patientenraum: +x Patienten-rechts, +y kranial, +z anterior. Torsoansicht ist von vorn, daher ist +x links im Diagramm. Der Ausgangsmarker ist `(0,1,0)`, der Ausgangsstrahl `(0,0,-1)`. `probeFrame` wendet definierte Rotationen an und liefert orthogonale Marker-, Strahl- und Ebenennormalenvektoren. Die generische Orientierung ist ausdrücklich von einer klinisch validierten Akquisition getrennt. Lateral/dorsal beschriebene Fenster sind nur schematisch auf die Frontkarte projiziert.

Landmarkentests prüfen linke/rechte und kraniale/kaudale Darstellung sowie Marker 0°/90°. Das ist eine mathematische Konventionsprüfung, keine Validierung von Organformen oder tatsächlichen Schallwegen.

## Bewusste Grenzen

Kein echter Beamformer, kein randomisiertes Rauschbild, keine generierten Erkrankungsbilder, keine quantitativen Herzmessungen, keine 3D-Anatomie, keine Interpolation. M-Mode/Doppler sind als noch nicht verfügbare Simulatoroptionen deaktiviert; Theorie ist vorhanden. Clipfragen, echte Bildannotationen und diagnostisches Erkennungstraining brauchen zuerst geeignete freigegebene Aufnahmen. Atlasbeschriftungen sind aktuell Metadaten; eingebrannte Beschriftungen späterer Originalmedien werden nicht entfernt.

Der aktuelle Simulator trainiert Bedienung/Orientierung und zeigt Verfügbarkeitsgrenzen. Die kurzen Lektionen benötigen fachliche Erweiterung und Supervision; das Produkt ist ein funktionsfähiger technischer Lernplattform-Entwurf, kein fertig klinisch validierter Kurs.
