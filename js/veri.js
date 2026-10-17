// Oyunun tüm içeriği burada durur.
// Yeni çizim eklemek için kod değil, sadece bu dosya değişir.

window.OYUN_VERI = {
  // Oyuncunun yönettiği karakterler.
  // resim: temizlenmiş PNG, boy: ekranın önünde piksel boyu.
  // parcalar: araclar/parcala.py ile bölünmüş hareketli parçalar (isteğe bağlı).
  karakterler: [
    { id: "kedi", ad: "Kedi", resim: "cizimler/kedi.png", parcalar: "kedi", boy: 300, soz: "Miyav! Merhaba!" },
  ],

  // Mekanlar. "gecici" alanı, çizim gelene kadar kodla çizilen geçici resmi seçer.
  // Kızın çizimi gelince "resim": "cizimler/ev.png" eklenir.
  mekanlar: {
    ev: {
      ad: "Ev",
      gecici: "ev",
      zemin: { ust: 480, alt: 690, sol: 80, sag: 1200 },
      kapilar: [
        { x: 1060, y: 215, w: 140, h: 265, hedef: "bahce", varis: { x: 1110, y: 520 }, giris: { x: 230, y: 560 }, etiket: "Bahçe" },
      ],
      esyalar: [
        { id: "top", tur: "top", x: 420, y: 640, mesaj: "Bir top buldum!" },
      ],
    },
    bahce: {
      ad: "Bahçe",
      gecici: "bahce",
      zemin: { ust: 470, alt: 690, sol: 80, sag: 1200 },
      kapilar: [
        { x: 70, y: 225, w: 140, h: 245, hedef: "ev", varis: { x: 150, y: 510 }, giris: { x: 1040, y: 560 }, etiket: "Ev" },
      ],
      esyalar: [
        { id: "yildiz", tur: "yildiz", x: 880, y: 600, mesaj: "Parlak bir yıldız!" },
      ],
    },
  },

  baslangic: { mekan: "ev", x: 600, y: 600 },
};
