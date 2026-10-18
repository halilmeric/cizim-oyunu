"""Mahalle haritasının resimlerini üretir: zemin, bina önleri, süsler ve simgeler.

Kullanım: python3 araclar/dunya.py
Çıktı:
  cizimler/dunya/zemin.jpg     gökyüzü, tepeler, kaldırım ve yol. 1280 piksel genişlikte, yan yana tekrar eder.
  cizimler/dunya/<sus>.png     ağaç, çalı, çiçek, lamba, bank
  cizimler/dis/<yer>.png       haritadaki her yerin dış görünümü (ev önü, bahçe çiti, dükkan)
  cizimler/simge/<ad>.png      yer simgeleri: tabelalarda ve kapıların üstünde
Her dış görünümün kapısı resmin alt kenarından ölçülür. KAPILAR sözlüğü js/veri.js ile aynı sayıları kullanır.
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
from uret import KALEM, SS, Tuval, kirp, yol  # noqa: E402

YAZI = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
BEYAZ = (255, 255, 255, 255)


def yazi(t, metin, cx, cy, boy, renk=KALEM):
    """Ortalanmış kalın yazı."""
    f = ImageFont.truetype(YAZI, int(boy * SS))
    d = ImageDraw.Draw(t.im)
    d.text((cx * SS, cy * SS), metin, font=f, fill=renk, anchor="mm")


# --- Simgeler: her yerin küçük resmi. (cx, cy) merkez, r yarıçap. ---
def simge(t, ad, cx, cy, r):
    s = r / 40  # simgeler 80 piksellik kutuda tasarlandı

    def P(x, y):
        return (cx + (x - 40) * s, cy + (y - 40) * s)

    def kutu(x0, y0, x1, y1, renk, rr=6, c=3):
        a, b = P(x0, y0), P(x1, y1)
        t.kutu(a[0], a[1], b[0], b[1], renk, r=rr * s, cizgi=max(2, int(c * s)), guc=0.5)

    def elips(x0, y0, x1, y1, renk, c=3, kure=False):
        a, b = P(x0, y0), P(x1, y1)
        t.elips(a[0], a[1], b[0], b[1], renk, cizgi=max(2, int(c * s)), guc=0.5, kure=kure)

    def cokgen(pts, renk, c=3):
        t.cokgen([P(x, y) for x, y in pts], renk, cizgi=max(2, int(c * s)), guc=0.5)

    if ad == "ev":
        kutu(16, 36, 64, 70, (255, 235, 200, 255))
        cokgen([(8, 40), (40, 10), (72, 40)], (90, 150, 230, 255))
        kutu(34, 48, 48, 70, (230, 110, 90, 255), 3)
    elif ad == "harita":
        elips(8, 38, 72, 74, (130, 200, 110, 255))
        kutu(20, 30, 46, 54, (255, 235, 200, 255), 3)
        cokgen([(15, 32), (33, 14), (51, 32)], (230, 90, 80, 255))
        elips(50, 14, 70, 40, (90, 175, 80, 255), kure=True)
        kutu(57, 38, 63, 54, (150, 100, 60, 255), 2, 2)
    elif ad == "bahce":
        for a in range(5):
            x, y = 40 + 15 * math.cos(a * 1.256), 30 + 15 * math.sin(a * 1.256)
            elips(x - 11, y - 11, x + 11, y + 11, (250, 140, 180, 255))
        elips(30, 20, 50, 40, (255, 215, 70, 255))
        kutu(37, 46, 43, 76, (90, 170, 60, 255), 2, 2)
        elips(42, 52, 62, 64, (90, 170, 60, 255))
    elif ad == "park":
        kutu(34, 44, 46, 76, (150, 100, 60, 255), 3)
        elips(10, 6, 70, 56, (90, 175, 80, 255), kure=True)
    elif ad == "oyun":
        cokgen([(10, 74), (52, 18), (64, 18), (64, 74), (56, 74), (56, 30), (22, 74)], (240, 90, 90, 255))
        kutu(52, 14, 70, 22, (255, 210, 70, 255), 3)
        elips(8, 64, 30, 78, (90, 160, 230, 255))
    elif ad == "okul":
        kutu(14, 30, 66, 74, (240, 140, 90, 255))
        cokgen([(10, 32), (40, 8), (70, 32)], (200, 80, 70, 255))
        elips(31, 34, 49, 52, BEYAZ)
        kutu(32, 56, 48, 74, (120, 80, 50, 255), 3)
    elif ad == "kafe":
        kutu(14, 26, 56, 70, (240, 240, 245, 255), 10)
        elips(48, 34, 72, 58, (240, 240, 245, 255))
        elips(54, 40, 66, 52, (255, 255, 255, 0), 2)
        kutu(20, 30, 50, 40, (150, 95, 60, 255), 4, 2)
        for x in (26, 38):
            t.cizgi([P(x, 20), P(x + 4, 12), P(x, 4)], (180, 180, 190, 255), 3 * s)
    elif ad == "market":
        cokgen([(10, 24), (70, 24), (62, 56), (18, 56)], (90, 170, 230, 255))
        for x in (26, 40, 54):
            t.cizgi([P(x, 26), P(x - 2, 54)], (255, 255, 255, 255), 3 * s)
        elips(20, 60, 34, 74, (70, 70, 80, 255))
        elips(48, 60, 62, 74, (70, 70, 80, 255))
        elips(24, 8, 40, 24, (230, 50, 60, 255), kure=True)
        elips(40, 10, 56, 26, (250, 200, 50, 255), kure=True)
    elif ad == "oyuncak":
        elips(8, 22, 26, 40, (180, 120, 70, 255))
        elips(54, 22, 72, 40, (180, 120, 70, 255))
        elips(14, 26, 66, 74, (195, 135, 85, 255))
        elips(28, 46, 52, 68, (240, 210, 170, 255))
        elips(28, 38, 34, 44, KALEM, 0)
        elips(46, 38, 52, 44, KALEM, 0)
        elips(36, 50, 44, 56, KALEM, 0)
    elif ad == "hastane":
        elips(4, 4, 76, 76, BEYAZ)
        kutu(32, 14, 48, 66, (230, 60, 70, 255), 3)
        kutu(14, 32, 66, 48, (230, 60, 70, 255), 3)
    elif ad == "kuafor":
        elips(8, 48, 32, 72, (230, 90, 140, 255))
        elips(48, 48, 72, 72, (230, 90, 140, 255))
        elips(14, 54, 26, 66, (255, 255, 255, 255), 2)
        elips(54, 54, 66, 66, (255, 255, 255, 255), 2)
        cokgen([(26, 52), (52, 6), (58, 10), (34, 56)], (200, 205, 215, 255))
        cokgen([(54, 52), (28, 6), (22, 10), (46, 56)], (220, 225, 235, 255))
    elif ad == "kutuphane":
        cokgen([(6, 20), (40, 28), (40, 72), (6, 64)], (90, 150, 230, 255))
        cokgen([(74, 20), (40, 28), (40, 72), (74, 64)], (240, 110, 110, 255))
        for y in (38, 48):
            t.cizgi([P(12, y - 4), P(34, y + 1)], BEYAZ, 2 * s)
            t.cizgi([P(46, y + 1), P(68, y - 4)], BEYAZ, 2 * s)
    elif ad == "pastane":
        kutu(12, 42, 68, 72, (250, 190, 210, 255), 6)
        kutu(18, 24, 62, 46, (255, 240, 245, 255), 8)
        elips(34, 8, 46, 22, (230, 40, 60, 255), kure=True)
        for x in (24, 40, 56):
            elips(x - 4, 54, x + 4, 62, BEYAZ, 0)


SIMGELER = ["ev", "harita", "bahce", "park", "oyun", "okul", "kafe", "market", "oyuncak", "hastane", "kuafor", "kutuphane", "pastane"]


def simge_resmi(ad):
    """Kapıların üstünde duran yuvarlak simge: beyaz daire içinde."""
    t = Tuval(96, 96)
    t.elips(4, 4, 92, 92, BEYAZ, cizgi=4, guc=0.4)
    simge(t, ad, 48, 48, 32)
    return t.bitir()


# --- Haritanın zemini ---
ZW, ZH = 1280, 720
TABAN = 470      # binaların oturduğu çizgi
KALDIRIM = (470, 545)
YOL = (556, 690)


def zemin():
    a = np.zeros((ZH * SS, ZW * SS, 4), np.float32)
    yy, xx = np.mgrid[0:ZH * SS, 0:ZW * SS] / SS
    # Gökyüzü
    g = np.clip(yy / 380, 0, 1)[..., None]
    a[..., :3] = np.array([120, 195, 245]) * (1 - g) + np.array([205, 236, 255]) * g
    a[..., 3] = 255
    # Uzak ve yakın tepeler: 1280 pikselde tam dalga, yan yana tekrar eder.
    for taban, gen, renk, faz in [(330, 38, (165, 215, 150), 0.0), (380, 26, (135, 200, 120), 1.7)]:
        ust = taban - gen * np.sin(xx * 2 * np.pi / 640 + faz) - gen * 0.5 * np.sin(xx * 2 * np.pi / 320 + faz * 2)
        m = yy > ust
        a[m, :3] = np.array(renk)
    # Ön bahçe çimeni
    m = yy > 420
    a[m, :3] = np.array([150, 210, 120])
    # Kaldırım, bordür, yol ve alt kaldırım
    m = (yy >= KALDIRIM[0]) & (yy < KALDIRIM[1])
    a[m, :3] = np.array([238, 222, 196])
    m = (yy >= KALDIRIM[1]) & (yy < YOL[0])
    a[m, :3] = np.array([205, 205, 212])
    m = (yy >= YOL[0]) & (yy < YOL[1])
    a[m, :3] = np.array([118, 122, 138])
    m = yy >= YOL[1]
    a[m, :3] = np.array([238, 222, 196])
    t = Tuval(ZW, ZH)
    t.im = Image.fromarray(a.astype(np.uint8), "RGBA")
    d = ImageDraw.Draw(t.im)
    # Kaldırım taşları
    for x in range(0, ZW, 64):
        d.line([(x * SS, KALDIRIM[0] * SS), (x * SS, KALDIRIM[1] * SS)], fill=(210, 190, 160, 255), width=2 * SS)
    d.line([(0, 508 * SS), (ZW * SS, 508 * SS)], fill=(210, 190, 160, 255), width=2 * SS)
    d.line([(0, KALDIRIM[0] * SS), (ZW * SS, KALDIRIM[0] * SS)], fill=(120, 170, 100, 255), width=3 * SS)
    d.line([(0, KALDIRIM[1] * SS), (ZW * SS, KALDIRIM[1] * SS)], fill=(170, 170, 180, 255), width=2 * SS)
    # Yol çizgileri
    orta = (YOL[0] + YOL[1]) // 2
    for x in range(20, ZW, 160):
        d.rounded_rectangle([x * SS, (orta - 5) * SS, (x + 80) * SS, (orta + 5) * SS], 4 * SS, fill=(250, 250, 250, 255))
    # Bulutlar
    for x, y, s in [(180, 90, 1.0), (620, 60, 0.8), (1000, 120, 1.1)]:
        for dx, dy, r in [(-50, 10, 34), (0, 0, 46), (50, 12, 32), (20, 22, 30)]:
            t.elips(x + (dx - r) * s, y + (dy - r) * s, x + (dx + r) * s, y + (dy + r) * s, (255, 255, 255, 255), cizgi=0, guc=0.25)
    return t.bitir()


# --- Süsler ---
def agac():
    t = Tuval(220, 320)
    t.kutu(92, 170, 128, 316, (150, 100, 60, 255), r=10)
    for x, y, r in [(110, 110, 80), (60, 150, 52), (160, 150, 52), (110, 60, 56)]:
        t.elips(x - r, y - r, x + r, y + r, (95, 180, 85, 255), kure=True)
    for x, y in [(80, 120), (140, 90), (120, 160)]:
        t.elips(x - 8, y - 8, x + 8, y + 8, (230, 60, 70, 255), cizgi=2, kure=True)
    return kirp(t.bitir())


def cali():
    t = Tuval(180, 110)
    for x, y, r in [(50, 70, 40), (95, 55, 48), (140, 72, 36)]:
        t.elips(x - r, y - r, x + r, y + r, (110, 190, 95, 255), kure=True)
    return kirp(t.bitir())


def cicek():
    t = Tuval(200, 90)
    t.kutu(10, 50, 190, 86, (170, 110, 70, 255), r=10)
    for i, renk in enumerate([(250, 120, 160), (255, 210, 70), (160, 130, 240), (250, 120, 160), (255, 210, 70)]):
        x = 30 + i * 35
        t.cizgi([(x, 52), (x, 28)], (80, 160, 60, 255), 4)
        t.elips(x - 14, 8, x + 14, 36, renk + (255,), cizgi=2, guc=0.6)
        t.elips(x - 5, 17, x + 5, 27, (255, 245, 200, 255), cizgi=0, guc=0)
    return kirp(t.bitir())


def lamba():
    t = Tuval(90, 330)
    t.kutu(38, 60, 52, 320, (90, 100, 120, 255), r=5)
    t.kutu(26, 300, 64, 324, (90, 100, 120, 255), r=6)
    t.cokgen([(20, 60), (70, 60), (60, 14), (30, 14)], (255, 235, 150, 255))
    t.kutu(16, 4, 74, 18, (90, 100, 120, 255), r=6)
    return kirp(t.bitir())


def bank():
    t = Tuval(220, 120)
    t.kutu(20, 74, 34, 116, (90, 100, 120, 255), r=4)
    t.kutu(186, 74, 200, 116, (90, 100, 120, 255), r=4)
    t.kutu(8, 60, 212, 80, (200, 130, 80, 255), r=6)
    t.kutu(8, 8, 212, 26, (200, 130, 80, 255), r=6)
    t.kutu(8, 32, 212, 50, (200, 130, 80, 255), r=6)
    return kirp(t.bitir())


# --- Bina parçaları ---
def pencere_dis(t, x0, y0, x1, y1, perde=(250, 150, 170), cerceve=(255, 255, 255)):
    t.kutu(x0, y0, x1, y1, cerceve + (255,), r=6)
    t.kutu(x0 + 8, y0 + 8, x1 - 8, y1 - 8, (165, 215, 245, 255), r=3, cizgi=2, guc=0.3)
    t.cokgen([(x0 + 8, y0 + 8), (x0 + 8 + (x1 - x0) * 0.28, y0 + 8), (x0 + 8, y1 - 8)], perde + (255,), cizgi=2, guc=0.4)
    t.cokgen([(x1 - 8, y0 + 8), (x1 - 8 - (x1 - x0) * 0.28, y0 + 8), (x1 - 8, y1 - 8)], perde + (255,), cizgi=2, guc=0.4)
    t.cizgi([((x0 + x1) / 2, y0 + 8), ((x0 + x1) / 2, y1 - 8)], cerceve + (255,), 5)


def kapi_dis(t, x0, x1, ust, alt, renk, kemer=True):
    """Dış kapı: üstü yuvarlak, topuzu sarı."""
    if kemer:
        t.elips(x0, ust, x1, ust + (x1 - x0), renk + (255,))
        t.kutu(x0, ust + (x1 - x0) / 2, x1, alt, renk + (255,), r=3)
        t.cizgi([(x0 + 2, ust + (x1 - x0) / 2), (x1 - 2, ust + (x1 - x0) / 2)], renk + (255,), 5)
    else:
        t.kutu(x0, ust, x1, alt, renk + (255,), r=6)
    t.kutu(x0 + 10, ust + (x1 - x0) * 0.6, x1 - 10, alt - 12, tuple(min(255, c + 25) for c in renk) + (255,), r=5, cizgi=2, guc=0.5)
    t.elips(x1 - 22, (ust + alt) / 2 + 8, x1 - 8, (ust + alt) / 2 + 22, (255, 210, 80, 255), cizgi=2, kure=True)


def tente(t, x0, x1, y0, y1, r1, r2, n=6):
    """Çizgili dükkan tentesi, alt kenarı dalgalı."""
    w = (x1 - x0) / n
    for i in range(n):
        renk = (r1 if i % 2 == 0 else r2) + (255,)
        t.cokgen([(x0 + i * w + 6, y0), (x0 + (i + 1) * w - 6 + 6, y0), (x0 + (i + 1) * w + 6, y1 - 10), (x0 + i * w, y1 - 10)], renk, cizgi=2, guc=0.5)
        t.elips(x0 + i * w, y1 - 22, x0 + (i + 1) * w + 6, y1, renk, cizgi=2, guc=0.5)


def tabela(t, cx, cy, gen, metin, simge_ad, renk=(255, 250, 235)):
    t.kutu(cx - gen / 2, cy - 26, cx + gen / 2, cy + 26, renk + (255,), r=14)
    simge(t, simge_ad, cx - gen / 2 + 28, cy, 19)
    yazi(t, metin, cx + 18, cy + 1, 22 if len(metin) < 9 else 17)


def ev_govde(t, x0, x1, ust, alt, duvar):
    t.kutu(x0, ust, x1, alt, duvar + (255,), r=4)


def ucgen_cati(t, x0, x1, alt, tepe, renk, bacaX=None):
    if bacaX:
        t.kutu(bacaX, tepe + 30, bacaX + 34, alt - 40, (200, 110, 90, 255), r=3)
        t.kutu(bacaX - 6, tepe + 22, bacaX + 40, tepe + 36, (180, 95, 80, 255), r=3)
    t.cokgen([(x0, alt), ((x0 + x1) / 2, tepe), (x1, alt)], renk + (255,))
    # Kiremit çizgileri
    for i in range(1, 4):
        k = i / 4
        y = tepe + (alt - tepe) * k
        a = (x0 + x1) / 2 - ((x0 + x1) / 2 - x0) * k
        b = (x0 + x1) / 2 + (x1 - (x0 + x1) / 2) * k
        t.cizgi([(a + 8, y), (b - 8, y)], tuple(int(c * 0.82) for c in renk) + (255,), 3)


def citler(t, x0, x1, ust, alt, renk=(255, 255, 255), bos=None):
    """Tahta çit. bos: kapının açıklığı (x0, x1)."""
    for x in range(int(x0), int(x1) - 20, 26):
        if bos and x + 22 > bos[0] and x < bos[1]:
            continue
        t.cokgen([(x, alt), (x, ust + 10), (x + 10, ust), (x + 20, ust + 10), (x + 20, alt)], renk + (255,), cizgi=2, guc=0.4)
    for y in (ust + 24, alt - 18):
        segs = [(x0, bos[0]), (bos[1], x1)] if bos else [(x0, x1)]
        for a, b in segs:
            if b - a > 10:
                t.kutu(a, y, b - 6, y + 9, renk + (255,), r=3, cizgi=2, guc=0.3)


def bahce_kapisi(t, x0, x1, ust, alt, renk=(250, 250, 250)):
    """Küçük tahta bahçe kapısı ve üstünde kemer."""
    t.kutu(x0 - 8, ust - 16, x0 + 4, alt, (200, 150, 100, 255), r=4)
    t.kutu(x1 - 4, ust - 16, x1 + 8, alt, (200, 150, 100, 255), r=4)
    for x in range(int(x0) + 8, int(x1) - 10, 18):
        t.kutu(x, ust + 6, x + 12, alt - 6, renk + (255,), r=4, cizgi=2, guc=0.3)
    t.kutu(x0 + 4, ust + 22, x1 - 4, ust + 30, renk + (255,), r=2, cizgi=2, guc=0.3)
    t.kutu(x0 + 4, alt - 26, x1 - 4, alt - 18, renk + (255,), r=2, cizgi=2, guc=0.3)


def salincak_ciz(t, x0, x1, ust, alt):
    t.cokgen([(x0, alt), (x0 + 14, ust), (x0 + 26, ust), (x0 + 14, alt)], (230, 90, 80, 255), cizgi=2, guc=0.5)
    t.cokgen([(x1, alt), (x1 - 14, ust), (x1 - 26, ust), (x1 - 14, alt)], (230, 90, 80, 255), cizgi=2, guc=0.5)
    t.kutu(x0 + 6, ust - 6, x1 - 6, ust + 8, (240, 180, 60, 255), r=4)
    for cx in ((x0 * 2 + x1) / 3, (x0 + x1 * 2) / 3):
        t.cizgi([(cx - 16, ust + 8), (cx - 16, alt - 30)], (120, 110, 100, 255), 3)
        t.cizgi([(cx + 16, ust + 8), (cx + 16, alt - 30)], (120, 110, 100, 255), 3)
        t.kutu(cx - 22, alt - 34, cx + 22, alt - 24, (90, 160, 230, 255), r=3, cizgi=2)


def kaydirak_ciz(t, x0, ust, alt, renk=(250, 200, 60)):
    t.kutu(x0, ust, x0 + 10, alt, (120, 160, 220, 255), r=3, cizgi=2)
    t.kutu(x0 + 34, ust, x0 + 44, alt, (120, 160, 220, 255), r=3, cizgi=2)
    for y in range(int(ust) + 18, int(alt) - 8, 22):
        t.kutu(x0 + 6, y, x0 + 38, y + 6, (120, 160, 220, 255), r=2, cizgi=2, guc=0.3)
    t.kutu(x0 - 4, ust - 10, x0 + 60, ust + 4, (120, 160, 220, 255), r=4)
    t.cokgen([(x0 + 44, ust - 6), (x0 + 60, ust - 6), (x0 + 150, alt - 8), (x0 + 168, alt - 8), (x0 + 168, alt), (x0 + 140, alt)], renk + (255,))


# --- Haritadaki yerler. Her fonksiyon (resim, kapı) döner. kapı: x, w ve h; alt kenardan ölçülür. ---
def dis_ev1():
    t = Tuval(360, 410)
    ucgen_cati(t, 4, 356, 190, 40, (90, 150, 230), bacaX=250)
    ev_govde(t, 26, 334, 180, 406, (255, 236, 205))
    t.elips(160, 110, 200, 150, (255, 250, 220, 255), kure=False)
    t.cizgi([(180, 112), (180, 148)], KALEM, 3)
    pencere_dis(t, 50, 220, 130, 300)
    pencere_dis(t, 230, 220, 310, 300)
    for x0 in (44, 224):
        t.kutu(x0, 300, x0 + 92, 322, (170, 110, 70, 255), r=5)
        for i in range(4):
            t.elips(x0 + 8 + i * 20, 288, x0 + 26 + i * 20, 306, ((250, 120, 160, 255), (255, 210, 70, 255))[i % 2], cizgi=2, guc=0.6)
    kapi_dis(t, 140, 220, 236, 396, (230, 110, 90))
    t.kutu(126, 394, 234, 408, (210, 200, 190, 255), r=4)
    return t.bitir(), {"x": 136, "w": 88, "h": 176}


def dis_bahce(ciz, renk_cit, kapi_renk, bitki):
    t = Tuval(320, 300)
    bitki(t)
    citler(t, 6, 316, 210, 296, renk_cit, bos=(126, 200))
    bahce_kapisi(t, 128, 198, 196, 296, kapi_renk)
    return t.bitir(), {"x": 118, "w": 90, "h": 120}


def bahce1_bitki(t):
    t.kutu(40, 120, 60, 280, (150, 100, 60, 255), r=8)
    for x, y, r in [(50, 80, 60), (20, 120, 36), (86, 116, 40)]:
        t.elips(x - r, y - r, x + r, y + r, (95, 180, 85, 255), kure=True)
    salincak_ciz(t, 170, 300, 110, 270)
    for x in range(20, 300, 34):
        t.elips(x, 250, x + 22, 272, ((250, 120, 160, 255), (255, 210, 70, 255), (160, 130, 240, 255))[x // 34 % 3], cizgi=2, guc=0.6)


def bahce2_bitki(t):
    kaydirak_ciz(t, 30, 150, 280, (250, 130, 70))
    t.cokgen([(210, 110), (300, 110), (255, 70)], (250, 120, 150, 255))
    t.kutu(251, 110, 259, 230, (200, 200, 210, 255), r=3, cizgi=2)
    t.kutu(215, 220, 295, 232, (200, 140, 90, 255), r=4)
    for x in range(10, 310, 40):
        t.elips(x - 22, 228, x + 22, 270, (110, 190, 95, 255), kure=True)


def dis_ev2():
    t = Tuval(420, 480)
    t.cokgen([(8, 160), (70, 40), (350, 40), (412, 160)], (220, 80, 70, 255))
    for y in (80, 120):
        t.cizgi([(40, y), (380, y)], (180, 60, 55, 255), 3)
    ev_govde(t, 30, 390, 150, 476, (252, 205, 190))
    for x in (60, 170, 280):
        pencere_dis(t, x, 180, x + 80, 255, perde=(140, 200, 140))
    pencere_dis(t, 52, 310, 150, 400, perde=(140, 200, 140))
    pencere_dis(t, 270, 310, 368, 400, perde=(140, 200, 140))
    kapi_dis(t, 168, 252, 300, 466, (80, 160, 120))
    t.kutu(150, 464, 270, 478, (210, 200, 190, 255), r=4)
    t.kutu(160, 288, 260, 302, (240, 240, 240, 255), r=4)
    return t.bitir(), {"x": 162, "w": 96, "h": 182}


def dis_ev3():
    t = Tuval(280, 340)
    ucgen_cati(t, 6, 274, 160, 30, (220, 140, 70))
    ev_govde(t, 26, 254, 150, 336, (255, 225, 120))
    t.elips(118, 82, 162, 126, (255, 250, 220, 255))
    t.cizgi([(140, 84), (140, 124)], KALEM, 3)
    t.cizgi([(120, 104), (160, 104)], KALEM, 3)
    pencere_dis(t, 40, 190, 104, 254, perde=(170, 140, 240))
    kapi_dis(t, 150, 220, 186, 330, (160, 110, 220))
    t.kutu(138, 328, 232, 338, (210, 200, 190, 255), r=4)
    return t.bitir(), {"x": 146, "w": 78, "h": 152}


def dis_park():
    t = Tuval(480, 320)
    for x, r in [(70, 70), (400, 62)]:
        t.kutu(x - 14, 160, x + 14, 300, (150, 100, 60, 255), r=8)
        t.elips(x - r, 160 - 2 * r + 30, x + r, 190, (95, 180, 85, 255), kure=True)
    # Fıskiye
    t.elips(170, 250, 320, 296, (180, 190, 205, 255))
    t.elips(184, 256, 306, 284, (120, 190, 240, 255), cizgi=2, guc=0.4)
    t.kutu(236, 200, 254, 270, (180, 190, 205, 255), r=6)
    for dx in (-40, -20, 20, 40):
        t.cizgi([(245, 200), (245 + dx * 0.6, 170), (245 + dx, 230)], (150, 210, 250, 255), 4)
    citler(t, 6, 474, 236, 316, (90, 150, 110), bos=(196, 296))
    t.kutu(190, 196, 202, 316, (90, 150, 110, 255), r=4)
    t.kutu(290, 196, 302, 316, (90, 150, 110, 255), r=4)
    tabela(t, 246, 40, 160, "PARK", "park", (220, 245, 210))
    t.kutu(240, 66, 252, 196, (90, 150, 110, 255), r=4)
    return t.bitir(), {"x": 196, "w": 100, "h": 130}


def dis_oyun():
    t = Tuval(420, 320)
    kaydirak_ciz(t, 30, 140, 300)
    salincak_ciz(t, 250, 400, 120, 300)
    citler(t, 6, 414, 236, 316, (250, 180, 80), bos=(166, 246))
    tabela(t, 206, 50, 190, "OYUN", "oyun", (255, 240, 200))
    return t.bitir(), {"x": 160, "w": 92, "h": 120}


def dukkan(gen, yuk, duvar, tente_renk, metin, simge_ad, kapi_renk, vitrin=None, cati=None):
    """Tek katlı dükkan: tente, büyük vitrin ve tabela."""
    t = Tuval(gen, yuk)
    if cati:
        cati(t)
    ev_govde(t, 14, gen - 14, 90, yuk - 4, duvar)
    t.kutu(6, 80, gen - 6, 104, tuple(int(c * 0.85) for c in duvar) + (255,), r=6)
    tabela(t, gen / 2, 54, gen - 70, metin, simge_ad)
    tente(t, 20, gen - 26, 110, 170, *tente_renk)
    vx1 = gen * 0.52
    t.kutu(30, 186, vx1, yuk - 40, (255, 255, 255, 255), r=6)
    t.kutu(40, 196, vx1 - 10, yuk - 50, (175, 220, 245, 255), r=3, cizgi=2, guc=0.3)
    if vitrin:
        vitrin(t, 40, 196, vx1 - 10, yuk - 50)
    t.kutu(24, yuk - 44, vx1 + 6, yuk - 34, (255, 255, 255, 255), r=3)
    kx0 = vx1 + 22
    kapi_dis(t, kx0, gen - 30, 186, yuk - 6, kapi_renk, kemer=False)
    return t, {"x": int(kx0 - 6), "w": int(gen - 30 - kx0 + 12), "h": yuk - 180}


def vitrin_kafe(t, x0, y0, x1, y1):
    for i in range(3):
        x = x0 + 18 + i * 40
        t.kutu(x, y1 - 40, x + 26, y1 - 10, (240, 240, 245, 255), r=6, cizgi=2, guc=0.5)
        t.kutu(x + 4, y1 - 36, x + 22, y1 - 28, (150, 95, 60, 255), r=3, cizgi=0, guc=0.3)


def vitrin_market(t, x0, y0, x1, y1):
    for i, renk in enumerate([(230, 50, 60), (250, 200, 50), (250, 150, 30), (100, 180, 70)]):
        x = x0 + 12 + i * 28
        t.elips(x, y1 - 30, x + 24, y1 - 6, renk + (255,), cizgi=2, kure=True)


def vitrin_oyuncak(t, x0, y0, x1, y1):
    t.elips(x0 + 14, y1 - 46, x0 + 54, y1 - 6, (235, 80, 80, 255), cizgi=2, kure=True)
    t.kutu(x0 + 70, y1 - 40, x0 + 104, y1 - 6, (90, 160, 230, 255), r=4, cizgi=2)
    t.kutu(x0 + 82, y1 - 66, x0 + 104, y1 - 40, (255, 210, 70, 255), r=4, cizgi=2)


def vitrin_pasta(t, x0, y0, x1, y1):
    t.kutu(x0 + 20, y1 - 40, x0 + 90, y1 - 8, (250, 190, 210, 255), r=6, cizgi=2)
    t.kutu(x0 + 30, y1 - 62, x0 + 80, y1 - 38, (255, 240, 245, 255), r=6, cizgi=2)
    t.elips(x0 + 47, y1 - 76, x0 + 63, y1 - 60, (230, 40, 60, 255), cizgi=2, kure=True)


def vitrin_kuafor(t, x0, y0, x1, y1):
    t.elips(x0 + 20, y0 + 20, x1 - 20, y1 - 30, (230, 200, 120, 255), cizgi=2, guc=0.5)
    t.elips(x0 + 28, y0 + 28, x1 - 28, y1 - 38, (215, 235, 250, 255), cizgi=2, guc=0.3)


def dis_kafe():
    t, kp = dukkan(310, 350, (190, 235, 215), ((250, 150, 170), (255, 255, 255)), "KAFE", "kafe", (150, 100, 70), vitrin_kafe)
    return t.bitir(), kp


def dis_market():
    t, kp = dukkan(340, 340, (255, 240, 180), ((90, 180, 100), (255, 255, 255)), "MARKET", "market", (90, 150, 220), vitrin_market)
    return t.bitir(), kp


def dis_oyuncak():
    t, kp = dukkan(320, 360, (205, 180, 240), ((250, 110, 110), (255, 210, 80)), "OYUNCAKÇI", "oyuncak", (240, 130, 60), vitrin_oyuncak)
    return t.bitir(), kp


def dis_kuafor():
    def direk(t):
        pass
    t, kp = dukkan(290, 340, (255, 205, 220), ((230, 90, 140), (255, 255, 255)), "KUAFÖR", "kuafor", (120, 120, 200), vitrin_kuafor)
    # Berber direği
    t.kutu(266, 190, 284, 300, (255, 255, 255, 255), r=8)
    for y in range(196, 296, 20):
        t.cizgi([(268, y + 12), (282, y)], (230, 60, 80, 255), 5)
    return t.bitir(), kp


def dis_pastane():
    t, kp = dukkan(310, 350, (255, 240, 225), ((170, 110, 80), (255, 230, 200)), "PASTANE", "pastane", (200, 100, 120), vitrin_pasta)
    return t.bitir(), kp


def dis_okul():
    t = Tuval(480, 460)
    # Saat kulesi
    t.kutu(190, 40, 290, 160, (240, 140, 90, 255), r=4)
    t.cokgen([(180, 46), (240, 0), (300, 46)], (200, 80, 70, 255))
    t.elips(210, 66, 270, 126, (255, 255, 255, 255), kure=False)
    t.cizgi([(240, 96), (240, 74)], KALEM, 4)
    t.cizgi([(240, 96), (256, 104)], KALEM, 4)
    # Bayrak
    t.cizgi([(320, 150), (320, 20)], (120, 120, 130, 255), 4)
    t.cokgen([(322, 22), (372, 34), (322, 48)], (230, 60, 70, 255), cizgi=2)
    ev_govde(t, 20, 460, 150, 456, (240, 150, 100))
    t.kutu(10, 140, 470, 164, (220, 120, 85, 255), r=6)
    for x in (44, 124, 300, 380):
        for y in (190, 300):
            pencere_dis(t, x, y, x + 60, y + 70, perde=(255, 220, 120))
    t.kutu(178, 270, 302, 456, (255, 255, 255, 255), r=6)
    kapi_dis(t, 188, 238, 290, 452, (90, 130, 200), kemer=False)
    kapi_dis(t, 242, 292, 290, 452, (90, 130, 200), kemer=False)
    tabela(t, 240, 220, 150, "OKUL", "okul")
    return t.bitir(), {"x": 182, "w": 116, "h": 168}


def dis_hastane():
    t = Tuval(420, 450)
    ev_govde(t, 20, 400, 60, 446, (250, 250, 252))
    t.kutu(10, 50, 410, 74, (215, 225, 235, 255), r=6)
    t.elips(170, 84, 250, 164, (255, 255, 255, 255))
    t.kutu(200, 96, 220, 152, (230, 60, 70, 255), r=3)
    t.kutu(182, 114, 238, 134, (230, 60, 70, 255), r=3)
    for x in (40, 100, 270, 330):
        for y in (100, 220):
            pencere_dis(t, x, y, x + 52, y + 64, perde=(150, 200, 240), cerceve=(200, 220, 240))
    tabela(t, 210, 200, 190, "HASTANE", "hastane")
    t.kutu(150, 276, 270, 446, (200, 220, 240, 255), r=6)
    kapi_dis(t, 160, 210, 286, 442, (120, 190, 230), kemer=False)
    kapi_dis(t, 214, 262, 286, 442, (120, 190, 230), kemer=False)
    return t.bitir(), {"x": 154, "w": 112, "h": 164}


def dis_kutuphane():
    t = Tuval(380, 420)
    t.cokgen([(10, 130), (190, 40), (370, 130)], (235, 225, 205, 255))
    t.elips(166, 74, 214, 122, (90, 150, 230, 255), cizgi=2)
    ev_govde(t, 26, 354, 128, 416, (240, 230, 210))
    for x in (40, 106, 254, 320):
        t.kutu(x, 140, x + 22, 400, (255, 250, 240, 255), r=6)
    for x in (68, 280):
        pencere_dis(t, x - 6, 190, x + 34, 290, perde=(240, 140, 140))
    tabela(t, 190, 160, 200, "KÜTÜPHANE", "kutuphane")
    kapi_dis(t, 140, 240, 220, 410, (150, 100, 70))
    t.kutu(20, 404, 360, 418, (210, 200, 190, 255), r=4)
    return t.bitir(), {"x": 136, "w": 108, "h": 196}


YERLER = {
    "ev1": dis_ev1, "ev2": dis_ev2, "ev3": dis_ev3, "park": dis_park, "oyun": dis_oyun,
    "okul": dis_okul, "kafe": dis_kafe, "market": dis_market, "oyuncakci": dis_oyuncak,
    "hastane": dis_hastane, "kuafor": dis_kuafor, "kutuphane": dis_kutuphane, "pastane": dis_pastane,
}


def main():
    for d in ("dunya", "dis", "simge"):
        os.makedirs(yol(d), exist_ok=True)
    zemin().convert("RGB").save(yol("dunya", "zemin.jpg"), quality=86)
    for ad, f in [("agac", agac), ("cali", cali), ("cicek", cicek), ("lamba", lamba), ("bank", bank)]:
        f().save(yol("dunya", ad + ".png"))
    for ad in SIMGELER:
        simge_resmi(ad).save(yol("simge", ad + ".png"))
    kapilar = {}
    for ad, f in YERLER.items():
        im, kp = f()
        im.save(yol("dis", ad + ".png"))
        kapilar[ad] = (im.size, kp)
    for ad, renk, kr, b in [("bahce1", (255, 255, 255), (250, 240, 220), bahce1_bitki), ("bahce2", (200, 150, 100), (240, 200, 150), bahce2_bitki)]:
        im, kp = dis_bahce(None, renk, kr, b)
        im.save(yol("dis", ad + ".png"))
        kapilar[ad] = (im.size, kp)
    for ad, (boyut, kp) in kapilar.items():
        print(ad, boyut, kp)


if __name__ == "__main__":
    main()
