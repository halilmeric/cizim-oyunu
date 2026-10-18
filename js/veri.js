// Dünyanın tüm içeriği burada durur.
// Yeni çizim, eşya ya da mekan eklemek için sadece bu dosya değişir.
// Resimler araclar/uret.py, araclar/dunya.py ve araclar/yerler.py ile üretilir.

// Odaların ortak perspektif çizgileri (araclar/uret.py ile aynı sayılar).
const ZEMIN = {
  ust: 480, alt: 690, sol: 30, sag: 1250,
  ufuk: { x: 640, y: 120 }, arka: { sol: 200, sag: 1080, y: 440 },
};
// Açık hava: çim her yere uzanır, zemin daralmaz.
const ZEMIN_ACIK = { ust: 480, alt: 690, sol: 60, sag: 1220 };
// Oda kapıları yan duvardadır. Dokunma alanı kapının resmini kapsar.
const KAPI_SOL = { x: 30, y: 185, w: 135, h: 380 };
const KAPI_SAG = { x: 1115, y: 185, w: 135, h: 380 };
// Bahçe ve parkta: soldaki ev duvarının kapısı, iki yandaki bahçe kapıları (araclar/yerler.py).
const EV_ARKA_KAPI = { x: 40, y: 290, w: 120, h: 285 };
const BAHCE_KAPI_SAG = { x: 1110, y: 360, w: 140, h: 210 };
const BAHCE_KAPI_SOL = { x: 30, y: 360, w: 140, h: 210 };
// Haritadan bir mekana girince karakterin durduğu yer.
const GIRIS_SOL = { x: 270, y: 590 };
const GIRIS_SAG = { x: 1010, y: 590 };

// Sandalye: araclar/yerler.py sandalye(x, alt) ile aynı sayılar. Karakter üstüne bırakılınca oturur.
const sandalye = (x, alt) => ({ tur: "otur", x: x - 50, y: alt - 150, w: 100, h: 150, oturma: { x, y: alt - 6 } });

window.OYUN_VERI = {
  // Şablonlar: bir çizim bir kez tanımlanır, dünyada birçok kez kullanılır.
  // Yeni karakter eklemek için: şeffaf PNG koy, buraya bir satır ekle. Ayrıntı: KARAKTER-EKLEME.md
  karakterler: {
    // resim: hacimli PNG. parcalar: araclar/parcala.py çıktısı (yoksa karakter tek parça oynar).
    // boy: ekranın önündeki piksel boyu. agiz: ağzın yüksekliği (0 ayak, 1 baş). Verilmezse 0.74.
    // kiyafet: karakterin kendi kıyafetinin bölgeleri (araclar/kiyafet.py üretir). Her bölgede parça adı ve katman resmi.
    // Tişört ya da elbise giyince bu bölgeler kıyafetin rengine boyanır. Bölgesi olmayan karakter kıyafeti üstüne giyer.
    kedi: {
      resim: "cizimler/hacimli/kedi.png", parcalar: "kedi", boy: 300, giyim: { govde: [0, 0.54, 0.4] },
      kiyafet: {
        ust: { "govde": "cizimler/kedi/govde-ust.png", "kol-sol": "cizimler/kedi/kol-sol-ust.png", "kol-sag": "cizimler/kedi/kol-sag-ust.png" },
        alt: { "govde": "cizimler/kedi/govde-alt.png", "bacak-sol": "cizimler/kedi/bacak-sol-alt.png", "bacak-sag": "cizimler/kedi/bacak-sag-alt.png" },
      },
    },
    kiz: {
      resim: "cizimler/hacimli/kiz.png", parcalar: "kiz", boy: 360,
      kiyafet: {
        ust: { "govde": "cizimler/kiz/govde-ust.png" },
        alt: { "govde": "cizimler/kiz/govde-alt.png", "bacak-sol": "cizimler/kiz/bacak-sol-alt.png", "bacak-sag": "cizimler/kiz/bacak-sag-alt.png" },
      },
    },
    ayi: { resim: "cizimler/hacimli/ayi.png", boy: 310 },
    // Evcil hayvan: kendi kendine gezer. Tek eli ağzıdır.
    // agizX ve el: ağzın ve elin yeri (genişliğin ve yüksekliğin oranı). portre: simgede görünen parça.
    // giyim: kıyafetin yeri. [x, alt kenar, en] oranları. Verilmezse insan boyuna göre durur.
    kopek: {
      resim: "cizimler/hacimli/kopek.png", boy: 150, evcil: true, eller: 1,
      agiz: 0.5, agizX: 0.42, el: [0.42, 0.5], portre: [0.5, 0, 0.5, 0.6],
      giyim: { govde: [-0.1, 0.62, 0.5], alt: [-0.1, 0.45, 0.5], bas: [0.2, 0.86, 0.36] },
    },
  },
  esyalar: {
    // resim: eşyanın PNG dosyası. boy: ekranın önündeki piksel boyu.
    // yenir: karakterin ağzına götürülünce yenir. Değer kırıntının rengidir.
    // eylem: elinde tutan karaktere dokununca yaptığı hareket.
    //   at: fırlatır. sur: yerde sürer. Diğerleri elde oynanır:
    //   konus, oku, ic, fircala, yaz, yika, kurula, sik, dinle, tara, kurut, sula, kaz, kokla, karistir, kumanda.
    //   giy: karakter üstüne giyer. giy değeri yeridir: govde, alt (pantolon) ya da bas.
    // ocak: ocağın gözüne konabilir. kirilir: hızlı düşünce cam sesi çıkarır.
    top: { resim: "cizimler/esya/top.png", boy: 74, eylem: "at" },
    telefon: { resim: "cizimler/esya/telefon.png", boy: 62, eylem: "konus" },
    kitap: { resim: "cizimler/esya/kitap.png", boy: 58, eylem: "oku" },
    tahin: { resim: "cizimler/esya/tahin.png", boy: 70, yenir: [200, 160, 90] },
    elma: { resim: "cizimler/esya/elma.png", boy: 50, yenir: [235, 225, 180] },
    sut: { resim: "cizimler/esya/sut.png", boy: 84, yenir: [250, 250, 255] },
    kupa: { resim: "cizimler/esya/kupa.png", boy: 48, eylem: "ic", kirilir: true },
    ordek: { resim: "cizimler/esya/ordek.png", boy: 60, eylem: "sik" },
    sabun: { resim: "cizimler/esya/sabun.png", boy: 34, eylem: "yika" },
    sampuan: { resim: "cizimler/esya/sampuan.png", boy: 82, eylem: "yika" },
    muz: { resim: "cizimler/esya/muz.png", boy: 34, yenir: [250, 235, 170] },
    havuc: { resim: "cizimler/esya/havuc.png", boy: 70, yenir: [245, 150, 60] },
    ekmek: { resim: "cizimler/esya/ekmek.png", boy: 50, yenir: [225, 175, 110] },
    peynir: { resim: "cizimler/esya/peynir.png", boy: 42, yenir: [255, 220, 110] },
    cilek: { resim: "cizimler/esya/cilek.png", boy: 40, yenir: [230, 60, 80] },
    karpuz: { resim: "cizimler/esya/karpuz.png", boy: 46, yenir: [245, 90, 100] },
    kurabiye: { resim: "cizimler/esya/kurabiye.png", boy: 42, yenir: [215, 165, 95] },
    dondurma: { resim: "cizimler/esya/dondurma.png", boy: 74, yenir: [250, 190, 210] },
    portakal: { resim: "cizimler/esya/portakal.png", boy: 48, yenir: [250, 170, 60] },
    "portakal-suyu": { resim: "cizimler/esya/portakal-suyu.png", boy: 76, yenir: [255, 190, 60] },
    pasta: { resim: "cizimler/esya/pasta.png", boy: 64, yenir: [255, 225, 235] },
    araba: { resim: "cizimler/esya/araba.png", boy: 60, eylem: "sur" },
    kup: { resim: "cizimler/esya/kup.png", boy: 54, eylem: "at" },
    boya: { resim: "cizimler/esya/boya.png", boy: 22, eylem: "yaz" },
    "dis-fircasi": { resim: "cizimler/esya/dis-fircasi.png", boy: 26, eylem: "fircala" },
    "dis-macunu": { resim: "cizimler/esya/dis-macunu.png", boy: 28, eylem: "fircala" },
    havlu: { resim: "cizimler/esya/havlu.png", boy: 44, eylem: "kurula" },
    stetoskop: { resim: "cizimler/esya/stetoskop.png", boy: 70, eylem: "dinle" },
    tarak: { resim: "cizimler/esya/tarak.png", boy: 24, eylem: "tara" },
    fon: { resim: "cizimler/esya/fon.png", boy: 56, eylem: "kurut" },
    "sulama-kabi": { resim: "cizimler/esya/sulama-kabi.png", boy: 56, eylem: "sula" },
    kova: { resim: "cizimler/esya/kova.png", boy: 52, eylem: "kaz" },
    cicek: { resim: "cizimler/esya/cicek.png", boy: 70, eylem: "kokla" },
    tencere: { resim: "cizimler/esya/tencere.png", boy: 60, eylem: "karistir", ocak: true },
    tava: { resim: "cizimler/esya/tava.png", boy: 34, eylem: "karistir", ocak: true },
    bardak: { resim: "cizimler/esya/bardak.png", boy: 50, eylem: "ic", kirilir: true },
    kumanda: { resim: "cizimler/esya/kumanda.png", boy: 50, eylem: "kumanda" },
    // boya: giyince karakterin kendi kıyafetinin hangi bölgeleri bu renge boyanır (karakterin "kiyafet" verisi).
    elbise: { resim: "cizimler/esya/elbise.png", boy: 150, eylem: "giy", giy: "govde", boya: ["ust", "alt"], renk: [245, 120, 170] },
    "elbise-mor": { resim: "cizimler/esya/elbise-mor.png", boy: 150, eylem: "giy", giy: "govde", boya: ["ust", "alt"], renk: [165, 120, 230] },
    tisort: { resim: "cizimler/esya/tisort.png", boy: 100, eylem: "giy", giy: "govde", boya: ["ust"], renk: [80, 160, 235] },
    "tisort-sari": { resim: "cizimler/esya/tisort-sari.png", boy: 100, eylem: "giy", giy: "govde", boya: ["ust"], renk: [255, 205, 60] },
    "tisort-yesil": { resim: "cizimler/esya/tisort-yesil.png", boy: 100, eylem: "giy", giy: "govde", boya: ["ust"], renk: [110, 200, 100] },
    pantolon: { resim: "cizimler/esya/pantolon.png", boy: 110, eylem: "giy", giy: "alt", boya: ["alt"], renk: [70, 110, 190] },
    "pantolon-pembe": { resim: "cizimler/esya/pantolon-pembe.png", boy: 110, eylem: "giy", giy: "alt", boya: ["alt"], renk: [240, 120, 160] },
    "pantolon-kahve": { resim: "cizimler/esya/pantolon-kahve.png", boy: 110, eylem: "giy", giy: "alt", boya: ["alt"], renk: [170, 115, 70] },
    sapka: { resim: "cizimler/esya/sapka.png", boy: 50, eylem: "giy", giy: "bas" },
  },

  // Yer simgeleri: kapıların üstünde, tabelada ve harita düğmesinde görünür.
  simgeler: {
    ev: "cizimler/simge/ev.png",
    harita: "cizimler/simge/harita.png",
    bahce: "cizimler/simge/bahce.png",
    park: "cizimler/simge/park.png",
    oyun: "cizimler/simge/oyun.png",
    okul: "cizimler/simge/okul.png",
    kafe: "cizimler/simge/kafe.png",
    market: "cizimler/simge/market.png",
    oyuncak: "cizimler/simge/oyuncak.png",
    hastane: "cizimler/simge/hastane.png",
    kuafor: "cizimler/simge/kuafor.png",
    kutuphane: "cizimler/simge/kutuphane.png",
    pastane: "cizimler/simge/pastane.png",
  },

  // Bahçede dikili çiçekler: üç hal (filiz, tomurcuk, çiçek). araclar/bitkiler.py üretir.
  // Sulama kabıyla sulanınca bir sonraki hale geçer.
  bitkiler: {
    lale: ["cizimler/bitki/lale-0.png", "cizimler/bitki/lale-1.png", "cizimler/bitki/lale-2.png"],
    papatya: ["cizimler/bitki/papatya-0.png", "cizimler/bitki/papatya-1.png", "cizimler/bitki/papatya-2.png"],
    aycicegi: ["cizimler/bitki/aycicegi-0.png", "cizimler/bitki/aycicegi-1.png", "cizimler/bitki/aycicegi-2.png"],
    gul: ["cizimler/bitki/gul-0.png", "cizimler/bitki/gul-1.png", "cizimler/bitki/gul-2.png"],
  },

  // Mekanlarda çalışan kişiler. araclar/calisanlar.py üretir. konus: ağzı açık hali.
  // İleride kızın çizimleri bu resimlerin yerine konabilir.
  calisanlar: {
    doktor: { resim: "cizimler/calisan/doktor.png", konus: "cizimler/calisan/doktor-konus.png" },
    kuafor: { resim: "cizimler/calisan/kuafor.png", konus: "cizimler/calisan/kuafor-konus.png" },
    garson: { resim: "cizimler/calisan/garson.png", konus: "cizimler/calisan/garson-konus.png" },
    kasiyer: { resim: "cizimler/calisan/kasiyer.png", konus: "cizimler/calisan/kasiyer-konus.png" },
    oyuncakci: { resim: "cizimler/calisan/oyuncakci.png", konus: "cizimler/calisan/oyuncakci-konus.png" },
    kutuphaneci: { resim: "cizimler/calisan/kutuphaneci.png", konus: "cizimler/calisan/kutuphaneci-konus.png" },
    pastaci: { resim: "cizimler/calisan/pastaci.png", konus: "cizimler/calisan/pastaci-konus.png" },
    ogretmen: { resim: "cizimler/calisan/ogretmen.png", konus: "cizimler/calisan/ogretmen-konus.png" },
    bahcivan: { resim: "cizimler/calisan/bahcivan.png", konus: "cizimler/calisan/bahcivan-konus.png" },
    gorevli: { resim: "cizimler/calisan/gorevli.png", konus: "cizimler/calisan/gorevli-konus.png" },
  },

  // Mekanlar. Her mekanın kimliği anahtarıdır.
  //   ad: tabelada görünen ad. simge: cizimler/simge/<simge>.png. ev: bağlı olduğu ev (varsa).
  //   resim: arka plan. zemin: karakterlerin durduğu bant. giris: haritadan girince karakterin yeri.
  //   kapilar: başka mekana geçiş. hedef: gidilen mekan. giris: orada durulan yer.
  //            hedef "dunya" ise yer: haritadaki hangi yerin önüne çıkılır.
  //   noktalar: dokununca ya da üstüne bırakınca bir şey olan yerler.
  //     musluk: su akar ya da durur. su: suyun başladığı yer, boyu ve rengi.
  //     fiskiye: yukarı fışkıran su. acik: başta açık mı.
  //     dolap: dokununca açılır ya da kapanır. resim: açık hali, sol üst köşesi x0, y0.
  //            Dolaba bırakılan eşya içinde saklanır. Dolap açıkken görünür ve geri alınır.
  //     raf: hep açık raf. Dolap ve rafta raflar: yiyecek ve eşyalar. Biri alınınca yerine yenisi gelir.
  //     kuvet: karakter bırakılınca içine girer, sadece başı görünür.
  //     klozet: karakter oturur, beli piksel sansürle örtülür. Kalkınca sifon çekilir.
  //     otur: sandalye, kanepe, bank. Karakter bırakılınca oturur.
  //     yatak: karakter bırakılınca yatar ve uyur. yatis: ayak ucu. uzunluk: ayaktan yastığa. yorgan: üstünü örten örtü.
  //     salincak: karakter bırakılınca sallanır. asma: ipin bağlı olduğu nokta. ip: ipin boyu.
  //     kaydirak: karakter bırakılınca üstten alta kayar.
  //     tezgah: eşya bırakılınca üstüne konur. ust: eşyaların durduğu çizgi.
  //     ocak: tencere ve tava gözlere konur. Göze dokununca ocak yanar ve kırmızı olur.
  //     tv: dokununca açılır. Açıkken odadaki karakterler dans eder. ekran: renkli ışığın yeri.
  //     lamba: dokununca yanar ya da söner. isik: ışığın merkezi.
  //     bitki: dikili çiçekler. hal: başlangıç hali (0 filiz, 1 tomurcuk, 2 çiçek). Taşınmaz. Sulama kabını tutan karaktere dokununca gider ve en yakın çiçeği sular.
  //   calisan: mekanın sabit kişisi. Gelen karaktere selam verir. Dokununca sozler'den birini söyler.
  mekanlar: {
    // Mahalle haritası. Geniş bir sokak: kamera sağa sola kayar.
    dunya: {
      ad: "Meriç Sokağı", simge: "harita", tur: "dunya",
      genislik: 6520,
      taban: 472, // binaların oturduğu çizgi
      zemin: { ust: 482, alt: 705, sol: 30, sag: 6490 },
      olcek: 0.55, // haritada karakter ve eşyalar küçük görünür
      zeminResim: "cizimler/dunya/zemin.jpg", // 1280 piksellik parça yan yana tekrar eder
      // Sokaktan ara sıra geçen araçlar.
      araclar: ["cizimler/dunya/arac-araba.png", "cizimler/dunya/arac-taksi.png", "cizimler/dunya/arac-mavi.png", "cizimler/dunya/arac-otobus.png"],
      giris: { x: 420, y: 600 },
      // Haritadaki yerler. x: resmin sol kenarı, alt kenarı tabana oturur.
      // kapi: resmin alt kenarından ölçülen kapı (x, w, h). hedef: kapıdan girilen mekan.
      yerler: [
        { id: "ev1", resim: "cizimler/dis/ev1.png", x: 180, kapi: { x: 136, w: 88, h: 176 }, hedef: "oda" },
        { id: "bahce1", resim: "cizimler/dis/bahce1.png", x: 570, kapi: { x: 118, w: 90, h: 120 }, hedef: "bahce1" },
        { id: "ev2", resim: "cizimler/dis/ev2.png", x: 920, kapi: { x: 162, w: 96, h: 182 }, hedef: "ev2-salon" },
        { id: "bahce2", resim: "cizimler/dis/bahce2.png", x: 1370, kapi: { x: 118, w: 90, h: 120 }, hedef: "bahce2" },
        { id: "ev3", resim: "cizimler/dis/ev3.png", x: 1740, kapi: { x: 146, w: 78, h: 152 }, hedef: "ev3-oda" },
        { id: "park", resim: "cizimler/dis/park.png", x: 2080, kapi: { x: 196, w: 100, h: 130 }, hedef: "park" },
        { id: "oyun", resim: "cizimler/dis/oyun.png", x: 2610, kapi: { x: 160, w: 92, h: 120 }, hedef: "oyun" },
        { id: "okul", resim: "cizimler/dis/okul.png", x: 3090, kapi: { x: 182, w: 116, h: 168 }, hedef: "okul" },
        { id: "kafe", resim: "cizimler/dis/kafe.png", x: 3630, kapi: { x: 177, w: 108, h: 170 }, hedef: "kafe" },
        { id: "market", resim: "cizimler/dis/market.png", x: 3990, kapi: { x: 192, w: 123, h: 160 }, hedef: "market" },
        { id: "oyuncakci", resim: "cizimler/dis/oyuncakci.png", x: 4380, kapi: { x: 182, w: 113, h: 180 }, hedef: "oyuncakci" },
        { id: "hastane", resim: "cizimler/dis/hastane.png", x: 4760, kapi: { x: 154, w: 112, h: 164 }, hedef: "hastane" },
        { id: "kuafor", resim: "cizimler/dis/kuafor.png", x: 5240, kapi: { x: 166, w: 99, h: 160 }, hedef: "kuafor" },
        { id: "kutuphane", resim: "cizimler/dis/kutuphane.png", x: 5590, kapi: { x: 136, w: 108, h: 196 }, hedef: "kutuphane" },
        { id: "pastane", resim: "cizimler/dis/pastane.png", x: 6030, kapi: { x: 177, w: 108, h: 170 }, hedef: "pastane" },
      ],
      // Süsler: dokunulmaz, sadece görünür. x: orta nokta, y: taban. arka: binaların arkasında durur.
      susler: [
        { resim: "cizimler/dunya/cam.png", x: 40, y: 430, arka: true },
        { resim: "cizimler/dunya/cam.png", x: 880, y: 430, arka: true },
        { resim: "cizimler/dunya/cam.png", x: 1700, y: 430, arka: true },
        { resim: "cizimler/dunya/cam.png", x: 2580, y: 430, arka: true },
        { resim: "cizimler/dunya/cam.png", x: 3590, y: 430, arka: true },
        { resim: "cizimler/dunya/cam.png", x: 4740, y: 430, arka: true },
        { resim: "cizimler/dunya/cam.png", x: 5990, y: 430, arka: true },
        { resim: "cizimler/dunya/agac.png", x: 90, y: 474, arka: true },
        { resim: "cizimler/dunya/agac.png", x: 2050, y: 474, arka: true },
        { resim: "cizimler/dunya/agac.png", x: 3600, y: 474, arka: true },
        { resim: "cizimler/dunya/agac.png", x: 6430, y: 474, arka: true },
        { resim: "cizimler/dunya/lamba.png", x: 556, y: 486 },
        { resim: "cizimler/dunya/lamba.png", x: 1356, y: 486 },
        { resim: "cizimler/dunya/lamba.png", x: 2585, y: 486 },
        { resim: "cizimler/dunya/lamba.png", x: 3966, y: 486 },
        { resim: "cizimler/dunya/lamba.png", x: 4730, y: 486 },
        { resim: "cizimler/dunya/lamba.png", x: 5562, y: 486 },
        { resim: "cizimler/dunya/cicek.png", x: 1710, y: 476 },
        { resim: "cizimler/dunya/cali.png", x: 150, y: 478 },
        { resim: "cizimler/dunya/cali.png", x: 3570, y: 478 },
        { resim: "cizimler/dunya/cali.png", x: 5200, y: 478 },
        { resim: "cizimler/dunya/cicek.png", x: 3060, y: 476 },
      ],
    },

    // --- Ev 1: mavi çatılı ev. Salon, mutfak, banyo, yatak odası ve bahçe. ---
    oda: {
      ad: "Salon", simge: "ev", ev: "ev1",
      resim: "cizimler/mekan/oda.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [
        { ...KAPI_SOL, hedef: "dunya", yer: "ev1" },
        { ...KAPI_SAG, hedef: "mutfak", giris: GIRIS_SOL },
      ],
      noktalar: [
        { tur: "tv", x: 790, y: 180, w: 200, h: 185, ekran: { x: 806, y: 232, w: 140, h: 124 } },
        {
          tur: "dolap", x: 770, y: 370, w: 230, h: 92,
          resim: "cizimler/mekan/tv-dolabi-acik.png", x0: 712, y0: 362,
          raflar: [
            { sablon: "kumanda", x: 815, y: 407 }, { sablon: "kitap", x: 885, y: 407 }, { sablon: "telefon", x: 955, y: 407 },
            { sablon: "kup", x: 830, y: 441 }, { sablon: "ordek", x: 935, y: 441 },
          ],
        },
      ],
    },
    mutfak: {
      ad: "Mutfak", simge: "ev", ev: "ev1",
      resim: "cizimler/mekan/mutfak.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [
        { ...KAPI_SOL, hedef: "oda", giris: GIRIS_SAG },
        { ...KAPI_SAG, hedef: "banyo", giris: GIRIS_SOL },
      ],
      noktalar: [
        {
          tur: "dolap", x: 225, y: 140, w: 160, h: 318,
          resim: "cizimler/mekan/buzdolabi-acik.png", x0: 146, y0: 122,
          raflar: [
            { sablon: "sut", x: 270, y: 214 }, { sablon: "portakal-suyu", x: 335, y: 214 },
            { sablon: "peynir", x: 265, y: 284 }, { sablon: "cilek", x: 312, y: 284 }, { sablon: "havuc", x: 350, y: 284 },
            { sablon: "karpuz", x: 270, y: 354 }, { sablon: "dondurma", x: 340, y: 354 },
          ],
        },
        { tur: "musluk", x: 600, y: 290, w: 130, h: 70, su: { x: 690, y: 318, boy: 26 } },
        { tur: "ocak", x: 750, y: 300, w: 140, h: 60, gozler: [{ x: 785, y: 345 }, { x: 850, y: 345 }] },
        { tur: "tezgah", x: 390, y: 250, w: 530, h: 106, ust: 346 },
        // Tezgahın altındaki beş dolap. Hepsi aynı açık dolap resmini kullanır.
        ...[["bardak", "tencere"], ["bardak", "tava"], ["kupa", "tencere"], ["bardak", "tava"], ["kupa", "tencere"]].map(([ust, alt], i) => ({
          tur: "dolap", x: 410 + i * 100, y: 362, w: 92, h: 86,
          resim: "cizimler/mekan/mutfak-dolap-acik.png", x0: 358 + i * 100, y0: 350,
          raflar: [{ sablon: ust, x: 456 + i * 100, y: 401 }, { sablon: alt, x: 456 + i * 100, y: 444 }],
        })),
      ],
    },
    banyo: {
      ad: "Banyo", simge: "ev", ev: "ev1",
      resim: "cizimler/mekan/banyo.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [
        { ...KAPI_SOL, hedef: "mutfak", giris: GIRIS_SAG },
        { ...KAPI_SAG, hedef: "yatak", giris: GIRIS_SOL },
      ],
      noktalar: [
        { tur: "musluk", x: 300, y: 255, w: 150, h: 90, su: { x: 393, y: 270, boy: 30 } },
        { tur: "musluk", x: 950, y: 235, w: 95, h: 95, su: { x: 985, y: 270, boy: 45 } },
        {
          tur: "kuvet", x: 640, y: 200, w: 400, h: 260,
          resim: "cizimler/mekan/kuvet-on.png", x0: 637, y0: 303,
          su: 326, dip: 442, yerler: [{ x: 765 }, { x: 915 }],
        },
        { tur: "klozet", x: 460, y: 270, w: 160, h: 200, oturma: { x: 540, y: 448 } },
      ],
    },
    yatak: {
      ad: "Yatak odası", simge: "ev", ev: "ev1",
      resim: "cizimler/mekan/yatak.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [
        { ...KAPI_SOL, hedef: "banyo", giris: GIRIS_SAG },
        { ...KAPI_SAG, hedef: "bahce1", giris: { x: 250, y: 590 } },
      ],
      noktalar: [
        { tur: "yatak", x: 220, y: 280, w: 350, h: 200, yatis: { x: 250, y: 318 }, uzunluk: 270, yorgan: { x: 236, y: 300, w: 190, h: 84 }, renk: [130, 170, 235] },
        { tur: "lamba", x: 580, y: 290, w: 90, h: 95, isik: { x: 625, y: 318 } },
        {
          tur: "dolap", x: 800, y: 140, w: 200, h: 326,
          resim: "cizimler/mekan/gardirop-acik.png", x0: 736, y0: 124,
          raflar: [
            // sira: biri alınınca rafa sıradaki renk gelir.
            { sablon: "sapka", x: 900, y: 205 },
            { sablon: "elbise", sira: ["elbise", "elbise-mor"], x: 850, y: 360 },
            { sablon: "tisort", sira: ["tisort", "tisort-sari", "tisort-yesil"], x: 950, y: 330 },
            { sablon: "pantolon", sira: ["pantolon", "pantolon-pembe", "pantolon-kahve"], x: 900, y: 452 },
          ],
        },
      ],
    },
    bahce1: {
      ad: "Bahçe", simge: "bahce", ev: "ev1",
      resim: "cizimler/mekan/bahce1.jpg", zemin: ZEMIN_ACIK, giris: GIRIS_SAG,
      kapilar: [
        { ...EV_ARKA_KAPI, hedef: "yatak", giris: GIRIS_SAG },
        { ...BAHCE_KAPI_SAG, hedef: "dunya", yer: "bahce1" },
      ],
      noktalar: [
        { tur: "salincak", x: 400, y: 180, w: 240, h: 300, asma: { x: 520, y: 192 }, ip: 200 },
        { tur: "kaydirak", x: 670, y: 200, w: 360, h: 290, ust: { x: 765, y: 232 }, alt: { x: 1010, y: 470 } },
        { ...sandalye(230, 486) },
        {
          tur: "bitki", bitkiler: [
            { tur: "lale", x: 250, y: 560, hal: 2 }, { tur: "gul", x: 335, y: 575, hal: 1 },
            { tur: "papatya", x: 850, y: 565 }, { tur: "aycicegi", x: 940, y: 555, hal: 2 }, { tur: "lale", x: 1030, y: 570 },
          ],
        },
      ],
    },

    // --- Ev 2: kırmızı çatılı aile evi. Salon, çocuk odası ve bahçe. ---
    "ev2-salon": {
      ad: "Salon", simge: "ev", ev: "ev2",
      resim: "cizimler/mekan/ev2-salon.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [
        { ...KAPI_SOL, hedef: "dunya", yer: "ev2" },
        { ...KAPI_SAG, hedef: "ev2-cocuk", giris: GIRIS_SOL },
      ],
      noktalar: [
        { tur: "otur", x: 480, y: 300, w: 160, h: 170, oturma: { x: 570, y: 462 } },
        { tur: "otur", x: 640, y: 300, w: 160, h: 170, oturma: { x: 710, y: 462 } },
      ],
    },
    "ev2-cocuk": {
      ad: "Çocuk odası", simge: "ev", ev: "ev2",
      resim: "cizimler/mekan/ev2-cocuk.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [
        { ...KAPI_SOL, hedef: "ev2-salon", giris: GIRIS_SAG },
        { ...KAPI_SAG, hedef: "bahce2", giris: { x: 250, y: 590 } },
      ],
      noktalar: [
        { tur: "yatak", x: 220, y: 280, w: 340, h: 200, yatis: { x: 246, y: 318 }, uzunluk: 270, yorgan: { x: 232, y: 300, w: 190, h: 84 }, renk: [250, 130, 150] },
        sandalye(920, 470),
      ],
    },
    bahce2: {
      ad: "Bahçe", simge: "bahce", ev: "ev2",
      resim: "cizimler/mekan/bahce2.jpg", zemin: ZEMIN_ACIK, giris: GIRIS_SAG,
      kapilar: [
        { ...EV_ARKA_KAPI, hedef: "ev2-cocuk", giris: GIRIS_SAG },
        { ...BAHCE_KAPI_SAG, hedef: "dunya", yer: "bahce2" },
      ],
      noktalar: [
        { tur: "kaydirak", x: 350, y: 200, w: 360, h: 290, ust: { x: 445, y: 232 }, alt: { x: 690, y: 470 } },
        sandalye(1010, 486),
        {
          tur: "bitki", bitkiler: [
            { tur: "aycicegi", x: 250, y: 560, hal: 1 }, { tur: "papatya", x: 330, y: 575, hal: 2 },
            { tur: "gul", x: 800, y: 570, hal: 2 }, { tur: "lale", x: 880, y: 560 }, { tur: "papatya", x: 960, y: 575 },
          ],
        },
      ],
    },

    // --- Ev 3: küçük sarı ev. Tek oda. ---
    "ev3-oda": {
      ad: "Küçük ev", simge: "ev", ev: "ev3",
      resim: "cizimler/mekan/ev3-oda.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [{ ...KAPI_SOL, hedef: "dunya", yer: "ev3" }],
      noktalar: [
        { tur: "yatak", x: 220, y: 280, w: 320, h: 200, yatis: { x: 240, y: 318 }, uzunluk: 255, yorgan: { x: 236, y: 300, w: 178, h: 84 }, renk: [170, 140, 240] },
        { tur: "musluk", x: 830, y: 290, w: 120, h: 70, su: { x: 915, y: 318, boy: 24 } },
        sandalye(760, 480),
      ],
    },

    // --- Kamusal ve sosyal mekanlar ---
    park: {
      ad: "Park", simge: "park",
      resim: "cizimler/mekan/park.jpg", zemin: ZEMIN_ACIK, giris: { x: 270, y: 590 },
      kapilar: [{ ...BAHCE_KAPI_SOL, hedef: "dunya", yer: "park" }],
      calisan: {
        meslek: "bahcivan", x: 380, y: 500,
        selam: "Hoş geldiniz! Parkımız bugün çok güzel.",
        sozler: ["Çiçeklere dikkat edelim, koparmayalım.", "Ağaçları her sabah ben suluyorum.", "Fıskiyenin suyu çok serin!", "Çöpleri çöp kutusuna atalım lütfen.", "Bankta oturup dinlenebilirsiniz."],
      },
      noktalar: [
        { tur: "fiskiye", x: 600, y: 300, w: 200, h: 180, su: { x: 700, y: 324 }, acik: true },
        { tur: "otur", x: 950, y: 320, w: 100, h: 160, oturma: { x: 1000, y: 474 } },
        { tur: "otur", x: 1050, y: 320, w: 100, h: 160, oturma: { x: 1100, y: 474 } },
      ],
    },
    oyun: {
      ad: "Oyun alanı", simge: "oyun",
      resim: "cizimler/mekan/oyun.jpg", zemin: ZEMIN_ACIK, giris: { x: 270, y: 590 },
      kapilar: [{ ...BAHCE_KAPI_SOL, hedef: "dunya", yer: "oyun" }],
      calisan: {
        meslek: "gorevli", x: 610, y: 510,
        selam: "Hoş geldiniz! Hadi oyun oynayalım!",
        sozler: ["Kaydıraktan sırayla kayalım.", "Salıncakta sıkı tutunun!", "Kumdan kale yapalım mı?", "Koşarken dikkat edin, düşmeyin!", "Su içmeyi unutmayın."],
      },
      noktalar: [
        { tur: "salincak", x: 300, y: 180, w: 240, h: 300, asma: { x: 420, y: 192 }, ip: 200 },
        { tur: "kaydirak", x: 660, y: 200, w: 360, h: 290, ust: { x: 755, y: 232 }, alt: { x: 1000, y: 470 } },
      ],
    },
    okul: {
      ad: "Okul", simge: "okul",
      resim: "cizimler/mekan/okul.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [{ ...KAPI_SOL, hedef: "dunya", yer: "okul" }],
      calisan: {
        meslek: "ogretmen", x: 960, y: 500,
        selam: "Günaydın çocuklar, hoş geldiniz!",
        sozler: ["Kitaplarınızı açın, bugün okuma yapacağız.", "Bugün resim dersimiz var.", "Aferin, çok güzel cevap!", "Parmak kaldırıp söz alalım.", "Teneffüs zili çaldı!"],
      },
      noktalar: [sandalye(360, 476), sandalye(620, 476)],
    },
    kafe: {
      ad: "Kafe", simge: "kafe",
      resim: "cizimler/mekan/kafe.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [{ ...KAPI_SOL, hedef: "dunya", yer: "kafe" }],
      calisan: {
        meslek: "garson", x: 480, y: 500,
        selam: "Hoş geldiniz! Ne içersiniz? Çay, kahve ya da sıcak çikolata?",
        sozler: ["Kurabiyelerimiz fırından yeni çıktı.", "Şekerli mi olsun, şekersiz mi?", "Siparişiniz hemen geliyor.", "Buyurun, masanız hazır.", "Afiyet olsun!"],
      },
      noktalar: [
        { tur: "musluk", x: 260, y: 230, w: 100, h: 100, su: { x: 310, y: 306, boy: 22, renk: [130, 80, 45] } },
        { tur: "raf", raflar: [{ sablon: "kupa", x: 395, y: 332 }, { sablon: "kurabiye", x: 545, y: 332 }] },
        sandalye(760, 476), sandalye(960, 476),
      ],
    },
    market: {
      ad: "Market", simge: "market",
      resim: "cizimler/mekan/market.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [{ ...KAPI_SOL, hedef: "dunya", yer: "market" }],
      calisan: {
        meslek: "kasiyer", x: 960, y: 500,
        selam: "Hoş geldiniz! Aradığınızı bulabildiniz mi?",
        sozler: ["Meyveler bugün çok taze.", "Poşet ister misiniz?", "Kasaya buyurun, ürünleri okutayım.", "Fişiniz burada. İyi günler!", "Bugün sütte indirim var."],
      },
      noktalar: [
        {
          tur: "raf", raflar: [
            { sablon: "elma", x: 270, y: 230 }, { sablon: "muz", x: 345, y: 230 }, { sablon: "portakal", x: 420, y: 230 }, { sablon: "cilek", x: 495, y: 230 },
            { sablon: "ekmek", x: 285, y: 330 }, { sablon: "peynir", x: 390, y: 330 }, { sablon: "havuc", x: 480, y: 330 },
            { sablon: "sut", x: 275, y: 430 }, { sablon: "portakal-suyu", x: 370, y: 430 }, { sablon: "karpuz", x: 470, y: 430 },
            { sablon: "tahin", x: 650, y: 230 }, { sablon: "kurabiye", x: 730, y: 230 }, { sablon: "dondurma", x: 810, y: 230 },
            { sablon: "sabun", x: 650, y: 330 }, { sablon: "sampuan", x: 730, y: 330 }, { sablon: "dis-macunu", x: 810, y: 330 },
            { sablon: "muz", x: 650, y: 430 }, { sablon: "elma", x: 730, y: 430 }, { sablon: "ekmek", x: 810, y: 430 },
          ],
        },
      ],
    },
    oyuncakci: {
      ad: "Oyuncakçı", simge: "oyuncak",
      resim: "cizimler/mekan/oyuncakci.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [{ ...KAPI_SOL, hedef: "dunya", yer: "oyuncakci" }],
      calisan: {
        meslek: "oyuncakci", x: 620, y: 510,
        selam: "Hoş geldin! Hangi oyuncağa bakmıştın?",
        sozler: ["Bu top çok yükseğe zıplıyor!", "Yeni oyuncak arabalar geldi.", "Hediye paketi yapalım mı?", "Ayıcığımız çok yumuşak, sarılabilirsin.", "Pilleri de vereyim mi?"],
      },
      noktalar: [
        {
          tur: "raf", raflar: [
            { sablon: "top", x: 285, y: 230 }, { sablon: "kup", x: 385, y: 230 }, { sablon: "ordek", x: 480, y: 230 },
            { sablon: "araba", x: 300, y: 330 }, { sablon: "boya", x: 420, y: 330 }, { sablon: "kitap", x: 520, y: 330 },
            { sablon: "top", x: 290, y: 430 }, { sablon: "kova", x: 410, y: 430 }, { sablon: "telefon", x: 525, y: 430 },
          ],
        },
      ],
    },
    hastane: {
      ad: "Hastane", simge: "hastane",
      resim: "cizimler/mekan/hastane.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [{ ...KAPI_SOL, hedef: "dunya", yer: "hastane" }],
      calisan: {
        meslek: "doktor", x: 760, y: 500,
        selam: "Hoş geldiniz! Ne rahatsızlığınız vardı?",
        sozler: ["Ağzınızı açın, aaa deyin.", "Derin nefes alın, verin.", "Ateşiniz var mı? Bir ölçelim.", "Şurubunuzu günde üç kez için.", "Geçmiş olsun! Bol su için, dinlenin."],
      },
      noktalar: [
        { tur: "yatak", x: 290, y: 280, w: 340, h: 200, yatis: { x: 320, y: 318 }, uzunluk: 270, yorgan: { x: 306, y: 300, w: 190, h: 84 }, renk: [150, 210, 240] },
      ],
    },
    kuafor: {
      ad: "Kuaför", simge: "kuafor",
      resim: "cizimler/mekan/kuafor.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [{ ...KAPI_SOL, hedef: "dunya", yer: "kuafor" }],
      calisan: {
        meslek: "kuafor", x: 560, y: 495,
        selam: "Hoş geldiniz! Saçınızı bugün nasıl kesmemi istersiniz?",
        sozler: ["Uçlarını mı alalım, kısa mı keselim?", "Önce saçınızı yıkayalım.", "Fön mü çekelim, maşa mı yapalım?", "Kakül ister misiniz?", "Saçınız çok güzel oldu!"],
      },
      noktalar: [
        { tur: "otur", x: 340, y: 290, w: 160, h: 190, oturma: { x: 420, y: 452 } },
        { tur: "musluk", x: 700, y: 270, w: 160, h: 100, su: { x: 800, y: 288, boy: 24 } },
      ],
    },
    kutuphane: {
      ad: "Kütüphane", simge: "kutuphane",
      resim: "cizimler/mekan/kutuphane.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [{ ...KAPI_SOL, hedef: "dunya", yer: "kutuphane" }],
      calisan: {
        meslek: "kutuphaneci", x: 640, y: 520,
        selam: "Hoş geldiniz! Hangi kitabı arıyorsunuz?",
        sozler: ["Kütüphanede sessiz olalım, şşş.", "Masal kitapları şu rafta.", "Kitabı iki hafta sonra geri getirin.", "Kütüphane kartınız var mı?", "Okumak çok güzel, değil mi?"],
      },
      noktalar: [
        {
          tur: "raf", raflar: [
            { sablon: "kitap", x: 260, y: 330 }, { sablon: "kitap", x: 340, y: 330 }, { sablon: "kitap", x: 420, y: 330 },
            { sablon: "kitap", x: 860, y: 420 }, { sablon: "kitap", x: 940, y: 420 }, { sablon: "kitap", x: 1020, y: 420 },
          ],
        },
        sandalye(510, 476), sandalye(770, 476),
      ],
    },
    pastane: {
      ad: "Pastane", simge: "pastane",
      resim: "cizimler/mekan/pastane.jpg", zemin: ZEMIN, giris: GIRIS_SOL,
      kapilar: [{ ...KAPI_SOL, hedef: "dunya", yer: "pastane" }],
      calisan: {
        meslek: "pastaci", x: 770, y: 500,
        selam: "Hoş geldiniz! Bugün taze pastalarımız var.",
        sozler: ["Doğum günü pastası mı istersiniz?", "Çilekli mi olsun, çikolatalı mı?", "Kurabiyeler fırından yeni çıktı.", "Mumlarını da koyayım mı?", "Afiyet olsun!"],
      },
      noktalar: [
        {
          tur: "raf", raflar: [
            { sablon: "pasta", x: 300, y: 300 }, { sablon: "kurabiye", x: 420, y: 300 }, { sablon: "dondurma", x: 540, y: 300 }, { sablon: "pasta", x: 660, y: 300 },
            { sablon: "ekmek", x: 300, y: 390 }, { sablon: "kurabiye", x: 420, y: 390 }, { sablon: "cilek", x: 540, y: 390 }, { sablon: "kurabiye", x: 660, y: 390 },
          ],
        },
      ],
    },
  },

  // Oyun ilk açıldığında dünyanın hali. Sonra her değişiklik kaydedilir.
  baslangic: {
    mekan: "dunya",
    varliklar: [
      { id: "kiz1", tur: "karakter", sablon: "kiz", mekan: "dunya", x: 380, y: 600 },
      { id: "kedi1", tur: "karakter", sablon: "kedi", mekan: "dunya", x: 470, y: 620 },
      { id: "kopek1", tur: "karakter", sablon: "kopek", mekan: "dunya", x: 600, y: 660 },
      { id: "top4", tur: "esya", sablon: "top", mekan: "dunya", x: 640, y: 640 },
      { id: "telefon1", tur: "esya", sablon: "telefon", mekan: "oda", x: 330, y: 650 },
      { id: "kitap1", tur: "esya", sablon: "kitap", mekan: "oda", x: 930, y: 660 },
      { id: "top1", tur: "esya", sablon: "top", mekan: "oda", x: 640, y: 665 },
      { id: "araba1", tur: "esya", sablon: "araba", mekan: "oda", x: 560, y: 690 },
      { id: "kup1", tur: "esya", sablon: "kup", mekan: "oda", x: 800, y: 670 },
      { id: "boya1", tur: "esya", sablon: "boya", mekan: "oda", x: 220, y: 680 },
      { id: "elma1", tur: "esya", sablon: "elma", mekan: "mutfak", x: 500, y: 640 },
      { id: "elma2", tur: "esya", sablon: "elma", mekan: "mutfak", x: 545, y: 670 },
      { id: "tahin1", tur: "esya", sablon: "tahin", mekan: "mutfak", x: 880, y: 650 },
      { id: "sut1", tur: "esya", sablon: "sut", mekan: "mutfak", x: 960, y: 610 },
      { id: "kupa1", tur: "esya", sablon: "kupa", mekan: "mutfak", x: 400, y: 600 },
      { id: "muz1", tur: "esya", sablon: "muz", mekan: "mutfak", x: 620, y: 690 },
      { id: "ekmek1", tur: "esya", sablon: "ekmek", mekan: "mutfak", x: 770, y: 685 },
      { id: "kurabiye1", tur: "esya", sablon: "kurabiye", mekan: "mutfak", x: 440, y: 690 },
      { id: "portakal1", tur: "esya", sablon: "portakal", mekan: "mutfak", x: 1000, y: 680 },
      { id: "pasta1", tur: "esya", sablon: "pasta", mekan: "mutfak", x: 1080, y: 640 },
      { id: "ordek1", tur: "esya", sablon: "ordek", mekan: "banyo", x: 720, y: 650 },
      { id: "sabun1", tur: "esya", sablon: "sabun", mekan: "banyo", x: 520, y: 640 },
      { id: "sampuan1", tur: "esya", sablon: "sampuan", mekan: "banyo", x: 420, y: 610 },
      { id: "fircasi1", tur: "esya", sablon: "dis-fircasi", mekan: "banyo", x: 600, y: 690 },
      { id: "macun1", tur: "esya", sablon: "dis-macunu", mekan: "banyo", x: 880, y: 685 },
      { id: "havlu1", tur: "esya", sablon: "havlu", mekan: "banyo", x: 1000, y: 640 },
      { id: "kitap3", tur: "esya", sablon: "kitap", mekan: "yatak", x: 700, y: 640 },
      { id: "sulama1", tur: "esya", sablon: "sulama-kabi", mekan: "bahce1", x: 700, y: 620 },
      { id: "kova1", tur: "esya", sablon: "kova", mekan: "bahce1", x: 880, y: 640 },
      { id: "cicek1", tur: "esya", sablon: "cicek", mekan: "bahce1", x: 400, y: 660 },
      { id: "araba2", tur: "esya", sablon: "araba", mekan: "ev2-cocuk", x: 600, y: 660 },
      { id: "kup2", tur: "esya", sablon: "kup", mekan: "ev2-cocuk", x: 760, y: 640 },
      { id: "telefon2", tur: "esya", sablon: "telefon", mekan: "ev2-salon", x: 900, y: 640 },
      { id: "top3", tur: "esya", sablon: "top", mekan: "bahce2", x: 860, y: 630 },
      { id: "sulama2", tur: "esya", sablon: "sulama-kabi", mekan: "bahce2", x: 620, y: 640 },
      { id: "kupa3", tur: "esya", sablon: "kupa", mekan: "ev3-oda", x: 650, y: 620 },
      { id: "ayi1", tur: "karakter", sablon: "ayi", mekan: "park", x: 820, y: 600 },
      { id: "cicek2", tur: "esya", sablon: "cicek", mekan: "park", x: 400, y: 640 },
      { id: "top2", tur: "esya", sablon: "top", mekan: "park", x: 560, y: 660 },
      { id: "kova2", tur: "esya", sablon: "kova", mekan: "oyun", x: 1100, y: 620 },
      { id: "boya2", tur: "esya", sablon: "boya", mekan: "okul", x: 500, y: 640 },
      { id: "kitap2", tur: "esya", sablon: "kitap", mekan: "okul", x: 760, y: 660 },
      { id: "kupa2", tur: "esya", sablon: "kupa", mekan: "kafe", x: 860, y: 620 },
      { id: "stetoskop1", tur: "esya", sablon: "stetoskop", mekan: "hastane", x: 760, y: 640 },
      { id: "tarak1", tur: "esya", sablon: "tarak", mekan: "kuafor", x: 560, y: 640 },
      { id: "fon1", tur: "esya", sablon: "fon", mekan: "kuafor", x: 680, y: 660 },
      { id: "sampuan2", tur: "esya", sablon: "sampuan", mekan: "kuafor", x: 920, y: 620 },
    ],
  },
};
