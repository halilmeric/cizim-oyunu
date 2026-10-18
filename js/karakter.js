// Parçalı karakter: bir kök nesne ve ona bağlı kol, bacak, kuyruk parçaları.

window.KARAKTER = (k, VERI) => {
  function parcaVerisi(s) {
    return s.parcalar && window.KARAKTER_PARCALARI ? window.KARAKTER_PARCALARI[s.parcalar] : null;
  }

  function yukle() {
    Object.entries(VERI.karakterler).forEach(([id, s]) => {
      const P = parcaVerisi(s);
      if (P) P.parcalar.forEach((p) => k.loadSprite(id + "-" + p.ad, p.resim));
      else k.loadSprite(id, s.resim);
    });
  }

  // Bir karakter nesnesi kurar. Dönen nesnenin genislik ve yukseklik değeri çizim pikselidir.
  function kur(sablonId, renk) {
    const s = VERI.karakterler[sablonId], P = parcaVerisi(s);
    const kok = k.add([k.pos(0, 0), k.scale(1), k.rotate(0), k.z(0)]);
    const parca = {};
    const boya = renk ? [k.color(...renk)] : [];
    let genislik, yukseklik;
    if (P) {
      genislik = P.genislik; yukseklik = P.yukseklik;
      [...P.parcalar].sort((a, b) => a.z - b.z).forEach((p) => {
        const ax = ((p.pivot[0] - p.x) / p.w) * 2 - 1, ay = ((p.pivot[1] - p.y) / p.h) * 2 - 1;
        parca[p.hareket] = kok.add([k.sprite(sablonId + "-" + p.ad), k.pos(p.pivot[0] - genislik / 2, p.pivot[1] - yukseklik), k.anchor(k.vec2(ax, ay)), k.rotate(0), ...boya]);
      });
    } else {
      const g = kok.add([k.sprite(sablonId), k.anchor("bot"), ...boya]);
      genislik = g.width; yukseklik = g.height;
    }
    return { kok, parca, genislik, yukseklik, boy: s.boy };
  }

  // Parçaları oynatır. hal: "dur", "yuru", "tutuluyor", "salla". Açı artınca parça saat yönünde döner.
  function canlandir(kr, t, hal) {
    const p = kr.parca, f = Math.sin(t * 11);
    const aci = {
      dur: { ks: Math.sin(t * 1.8) * 4, kg: -Math.sin(t * 1.8) * 4, bs: 0, bg: 0, ku: Math.sin(t * 2.5) * 10 },
      yuru: { ks: f * 26, kg: f * 26, bs: f * 12, bg: -f * 12, ku: Math.sin(t * 8) * 16 },
      tutuluyor: { ks: -30 + Math.sin(t * 16) * 25, kg: 30 - Math.sin(t * 16) * 25, bs: Math.sin(t * 9) * 18, bg: -Math.sin(t * 9) * 18, ku: Math.sin(t * 10) * 25 },
      salla: { ks: Math.sin(t * 1.8) * 4, kg: -40 + Math.sin(t * 14) * 22, bs: 0, bg: 0, ku: Math.sin(t * 6) * 18 },
    }[hal];
    if (p["kol-sol"]) p["kol-sol"].angle = aci.ks;
    if (p["kol-sag"]) p["kol-sag"].angle = aci.kg;
    if (p["bacak-sol"]) p["bacak-sol"].angle = aci.bs;
    if (p["bacak-sag"]) p["bacak-sag"].angle = aci.bg;
    if (p["kuyruk"]) p["kuyruk"].angle = aci.ku;
  }

  return { yukle, kur, canlandir };
};
