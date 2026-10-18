// Oyunun ana kodu: yürüme, kapılar, eşya toplama ve kayıt.

const VERI = window.OYUN_VERI;
const KAYIT_ANAHTARI = "cizim-oyunu-kayit";

const k = kaplay({
  width: 1280,
  height: 720,
  letterbox: true,
  background: [40, 40, 60],
  global: false,
  crisp: false,
});

const G = window.GECICI(k);

// --- Kayıt ---
function kayitOku() {
  try {
    const s = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI));
    if (s && VERI.mekanlar[s.mekan]) return s;
  } catch (e) {}
  return { mekan: VERI.baslangic.mekan, x: VERI.baslangic.x, y: VERI.baslangic.y, toplanan: [], karakter: 0 };
}
function kayitYaz() {
  try { localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(durum)); } catch (e) {}
}
const durum = kayitOku();

// --- Resimler ---
VERI.karakterler.forEach((c) => {
  const P = parcaVerisi(c);
  if (P) P.parcalar.forEach((p) => k.loadSprite(c.id + "-" + p.ad, p.resim));
  else k.loadSprite(c.id, c.resim);
});
function parcaVerisi(c) {
  return c.parcalar && window.KARAKTER_PARCALARI ? window.KARAKTER_PARCALARI[c.parcalar] : null;
}
Object.entries(VERI.mekanlar).forEach(([id, m]) => { if (m.resim) k.loadSprite("mekan-" + id, m.resim); });

const TUM_ESYALAR = Object.values(VERI.mekanlar).flatMap((m) => m.esyalar);

k.scene("mekan", ({ mekanId, x, y }) => {
  const m = VERI.mekanlar[mekanId];
  const z = m.zemin;
  durum.mekan = mekanId;
  kayitYaz();

  // Arka plan
  if (m.resim) k.add([k.sprite("mekan-" + mekanId, { width: 1280, height: 720 }), k.z(-100)]);
  else G.mekanlar[m.gecici]();

  // Kapılar
  const kapilar = m.kapilar.map((d) => {
    G.kapi(d, !!m.resim);
    return { d, alan: k.add([k.rect(d.w, d.h), k.pos(d.x, d.y), k.area(), k.opacity(0), k.z(-90)]) };
  });

  // Eşyalar
  const esyalar = m.esyalar
    .filter((e) => !durum.toplanan.includes(e.id))
    .map((e) => ({ e, obj: k.add([...G.esya[e.tur](), k.pos(e.x, e.y - 30), k.anchor("center"), k.area(), k.rotate(0), k.scale(1), k.z(e.y)]) }));

  // Karakter
  const kar = () => VERI.karakterler[durum.karakter % VERI.karakterler.length];
  const ayak = k.vec2(x, y);
  let hedef = null, varinca = null, yon = 1, elSalla = 0;

  // Karakter bir kök nesnedir. Parçalı çizimde kol, bacak ve kuyruk kökün çocuklarıdır.
  let govde, parca, govdeG, govdeY;
  function karakterKur() {
    if (govde) govde.destroy();
    const c = kar(), P = parcaVerisi(c);
    govde = k.add([k.pos(ayak), k.scale(1), k.rotate(0), k.z(ayak.y)]);
    parca = {};
    if (P) {
      govdeG = P.genislik; govdeY = P.yukseklik;
      [...P.parcalar].sort((a, b) => a.z - b.z).forEach((p) => {
        const ax = ((p.pivot[0] - p.x) / p.w) * 2 - 1, ay = ((p.pivot[1] - p.y) / p.h) * 2 - 1;
        parca[p.hareket] = govde.add([k.sprite(c.id + "-" + p.ad), k.pos(p.pivot[0] - govdeG / 2, p.pivot[1] - govdeY), k.anchor(k.vec2(ax, ay)), k.rotate(0)]);
      });
    } else {
      const s = govde.add([k.sprite(c.id), k.anchor("bot")]);
      govdeG = s.width; govdeY = s.height;
    }
  }
  karakterKur();

  function olcek() {
    const t = (ayak.y - z.ust) / (z.alt - z.ust);
    return (kar().boy / govdeY) * (0.72 + 0.28 * Math.max(0, Math.min(1, t)));
  }
  function karakteraDokundu(p) {
    const s = olcek();
    return Math.abs(p.x - ayak.x) < (govdeG * s) / 2 && p.y < ayak.y && p.y > ayak.y - govdeY * s;
  }

  // Parçaları oynatır. Açı artınca parça saat yönünde döner.
  function canlandir(t, yuruyor) {
    const f = Math.sin(t * 11);
    const sallar = t < elSalla;
    if (parca["kol-sol"]) parca["kol-sol"].angle = yuruyor ? f * 26 : Math.sin(t * 1.8) * 4;
    if (parca["kol-sag"]) parca["kol-sag"].angle = sallar ? -40 + Math.sin(t * 14) * 22 : yuruyor ? f * 26 : -Math.sin(t * 1.8) * 4;
    if (parca["bacak-sol"]) parca["bacak-sol"].angle = yuruyor ? f * 12 : 0;
    if (parca["bacak-sag"]) parca["bacak-sag"].angle = yuruyor ? -f * 12 : 0;
    if (parca["kuyruk"]) parca["kuyruk"].angle = Math.sin(t * (yuruyor ? 8 : 2.5)) * (yuruyor ? 16 : 10);
  }

  function yuru(p, sonra = null) {
    hedef = k.vec2(Math.max(z.sol, Math.min(z.sag, p.x)), Math.max(z.ust, Math.min(z.alt, p.y)));
    varinca = sonra;
  }

  // Konuşma balonu
  let balon = null;
  function konus(soz) {
    if (balon) balon.forEach((b) => b.destroy());
    const kutu = k.add([k.rect(soz.length * 15 + 40, 56, { radius: 18 }), k.pos(0, 0), k.anchor("center"), k.color(255, 255, 255), k.outline(4, k.rgb(70, 50, 40)), k.z(2000)]);
    const yazi = k.add([k.text(soz, { size: 26 }), k.pos(0, 0), k.anchor("center"), k.color(50, 40, 40), k.z(2001)]);
    balon = [kutu, yazi];
    const b = balon;
    k.wait(2.2, () => { b.forEach((o) => o.destroy()); if (balon === b) balon = null; });
  }

  function topla(item) {
    durum.toplanan.push(item.e.id);
    kayitYaz();
    esyalar.splice(esyalar.indexOf(item), 1);
    konus(item.e.mesaj);
    const o = item.obj;
    k.tween(o.pos.y, o.pos.y - 120, 0.6, (v) => (o.pos.y = v), k.easings.easeOutQuad);
    k.tween(1, 0, 0.6, (v) => (o.scale = k.vec2(v)), k.easings.easeInQuad).onEnd(() => o.destroy());
    hudCiz();
  }

  // Dokunma ve tıklama
  k.onMousePress(() => {
    const p = k.mousePos();
    if (hudTikla(p)) return;
    if (karakteraDokundu(p)) { elSalla = k.time() + 1.8; return konus(kar().soz); }
    const item = esyalar.find((i) => i.obj.hasPoint(p));
    if (item) return yuru(k.vec2(item.e.x, item.e.y), () => topla(item));
    const kapi = kapilar.find((kp) => kp.alan.hasPoint(p));
    if (kapi) return yuru(k.vec2(kapi.d.varis.x, kapi.d.varis.y), () => k.go("mekan", { mekanId: kapi.d.hedef, ...kapi.d.giris }));
    yuru(p);
  });

  k.onUpdate(() => {
    let yuruyor = false;
    if (hedef) {
      const fark = hedef.sub(ayak);
      const adim = 340 * k.dt();
      if (Math.abs(fark.x) > 2) yon = fark.x < 0 ? -1 : 1;
      if (fark.len() <= adim) {
        ayak.x = hedef.x; ayak.y = hedef.y; hedef = null;
        durum.x = ayak.x; durum.y = ayak.y; kayitYaz();
        if (varinca) { const f = varinca; varinca = null; f(); }
      } else {
        const ad = fark.unit().scale(adim);
        ayak.x += ad.x; ayak.y += ad.y;
        yuruyor = true;
      }
    }
    const t = k.time();
    const s = olcek();
    // Negatif x ölçeği karakteri aynalar.
    if (yuruyor) {
      govde.pos = k.vec2(ayak.x, ayak.y - Math.abs(Math.sin(t * 11)) * 10);
      govde.angle = Math.sin(t * 11) * 3;
      govde.scale = k.vec2(s * yon, s);
    } else {
      govde.pos = k.vec2(ayak.x, ayak.y);
      govde.angle = Math.sin(t * 1.6) * 1;
      govde.scale = k.vec2(s * yon * (1 - Math.sin(t * 2.4) * 0.012), s * (1 + Math.sin(t * 2.4) * 0.015));
    }
    govde.z = ayak.y;
    canlandir(t, yuruyor);
    if (balon) {
      const tepe = ayak.y - govdeY * s - 40;
      balon.forEach((b) => (b.pos = k.vec2(Math.max(160, Math.min(1120, ayak.x)), Math.max(40, tepe))));
    }
    // eşyalar hafifçe sallanır
    esyalar.forEach((i, n) => (i.obj.angle = Math.sin(t * 2 + n) * 8));
  });

  // --- Üst bilgi alanı (HUD) ---
  let hud = [];
  let karakterDugmesi = null;
  function hudCiz() {
    hud.forEach((h) => h.destroy());
    hud = [];
    hud.push(k.add([k.rect(240, 56, { radius: 28 }), k.pos(20, 20), k.color(255, 255, 255), k.opacity(0.9), k.outline(3, k.rgb(70, 50, 40)), k.z(3000)]));
    hud.push(k.add([k.text(m.ad, { size: 28 }), k.pos(140, 48), k.anchor("center"), k.color(70, 50, 40), k.z(3001)]));
    const w = 40 + TUM_ESYALAR.length * 64;
    hud.push(k.add([k.rect(w, 64, { radius: 32 }), k.pos(1260 - w, 16), k.color(255, 255, 255), k.opacity(0.9), k.outline(3, k.rgb(70, 50, 40)), k.z(3000)]));
    TUM_ESYALAR.forEach((e, i) => {
      const var_ = durum.toplanan.includes(e.id);
      hud.push(k.add([...G.esya[e.tur](), k.pos(1260 - w + 52 + i * 64, 48), k.anchor("center"), k.scale(0.7), k.opacity(var_ ? 1 : 0.2), k.z(3001)]));
    });
    if (VERI.karakterler.length > 1) {
      karakterDugmesi = k.add([k.rect(200, 56, { radius: 28 }), k.pos(20, 90), k.color(255, 230, 120), k.outline(3, k.rgb(70, 50, 40)), k.area(), k.z(3000)]);
      hud.push(karakterDugmesi);
      hud.push(k.add([k.text("Karakter", { size: 26 }), k.pos(120, 118), k.anchor("center"), k.color(70, 50, 40), k.z(3001)]));
    }
  }
  function hudTikla(p) {
    if (karakterDugmesi && karakterDugmesi.hasPoint(p)) {
      durum.karakter = (durum.karakter + 1) % VERI.karakterler.length;
      kayitYaz();
      karakterKur();
      konus(kar().soz);
      return true;
    }
    return false;
  }
  hudCiz();
});

k.onLoad(() => k.go("mekan", { mekanId: durum.mekan, x: durum.x, y: durum.y }));
