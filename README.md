# cizim-oyunu

Kızımın çizdiği karakterler ve mekanlarla bir tarayıcı oyunu.

## Oynamak
`index.html` dosyasını bir web sunucusuyla aç. Örnek: `python3 -m http.server`, sonra `http://localhost:8000`.

## Dosyalar
- `js/veri.js`: karakterler, mekanlar, kapılar ve eşyalar. Yeni çizim buraya eklenir.
- `js/oyun.js`: yürüme, kapılar, eşya toplama ve kayıt.
- `js/gecici.js`: çizim gelene kadar kullanılan geçici mekan resimleri.
- `cizimler/`: arka planı temizlenmiş çizimler (PNG).
- `lib/kaplay.js`: Kaplay 3001.0.19 oyun kütüphanesi.
