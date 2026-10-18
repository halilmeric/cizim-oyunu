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

  // Kapı: yazı yok. Kapının üstünde gidilen yerin simgesi ve bir ok durur.
  function kapi(d, resimVar, simge) {
    if (!resimVar) {
      r(d.x, d.y, d.w, d.h, [150, 95, 60], cizgi);
      c(d.x + (d.x > 640 ? 24 : d.w - 24), d.y + d.h / 2, 9, [250, 210, 90], -99);
    }
    const sag = d.x > 640, cx = d.x + d.w / 2, cy = d.y - 40, y = sag ? 1 : -1;
    if (simge) k.add([k.sprite("simge-" + simge, { width: 64, height: 64 }), k.pos(cx, cy), k.anchor("center"), k.z(-50)]);
    else k.add([k.circle(30), k.pos(cx, cy), k.color(255, 255, 255), k.outline(4, KALEM), k.z(-50)]);
    const ox = simge ? cx + 40 * y : cx + 2 * y, s = simge ? 0.7 : 1;
    k.add([k.polygon([k.vec2(-14 * y * s, -16 * s), k.vec2(16 * y * s, 0), k.vec2(-14 * y * s, 16 * s)]), k.pos(ox, cy), k.color(70, 50, 40), k.z(-49)]);
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

  // Yemek kırıntısı: küçük daireler düşer ve solar.
  function kirinti(p, renk) {
    for (let i = 0; i < 5; i++) {
      const o = k.add([k.circle(k.rand(3, 6)), k.pos(p.x + k.rand(-14, 14), p.y), k.color(...renk), k.opacity(1), k.z(4800)]);
      const vx = k.rand(-90, 90);
      let vy = k.rand(-180, -60);
      o.onUpdate(() => {
        vy += 900 * k.dt();
        o.pos.x += vx * k.dt(); o.pos.y += vy * k.dt();
        o.opacity -= k.dt() * 1.6;
        if (o.opacity <= 0) o.destroy();
      });
    }
  }

  // Akan su: musluktan aşağı inen şerit ve dipte sıçrayan damlalar. Dönen nesne hidden ile açılıp kapanır.
  function su(x, y, boy, renk = [70, 155, 235]) {
    const o = k.add([k.pos(x, y), k.z(-40)]);
    const serit = o.add([k.rect(11, boy, { radius: 5 }), k.anchor("top"), k.color(...renk), k.opacity(0.9)]);
    o.add([k.rect(3, boy, { radius: 2 }), k.pos(-2, 0), k.anchor("top"), k.color(230, 245, 255), k.opacity(0.8)]);
    let sayac = 0;
    o.onUpdate(() => {
      if (o.hidden) return;
      serit.width = 10 + Math.sin(k.time() * 30) * 1.5;
      sayac -= k.dt();
      if (sayac > 0) return;
      sayac = 0.05;
      const d = o.add([k.circle(k.rand(2, 4)), k.pos(k.rand(-4, 4), boy), k.color(...renk.map((c) => Math.min(255, c + 90))), k.opacity(1)]);
      const vx = k.rand(-70, 70);
      let vy = k.rand(-140, -60);
      d.onUpdate(() => {
        vy += 700 * k.dt();
        d.pos.x += vx * k.dt(); d.pos.y += vy * k.dt();
        d.opacity -= k.dt() * 3;
        if (d.opacity <= 0) d.destroy();
      });
    });
    return o;
  }

  // Banyo köpüğü: yükselip sallanan, sonra sönen baloncuk.
  function kopuk(x, y, z = -79, r = k.rand(5, 13)) {
    const o = k.add([k.circle(r), k.pos(x, y), k.color(250, 252, 255), k.outline(2, k.rgb(170, 210, 240)), k.opacity(0.9), k.z(z)]);
    const hiz = k.rand(30, 70), faz = k.rand(0, 6), omur = k.rand(1.2, 2.4);
    let yas = 0;
    o.onUpdate(() => {
      yas += k.dt();
      o.pos.y -= hiz * k.dt();
      o.pos.x += Math.sin(yas * 4 + faz) * 0.6;
      o.opacity = 0.9 * (1 - yas / omur);
      if (yas >= omur) o.destroy();
    });
  }

  // Nota simgesi: ses çıkan eşyalar için. Yükselir ve söner.
  function nota(x, y, renk = [120, 90, 220]) {
    const o = k.add([k.pos(x, y), k.opacity(1), k.z(4800)]);
    o.add([k.circle(7), k.pos(0, 0), k.color(...renk)]);
    o.add([k.rect(3, 24), k.pos(4, -24), k.color(...renk)]);
    o.add([k.rect(12, 4), k.pos(4, -24), k.color(...renk)]);
    const vx = k.rand(-30, 30);
    let yas = 0;
    o.onUpdate(() => {
      yas += k.dt();
      o.pos.y -= 50 * k.dt(); o.pos.x += vx * k.dt();
      o.children.forEach((c) => (c.opacity = 1 - yas));
      if (yas >= 1) o.destroy();
    });
  }

  // Yazı kağıdı: kalemin çizdiği noktalar üstünde birikir.
  function kagit(x, y, z) {
    const o = k.add([k.pos(x, y), k.z(z)]);
    o.add([k.rect(96, 72, { radius: 4 }), k.anchor("center"), k.color(255, 255, 250), k.outline(3, KALEM)]);
    for (let i = -1; i <= 1; i++) o.add([k.rect(76, 2), k.pos(0, i * 18), k.anchor("center"), k.color(190, 210, 235)]);
    return o;
  }

  // Piksel sansür: renkleri sürekli değişen kareler. ayarla(x, y, en, boy, z) ile yerleşir.
  function sansur() {
    const S = 6, Y = 4, o = k.add([k.pos(0, 0), k.scale(1), k.anchor("center"), k.z(0)]);
    const kareler = [];
    for (let i = 0; i < S; i++) for (let j = 0; j < Y; j++) kareler.push(o.add([k.rect(10, 10), k.pos(i * 10 - S * 5, j * 10 - Y * 5), k.color(0, 0, 0)]));
    let sayac = 0;
    const boya = () => kareler.forEach((c) => { const g = k.rand(0.6, 1); c.color = k.rgb(230 * g, 170 * g, 150 * g); });
    boya();
    o.onUpdate(() => { sayac -= k.dt(); if (sayac <= 0) { sayac = 0.12; boya(); } });
    o.ayarla = (x, y, en, boy, z) => { o.pos = k.vec2(x, y); o.scale = k.vec2(en / (S * 10), boy / (Y * 10)); o.z = z; };
    return o;
  }

  // Fıskiye: yukarı fışkıran su damlaları. Dönen nesne hidden ile açılıp kapanır.
  function fiskiye(x, y) {
    const o = k.add([k.pos(x, y), k.z(-40)]);
    let sayac = 0;
    o.onUpdate(() => {
      if (o.hidden) return;
      sayac -= k.dt();
      if (sayac > 0) return;
      sayac = 0.025;
      const d = o.add([k.circle(k.rand(3, 6)), k.pos(k.rand(-4, 4), 0), k.color(150, 210, 250), k.opacity(0.95)]);
      const vx = k.rand(-90, 90);
      let vy = k.rand(-520, -380);
      d.onUpdate(() => {
        vy += 900 * k.dt();
        d.pos.x += vx * k.dt(); d.pos.y += vy * k.dt();
        if (d.pos.y > 110) d.opacity -= k.dt() * 4;
        if (d.opacity <= 0) d.destroy();
      });
    });
    return o;
  }

  // Uyku: başın üstünden yükselen Z harfleri.
  function zzz(x, y) {
    const o = k.add([k.text("Z", { size: k.rand(22, 32), font: "sans-serif" }), k.pos(x, y), k.color(90, 90, 170), k.opacity(1), k.anchor("center"), k.z(4800)]);
    let yas = 0;
    o.onUpdate(() => {
      yas += k.dt();
      o.pos.y -= 40 * k.dt(); o.pos.x += 18 * k.dt();
      o.opacity = 1 - yas / 1.6;
      if (yas >= 1.6) o.destroy();
    });
  }

  // Parıltı: dört köşeli küçük yıldız. Tarak ve fön için.
  function parilti(x, y, renk = [255, 220, 90]) {
    const p = (a, r) => k.vec2(Math.cos(a) * r, Math.sin(a) * r);
    const n = [];
    for (let i = 0; i < 8; i++) n.push(p((i * Math.PI) / 4, i % 2 ? 4 : 12));
    const o = k.add([k.polygon(n), k.pos(x, y), k.color(...renk), k.opacity(1), k.scale(1), k.rotate(0), k.z(4800)]);
    let yas = 0;
    o.onUpdate(() => {
      yas += k.dt();
      o.angle += 180 * k.dt(); o.pos.y -= 20 * k.dt();
      o.opacity = 1 - yas / 0.8;
      if (yas >= 0.8) o.destroy();
    });
  }

  return { mekanlar, kapi, esya, sus, kalp, kirinti, su, kopuk, nota, kagit, sansur, fiskiye, zzz, parilti };
};
