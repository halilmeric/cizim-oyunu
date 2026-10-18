// Dünyanın tüm içeriği burada durur.
// Yeni çizim eklemek için sadece bu dosya değişir.

window.OYUN_VERI = {
  // Şablonlar: bir çizim bir kez tanımlanır, dünyada birçok kez kullanılır.
  karakterler: {
    // resim: temizlenmiş PNG. parcalar: araclar/parcala.py çıktısı. boy: ekranın önündeki piksel boyu.
    kedi: { resim: "cizimler/kedi.png", parcalar: "kedi", boy: 300 },
  },
  esyalar: {
    // sekil: çizim gelene kadar kodla çizilen geçici şekil. Çizim gelince "resim" eklenir.
    top: { sekil: "top", boy: 56 },
    elma: { sekil: "elma", boy: 50 },
    ordek: { sekil: "ordek", boy: 60 },
  },

  // Mekanlar. zemin: karakterlerin durduğu bant. kapilar: başka mekana geçiş.
  mekanlar: {
    oda: {
      gecici: "oda",
      zemin: { ust: 470, alt: 690, sol: 60, sag: 1220 },
      kapilar: [{ x: 1080, y: 200, w: 140, h: 270, hedef: "mutfak", giris: { x: 220, y: 560 } }],
    },
    mutfak: {
      gecici: "mutfak",
      zemin: { ust: 470, alt: 690, sol: 60, sag: 1220 },
      kapilar: [
        { x: 60, y: 200, w: 140, h: 270, hedef: "oda", giris: { x: 1060, y: 560 } },
        { x: 1080, y: 200, w: 140, h: 270, hedef: "banyo", giris: { x: 220, y: 560 } },
      ],
    },
    banyo: {
      gecici: "banyo",
      zemin: { ust: 470, alt: 690, sol: 60, sag: 1220 },
      kapilar: [{ x: 60, y: 200, w: 140, h: 270, hedef: "mutfak", giris: { x: 1060, y: 560 } }],
    },
  },

  // Oyun ilk açıldığında dünyanın hali. Sonra her değişiklik kaydedilir.
  baslangic: {
    mekan: "oda",
    varliklar: [
      { id: "kedi1", tur: "karakter", sablon: "kedi", mekan: "oda", x: 480, y: 600 },
      { id: "kedi2", tur: "karakter", sablon: "kedi", renk: [255, 205, 225], mekan: "oda", x: 800, y: 560 },
      { id: "top1", tur: "esya", sablon: "top", mekan: "oda", x: 650, y: 660 },
      { id: "elma1", tur: "esya", sablon: "elma", mekan: "mutfak", x: 700, y: 620 },
      { id: "elma2", tur: "esya", sablon: "elma", mekan: "mutfak", x: 760, y: 600 },
      { id: "ordek1", tur: "esya", sablon: "ordek", mekan: "banyo", x: 640, y: 640 },
    ],
  },
};
