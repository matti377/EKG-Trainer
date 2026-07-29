# EKG lernen

Ein interaktiver EKG-Kurs auf Deutsch — aufgebaut wie eine Sprachlern-App:
kurze Lektionen, ein Lernpfad mit Freischaltung, Herzen, XP und Streak.

## Starten

`index.html` im Browser öffnen. Es gibt keinen Build-Schritt, keine
Abhängigkeiten und kein Backend — reines HTML, CSS und JavaScript.
Der Fortschritt liegt im `localStorage` des Browsers.

Wer lieber über einen lokalen Server arbeitet:

```bash
python3 -m http.server 8000
```

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst, Kopfzeile, Navigation |
| `assets/css/style.css` | Designsystem (Farben, Buttons, Lernpfad, Aufgaben) |
| `assets/js/ekg.js` | Signalerzeugung und Canvas-Darstellung der EKG-Kurven |
| `assets/js/heart.js` | Schematisches Herz mit animiertem Erregungsleitungssystem |
| `assets/js/content.js` | Sämtliche Lektionen, Aufgaben und Bibliothekstexte |
| `assets/js/ui.js` | Aufgabentypen, Medien-Bausteine, Töne |
| `assets/js/app.js` | Zustand, Navigation und die einzelnen Bildschirme |
| `EKG-Skript.pdf` | Begleitskript zum Verteilen (19 Seiten, A4) |
| `build_pdf.py`, `ekgdraw.py` | Erzeugen das PDF; Schriften in `skript-fonts/` |
| `KORREKTUREN.md` | Was gegenüber der Vorlage `ECG ++.docx` geändert wurde |

Die Skripte hängen an `<script>`-Tags mit `?v=9`. Nach einer Änderung diese
Zahl erhöhen, damit der Browser nicht die alte Datei aus dem Cache nimmt.

## Das PDF neu bauen

```bash
python3 build_pdf.py EKG-Skript.pdf
```

Braucht `reportlab` (`pip3 install --user reportlab`). Sämtliche EKG-Kurven im
PDF werden aus demselben Wellenmodell berechnet wie die auf der Website —
`ekgdraw.py` ist die Portierung von `ekg.js` nach Python. Ändert sich also eine
Kurvenform, muss sie an beiden Stellen angepasst werden.

## Die vier Bereiche

- **Lernpfad** — 25 Lektionen in 7 Einheiten, von den Grundlagen bis zu
  Elektrolytstörungen. Jede Lektion mischt Lehrfolien und Übungen.
- **Befunde** — Nachschlagewerk mit 32 laufenden Rhythmusstreifen, nach
  Kategorie filterbar.
- **Labor** — Frequenz, PQ-Zeit, QRS-Breite, ST-Strecke sowie P- und T-Welle
  frei einstellen; die Auswertung darunter benennt die Befunde automatisch.
- **Ableitungen** — Cabrera-Kreis der Frontalebene, Brustwandableitungen und
  die Zuordnung Infarktlokalisation → Gefäß.

## Wie die Kurven entstehen

Jede Kurve wird gerechnet, nicht aufgezeichnet. Wellen sind Gauß-Funktionen
mit Lage, Breite und Amplitude in Sekunden bzw. Millivolt (`V_DEFAULT` in
`ekg.js`). Vorhof- und Kammeraktionen werden **getrennt** eingeplant — genau
deshalb lassen sich AV-Blöcke und die AV-Dissoziation beim totalen Block
sauber abbilden.

Neuen Rhythmus ergänzen: einen Eintrag in `GEN` anlegen und die ID in
`LIBRARY` (`content.js`) eintragen.

```js
mein_rhythmus: sinusLike({
  rate: 70, pq: 0.16,
  vTpl: { t: { a: -0.4 } }        // negative T-Welle
})
```

## Aufgabentypen

`mc` (Einfachauswahl) · `rhythm` (Streifen erkennen) · `tf` (richtig/falsch) ·
`multi` (Mehrfachauswahl) · `order` (Reihenfolge) · `match` (Zuordnen) ·
`num` (Zahleneingabe mit Toleranz) · `label` (auf die Kurve tippen) ·
`teach` (Lehrfolie, keine Wertung)

## Hinweis

Das Material dient dem Lernen und ersetzt keine medizinische Ausbildung,
keine Leitlinie und keine ärztliche Beurteilung. Die Kurven sind
mathematisch erzeugt und damit idealisiert — ein echtes Patienten-EKG ist
unruhiger und vielgestaltiger.
