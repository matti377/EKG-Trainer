# EKG lernen

Ein interaktiver EKG-Kurs auf Deutsch — aufgebaut wie eine Sprachlern-App:
kurze Lektionen, ein Lernpfad mit Freischaltung, Herzen, XP und Streak.

## Starten

`index.html` im Browser öffnen. Es gibt keinen Build-Schritt und keine
Abhängigkeiten — reines HTML, CSS und JavaScript. Der Fortschritt liegt im
`localStorage` des Browsers.

## Challenge im Kurs (mehrere Geräte)

Nur für diesen einen Modus braucht es eine Stelle, die die Geräte verbindet.
Dafür liegt `server.py` bei — reine Standardbibliothek, nichts zu installieren:

```bash
python3 server.py
```

### Auf dem öffentlichen Kursserver

Läuft die Seite bereits auf einem Server, ist nichts weiter zu tun — alle
öffnen dieselbe Adresse:

```
https://ekg.resqly.lu/
```

Unter dieser Adresse öffnet sich direkt die Challenge (`QUIZ_HOST` in
`assets/js/app.js`); alle anderen Bereiche sind über die Navigation erreichbar.

Wer die Dateien stattdessen direkt aus dem Ordner öffnet, kann trotzdem
mitspielen: Die Challenge greift dann automatisch auf denselben Kursserver zu.
Die Adresse steht in `assets/js/app.js` unter `CHALLENGE_SERVER` — beim Umzug
ist das die einzige Zeile, die sich ändert.

### Im eigenen Netz, ohne Internet

Der Server nennt beim Start zwei Adressen. Die zweite (`http://192.168.…`)
geben alle Mitspielenden im selben WLAN in ihrem Browser ein. Dann:

1. Eine Person geht auf **Trainer → Challenge** und eröffnet eine Lobby.
2. Der vierstellige Code erscheint groß auf dem Bildschirm.
3. Alle anderen tippen Namen und Code ein und treten bei.
4. Der Host legt Umfang (5–30 EKGs), Zeit pro Frage und Themengebiet fest
   und startet.

Gespielt wird wie bei Kahoot: Für jede richtige Antwort gibt es bis zu 1000
Punkte — die Hälfte ist sicher, die andere Hälfte schmilzt mit der verbrauchten
Zeit weg. Jeder weitere Treffer in Folge bringt 100 Punkte Zuschlag, höchstens
500. Eine falsche oder fehlende Antwort reißt die Serie ab, die Punkte bleiben.

Sobald alle geantwortet haben oder die Zeit abgelaufen ist, kommt die Auflösung:
richtige Antwort, eigene Punkte, Zuspruch zur Serie („Serie von 3 — voll im
Flow!"), die Verteilung der Gruppe und der Zwischenstand. Nach sieben Sekunden
geht es von selbst weiter. Am Ende stehen Podium, Endstand und die Auflösung
aller EKGs.

Die Lobbys liegen nur im Arbeitsspeicher; ein Neustart des Servers löscht sie.
Das ist Absicht — es gibt nichts zu pflegen und nichts, was liegen bleibt.
Anderer Port: `PORT=9000 python3 server.py`.

**Alle übrigen Bereiche laufen weiterhin ohne Server**, direkt aus dem Ordner.

## Auf dem Server ausrollen

Einmalig auf dem Ubuntu-Server:

```bash
git clone https://github.com/matti377/EKG-Trainer.git
cd EKG-Trainer
./deploy.sh
```

Danach reicht bei jeder Änderung wieder `./deploy.sh`. Das Skript holt den
Stand, richtet einen systemd-Dienst ein (oder frischt ihn auf), startet neu und
prüft, ob die Seite auch wirklich antwortet.

| Aufruf | Wirkung |
|---|---|
| `./deploy.sh` | Stand holen, Dienst einrichten/neu starten, prüfen |
| `./deploy.sh --status` | Nachsehen, was gerade läuft |
| `./deploy.sh --logs` | Log mitlesen |
| `./deploy.sh --no-pull` | Lokalen Stand ausrollen, ohne zu holen |
| `./deploy.sh --force` | Auch neu starten, wenn eine Challenge läuft |

Einstellungen kommen aus `deploy.env` neben dem Skript (nicht im Repository):

```bash
PORT=8000
SERVICE=ekg-lernen
RUN_USER=ekg
```

### Hinter nginx (ekg.resqly.lu)

In `deploy.env` `HOST=127.0.0.1` setzen, damit `server.py` nur noch über den
Proxy erreichbar ist, und `./deploy.sh` erneut ausführen. Dann in nginx:

```nginx
server {
    server_name ekg.resqly.lu;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

HTTPS danach mit `sudo certbot --nginx -d ekg.resqly.lu`.

Zwei Dinge, die das Skript bewusst tut:

- **Es baut das PDF nicht neu.** Das fertige `EKG-Skript.pdf` liegt im
  Repository. Würde der Server es neu erzeugen, wäre der Arbeitsbereich
  verändert und der nächste `git pull --ff-only` blockiert. Gebaut wird lokal,
  eingecheckt wird das Ergebnis.
- **Es fragt nach, wenn gerade eine Challenge läuft.** Die Lobbys liegen nur im
  Arbeitsspeicher; ein Neustart mitten im Kurs würde alle hinauswerfen.

Auf dem Server sind **keine Python-Pakete nötig** — `server.py` kommt mit der
Standardbibliothek aus. `reportlab` braucht nur, wer das PDF baut.

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
| `EKG-Skript.pdf` | Begleitskript zum Verteilen (26 Seiten, A4) |
| `build_pdf.py`, `ekgdraw.py` | Erzeugen das PDF; Schriften in `skript-fonts/` |
| `server.py` | Nur für die Challenge: liefert die Seite aus und verwaltet die Lobbys |
| `deploy.sh` | Ausrollen auf dem Ubuntu-Server (siehe oben) |
| `KORREKTUREN.md` | Was gegenüber der Vorlage `ECG ++.docx` geändert wurde |

Die Skripte hängen an `<script>`-Tags mit `?v=24`. Nach einer Änderung diese
Zahl erhöhen, damit der Browser nicht die alte Datei aus dem Cache nimmt.

## Das PDF neu bauen

```bash
python3 build_pdf.py EKG-Skript.pdf
```

Braucht `reportlab` (`pip3 install --user reportlab`). Sämtliche EKG-Kurven im
PDF werden aus demselben Wellenmodell berechnet wie die auf der Website —
`ekgdraw.py` ist die Portierung von `ekg.js` nach Python. Ändert sich also eine
Kurvenform, muss sie an beiden Stellen angepasst werden.

## Die Bereiche

- **Lernpfad** — Lektionen in 8 Einheiten, von den Grundlagen bis zur
  interaktiven Medikamentengabe. Jede Lektion mischt Lehrfolien und Übungen.
- **Befunde** — Nachschlagewerk mit 35 laufenden Rhythmusstreifen, nach
  Kategorie filterbar.
- **Labor** — Frequenz, PQ-Zeit, QRS-Breite, ST-Strecke sowie P- und T-Welle
  frei einstellen; die Auswertung darunter benennt die Befunde automatisch.
- **Trainer** — zwei Modi:
  - *Einzeltraining:* EKG ansehen, Befund ins Suchfeld tippen, aus der
    Vorschlagsliste wählen. Kurzformen wie `VHF`, `VT` oder `RSB` funktionieren;
    nach Gruppen filterbar. Bei mehrdeutiger Eingabe (etwa „Mobitz") verlangt
    das Feld bewusst eine Auswahl, statt zu raten.
  - *Challenge:* Mehrspieler-Quiz mit Punkten, Serien und Podium — siehe oben.
    Braucht `server.py`.
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
`num` (Zahleneingabe mit Toleranz) · `medication` (Dosis eingeben, geben und
EKG-Wirkung sehen) · `label` (auf die Kurve tippen) ·
`teach` (Lehrfolie, keine Wertung)

## Hinweis

Das Material dient dem Lernen und ersetzt keine medizinische Ausbildung,
keine Leitlinie und keine ärztliche Beurteilung. Die Kurven sind
mathematisch erzeugt und damit idealisiert — ein echtes Patienten-EKG ist
unruhiger und vielgestaltiger.
