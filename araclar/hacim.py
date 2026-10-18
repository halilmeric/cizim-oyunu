"""Düz bir çizime hacim verir: kenarlar yuvarlanır, ışık sol üstten gelir.

Kullanım: python3 araclar/hacim.py girdi.png cikti.png [kure]
"kure": yuvarlak eşyalar için (top gibi) tam küre gölgesi.
Çizimin renkleri korunur. Sadece aydınlık ve gölge eklenir.
"""
import sys
import numpy as np
import cv2
from PIL import Image


def hacim(resim, kure=False, guc=1.0):
    """PIL RGBA resim alır, gölgeli yeni resim döner. guc: ışık-gölge şiddeti."""
    a = np.array(resim.convert("RGBA")).astype(np.float32)
    return Image.fromarray(_isle(a, kure, guc), "RGBA")


def _isle(a, kure, guc):
    rgb, al = a[..., :3], a[..., 3] / 255.0
    H, W = al.shape
    boyut = max(H, W)

    # Yükseklik haritası: kenarda hızlı yükselen bir kenar ve ortada hafif bir kubbe.
    ic = (al > 0.5).astype(np.uint8)
    uzak = cv2.distanceTransform(ic, cv2.DIST_L2, 5)
    kenar = boyut * 0.035
    yuk = np.clip(uzak / kenar, 0, 1)
    yuk = yuk * yuk * (3 - 2 * yuk)
    kubbe = uzak / (uzak.max() + 1e-6)
    yuk = 0.2 * yuk + 1.6 * np.sqrt(kubbe) if kure else 0.7 * yuk + 0.3 * np.sqrt(kubbe)
    yuk = cv2.GaussianBlur(yuk, (0, 0), boyut * 0.006)

    # Yüzey yönü ve ışık
    olcek = boyut * 0.05
    gx = cv2.Sobel(yuk, cv2.CV_32F, 1, 0, ksize=3) * olcek / 8
    gy = cv2.Sobel(yuk, cv2.CV_32F, 0, 1, ksize=3) * olcek / 8
    n = np.dstack([-gx, -gy, np.ones_like(gx)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    isik = np.array([-0.55, -0.65, 0.9]); isik /= np.linalg.norm(isik)
    golge = (n @ isik) - isik[2]               # düz yüzeyde 0
    parlak = np.clip(n @ (isik + [0, 0, 1]) / np.linalg.norm(isik + [0, 0, 1]), 0, 1) ** 40

    carpan = 1 + 0.9 * guc * golge
    yeni = rgb * carpan[..., None] + 255 * 0.35 * guc * parlak[..., None]
    if kure:
        # Küre: kenarlar koyu, sol üstte parlak bir nokta.
        yy, xx = np.mgrid[0:H, 0:W]
        ys, xs = np.nonzero(ic); cy, cx, r = ys.mean(), xs.mean(), np.sqrt(ic.sum() / np.pi)
        d = np.hypot(xx - (cx - 0.35 * r), yy - (cy - 0.4 * r)) / r
        yeni = yeni * (0.72 + 0.45 * np.clip(1 - np.hypot(xx - cx, yy - cy) / r, 0, 1) ** 0.5)[..., None]
        yeni = yeni + 255 * 0.55 * np.clip(1 - d / 0.35, 0, 1)[..., None] ** 2
    # Alt kısım biraz koyu: nesne yere oturuyormuş gibi durur.
    dikey = np.linspace(0.06, -0.10, H)[:, None, None]
    yeni = yeni * (1 + dikey)

    return np.dstack([np.clip(yeni, 0, 255), a[..., 3]]).astype(np.uint8)


if __name__ == "__main__":
    hacim(Image.open(sys.argv[1]), len(sys.argv) > 3 and sys.argv[3] == "kure").save(sys.argv[2])
