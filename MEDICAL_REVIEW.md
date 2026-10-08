# SONO: medizinische Prüfung vor Freigabe

Stand: **2026-10-08**. Status: **Awaiting medical review / Fachprüfung ausstehend**.
Es liegt keine medizinische Freigabe durch eine qualifizierte Person vor. `lastReviewed` und `reviewer` sind absichtlich `null`. Quellenzugriff, automatisierte Konsistenztests und Softwarefunktion dürfen nicht als ärztliche Prüfung dargestellt werden.

## Umfang und offene Aufgaben

| Bereich | Vorhanden | Ausstehende Fachprüfung |
|---|---|---|
| Grundlagen | 16 kurze Lektionen; Frequenz- und Orientierungsdiagramme | Physikformulierungen, geeignete Schallkopfwahl, Auflösung, Doppler und ALARA/TI/MI; keine Gerätesimulation |
| Lunge | 15 kurze Lektionen, Zeichen und Fälle | Kriterien für A-/B-Linien, lokaler Aussagewert von Sliding, Alternativen bei fehlendem Sliding, echte/pseudo Lung Points, Air Bronchogram, Erguss/Konsolidierung |
| eFAST | 12 kurze Lektionen, Untersuchungsfenster, Traumafall | Akquisition rechts/links/Becken/Perikard/Thorax, physiologische und vorbestehende Flüssigkeit, falsch positive/negative Befunde, klinischer Versorgungspfad |
| Herz | 12 kurze Lektionen | FoCUS-Grenzen, Standardansichten, Gerätemarker, Perikard versus Pleura/Fett, Tamponade, Volumenstatus, Rechtsherzbelastung; kein quantitatives Messtraining |
| Gefäße | 8 kurze Lektionen | Vollständigkeit von Kompressionsprotokollen, Doppler, Punktion, Nadelspitzensicht, Kontraindikationen, Hygiene und lokale Standards |
| Abdomen | 10 kurze Lektionen | Anatomische Orientierung, Normalvarianten und Limitationen; kein vollständiger organspezifischer Diagnostikkurs |
| Fälle / Fragen | 5 ausdrücklich fiktive Fälle, 16 Fragen mit Begründung jeder Option | Klinische Plausibilität der erfundenen Vitalwerte, Fragestellung, sichere Antwortoptionen und didaktische Eignung |
| Medieneinträge | 5 Metadatensätze | Aufnahmeauswahl, Anonymisierung, Rechtebeleg, Attribution und medizinische Zuordnung |
| Simulator | Schematische Körperkarte und mathematische Orientierung | Positionskonventionen, Landmarken, patientenbezogene Validierung jedes späteren Clips und zulässige Zuordnungstoleranzen |

Die 73 Lektionen sind **kompakte Einführungsentwürfe**, jeweils mit Kernaussage, Lernziel, Aussagegrenze und Quellen. Sie bilden keinen vollständigen Fachkurs ab. Vertiefte Akquisitionsanleitungen, validiertes Bilderkennungstraining und zusätzliche diagnostische Differenzialfälle sind nach Fachprüfung zu ergänzen. Der tatsächliche Lehrwert der Fragen muss erprobt werden; keine Wirksamkeit wurde validiert.

## Quellenabgleich

Die konkreten ACEP-Sonoguide-Seiten zu Physik, Lunge, eFAST, Herz, Gefäßen, Gallenblase, Niere und Aorta sowie AIUM-ALARA wurden zur Recherche aufgerufen. Bibliografische Metadaten, Zugriffsdatum und Fundstellen liegen in `assets/js/sono/content.js`. Nicht verifizierte Publikationsdaten stehen ausdrücklich auf `null` und werden in der Oberfläche als offen dargestellt.

EFSUMB hat Vorrang im weiteren Leitlinienabgleich:

- [Leitlinienregister](https://efsumb.org/guidelines-recommendations-english-versions/) und [Trainingsempfehlungen](https://efsumb.org/minimum-training-recommendations/) wurden gelesen. Registerseiten sind keine Belege für einzelne diagnostische Schwellenwerte.
- [EFSUMB Physik-Kapitel](https://efsumb.org/wp-content/uploads/2026/02/ECB2ndCh1_Basic_principles_rv2026.pdf): Text zugänglich, DOI 10.37713/ECB01. Versionsdatum muss geklärt werden: Kopfdatum 2018, Dateipfad 2026. Keine neue Publikationsversion daraus erfinden.
- [EFSUMB PoCUS Part One](https://orca.cardiff.ac.uk/id/eprint/154484/): bibliografischer Eintrag und Abstract zugänglich, Online-Publikation 2022, DOI 10.1055/a-1882-5615. PDF-Aufruf über den Recherchezugang fehlgeschlagen; der Volltextabgleich bleibt offen.
- DEGUM- und aktuelle lokale Ausbildungs-/Hygienestandards sowie aktuelle internationale LUS-/PoCUS-Empfehlungen müssen im klinischen Review abgeglichen werden. Keine DEGUM-Freigabe wird behauptet.

## Besonders sensible Aussagen

Die Prüfung muss ausdrücklich bestätigen, dass A-Linien Artefakte und B-Linien nicht krankheitsspezifisch sind; Sliding nur am untersuchten Ort interpretiert wird; fehlendes Sliding allein keinen Pneumothorax beweist; ein Lung Point fehlen kann; negative eFAST relevante Verletzungen nicht ausschließt; Perikarderguss und Tamponade unterschieden werden; FoCUS keine umfassende Echokardiographie ersetzt.

`tests/fixtures/medical-baseline.json` ist ein versionierter, quellenverknüpfter **redaktioneller Regressionsstand**, nicht fachärztlich geprüfte Referenzdaten. Texttests schützen diese Einschränkungen vor versehentlichem Entfernen, beweisen aber weder semantische Vollständigkeit noch klinische Richtigkeit. Sobald eine qualifizierte Person geprüft hat, sowohl Inhalt als auch Referenzstand nachvollziehbar versionieren.

## Fehlende Originalaufnahmen

| Medien-ID | Benötigte Aufnahme |
|---|---|
| media-normal | Korrekt orientierte Pleuralinie mit Atembewegung und A-Linien |
| media-interstitial | B-Linien mit dokumentiertem Fenster, Einstellungen und klinischem Kontext |
| media-pneumothorax | Zeichenkombination bei Pneumothorax, gesicherter Lung Point und relevante Kontrollen; voraussichtlich mehrere Clips nötig |
| media-pleural | Pleuralflüssigkeit mit Zwerchfell und anatomischen Begrenzungen |
| media-trauma | Freie intraperitoneale Flüssigkeit in dokumentierten eFAST-Fenstern; zur Komplettuntersuchung mehrere Clips nötig |

Alle fünf stehen auf `pending`; ihre URLs sind `null`. **Es gibt noch keine reale Bild-/Clip-Erkennungsübung.** Der Atlas ist derzeit eine durchsuchbare Metadatenbibliothek. The POCUS Atlas wurde nur als möglicher Rechercheausgangspunkt verzeichnet; öffentlich zugänglich bedeutet nicht automatisch redistributionsberechtigt.

## Verfahren für spätere Freigaben

1. Quellenfassung und konkrete Fundstelle prüfen; Text und klinische Grenzen gegebenenfalls korrigieren.
2. Fachqualifikation und tatsächliche Prüfung organisatorisch dokumentieren. Erst danach Reviewer und reales Prüfdatum eintragen und den betreffenden Datensatz auf `medically-reviewed` setzen. Das Prüfdatum darf nicht älter als die letzte Inhaltsänderung sein.
3. Für Medien Herkunft, Patientenanonymisierung, Lizenzname/-URL, Attribution, Erlaubnis zur Weiterverbreitung und gegebenenfalls Bearbeitung belegen. `rightsEvidence` muss auf einen intern nachvollziehbaren Beleg verweisen, ohne personenbezogene Daten im Repository zu veröffentlichen.
4. Reale Aufnahmeparameter einschließlich Position, Orientierung, Bildschirmmarker und aufgezeichneter Tiefe erfassen. Toleranzen nur nach konkreter Validierung festlegen; keine automatisch angenommene kontinuierliche Anatomie.
5. `npm test`, `npm run validate:medical`, Browserprüfungen und zuletzt `npm run validate:publication` ausführen. Der letzte Befehl schlägt im aktuellen Entwurfsstand absichtlich fehl.

Die technische Freigabeprüfung kann nur Vollständigkeit prüfen; die Echtheit eines eingetragenen Reviewers oder Rechtebelegs bleibt menschliche Verantwortung.
