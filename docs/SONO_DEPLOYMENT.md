# EKG + SONO aus demselben Repository

Es wurden keine DNS-, Proxy-, Zertifikats-, Credential- oder Produktionsänderungen ausgeführt. `deploy.sh` ist unverändert. Der vorhandene Python-Server und dieselben statischen Dateien bedienen beide Domains. Browser-JavaScript entscheidet anhand des Hostnamens.

## Lokal starten

```sh
python3 server.py
```

Standardport: 8000; alternativ `PORT=8001 HOST=127.0.0.1 python3 server.py`.

- EKG: `http://localhost:8000/#/pfad`
- SONO: `http://localhost:8000/?app=sono#/home`
- Direkter SONO-Link: `http://localhost:8000/sono/lektion/lunge-06`
- Optional: `http://sono.localhost:8000/` bei entsprechender lokaler Namensauflösung.

Der Umschalter nutzt auf Entwicklungs- und Vorschauhosts `?app=ekg` / `?app=sono`. Auf den beiden Produktionshosts verweist er immer auf die jeweilige HTTPS-Domain. Produktionshosts haben Vorrang vor Query-Overrides. Andere Hosts starten standardmäßig EKG. Eigene Hostnamen werden zentral in `assets/js/platform.js` ergänzt.

Die bisherigen EKG-Hashrouten bleiben erhalten: `pfad`, `lektion/:id`, `trainer`, `bibliothek`, `labor`, `ableitungen`, `challenge`. Direkte Dateinutzung von `index.html` bleibt für Selbststudium möglich; für zuverlässige Speicherung und die Challenge den Server verwenden. SONO-Dateivorschau: `index.html?app=sono#/home`.

## Prüfungen und optionaler Build

Die Anwendungen brauchen keine Node-Laufzeit, Frameworks, API-Schlüssel oder zusätzlichen Backends. Node dient ausschließlich der Entwicklung und optionalen Paketierung.

```sh
npm ci
npm test
npm run validate:medical
python3 -m unittest discover -s tests -p 'test_*.py'
npx playwright install chromium
npm run test:browser
npm run build
```

Der Build prüft JS-Syntax und Medizinschema und kopiert `index.html`, `assets/` und das bestehende EKG-PDF nach `dist/`. Der vorhandene `deploy.sh` bedient weiterhin das Repository direkt. `dist/` ist für optionale statische Auslieferung vorgesehen; der Python-Challenge-Server muss dabei separat weiterlaufen.

`npm run validate:publication` ist die strengere redaktionelle Prüfung. Sie schlägt derzeit **absichtlich fehl**, weil alle medizinischen Einheiten auf Fachprüfung warten. Der normale technische Build ist kein medizinischer Publikationsnachweis. Dieses Gate wird nicht automatisch durch `deploy.sh` erzwungen; vor öffentlicher medizinischer Freigabe muss der Betreiber es ausdrücklich in seinen Freigabeprozess aufnehmen.

## Produktionsdomain ergänzen

1. Beim DNS-Anbieter `sono.resqly.lu` als CNAME auf `ekg.resqly.lu` anlegen, sofern die Infrastruktur dies erlaubt; alternativ einen A-Record auf dieselbe Server-IP. AAAA nur bei tatsächlich funktionierendem IPv6-Upstream veröffentlichen. EKG-Records unverändert lassen.
2. Für `sono.resqly.lu` ein gültiges TLS-Zertifikat bereitstellen (separates Zertifikat oder vorhandenes SAN-Zertifikat mit diesem Namen). Beide Anwendungen über HTTPS ausliefern.
3. Einen zusätzlichen Virtual Host nach `nginx.sono.conf.example` einrichten. Zertifikatspfade und den tatsächlich konfigurierten Python-Port einsetzen. Der neue Host zeigt auf denselben laufenden `server.py`-Dienst wie EKG. Die vorhandene EKG-Konfiguration bleibt bestehen.
4. Nach manueller Konfiguration `sudo nginx -t` ausführen und bei Erfolg kontrolliert neu laden. Das Beispiel ist wegen seiner Platzhalter **nicht unverändert aktivierbar**.
5. Nach dem autorisierten Repository-Deployment beide Hostnamen, Titel, Produktwechsel und die bestehende Challenge prüfen. Ein Wechsel der Domain erhält wegen Browser-Origin-Isolation nicht denselben localStorage; das ist beabsichtigt.

## SPA und Assets

Hashrouten werden nicht an den Webserver gesendet. `server.py` liefert für bekannte Pfadrouten zusätzlich `index.html` aus, auch bei HEAD. Der Bootstrap kanonisiert diese zu unabhängig bookmarkbaren Hashlinks. Fehlende Assets und unbekannte API-Endpunkte bleiben 404; sie dürfen nicht in HTML umgewandelt werden. Assets werden bei HTTP(S) ab `/assets/` geladen; die Anwendung ist für Hosting am Domain-Root ausgelegt.

Bei rein statischem Nginx-Hosting ist zusätzlich nötig:

```nginx
root /OPERATOR_SUPPLIED/resqly/dist;
location /assets/ { try_files $uri =404; }
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
}
location / { try_files $uri $uri/ /index.html; }
```

Für die empfohlene vollständige Weiterleitung an `server.py` ist dieser alternative Block nicht erforderlich. HTML und JS sollten gemeinsam aktualisiert und nicht mit langfristig unveränderbaren Cache-Headern ausgeliefert werden. Der bestehende Python-Server sendet weiterhin `no-cache`.

Titel, Beschreibung und Favicon werden im Browser je Anwendung gesetzt. Suchmaschinen/Linkvorschauen ohne JavaScript sehen zunächst die gemeinsame HTML-Metadatenbasis. Falls eigenständige Social-Preview-Metadaten benötigt werden, als Folgearbeit hostabhängige HTML-Auslieferung ergänzen.

## Medienhosting

Aktuell werden keine klinischen Medien ausgeliefert oder extern eingebettet. Keine Quellenclips wurden heruntergeladen oder weiterverbreitet. Freigegebene Medien gehören künftig unter `/assets/media/`; Dateinamen ohne personenbezogene Angaben. MP4 (H.264) oder WebM sowie JPEG/PNG sind vorgesehen. Videos verwenden `preload="metadata"`, native Bedienelemente und `playsinline`; Bilder `loading="lazy"`.

Für größere Medienbestände empfiehlt sich die statische Auslieferung von `/assets/media/` durch den vorhandenen Proxy mit Range-Requests. Keine kostenpflichtigen Dienste nötig. Der Python-Standardserver ist keine optimierte Streaming-Plattform. Ein CDN oder externes Hosting würde eine bewusste Erweiterung der momentan auf lokale Medien beschränkten Freigabeprüfung erfordern.

## Weitere Domains

`Resqly.domains` in `assets/js/platform.js` anpassen und die Domain-/Switcher-Tests erweitern. Danach DNS, TLS und neuen vHost separat konfigurieren. Eine neue Domain allein darf die EKG-Standardauswahl auf fremden Vorschauhosts nicht ändern.
