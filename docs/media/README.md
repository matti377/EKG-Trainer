# SONO: Mediennachweis

Die sieben klinischen Referenzclips stammen von **Gillman L, Kirkpatrick A (2012)**,
*Portable bedside ultrasound: the visual stethoscope of the 21st century*,
[DOI 10.1186/1757-7241-20-18](https://doi.org/10.1186/1757-7241-20-18).
Die einzelnen Wikimedia-Commons-Dateiseiten weisen **[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)** aus.
Abruf und Lizenzprüfung: 2026-10-08. Diese Lizenz erlaubt Weiterverbreitung und
Bearbeitung mit Attribution. Es wird keine Unterstützung des Produkts durch die Autoren behauptet.

| Datei unter `assets/media/sono/` | Quelle und dargestelltes Muster |
|---|---|
| `lung-sliding.mp4` / `.jpg` | [S1: Normal Lung Sliding](https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S1.ogv) |
| `power-slide.mp4` / `.jpg` | [S2: Power Slide](https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S2.ogv) |
| `b-lines.mp4` / `.jpg` | [S3: Comet Tail Artifacts](https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S3.ogv) |
| `lung-point.mp4` / `.jpg` | [S4: Lung Point](https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S4.ogv) |
| `consolidation.mp4` / `.jpg` | [S5: Lung Consolidation](https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S5.ogv) |
| `interstitial.mp4` / `.jpg` | [S6: Alveolar-Interstitial Syndrome, Lungenkontusion](https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S6.ogv) |
| `pleural-effusion.mp4` / `.jpg` | [S7: Pleural Fluid](https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S7.ogv) |

Die strukturierte Datei [clinical-sources.json](clinical-sources.json) enthält
Original-Downloadlinks, versionierte Dateiseiten, Quellenbeschreibungen, Lizenz,
Bearbeitung und SHA-256-Prüfsummen der ausgelieferten MP4s. Die historischen
Quellenbeschreibungen sind Herkunftsdokumentation, keine ungeprüft übernommenen
aktuellen diagnostischen Kriterien.

Bearbeitung: Ogg-Theora in H.264-MP4 umkodiert (yuv420p, faststart), Ton entfernt,
JPEG-Poster bei Sekunde 1 extrahiert. Die oberen 30 Pixel der 640×480-Clips wurden
wegen Identifikatoren/Datumsangaben schwarz abgedeckt. Beim 320×240-Clip S6 sind
die oberen 24 Pixel und das Datumsfeld unten rechts (x=190, y=216, 130×24) abgedeckt.
Bildgeometrie und Ultraschallfeld wurden nicht beschnitten. Diese Änderungen sind
auch in der Oberfläche bei jeder Aufnahme angegeben.

Die fünf Dateien `diagram-*.svg` sind eigene editierbare Lehrdiagramme des
Resqly-Projekts unter **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.
Ihr Quellcode und die animierte Fassung stehen in `assets/js/sono/illustrations.js`.
Sie veranschaulichen Prinzipien und sind keine diagnostischen Ultraschallaufnahmen.
Die medizinischen Quellen der Diagramme sind bei den jeweiligen Medieneinträgen
in `assets/js/sono/content.js` verknüpft.

Die klinischen Referenzclips sind nicht auf die virtuelle Sondenposition kalibriert
und zeigen andere Personen als die fiktiven Lehrfälle. Insbesondere S6 darf nicht
als dokumentierte Aufnahme eines kardiogenen Lungenödems bezeichnet werden.
Ein geeigneter Originalclip für intraabdominelle eFAST-Flüssigkeit fehlt noch.
