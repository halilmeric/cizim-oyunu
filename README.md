# Hatice World

Kızımın çizdiği karakterler ve mekanlarla Toca Boca World tarzı serbest bir tarayıcı oyunu.

## Oynamak
`index.html` dosyasını bir web sunucusuyla aç. Örnek: `python3 -m http.server`, sonra `http://localhost:8000`.

Oyun kasaba haritasında açılır. Harita kuşbakışı tek bir resimdir (`cizimler/dunya/kasaba-1.jpg` ve `kasaba-2.jpg`).
Kasabada 3 ev, 2 bahçe, park, oyun alanı, okul, kafe, market, oyuncakçı, hastane, kuaför, kütüphane ve pastane var.
Bir binaya dokununca seçili karakter kapısına yürür ve içeri girer. Karakter binanın üstüne sürüklenince de girer.
Harita parmakla dört yöne kayar. Karakter yukarıya, yani uzağa gittikçe küçülür. Odada sol üstteki düğme haritaya döner.
Sağ üstteki yüzlere dokununca o karaktere gidilir. Köpek kendi kendine gezer.
Binaların dokunulan alanı ve kapı önü `js/veri.js` içinde `dunya.yerler` listesindedir (`alan` ve `on`).

Evde: TV'ye ya da kumandaya dokununca TV açılır, odadakiler dans eder. Dolaplar açılır:
TV dolabında oyuncaklar, mutfak dolaplarında tencere, tava ve bardak, yatak odası dolabında kıyafetler var. Tişört, pantolon ya da elbise giyen karakterin kendi kıyafeti o renge boyanır.
Ortada kalan eşyalar dolaplara konabilir. Dolap kapanınca içindekiler görünmez, açınca geri alınır.
Tencere ve tava ocağa konur. Ocağa dokununca kırmızı yanar, tencereden buhar çıkar. Bardak ve diğer eşyalar tezgaha konur.
Kıyafet karaktere bırakılınca giyilir. Karakterler iki elde iki eşya tutar. Yatak başındaki lamba yanar.
Klozette oturan karakter 10 saniye sonra kendi kalkar.
Dolaptan ya da raftan alınan eşya yerde 6 saniye kalırsa kaybolur.

Bahçelerde çiçekler dikili. Sulama kabını tutan karaktere dokununca en yakın çiçeğe gider ve sular.
Sulanan filiz tomurcuk olur, tomurcuk açar.

Her dükkanda, okulda, hastanede, parkta ve oyun alanında mesleğine göre giyinmiş bir çalışan var.
Karakter gelince selam verir: doktor "Ne rahatsızlığınız vardı?", kuaför "Saçınızı nasıl kesmemi istersiniz?" der.
Çalışana dokununca mesleğiyle ilgili başka bir şey söyler.

Oyunda sesler var: düşme, cam şıngırtısı, ocak, TV müziği, korna, araba, şehir ve kuş sesleri, su, sifon,
ısırma, giyinme, kaydırak, köpek havlaması ve çalışanların konuşması. Sesler dosya değildir, `js/ses.js` tarayıcıda üretir.
Sol alttaki hoparlör düğmesi sesi kapatır ve açar.

## Mekanlar
Toplam 20 sahne: harita ve 19 mekan. Evlerin odaları kendi evine bağlıdır (`ev` alanı).

| Haritadaki yer | Mekanlar |
| --- | --- |
| Mavi ev (ev1) | Salon, Mutfak, Banyo, Yatak odası |
| Ev1 bahçesi | Bahçe (salıncak, kaydırak, sandalye, çiçekler) |
| Kırmızı ev (ev2) | Salon, Çocuk odası |
| Ev2 bahçesi | Bahçe (kaydırak, sandalye, çiçekler) |
| Sarı ev (ev3) | Küçük ev |
| Park, Oyun alanı | Fıskiye, bank, salıncak, kaydırak |
| Okul, Kafe, Market, Oyuncakçı, Hastane, Kuaför, Kütüphane, Pastane | Her biri bir oda |

## Çizim tarzı
Program çizimleri düz çizgi film tarzındadır: düz renk, koyu kalem çizgisi, sağ altta keskin bir gölge şeridi.
Parlama ve renk geçişi yoktur. Ağaç, çalı ve bulutlar dairelerin birleşimiyle tek çizgili çizilir.
Ortak çizim aracı `araclar/uret.py` içindeki `Tuval` ve `duz()` gölgesidir.
Kızın çizimleri (karakterler, TV, şömine, gökkuşağı) de düz tarza uydurulur: renkleri biraz canlanır, kenarına kalem çizgisi çekilir.
Bütün resimleri yeniden üretmek için: `uret.py`, `dunya.py`, `yerler.py`, `ekler.py`, `calisanlar.py` ve `bitkiler.py` sırayla çalıştırılır.

## Dosyalar
- `js/veri.js`: karakterler, eşyalar, mekanlar, kapılar, haritadaki yerler ve başlangıç hali. Yeni içerik buraya eklenir.
- `js/oyun.js`: mekan geçişleri, harita kamerası, sürükle-bırak, düşme, dokun-yürü, oturma, yatma, salıncak, kaydırak ve kayıt.
- `js/karakter.js`: parçalı karakter kurma ve canlandırma.
- `js/ses.js`: ses efektleri, TV müziği ve ortam sesleri (Web Audio ile üretilir).
- `js/gecici.js`: efektler (su, köpük, nota, kalp, Z, parıltı) ve resmi olmayan mekanlar için yedek şekiller.
- `araclar/uret.py`: çizimlere ışık verir, eşyaları, ilk evin odalarını üretir, karakterleri böler.
- `araclar/dunya.py`: harita zemini, bina önleri, süsler ve yer simgeleri.
- `araclar/yerler.py`: diğer odalar, dükkanlar, bahçeler ve park.
- `araclar/kiyafet.py`: karakterlerin kendi kıyafet bölgeleri (boyanan katman).
- `araclar/ekler.py`: açık dolaplar, tencere, tava, bardak, kumanda, kıyafetler, köpek ve araçlar.
- `araclar/calisanlar.py`: mekanlarda çalışan kişiler (doktor, kuaför, garson ve diğerleri).
- `araclar/bitkiler.py`: bahçe çiçeklerinin üç hali.
- `araclar/temizle.py`: çizim fotoğrafının arka planını siler, şeffaf PNG yapar.
- `araclar/hacim.py`: düz bir çizime kabartma ve ışık ekler.
- `araclar/parcala.py`: bir karakter çizimini hareketli parçalara böler.
- `cizimler/<ad>.png`: arka planı temizlenmiş çizimler (kaynak).
- `cizimler/hacimli/`: karakterler. `cizimler/esya/`: taşınan eşyalar.
- `cizimler/dunya/`: harita zemini ve süsler. `cizimler/dis/`: haritadaki dış görünümler.
- `cizimler/mekan/`: iç mekanlar ve bahçeler. `cizimler/simge/`: yer simgeleri.
- `cizimler/calisan/`: çalışan kişiler. `cizimler/bitki/`: bahçe çiçekleri.
- `lib/kaplay.js`: Kaplay 3001.0.19 oyun kütüphanesi.

Yeni karakter, eşya ya da mekan eklemek için: [KARAKTER-EKLEME.md](KARAKTER-EKLEME.md).

## Yükleme
Karakter, eşya ve simgeler baştan yüklenir. Mekan resimleri o mekana ilk gidilince yüklenir.
Aynı resim bir kez yüklenir. Kayıt tarayıcıda `cizim-dunyasi-v3` anahtarında durur.
