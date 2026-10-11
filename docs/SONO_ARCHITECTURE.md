# SONO: Architektur und Erweiterung

## Bestand erhalten

Vanilla-JavaScript mit IIFE-Globals und dem vorhandenen `UI.h`-DOM-Helfer; keine Frameworkmigration. Das gemeinsame Designsystem, Buttons, Navigation und DOM-/Shuffle-Helfer werden weitergenutzt. SONO lädt keine EKG-Wellenengine; beide Anwendungen werden unabhängig gestartet.

EKG, SONO und Academy behalten ihre lokalen Speicherformate. Bei Anmeldung synchronisiert `assets/js/account.js` sie mit einem gemeinsamen Konto. Die SQLite-Datenbank hält je Fachgebiet einen eigenen Lernstand; abgeschlossene Lektionen bleiben beim Zusammenführen erhalten. Challenge-Lobbys sind weiterhin unabhängig vom Lernstand.

## Dateikarte

| Datei | Aufgabe |
|---|---|
| `index.html` | Resqly Academy: Startseite, leitet alte Kurs-Einstiege in ihren Ordner weiter |
| `ekg/index.html`, `sono/index.html` | Je Kurs eine Shell mit eigenem Titel, Metadaten und Branding; fehlertoleranter dynamischer Einstieg, Dateivorschau und rootrelative HTTP-Assets |
| `assets/js/platform.js` | Testbare Kursordner-/Domain-URLs, Weiterleitung alter Einstiege und Hash-/Pfadrouten |
| `assets/js/bootstrap.js` | Produktwechsel, kanonische Links und Laden der Skripte je Anwendung |
| `assets/js/account.js`, `account_store.py` | Gemeinsame Kontoanzeige, Browser-Synchronisierung und persistente Konto-/Lernstandsdaten |
| `assets/css/style.css` | Bestehendes Designsystem plus Produktumschalter |
| `assets/js/sono/content.js` | 6 Module, 73 Kurzlektionen, 16 Fragen, 6 Zeichen, 5 Fälle, 13 Medieneinträge, 16 Quellen |
| `assets/js/sono/core.js` | Schemaprüfung, Bewertung, Fortschritt, Koordinaten, Review- und Medienfreigabe |
| `assets/js/sono/illustrations.js` | Deterministische SVG-Lehrdiagramme und Animation für fünf Fälle |
| `assets/media/sono/`, `docs/media/` | Lokale Clips, Poster, SVGs und Herkunfts-/Lizenznachweise |
| `assets/js/sono/app.js` | SONO-Ansichten, Lehrdiagramme, Filter, Quizformulare und Simulator |
| `assets/css/sono.css` | Auf SONO begrenzte responsive Erweiterungen |
| `assets/js/academy/app.js`, `assets/css/academy.css` | Startseite mit Links zu den Kursordnern, Quiz des Tages, Themen-Quiz und Auswertung; Lernstand unter `resqly-academy-v1` |
| `assets/js/academy/quiz.js` | DOM-freie Quizlogik: CSV einlesen und prüfen, Tagesquiz auswählen, Serie und Wissens-Score berechnen |
| `assets/data/fragen.csv` | Fragenbank (drei Antworten, eine richtig, mit Erklärung); Spalten siehe README |
| `server.py` | SPA-Fallback, Challenge-Lobbys und Konto-/Lernstand-API |
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

## Originalaufnahmen und Lehrdiagramme

Die aktuelle Bibliothek enthält sieben klinische Referenzclips (CC BY 2.0) und fünf eigene SVG-Lehrdiagramme. Eine eFAST-Aufnahme bleibt ausstehend. Dateien liegen unter `assets/media/sono/`, der [Mediennachweis](media/README.md) enthält Quellen, Lizenz und Bearbeitung. Lehrdiagramme haben `kind: teaching-diagram`; klinische Clips `kind: clinical-recording`. `mediaRefs` verknüpft Medien mit Lektionen und Fällen.

Neue Medien einpflegen:

1. Datei und Poster lokal ablegen; Quelle, Rechte, Attribution, Bearbeitung und Anonymisierung dokumentieren.
2. `status: available` bedeutet technisch vorhanden und mit belegten Rechten; medizinischer Reviewstatus bleibt ein unabhängiges Feld. Die Wiedergabe verlangt keine vorgezogene Fachprüfung.
3. Für Referenzclips `recording.mappingStatus: reference-only` und unbekannte Akquisitionsparameter auf `null` setzen. Die Anzeige übernimmt die Originalorientierung; virtuelle Positions-/Gain-/Tiefenregler sind in diesem Modus deaktiviert.
4. Nur für später tatsächlich kalibrierte Aufnahmen reale `patientPosition`, `pose`, `depthCm`, `screenMarker` und überprüfte Toleranzen erfassen. Keine Aufnahmedaten aus einem dargestellten Muster erfinden.
5. Aufnahme medizinisch prüfen, Interpretation und Limitationen ergänzen und den Reviewstatus erst nach tatsächlicher Prüfung ändern.

`authorizedMedia` prüft erlaubte lokale URL, Privacy-Bestätigung, Herkunft und Rechte. `resolveRecording` prüft für eine kalibrierte Zuordnung zusätzlich Position, Probe, Mode, Lage, Winkel, Kontakt und Tiefe; Referenzclips können diese Zuordnung nicht erfüllen. Tests prüfen auch vorhandene Dateien und echte Videowiedergabe im Browser.

`illustrations.js` erzeugt beschriftete, farbige Lehrdiagramme ohne künstliches Ultraschallrauschen. Animation, Pause, Beschriftung, Gain, schematischer Tiefenausschnitt und Flüssigkeitsmenge sind lokal steuerbar. Drei Lungenfälle bieten qualitative M-Mode-Zeitmuster. Nicht modellierte Sondenpositionen zeigen einen Rückkehrhinweis. Die Zeichnungen sind keine physikalische Simulation und haben keine diagnostischen Maßeinheiten. Animationen werden beim Routenwechsel entfernt und respektieren reduzierte Bewegung.

## Koordinaten

Normierter Patientenraum: +x Patienten-rechts, +y kranial, +z anterior. Torsoansicht ist von vorn, daher ist +x links im Diagramm. Der Ausgangsmarker ist `(0,1,0)`, der Ausgangsstrahl `(0,0,-1)`. `probeFrame` wendet definierte Rotationen an und liefert orthogonale Marker-, Strahl- und Ebenennormalenvektoren. Die generische Orientierung ist ausdrücklich von einer klinisch validierten Akquisition getrennt. Lateral/dorsal beschriebene Fenster sind nur schematisch auf die Frontkarte projiziert.

Landmarkentests prüfen linke/rechte und kraniale/kaudale Darstellung sowie Marker 0°/90°. Das ist eine mathematische Konventionsprüfung, keine Validierung von Organformen oder tatsächlichen Schallwegen.

## Bewusste Grenzen

Kein echter Beamformer, kein randomisiertes Rauschbild, keine generierten diagnostischen Erkrankungsbilder, keine quantitativen Herzmessungen, keine 3D-Anatomie und keine Interpolation. Doppler wird durch einen echten Power-Slide-Referenzclip veranschaulicht, nicht simuliert. Die M-Mode-Ansicht ist ein schematisches Zeitmuster ohne Messfunktion. Für intraabdominelle eFAST ist nur ein Lehrdiagramm vorhanden.

Referenzaufnahmen gehören nicht zu den fiktiven Fallpatienten. Aus-/einblendbare Lehrbeschriftungen betreffen SVGs und redaktionelle Einordnung; Beschriftungen im Originalvideo bleiben bestehen. Identifikatoren/Datumszeilen wurden außerhalb des Ultraschallfelds geschwärzt und diese Bearbeitung dokumentiert.

Der aktuelle Simulator trainiert Bedienung/Orientierung und erklärt Bildprinzipien. Die Fachprüfung und spätere öffentliche Freigabe liegen beim Betreiber; die Arbeitsversion bleibt bis dahin vollständig benutzbar.
