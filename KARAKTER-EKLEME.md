# Yeni çizim ekleme

Oyunun kodu değişmez. Sadece resim dosyası eklenir ve `js/veri.js` dosyasına bir satır yazılır.

## 1. Çizimi hazırla
1. Çizimin fotoğrafını çek. Kağıt düz ve iyi aydınlık olsun.
2. Arka planı temizle:
   `python3 araclar/temizle.py foto.jpg cizimler/ad.png`
   Çizim kağıdın küçük bir bölümündeyse kırpma ekle: `... cizimler/ad.png 0.2,0.2,0.8,0.8`
3. Sonuç şeffaf bir PNG olur. Hazır şeffaf PNG de kullanılabilir.
4. Dosyayı `cizimler/<ad>.png` olarak koy. Ad küçük harf olsun, Türkçe harf ve boşluk olmasın.

## 2. Karakter ekle
1. Işık ve kabartma ver: `python3 araclar/hacim.py cizimler/ad.png cizimler/hacimli/ad.png`
2. `js/veri.js` içinde `karakterler` bölümüne bir satır ekle:
   ```js
   tavsan: { resim: "cizimler/hacimli/tavsan.png", boy: 300 },
   ```
   `boy`: karakterin ekranın önündeki boyu (piksel). Kedi 300, kız 360.
3. Karakterin oyunda nerede başlayacağını `baslangic.varliklar` listesine yaz:
   ```js
   { id: "tavsan1", tur: "karakter", sablon: "tavsan", mekan: "park", x: 600, y: 600 },
   ```
   Eski kayıtlar da yeni karakteri alır. `id` benzersiz olmalı.

Tek parça karakter de yürür, oturur, yatar, salıncağa biner, eşya tutar ve yer.
Kolları ve bacakları ayrı oynasın istenirse:
`python3 araclar/parcala.py cizimler/hacimli/tavsan.png cizimler/tavsan`.
Bu araç her karakter için ayrı bir kesim tanımı ister (`araclar/parcala.py` içindeki `kedi()` ve `kiz()` gibi).
Sonra `index.html` dosyasına `cizimler/tavsan/parcalar.js` satırı ve karaktere `parcalar: "tavsan"` eklenir.

## 3. Eşya ekle
1. PNG'yi `cizimler/esya/<ad>.png` olarak koy.
2. `js/veri.js` içinde `esyalar` bölümüne ekle. Her eşyanın bir işi olmalı:
   - Yiyecek: `yenir: [r, g, b]` (kırıntı rengi).
   - Oyuncak ya da araç: `eylem: "..."`. Seçenekler: at, sur, konus, oku, ic, fircala, yaz,
     yika, kurula, sik, dinle, tara, kurut, sula, kaz, kokla.
3. Yeni bir eylem gerekirse `js/oyun.js` içinde `EYLEM_SURE` ve `eylemKaresi` bölümüne eklenir.

## 4. Mekan ekle
1. Arka plan resmi 1280x720 olsun. `cizimler/mekan/<id>.jpg` olarak koy.
2. `js/veri.js` içinde `mekanlar` bölümüne ekle: `ad`, `simge`, `resim`, `zemin`, `giris`, `kapilar`, `noktalar`.
   Bir eve aitse `ev: "ev1"` yaz.
3. Haritadan girilecekse dış görünümü `cizimler/dis/<id>.png` olarak koy ve `dunya.yerler` listesine ekle.
   `kapi`: resmin alt kenarından ölçülen kapı alanı. `hedef`: girilen mekan.
4. Mekandan haritaya çıkış kapısı: `{ ...KAPI_SOL, hedef: "dunya", yer: "<yer id>" }`.

## Kızın çizdiği mekanlar
Şu an mekan resimleri `araclar/` içindeki programlarla çizildi. Kızın çizdiği bir oda, bahçe ya da bina
geldiğinde aynı dosya adıyla değiştirilebilir. Mobilyaların yeri değişirse `noktalar` içindeki sayılar da güncellenir.
