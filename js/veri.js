// Dünyanın tüm içeriği burada durur.
// Yeni çizim eklemek için sadece bu dosya değişir.
// Resimler araclar/uret.py ile üretilir.

// Odaların ortak perspektif çizgileri (araclar/uret.py ile aynı sayılar).
const ZEMIN = {
  ust: 480, alt: 690, sol: 30, sag: 1250,
  ufuk: { x: 640, y: 120 }, arka: { sol: 200, sag: 1080, y: 440 },
};
// Yan duvar kapıları. Dokunma alanı kapının resmini kapsar.
const KAPI_SOL = { x: 30, y: 185, w: 135, h: 380 };
const KAPI_SAG = { x: 1115, y: 185, w: 135, h: 380 };

window.OYUN_VERI = {
  // Şablonlar: bir çizim bir kez tanımlanır, dünyada birçok kez kullanılır.
  karakterler: {
    // resim: hacimli PNG. parcalar: araclar/parcala.py çıktısı. boy: ekranın önündeki piksel boyu.
    kedi: { resim: "cizimler/hacimli/kedi.png", parcalar: "kedi", boy: 300 },
    kiz: { resim: "cizimler/hacimli/kiz.png", parcalar: "kiz", boy: 360 },
    ayi: { resim: "cizimler/hacimli/ayi.png", boy: 310 },
  },
  esyalar: {
    // resim: eşyanın PNG dosyası. boy: ekranın önündeki piksel boyu.
    // yenir: karakterin ağzına götürülünce yenir. Değer kırıntının rengidir.
    top: { resim: "cizimler/esya/top.png", boy: 74 },
    telefon: { resim: "cizimler/esya/telefon.png", boy: 62 },
    kitap: { resim: "cizimler/esya/kitap.png", boy: 58 },
    tahin: { resim: "cizimler/esya/tahin.png", boy: 70, yenir: [200, 160, 90] },
    elma: { resim: "cizimler/esya/elma.png", boy: 50, yenir: [235, 225, 180] },
    sut: { resim: "cizimler/esya/sut.png", boy: 84, yenir: [250, 250, 255] },
    kupa: { resim: "cizimler/esya/kupa.png", boy: 48 },
    ordek: { resim: "cizimler/esya/ordek.png", boy: 60 },
    sabun: { resim: "cizimler/esya/sabun.png", boy: 34 },
    sampuan: { resim: "cizimler/esya/sampuan.png", boy: 82 },
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
    araba: { resim: "cizimler/esya/araba.png", boy: 60 },
    kup: { resim: "cizimler/esya/kup.png", boy: 54 },
    boya: { resim: "cizimler/esya/boya.png", boy: 22 },
    "dis-fircasi": { resim: "cizimler/esya/dis-fircasi.png", boy: 26 },
    "dis-macunu": { resim: "cizimler/esya/dis-macunu.png", boy: 28 },
    havlu: { resim: "cizimler/esya/havlu.png", boy: 44 },
  },

  // Mekanlar. resim: arka plan. zemin: karakterlerin durduğu bant. kapilar: başka mekana geçiş.
  // noktalar: dokununca bir şey olan yerler.
  //   musluk: su akar ya da durur. su: suyun başladığı yer ve boyu.
  //   dolap: dokununca açılır ya da kapanır. resim: açık hali, sol üst köşesi x0, y0.
  //          raflar: raftaki yiyecekler. Biri alınınca yerine yenisi gelir.
  mekanlar: {
    oda: {
      resim: "cizimler/mekan/oda.jpg",
      zemin: ZEMIN,
      kapilar: [{ ...KAPI_SAG, hedef: "mutfak", giris: { x: 260, y: 580 } }],
    },
    mutfak: {
      resim: "cizimler/mekan/mutfak.jpg",
      zemin: ZEMIN,
      kapilar: [
        { ...KAPI_SOL, hedef: "oda", giris: { x: 1020, y: 580 } },
        { ...KAPI_SAG, hedef: "banyo", giris: { x: 260, y: 580 } },
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
      ],
    },
    banyo: {
      resim: "cizimler/mekan/banyo.jpg",
      zemin: ZEMIN,
      kapilar: [{ ...KAPI_SOL, hedef: "mutfak", giris: { x: 1020, y: 580 } }],
      noktalar: [
        { tur: "musluk", x: 300, y: 255, w: 150, h: 90, su: { x: 393, y: 270, boy: 30 } },
        { tur: "musluk", x: 950, y: 235, w: 95, h: 95, su: { x: 985, y: 270, boy: 45 } },
      ],
    },
  },

  // Oyun ilk açıldığında dünyanın hali. Sonra her değişiklik kaydedilir.
  baslangic: {
    mekan: "oda",
    varliklar: [
      { id: "kiz1", tur: "karakter", sablon: "kiz", mekan: "oda", x: 470, y: 600 },
      { id: "kedi1", tur: "karakter", sablon: "kedi", mekan: "oda", x: 780, y: 580 },
      { id: "top1", tur: "esya", sablon: "top", mekan: "oda", x: 640, y: 665 },
      { id: "telefon1", tur: "esya", sablon: "telefon", mekan: "oda", x: 330, y: 650 },
      { id: "kitap1", tur: "esya", sablon: "kitap", mekan: "oda", x: 930, y: 660 },
      { id: "ayi1", tur: "karakter", sablon: "ayi", mekan: "mutfak", x: 700, y: 590 },
      { id: "elma1", tur: "esya", sablon: "elma", mekan: "mutfak", x: 500, y: 640 },
      { id: "elma2", tur: "esya", sablon: "elma", mekan: "mutfak", x: 545, y: 670 },
      { id: "tahin1", tur: "esya", sablon: "tahin", mekan: "mutfak", x: 880, y: 650 },
      { id: "sut1", tur: "esya", sablon: "sut", mekan: "mutfak", x: 960, y: 610 },
      { id: "kupa1", tur: "esya", sablon: "kupa", mekan: "mutfak", x: 400, y: 600 },
      { id: "ordek1", tur: "esya", sablon: "ordek", mekan: "banyo", x: 720, y: 650 },
      { id: "sabun1", tur: "esya", sablon: "sabun", mekan: "banyo", x: 520, y: 640 },
      { id: "sampuan1", tur: "esya", sablon: "sampuan", mekan: "banyo", x: 420, y: 610 },
      { id: "araba1", tur: "esya", sablon: "araba", mekan: "oda", x: 560, y: 690 },
      { id: "kup1", tur: "esya", sablon: "kup", mekan: "oda", x: 800, y: 670 },
      { id: "boya1", tur: "esya", sablon: "boya", mekan: "oda", x: 220, y: 680 },
      { id: "muz1", tur: "esya", sablon: "muz", mekan: "mutfak", x: 620, y: 690 },
      { id: "ekmek1", tur: "esya", sablon: "ekmek", mekan: "mutfak", x: 770, y: 685 },
      { id: "kurabiye1", tur: "esya", sablon: "kurabiye", mekan: "mutfak", x: 440, y: 690 },
      { id: "portakal1", tur: "esya", sablon: "portakal", mekan: "mutfak", x: 1000, y: 680 },
      { id: "pasta1", tur: "esya", sablon: "pasta", mekan: "mutfak", x: 1080, y: 640 },
      { id: "fircasi1", tur: "esya", sablon: "dis-fircasi", mekan: "banyo", x: 600, y: 690 },
      { id: "macun1", tur: "esya", sablon: "dis-macunu", mekan: "banyo", x: 880, y: 685 },
      { id: "havlu1", tur: "esya", sablon: "havlu", mekan: "banyo", x: 1000, y: 640 },
    ],
  },
};
