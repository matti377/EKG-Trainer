"""ekgdraw.py — EKG-Kurven für den PDF-Satz.

Portierung des Wellenmodells aus assets/js/ekg.js: Jede Zacke ist eine
Gauß-Funktion mit Lage (s), Breite (s) und Amplitude (mV). Dadurch sehen
die Abbildungen im Skript exakt so aus wie auf der Website.
"""

import math
from reportlab.platypus import Flowable
from reportlab.lib.colors import HexColor

# ----------------------------------------------------------------- Farben

INK        = HexColor('#14243f')
MUTED      = HexColor('#64769a')
BRAND      = HexColor('#12b3a6')
BRAND_DK   = HexColor('#0a8d83')
VIOLET     = HexColor('#7c5cff')
VIOLET_DK  = HexColor('#5c3fd4')
VIOLET_LT  = HexColor('#eee9ff')
HEART      = HexColor('#ff4d6d')
HEART_DK   = HexColor('#d92e50')
GOLD       = HexColor('#ffb703')
GOLD_DK    = HexColor('#a86f00')
GOLD_LT    = HexColor('#fff8e6')
OK         = HexColor('#35c759')
OK_DK      = HexColor('#23a344')
OK_LT      = HexColor('#e4f9e9')
BAD        = HexColor('#ff4b4b')
BAD_DK     = HexColor('#c62828')
BAD_LT     = HexColor('#ffe9e9')
LINE       = HexColor('#dfe7f3')
LINE_SOFT  = HexColor('#eef3f9')
PAPER_BG   = HexColor('#fff6f6')
PAPER_FINE = HexColor('#f6d4d8')
PAPER_BOLD = HexColor('#e9959f')
TRACE      = HexColor('#16202e')
DARK_BG    = HexColor('#0f2338')
SCOPE_BG   = HexColor('#08131f')
SCOPE_GRID = HexColor('#17364a')
SCOPE_TRC  = HexColor('#3ef58f')

# ------------------------------------------------------------ Wellenmodell

V_DEFAULT = {
    'q':  {'c': 0.010, 'w': 0.008, 'a': -0.08},
    'r':  {'c': 0.030, 'w': 0.012, 'a':  1.10},
    's':  {'c': 0.057, 'w': 0.011, 'a': -0.25},
    'r2': {'c': 0.075, 'w': 0.013, 'a':  0.00},
    'd':  {'c': 0.005, 'w': 0.020, 'a':  0.00},
    't':  {'c': 0.245, 'w': 0.060, 'a':  0.30},
    'u':  {'c': 0.400, 'w': 0.045, 'a':  0.00},
}
ST_DEFAULT, STEND_DEFAULT = 0.0, 0.185
P_DEFAULT = {'w': 0.026, 'a': 0.14}


def tpl(over=None):
    """Baut ein Kammer-Template aus den Vorgaben plus Abweichungen."""
    t = {k: dict(v) for k, v in V_DEFAULT.items()}
    t['st'] = ST_DEFAULT
    t['stEnd'] = STEND_DEFAULT
    t['spike'] = 0.0
    for k, v in (over or {}).items():
        if isinstance(v, dict) and k in t and isinstance(t[k], dict):
            t[k].update(v)
        else:
            t[k] = v
    return t


def _bump(dt, comp):
    if not comp or not comp.get('a'):
        return 0.0
    z = (dt - comp['c']) / comp['w']
    if z < -4 or z > 4:
        return 0.0
    return comp['a'] * math.exp(-z * z)


def _smoothstep(x, a, b):
    if x <= a:
        return 0.0
    if x >= b:
        return 1.0
    t = (x - a) / (b - a)
    return t * t * (3 - 2 * t)


def eval_v(t, dt):
    """QRST-Komplex ab dt = 0 (QRS-Beginn)."""
    if dt < -0.06 or dt > 0.75:
        return 0.0
    v = (_bump(dt, t['q']) + _bump(dt, t['r']) + _bump(dt, t['s'])
         + _bump(dt, t['r2']) + _bump(dt, t['d'])
         + _bump(dt, t['t']) + _bump(dt, t['u']))
    if t.get('st'):
        on = _smoothstep(dt, t['stEnd'] - 0.09, t['stEnd'] - 0.03)
        off = 1 - _smoothstep(dt, t['t']['c'] + t['t']['w'],
                              t['t']['c'] + t['t']['w'] * 2.4)
        v += t['st'] * on * off
    if t.get('spike'):
        z = (dt + 0.012) / 0.0022
        if -4 < z < 4:
            v += t['spike'] * math.exp(-z * z)
    return v


def eval_p(pt, dt):
    if dt < -0.12 or dt > 0.12:
        return 0.0
    return _bump(dt, {'c': 0.0, 'w': pt['w'], 'a': pt['a']})


# ------------------------------------------------------- Zeichen-Grundlagen

def _grid(c, x, y, w, h, mmpx, baseline, fine, bold, bg):
    c.saveState()
    c.setFillColor(bg)
    c.rect(x, y, w, h, stroke=0, fill=1)
    c.setLineWidth(0.4)
    c.setStrokeColor(fine)
    gx = 0.0
    while gx < w:
        c.line(x + gx, y, x + gx, y + h)
        gx += mmpx
    gy = baseline % mmpx
    while gy < h:
        c.line(x, y + gy, x + w, y + gy)
        gy += mmpx
    c.setLineWidth(0.7)
    c.setStrokeColor(bold)
    gx = 0.0
    while gx < w:
        c.line(x + gx, y, x + gx, y + h)
        gx += mmpx * 5
    gy = baseline % (mmpx * 5)
    while gy < h:
        c.line(x, y + gy, x + w, y + gy)
        gy += mmpx * 5
    c.restoreState()


def _trace(c, x, y, w, h, valfn, t0, pxpersec, gain, baseline, colour, lw=1.5):
    c.saveState()
    c.setStrokeColor(colour)
    c.setLineWidth(lw)
    c.setLineJoin(1)
    c.setLineCap(1)
    p = c.beginPath()
    steps = int(w)
    for i in range(steps + 1):
        t = t0 + i / pxpersec
        vy = y + baseline + valfn(t) * gain
        vy = max(y + 1, min(y + h - 1, vy))
        if i == 0:
            p.moveTo(x + i, vy)
        else:
            p.lineTo(x + i, vy)
    c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def _rounded_clip(c, x, y, w, h, r):
    p = c.beginPath()
    p.roundRect(x, y, w, h, r)
    c.clipPath(p, stroke=0, fill=0)


# --------------------------------------------------------------- Flowables

class Strip(Flowable):
    """Ein Streifen mit mehreren Schlägen und *festem* Amplitudenmaßstab.

    Nur mit festem Maßstab lassen sich mehrere Ableitungen vergleichen —
    sonst wäre der R-Aufbau von V1 nach V6 nicht ablesbar.
    """

    def __init__(self, width, height, template, pq=0.16, p_amp=0.14,
                 rate=70, seconds=1.9, mv_top=1.8, mv_bot=-1.6,
                 label=None, theme='paper', radius=7):
        Flowable.__init__(self)
        self.width, self.height = width, height
        self.t = template
        self.pq, self.p_amp, self.rate = pq, p_amp, rate
        self.seconds = seconds
        self.mv_top, self.mv_bot = mv_top, mv_bot
        self.label, self.theme, self.radius = label, theme, radius

    def wrap(self, aw, ah):
        return (self.width, self.height)

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        dark = self.theme == 'monitor'
        bg = SCOPE_BG if dark else PAPER_BG
        fine = SCOPE_GRID if dark else PAPER_FINE
        bold = SCOPE_GRID if dark else PAPER_BOLD
        trc = SCOPE_TRC if dark else TRACE

        rr = 60.0 / self.rate
        p_at = -(self.pq - 0.045)
        gain = h / (self.mv_top - self.mv_bot)
        baseline = -self.mv_bot * gain
        pxpersec = w / self.seconds
        mmpx = gain / 10.0
        t0 = p_at - 0.10
        nb = int(math.ceil(self.seconds / rr))

        def val(t):
            v = 0.0
            for k in range(-2, nb + 3):
                b = k * rr
                v += eval_v(self.t, t - b)
                v += eval_p({'w': 0.026, 'a': self.p_amp}, t - b - p_at)
            return v

        c.saveState()
        _rounded_clip(c, 0, 0, w, h, self.radius)
        _grid(c, 0, 0, w, h, mmpx, baseline, fine, bold, bg)
        _trace(c, 0, 0, w, h, val, t0, pxpersec, gain, baseline, trc, 1.5)
        c.restoreState()

        c.setStrokeColor(PAPER_BOLD if not dark else SCOPE_GRID)
        c.setLineWidth(1)
        c.roundRect(0, 0, w, h, self.radius, stroke=1, fill=0)

        if self.label:
            c.setFont('Nunito-Black', 8.5)
            c.setFillColor(INK if not dark else SCOPE_TRC)
            c.drawString(6, h - 13, self.label)


class LeadGrid(Flowable):
    """Sechs Ableitungen im Raster 3x2, alle mit demselben Maßstab."""

    def __init__(self, width, leads, cell_h=76, gap=6, seconds=1.7,
                 mv_top=1.9, mv_bot=-1.75, cols=3):
        Flowable.__init__(self)
        self.width = width
        self.leads = leads
        self.cell_h, self.gap, self.cols = cell_h, gap, cols
        self.seconds = seconds
        self.mv_top, self.mv_bot = mv_top, mv_bot
        rows = int(math.ceil(len(leads) / float(cols)))
        self.height = rows * cell_h + (rows - 1) * gap

    def wrap(self, aw, ah):
        return (self.width, self.height)

    def draw(self):
        cw = (self.width - (self.cols - 1) * self.gap) / float(self.cols)
        for i, (label, over) in enumerate(self.leads):
            col = i % self.cols
            row = i // self.cols
            x = col * (cw + self.gap)
            y = self.height - (row + 1) * self.cell_h - row * self.gap
            s = Strip(cw, self.cell_h, tpl(over), label=label,
                      seconds=self.seconds, mv_top=self.mv_top,
                      mv_bot=self.mv_bot)
            s.canv = self.canv
            self.canv.saveState()
            self.canv.translate(x, y)
            s.draw()
            self.canv.restoreState()


class BeatDetail(Flowable):
    """Ein einzelner Herzschlag, groß, mit farbig markierten Abschnitten."""

    ZONE_COLS = {'p': BRAND, 'pq': GOLD, 'qrs': HEART, 'st': VIOLET, 't': VIOLET}

    def __init__(self, width, height, template=None, pq=0.16, p_amp=0.14,
                 zones=('p', 'qrs', 't'), annotate=True):
        Flowable.__init__(self)
        self.width, self.height = width, height
        self.t = tpl(template or {})
        self.pq, self.p_amp = pq, p_amp
        self.zones, self.annotate = zones, annotate

    def wrap(self, aw, ah):
        return (self.width, self.height)

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        p_at = -(self.pq - 0.045)
        t_from, t_to = p_at - 0.10, 0.50
        beat_span = t_to - t_from

        def val(t):
            return (eval_v(self.t, t)
                    + eval_p({'w': 0.026, 'a': self.p_amp}, t - p_at))

        vmin = vmax = 0.0
        x = t_from
        while x <= t_to:
            v = val(x)
            vmin, vmax = min(vmin, v), max(vmax, v)
            x += 0.002
        vspan = max(0.8, vmax - vmin)

        top_pad = 22 if self.annotate else 8
        usable = h - top_pad - 6
        gain = usable * 0.86 / vspan
        pxpersec = (gain / 10.0) * 25
        if w / pxpersec < beat_span:
            pxpersec = w / beat_span
            gain = (pxpersec / 25.0) * 10
        mmpx = gain / 10.0
        baseline = 6 + (usable * 0.86) - vmax * gain + (usable * 0.07)
        vis = w / pxpersec
        t_left = t_from - (vis - beat_span) / 2.0

        def xof(t):
            return (t - t_left) * pxpersec

        zdef = {
            'p':   (p_at - 0.055, p_at + 0.055, 'P-Welle'),
            'pq':  (p_at + 0.055, -0.002, 'PQ-Strecke'),
            'qrs': (-0.002, 0.082, 'QRS'),
            'st':  (0.082, 0.175, 'ST-Strecke'),
            't':   (0.175, 0.345, 'T-Welle'),
        }

        c.saveState()
        _rounded_clip(c, 0, 0, w, h, 8)
        _grid(c, 0, 0, w, h, mmpx, baseline, PAPER_FINE, PAPER_BOLD, PAPER_BG)

        labels = []
        for key in self.zones:
            if key not in zdef:
                continue
            a, b, name = zdef[key]
            col = self.ZONE_COLS[key]
            x0, x1 = xof(a), xof(b)
            c.setFillColor(col)
            c.setFillAlpha(0.13)
            c.rect(x0, 4, x1 - x0, h - 8, stroke=0, fill=1)
            c.setFillAlpha(1)
            if self.annotate:
                c.setFont('Nunito-Black', 8)
                bw = max(c.stringWidth(name, 'Nunito-Black', 8) + 12, 26)
                labels.append([(x0 + x1) / 2.0, bw, name, col])

        # Schmale Abschnitte wie der QRS-Komplex sind schmaler als ihre
        # Beschriftung. Überlappende Fähnchen deshalb auseinanderschieben.
        labels.sort(key=lambda L: L[0])
        for i in range(1, len(labels)):
            need = labels[i - 1][0] + labels[i - 1][1] / 2 + 3 + labels[i][1] / 2
            if labels[i][0] < need:
                labels[i][0] = need
        if labels and labels[-1][0] + labels[-1][1] / 2 > w - 2:
            shift = labels[-1][0] + labels[-1][1] / 2 - (w - 2)
            for L in labels:
                L[0] -= shift

        for cx, bw, name, col in labels:
            c.setFillColor(col)
            c.roundRect(cx - bw / 2, h - 18, bw, 13, 4, stroke=0, fill=1)
            c.setFillColor(HexColor('#ffffff'))
            c.setFont('Nunito-Black', 8)
            c.drawCentredString(cx, h - 14.5, name)

        _trace(c, 0, 0, w, h, val, t_left, pxpersec, gain, baseline, TRACE, 1.8)
        c.restoreState()
        c.setStrokeColor(PAPER_BOLD)
        c.setLineWidth(1)
        c.roundRect(0, 0, w, h, 8, stroke=1, fill=0)


class Cabrera(Flowable):
    """Cabrera-Kreis der Frontalebene mit den sechs Extremitätenableitungen."""

    LEADS = [('I', 0), ('II', 60), ('III', 120),
             ('aVR', -150), ('aVL', -30), ('aVF', 90)]

    def __init__(self, width, height):
        Flowable.__init__(self)
        self.width, self.height = width, height

    def wrap(self, aw, ah):
        return (self.width, self.height)

    def draw(self):
        c = self.canv
        cx, cy = self.width / 2.0, self.height / 2.0
        R = min(self.width, self.height) / 2.0 - 26

        c.setFillColor(HexColor('#f7fafd'))
        c.setStrokeColor(LINE)
        c.setLineWidth(1)
        c.circle(cx, cy, R, stroke=1, fill=1)

        c.setStrokeColor(HexColor('#cbd7e8'))
        c.setLineWidth(0.8)
        c.line(cx - R, cy, cx + R, cy)
        c.line(cx, cy - R, cx, cy + R)

        c.setFillColor(HexColor('#ffd9e0'))
        c.setStrokeColor(HexColor('#f0a8b8'))
        c.circle(cx, cy, 15, stroke=1, fill=1)

        for name, ang in self.LEADS:
            # Positive Winkel zeigen im EKG nach unten.
            rad = math.radians(ang)
            ex, ey = cx + math.cos(rad) * R, cy - math.sin(rad) * R
            col = VIOLET if name.startswith('aV') else HexColor('#2f8fff')
            c.setStrokeColor(col)
            c.setLineWidth(2.2)
            c.line(cx, cy, ex, ey)
            c.setFillColor(col)
            c.circle(ex, ey, 3.2, stroke=0, fill=1)

            lx = cx + math.cos(rad) * (R + 15)
            ly = cy - math.sin(rad) * (R + 15)
            c.setFont('Nunito-Black', 8.5)
            c.setFillColor(col)
            c.drawCentredString(lx, ly - 2, name)
            c.setFont('Nunito', 6.5)
            c.setFillColor(MUTED)
            deg = ('+' if ang > 0 else '') + str(ang) + '°'
            c.drawCentredString(lx, ly - 10, deg)
