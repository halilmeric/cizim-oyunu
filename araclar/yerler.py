"""Yeni mekanların arka planlarını üretir: odalar, dükkanlar, bahçeler ve park.

Kullanım: python3 araclar/yerler.py
Çıktı: cizimler/mekan/<id>.jpg
Mobilyaların yerleri js/veri.js içindeki noktalarla aynı sayıları kullanır.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(__file__))
from uret import (ARKA, KALEM, SS, W, H, Tuval, golge_birak, kapi, karo, oda_iskeleti, parke,  # noqa: E402
                  pencere, yol, zemin_isigi, duvar_deseni)
from dunya import simge, yazi, salincak_ciz, citler, bahce_kapisi, bulut_ciz, agac_tam, cam_ciz, tac_ciz, GOK  # noqa: E402

BEYAZ = (255, 255, 255, 255)


def a(renk):
    return tuple(renk) + (255,) if len(renk) == 3 else renk


# --- Mobilyalar. alt: mobilyanın zemine bastığı y. ---
def masa(t, x0, x1, ust, alt, renk=(200, 140, 90), yuvarlak=False):
    golge_birak(t, (x0 + x1) / 2, alt, (x1 - x0) / 2 + 10, 10)
    cx = (x0 + x1) / 2
    if yuvarlak:
        t.kutu(cx - 8, ust + 10, cx + 8, alt, a(renk), r=4)
        t.kutu(cx - 40, alt - 10, cx + 40, alt, a(renk), r=4)
        t.elips(x0, ust - 14, x1, ust + 18, a(renk))
    else:
        for x in (x0 + 10, x1 - 24):
            t.kutu(x, ust + 10, x + 14, alt, a(renk), r=3)
        t.kutu(x0, ust, x1, ust + 20, a(renk), r=5)


def sandalye(t, x, alt, renk=(230, 120, 90), arka=True):
    golge_birak(t, x, alt, 36, 7)
    if arka:
        t.kutu(x - 34, alt - 140, x + 34, alt - 62, a(renk), r=12)
    for dx in (-30, 18):
        t.kutu(x + dx, alt - 60, x + dx + 12, alt, a(renk), r=3)
    t.kutu(x - 38, alt - 68, x + 38, alt - 50, a(renk), r=6)


def yatak(t, x0, x1, alt, renk=(130, 170, 235), cerceve=(200, 140, 90), bas_sag=True):
    """Yatak. Baş ucu sağda: karakter ayakları solda olacak şekilde yatar."""
    golge_birak(t, (x0 + x1) / 2, alt, (x1 - x0) / 2 + 10, 12)
    bx = x1 - 24 if bas_sag else x0
    t.kutu(bx, alt - 210, bx + 24, alt, a(cerceve), r=10)
    t.kutu(x0 if bas_sag else x0 + 20, alt - 110, x1 - 20 if bas_sag else x1, alt - 20, a(cerceve), r=8)
    for x in (x0 + 6, x1 - 40):
        t.kutu(x, alt - 30, x + 14, alt, a(cerceve), r=3)
    t.kutu(x0 + 6, alt - 140, x1 - 26, alt - 92, (250, 250, 255, 255), r=16)
    py = alt - 150
    if bas_sag:
        t.kutu(x1 - 110, py - 10, x1 - 30, py + 30, BEYAZ, r=16)
    t.kutu(x0 + 6, alt - 128, x0 + (x1 - x0) * 0.62, alt - 84, a(renk), r=14)


def kanepe(t, x0, x1, alt, renk=(240, 130, 110)):
    golge_birak(t, (x0 + x1) / 2, alt, (x1 - x0) / 2 + 10, 10)
    t.kutu(x0 + 20, alt - 160, x1 - 20, alt - 70, a(renk), r=24)
    t.kutu(x0, alt - 110, x0 + 50, alt - 14, a(renk), r=18)
    t.kutu(x1 - 50, alt - 110, x1, alt - 14, a(renk), r=18)
    n = 2
    w = (x1 - x0 - 100) / n
    for i in range(n):
        t.kutu(x0 + 50 + i * w, alt - 80, x0 + 50 + (i + 1) * w, alt - 30, tuple(min(255, c + 20) for c in renk) + (255,), r=12)
    t.kutu(x0 + 30, alt - 34, x1 - 30, alt - 6, tuple(int(c * 0.8) for c in renk) + (255,), r=8)


def raf_dolabi(t, x0, x1, ust, alt, raf_y, renk=(190, 130, 85), ic=(230, 200, 160)):
    """Raflı dolap. raf_y: rafların üst yüzü (eşyalar bunun üstüne konur)."""
    golge_birak(t, (x0 + x1) / 2, alt, (x1 - x0) / 2 + 10, 10)
    t.kutu(x0, ust, x1, alt, a(renk), r=8)
    t.kutu(x0 + 12, ust + 12, x1 - 12, alt - 12, a(ic), r=4, cizgi=2, guc=0.4)
    for y in raf_y:
        t.kutu(x0 + 10, y, x1 - 10, y + 10, a(renk), r=3, cizgi=2, guc=0.5)


def kitaplar(t, x0, x1, y, rng):
    x = x0
    renkler = [(230, 90, 90), (90, 150, 230), (250, 200, 70), (120, 190, 110), (180, 120, 220), (250, 150, 80)]
    while x < x1 - 14:
        w = int(rng.integers(12, 22))
        h = int(rng.integers(44, 62))
        t.kutu(x, y - h, x + w, y, a(renkler[int(rng.integers(0, 6))]), r=3, cizgi=2, guc=0.5)
        x += w + 2


def tezgah(t, x0, x1, ust, alt, renk, ust_renk=(240, 240, 245)):
    golge_birak(t, (x0 + x1) / 2, alt, (x1 - x0) / 2 + 10, 10)
    t.kutu(x0, ust + 16, x1, alt, a(renk), r=6)
    for x in range(int(x0) + 10, int(x1) - 60, 92):
        t.kutu(x, ust + 28, x + 84, alt - 10, tuple(min(255, c + 18) for c in renk) + (255,), r=6, cizgi=2)
    t.kutu(x0 - 10, ust, x1 + 10, ust + 20, a(ust_renk), r=5)


def hali(t, cx, cy, rx, ry, renkler):
    h = Tuval(W, H)
    for i, (r, renk) in enumerate(zip([1.0, 0.75, 0.5], renkler)):
        h.elips(cx - rx * r, cy - ry * r, cx + rx * r, cy + ry * r, a(renk), cizgi=2 if i else 3, guc=0.25)
    t.im.alpha_composite(h.im)


def cerceveli(t, x0, y0, x1, y1, ad):
    t.kutu(x0, y0, x1, y1, (200, 140, 80, 255), r=6)
    t.kutu(x0 + 10, y0 + 10, x1 - 10, y1 - 10, (255, 252, 240, 255), r=2, guc=0.3)
    simge(t, ad, (x0 + x1) / 2, (y0 + y1) / 2, min(x1 - x0, y1 - y0) / 2 - 18)


def oda_kur(duvar, yan, zemin, sol=True, sag=False, desen=None):
    t = Tuval(W, H)
    oda_iskeleti(t, duvar, yan, zemin)
    if desen:
        duvar_deseni(t, desen)
    zemin_isigi(t)
    if sol:
        kapi(t, sag=False)
    if sag:
        kapi(t, sag=True)
    return t


# --- Ev 1: yatak odası ---
def yatak_odasi():
    t = oda_kur(((235, 220, 250), (220, 200, 240)), ((215, 200, 238), (200, 185, 228)), lambda t: parke(t, (200, 150, 110)),
                sag=True, desen=(225, 205, 245, 255))
    pencere(t, 480, 80, 640, 270)
    hali(t, 560, 620, 260, 60, [(250, 200, 120), (240, 140, 170), (150, 200, 240)])
    yatak(t, 230, 560, 470)
    # Gece lambası ve komodin
    t.kutu(590, 380, 660, 468, (200, 140, 90, 255), r=6)
    t.kutu(612, 330, 638, 382, (240, 240, 245, 255), r=4)
    t.cokgen([(600, 300), (650, 300), (660, 336), (590, 336)], (255, 220, 120, 255))
    # Dolap
    golge_birak(t, 900, 466, 110, 10)
    t.kutu(800, 140, 1000, 466, (200, 150, 230, 255), r=10)
    t.kutu(812, 152, 896, 454, (215, 175, 240, 255), r=6, cizgi=2)
    t.kutu(904, 152, 988, 454, (215, 175, 240, 255), r=6, cizgi=2)
    for x in (884, 916):
        t.elips(x - 7, 290, x + 7, 304, (250, 205, 80, 255), cizgi=2, kure=True)
    # Duvarda yıldızlar
    for x, y in [(260, 100), (330, 150), (720, 90), (420, 60)]:
        t.cokgen([(x, y - 18), (x + 6, y - 6), (x + 19, y - 5), (x + 9, y + 4), (x + 12, y + 18), (x, y + 10), (x - 12, y + 18), (x - 9, y + 4), (x - 19, y - 5), (x - 6, y - 6)], (255, 215, 80, 255), cizgi=2)
    return t.bitir()


# --- Ev 2 ---
def ev2_salon():
    t = oda_kur(((255, 245, 200), (250, 230, 180)), ((245, 228, 180), (235, 215, 165)), lambda t: parke(t, (180, 120, 80)), sag=True)
    pencere(t, 250, 80, 400, 270)
    pencere(t, 880, 80, 1030, 270)
    hali(t, 640, 620, 320, 70, [(200, 90, 90), (240, 200, 120), (200, 90, 90)])
    kanepe(t, 470, 810, 470, (120, 170, 210))
    cerceveli(t, 560, 90, 720, 220, "harita")
    # Kitaplık
    raf_dolabi(t, 220, 420, 300, 466, [360, 410], (170, 110, 70), (220, 180, 140))
    rng = np.random.default_rng(5)
    kitaplar(t, 236, 404, 360, rng)
    kitaplar(t, 236, 404, 410, rng)
    # Saksı
    golge_birak(t, 960, 466, 50, 10)
    for x, y, r in [(940, 360, 34), (980, 345, 38), (960, 315, 36)]:
        t.elips(x - r, y - r, x + r, y + r, (90, 175, 80, 255), kure=True)
    t.cokgen([(920, 390), (1000, 390), (988, 466), (932, 466)], (90, 150, 220, 255))
    return t.bitir()


def ev2_cocuk():
    t = oda_kur(((210, 245, 230), (190, 235, 215)), ((195, 235, 218), (180, 225, 205)), lambda t: parke(t, (220, 180, 130)),
                sag=True, desen=(180, 228, 205, 255))
    pencere(t, 600, 80, 760, 260)
    hali(t, 620, 620, 260, 60, [(120, 200, 240), (255, 230, 120), (240, 140, 170)])
    # Ranza: üstte süs yatak, altta yatılan yatak
    t.kutu(226, 150, 546, 186, (250, 170, 90, 255), r=10)
    t.kutu(236, 120, 530, 156, (255, 240, 200, 255), r=12)
    for x in (226, 520):
        t.kutu(x, 150, x + 26, 470, (250, 170, 90, 255), r=8)
    yatak(t, 226, 546, 470, (250, 130, 150), (250, 170, 90))
    # Masa ve sandalye
    masa(t, 820, 1020, 350, 466, (120, 190, 240))
    sandalye(t, 920, 470, (250, 200, 70))
    # Oyuncak kutusu
    golge_birak(t, 680, 468, 60, 8)
    t.kutu(620, 390, 740, 466, (230, 90, 90, 255), r=8)
    t.elips(640, 360, 690, 410, (90, 150, 230, 255), cizgi=2, kure=True)
    t.kutu(694, 368, 730, 398, (255, 210, 70, 255), r=4, cizgi=2)
    return t.bitir()


def ev3_oda():
    t = oda_kur(((255, 235, 210), (250, 220, 190)), ((250, 225, 195), (240, 210, 180)), lambda t: karo(t, (250, 240, 220), (230, 190, 150), 10, 6),
                desen=(245, 215, 185, 255))
    pencere(t, 600, 90, 740, 260)
    yatak(t, 230, 530, 470, (170, 140, 240), (180, 130, 90))
    # Küçük mutfak köşesi: eviye ve ocak
    tezgah(t, 790, 1060, 340, 466, (240, 170, 120))
    t.elips(840, 342, 940, 356, (170, 180, 190, 255), cizgi=2, guc=0.4)
    t.cizgi([(890, 341), (890, 310), (915, 310), (915, 321)], (150, 155, 165, 255), 7)
    t.elips(980, 340, 1030, 354, (60, 60, 70, 255), cizgi=2, guc=0.6)
    masa(t, 580, 720, 400, 476, (200, 140, 90), yuvarlak=True)
    sandalye(t, 760, 480, (160, 120, 220))
    return t.bitir()


# --- Kamu yerleri ---
def okul():
    t = oda_kur(((255, 240, 200), (250, 228, 185)), ((245, 228, 190), (235, 215, 175)), lambda t: parke(t, (205, 160, 110)))
    # Yazı tahtası
    t.kutu(340, 70, 900, 260, (170, 120, 80, 255), r=8)
    t.kutu(354, 84, 886, 246, (60, 120, 90, 255), r=4, guc=0.3)
    yazi(t, "A B C  1 2 3", 620, 140, 40, (250, 250, 240, 255))
    t.cizgi([(420, 200), (500, 190), (560, 210)], (250, 250, 240, 255), 4)
    t.elips(700, 180, 760, 230, (0, 0, 0, 0), cizgi=0, guc=0)
    simge(t, "okul", 760, 205, 30)
    t.kutu(360, 246, 880, 258, (200, 160, 120, 255), r=3)
    # Öğretmen masası
    masa(t, 900, 1060, 360, 466, (180, 120, 80))
    t.elips(1000, 330, 1040, 362, (230, 50, 60, 255), cizgi=2, kure=True)
    # Öğrenci sıraları ve sandalyeler
    for x in (300, 560):
        masa(t, x - 20, x + 140, 390, 470, (120, 180, 230))
        sandalye(t, x + 60, 476, (250, 160, 80))
    t.kutu(220, 280, 320, 360, (255, 255, 255, 255), r=4)
    simge(t, "harita", 270, 320, 30)
    return t.bitir()


def kafe():
    t = oda_kur(((205, 240, 225), (185, 228, 210)), ((190, 230, 212), (175, 218, 198)), lambda t: karo(t, (250, 245, 235), (150, 110, 90), 12, 7))
    # Menü panosu
    t.kutu(560, 60, 800, 200, (60, 60, 70, 255), r=10)
    yazi(t, "KAFE", 680, 95, 34, (255, 240, 200, 255))
    simge(t, "kafe", 620, 155, 26)
    simge(t, "pastane", 740, 155, 26)
    # Tezgah ve kahve makinesi
    tezgah(t, 220, 560, 330, 466, (160, 110, 80), (240, 230, 215))
    t.kutu(260, 230, 360, 332, (200, 205, 215, 255), r=10)
    t.kutu(280, 250, 340, 290, (90, 90, 100, 255), r=6, cizgi=2)
    t.kutu(298, 290, 322, 306, (90, 90, 100, 255), r=3, cizgi=2)
    t.kutu(420, 290, 520, 332, (255, 255, 255, 255), r=8)
    for x in (440, 470, 500):
        t.elips(x - 12, 280, x + 12, 304, (215, 160, 90, 255), cizgi=2, guc=0.6)
    # Masalar ve sandalyeler
    masa(t, 800, 920, 380, 470, (250, 250, 250), yuvarlak=True)
    sandalye(t, 760, 476, (240, 140, 160))
    sandalye(t, 960, 476, (240, 140, 160))
    pencere(t, 880, 70, 1040, 230)
    return t.bitir()


def market():
    t = oda_kur(((255, 250, 220), (250, 240, 200)), ((250, 240, 200), (240, 228, 185)), lambda t: karo(t, (250, 250, 250), (200, 230, 210), 12, 7))
    t.kutu(420, 40, 860, 90, (90, 180, 100, 255), r=12)
    yazi(t, "MARKET", 640, 66, 36, (255, 255, 255, 255))
    raf_dolabi(t, 220, 560, 130, 466, [230, 330, 430], (90, 150, 220), (230, 240, 250))
    raf_dolabi(t, 600, 860, 130, 466, [230, 330, 430], (90, 150, 220), (230, 240, 250))
    # Kasa
    golge_birak(t, 970, 470, 90, 10)
    t.kutu(890, 330, 1060, 466, (230, 90, 90, 255), r=8)
    t.kutu(880, 316, 1070, 336, (240, 240, 245, 255), r=5)
    t.kutu(930, 250, 1010, 318, (90, 90, 110, 255), r=8)
    t.kutu(944, 262, 996, 290, (150, 230, 160, 255), r=4, cizgi=2, guc=0.3)
    return t.bitir()


def oyuncakci():
    t = oda_kur(((235, 220, 255), (222, 205, 248)), ((222, 205, 248), (210, 190, 240)), lambda t: parke(t, (230, 180, 120)),
                desen=(255, 225, 120, 255))
    t.kutu(430, 40, 850, 90, (250, 110, 110, 255), r=12)
    yazi(t, "OYUNCAKÇI", 640, 66, 32, (255, 255, 255, 255))
    raf_dolabi(t, 220, 600, 130, 466, [230, 330, 430], (250, 170, 90), (255, 240, 220))
    # Büyük ayıcık
    golge_birak(t, 760, 470, 80, 10)
    for x0, y0, x1, y1 in [(690, 210, 730, 250), (790, 210, 830, 250)]:
        t.elips(x0, y0, x1, y1, (180, 120, 70, 255))
    t.elips(690, 330, 830, 470, (195, 135, 85, 255), kure=True)
    t.elips(700, 220, 820, 340, (195, 135, 85, 255), kure=True)
    t.elips(735, 280, 785, 320, (240, 210, 170, 255), cizgi=2)
    t.elips(728, 260, 740, 272, KALEM, cizgi=0, guc=0)
    t.elips(780, 260, 792, 272, KALEM, cizgi=0, guc=0)
    t.elips(752, 288, 768, 300, KALEM, cizgi=0, guc=0)
    # Sallanan at
    golge_birak(t, 960, 470, 90, 10)
    t.elips(870, 440, 1050, 480, (200, 140, 90, 255))
    t.kutu(900, 360, 1010, 420, (250, 250, 250, 255), r=26)
    t.kutu(990, 290, 1040, 380, (250, 250, 250, 255), r=20)
    t.kutu(1000, 280, 1060, 320, (250, 250, 250, 255), r=16)
    t.cokgen([(986, 286), (970, 340), (996, 330)], (240, 120, 160, 255), cizgi=2)
    t.elips(1028, 290, 1038, 300, KALEM, cizgi=0, guc=0)
    for x in (910, 990):
        t.kutu(x, 410, x + 14, 460, (250, 250, 250, 255), r=4)
    return t.bitir()


def hastane():
    t = oda_kur(((235, 248, 255), (220, 240, 252)), ((222, 240, 252), (208, 230, 246)), lambda t: karo(t, (250, 252, 255), (210, 230, 245), 14, 8))
    t.elips(600, 50, 680, 130, BEYAZ)
    t.kutu(630, 62, 650, 118, (230, 60, 70, 255), r=3)
    t.kutu(612, 80, 668, 100, (230, 60, 70, 255), r=3)
    # Perde
    t.kutu(220, 70, 470, 82, (180, 190, 200, 255), r=3, cizgi=2)
    for x in range(224, 300, 18):
        t.kutu(x, 80, x + 18, 420, (150, 210, 200, 255), r=6, cizgi=2, guc=0.5)
    yatak(t, 300, 620, 470, (150, 210, 240), (200, 210, 225))
    # Göz tablosu
    t.kutu(720, 120, 820, 260, BEYAZ, r=6)
    for i, (y, s) in enumerate([(150, 28), (190, 20), (220, 14), (242, 10)]):
        yazi(t, ["E", "F P", "T O Z", "L P E D"][i], 770, y, s)
    # Doktor masası
    masa(t, 840, 1060, 350, 466, (240, 240, 245))
    t.kutu(880, 290, 950, 352, (90, 150, 220, 255), r=6)
    t.kutu(990, 320, 1030, 352, (250, 250, 250, 255), r=4)
    t.kutu(1002, 310, 1018, 324, (230, 60, 70, 255), r=2, cizgi=2)
    return t.bitir()


def kuafor():
    t = oda_kur(((255, 225, 235), (250, 210, 225)), ((250, 212, 226), (240, 198, 214)), lambda t: karo(t, (255, 255, 255), (60, 60, 70), 14, 8))
    # Ayna ve koltuk
    t.elips(320, 80, 520, 330, (230, 200, 120, 255))
    t.elips(336, 96, 504, 314, (210, 235, 250, 255), cizgi=2, guc=0.4)
    t.cizgi([(370, 170), (420, 120)], (255, 255, 255, 220), 6)
    t.kutu(300, 330, 540, 350, (250, 250, 250, 255), r=5)
    golge_birak(t, 420, 474, 70, 10)
    t.kutu(400, 420, 440, 470, (150, 150, 160, 255), r=4)
    t.kutu(360, 460, 480, 474, (150, 150, 160, 255), r=6)
    t.kutu(350, 300, 490, 380, (230, 90, 140, 255), r=20)
    t.kutu(345, 360, 495, 425, (240, 110, 160, 255), r=14)
    # Lavabo
    golge_birak(t, 780, 466, 70, 10)
    t.kutu(760, 350, 800, 466, (250, 250, 252, 255), r=6)
    t.elips(700, 300, 860, 360, (252, 252, 255, 255))
    t.elips(720, 306, 840, 332, (190, 215, 235, 255), cizgi=2, guc=0.4)
    t.cizgi([(780, 306), (780, 280), (800, 280)], (160, 165, 175, 255), 7)
    # Şişeler rafı
    t.kutu(900, 250, 1060, 262, (200, 140, 90, 255), r=3)
    for x, renk in [(920, (120, 200, 190)), (960, (250, 150, 180)), (1000, (255, 210, 90)), (1040, (160, 140, 240))]:
        t.kutu(x - 14, 190, x + 14, 252, a(renk), r=8)
    simge(t, "kuafor", 980, 120, 36)
    return t.bitir()


def kutuphane():
    t = oda_kur(((245, 235, 215), (235, 222, 198)), ((235, 222, 198), (225, 210, 185)), lambda t: parke(t, (160, 105, 70)))
    rng = np.random.default_rng(11)
    for x0, x1 in [(210, 470), (810, 1070)]:
        raf_dolabi(t, x0, x1, 60, 466, [150, 240, 330, 420], (150, 100, 65), (200, 160, 120))
        for y in (150, 240):
            kitaplar(t, x0 + 16, x1 - 16, y, rng)
    t.kutu(520, 50, 760, 100, (150, 100, 65, 255), r=10)
    yazi(t, "KÜTÜPHANE", 640, 76, 28, (255, 245, 220, 255))
    # Okuma masası, sandalyeler ve küre
    masa(t, 540, 740, 360, 470, (200, 140, 90))
    sandalye(t, 510, 476, (90, 150, 220))
    sandalye(t, 770, 476, (90, 150, 220))
    t.elips(600, 290, 660, 350, (100, 170, 230, 255), cizgi=2, kure=True)
    t.kutu(624, 346, 636, 362, (200, 160, 80, 255), r=2, cizgi=2)
    return t.bitir()


def pastane():
    t = oda_kur(((255, 238, 225), (250, 225, 210)), ((250, 226, 212), (240, 212, 198)), lambda t: karo(t, (255, 250, 245), (250, 190, 210), 12, 7))
    t.kutu(470, 40, 810, 90, (200, 100, 120, 255), r=12)
    yazi(t, "PASTANE", 640, 66, 34, (255, 255, 255, 255))
    # Cam vitrin: içindeki raflara tatlılar konur
    golge_birak(t, 480, 470, 270, 10)
    t.kutu(220, 200, 740, 466, (250, 250, 252, 255), r=10)
    t.kutu(232, 212, 728, 400, (220, 240, 250, 255), r=6, cizgi=2, guc=0.2)
    for y in (300, 390):
        t.kutu(236, y, 724, y + 8, (200, 225, 240, 255), r=2, cizgi=2, guc=0.4)
    t.kutu(232, 404, 728, 456, (250, 190, 210, 255), r=6, cizgi=2)
    # Fırın
    golge_birak(t, 920, 470, 120, 10)
    t.kutu(800, 200, 1050, 466, (230, 120, 90, 255), r=40)
    t.elips(850, 280, 1000, 420, (60, 40, 40, 255))
    t.elips(870, 330, 980, 410, (255, 170, 60, 255), cizgi=0, guc=0.6)
    for x in (880, 920, 960):
        t.elips(x - 18, 360, x + 18, 390, (220, 160, 90, 255), cizgi=2, guc=0.5)
    return t.bitir()


# --- Açık hava: gökyüzü, uzak ağaçlar, çim ---
def acik_hava(cim=(140, 205, 110), arka_ciz=None):
    t = Tuval(W, H)
    a = np.zeros((H * SS, W * SS, 4), np.float32)
    yy, xx = np.mgrid[0:H * SS, 0:W * SS] / SS
    a[..., :3] = np.array(GOK)
    a[..., 3] = 255
    ust = 330 - 30 * np.sin(xx / 120) - 18 * np.sin(xx / 47)
    a[yy > ust, :3] = np.array([150, 205, 110])
    # Çim düz yeşil. Ortada açık yeşil, kıvrık bir patika gibi bant var.
    a[yy > 400, :3] = np.array(cim)
    yol_ = (np.abs(yy - (560 + 40 * np.sin(xx / 210))) < 26 + (yy - 400) * 0.12) & (yy > 430)
    a[yol_, :3] = np.minimum(255, np.array(cim) * 1.12)
    t.im = Image.fromarray(a.astype(np.uint8), "RGBA")
    d = ImageDraw.Draw(t.im)
    d.line([(x * SS, (330 - 30 * np.sin(x / 120) - 18 * np.sin(x / 47)) * SS) for x in range(0, W + 1, 4)], fill=(80, 140, 60, 255), width=2 * SS)
    d.line([(0, 400 * SS), (W * SS, 400 * SS)], fill=(80, 140, 60, 255), width=2 * SS)
    for x, y, s in [(200, 80, 1.0), (900, 60, 0.8)]:
        bulut_ciz(t, x, y, s)
    # Ufukta çamlar ve ağaç tepeleri
    for x, h in [(120, 150), (560, 130), (1180, 160)]:
        cam_ciz(t, x, 402, h)
    if arka_ciz:
        arka_ciz(t)
    return t


def agac_ciz(t, x, alt, r=80, elma=True):
    golge_birak(t, x, alt, r * 0.8, 12)
    agac_tam(t, x, alt, r * 1.15, elma=elma)


def cicek_tarhi(t, x0, x1, y, rng):
    for x in range(int(x0), int(x1), 26):
        renk = [(250, 120, 160), (255, 210, 70), (160, 130, 240), (250, 250, 250)][int(rng.integers(0, 4))]
        yy = y + int(rng.integers(-6, 6))
        t.cizgi([(x + 10, yy + 10), (x + 10, yy + 30)], (80, 160, 60, 255), 3)
        t.elips(x, yy - 4, x + 22, yy + 18, a(renk), cizgi=2, guc=0.6)
        t.elips(x + 7, yy + 3, x + 15, yy + 11, (255, 240, 180, 255), cizgi=0, guc=0)


def ev_duvari(t, renk, kapi_renk):
    """Sol kenarda evin arka duvarı ve arka kapısı."""
    t.cokgen([(0, 60), (200, 120), (200, 560), (0, 600)], a(renk))
    t.cokgen([(0, 40), (230, 104), (230, 128), (0, 70)], (200, 90, 80, 255))
    t.cokgen([(48, 300), (152, 318), (152, 552), (48, 574)], a(kapi_renk))
    t.elips(130, 430, 146, 446, (255, 210, 80, 255), cizgi=2, kure=True)
    t.cokgen([(60, 160), (140, 174), (140, 250), (60, 240)], (165, 215, 245, 255), cizgi=3, guc=0.3)


def sag_kapi(t, renk=(250, 250, 250)):
    """Sağ kenarda bahçe çiti ve kapısı."""
    citler(t, 1040, 1280, 380, 470, renk, bos=(1120, 1240))
    bahce_kapisi(t, 1122, 1238, 372, 560, renk)


def sol_kapi(t, renk=(90, 150, 110)):
    citler(t, 0, 240, 380, 470, renk, bos=(40, 160))
    bahce_kapisi(t, 42, 158, 372, 560, renk)


def bahce1():
    def arka(t):
        citler(t, 200, 1100, 360, 430)
        agac_ciz(t, 330, 440, 70)
    t = acik_hava(arka_ciz=arka)
    ev_duvari(t, (255, 236, 205), (230, 110, 90))
    sag_kapi(t)
    rng = np.random.default_rng(2)
    cicek_tarhi(t, 220, 1100, 430, rng)
    # Salıncak çerçevesi (ip ve oturak oyunda çizilir)
    golge_birak(t, 520, 470, 140, 12)
    t.cokgen([(390, 470), (410, 190), (426, 190), (408, 470)], (230, 90, 80, 255), cizgi=3, guc=0.5)
    t.cokgen([(650, 470), (630, 190), (614, 190), (632, 470)], (230, 90, 80, 255), cizgi=3, guc=0.5)
    t.kutu(396, 178, 644, 196, (240, 180, 60, 255), r=6)
    # Kaydırak: merdiven solda, kayma yolu sağa iner (js/veri.js bahce1 kaydırak noktası)
    golge_birak(t, 840, 480, 170, 12)
    t.kutu(690, 230, 704, 480, (130, 200, 120, 255), r=4, cizgi=2)
    t.kutu(736, 230, 750, 480, (130, 200, 120, 255), r=4, cizgi=2)
    for y in range(254, 470, 28):
        t.kutu(698, y, 742, y + 8, (130, 200, 120, 255), r=3, cizgi=2, guc=0.3)
    t.kutu(680, 216, 772, 236, (130, 200, 120, 255), r=6)
    t.cokgen([(750, 222), (776, 222), (980, 452), (1010, 452), (1010, 478), (960, 478)], (160, 120, 230, 255))
    # Bahçe masası ve sandalye
    masa(t, 250, 360, 400, 480, (250, 250, 250), yuvarlak=True)
    sandalye(t, 230, 486, (90, 160, 230))
    for x in (1060,):
        t.kutu(x - 30, 430, x + 30, 480, (220, 110, 70, 255), r=8)
        t.elips(x - 40, 380, x + 40, 440, (95, 180, 85, 255), kure=True)
    return t.bitir()


def bahce2():
    def arka(t):
        for x in range(180, 1120, 60):
            t.elips(x - 40, 360, x + 40, 440, (110, 190, 95, 255), kure=True)
    t = acik_hava(cim=(150, 210, 120), arka_ciz=arka)
    ev_duvari(t, (252, 205, 190), (80, 160, 120))
    sag_kapi(t, (200, 150, 100))
    rng = np.random.default_rng(4)
    cicek_tarhi(t, 220, 1100, 440, rng)
    # Kaydırak: merdiven solda, kayma yolu sağa iner
    golge_birak(t, 520, 480, 170, 12)
    t.kutu(370, 230, 384, 480, (120, 160, 220, 255), r=4, cizgi=2)
    t.kutu(416, 230, 430, 480, (120, 160, 220, 255), r=4, cizgi=2)
    for y in range(254, 470, 28):
        t.kutu(378, y, 422, y + 8, (120, 160, 220, 255), r=3, cizgi=2, guc=0.3)
    t.kutu(360, 216, 452, 236, (120, 160, 220, 255), r=6)
    t.cokgen([(430, 222), (456, 222), (660, 452), (690, 452), (690, 478), (640, 478)], (250, 130, 70, 255))
    # Şemsiyeli masa ve sandalye
    t.cokgen([(780, 250), (980, 250), (880, 180)], (250, 120, 150, 255))
    t.kutu(874, 250, 886, 390, (200, 200, 210, 255), r=3, cizgi=2)
    masa(t, 800, 960, 390, 480, (200, 140, 90))
    sandalye(t, 1010, 486, (250, 200, 70))
    return t.bitir()


def park():
    def arka(t):
        for x, r in [(260, 70), (520, 60), (1040, 80)]:
            agac_ciz(t, x, 430, r)
    t = acik_hava(arka_ciz=arka)
    sol_kapi(t)
    rng = np.random.default_rng(9)
    cicek_tarhi(t, 260, 1200, 450, rng)
    # Fıskiye havuzu
    golge_birak(t, 700, 480, 200, 14)
    t.elips(520, 400, 880, 486, (180, 190, 205, 255))
    t.elips(540, 410, 860, 470, (120, 190, 240, 255), cizgi=2, guc=0.4)
    t.kutu(686, 330, 714, 440, (180, 190, 205, 255), r=8)
    t.elips(650, 320, 750, 344, (180, 190, 205, 255))
    # Bank
    golge_birak(t, 1050, 482, 110, 10)
    for x in (970, 1110):
        t.kutu(x, 430, x + 14, 480, (90, 100, 120, 255), r=4)
    t.kutu(950, 340, 1150, 360, (200, 130, 80, 255), r=6)
    t.kutu(950, 370, 1150, 390, (200, 130, 80, 255), r=6)
    t.kutu(950, 420, 1150, 440, (200, 130, 80, 255), r=6)
    return t.bitir()


def oyun_alani():
    def arka(t):
        citler(t, 240, 1280, 360, 430, (250, 180, 80))
    t = acik_hava(cim=(150, 210, 120), arka_ciz=arka)
    sol_kapi(t, (250, 180, 80))
    # Kum zemini
    golge_birak(t, 640, 600, 400, 20, guc=40)
    # Salıncak çerçevesi
    golge_birak(t, 420, 470, 140, 12)
    t.cokgen([(290, 470), (310, 190), (326, 190), (308, 470)], (90, 150, 220, 255), cizgi=3, guc=0.5)
    t.cokgen([(550, 470), (530, 190), (514, 190), (532, 470)], (90, 150, 220, 255), cizgi=3, guc=0.5)
    t.kutu(296, 178, 544, 196, (250, 200, 60, 255), r=6)
    # Kaydırak
    golge_birak(t, 830, 480, 170, 12)
    t.kutu(680, 230, 694, 480, (240, 90, 90, 255), r=4, cizgi=2)
    t.kutu(726, 230, 740, 480, (240, 90, 90, 255), r=4, cizgi=2)
    for y in range(254, 470, 28):
        t.kutu(688, y, 732, y + 8, (240, 90, 90, 255), r=3, cizgi=2, guc=0.3)
    t.kutu(670, 216, 762, 236, (240, 90, 90, 255), r=6)
    t.cokgen([(740, 222), (766, 222), (970, 452), (1000, 452), (1000, 478), (950, 478)], (255, 210, 60, 255))
    # Kum havuzu
    golge_birak(t, 1130, 486, 110, 10)
    t.kutu(1030, 440, 1240, 486, (200, 150, 100, 255), r=14)
    t.elips(1040, 446, 1230, 476, (245, 215, 150, 255), cizgi=2, guc=0.4)
    return t.bitir()


MEKANLAR = {
    "yatak": yatak_odasi, "bahce1": bahce1, "ev2-salon": ev2_salon, "ev2-cocuk": ev2_cocuk, "bahce2": bahce2,
    "ev3-oda": ev3_oda, "park": park, "oyun": oyun_alani, "okul": okul, "kafe": kafe, "market": market,
    "oyuncakci": oyuncakci, "hastane": hastane, "kuafor": kuafor, "kutuphane": kutuphane, "pastane": pastane,
}


def main():
    sec = sys.argv[1:] or list(MEKANLAR)
    for ad in sec:
        MEKANLAR[ad]().convert("RGB").save(yol("mekan", ad + ".jpg"), quality=86)
        print(ad)


if __name__ == "__main__":
    main()
