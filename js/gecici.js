// Geçici mekan resimleri, eşya şekilleri ve simgeler.
// Kızın çizimleri gelince mekan ve eşya resimleri bunların yerine geçer.

window.GECICI = (k) => {
  const KALEM = k.rgb(70, 50, 40);
  const r = (x, y, w, h, renk, ek = []) => k.add([k.rect(w, h, { radius: 6 }), k.pos(x, y), k.color(...renk), k.z(-100), ...ek]);
  const c = (x, y, yc, renk, z = -100) => k.add([k.circle(yc), k.pos(x, y), k.color(...renk), k.z(z)]);
  const cizgi = [k.outline(4, KALEM)];

  function duvar(renk, desen) {
    r(0, 0, 1280, 720, renk);
    for (let x = 40; x < 1280; x += 90) for (let y = 40; y < 440; y += 90) c(x + ((y / 90) % 2) * 45, y, 6, desen);
  }
  function parke(renk, cizgiRenk) {
    r(0, 460, 1280, 260, renk);
    for (let y = 500; y < 720; y += 55) r(0, y, 1280, 4, cizgiRenk);
  }

  const mekanlar = {
    oda() {
      duvar([252, 228, 196], [240, 200, 170]);
      parke([206, 158, 112], [180, 132, 90]);
      r(300, 110, 240, 190, [175, 220, 250], cizgi);
      r(416, 110, 8, 190, [120, 80, 60]);
      r(300, 200, 240, 8, [120, 80, 60]);
      // yatak
      r(640, 330, 340, 150, [120, 160, 230], cizgi);
      r(650, 300, 90, 60, [255, 255, 255], cizgi);
      k.add([k.circle(100), k.pos(560, 620), k.scale(2.6, 0.6), k.color(160, 120, 200), k.z(-99)]);
    },
    mutfak() {
      duvar([220, 240, 215], [195, 225, 190]);
      for (let i = 0; i < 22; i++) for (let j = 0; j < 5; j++) r(i * 60, 460 + j * 60, 60, 60, (i + j) % 2 ? [245, 245, 240] : [215, 210, 205]);
      // buzdolabı
      r(260, 150, 170, 320, [240, 245, 250], cizgi);
      r(260, 270, 170, 6, [70, 50, 40]);
      r(400, 190, 10, 50, [160, 160, 170]);
      // masa
      r(640, 370, 300, 26, [190, 130, 80], cizgi);
      r(660, 396, 20, 80, [160, 105, 65]);
      r(900, 396, 20, 80, [160, 105, 65]);
    },
    banyo() {
      duvar([215, 235, 250], [190, 215, 240]);
      for (let x = 0; x < 1280; x += 50) for (let y = 460; y < 720; y += 50) r(x, y, 48, 48, [235, 245, 255]);
      // küvet
      r(560, 330, 400, 140, [255, 255, 255], cizgi);
      r(580, 345, 360, 30, [150, 205, 240]);
      // ayna ve lavabo
      r(300, 120, 140, 160, [200, 230, 245], cizgi);
      r(290, 310, 160, 40, [255, 255, 255], cizgi);
    },
  };

  // Kapı: yazı yok, sadece kapı ve ok simgesi.
  function kapi(d, resimVar) {
    if (!resimVar) {
      r(d.x, d.y, d.w, d.h, [150, 95, 60], cizgi);
      c(d.x + (d.x > 640 ? 24 : d.w - 24), d.y + d.h / 2, 9, [250, 210, 90], -99);
    }
    const sag = d.x > 640, cx = d.x + d.w / 2, cy = d.y - 40, y = sag ? 1 : -1;
    k.add([k.circle(30), k.pos(cx, cy), k.color(255, 255, 255), k.outline(4, KALEM), k.z(-50)]);
    k.add([k.polygon([k.vec2(-14 * y, -16), k.vec2(16 * y, 0), k.vec2(-14 * y, 16)]), k.pos(cx + 2 * y, cy), k.color(70, 50, 40), k.z(-49)]);
  }

  // Eşya şekilleri. Merkez noktası eşyanın tabanıdır.
  const esya = {
    top: () => [k.circle(28), k.color(235, 70, 70), k.outline(4, KALEM)],
    elma: () => [k.circle(25), k.color(220, 40, 50), k.outline(4, KALEM)],
    ordek: () => [k.circle(28), k.color(255, 215, 60), k.outline(4, KALEM)],
  };
  // Şekle küçük süsler ekler (çocuk nesneler).
  const sus = {
    top: (o) => o.add([k.rect(56, 8), k.anchor("center"), k.color(255, 255, 255)]),
    elma: (o) => o.add([k.rect(6, 16), k.pos(0, -30), k.anchor("center"), k.color(110, 70, 40)]),
    ordek: (o) => {
      o.add([k.circle(16), k.pos(14, -26), k.color(255, 215, 60), k.outline(4, KALEM)]);
      o.add([k.polygon([k.vec2(26, -30), k.vec2(42, -24), k.vec2(26, -20)]), k.color(250, 140, 40)]);
      o.add([k.circle(3), k.pos(18, -30), k.color(30, 30, 30)]);
    },
  };

  // Kalp simgesi (konuşma balonunun yerine).
  function kalp(x, y) {
    const o = k.add([k.pos(x, y), k.scale(1), k.opacity(1), k.z(4000)]);
    o.add([k.circle(15), k.pos(-11, -6), k.color(240, 70, 110)]);
    o.add([k.circle(15), k.pos(11, -6), k.color(240, 70, 110)]);
    o.add([k.polygon([k.vec2(-25, 0), k.vec2(25, 0), k.vec2(0, 28)]), k.color(240, 70, 110)]);
    return o;
  }

  return { mekanlar, kapi, esya, sus, kalp };
};
