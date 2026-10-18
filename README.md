# cizim-oyunu

Kızımın çizdiği karakterler ve mekanlarla Toca Boca World tarzı serbest bir tarayıcı oyunu.

## Oynamak
`index.html` dosyasını bir web sunucusuyla aç. Örnek: `python3 -m http.server`, sonra `http://localhost:8000`.

## Dosyalar
- `js/veri.js`: karakter ve eşya şablonları, mekanlar, kapılar ve dünyanın başlangıç hali. Yeni çizim buraya eklenir.
- `js/oyun.js`: sürükle-bırak, düşme, dokun-yürü, kapılar ve kayıt.
- `js/karakter.js`: parçalı karakter kurma ve canlandırma.
- `araclar/parcala.py`: bir karakter çizimini hareketli parçalara böler.
- `js/gecici.js`: çizim gelene kadar kullanılan geçici mekan resimleri.
- `cizimler/`: arka planı temizlenmiş çizimler (PNG).
- `lib/kaplay.js`: Kaplay 3001.0.19 oyun kütüphanesi.
