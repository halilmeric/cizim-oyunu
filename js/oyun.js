// Oyun motoru: sürükle-bırak, düşme, dokun-yürü, kapılar ve kayıt.

const VERI = window.OYUN_VERI;
const KAYIT_ANAHTARI = "cizim-dunyasi-v1";
const SURUKLE_ESIGI = 12; // piksel; daha az kayan dokunuş "dokunma" sayılır
const YERCEKIMI = 2600;

const k = kaplay({ width: 1280, height: 720, letterbox: true, background: [40, 40, 60], global: false, crisp: false });
const G = window.GECICI(k);
const K = window.KARAKTER(k, VERI);

// --- Dünya durumu ve kayıt ---
function dunyaOku() {
  try {
    const s = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI));
    if (s && VERI.mekanlar[s.mekan] && Array.isArray(s.varliklar)) return s;
  } catch (e) {}
  return JSON.parse(JSON.stringify(VERI.baslangic));
}
const dunya = dunyaOku();
function kaydet() {
  try { localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(dunya)); } catch (e) {}
}

K.yukle();
Object.entries(VERI.mekanlar).forEach(([id, m]) => { if (m.resim) k.loadSprite("mekan-" + id, m.resim); });
Object.entries(VERI.esyalar).forEach(([id, e]) => { if (e.resim) k.loadSprite("esya-" + id, e.resim); });

k.scene("mekan", (mekanId) => {
  const m = VERI.mekanlar[mekanId];
  const z = m.zemin;
  dunya.mekan = mekanId;
  kaydet();

  if (m.resim) k.add([k.sprite("mekan-" + mekanId, { width: 1280, height: 720 }), k.z(-100)]);
  else G.mekanlar[m.gecici]();
  m.kapilar.forEach((d) => G.kapi(d, !!m.resim));

  const derinlik = (y) => 0.72 + 0.28 * Math.max(0, Math.min(1, (y - z.ust) / (z.alt - z.ust)));
  const zemineSabitle = (y) => Math.max(z.ust, Math.min(z.alt, y));

  // --- Varlıkları kur ---
  // Her varlık: v (kayıt), zemY (zemindeki derinlik), h (zeminden yükseklik), hal, hedef.
  const varliklar = dunya.varliklar.filter((v) => v.mekan === mekanId).map(varlikKur);

  function varlikKur(v) {
    const o = { v, zemY: zemineSabitle(v.y), h: 0, vy: 0, yon: 1, hal: "dur", hedef: null, varinca: null, salla: 0 };
    if (v.tur === "karakter") {
      o.kr = K.kur(v.sablon, v.renk);
      o.kok = o.kr.kok;
    } else {
      const s = VERI.esyalar[v.sablon];
      o.boy = s.boy;
      o.kok = k.add([k.pos(0, 0), k.scale(1), k.rotate(0), k.z(0)]);
      if (s.resim) o.kok.add([k.sprite("esya-" + v.sablon, { height: s.boy }), k.anchor("bot")]);
      else G.sus[s.sekil](o.kok.add([...G.esya[s.sekil](), k.pos(0, -s.boy / 2), k.anchor("center")]));
    }
    return o;
  }

  function olcek(o) {
    return o.kr ? (o.kr.boy / o.kr.yukseklik) * derinlik(o.zemY) : derinlik(o.zemY);
  }

  // Ekrandaki noktaya dokunulan en öndeki varlık.
  function dokunulan(p) {
    const adaylar = varliklar.filter((o) => {
      const s = olcek(o), ay = o.zemY - o.h;
      if (o.kr) return Math.abs(p.x - o.v.x) < (o.kr.genislik * s) / 2 && p.y < ay + 10 && p.y > ay - o.kr.yukseklik * s;
      return p.dist(k.vec2(o.v.x, ay - (o.boy * s) / 2)) < o.boy * s * 0.75;
    });
    adaylar.sort((a, b) => (b === tutulan ? 1 : 0) - (a === tutulan ? 1 : 0) || (b.kr ? 0 : 1) - (a.kr ? 0 : 1) || b.zemY - a.zemY);
    return adaylar[0] || null;
  }
  const kapiBul = (p) => m.kapilar.find((d) => p.x > d.x && p.x < d.x + d.w && p.y > d.y && p.y < d.y + d.h);

  // --- Seçili karakter: dokun-yürü onu yürütür ---
  let secili = varliklar.find((o) => o.kr && o.v.id === dunya.secili) || varliklar.find((o) => o.kr) || null;
  const isaret = k.add([k.polygon([k.vec2(-14, -12), k.vec2(14, -12), k.vec2(0, 6)]), k.pos(0, 0), k.color(255, 210, 50), k.outline(3, k.rgb(70, 50, 40)), k.z(4500)]);
  function sec(o) {
    if (!o || !o.kr) return;
    secili = o;
    dunya.secili = o.v.id;
  }

  function yuru(o, p, sonra = null) {
    o.hedef = k.vec2(Math.max(z.sol, Math.min(z.sag, p.x)), zemineSabitle(p.y));
    o.varinca = sonra;
  }

  // Varlığı başka mekana gönderir. Karakter ise kamera da onunla gider.
  function kapidanGec(o, d) {
    o.v.mekan = d.hedef;
    // Eşyalar girişte üst üste binmesin diye biraz dağılır.
    o.v.x = d.giris.x + (o.kr ? 0 : k.rand(-80, 80)); o.v.y = d.giris.y + (o.kr ? 0 : k.rand(0, 80));
    if (o.kr) { dunya.secili = o.v.id; kaydet(); k.go("mekan", d.hedef); return; }
    varliklar.splice(varliklar.indexOf(o), 1);
    o.kok.destroy();
    kaydet();
  }

  // --- Dokunma ve sürükleme ---
  let tutulan = null, basla = null, kayma = null, surukluyor = false;

  k.onMousePress(() => {
    const p = k.mousePos();
    basla = p;
    surukluyor = false;
    tutulan = dokunulan(p);
    if (tutulan) kayma = k.vec2(tutulan.v.x - p.x, tutulan.zemY - tutulan.h - p.y);
  });

  k.onMouseMove(() => {
    if (!tutulan || !basla) return;
    const p = k.mousePos();
    if (!surukluyor && p.dist(basla) < SURUKLE_ESIGI) return;
    if (!surukluyor) {
      surukluyor = true;
      tutulan.hedef = null;
      tutulan.vy = 0;
      if (tutulan.kr) sec(tutulan);
    }
    // Ayak noktası parmağı izler. Zemin bandındaysa derinlik değişir, üstündeyse karakter havaya kalkar.
    const ayakX = p.x + kayma.x, ayakY = p.y + kayma.y;
    tutulan.v.x = Math.max(20, Math.min(1260, ayakX));
    if (ayakY >= z.ust) { tutulan.zemY = zemineSabitle(ayakY); tutulan.h = 0; }
    else tutulan.h = tutulan.zemY - ayakY;
    tutulan.hal = "tutuluyor";
  });

  k.onMouseRelease(() => {
    const p = k.mousePos();
    const o = tutulan;
    tutulan = null;
    if (surukluyor && o) {
      surukluyor = false;
      o.hal = "dur";
      const d = kapiBul(p);
      if (d) return kapidanGec(o, d);
      if (o.h <= 0) { o.v.y = o.zemY; kaydet(); }
      return;
    }
    if (!basla) return;
    basla = null;
    // Dokunma
    if (o && o.kr) {
      sec(o);
      o.salla = k.time() + 1.6;
      const s = olcek(o);
      const kl = G.kalp(o.v.x, o.zemY - o.h - o.kr.yukseklik * s - 30);
      k.tween(0, 1, 1.2, (t) => { kl.pos.y -= 1.2; kl.opacity = 1 - t; kl.scale = k.vec2(1 + t * 0.3); }).onEnd(() => kl.destroy());
      kaydet();
      return;
    }
    if (o) { o.vy = -700; o.h = Math.max(o.h, 1); return; } // eşya zıplar
    const d = kapiBul(p);
    if (d) {
      if (secili) return yuru(secili, k.vec2(d.x + d.w / 2, z.ust + 20), () => kapidanGec(secili, d));
      return k.go("mekan", d.hedef);
    }
    if (secili) yuru(secili, p);
  });

  // --- Her kare ---
  k.onUpdate(() => {
    const t = k.time(), dt = k.dt();
    for (const o of varliklar) {
      let hal = o === tutulan && surukluyor ? "tutuluyor" : "dur";
      // Düşme
      if (o !== tutulan && (o.h > 0 || o.vy !== 0)) {
        o.vy += YERCEKIMI * dt;
        o.h -= o.vy * dt;
        if (o.h <= 0) {
          o.h = 0;
          // Eşya biraz zıplar, karakter yere basar
          o.vy = !o.kr && o.vy > 300 ? -o.vy * 0.35 : 0;
          if (o.vy === 0) { o.v.y = o.zemY; kaydet(); }
        }
        if (o.h > 0) hal = "tutuluyor";
      }
      // Yürüme
      if (o.hedef && o.h === 0 && o !== tutulan) {
        const fark = k.vec2(o.hedef.x - o.v.x, o.hedef.y - o.zemY), adim = 340 * dt;
        if (Math.abs(fark.x) > 2) o.yon = fark.x < 0 ? -1 : 1;
        if (fark.len() <= adim) {
          o.v.x = o.hedef.x; o.zemY = o.hedef.y; o.v.y = o.zemY; o.hedef = null;
          kaydet();
          if (o.varinca) { const f = o.varinca; o.varinca = null; f(); }
        } else {
          const a = fark.unit().scale(adim);
          o.v.x += a.x; o.zemY += a.y;
          hal = "yuru";
        }
      }
      if (hal === "dur" && t < o.salla) hal = "salla";
      const s = olcek(o);
      const ziplama = hal === "yuru" ? Math.abs(Math.sin(t * 11)) * 10 : 0;
      o.kok.pos = k.vec2(o.v.x, o.zemY - o.h - ziplama);
      o.kok.z = o === tutulan ? 5000 : o.zemY;
      if (o.kr) {
        o.kok.angle = hal === "yuru" ? Math.sin(t * 11) * 3 : hal === "tutuluyor" ? Math.sin(t * 7) * 6 : Math.sin(t * 1.6);
        const nefes = hal === "dur" ? Math.sin(t * 2.4) * 0.015 : 0;
        o.kok.scale = k.vec2(s * o.yon * (1 - nefes), s * (1 + nefes));
        K.canlandir(o.kr, t, hal);
      } else {
        o.kok.scale = k.vec2(s);
        o.kok.angle = hal === "tutuluyor" ? Math.sin(t * 8) * 10 : 0;
      }
    }
    // Seçili karakterin üstündeki ok
    isaret.hidden = !secili;
    if (secili) {
      const s = olcek(secili);
      isaret.pos = k.vec2(secili.v.x, secili.zemY - secili.h - secili.kr.yukseklik * s - 18 + Math.sin(t * 4) * 5);
    }
  });
});

k.onLoad(() => k.go("mekan", dunya.mekan));
