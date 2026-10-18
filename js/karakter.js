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
    // El: eşya tutulan nokta. Sağ ve sol el var. Ağız: yemek götürülen nokta. Hepsi çizim pikselidir.
    let el = { parca: kok, nokta: k.vec2(genislik * (s.el ? s.el[0] : 0.38), -yukseklik * (s.el ? s.el[1] : 0.42)) };
    let elSol = { parca: kok, nokta: k.vec2(-genislik * 0.38, -yukseklik * 0.42) };
    const kol = P && P.parcalar.find((p) => p.hareket === "kol-sag");
    if (kol) el = { parca: parca["kol-sag"], nokta: k.vec2(kol.x + kol.w * 0.86 - kol.pivot[0], kol.y + kol.h * 0.5 - kol.pivot[1]) };
    const kolSol = P && P.parcalar.find((p) => p.hareket === "kol-sol");
    if (kolSol) elSol = { parca: parca["kol-sol"], nokta: k.vec2(kolSol.x + kolSol.w * 0.14 - kolSol.pivot[0], kolSol.y + kolSol.h * 0.5 - kolSol.pivot[1]) };
    if (s.eller === 1) elSol = el;
    const agiz = k.vec2(genislik * (s.agizX || 0), -yukseklik * (s.agiz || 0.74));
    return { kok, parca, genislik, yukseklik, boy: s.boy, el, elSol, eller: s.eller || 2, agiz };
  }

  // Bir nesnenin kendi koordinatındaki noktayı ebeveyninin koordinatına çevirir: ölçek, dönme, konum.
  function disari(o, p) {
    const sx = o.scale ? o.scale.x : 1, sy = o.scale ? o.scale.y : 1, a = ((o.angle || 0) * Math.PI) / 180;
    const x = p.x * sx, y = p.y * sy;
    return k.vec2(o.pos.x + x * Math.cos(a) - y * Math.sin(a), o.pos.y + x * Math.sin(a) + y * Math.cos(a));
  }
  // Elin ve ağzın ekrandaki yeri. Parçalar dönünce bu noktalar da döner.
  function elYeri(kr, taraf) {
    const el = taraf === "sol" ? kr.elSol : kr.el;
    const p = el.parca === kr.kok ? el.nokta : disari(el.parca, el.nokta);
    return disari(kr.kok, p);
  }
  // Karakterin üstünde bir nokta. x: ortadan genişlik oranı, y: ayaktan yükseklik oranı.
  function yer(kr, x, y) {
    return disari(kr.kok, k.vec2(kr.genislik * x, -kr.yukseklik * y));
  }
  function agizYeri(kr) {
    return disari(kr.kok, kr.agiz);
  }

  // Parçaları oynatır. hal: "dur", "yuru", "tutuluyor", "salla", "ye", "uyu", "dans", "dans2". Açı artınca parça saat yönünde döner.
  function canlandir(kr, t, hal) {
    const p = kr.parca, f = Math.sin(t * 11);
    const aci = {
      dur: { ks: Math.sin(t * 1.8) * 4, kg: -Math.sin(t * 1.8) * 4, bs: 0, bg: 0, ku: Math.sin(t * 2.5) * 10 },
      yuru: { ks: f * 26, kg: f * 26, bs: f * 12, bg: -f * 12, ku: Math.sin(t * 8) * 16 },
      tutuluyor: { ks: -30 + Math.sin(t * 16) * 25, kg: 30 - Math.sin(t * 16) * 25, bs: Math.sin(t * 9) * 18, bg: -Math.sin(t * 9) * 18, ku: Math.sin(t * 10) * 25 },
      salla: { ks: Math.sin(t * 1.8) * 4, kg: -40 + Math.sin(t * 14) * 22, bs: 0, bg: 0, ku: Math.sin(t * 6) * 18 },
      ye: { ks: Math.sin(t * 1.8) * 4, kg: -55 + Math.sin(t * 12) * 6, bs: 0, bg: 0, ku: Math.sin(t * 9) * 20 },
      // Uyurken kollar gövdenin yanına iner.
      uyu: { ks: -75, kg: 75, bs: 0, bg: 0, ku: Math.sin(t * 1.2) * 5 },
      // Dans: iki kol yukarıda sallanır. dans2: kollar sırayla iner kalkar, bacaklar tekme atar.
      dans: { ks: 55 + Math.sin(t * 9) * 25, kg: -55 + Math.sin(t * 9) * 25, bs: Math.sin(t * 9) * 12, bg: Math.sin(t * 9) * 12, ku: Math.sin(t * 12) * 30 },
      dans2: { ks: Math.sin(t * 8) * 60, kg: Math.sin(t * 8) * 60, bs: Math.max(0, Math.sin(t * 8)) * 25, bg: -Math.max(0, -Math.sin(t * 8)) * 25, ku: Math.sin(t * 12) * 30 },
    }[hal];
    if (p["kol-sol"]) p["kol-sol"].angle = aci.ks;
    if (p["kol-sag"]) p["kol-sag"].angle = aci.kg;
    if (p["bacak-sol"]) p["bacak-sol"].angle = aci.bs;
    if (p["bacak-sag"]) p["bacak-sag"].angle = aci.bg;
    if (p["kuyruk"]) p["kuyruk"].angle = aci.ku;
  }

  return { yukle, kur, canlandir, elYeri, agizYeri, yer };
};
