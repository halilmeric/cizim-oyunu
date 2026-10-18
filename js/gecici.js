// Geçici mekan resimleri ve eşya şekilleri.
// Kızın mekan çizimleri gelince bu resimler kullanılmaz.

window.GECICI = (k) => {
  const r = (x, y, w, h, renk, ek = []) =>
    k.add([k.rect(w, h, { radius: 6 }), k.pos(x, y), k.color(...renk), k.z(-100), ...ek]);
  const c = (x, y, yc, renk, z = -100) =>
    k.add([k.circle(yc), k.pos(x, y), k.color(...renk), k.z(z)]);
  const cizgi = [k.outline(4, k.rgb(70, 50, 40))];

  const mekanlar = {
    ev() {
      r(0, 0, 1280, 720, [252, 228, 196]);
      // duvar kağıdı noktaları
      for (let x = 40; x < 1280; x += 90)
        for (let y = 40; y < 440; y += 90) c(x + ((y / 90) % 2) * 45, y, 6, [240, 200, 170]);
      r(0, 460, 1280, 260, [206, 158, 112]);
      for (let y = 500; y < 720; y += 55) r(0, y, 1280, 4, [180, 132, 90]);
      // pencere
      r(170, 110, 240, 190, [175, 220, 250], cizgi);
      r(286, 110, 8, 190, [120, 80, 60]);
      r(170, 200, 240, 8, [120, 80, 60]);
      // tablo
      r(560, 130, 150, 110, [255, 245, 220], cizgi);
      c(635, 185, 30, [240, 150, 150], -99);
      // halı
      k.add([k.circle(100), k.pos(640, 610), k.scale(2.6, 0.7), k.color(160, 120, 200), k.z(-99)]);
      k.add([k.circle(100), k.pos(640, 610), k.scale(2.1, 0.5), k.color(190, 160, 225), k.z(-99)]);
    },
    bahce() {
      r(0, 0, 1280, 720, [170, 215, 250]);
      c(1130, 110, 60, [255, 214, 80]);
      for (const [x, y] of [[420, 100], [760, 150]]) {
        c(x, y, 40, [255, 255, 255]); c(x + 45, y - 10, 50, [255, 255, 255]); c(x + 95, y, 38, [255, 255, 255]);
      }
      r(0, 450, 1280, 270, [128, 198, 108]);
      // ev duvarı
      r(0, 160, 300, 300, [245, 205, 160], cizgi);
      k.add([k.polygon([k.vec2(-20, 160), k.vec2(150, 40), k.vec2(320, 160)]), k.color(200, 90, 80), k.z(-100)]);
      // ağaç
      r(560, 260, 50, 210, [140, 95, 60]);
      for (const [x, y, s] of [[585, 230, 90], [520, 280, 65], [650, 280, 65]]) c(x, y, s, [90, 165, 85]);
      // çiçekler
      for (const [x, y, renk] of [[380, 520, [255, 120, 160]], [720, 500, [255, 200, 60]], [1000, 530, [180, 130, 230]], [1180, 600, [255, 120, 160]]]) {
        r(x - 2, y, 4, 30, [70, 140, 60]);
        c(x, y, 12, renk, -99); c(x, y, 5, [255, 240, 150], -98);
      }
    },
  };

  // Kapıyı çizer. Mekan resmi olsa da kapı işareti görünür.
  function kapi(d, resimVar) {
    if (!resimVar) {
      r(d.x, d.y, d.w, d.h, [150, 95, 60], cizgi);
      c(d.x + (d.x > 640 ? 22 : d.w - 22), d.y + d.h / 2, 9, [250, 210, 90], -99);
    }
    const ok = d.x > 640 ? "→" : "←";
    const etiket = d.x > 640 ? `${d.etiket} ${ok}` : `${ok} ${d.etiket}`;
    k.add([k.rect(150, 44, { radius: 22 }), k.pos(d.x + d.w / 2, d.y - 34), k.anchor("center"), k.color(255, 255, 255), k.outline(3, k.rgb(70, 50, 40)), k.z(-50)]);
    k.add([k.text(etiket, { size: 24 }), k.pos(d.x + d.w / 2, d.y - 34), k.anchor("center"), k.color(70, 50, 40), k.z(-49)]);
  }

  // Eşya şekilleri. Çizim gelince eşya da PNG olur.
  const esya = {
    top: () => [k.circle(26), k.color(235, 70, 70), k.outline(4, k.rgb(70, 50, 40))],
    yildiz: () => {
      const n = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 14 : 32;
        n.push(k.vec2(Math.cos(a) * rr, Math.sin(a) * rr));
      }
      return [k.polygon(n), k.color(255, 210, 50), k.outline(4, k.rgb(70, 50, 40))];
    },
  };

  return { mekanlar, kapi, esya };
};
