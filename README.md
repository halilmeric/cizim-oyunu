# cizim-oyunu

Kızımın çizdiği karakterler ve mekanlarla Toca Boca World tarzı serbest bir tarayıcı oyunu.

## Oynamak
`index.html` dosyasını bir web sunucusuyla aç. Örnek: `python3 -m http.server`, sonra `http://localhost:8000`.

Oyun mahalle haritasında açılır. Sokakta 3 ev, 2 bahçe, park, oyun alanı, okul, kafe, market,
oyuncakçı, hastane, kuaför, kütüphane ve pastane var. Bir binaya dokununca seçili karakter yürür ve içeri girer.
Harita parmakla ya da iki yandaki oklarla kayar. Odada sol üstteki düğme haritaya döner.
Sağ üstteki yüzlere dokununca o karaktere gidilir. Sokaktan ara sıra araba ve otobüs geçer.
Köpek kendi kendine gezer.

Evde: TV'ye ya da kumandaya dokununca TV açılır, odadakiler dans eder. Dolaplar açılır:
TV dolabında oyuncaklar, mutfak dolaplarında tencere, tava ve bardak, yatak odası dolabında kıyafetler var. Tişört ya da elbise giyen karakterin kendi kıyafeti o renge boyanır.
Tencere ve tava ocağa konur. Ocağa dokununca kırmızı yanar, tencereden buhar çıkar. Bardak ve diğer eşyalar tezgaha konur.
Kıyafet karaktere bırakılınca giyilir. Karakterler iki elde iki eşya tutar. Yatak başındaki lamba yanar.
Klozette oturan karakter 10 saniye sonra kendi kalkar.

## Mekanlar
Toplam 20 sahne: harita ve 19 mekan. Evlerin odaları kendi evine bağlıdır (`ev` alanı).

| Haritadaki yer | Mekanlar |
| --- | --- |
| Mavi ev (ev1) | Salon, Mutfak, Banyo, Yatak odası |
| Ev1 bahçesi | Bahçe (salıncak, sandalye, kum havuzu) |
| Kırmızı ev (ev2) | Salon, Çocuk odası |
| Ev2 bahçesi | Bahçe (kaydırak, sandalye) |
| Sarı ev (ev3) | Küçük ev |
| Park, Oyun alanı | Fıskiye, bank, salıncak, kaydırak |
| Okul, Kafe, Market, Oyuncakçı, Hastane, Kuaför, Kütüphane, Pastane | Her biri bir oda |

## Çizim tarzı
Program çizimleri düz çizgi film tarzındadır: düz renk, koyu kalem çizgisi, sağ altta keskin bir gölge şeridi.
Parlama ve renk geçişi yoktur. Ağaç, çalı ve bulutlar dairelerin birleşimiyle tek çizgili çizilir.
Ortak çizim aracı `araclar/uret.py` içindeki `Tuval` ve `duz()` gölgesidir.
Kızın çizimleri (karakterler, TV, şömine, gökkuşağı) de düz tarza uydurulur: renkleri biraz canlanır, kenarına kalem çizgisi çekilir.
Bütün resimleri yeniden üretmek için: `uret.py`, `dunya.py`, `yerler.py` ve `ekler.py` sırayla çalıştırılır.

## Dosyalar
- `js/veri.js`: karakterler, eşyalar, mekanlar, kapılar, haritadaki yerler ve başlangıç hali. Yeni içerik buraya eklenir.
- `js/oyun.js`: mekan geçişleri, harita kamerası, sürükle-bırak, düşme, dokun-yürü, oturma, yatma, salıncak, kaydırak ve kayıt.
- `js/karakter.js`: parçalı karakter kurma ve canlandırma.
- `js/gecici.js`: efektler (su, köpük, nota, kalp, Z, parıltı) ve resmi olmayan mekanlar için yedek şekiller.
- `araclar/uret.py`: çizimlere ışık verir, eşyaları, ilk evin odalarını üretir, karakterleri böler.
- `araclar/dunya.py`: harita zemini, bina önleri, süsler ve yer simgeleri.
- `araclar/yerler.py`: diğer odalar, dükkanlar, bahçeler ve park.
- `araclar/kiyafet.py`: karakterlerin kendi kıyafet bölgeleri (boyanan katman).
- `araclar/ekler.py`: açık dolaplar, tencere, tava, bardak, kumanda, kıyafetler, köpek ve araçlar.
- `araclar/temizle.py`: çizim fotoğrafının arka planını siler, şeffaf PNG yapar.
- `araclar/hacim.py`: düz bir çizime kabartma ve ışık ekler.
- `araclar/parcala.py`: bir karakter çizimini hareketli parçalara böler.
- `cizimler/<ad>.png`: arka planı temizlenmiş çizimler (kaynak).
- `cizimler/hacimli/`: karakterler. `cizimler/esya/`: taşınan eşyalar.
- `cizimler/dunya/`: harita zemini ve süsler. `cizimler/dis/`: haritadaki dış görünümler.
- `cizimler/mekan/`: iç mekanlar ve bahçeler. `cizimler/simge/`: yer simgeleri.
- `lib/kaplay.js`: Kaplay 3001.0.19 oyun kütüphanesi.

Yeni karakter, eşya ya da mekan eklemek için: [KARAKTER-EKLEME.md](KARAKTER-EKLEME.md).

## Yükleme
Karakter, eşya ve simgeler baştan yüklenir. Mekan resimleri o mekana ilk gidilince yüklenir.
Aynı resim bir kez yüklenir. Kayıt tarayıcıda `cizim-dunyasi-v3` anahtarında durur.
