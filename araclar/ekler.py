"""Ev ve sokak yenilikleri için resimler: açılan dolaplar, mutfak eşyaları, kıyafetler, köpek ve araçlar.

Kullanım: python3 araclar/ekler.py
Çıktı:
  cizimler/mekan/tv-dolabi-acik.png, mutfak-dolap-acik.png, gardirop-acik.png  (açık dolaplar)
  cizimler/esya/<ad>.png       tencere, tava, bardak, kumanda, elbise(-mor), tisort(-sari, -yesil), pantolon(-pembe, -kahve), sapka
  cizimler/hacimli/kopek.png   evcil köpek
  cizimler/dunya/arac-*.png    sokaktan geçen araçlar
Dolapların ekrandaki sol üst köşesi (x0, y0) çalışınca yazılır. js/veri.js bu sayıları kullanır.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from uret import KALEM, W, H, Tuval, kirp, yol  # noqa: E402


def kaydet(im, *p):
    kutu = im.getbbox()
    im.crop(kutu).save(yol(*p))
    print(p[-1], "kutusu:", kutu)


# --- Açık dolaplar: oda resminin üstüne konur ---
def tv_dolabi_acik():
    """Salondaki TV dolabı. İki kapak iki yana açılır. İçinde bir raf var."""
    t = Tuval(W, H)
    t.kutu(770, 370, 1000, 450, (175, 120, 80, 255), r=8)
    t.kutu(782, 380, 988, 442, (105, 65, 40, 255), r=5, cizgi=2, guc=0.3)
    t.kutu(782, 408, 988, 414, (175, 120, 80, 255), r=2, cizgi=2, guc=0.4)
    for x0, x1 in [(770, 716), (1000, 1054)]:
        t.cokgen([(x0, 378), (x1, 366), (x1, 458), (x0, 446)], (195, 140, 95, 255))
        kx = x1 + (8 if x1 < x0 else -8)
        t.elips(kx - 5, 405, kx + 5, 415, (250, 205, 80, 255), cizgi=2, kure=True)
    for x in (785, 970):
        t.kutu(x, 448, x + 15, 462, (120, 80, 50, 255), r=3, cizgi=2)
    return t.bitir()


def mutfak_dolap_acik():
    """Mutfakta tezgahın altındaki ilk dolap. Diğer dolaplar aynı resmi 100 piksel arayla kullanır."""
    t = Tuval(W, H)
    t.kutu(410, 362, 502, 446, (55, 90, 125, 255), r=6, cizgi=2, guc=0.3)
    t.kutu(412, 402, 500, 407, (140, 190, 225, 255), r=2, cizgi=2, guc=0.4)
    t.cokgen([(410, 364), (362, 354), (362, 456), (410, 444)], (140, 190, 225, 255))
    t.elips(368, 395, 380, 407, (250, 205, 80, 255), cizgi=2, kure=True)
    return t.bitir()


def gardirop_acik():
    """Yatak odasındaki dolap. İki kapak açılır. Üstte raf, altında askı borusu."""
    t = Tuval(W, H)
    t.kutu(800, 140, 1000, 466, (200, 150, 230, 255), r=10)
    t.kutu(812, 152, 988, 454, (120, 85, 150, 255), r=6, cizgi=2, guc=0.3)
    t.kutu(812, 206, 988, 213, (200, 150, 230, 255), r=2, cizgi=2, guc=0.4)
    t.kutu(816, 232, 984, 238, (200, 200, 210, 255), r=3, cizgi=2, guc=0.6)
    for x in (850, 950):
        t.cizgi([(x, 236), (x, 250)], (210, 210, 220, 255), 3)
        t.cizgi([(x - 30, 262), (x, 250), (x + 30, 262)], (210, 210, 220, 255), 3)
    t.kutu(812, 400, 988, 406, (200, 150, 230, 255), r=2, cizgi=2, guc=0.4)
    for x0, x1 in [(800, 740), (1000, 1060)]:
        t.cokgen([(x0, 150), (x1, 128), (x1, 478), (x0, 456)], (215, 175, 240, 255))
        kx = x1 + (10 if x1 < x0 else -10)
        t.elips(kx - 7, 290, kx + 7, 304, (250, 205, 80, 255), cizgi=2, kure=True)
    return t.bitir()


# --- Eşyalar ---
def esya_tencere():
    t = Tuval(220, 150)
    for x in (12, 178):
        t.kutu(x, 52, x + 30, 68, (90, 90, 100, 255), r=6)
    t.kutu(30, 40, 190, 145, (230, 80, 70, 255), r=16)
    t.kutu(30, 72, 190, 84, (255, 255, 255, 255), r=2, cizgi=0, guc=0.5)
    t.elips(24, 26, 196, 52, (240, 100, 90, 255))
    t.elips(96, 8, 124, 30, (90, 90, 100, 255), kure=True)
    return kirp(t.bitir())


def esya_tava():
    t = Tuval(300, 90)
    t.kutu(170, 34, 296, 52, (120, 80, 50, 255), r=8)
    t.elips(6, 14, 186, 54, (60, 60, 70, 255))
    t.kutu(14, 34, 178, 82, (60, 60, 70, 255), r=18)
    t.elips(22, 20, 170, 46, (110, 110, 120, 255), cizgi=2, guc=0.5)
    return kirp(t.bitir())


def esya_bardak():
    t = Tuval(100, 150)
    t.cokgen([(10, 10), (90, 10), (80, 145), (20, 145)], (220, 240, 250, 255))
    t.cokgen([(16, 60), (84, 60), (79, 138), (21, 138)], (120, 190, 245, 255), cizgi=0, guc=0.5)
    t.cizgi([(28, 30), (32, 120)], (255, 255, 255, 220), 5)
    return kirp(t.bitir())


def esya_kumanda():
    t = Tuval(70, 170)
    t.kutu(6, 6, 64, 164, (60, 60, 75, 255), r=14)
    t.elips(22, 18, 48, 44, (230, 60, 60, 255), cizgi=2, kure=True)
    for i in range(3):
        for j in range(2):
            x, y = 16 + j * 24, 64 + i * 28
            t.elips(x, y, x + 16, y + 16, (200, 200, 215, 255), cizgi=2, kure=True)
    return kirp(t.bitir())


def esya_elbise(renk=(245, 120, 170, 255)):
    t = Tuval(200, 240)
    t.cokgen([(70, 10), (130, 10), (150, 95), (195, 230), (5, 230), (50, 95)], renk)
    t.cokgen([(55, 90), (145, 90), (150, 108), (50, 108)], (255, 230, 120, 255), cizgi=2)
    for x, y in [(70, 150), (120, 140), (95, 190), (150, 195), (45, 200)]:
        t.elips(x - 9, y - 9, x + 9, y + 9, (255, 255, 255, 255), cizgi=0, guc=0.5)
    t.cizgi([(80, 10), (100, 30), (120, 10)], KALEM, 3)
    return kirp(t.bitir())


def esya_tisort(renk=(80, 160, 235, 255)):
    t = Tuval(240, 200)
    t.cokgen([(80, 10), (160, 10), (230, 50), (205, 95), (180, 80), (180, 195), (60, 195), (60, 80), (35, 95), (10, 50)],
             renk)
    t.cizgi([(95, 10), (120, 32), (145, 10)], KALEM, 3)
    x, y = 120, 115
    t.cokgen([(x, y - 30), (x + 9, y - 9), (x + 30, y - 8), (x + 13, y + 6), (x + 18, y + 28), (x, y + 15),
              (x - 18, y + 28), (x - 13, y + 6), (x - 30, y - 8), (x - 9, y - 9)], (255, 215, 80, 255), cizgi=2)
    return kirp(t.bitir())


def esya_pantolon(renk=(70, 110, 190, 255)):
    t = Tuval(200, 260)
    t.cokgen([(30, 10), (170, 10), (190, 250), (112, 250), (100, 90), (88, 250), (10, 250)], renk)
    t.kutu(28, 8, 172, 34, renk, r=6)
    t.elips(92, 14, 108, 30, (255, 210, 80, 255), cizgi=2, kure=True)
    t.cizgi([(100, 34), (100, 80)], (70, 50, 40, 255), 2)
    for x0, x1 in [(14, 86), (114, 186)]:
        t.cizgi([(x0, 232), (x1, 232)], (70, 50, 40, 255), 2)
    return kirp(t.bitir())


def esya_sapka():
    t = Tuval(240, 130)
    t.elips(6, 80, 234, 124, (250, 200, 90, 255))
    t.kutu(60, 14, 180, 104, (250, 200, 90, 255), r=40)
    t.kutu(60, 70, 180, 90, (230, 70, 90, 255), r=2, cizgi=2, guc=0.5)
    t.elips(150, 56, 178, 84, (255, 255, 255, 255), cizgi=2, kure=True)
    return kirp(t.bitir())


# --- Köpek: yandan, sağa bakar ---
def kopek():
    t = Tuval(460, 380)
    renk, koyu, acik = (225, 165, 95, 255), (170, 110, 60, 255), (250, 230, 200, 255)
    # Kuyruk ve arka bacaklar
    t.cokgen([(70, 190), (20, 120), (36, 112), (92, 176)], renk)
    for x in (95, 140):
        t.kutu(x, 230, x + 40, 360, koyu, r=16)
    # Gövde
    t.elips(50, 150, 330, 290, renk)
    t.elips(120, 215, 290, 285, acik, cizgi=0, guc=0.5)
    # Ön bacaklar
    for x in (235, 280):
        t.kutu(x, 230, x + 40, 360, renk, r=16)
        t.elips(x - 4, 340, x + 48, 372, acik, cizgi=3)
    for x in (95, 140):
        t.elips(x - 4, 340, x + 48, 372, acik, cizgi=3)
    # Tasma
    t.kutu(282, 170, 322, 196, (230, 60, 70, 255), r=6)
    t.elips(292, 190, 312, 212, (255, 210, 60, 255), cizgi=2, kure=True)
    # Baş
    t.elips(250, 40, 420, 200, renk)
    t.elips(350, 110, 452, 190, acik)
    t.elips(422, 112, 452, 138, (40, 35, 35, 255), cizgi=2, kure=True)
    t.elips(345, 82, 371, 110, (40, 35, 35, 255), cizgi=0, guc=0.6)
    t.elips(352, 86, 360, 94, (255, 255, 255, 255), cizgi=0, guc=0)
    t.cizgi([(398, 172), (414, 180), (432, 172)], KALEM, 4)
    t.elips(404, 176, 426, 204, (240, 110, 130, 255), cizgi=2)
    # Kulak: başın arkasında aşağı sarkar
    t.cokgen([(262, 60), (310, 44), (300, 160), (258, 178), (240, 120)], koyu)
    return kirp(t.bitir())


# --- Araçlar: sağa bakar ---
def araba(govde, ust):
    t = Tuval(440, 220)
    t.cokgen([(110, 90), (150, 26), (290, 26), (340, 90)], ust)
    t.cokgen([(140, 84), (166, 38), (216, 38), (216, 84)], (200, 235, 250, 255), cizgi=2)
    t.cokgen([(228, 84), (228, 38), (282, 38), (318, 84)], (200, 235, 250, 255), cizgi=2)
    t.kutu(14, 82, 430, 170, govde, r=34)
    t.elips(404, 104, 428, 128, (255, 240, 150, 255), cizgi=2, kure=True)
    t.kutu(16, 104, 36, 124, (240, 80, 70, 255), r=4, cizgi=2)
    t.kutu(210, 100, 240, 108, (70, 50, 40, 255), r=3, cizgi=0, guc=0.3)
    for x in (100, 340):
        t.elips(x - 44, 128, x + 44, 216, (50, 50, 60, 255), kure=True)
        t.elips(x - 18, 154, x + 18, 190, (200, 200, 210, 255), cizgi=2)
    return kirp(t.bitir())


def otobus():
    t = Tuval(700, 300)
    t.kutu(10, 20, 690, 240, (250, 200, 50, 255), r=30)
    for i in range(6):
        x = 40 + i * 100
        t.kutu(x, 46, x + 80, 120, (200, 235, 250, 255), r=10, cizgi=2, guc=0.4)
    t.kutu(620, 46, 676, 200, (200, 235, 250, 255), r=10, cizgi=2, guc=0.4)
    t.kutu(10, 150, 690, 168, (230, 80, 60, 255), r=2, cizgi=2, guc=0.5)
    t.elips(664, 200, 688, 224, (255, 240, 150, 255), cizgi=2, kure=True)
    for x in (130, 560):
        t.elips(x - 50, 196, x + 50, 296, (50, 50, 60, 255), kure=True)
        t.elips(x - 20, 226, x + 20, 266, (200, 200, 210, 255), cizgi=2)
    return kirp(t.bitir())


def main():
    kaydet(tv_dolabi_acik(), "mekan", "tv-dolabi-acik.png")
    kaydet(mutfak_dolap_acik(), "mekan", "mutfak-dolap-acik.png")
    kaydet(gardirop_acik(), "mekan", "gardirop-acik.png")
    for ad, f in [("tencere", esya_tencere), ("tava", esya_tava), ("bardak", esya_bardak), ("kumanda", esya_kumanda),
                  ("elbise", esya_elbise), ("tisort", esya_tisort), ("sapka", esya_sapka)]:
        f().save(yol("esya", ad + ".png"))
    # Renk çeşitleri. Renkler js/veri.js'deki "renk" değeriyle aynıdır: giyince karakterin kıyafeti bu renge boyanır.
    esya_tisort((255, 205, 60, 255)).save(yol("esya", "tisort-sari.png"))
    esya_tisort((110, 200, 100, 255)).save(yol("esya", "tisort-yesil.png"))
    esya_elbise((165, 120, 230, 255)).save(yol("esya", "elbise-mor.png"))
    esya_pantolon().save(yol("esya", "pantolon.png"))
    esya_pantolon((240, 120, 160, 255)).save(yol("esya", "pantolon-pembe.png"))
    esya_pantolon((170, 115, 70, 255)).save(yol("esya", "pantolon-kahve.png"))
    kopek().save(yol("hacimli", "kopek.png"))
    araba((230, 70, 70, 255), (240, 110, 100, 255)).save(yol("dunya", "arac-araba.png"))
    araba((255, 205, 60, 255), (255, 220, 110, 255)).save(yol("dunya", "arac-taksi.png"))
    araba((90, 170, 235, 255), (130, 195, 245, 255)).save(yol("dunya", "arac-mavi.png"))
    otobus().save(yol("dunya", "arac-otobus.png"))
    print("tamam")


if __name__ == "__main__":
    main()
