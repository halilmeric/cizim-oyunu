"""Bir karakter çizimini hareketli parçalara böler.

Kullanım: python3 araclar/parcala.py cizimler/kedi.png cizimler/kedi
Parça sınırları aşağıdaki PARCALAR listesinde durur. Koordinatlar PNG pikselidir.
Çıktı: her parça için PNG ve parcalar.js (oyun bunu okur).
"""
import json, sys
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
a = np.array(im)
H, W = a.shape[:2]
Y, X = np.mgrid[0:H, 0:W]

# Her parça: ad, maske (piksel seçimi), dönme noktası, çizim sırası, hareket türü.
# Parçalar gövdenin biraz içine taşar. Gövde üstte çizilir ve ek yerini örter.
# Her karakterin kendi sınırları vardır. Anahtar: çıktı klasörünün adı.
def kedi():
    return [
        ("kuyruk",    (X > 326) & (Y >= 352) & (Y < 480),               (326, 455), -2, "kuyruk"),
        ("kol-sol",   (X < 158) & (Y > 250) & (Y < 372),                (152, 305), -1, "kol-sol"),
        ("kol-sag",   (X > 314) & (Y > 250) & (Y < 352),                (320, 305), -1, "kol-sag"),
        ("bacak-sol", (Y >= 425) & (X < 230) & ~((X > 326) & (Y < 480)), (185, 430), -1, "bacak-sol"),
        ("bacak-sag", (Y >= 425) & (X >= 226) & (X <= 340),             (270, 430), -1, "bacak-sag"),
        ("govde",     ~(((X < 142) & (Y > 250) & (Y < 372)) | ((X > 330) & (Y > 250) & (Y < 352))
                        | ((X > 336) & (Y >= 352)) | (Y >= 445)),        (W // 2, H), 0, "govde"),
    ]

def kiz():
    return [
        ("kol-sol",   (X < 175) & (Y > 270) & (Y < 370),                (172, 318), -1, "kol-sol"),
        ("kol-sag",   (X > 362) & (Y > 280) & (Y < 365),                (366, 322), -1, "kol-sag"),
        ("bacak-sol", (Y >= 445) & (X < 264),                           (215, 450), -1, "bacak-sol"),
        ("bacak-sag", (Y >= 445) & (X >= 260),                          (305, 450), -1, "bacak-sag"),
        ("govde",     ~(((X < 165) & (Y > 270) & (Y < 370)) | ((X > 372) & (Y > 280) & (Y < 365))
                        | (Y >= 455)),                                   (W // 2, H), 0, "govde"),
    ]

kid = out.rstrip("/").split("/")[-1]
PARCALAR = {"kedi": kedi, "kiz": kiz}[kid]()

liste = []
for ad, maske, pivot, z, hareket in PARCALAR:
    p = a.copy()
    p[..., 3] = np.where(maske, p[..., 3], 0)
    ys, xs = np.nonzero(p[..., 3] > 8)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray(p[y0:y1, x0:x1]).save(f"{out}/{ad}.png")
    liste.append({"ad": ad, "resim": f"{out}/{ad}.png", "x": int(x0), "y": int(y0),
                  "w": int(x1 - x0), "h": int(y1 - y0), "pivot": list(pivot), "z": z, "hareket": hareket})

veri = json.dumps({"genislik": W, "yukseklik": H, "parcalar": liste}, ensure_ascii=False, indent=1)
with open(f"{out}/parcalar.js", "w") as f:
    f.write("// araclar/parcala.py üretir. Elle değiştirme.\n")
    f.write(f"(window.KARAKTER_PARCALARI = window.KARAKTER_PARCALARI || {{}})[{json.dumps(kid)}] = {veri};\n")
print(json.dumps(liste, ensure_ascii=False))
