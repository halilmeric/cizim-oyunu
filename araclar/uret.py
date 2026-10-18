"""Oyunun resimlerini üretir: hacimli çizimler, eksik eşyalar ve 3B odalar.

Kullanım: python3 araclar/uret.py
Girdi: cizimler/<ad>.png (kızın temizlenmiş çizimleri).
Çıktı:
  cizimler/hacimli/<karakter>.png  ışık verilmiş karakterler (parcala.py bunları böler)
  cizimler/esya/<ad>.png           taşınan eşyalar
  cizimler/mekan/<ad>.png          oda, mutfak ve banyo arka planları
"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
from hacim import hacim  # noqa: E402

KOK = os.path.join(os.path.dirname(__file__), "..")
CIZ = os.path.join(KOK, "cizimler")
SS = 2  # süper örnekleme: her şey 2 kat büyük çizilir, sonra küçülür
KALEM = (70, 50, 40, 255)


def yol(*p):
    return os.path.join(CIZ, *p)


def koy(alt, ust, x, y):
    """ust resmini alt resmin (x, y) noktasına saydamlıkla yapıştırır. Taşan kısım kesilir."""
    x, y = int(round(x)), int(round(y))
    sx, sy = max(0, -x), max(0, -y)
    w = min(ust.width - sx, alt.width - max(0, x))
    h = min(ust.height - sy, alt.height - max(0, y))
    if w > 0 and h > 0:
        alt.alpha_composite(ust.crop((sx, sy, sx + w, sy + h)), (max(0, x), max(0, y)))


# --- Tuval: düz şekiller çizer. Her şekil kendi ışığını alır, böylece kabartma gibi durur. ---
class Tuval:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.im = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))

    def _katman(self, kutu, ciz, guc, kure):
        x0, y0, x1, y1 = [int(v * SS) for v in kutu]
        bos = 8 * SS
        L = Image.new("RGBA", (x1 - x0 + 2 * bos, y1 - y0 + 2 * bos), (0, 0, 0, 0))
        ciz(ImageDraw.Draw(L), lambda x, y: (x * SS - x0 + bos, y * SS - y0 + bos))
        if guc:
            L = hacim(L, kure, guc)
        koy(self.im, L, x0 - bos, y0 - bos)

    def kutu(self, x0, y0, x1, y1, renk, r=8, cizgi=3, guc=1.0):
        def c(d, p):
            d.rounded_rectangle([*p(x0, y0), *p(x1, y1)], r * SS, fill=renk, outline=KALEM if cizgi else None, width=cizgi * SS)
        self._katman((x0, y0, x1, y1), c, guc, False)

    def elips(self, x0, y0, x1, y1, renk, cizgi=3, guc=1.0, kure=False):
        def c(d, p):
            d.ellipse([*p(x0, y0), *p(x1, y1)], fill=renk, outline=KALEM if cizgi else None, width=cizgi * SS)
        self._katman((x0, y0, x1, y1), c, guc, kure)

    def cokgen(self, noktalar, renk, cizgi=3, guc=1.0):
        xs, ys = [p[0] for p in noktalar], [p[1] for p in noktalar]

        def c(d, p):
            pts = [p(x, y) for x, y in noktalar]
            d.polygon(pts, fill=renk)
            if cizgi:
                d.line(pts + [pts[0]], fill=KALEM, width=cizgi * SS, joint="curve")
        self._katman((min(xs), min(ys), max(xs), max(ys)), c, guc, False)

    def cizgi(self, noktalar, renk=KALEM, k=3):
        d = ImageDraw.Draw(self.im)
        d.line([(x * SS, y * SS) for x, y in noktalar], fill=renk, width=int(k * SS), joint="curve")

    def resim(self, im, x, y, w=None, h=None):
        """Bir çizimi (zaten hacimli) tuvale koyar. w veya h verilirse oran korunur."""
        if w and not h:
            h = im.height * w / im.width
        if h and not w:
            w = im.width * h / im.height
        im = im.resize((int(w * SS), int(h * SS)), Image.LANCZOS)
        koy(self.im, im, x * SS, y * SS)

    def bitir(self):
        return self.im.resize((self.w, self.h), Image.LANCZOS)


def kirp(im):
    return im.crop(im.getbbox())


# --- Eşyalar ---
def esya_elma():
    t = Tuval(120, 130)
    t.elips(8, 22, 112, 124, (215, 35, 45, 255), kure=True)
    t.cizgi([(60, 30), (62, 8)], (110, 70, 40, 255), 6)
    t.elips(64, 4, 100, 22, (90, 170, 60, 255))
    return kirp(t.bitir())


def esya_sut():
    t = Tuval(120, 200)
    t.cokgen([(15, 55), (60, 15), (105, 55)], (245, 245, 250, 255))
    t.kutu(15, 55, 105, 195, (250, 250, 252, 255), r=6)
    t.kutu(15, 95, 105, 150, (80, 150, 230, 255), r=2, cizgi=0, guc=0.6)
    t.elips(38, 104, 82, 142, (255, 255, 255, 255), cizgi=2, guc=0.6)
    t.kutu(50, 4, 70, 18, (80, 150, 230, 255), r=3)
    return kirp(t.bitir())


def esya_kupa():
    t = Tuval(150, 130)
    t.elips(92, 35, 140, 95, (225, 70, 80, 255))
    t.elips(102, 47, 128, 83, (0, 0, 0, 0), cizgi=0, guc=0)
    t.kutu(10, 15, 112, 125, (225, 70, 80, 255), r=14)
    for x, y in [(35, 50), (75, 45), (55, 85), (90, 95), (30, 100)]:
        t.elips(x - 7, y - 7, x + 7, y + 7, (255, 255, 255, 255), cizgi=0, guc=0.5)
    t.elips(14, 10, 108, 30, (120, 40, 40, 255), cizgi=3, guc=0.4)
    im = t.bitir()
    # kulp deliği
    d = ImageDraw.Draw(im)
    d.ellipse([104, 50, 124, 80], fill=(0, 0, 0, 0))
    return kirp(im)


def esya_ordek():
    t = Tuval(170, 150)
    t.elips(10, 60, 150, 145, (255, 210, 50, 255), kure=True)
    t.elips(80, 8, 150, 78, (255, 210, 50, 255), kure=True)
    t.cokgen([(140, 38), (168, 46), (140, 56)], (250, 130, 40, 255))
    t.elips(118, 26, 130, 38, (30, 30, 30, 255), cizgi=0, guc=0.6)
    t.cokgen([(30, 80), (75, 95), (35, 120)], (245, 185, 40, 255), guc=0.8)
    return kirp(t.bitir())


def esya_sabun():
    t = Tuval(150, 90)
    t.kutu(8, 25, 142, 85, (250, 160, 200, 255), r=24)
    for x, y, r in [(40, 18, 12), (66, 10, 8), (95, 16, 14)]:
        t.elips(x - r, y - r, x + r, y + r, (225, 240, 255, 230), cizgi=2, kure=True)
    return kirp(t.bitir())


def esya_sampuan():
    t = Tuval(100, 220)
    t.kutu(30, 8, 70, 40, (240, 240, 245, 255), r=6)
    t.kutu(10, 38, 90, 215, (120, 200, 190, 255), r=22)
    t.kutu(22, 90, 78, 160, (255, 255, 255, 255), r=8, cizgi=2, guc=0.5)
    t.elips(38, 108, 62, 140, (250, 150, 180, 255), cizgi=2, guc=0.6)
    return kirp(t.bitir())


def esya_muz():
    t = Tuval(200, 120)
    t.cokgen([(15, 40), (60, 85), (120, 95), (175, 60), (190, 30), (170, 45), (120, 70), (65, 62), (25, 30)], (250, 215, 60, 255))
    t.kutu(8, 26, 26, 44, (110, 80, 40, 255), r=4, cizgi=2)
    t.kutu(182, 22, 196, 38, (90, 70, 40, 255), r=3, cizgi=2)
    return kirp(t.bitir())


def esya_havuc():
    t = Tuval(90, 220)
    for x, a in [(30, -1), (45, 0), (60, 1)]:
        t.cokgen([(45, 60), (x + 15 * a - 8, 8), (x + 15 * a + 8, 8)], (90, 170, 60, 255), cizgi=2)
    t.cokgen([(18, 55), (72, 55), (50, 212), (40, 212)], (245, 140, 40, 255))
    for y in (90, 125, 160):
        t.cizgi([(30, y), (42, y + 4)], (180, 90, 30, 255), 2)
    return kirp(t.bitir())


def esya_ekmek():
    t = Tuval(220, 130)
    t.kutu(10, 40, 210, 120, (215, 150, 80, 255), r=40)
    t.elips(10, 10, 210, 90, (230, 170, 95, 255))
    for x in (60, 105, 150):
        t.cizgi([(x - 12, 35), (x + 12, 60)], (170, 105, 50, 255), 4)
    return kirp(t.bitir())


def esya_peynir():
    t = Tuval(180, 130)
    t.cokgen([(10, 60), (170, 20), (170, 120), (10, 120)], (255, 215, 90, 255))
    for x, y, r in [(50, 95, 12), (110, 75, 9), (140, 100, 14), (85, 108, 7)]:
        t.elips(x - r, y - r, x + r, y + r, (230, 180, 60, 255), cizgi=2, guc=0.6)
    return kirp(t.bitir())


def esya_cilek():
    t = Tuval(120, 140)
    t.cokgen([(15, 40), (105, 40), (95, 90), (60, 135), (25, 90)], (225, 40, 60, 255))
    for x, y in [(40, 60), (65, 55), (85, 70), (50, 90), (72, 95), (60, 115)]:
        t.elips(x - 3, y - 4, x + 3, y + 4, (255, 230, 120, 255), cizgi=0, guc=0)
    t.cokgen([(20, 42), (40, 15), (60, 35), (80, 15), (100, 42)], (80, 170, 60, 255), cizgi=2)
    return kirp(t.bitir())


def esya_karpuz():
    t = Tuval(220, 130)
    t.cokgen([(10, 15), (210, 15), (110, 125)], (60, 150, 60, 255))
    t.cokgen([(24, 24), (196, 24), (110, 110)], (245, 80, 90, 255), cizgi=0)
    for x, y in [(70, 40), (110, 45), (150, 40), (95, 70), (125, 70), (110, 92)]:
        t.elips(x - 4, y - 6, x + 4, y + 6, (40, 30, 30, 255), cizgi=0, guc=0.5)
    return kirp(t.bitir())


def esya_kurabiye():
    t = Tuval(140, 140)
    t.elips(10, 10, 130, 130, (215, 160, 90, 255))
    for x, y in [(45, 45), (85, 40), (95, 85), (50, 90), (70, 65)]:
        t.elips(x - 8, y - 8, x + 8, y + 8, (90, 55, 35, 255), cizgi=0, guc=0.6)
    return kirp(t.bitir())


def esya_dondurma():
    t = Tuval(120, 220)
    t.cokgen([(18, 95), (102, 95), (60, 215)], (220, 165, 90, 255))
    t.cizgi([(35, 115), (75, 175)], (180, 120, 60, 255), 3)
    t.cizgi([(85, 115), (48, 175)], (180, 120, 60, 255), 3)
    t.elips(10, 50, 110, 110, (250, 170, 200, 255), kure=True)
    t.elips(22, 8, 98, 78, (255, 240, 210, 255), kure=True)
    t.elips(52, 0, 70, 18, (230, 40, 60, 255), cizgi=2, kure=True)
    return kirp(t.bitir())


def esya_portakal():
    t = Tuval(130, 135)
    t.elips(8, 15, 122, 128, (250, 150, 30, 255), kure=True)
    t.elips(56, 4, 92, 22, (90, 170, 60, 255))
    return kirp(t.bitir())


def esya_portakal_suyu():
    t = Tuval(110, 200)
    t.kutu(10, 30, 100, 195, (250, 160, 40, 255), r=10)
    t.kutu(10, 30, 100, 60, (255, 255, 255, 255), r=6, cizgi=2, guc=0.4)
    t.elips(30, 100, 80, 150, (255, 200, 60, 255), cizgi=2, kure=True)
    t.kutu(40, 4, 70, 32, (60, 150, 60, 255), r=4)
    return kirp(t.bitir())


def esya_pasta():
    t = Tuval(140, 170)
    t.cokgen([(20, 85), (120, 85), (105, 165), (35, 165)], (120, 180, 230, 255))
    for x in (45, 70, 95):
        t.cizgi([(x, 92), (x - 3, 160)], (90, 150, 200, 255), 3)
    t.elips(10, 30, 130, 100, (255, 230, 240, 255))
    t.elips(30, 10, 110, 70, (255, 230, 240, 255), cizgi=0)
    t.elips(58, 0, 82, 24, (220, 30, 50, 255), cizgi=2, kure=True)
    return kirp(t.bitir())


def esya_araba():
    t = Tuval(230, 140)
    t.kutu(60, 20, 170, 75, (80, 160, 230, 255), r=18)
    t.kutu(75, 30, 112, 62, (200, 235, 250, 255), r=6, cizgi=2, guc=0.4)
    t.kutu(118, 30, 155, 62, (200, 235, 250, 255), r=6, cizgi=2, guc=0.4)
    t.kutu(10, 60, 220, 110, (230, 60, 60, 255), r=20)
    t.elips(200, 70, 216, 86, (255, 230, 120, 255), cizgi=2, kure=True)
    for x in (55, 175):
        t.elips(x - 28, 85, x + 28, 138, (50, 50, 60, 255), kure=True)
        t.elips(x - 11, 101, x + 11, 122, (200, 200, 210, 255), cizgi=2)
    return kirp(t.bitir())


def esya_kup():
    t = Tuval(150, 150)
    t.cokgen([(20, 40), (60, 10), (140, 10), (100, 40)], (255, 220, 90, 255))
    t.cokgen([(100, 40), (140, 10), (140, 105), (100, 140)], (60, 150, 220, 255))
    t.kutu(10, 40, 100, 140, (235, 80, 80, 255), r=6)
    t.elips(38, 70, 72, 110, (255, 255, 255, 255), cizgi=2, guc=0.5)
    return kirp(t.bitir())


def esya_boya():
    t = Tuval(220, 70)
    t.kutu(10, 15, 170, 55, (140, 90, 220, 255), r=8)
    t.kutu(30, 15, 60, 55, (255, 255, 255, 255), r=2, cizgi=2, guc=0.4)
    t.cokgen([(170, 15), (210, 35), (170, 55)], (240, 205, 160, 255))
    t.cokgen([(198, 29), (212, 35), (198, 41)], (140, 90, 220, 255), cizgi=0)
    return kirp(t.bitir())


def esya_dis_fircasi():
    t = Tuval(240, 90)
    t.kutu(10, 45, 190, 70, (90, 190, 240, 255), r=12)
    t.kutu(180, 40, 232, 66, (250, 250, 250, 255), r=4)
    for x in range(186, 230, 9):
        t.kutu(x, 12, x + 6, 42, (240, 245, 255, 255), r=3, cizgi=2, guc=0.3)
    return kirp(t.bitir())


def esya_dis_macunu():
    t = Tuval(230, 100)
    t.cokgen([(20, 20), (190, 30), (190, 75), (20, 85)], (255, 255, 255, 255))
    t.kutu(40, 35, 160, 70, (90, 200, 120, 255), r=10, cizgi=2, guc=0.5)
    t.kutu(188, 38, 222, 68, (240, 80, 80, 255), r=6)
    t.cizgi([(20, 18), (20, 88)], KALEM, 6)
    return kirp(t.bitir())


def esya_havlu():
    t = Tuval(180, 120)
    t.kutu(10, 60, 170, 115, (250, 210, 90, 255), r=12)
    t.kutu(15, 30, 165, 75, (250, 210, 90, 255), r=12)
    t.kutu(20, 5, 160, 45, (250, 210, 90, 255), r=12)
    for y in (20, 52, 88):
        t.kutu(20, y, 160, y + 6, (255, 255, 255, 255), r=2, cizgi=0, guc=0.3)
    return kirp(t.bitir())


# --- Odalar: perspektif geometri ---
W, H = 1280, 720
UFUK = (640, 120)          # kaçış noktası
ARKA = (200, 1080, 20, 440)  # arka duvar: sol, sağ, üst, alt
KUVET_SU = 326               # banyodaki küvetin su çizgisi (y)


def zemin_x(y, kenar):
    """Zemin çizgisinin y yüksekliğindeki x değeri. kenar: -1 sol, +1 sağ."""
    t = (y - UFUK[1]) / (ARKA[3] - UFUK[1])
    a = ARKA[0] if kenar < 0 else ARKA[1]
    return UFUK[0] + (a - UFUK[0]) * t


def yan_duvar(x, oran, sag=False):
    """Yan duvarda x noktasında, zeminden oran kadar yukarıdaki y değeri."""
    xs = W - x if sag else x
    k = (UFUK[0] - xs) / (UFUK[0] - ARKA[0])
    alt = UFUK[1] + (ARKA[3] - UFUK[1]) * k
    ust = UFUK[1] - (UFUK[1] - ARKA[2]) * k
    return alt - (alt - ust) * oran


def yan_dortgen(x0, x1, o0, o1, sag=False):
    """Yan duvar üstünde bir dörtgen (sol üst, sağ üst, sağ alt, sol alt)."""
    return [(x0, yan_duvar(x0, o1, sag)), (x1, yan_duvar(x1, o1, sag)),
            (x1, yan_duvar(x1, o0, sag)), (x0, yan_duvar(x0, o0, sag))]


def maske(noktalar):
    m = Image.new("L", (W * SS, H * SS), 0)
    ImageDraw.Draw(m).polygon([(x * SS, y * SS) for x, y in noktalar], fill=255)
    return np.array(m) > 0


def doldur(a, mk, ust, alt, y0, y1):
    """Maskeli alanı dikey renk geçişiyle boyar."""
    ys = (np.arange(H * SS) / SS - y0) / max(1, y1 - y0)
    ys = np.clip(ys, 0, 1)[:, None, None]
    renk = np.array(ust)[None, None, :] * (1 - ys) + np.array(alt)[None, None, :] * ys
    a[mk, :3] = np.broadcast_to(renk, a.shape[:2] + (3,))[mk]
    a[mk, 3] = 255


def cerceveye_ger(im, dortgen):
    """Düz bir resmi duvardaki dörtgene perspektifle oturtur."""
    import cv2
    src = np.float32([[0, 0], [im.width, 0], [im.width, im.height], [0, im.height]])
    dst = np.float32([[x * SS, y * SS] for x, y in dortgen])
    M = cv2.getPerspectiveTransform(src, dst)
    out = cv2.warpPerspective(np.array(im.convert("RGBA")), M, (W * SS, H * SS), flags=cv2.INTER_LINEAR)
    return Image.fromarray(out, "RGBA")


def golge_birak(t, cx, cy, rx, ry, guc=110):
    """Mobilyanın zemine düşen yumuşak gölgesi."""
    g = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse([(cx - rx) * SS, (cy - ry) * SS, (cx + rx) * SS, (cy + ry) * SS], fill=(30, 20, 20, guc))
    t.im.alpha_composite(g.filter(ImageFilter.GaussianBlur(10 * SS)))


def oda_iskeleti(t, duvar, duvar2, zemin_ciz):
    """Tavan, arka duvar, yan duvarlar, zemin ve süpürgelik."""
    a = np.zeros((H * SS, W * SS, 4), np.float32)
    sol_ust = (0, yan_duvar(0, 1))
    sag_ust = (W, yan_duvar(0, 1))
    sol_alt = (0, yan_duvar(0, 0))
    sag_alt = (W, yan_duvar(0, 0))
    doldur(a, maske([(0, 0), (W, 0), sag_ust, (ARKA[1], ARKA[2]), (ARKA[0], ARKA[2]), sol_ust]), (250, 250, 245), (235, 232, 225), 0, 20)
    doldur(a, maske([(ARKA[0], ARKA[2]), (ARKA[1], ARKA[2]), (ARKA[1], ARKA[3]), (ARKA[0], ARKA[3])]), *duvar, ARKA[2], ARKA[3])
    sol = maske([sol_ust, (ARKA[0], ARKA[2]), (ARKA[0], ARKA[3]), sol_alt])
    sag = maske([(ARKA[1], ARKA[2]), sag_ust, sag_alt, (ARKA[1], ARKA[3])])
    doldur(a, sol | sag, *duvar2, 0, 640)
    t.im = Image.fromarray(a.astype(np.uint8), "RGBA")
    zemin_ciz(t)
    # Süpürgelik: arka duvar ve yan duvarlar boyunca
    t.cokgen([(ARKA[0], ARKA[3] - 16), (ARKA[1], ARKA[3] - 16), (ARKA[1], ARKA[3]), (ARKA[0], ARKA[3])], (250, 250, 250, 255), cizgi=2, guc=0.5)
    t.cokgen(yan_dortgen(0, ARKA[0], 0, 0.045), (250, 250, 250, 255), cizgi=2, guc=0)
    t.cokgen(yan_dortgen(ARKA[1], W, 0, 0.045, True), (250, 250, 250, 255), cizgi=2, guc=0)
    # Köşe çizgileri
    for p, q in [((ARKA[0], ARKA[2]), (ARKA[0], ARKA[3])), ((ARKA[1], ARKA[2]), (ARKA[1], ARKA[3])),
                 ((ARKA[0], ARKA[3]), (zemin_x(H, -1), H)), ((ARKA[1], ARKA[3]), (zemin_x(H, 1), H)),
                 ((ARKA[0], ARKA[2]), sol_ust), ((ARKA[1], ARKA[2]), sag_ust), ((ARKA[0], ARKA[2]), (ARKA[1], ARKA[2]))]:
        t.cizgi([p, q], (90, 70, 60, 120), 2)


def zemin_satirlari(n):
    """Eşit derinlikte zemin satırlarının y değerleri (arkadan öne)."""
    z_arka, z_on = 1.0, (ARKA[3] - UFUK[1]) / (H + 40 - UFUK[1])
    return [UFUK[1] + (ARKA[3] - UFUK[1]) / (z_arka - (z_arka - z_on) * i / n) for i in range(n + 1)]


def parke(t, renk):
    satir = zemin_satirlari(9)
    sutun = 16
    rng = np.random.default_rng(3)
    for i in range(len(satir) - 1):
        y0, y1 = satir[i], satir[i + 1]
        kay = (i % 2) * 0.5
        for j in range(-1, sutun + 1):
            u0, u1 = (j + kay) / sutun, (j + kay + 1) / sutun
            u0, u1 = max(0, u0), min(1, u1)
            if u1 <= u0:
                continue
            f = 0.88 + rng.random() * 0.2
            r = tuple(int(c * f) for c in renk) + (255,)
            pts = [(zemin_x(y0, -1) + (zemin_x(y0, 1) - zemin_x(y0, -1)) * u, y0) for u in (u0, u1)]
            pts += [(zemin_x(y1, -1) + (zemin_x(y1, 1) - zemin_x(y1, -1)) * u, y1) for u in (u1, u0)]
            ImageDraw.Draw(t.im).polygon([(x * SS, y * SS) for x, y in pts], fill=r, outline=(120, 80, 50, 255), width=SS)


def karo(t, r1, r2, sutun=12, satir_sayi=7):
    satir = zemin_satirlari(satir_sayi)
    for i in range(len(satir) - 1):
        y0, y1 = satir[i], satir[i + 1]
        for j in range(sutun):
            u0, u1 = j / sutun, (j + 1) / sutun
            pts = [(zemin_x(y0, -1) + (zemin_x(y0, 1) - zemin_x(y0, -1)) * u, y0) for u in (u0, u1)]
            pts += [(zemin_x(y1, -1) + (zemin_x(y1, 1) - zemin_x(y1, -1)) * u, y1) for u in (u1, u0)]
            ImageDraw.Draw(t.im).polygon([(x * SS, y * SS) for x, y in pts], fill=(r1 if (i + j) % 2 else r2) + (255,),
                                         outline=(150, 150, 150, 255), width=SS)


def zemin_isigi(t):
    """Zemin arkaya doğru kararır, ön taraf aydınlık. Kenarlarda hafif gölge (vinyet)."""
    a = np.array(t.im).astype(np.float32)
    yy, xx = np.mgrid[0:H * SS, 0:W * SS] / SS
    k = 1 - 0.18 * np.clip((ARKA[3] + 60 - yy) / 400, 0, 1) * (yy > ARKA[3])
    v = 1 - 0.22 * np.clip(((xx - 640) / 700) ** 2 + ((yy - 380) / 520) ** 2 - 0.35, 0, 1)
    a[..., :3] *= (k * v)[..., None]
    t.im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")


def kapi(t, sag):
    """Yan duvara perspektifle kapı."""
    k = Tuval(160, 320)
    k.kutu(4, 4, 156, 318, (245, 240, 230, 255), r=4)
    k.kutu(18, 18, 142, 316, (170, 110, 70, 255), r=4)
    k.kutu(34, 36, 126, 150, (190, 130, 85, 255), r=6, cizgi=2)
    k.kutu(34, 176, 126, 296, (190, 130, 85, 255), r=6, cizgi=2)
    k.elips(108, 154, 128, 174, (250, 205, 80, 255), cizgi=2, kure=True)
    im = k.bitir()
    if sag:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
        q = yan_dortgen(W - 150, W - 40, 0, 0.6, True)
    else:
        q = yan_dortgen(40, 150, 0, 0.6)
    t.im.alpha_composite(cerceveye_ger(im, q))


def pencere(t, x0, y0, x1, y1):
    t.kutu(x0, y0, x1, y1, (250, 250, 250, 255), r=6)
    t.kutu(x0 + 12, y0 + 12, x1 - 12, y1 - 12, (150, 210, 245, 255), r=2, guc=0.3)
    t.elips(x0 + 25, y0 + 25, x0 + 70, y0 + 70, (255, 220, 80, 255), cizgi=0, kure=True)
    cx = (x0 + x1) / 2
    t.elips(cx - 10, y0 + 60, cx + 45, y0 + 90, (255, 255, 255, 255), cizgi=0, guc=0.5)
    t.elips(cx + 10, y0 + 48, cx + 50, y0 + 82, (255, 255, 255, 255), cizgi=0, guc=0.5)
    t.kutu(cx - 5, y0 + 10, cx + 5, y1 - 10, (250, 250, 250, 255), r=2, cizgi=2, guc=0.5)
    t.kutu(x0 + 10, (y0 + y1) / 2 - 5, x1 - 10, (y0 + y1) / 2 + 5, (250, 250, 250, 255), r=2, cizgi=2, guc=0.5)
    t.kutu(x0 - 12, y1 - 6, x1 + 12, y1 + 10, (245, 245, 245, 255), r=4)


def duvar_deseni(t, renk, adim=46):
    d = ImageDraw.Draw(t.im)
    for i, y in enumerate(range(ARKA[2] + 30, ARKA[3] - 30, adim)):
        for x in range(ARKA[0] + 25 + (i % 2) * adim // 2, ARKA[1] - 10, adim):
            d.ellipse([(x - 4) * SS, (y - 4) * SS, (x + 4) * SS, (y + 4) * SS], fill=renk)


def oda(ciz):
    t = Tuval(W, H)
    oda_iskeleti(t, ((255, 230, 200), (246, 208, 176)), ((236, 205, 175), (225, 190, 160)), lambda t: parke(t, (212, 156, 104)))
    duvar_deseni(t, (240, 195, 160, 255))
    zemin_isigi(t)
    kapi(t, sag=True)
    pencere(t, 222, 90, 372, 290)
    # Sol duvarda çerçeveli ev resmi
    c = Tuval(300, 300)
    c.kutu(4, 4, 296, 296, (200, 140, 80, 255), r=6)
    c.kutu(24, 24, 276, 276, (255, 252, 240, 255), r=2, guc=0.3)
    c.resim(ciz["ev"], 40, 34, h=232)
    t.im.alpha_composite(cerceveye_ger(c.bitir(), yan_dortgen(45, 165, 0.42, 0.82)))
    # Şömine ve üstünde gökkuşağı
    golge_birak(t, 590, 452, 175, 14)
    t.kutu(428, 252, 752, 272, (185, 120, 75, 255), r=4)
    t.resim(ciz["somine"], 440, 270, w=300)
    t.resim(ciz["gokkusagi"], 490, 105, w=200)
    # TV dolabı ve TV
    golge_birak(t, 885, 458, 150, 12)
    t.kutu(770, 370, 1000, 450, (175, 120, 80, 255), r=8)
    t.kutu(782, 382, 882, 440, (195, 140, 95, 255), r=6, cizgi=2)
    t.kutu(888, 382, 988, 440, (195, 140, 95, 255), r=6, cizgi=2)
    for x in (870, 900):
        t.elips(x - 6, 405, x + 6, 417, (250, 205, 80, 255), cizgi=2, kure=True)
    t.kutu(785, 448, 800, 462, (120, 80, 50, 255), r=3, cizgi=2)
    t.kutu(970, 448, 985, 462, (120, 80, 50, 255), r=3, cizgi=2)
    t.resim(ciz["tv"], 790, 180, w=195)
    # Saksı ve bitki (sol arka köşe)
    golge_birak(t, 250, 470, 50, 10)
    for x, y, r in [(225, 330, 34), (270, 315, 38), (248, 285, 36), (210, 300, 28), (290, 350, 28)]:
        t.elips(x - r, y - r, x + r, y + r, (90, 175, 80, 255), kure=True)
    t.cokgen([(210, 375), (290, 375), (278, 470), (222, 470)], (220, 110, 70, 255))
    t.kutu(204, 365, 296, 385, (235, 130, 85, 255), r=5)
    # Halı
    h = Tuval(W, H)
    for i, (r, renk) in enumerate([(1.0, (120, 170, 230)), (0.8, (255, 230, 120)), (0.6, (240, 130, 160)), (0.38, (150, 210, 170))]):
        h.elips(640 - 360 * r, 610 - 80 * r, 640 + 360 * r, 610 + 80 * r, renk + (255,), cizgi=2 if i else 3, guc=0.25)
    t.im.alpha_composite(h.im)
    return t.bitir()


def mutfak(ciz):
    t = Tuval(W, H)
    oda_iskeleti(t, ((215, 240, 210), (198, 228, 192)), ((195, 222, 190), (180, 210, 175)),
                 lambda t: karo(t, (250, 248, 240), (235, 120, 100)))
    zemin_isigi(t)
    kapi(t, sag=False)
    kapi(t, sag=True)
    # Tezgah arkası fayans
    d = ImageDraw.Draw(t.im)
    for y in range(240, 340, 20):
        for x in range(400 + (y // 20 % 2) * 15, 905, 30):
            d.rectangle([x * SS, y * SS, (x + 28) * SS, (y + 18) * SS], fill=(250, 252, 250, 255), outline=(200, 215, 200, 255), width=SS)
    pencere(t, 590, 80, 760, 230)
    # Üst dolaplar
    for x0, x1 in [(410, 575), (775, 900)]:
        t.kutu(x0, 90, x1, 200, (250, 245, 230, 255), r=6)
        t.kutu(x0 + 10, 100, (x0 + x1) / 2 - 3, 190, (240, 232, 210, 255), r=4, cizgi=2)
        t.kutu((x0 + x1) / 2 + 3, 100, x1 - 10, 190, (240, 232, 210, 255), r=4, cizgi=2)
    # Buzdolabı
    golge_birak(t, 305, 458, 95, 12)
    t.kutu(225, 140, 385, 458, (235, 245, 252, 255), r=14)
    t.kutu(235, 152, 375, 250, (225, 238, 248, 255), r=8, cizgi=2)
    t.kutu(235, 258, 375, 446, (225, 238, 248, 255), r=8, cizgi=2)
    t.kutu(355, 170, 365, 230, (170, 175, 185, 255), r=4, cizgi=2)
    t.kutu(355, 275, 365, 345, (170, 175, 185, 255), r=4, cizgi=2)
    t.elips(270, 290, 300, 318, (240, 80, 110, 255), cizgi=2, kure=True)
    # Tezgah: dolaplar, eviye, ocak
    golge_birak(t, 655, 460, 270, 12)
    t.kutu(400, 352, 910, 456, (120, 170, 210, 255), r=6)
    for x in range(410, 900, 100):
        t.kutu(x, 362, x + 92, 446, (140, 190, 225, 255), r=6, cizgi=2)
        t.elips(x + 40, 372, x + 52, 384, (250, 205, 80, 255), cizgi=2, kure=True)
    t.kutu(390, 334, 920, 356, (235, 235, 240, 255), r=5)
    t.elips(610, 337, 720, 352, (170, 180, 190, 255), cizgi=2, guc=0.4)
    t.cizgi([(665, 336), (665, 305), (690, 305), (690, 316)], (150, 155, 165, 255), 7)
    for x in (785, 850):
        t.elips(x - 26, 337, x + 26, 350, (60, 60, 70, 255), cizgi=2, guc=0.6)
    # Raf, kavanozlar, saat
    t.kutu(935, 255, 1065, 270, (185, 125, 80, 255), r=3)
    for x, renk in [(955, (240, 180, 80)), (1000, (230, 90, 90)), (1043, (140, 200, 120))]:
        t.kutu(x - 16, 205, x + 16, 256, renk + (255,), r=8)
        t.kutu(x - 18, 198, x + 18, 210, (250, 250, 250, 255), r=3, cizgi=2)
    t.elips(955, 90, 1045, 180, (255, 255, 255, 255), kure=True)
    t.cizgi([(1000, 135), (1000, 108)], KALEM, 4)
    t.cizgi([(1000, 135), (1020, 142)], KALEM, 4)
    return t.bitir()


def banyo(ciz):
    t = Tuval(W, H)
    oda_iskeleti(t, ((215, 235, 252), (195, 220, 245)), ((195, 218, 240), (180, 205, 232)),
                 lambda t: karo(t, (250, 252, 255), (190, 215, 240), 14, 8))
    # Duvar fayansı (alt yarı)
    d = ImageDraw.Draw(t.im)
    for y in range(250, 425, 25):
        for i in range(35):
            x = ARKA[0] + i * (ARKA[1] - ARKA[0]) / 35
            d.rectangle([x * SS, y * SS, (x + 24.1) * SS, (y + 24) * SS], fill=(170, 210, 240, 255), outline=(240, 248, 255, 255), width=SS)
    zemin_isigi(t)
    kapi(t, sag=False)
    # Ayna ve lavabo
    t.elips(305, 95, 445, 250, (230, 200, 120, 255), kure=False)
    t.elips(318, 108, 432, 237, (205, 232, 248, 255), cizgi=2, guc=0.4)
    t.cizgi([(340, 160), (370, 130)], (255, 255, 255, 220), 6)
    t.cizgi([(352, 180), (395, 137)], (255, 255, 255, 180), 4)
    golge_birak(t, 375, 458, 60, 10)
    t.cokgen([(355, 330), (395, 330), (405, 458), (345, 458)], (250, 250, 252, 255))
    t.elips(300, 280, 450, 345, (252, 252, 255, 255))
    t.elips(320, 286, 430, 310, (190, 215, 235, 255), cizgi=2, guc=0.4)
    t.cizgi([(375, 286), (375, 266), (395, 266)], (160, 165, 175, 255), 7)
    # Havlu askısı
    t.kutu(490, 215, 600, 225, (200, 200, 210, 255), r=4, cizgi=2)
    t.kutu(505, 220, 585, 330, (250, 150, 180, 255), r=8)
    t.kutu(505, 300, 585, 312, (255, 255, 255, 255), r=2, cizgi=0, guc=0.5)
    # Küvet
    golge_birak(t, 840, 462, 200, 14)
    for x in (680, 1000):
        t.elips(x - 14, 440, x + 14, 466, (240, 200, 90, 255), cizgi=2, kure=True)
    t.kutu(640, 320, 1040, 455, (252, 252, 255, 255), r=60)
    t.elips(650, 305, 1030, 345, (255, 255, 255, 255))
    t.elips(668, 312, 1012, 338, (130, 195, 240, 255), cizgi=2, guc=0.4)
    for x, y, r in [(720, 312, 22), (760, 304, 16), (900, 308, 24), (950, 302, 14), (820, 310, 18)]:
        t.elips(x - r, y - r, x + r, y + r, (240, 248, 255, 255), cizgi=2, kure=True)
    t.cizgi([(1015, 300), (1015, 250), (985, 250), (985, 268)], (160, 165, 175, 255), 8)
    return t.bitir()


def buzdolabi_acik():
    """Açık buzdolabı: mutfak resminin üstüne konur. Kapaklar sola açılır, içi aydınlıktır."""
    t = Tuval(W, H)
    # Gövde ve aydınlık iç
    t.kutu(225, 140, 385, 458, (235, 245, 252, 255), r=14)
    t.kutu(236, 151, 374, 447, (250, 253, 255, 255), r=8, cizgi=2, guc=0.3)
    isik = Image.new("RGBA", t.im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(isik)
    for y in range(152, 446, 2):
        a = int(70 * (1 - (y - 152) / 294))
        d.line([(237 * SS, y * SS), (373 * SS, y * SS)], fill=(255, 250, 215, a), width=2 * SS)
    t.im.alpha_composite(isik)
    # Lamba
    t.elips(290, 156, 320, 168, (255, 245, 180, 255), cizgi=2, guc=0.5)
    # Raflar (cam) ve sebzelik
    for y in (215, 285, 355):
        t.kutu(238, y, 372, y + 7, (200, 230, 245, 255), r=2, cizgi=2, guc=0.4)
    t.kutu(244, 375, 366, 440, (215, 240, 225, 255), r=8, cizgi=2, guc=0.5)
    for x, renk in [(270, (240, 140, 60)), (300, (90, 170, 70)), (335, (230, 60, 60))]:
        t.elips(x - 14, 386, x + 14, 412, renk + (255,), cizgi=2, kure=True)
    # Kapaklar: menteşe solda, kapaklar sola açılır. İç yüzlerinde raf ve şişeler var.
    for y0, y1 in [(140, 252), (256, 458)]:
        t.cokgen([(226, y0 + 6), (150, y0 - 14), (150, y1 + 14), (226, y1 - 6)], (232, 242, 250, 255))
        t.cokgen([(220, y0 + 16), (160, y0 + 2), (160, y1 + 2), (220, y1 - 14)], (215, 230, 242, 255), cizgi=2, guc=0.4)
        for i in range(1 if y1 - y0 < 150 else 2):
            yr = y0 + 70 + i * 90
            t.cokgen([(220, yr - 2), (160, yr - 12), (160, yr + 6), (220, yr + 12)], (190, 220, 240, 255), cizgi=2, guc=0.3)
            for j, renk in enumerate([(120, 190, 90), (250, 200, 80), (230, 90, 120)]):
                x = 170 + j * 17
                t.kutu(x, yr - 36 + j * 2, x + 12, yr - 2 + j * 2, renk + (255,), r=4, cizgi=2, guc=0.6)
    return t.bitir()


def kuvet_on():
    """Küvetin su çizgisinin altında kalan ön yüzü ve köpükler. Küvetteki karakterin gövdesini örter."""
    t = Tuval(W, H)
    for x in (680, 1000):
        t.elips(x - 14, 440, x + 14, 466, (240, 200, 90, 255), cizgi=2, kure=True)
    t.kutu(640, 320, 1040, 455, (252, 252, 255, 255), r=60)
    t.elips(650, 305, 1030, 345, (255, 255, 255, 255))
    t.elips(668, 312, 1012, 338, (130, 195, 240, 255), cizgi=2, guc=0.4)
    ImageDraw.Draw(t.im).rectangle([0, 0, W * SS, KUVET_SU * SS], fill=(0, 0, 0, 0))
    rng = np.random.default_rng(7)
    for x in range(690, 1000, 22):
        r = int(rng.integers(9, 17))
        y = KUVET_SU + int(rng.integers(-4, 4))
        t.elips(x - r, y - r, x + r, y + r, (245, 250, 255, 255), cizgi=2, kure=True)
    return t.bitir()


def main():
    os.makedirs(yol("hacimli"), exist_ok=True)
    os.makedirs(yol("esya"), exist_ok=True)
    os.makedirs(yol("mekan"), exist_ok=True)
    ciz = {}
    for ad in ["kedi", "kiz", "ayi", "top", "telefon", "kitap", "tahin", "somine", "tv", "gokkusagi", "ev"]:
        ciz[ad] = hacim(Image.open(yol(ad + ".png")), kure=(ad == "top"))
    for ad in ["kedi", "kiz", "ayi"]:
        ciz[ad].save(yol("hacimli", ad + ".png"))
    for ad in ["top", "telefon", "kitap", "tahin"]:
        im = ciz[ad]
        im.thumbnail((240, 240), Image.LANCZOS)
        im.save(yol("esya", ad + ".png"))
    for ad, f in [("elma", esya_elma), ("sut", esya_sut), ("kupa", esya_kupa), ("ordek", esya_ordek),
                  ("sabun", esya_sabun), ("sampuan", esya_sampuan), ("muz", esya_muz), ("havuc", esya_havuc),
                  ("ekmek", esya_ekmek), ("peynir", esya_peynir), ("cilek", esya_cilek), ("karpuz", esya_karpuz),
                  ("kurabiye", esya_kurabiye), ("dondurma", esya_dondurma), ("portakal", esya_portakal),
                  ("portakal-suyu", esya_portakal_suyu), ("pasta", esya_pasta), ("araba", esya_araba), ("kup", esya_kup),
                  ("boya", esya_boya), ("dis-fircasi", esya_dis_fircasi), ("dis-macunu", esya_dis_macunu),
                  ("havlu", esya_havlu)]:
        f().save(yol("esya", ad + ".png"))
    for ad, f in [("oda", oda), ("mutfak", mutfak), ("banyo", banyo)]:
        f(ciz).convert("RGB").save(yol("mekan", ad + ".jpg"), quality=88)
    acik = buzdolabi_acik()
    acik.crop(acik.getbbox()).save(yol("mekan", "buzdolabi-acik.png"))
    print("buzdolabi-acik kutusu:", acik.getbbox())
    on = kuvet_on()
    on.crop(on.getbbox()).save(yol("mekan", "kuvet-on.png"))
    print("kuvet-on kutusu:", on.getbbox())
    for ad in ["kedi", "kiz"]:
        subprocess.run([sys.executable, os.path.join(KOK, "araclar", "parcala.py"),
                        f"cizimler/hacimli/{ad}.png", f"cizimler/{ad}"], cwd=KOK, check=True, stdout=subprocess.DEVNULL)
    print("tamam")


if __name__ == "__main__":
    main()
