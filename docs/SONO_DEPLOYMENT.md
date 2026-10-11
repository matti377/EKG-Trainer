# EKG + SONO aus demselben Repository

Es wurden keine DNS-, Proxy-, Zertifikats-, Credential- oder Produktionsänderungen ausgeführt. Der Python-Server bedient alle Domains und speichert jetzt Konten und Lernstände in SQLite. Die Startseite ist die Resqly Academy; jeder Kurs liegt in einem eigenen Ordner (`ekg/`, `sono/`) mit eigener `index.html`.

## Lokal starten

```sh
python3 server.py
```

Standardport: 8000; alternativ `PORT=8001 HOST=127.0.0.1 python3 server.py`.

- Academy-Startseite: `http://localhost:8000/`
- EKG: `http://localhost:8000/ekg/`
- SONO: `http://localhost:8000/sono/`
- Direkter SONO-Link: `http://localhost:8000/sono/lektion/lunge-06`

Der Umschalter und die Kurskarten der Startseite verlinken auf die Kursordner (`/ekg/`, `/sono/`). Nur auf den beiden Kursdomains `ekg.resqly.lu` und `sono.resqly.lu` verweisen sie weiterhin auf die jeweils eigene HTTPS-Domain, damit dort gespeicherter Lernstand erhalten bleibt. Kursdomains und Ordner werden zentral in `assets/js/platform.js` gepflegt.

Alte Einstiege bleiben gültig: Die Startseite leitet `ekg.resqly.lu/`, `sono.resqly.lu/`, `sono.localhost` und `?app=ekg` / `?app=sono` vor dem ersten Rendern in den passenden Ordner weiter und behält die Hashroute bei (`https://ekg.resqly.lu/#/labor` → `https://ekg.resqly.lu/ekg/#/labor`). Kursdomains haben Vorrang vor Query-Overrides.

Die bisherigen EKG-Hashrouten bleiben erhalten: `pfad`, `lektion/:id`, `trainer`, `bibliothek`, `labor`, `ableitungen`, `challenge`. Direkte Dateinutzung bleibt für Selbststudium möglich (`index.html`, `ekg/index.html`, `sono/index.html`); für zuverlässige Speicherung und die Challenge den Server verwenden.

## Prüfungen und optionaler Build

Die Anwendungen brauchen keine Node-Laufzeit, Frameworks, API-Schlüssel oder zusätzlichen Dienste. Der vorhandene Python-Server stellt auch die Konto- und Fortschritts-API bereit. Node dient ausschließlich der Entwicklung und optionalen Paketierung.

```sh
npm ci
npm test
npm run validate:medical
python3 -m unittest discover -s tests -p 'test_*.py'
npx playwright install chromium
npm run test:browser
npm run build
```

Der Build prüft JS-Syntax und Medizinschema und kopiert `index.html`, `ekg/`, `sono/`, `assets/` und das bestehende EKG-PDF nach `dist/`. Der vorhandene `deploy.sh` bedient weiterhin das Repository direkt. `dist/` ist für optionale statische Auslieferung vorgesehen; die Python-API muss dabei separat weiterlaufen.

`npm run validate:publication` ist die strengere redaktionelle Prüfung. Sie schlägt derzeit **absichtlich fehl**, weil alle medizinischen Einheiten auf Fachprüfung warten. Der normale technische Build ist kein medizinischer Publikationsnachweis. Dieses Gate wird nicht automatisch durch `deploy.sh` erzwungen; vor öffentlicher medizinischer Freigabe muss der Betreiber es ausdrücklich in seinen Freigabeprozess aufnehmen.

## Produktionsdomain ergänzen

1. Beim DNS-Anbieter `sono.resqly.lu` als CNAME auf `ekg.resqly.lu` anlegen, sofern die Infrastruktur dies erlaubt; alternativ einen A-Record auf dieselbe Server-IP. AAAA nur bei tatsächlich funktionierendem IPv6-Upstream veröffentlichen. EKG-Records unverändert lassen.
2. Für `sono.resqly.lu` ein gültiges TLS-Zertifikat bereitstellen (separates Zertifikat oder vorhandenes SAN-Zertifikat mit diesem Namen). Beide Anwendungen über HTTPS ausliefern.
3. Einen zusätzlichen Virtual Host nach `nginx.sono.conf.example` einrichten. Zertifikatspfade und den tatsächlich konfigurierten Python-Port einsetzen. Der neue Host zeigt auf denselben laufenden `server.py`-Dienst wie EKG. Die vorhandene EKG-Konfiguration bleibt bestehen.
4. Nach manueller Konfiguration `sudo nginx -t` ausführen und bei Erfolg kontrolliert neu laden. Das Beispiel ist wegen seiner Platzhalter **nicht unverändert aktivierbar**.
5. Nach dem autorisierten Repository-Deployment beide Hostnamen, Konto, Lernstand, Produktwechsel und Challenge prüfen. Browserdaten werden bei Anmeldung in das gemeinsame Konto übernommen.

## Academy-Startseite und Kursordner

Die Startseite `index.html` ist die Resqly Academy (`assets/js/academy/app.js`, `assets/css/academy.css`) und verlinkt auf die Kursordner. Unter `academy.resqly.lu` liegen damit `academy.resqly.lu/`, `academy.resqly.lu/ekg/` und `academy.resqly.lu/sono/`. Für die Domain gelten dieselben Schritte wie oben: DNS-Eintrag auf denselben Server, gültiges TLS-Zertifikat und ein weiterer Virtual Host nach `nginx.sono.conf.example` mit `server_name academy.resqly.lu`, der auf denselben `server.py`-Dienst zeigt. Ohne diese manuelle Konfiguration ist die Startseite öffentlich nicht erreichbar, weil die beiden Kursdomains ihre Startseite in den Kursordner weiterleiten.

Ohne Anmeldung liegt Lernstand je Origin im Browser. Mit Anmeldung wird er über denselben Python-Dienst zwischen `academy.resqly.lu`, `ekg.resqly.lu` und `sono.resqly.lu` synchronisiert. Für systemd legt `deploy.sh` die Datenbank in `/var/lib/ekg-lernen/academy.sqlite3` an; sie muss in Backups aufgenommen werden.

Die Kurse verlinken nicht zurück auf die Startseite; der Umschalter in der Kopfzeile wechselt weiterhin nur zwischen EKG und SONO.

Ein weiteres Fachgebiet bekommt einen eigenen Ordner mit `index.html` (Vorlage: `sono/index.html`, `data-application` anpassen), einen Eintrag in `domains`/`homes` in `assets/js/platform.js`, seine Skriptliste in `assets/js/bootstrap.js`, den Ordnernamen in `server.py` und `scripts/build.cjs` sowie eine Karte in `assets/js/academy/app.js`.

## SPA und Assets

Hashrouten werden nicht an den Webserver gesendet. `server.py` liefert für bekannte Pfadrouten zusätzlich die `index.html` des jeweiligen Kursordners aus, auch bei HEAD. Der Bootstrap kanonisiert diese zu unabhängig bookmarkbaren Hashlinks. Fehlende Assets und unbekannte API-Endpunkte bleiben 404; sie dürfen nicht in HTML umgewandelt werden. Assets werden bei HTTP(S) ab `/assets/` geladen; die Anwendung ist für Hosting am Domain-Root ausgelegt.

Bei rein statischem Nginx-Hosting ist zusätzlich nötig:

```nginx
root /OPERATOR_SUPPLIED/resqly/dist;
location /assets/ { try_files $uri =404; }
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
}
location /ekg/ { try_files $uri $uri/ /ekg/index.html; }
location /sono/ { try_files $uri $uri/ /sono/index.html; }
location / { try_files $uri $uri/ =404; }
```

Für die empfohlene vollständige Weiterleitung an `server.py` ist dieser alternative Block nicht erforderlich. HTML und JS sollten gemeinsam aktualisiert und nicht mit langfristig unveränderbaren Cache-Headern ausgeliefert werden. Der bestehende Python-Server sendet weiterhin `no-cache`.

Titel, Beschreibung und Favicon stehen je Anwendung statisch in der jeweiligen `index.html`; SONO ergänzt den Titel pro Route im Browser.

## Medienhosting

Sieben lokal gespeicherte klinische MP4-Clips (H.264, CC BY 2.0), JPEG-Vorschaubilder und fünf SVG-Lehrdiagramme liegen unter `/assets/media/sono/` und werden vom Build mitkopiert (zusammen rund 7 MB). Videos verwenden `preload="none"`, native Bedienelemente, `playsinline` und Poster; Bilder `loading="lazy"`. Keine externen Einbettungen oder Hotlinks. Lizenz, Attribution, Herkunft und Bearbeitung stehen im [Mediennachweis](media/README.md) und in der Oberfläche.

Die Medien sind bereits vor der medizinischen Fachprüfung abspielbar. Rechte-/Herkunftsprüfungen bleiben aktiv; der Reviewstatus wird angezeigt. Der separate Publikationscheck bleibt für die spätere Freigabe verfügbar.

Für größere Medienbestände empfiehlt sich die statische Auslieferung von `/assets/media/` durch den vorhandenen Proxy mit Range-Requests. Keine kostenpflichtigen Dienste nötig. Der Python-Standardserver ist keine optimierte Streaming-Plattform. Ein CDN oder externes Hosting würde eine bewusste Erweiterung der momentan auf lokale Medien beschränkten Freigabeprüfung erfordern.

## Weitere Domains

`Resqly.domains` in `assets/js/platform.js` anpassen und die Domain-/Switcher-Tests erweitern. Danach DNS, TLS und neuen vHost separat konfigurieren. Unbekannte Hosts zeigen an der Wurzel immer die Academy-Startseite.
