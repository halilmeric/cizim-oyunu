"""Mekanlarda çalışan kişiler: doktor, kuaför, garson, kasiyer ve diğerleri.

Kullanım: python3 araclar/calisanlar.py
Çıktı: cizimler/calisan/<meslek>.png ve <meslek>-konus.png (ağzı açık hali).
Her kişi önden bakar, mesleğine göre giyinir. İleride kızın çizimleri bunların yerine konabilir.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from uret import KALEM, Tuval, yol  # noqa: E402

BEYAZ = (250, 250, 250, 255)
TEN = [(250, 215, 185, 255), (225, 175, 135, 255), (175, 120, 85, 255)]


def a(r):
    return (*r[:3], 255)


def kisi(t, ten, sac, gomlek, pantolon, ayakkabi=(70, 60, 60), uzun_sac=False, etek=False, gozluk=False, konus=False,
         kisa_kol=False):
    """Önden bakan bir kişi. Kıyafetin üst katmanları (önlük, ceket) sonra çizilir."""
    ten, sac = a(ten), a(sac)
    if uzun_sac:
        t.kutu(70, 70, 230, 300, sac, r=60)
    # Bacaklar ve ayakkabılar
    for x in (98, 156):
        t.kutu(x, 390, x + 46, 556, a(pantolon) if not etek else ten, r=14)
        t.elips(x - 10, 538, x + 56, 580, a(ayakkabi))
    if etek:
        t.cokgen([(84, 360), (216, 360), (236, 470), (64, 470)], a(pantolon))
    else:
        t.kutu(92, 360, 208, 420, a(pantolon), r=16)
    # Kollar: kısa kolda ten görünür
    for x in (44, 216):
        t.kutu(x, 208, x + 40, 372, ten, r=18)
        if not kisa_kol:
            t.kutu(x, 208, x + 40, 340, a(gomlek), r=18)
        else:
            t.kutu(x, 208, x + 40, 268, a(gomlek), r=18)
        t.elips(x - 2, 350, x + 42, 392, ten)
    # Gövde ve boyun
    t.kutu(130, 168, 170, 212, ten, r=10)
    t.kutu(74, 198, 226, 392, a(gomlek), r=34)
    t.cokgen([(126, 200), (150, 236), (174, 200)], ten, cizgi=2, guc=0)
    # Baş
    t.elips(80, 40, 220, 190, ten)
    t.elips(68, 100, 92, 134, ten, cizgi=2)
    t.elips(208, 100, 232, 134, ten, cizgi=2)
    t.elips(80, 40, 220, 190, ten)
    # Saç: başın üstünde kapak
    t.birlesik([(118, 64, 40), (150, 52, 44), (184, 64, 40)], sac)
    t.cokgen([(84, 96), (96, 60), (204, 60), (216, 96), (190, 80), (150, 88), (110, 80)], sac, cizgi=0, guc=0.4)
    # Yüz
    for x in (124, 176):
        t.elips(x - 9, 104, x + 9, 124, (50, 40, 40, 255), cizgi=0, guc=0)
        t.elips(x - 4, 107, x + 2, 113, BEYAZ, cizgi=0, guc=0)
    for x in (108, 192):
        t.elips(x - 13, 132, x + 13, 146, (245, 150, 150, 255), cizgi=0, guc=0)
    if konus:
        t.elips(134, 140, 166, 172, (150, 50, 60, 255), cizgi=3, guc=0)
        t.elips(142, 160, 158, 170, (240, 120, 130, 255), cizgi=0, guc=0)
    else:
        t.cizgi([(132, 148), (142, 158), (158, 158), (168, 148)], KALEM, 4)
    if gozluk:
        for x in (124, 176):
            t.elips(x - 20, 96, x + 20, 132, (0, 0, 0, 0), cizgi=3, guc=0)
        t.cizgi([(144, 112), (156, 112)], KALEM, 3)


# Her meslek: (ten, saç, gömlek, pantolon, seçenekler, üstüne çizilenler)
def doktor(t, konus):
    kisi(t, TEN[0], (90, 60, 40), (120, 170, 230), (60, 80, 140), konus=konus)
    # Beyaz önlük: iki yanı önden açık, uzun
    t.cokgen([(74, 210), (136, 200), (140, 470), (70, 470)], BEYAZ)
    t.cokgen([(226, 210), (164, 200), (160, 470), (230, 470)], BEYAZ)
    for x in (44, 216):
        t.kutu(x, 208, x + 40, 344, BEYAZ, r=18)
    t.kutu(176, 260, 212, 300, BEYAZ, r=4, cizgi=2, guc=0.3)
    t.cizgi([(182, 262), (182, 250)], (60, 120, 230, 255), 4)
    # Steteskop boyunda
    t.cizgi([(122, 204), (116, 250), (126, 290)], (90, 90, 100, 255), 5)
    t.cizgi([(178, 204), (184, 250), (176, 290)], (90, 90, 100, 255), 5)
    t.elips(136, 280, 166, 310, (190, 195, 205, 255), cizgi=3, kure=True)
    # Alnında ayna
    t.kutu(88, 66, 212, 76, (90, 90, 100, 255), r=4, cizgi=0, guc=0)
    t.elips(130, 56, 170, 92, (215, 225, 235, 255), cizgi=3, kure=True)


def kuafor(t, konus):
    kisi(t, TEN[1], (160, 80, 200), (250, 150, 190), (60, 60, 70), uzun_sac=True, konus=konus)
    t.kutu(86, 250, 214, 450, (50, 50, 60, 255), r=18)
    t.cizgi([(96, 252), (126, 204)], (50, 50, 60, 255), 6)
    t.cizgi([(204, 252), (174, 204)], (50, 50, 60, 255), 6)
    t.kutu(110, 300, 190, 340, (80, 80, 95, 255), r=8, cizgi=2, guc=0.3)
    t.cizgi([(130, 290), (130, 310)], (240, 200, 80, 255), 5)  # cepte tarak
    t.cizgi([(144, 292), (144, 314)], (250, 120, 160, 255), 5)
    # Sağ elde makas
    t.cizgi([(236, 360), (270, 300)], (180, 185, 195, 255), 6)
    t.cizgi([(244, 362), (286, 312)], (180, 185, 195, 255), 6)
    for x, y in [(226, 380), (246, 384)]:
        t.elips(x - 10, y - 10, x + 10, y + 10, (0, 0, 0, 0), cizgi=4, guc=0)


def garson(t, konus):
    kisi(t, TEN[2], (40, 30, 30), BEYAZ, (60, 50, 50), konus=konus)
    t.kutu(86, 300, 214, 460, (150, 95, 60, 255), r=14)
    t.kutu(78, 296, 222, 312, (150, 95, 60, 255), r=6, cizgi=2)
    t.cokgen([(150, 210), (124, 198), (124, 224)], (220, 50, 60, 255), cizgi=2)
    t.cokgen([(150, 210), (176, 198), (176, 224)], (220, 50, 60, 255), cizgi=2)
    t.elips(142, 202, 158, 218, (240, 80, 80, 255), cizgi=2)
    # Sol elde tepsi ve fincan
    t.kutu(6, 344, 104, 356, (190, 195, 205, 255), r=6, cizgi=3)
    t.kutu(36, 306, 74, 346, BEYAZ, r=8, cizgi=3)
    t.elips(70, 314, 90, 334, (0, 0, 0, 0), cizgi=4, guc=0)
    t.cizgi([(48, 300), (44, 286), (50, 274)], (200, 200, 210, 255), 3)


def kasiyer(t, konus):
    kisi(t, TEN[0], (230, 170, 60), (255, 220, 90), (70, 80, 120), uzun_sac=True, konus=konus, kisa_kol=True)
    t.kutu(80, 214, 220, 440, (70, 170, 90, 255), r=20)
    t.kutu(120, 214, 180, 250, (255, 220, 90, 255), r=6, cizgi=2, guc=0)
    t.kutu(158, 272, 206, 300, BEYAZ, r=4, cizgi=2, guc=0.3)
    t.cizgi([(166, 286), (198, 286)], (70, 170, 90, 255), 3)
    # Yeşil şapka
    t.kutu(92, 30, 208, 76, (70, 170, 90, 255), r=26)
    t.kutu(150, 64, 238, 80, (70, 170, 90, 255), r=8)


def oyuncakci(t, konus):
    kisi(t, TEN[1], (120, 70, 40), (240, 90, 80), (70, 120, 210), konus=konus)
    for y in (240, 290, 340):
        t.kutu(76, y, 224, y + 18, (255, 215, 80, 255), r=4, cizgi=0, guc=0)
    for x in (44, 216):
        for y in (240, 290):
            t.kutu(x + 2, y, x + 38, y + 16, (255, 215, 80, 255), r=4, cizgi=0, guc=0)
    # Tulum
    t.kutu(90, 290, 210, 430, (70, 120, 210, 255), r=16)
    t.kutu(108, 270, 192, 310, (70, 120, 210, 255), r=8)
    for x in (100, 200):
        t.cizgi([(x, 210), (x + (12 if x < 150 else -12), 276)], (70, 120, 210, 255), 9)
    # Pervaneli şapka
    t.elips(96, 36, 204, 92, (255, 215, 80, 255))
    t.cokgen([(150, 64), (150, 36), (96, 64)], (240, 90, 80, 255), cizgi=2)
    t.cokgen([(150, 64), (150, 36), (204, 64)], (70, 170, 230, 255), cizgi=2)
    t.cizgi([(150, 38), (150, 22)], KALEM, 4)
    t.cokgen([(150, 22), (110, 12), (110, 30)], (240, 90, 80, 255), cizgi=2)
    t.cokgen([(150, 22), (190, 12), (190, 30)], (70, 170, 90, 255), cizgi=2)


def kutuphaneci(t, konus):
    kisi(t, TEN[2], (200, 200, 205), BEYAZ, (90, 80, 120), etek=True, gozluk=True, konus=konus)
    t.cokgen([(74, 214), (138, 204), (138, 392), (74, 392)], (150, 100, 200, 255))
    t.cokgen([(226, 214), (162, 204), (162, 392), (226, 392)], (150, 100, 200, 255))
    for x in (44, 216):
        t.kutu(x, 208, x + 40, 344, (150, 100, 200, 255), r=18)
    # Saç topuzu
    t.elips(124, 6, 176, 52, (200, 200, 205, 255))
    # Sol kolunda kitap
    t.kutu(10, 300, 76, 380, (220, 70, 80, 255), r=6)
    t.kutu(18, 308, 70, 314, (255, 230, 150, 255), r=2, cizgi=0, guc=0)


def pastaci(t, konus):
    kisi(t, TEN[0], (150, 90, 50), BEYAZ, (60, 60, 70), konus=konus)
    for y in (240, 290, 340):
        for x in (130, 170):
            t.elips(x - 7, y - 7, x + 7, y + 7, (200, 200, 210, 255), cizgi=2, guc=0)
    t.cokgen([(118, 200), (182, 200), (150, 236)], (240, 90, 120, 255), cizgi=2)
    # Aşçı şapkası
    t.kutu(100, 50, 200, 86, BEYAZ, r=8)
    t.birlesik([(114, 38, 26), (150, 30, 30), (186, 38, 26)], BEYAZ)
    # Sağ elde pasta
    t.kutu(214, 330, 296, 352, (200, 200, 210, 255), r=6, cizgi=3)
    t.kutu(222, 290, 288, 334, (255, 200, 215, 255), r=10)
    t.kutu(222, 290, 288, 304, BEYAZ, r=8, cizgi=2)
    t.elips(246, 272, 264, 290, (230, 50, 70, 255), cizgi=2, kure=True)


def ogretmen(t, konus):
    kisi(t, TEN[1], (60, 40, 30), BEYAZ, (110, 80, 60), uzun_sac=True, etek=True, gozluk=True, konus=konus)
    t.cokgen([(74, 214), (134, 204), (128, 392), (74, 392)], (80, 150, 120, 255))
    t.cokgen([(226, 214), (166, 204), (172, 392), (226, 392)], (80, 150, 120, 255))
    for x in (44, 216):
        t.kutu(x, 208, x + 40, 344, (80, 150, 120, 255), r=18)
    # Sağ elde çubuk ve sol elde kitap
    t.cizgi([(240, 370), (290, 220)], (200, 140, 80, 255), 7)
    t.kutu(14, 320, 70, 390, (70, 140, 230, 255), r=6)


def bahcivan(t, konus):
    kisi(t, TEN[2], (60, 40, 30), (220, 70, 70), (90, 150, 80), konus=konus)
    for x in range(84, 220, 26):
        t.cizgi([(x, 204), (x, 390)], (250, 230, 230, 255), 3)
    t.kutu(90, 280, 210, 430, (90, 150, 80, 255), r=16)
    t.kutu(108, 260, 192, 300, (90, 150, 80, 255), r=8)
    for x in (100, 200):
        t.cizgi([(x, 210), (x + (12 if x < 150 else -12), 266)], (90, 150, 80, 255), 9)
    # Hasır şapka
    t.elips(46, 52, 254, 92, (240, 200, 100, 255))
    t.kutu(96, 18, 204, 76, (240, 200, 100, 255), r=24)
    t.kutu(96, 56, 204, 70, (220, 80, 70, 255), r=4, cizgi=2)
    # Sağ elde kürek
    t.cizgi([(236, 380), (236, 250)], (180, 120, 70, 255), 8)
    t.cokgen([(220, 380), (252, 380), (250, 420), (236, 432), (222, 420)], (170, 175, 185, 255))


def gorevli(t, konus):
    kisi(t, TEN[0], (230, 170, 60), (255, 150, 60), (70, 110, 200), konus=konus, kisa_kol=True)
    t.kutu(92, 360, 208, 430, (70, 110, 200, 255), r=14)
    # Kırmızı şapka ve düdük
    t.kutu(92, 30, 208, 76, (230, 60, 70, 255), r=26)
    t.kutu(150, 64, 238, 80, (230, 60, 70, 255), r=8)
    t.cizgi([(126, 206), (150, 280), (174, 206)], (70, 110, 200, 255), 3)
    t.kutu(138, 274, 168, 296, (250, 210, 60, 255), r=8, cizgi=3)


MESLEKLER = {"doktor": doktor, "kuafor": kuafor, "garson": garson, "kasiyer": kasiyer, "oyuncakci": oyuncakci,
             "kutuphaneci": kutuphaneci, "pastaci": pastaci, "ogretmen": ogretmen, "bahcivan": bahcivan, "gorevli": gorevli}


def main():
    os.makedirs(yol("calisan"), exist_ok=True)
    for ad, f in MESLEKLER.items():
        # İki hal aynı kutuyla kırpılır: oyunda resim değişince kişi yerinden oynamaz.
        hal = []
        for konus in (False, True):
            t = Tuval(310, 600)
            f(t, konus)
            hal.append(t.bitir())
        kutu = hal[0].getbbox()
        hal[0].crop(kutu).save(yol("calisan", ad + ".png"))
        hal[1].crop(kutu).save(yol("calisan", ad + "-konus.png"))
        print(ad)


if __name__ == "__main__":
    main()
