#!/usr/bin/env python3
"""
server.py — Liefert die Seite aus und verwaltet die Challenge-Lobbys.

Start:
    python3 server.py

Nur Standardbibliothek — nichts zu installieren. Der Server hält die Lobbys
im Arbeitsspeicher; ein Neustart löscht sie. Das ist Absicht: Es gibt nichts
zu pflegen und keine Daten, die liegen bleiben.

Die Fragen selbst denkt sich der Server nicht aus. Sie kommen beim Start vom
Gerät des Hosts (das kennt die Befund-Bibliothek bereits) und werden hier nur
verteilt — so kann der Inhalt der Website nicht auseinanderlaufen.
"""

import http.server
import json
import os
import random
import socket
import string
import threading
import time
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get('PORT', '8000'))
# Hinter einem Reverse-Proxy (nginx) HOST=127.0.0.1 setzen — dann ist der
# Port nicht mehr direkt von außen erreichbar.
HOST = os.environ.get('HOST', '0.0.0.0')

# I, O, 0 und 1 fehlen — die werden beim Abtippen zu oft verwechselt.
CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
CODE_LEN = 4
MAX_PLAYERS = 60
MAX_QUESTIONS = 40
LOBBY_TTL = 4 * 3600          # verwaiste Lobbys nach vier Stunden vergessen
GRACE = 0.4                   # Nachlauf, damit knappe Antworten noch zählen
AWAY = 5.0                    # wer so lange nicht nachfragt, wird nicht mehr abgewartet

lobbies = {}
lock = threading.Lock()


def rand(n, pool=string.ascii_letters + string.digits):
    return ''.join(random.choice(pool) for _ in range(n))


class Lobby:
    def __init__(self, seconds):
        self.code = None
        self.token = rand(20)
        self.players = {}          # pid -> {'name', 'joined', 'seen'}
        self.order = []            # Beitrittsreihenfolge
        self.questions = []
        self.answers = {}          # index -> pid -> {'i'}
        self.phase = 'lobby'       # lobby | frage | ende
        self.index = -1
        self.q_start = 0.0
        self.seconds = seconds
        self.rev = 1               # Änderungszähler fürs Pollen
        self.touched = time.time()

    # -------------------------------------------------------------- Helfer

    def bump(self):
        self.rev += 1
        self.touched = time.time()

    def add_player(self, name):
        pid = rand(12)
        self.players[pid] = {'name': name[:24], 'joined': time.time(), 'seen': time.time()}
        self.order.append(pid)
        self.bump()
        return pid

    def tick(self):
        """Weiter zum nächsten EKG, sobald alle geantwortet haben oder die
        Zeit abgelaufen ist. Punkte und Zwischenstand gibt es nicht."""
        while self.phase == 'frage':
            done = self.answers.get(self.index, {})
            # Wer die Seite neu geladen oder geschlossen hat, bliebe sonst als
            # Geist in der Lobby — und auf dessen Antwort würde ewig gewartet.
            now = time.time()
            active = [p for p in self.players if now - self.players[p]['seen'] < AWAY]
            everyone = active and all(p in done for p in active)
            if not everyone and (time.time() - self.q_start) < self.seconds + GRACE:
                return
            if self.index + 1 >= len(self.questions):
                self.phase = 'ende'
            else:
                self.index += 1
                self.q_start = time.time()
            self.bump()

    def review(self, pid):
        """Auflösung am Ende: pro EKG die eigene Antwort und wie die Gruppe lag."""
        rows = []
        for n, q in enumerate(self.questions):
            given = self.answers.get(n, {})
            mine = given.get(pid)
            rows.append({
                'name': q['name'],
                'mine': q['options'][mine['i']] if mine else None,
                'ok': bool(mine) and mine['i'] == q['correct'],
                'right': sum(1 for a in given.values() if a['i'] == q['correct']),
                'answered': len(given),
            })
        return rows

    def snapshot(self, pid=None):
        if pid in self.players:
            self.players[pid]['seen'] = time.time()
        self.tick()
        out = {
            'code': self.code,
            'phase': self.phase,
            'rev': self.rev,
            'index': self.index,
            'total': len(self.questions),
            'seconds': self.seconds,
            'players': [{'id': p, 'name': self.players[p]['name']} for p in self.order
                        if p in self.players],
            'answered': len(self.answers.get(self.index, {})),
        }
        if self.phase == 'frage' and 0 <= self.index < len(self.questions):
            q = self.questions[self.index]
            out['question'] = {'rhythm': q['rhythm'], 'options': q['options'],
                               'leadSet': q.get('leadSet'),
                               'speed': q.get('speed', 25)}
            out['remaining'] = max(0.0, self.seconds - (time.time() - self.q_start))
            mine = self.answers.get(self.index, {}).get(pid)
            if mine:
                out['myAnswer'] = mine['i']
        if self.phase == 'ende':
            out['review'] = self.review(pid)
        if pid and pid in self.players:
            out['me'] = {'id': pid, 'name': self.players[pid]['name']}
        return out


def sweep():
    """Alte Lobbys aufräumen, damit der Speicher nicht unbegrenzt wächst."""
    now = time.time()
    for code in [c for c, l in lobbies.items() if now - l.touched > LOBBY_TTL]:
        lobbies.pop(code, None)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=HERE, **kw)

    # Standard-Logzeilen unterdrücken, sonst rauscht das Pollen die Konsole zu.
    def log_message(self, fmt, *args):
        pass

    # ------------------------------------------------------------- Antwort

    def send_json(self, obj, status=200):
        body = json.dumps(obj).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

    def fail(self, msg, status=400):
        self.send_json({'error': msg}, status)

    def read_json(self):
        try:
            n = int(self.headers.get('Content-Length', '0'))
            return json.loads(self.rfile.read(n) or b'{}')
        except Exception:
            return {}

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    # ------------------------------------------------------------- Routing

    def do_GET(self):
        path = urlparse(self.path).path
        if path.startswith('/api/'):
            return self.api_get(path, parse_qs(urlparse(self.path).query))
        # Statische Dateien nicht zwischenspeichern — sonst sehen die Geräte
        # im Kurs unterschiedliche Stände.
        return super().do_GET()

    def end_headers(self):
        if not self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

    def api_get(self, path, q):
        if path == '/api/ping':
            return self.send_json({'ok': True, 'lobbies': len(lobbies)})

        if path == '/api/state':
            code = (q.get('code', [''])[0] or '').upper()
            pid = q.get('player', [''])[0]
            with lock:
                lob = lobbies.get(code)
                if not lob:
                    return self.fail('Lobby nicht gefunden', 404)
                return self.send_json(lob.snapshot(pid))

        return self.fail('Unbekannter Endpunkt', 404)

    def do_POST(self):
        path = urlparse(self.path).path
        if not path.startswith('/api/'):
            return self.fail('Unbekannter Endpunkt', 404)
        data = self.read_json()

        with lock:
            sweep()

            if path == '/api/lobby':
                name = (data.get('name') or '').strip() or 'Host'
                secs = max(5, min(120, int(data.get('seconds') or 20)))
                lob = Lobby(secs)
                lob.code = self.new_code()
                lobbies[lob.code] = lob
                pid = lob.add_player(name)
                return self.send_json({'code': lob.code, 'token': lob.token,
                                       'player': pid})

            code = (data.get('code') or '').upper()
            lob = lobbies.get(code)
            if not lob:
                return self.fail('Lobby nicht gefunden', 404)

            if path == '/api/join':
                if lob.phase != 'lobby':
                    return self.fail('Die Challenge läuft bereits', 409)
                if len(lob.players) >= MAX_PLAYERS:
                    return self.fail('Lobby ist voll', 409)
                name = (data.get('name') or '').strip()
                if not name:
                    return self.fail('Bitte einen Namen angeben')
                taken = {lob.players[p]['name'].lower() for p in lob.players}
                if name.lower() in taken:
                    return self.fail('Diesen Namen gibt es schon')
                return self.send_json({'player': lob.add_player(name)})

            if path == '/api/leave':
                pid = data.get('player')
                if pid in lob.players:
                    lob.players.pop(pid, None)
                    lob.bump()
                return self.send_json({'ok': True})

            # Ab hier nur der Host
            if path in ('/api/start', '/api/close'):
                if data.get('token') != lob.token:
                    return self.fail('Nur der Host darf das', 403)

            if path == '/api/start':
                qs = data.get('questions') or []
                if not qs:
                    return self.fail('Keine Fragen erhalten')
                lob.questions = qs[:MAX_QUESTIONS]
                lob.answers = {}
                lob.index = 0
                lob.phase = 'frage'
                lob.q_start = time.time()
                lob.bump()
                return self.send_json({'ok': True})

            if path == '/api/answer':
                pid = data.get('player')
                if pid not in lob.players:
                    return self.fail('Unbekannter Spieler', 403)
                lob.players[pid]['seen'] = time.time()
                lob.tick()
                # Die Frage kann inzwischen weitergesprungen sein — dann darf
                # die Antwort nicht beim nächsten EKG landen.
                if lob.phase != 'frage' or data.get('q') != lob.index:
                    return self.fail('Zu spät', 409)
                slot = lob.answers.setdefault(lob.index, {})
                if pid in slot:
                    return self.fail('Schon geantwortet', 409)
                try:
                    i = int(data.get('index', -1))
                except (TypeError, ValueError):
                    i = -1
                if not 0 <= i < len(lob.questions[lob.index]['options']):
                    return self.fail('Ungültige Antwort')
                slot[pid] = {'i': i}
                lob.bump()
                lob.tick()          # waren das alle, geht es sofort weiter
                return self.send_json({'ok': True})

            if path == '/api/close':
                lobbies.pop(code, None)
                return self.send_json({'ok': True})

        return self.fail('Unbekannter Endpunkt', 404)

    def new_code(self):
        while True:
            c = ''.join(random.choice(CODE_CHARS) for _ in range(CODE_LEN))
            if c not in lobbies:
                return c


def lan_ip():
    """Die Adresse, unter der andere Geräte im selben Netz den Server sehen."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))     # verbindet nicht wirklich
        return s.getsockname()[0]
    except Exception:
        return '127.0.0.1'
    finally:
        s.close()


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == '__main__':
    ip = lan_ip()
    print('')
    print('  EKG lernen — Server läuft')
    print('  ' + '-' * 42)
    print('  Auf diesem Gerät:   http://localhost:%d/' % PORT)
    if HOST not in ('127.0.0.1', 'localhost'):
        print('  Für alle im WLAN:   http://%s:%d/' % (ip, PORT))
    print('')
    print('  Zum Beenden: Strg+C')
    print('')
    try:
        Server((HOST, PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        print('\n  Server beendet.\n')
