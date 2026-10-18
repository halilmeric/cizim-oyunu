"""Karakterin kendi kıyafetinin bölgelerini çıkarır. Oyun bu bölgeleri giyilen kıyafetin rengine boyar.

Kullanım: python3 araclar/kiyafet.py   (parcala.py'den sonra çalışır)
Çıktı: cizimler/<karakter>/<parça>-<bölge>.png
  Parça resmiyle aynı boydadır. Kıyafet pikselleri açık gri olur, desen ve çizgiler korunur.
  Oyunda parçanın üstüne konur ve k.color ile boyanır. Diğer pikseller şeffaftır.
Bölgeler: ust (gövdedeki giysi), alt (şort, pantolon). Renk aralıkları aşağıda: ton (derece), en az doygunluk.
"""
import json
import os
import re

import cv2
import numpy as np
from PIL import Image

KOK = os.path.join(os.path.dirname(__file__), "..")
# Her bölge: ton aralıkları, en az doygunluk ve karakterin tam resmindeki y aralığı.
BOLGELER = {
    "kiz": {
        "ust": {"ton": [(0, 18), (335, 360)], "doy": 0.45, "y": (205, 365), "x": (185, 340)},
        "alt": {"ton": [(55, 120)], "doy": 0.3, "y": (330, 480), "x": (0, 512)},
    },
    "kedi": {
        "ust": {"ton": [(45, 130)], "doy": 0.07, "y": (250, 400), "x": (0, 485)},
        "alt": {"ton": [(270, 345)], "doy": 0.15, "y": (395, 580), "x": (0, 485)},
    },
}


def main():
    sonuc = {}
    for kid, bolgeler in BOLGELER.items():
        js = open(os.path.join(KOK, "cizimler", kid, "parcalar.js")).read()
        veri = json.loads(re.search(r"= (\{.*\});", js, re.S).group(1))
        for p in veri["parcalar"]:
            im = np.array(Image.open(os.path.join(KOK, p["resim"])).convert("RGBA"))
            hsv = cv2.cvtColor(im[..., :3], cv2.COLOR_RGB2HSV_FULL).astype(np.float32)
            ton, doy, deg = hsv[..., 0] / 255 * 360, hsv[..., 1] / 255, hsv[..., 2] / 255
            H, W = im.shape[:2]
            yy, xx = np.mgrid[0:H, 0:W]
            gy, gx = yy + p["y"], xx + p["x"]
            for ad, b in bolgeler.items():
                m = np.zeros((H, W), bool)
                for t0, t1 in b["ton"]:
                    m |= (ton >= t0) & (ton < t1)
                m &= (doy > b["doy"]) & (deg > 0.22) & (im[..., 3] > 128)
                m &= (gy >= b["y"][0]) & (gy < b["y"][1]) & (gx >= b["x"][0]) & (gx < b["x"][1])
                # Boya boşluklarını kapat, sonra çizgileri (koyu pikselleri) yine dışarıda bırak.
                m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8)) > 0
                m &= (deg > 0.22) & (im[..., 3] > 128)
                if m.sum() < 200:
                    continue
                # Kıyafet açık griye döner: parlaklık farkları (boya dokusu) korunur.
                isik = deg / max(1e-3, np.median(deg[m]))
                gri = np.clip(235 * isik, 0, 255)
                out = np.zeros_like(im)
                out[m, 0] = out[m, 1] = out[m, 2] = gri[m]
                out[m, 3] = 255
                yolu = f"cizimler/{kid}/{p['ad']}-{ad}.png"
                Image.fromarray(out).save(os.path.join(KOK, yolu))
                sonuc.setdefault(kid, {}).setdefault(ad, []).append(yolu)
    print(json.dumps(sonuc, indent=1))


if __name__ == "__main__":
    main()
