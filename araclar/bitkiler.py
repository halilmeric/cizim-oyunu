"""Bahçede dikili çiçekler. Her çiçeğin üç hali var: filiz, tomurcuk ve açmış çiçek.

Kullanım: python3 araclar/bitkiler.py
Çıktı: cizimler/bitki/<tür>-<hal>.png  (hal: 0 filiz, 1 tomurcuk, 2 çiçek)
Üç hal aynı kutuyla kırpılır: oyunda resim değişince bitki yerinden oynamaz.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from uret import Tuval, yol  # noqa: E402

YESIL, KOYU = (95, 175, 80, 255), (70, 140, 60, 255)
TOPRAK = (150, 100, 65, 255)


def sap(t, boy):
    """Toprak tümseği, sap ve iki yaprak. Sapın tepesi döner."""
    ust = 250 - boy
    t.kutu(97, ust, 103, 250, YESIL, r=3, cizgi=2, guc=0.3)
    yk = 250 - boy * 0.45
    t.cokgen([(100, yk), (60, yk - 30), (50, yk - 52), (78, yk - 40)], YESIL, cizgi=2)
    t.cokgen([(100, yk + 12), (140, yk - 18), (150, yk - 40), (122, yk - 28)], KOYU, cizgi=2)
    t.elips(40, 236, 160, 268, TOPRAK)
    return ust


def lale(t, hal):
    ust = sap(t, [60, 120, 150][hal])
    renk = (235, 60, 70, 255)
    if hal == 1:
        t.elips(88, ust - 30, 112, ust + 6, renk)
    if hal == 2:
        t.cokgen([(70, ust - 44), (84, ust - 20), (100, ust - 48), (116, ust - 20), (130, ust - 44), (130, ust - 6),
                  (116, ust + 8), (84, ust + 8), (70, ust - 6)], renk)


def papatya(t, hal):
    ust = sap(t, [55, 110, 140][hal])
    if hal == 1:
        t.elips(88, ust - 22, 112, ust + 4, (250, 250, 240, 255))
    if hal == 2:
        import math
        for i in range(10):
            a = i * math.pi / 5
            x, y = 100 + math.cos(a) * 26, ust - 16 + math.sin(a) * 26
            t.elips(x - 13, y - 13, x + 13, y + 13, (255, 255, 250, 255), cizgi=2, guc=0.4)
        t.elips(86, ust - 30, 114, ust - 2, (255, 200, 50, 255), kure=True)


def aycicegi(t, hal):
    ust = sap(t, [65, 140, 175][hal])
    if hal == 1:
        t.elips(84, ust - 30, 116, ust + 4, (120, 170, 70, 255))
        t.elips(92, ust - 22, 108, ust - 6, (255, 210, 60, 255), cizgi=2, guc=0)
    if hal == 2:
        import math
        for i in range(12):
            a = i * math.pi / 6
            x, y = 100 + math.cos(a) * 36, ust - 22 + math.sin(a) * 36
            t.elips(x - 15, y - 15, x + 15, y + 15, (255, 205, 50, 255), cizgi=2, guc=0.4)
        t.elips(76, ust - 46, 124, ust + 2, (130, 85, 45, 255))
        for dx, dy in [(-8, -8), (8, -8), (0, 4), (-10, 6), (10, 6)]:
            t.elips(97 + dx, ust - 25 + dy, 103 + dx, ust - 19 + dy, (90, 55, 30, 255), cizgi=0, guc=0)


def gul(t, hal):
    ust = sap(t, [55, 115, 145][hal])
    renk = (250, 120, 170, 255)
    if hal == 1:
        t.elips(88, ust - 26, 112, ust + 4, renk)
        t.cokgen([(86, ust - 2), (100, ust - 14), (114, ust - 2), (100, ust + 6)], YESIL, cizgi=2)
    if hal == 2:
        t.birlesik([(84, ust - 16, 20), (116, ust - 16, 20), (100, ust - 30, 22), (100, ust - 4, 20)], renk)
        t.elips(88, ust - 30, 112, ust - 8, (240, 90, 145, 255), cizgi=2)
        t.cizgi([(92, ust - 20), (100, ust - 14), (108, ust - 22)], (200, 60, 110, 255), 3)


TURLER = {"lale": lale, "papatya": papatya, "aycicegi": aycicegi, "gul": gul}


def main():
    os.makedirs(yol("bitki"), exist_ok=True)
    for ad, f in TURLER.items():
        hal = []
        for h in range(3):
            t = Tuval(200, 280)
            f(t, h)
            hal.append(t.bitir())
        x0, y0, x1, y1 = zip(*[im.getbbox() for im in hal])
        kutu = (min(x0), min(y0), max(x1), max(y1))
        # Yatayda ortalı kalsın diye kutu sapın çevresinde simetrik olur.
        yari = max(100 - kutu[0], kutu[2] - 100)
        kutu = (100 - yari, kutu[1], 100 + yari, kutu[3])
        for h, im in enumerate(hal):
            im.crop(kutu).save(yol("bitki", f"{ad}-{h}.png"))
        print(ad)


if __name__ == "__main__":
    main()
