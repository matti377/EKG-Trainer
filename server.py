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

# I, O, 0 und 1 fehlen — die werden beim Abtippen zu oft verwechselt.
CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
CODE_LEN = 4
MAX_PLAYERS = 60
MAX_QUESTIONS = 40
LOBBY_TTL = 4 * 3600          # verwaiste Lobbys nach vier Stunden vergessen

lobbies = {}
lock = threading.Lock()


def rand(n, pool=string.ascii_letters + string.digits):
    return ''.join(random.choice(pool) for _ in range(n))


class Lobby:
    def __init__(self, seconds):
        self.code = None
        self.token = rand(20)
        self.players = {}          # pid -> {'name', 'score', 'joined'}
        self.order = []            # Beitrittsreihenfolge
        self.questions = []
        self.answers = {}          # index -> pid -> {'i', 'ms', 'pts'}
        self.phase = 'lobby'       # lobby | frage | aufloesung | ende
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
        self.players[pid] = {'name': name[:24], 'score': 0, 'joined': time.time()}
        self.order.append(pid)
        self.bump()
        return pid

    def award(self, ok, ms):
        """Kahoot-Prinzip: richtig zählt, schnell zählt zusätzlich."""
        if not ok:
            return 0
        limit = self.seconds * 1000.0
        frac = max(0.0, min(1.0, 1.0 - (ms / limit)))
        return int(round(500 + 500 * frac))

    def tick(self):
        """Phasenwechsel, die nur von der Zeit abhängen."""
        if self.phase != 'frage':
            return
        done = self.answers.get(self.index, {})
        everyone = self.players and all(p in done for p in self.players)
        if everyone or (time.time() - self.q_start) >= self.seconds + 0.4:
            self.phase = 'aufloesung'
            self.bump()

    def standings(self):
        rows = [{'id': p, 'name': self.players[p]['name'], 'score': self.players[p]['score']}
                for p in self.players]
        rows.sort(key=lambda r: (-r['score'], r['name'].lower()))
        for i, r in enumerate(rows):
            r['rank'] = i + 1
        return rows

    def snapshot(self, pid=None):
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
        if self.phase in ('frage', 'aufloesung') and 0 <= self.index < len(self.questions):
            q = self.questions[self.index]
            out['question'] = {'rhythm': q['rhythm'], 'options': q['options'],
                               'leadSet': q.get('leadSet'),
                               'speed': q.get('speed', 25)}
            out['remaining'] = max(0.0, self.seconds - (time.time() - self.q_start))
            mine = self.answers.get(self.index, {}).get(pid)
            if mine:
                out['myAnswer'] = mine['i']
            if self.phase == 'aufloesung':
                out['question']['correct'] = q['correct']
                out['question']['name'] = q['name']
                out['question']['desc'] = q.get('desc', '')
                out['standings'] = self.standings()
                if mine:
                    out['myPoints'] = mine['pts']
                    out['myCorrect'] = mine['i'] == q['correct']
        if self.phase == 'ende':
            out['standings'] = self.standings()
        if pid and pid in self.players:
            out['me'] = {'id': pid, 'name': self.players[pid]['name'],
                         'score': self.players[pid]['score']}
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
            if path in ('/api/start', '/api/next', '/api/close'):
                if data.get('token') != lob.token:
                    return self.fail('Nur der Host darf das', 403)

            if path == '/api/start':
                qs = data.get('questions') or []
                if not qs:
                    return self.fail('Keine Fragen erhalten')
                lob.questions = qs[:MAX_QUESTIONS]
                lob.answers = {}
                for p in lob.players:
                    lob.players[p]['score'] = 0
                lob.index = 0
                lob.phase = 'frage'
                lob.q_start = time.time()
                lob.bump()
                return self.send_json({'ok': True})

            if path == '/api/next':
                if lob.index + 1 >= len(lob.questions):
                    lob.phase = 'ende'
                else:
                    lob.index += 1
                    lob.phase = 'frage'
                    lob.q_start = time.time()
                lob.bump()
                return self.send_json({'ok': True})

            if path == '/api/answer':
                pid = data.get('player')
                if pid not in lob.players:
                    return self.fail('Unbekannter Spieler', 403)
                lob.tick()
                if lob.phase != 'frage':
                    return self.fail('Zu spät', 409)
                slot = lob.answers.setdefault(lob.index, {})
                if pid in slot:
                    return self.fail('Schon geantwortet', 409)
                i = int(data.get('index', -1))
                ms = max(0.0, (time.time() - lob.q_start) * 1000.0)
                ok = i == lob.questions[lob.index]['correct']
                pts = lob.award(ok, ms)
                slot[pid] = {'i': i, 'ms': ms, 'pts': pts}
                lob.players[pid]['score'] += pts
                lob.bump()
                return self.send_json({'ok': True, 'points': pts, 'correct': ok})

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
    print('  Für alle im WLAN:   http://%s:%d/' % (ip, PORT))
    print('')
    print('  Zum Beenden: Strg+C')
    print('')
    try:
        Server(('0.0.0.0', PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        print('\n  Server beendet.\n')
