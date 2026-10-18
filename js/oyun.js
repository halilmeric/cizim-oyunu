// Oyun motoru: sürükle-bırak, düşme, dokun-yürü, kapılar, ele alma, yemek ve kayıt.

const VERI = window.OYUN_VERI;
const KAYIT_ANAHTARI = "cizim-dunyasi-v2";
const SURUKLE_ESIGI = 12; // piksel; daha az kayan dokunuş "dokunma" sayılır
const YERCEKIMI = 2600;

const k = kaplay({ width: 1280, height: 720, letterbox: true, background: [40, 40, 60], global: false, crisp: false });
const G = window.GECICI(k);
const K = window.KARAKTER(k, VERI);

// --- Dünya durumu ve kayıt ---
function dunyaOku() {
  try {
    const s = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI));
    if (s && VERI.mekanlar[s.mekan] && Array.isArray(s.varliklar)) {
      // Silinmiş bir şablon kayıtta kalırsa onu atla.
      s.varliklar = s.varliklar.filter((v) => (v.tur === "karakter" ? VERI.karakterler : VERI.esyalar)[v.sablon] && VERI.mekanlar[v.mekan]);
      return s;
    }
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
Object.entries(VERI.mekanlar).forEach(([id, m]) => (m.noktalar || []).forEach((n, i) => { if (n.resim) k.loadSprite(`nokta-${id}-${i}`, n.resim); }));

k.scene("mekan", (mekanId) => {
  const m = VERI.mekanlar[mekanId];
  const z = m.zemin;
  dunya.mekan = mekanId;
  kaydet();

  if (m.resim) k.add([k.sprite("mekan-" + mekanId, { width: 1280, height: 720 }), k.z(-100)]);
  else G.mekanlar[m.gecici]();
  m.kapilar.forEach((d) => G.kapi(d, !!m.resim));
  // Kapının üstündeki ok: kamera tek başına öbür odaya geçer. Karakterler yerinde kalır.
  const okBul = (p) => m.kapilar.find((d) => p.dist(k.vec2(d.x + d.w / 2, d.y - 40)) < 50);
  // Musluklar: dokununca su akar ya da durur.
  const noktalar = (m.noktalar || []).map((n, i) => {
    const o = { ...n };
    if (n.tur === "musluk") { o.akis = G.su(n.su.x, n.su.y, n.su.boy); o.akis.hidden = true; }
    if (n.tur === "dolap") {
      // Açık dolap resmi ve raftaki yiyecekler. Kapalıyken gizli.
      o.acik = k.add([k.sprite(`nokta-${mekanId}-${i}`), k.pos(n.x0, n.y0), k.z(-90)]);
      o.acik.hidden = true;
      o.raflar = n.raflar.map((r) => ({
        ...r,
        boy: VERI.esyalar[r.sablon].boy * 0.62,
        resim: k.add([k.sprite("esya-" + r.sablon, { height: VERI.esyalar[r.sablon].boy * 0.62 }), k.pos(r.x, r.y), k.anchor("bot"), k.z(-89)]),
      }));
      o.raflar.forEach((r) => (r.resim.hidden = true));
    }
    return o;
  });
  const dolaplar = noktalar.filter((n) => n.tur === "dolap");
  function dolapAcKapa(n) {
    const ac = n.acik.hidden;
    n.acik.hidden = !ac;
    n.raflar.forEach((r) => (r.resim.hidden = !ac || r.bos));
  }
  // Açık dolapta dokunulan raf yiyeceği.
  function rafBul(p) {
    for (const n of dolaplar) {
      if (n.acik.hidden) continue;
      const r = n.raflar.find((r) => !r.bos && p.dist(k.vec2(r.x, r.y - r.boy / 2)) < r.boy * 0.8);
      if (r) return r;
    }
    return null;
  }
  const noktaBul = (p) => noktalar.find((n) => p.x > n.x && p.x < n.x + n.w && p.y > n.y && p.y < n.y + n.h);

  const derinlik = (y) => 0.62 + 0.38 * Math.max(0, Math.min(1, (y - z.ust) / (z.alt - z.ust)));
  const zemineSabitle = (y) => Math.max(z.ust, Math.min(z.alt, y));
  // Zemin arkaya doğru daralır. y derinliğinde basılabilen en sol ve en sağ x.
  function xSinir(y) {
    if (!z.ufuk) return [z.sol, z.sag];
    const t = (y - z.ufuk.y) / (z.arka.y - z.ufuk.y), pay = 45;
    return [Math.max(z.sol, z.ufuk.x + (z.arka.sol - z.ufuk.x) * t + pay), Math.min(z.sag, z.ufuk.x + (z.arka.sag - z.ufuk.x) * t - pay)];
  }
  const xSabitle = (x, y) => { const [a, b] = xSinir(y); return Math.max(a, Math.min(b, x)); };

  // --- Varlıkları kur ---
  // Her varlık: v (kayıt), zemY (zemindeki derinlik), h (zeminden yükseklik), hal, hedef.
  const varliklar = dunya.varliklar.filter((v) => v.mekan === mekanId).map(varlikKur);

  function varlikKur(v) {
    const o = { v, zemY: zemineSabitle(v.y), h: 0, vy: 0, yon: 1, hal: "dur", hedef: null, varinca: null, salla: 0 };
    // Zemindeki gölge: varlık yükseldikçe küçülür ve solar.
    o.golge = k.add([k.circle(50), k.pos(0, 0), k.color(40, 25, 20), k.opacity(0.3), k.scale(1, 0.25), k.z(0)]);
    if (v.tur === "karakter") {
      o.kr = K.kur(v.sablon, v.renk);
      o.kok = o.kr.kok;
      o.golgeEn = o.kr.genislik * 0.34;
    } else {
      const s = VERI.esyalar[v.sablon];
      o.boy = s.boy;
      o.kok = k.add([k.pos(0, 0), k.scale(1), k.rotate(0), k.z(0)]);
      if (s.resim) {
        const sp = o.kok.add([k.sprite("esya-" + v.sablon, { height: s.boy }), k.anchor("bot")]);
        o.golgeEn = sp.width * 0.55;
      } else {
        G.sus[s.sekil](o.kok.add([...G.esya[s.sekil](), k.pos(0, -s.boy / 2), k.anchor("center")]));
        o.golgeEn = s.boy * 0.55;
      }
    }
    o.v.x = xSabitle(o.v.x, o.zemY);
    o.yenir = !o.kr && VERI.esyalar[v.sablon].yenir;
    o.isirik = 0;
    return o;
  }
  // Kayıtta elde duran eşyaları sahibine bağla.
  varliklar.forEach((o) => {
    if (!o.v.elde) return;
    o.elde = varliklar.find((c) => c.kr && c.v.id === o.v.elde) || null;
    if (!o.elde) delete o.v.elde;
  });

  function olcek(o) {
    return o.kr ? (o.kr.boy / o.kr.yukseklik) * derinlik(o.zemY) : derinlik(o.zemY);
  }

  // Ekrandaki noktaya dokunulan en öndeki varlık.
  function dokunulan(p) {
    const adaylar = varliklar.filter((o) => {
      const s = olcek(o), ay = o.zemY - o.h;
      if (o.kr) return karakterUstunde(o, p);
      if (o.yeniyor) return false;
      return p.dist(merkez(o)) < o.boy * s * 0.75;
    });
    adaylar.sort((a, b) => (b === tutulan ? 1 : 0) - (a === tutulan ? 1 : 0) || (b.kr ? 0 : 1) - (a.kr ? 0 : 1) || b.zemY - a.zemY);
    return adaylar[0] || null;
  }
  function karakterUstunde(o, p) {
    const s = olcek(o), ay = o.zemY - o.h;
    return Math.abs(p.x - o.v.x) < (o.kr.genislik * s) / 2 && p.y < ay + 10 && p.y > ay - o.kr.yukseklik * s;
  }
  // Eşyanın ekrandaki orta noktası (yerde, havada ya da elde).
  function merkez(o) {
    return k.vec2(o.kok.pos.x, o.kok.pos.y - (o.boy * o.kok.scale.y) / 2);
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
    const y = zemineSabitle(p.y);
    o.hedef = k.vec2(xSabitle(p.x, y), y);
    o.varinca = sonra;
  }

  // Varlığı başka mekana gönderir. Karakter ise kamera da onunla gider.
  function kapidanGec(o, d) {
    o.v.mekan = d.hedef;
    // Eşyalar girişte üst üste binmesin diye biraz dağılır.
    o.v.x = d.giris.x + (o.kr ? 0 : k.rand(-80, 80)); o.v.y = d.giris.y + (o.kr ? 0 : k.rand(0, 80));
    if (o.kr) {
      varliklar.filter((e) => e.elde === o).forEach((e) => { e.v.mekan = d.hedef; e.v.x = o.v.x; e.v.y = o.v.y; });
      dunya.secili = o.v.id; kaydet(); k.go("mekan", d.hedef); return;
    }
    kaldir(o);
    kaydet();
  }
  function kaldir(o) {
    varliklar.splice(varliklar.indexOf(o), 1);
    o.kok.destroy();
    o.golge.destroy();
  }

  // --- Ele alma ve yeme ---
  function eleVer(sahip, o) {
    // Elde zaten bir eşya varsa yere düşer.
    varliklar.filter((e) => e.elde === sahip && e !== o).forEach(eldenBirak);
    o.elde = sahip; o.v.elde = sahip.v.id;
    o.h = 0; o.vy = 0;
    kaydet();
  }
  function eldenBirak(o) {
    const p = o.kok.pos;
    o.zemY = o.elde.zemY; o.v.x = p.x; o.h = Math.max(0, o.zemY - p.y);
    o.elde = null; delete o.v.elde;
  }
  // Üç ısırık: her ısırıkta eşya küçülür, kırıntı düşer. Sonunda eşya biter, kalp çıkar.
  function ye(sahip, o) {
    if (o.yeniyor) return;
    eleVer(sahip, o);
    o.yeniyor = true;
    sahip.yiyor = k.time() + 1.6;
    sahip.hedef = null;
    let n = 0;
    const isir = () => {
      if (!varliklar.includes(o)) return;
      n++; o.isirik = n;
      G.kirinti(K.agizYeri(sahip.kr), o.yenir);
      if (n < 3) return k.wait(0.45, isir);
      kaldir(o);
      dunya.varliklar.splice(dunya.varliklar.indexOf(o.v), 1);
      kalpCikar(sahip);
      kaydet();
    };
    k.wait(0.35, isir);
  }
  function kalpCikar(o) {
    const s = olcek(o);
    const kl = G.kalp(o.v.x, o.zemY - o.h - o.kr.yukseklik * s - 30);
    k.tween(0, 1, 1.2, (t) => { kl.pos.y -= 1.2; kl.opacity = 1 - t; kl.scale = k.vec2(1 + t * 0.3); }).onEnd(() => kl.destroy());
  }
  // Bırakılan eşya bir karakterin üstündeyse: yiyecek ağza yakınsa yenir, değilse ele alınır.
  function karakteraBirak(o, p) {
    const sahip = varliklar.filter((c) => c.kr && karakterUstunde(c, p)).sort((a, b) => b.zemY - a.zemY)[0];
    if (!sahip) return false;
    const agiz = K.agizYeri(sahip.kr), s = olcek(sahip);
    if (o.yenir && p.dist(agiz) < sahip.kr.genislik * s * 0.35) ye(sahip, o);
    else eleVer(sahip, o);
    return true;
  }

  // Raftan yiyecek al: rafta duran yerde gerçek bir eşya olur, parmak onu tutar.
  // Raf biraz sonra yeniden dolar.
  function raftanAl(r) {
    if (varliklar.filter((o) => !o.kr).length >= 24) return null;
    const v = { id: r.sablon + Date.now(), tur: "esya", sablon: r.sablon, mekan: mekanId, x: r.x, y: z.ust + 50 };
    dunya.varliklar.push(v);
    const o = varlikKur(v);
    varliklar.push(o);
    o.h = o.zemY - r.y;
    o.kok.pos = k.vec2(r.x, r.y);
    o.kok.scale = k.vec2(derinlik(o.zemY));
    r.bos = true; r.resim.hidden = true;
    k.wait(1.5, () => { r.bos = false; r.resim.hidden = dolaplar.every((n) => n.acik.hidden || !n.raflar.includes(r)); });
    kaydet();
    return o;
  }

  // --- Dokunma ve sürükleme ---
  let tutulan = null, basla = null, kayma = null, surukluyor = false;

  k.onMousePress(() => {
    const p = k.mousePos();
    basla = p;
    surukluyor = false;
    tutulan = dokunulan(p);
    if (!tutulan) { const r = rafBul(p); if (r) tutulan = raftanAl(r); }
    if (tutulan) kayma = k.vec2(tutulan.kok.pos.x - p.x, tutulan.kok.pos.y - p.y);
  });

  k.onMouseMove(() => {
    if (!tutulan || !basla) return;
    const p = k.mousePos();
    if (!surukluyor && p.dist(basla) < SURUKLE_ESIGI) return;
    if (!surukluyor) {
      surukluyor = true;
      tutulan.hedef = null;
      tutulan.vy = 0;
      if (tutulan.elde) eldenBirak(tutulan);
      if (tutulan.kr) sec(tutulan);
    }
    // Ayak noktası parmağı izler. Zemin bandındaysa derinlik değişir, üstündeyse karakter havaya kalkar.
    const ayakX = p.x + kayma.x, ayakY = p.y + kayma.y;
    tutulan.v.x = Math.max(20, Math.min(1260, ayakX));
    if (ayakY >= z.ust) {
      tutulan.zemY = zemineSabitle(ayakY); tutulan.h = 0;
      tutulan.v.x = xSabitle(tutulan.v.x, tutulan.zemY);
    }
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
      if (!o.kr && karakteraBirak(o, p)) return;
      if (o.h <= 0) { o.v.y = o.zemY; kaydet(); }
      return;
    }
    if (!basla) return;
    basla = null;
    // Dokunma
    if (o && o.kr) {
      sec(o);
      // Elinde yiyecek varsa yer, yoksa el sallar.
      const yemek = varliklar.find((e) => e.elde === o && e.yenir);
      if (yemek) return ye(o, yemek);
      o.salla = k.time() + 1.6;
      kalpCikar(o);
      kaydet();
      return;
    }
    if (o && o.elde) { if (o.yenir) ye(o.elde, o); return; }
    if (o) { o.vy = -700; o.h = Math.max(o.h, 1); return; } // eşya zıplar
    const ok = okBul(p);
    if (ok) return k.go("mekan", ok.hedef);
    const n = noktaBul(p);
    if (n && n.tur === "musluk") { n.akis.hidden = !n.akis.hidden; return; }
    if (n && n.tur === "dolap") return dolapAcKapa(n);
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
      if (o.elde) { eldeGuncelle(o); continue; }
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
      // Duvarın önüne düşen varlık zemine doğru kayar.
      if (o.h === 0 && o !== tutulan) {
        const x2 = xSabitle(o.v.x, o.zemY);
        if (Math.abs(x2 - o.v.x) > 0.5) o.v.x += (x2 - o.v.x) * Math.min(1, dt * 8);
      }
      if (hal === "dur" && t < o.yiyor) hal = "ye";
      if (hal === "dur" && t < o.salla) hal = "salla";
      const s = olcek(o);
      const ziplama = hal === "yuru" ? Math.abs(Math.sin(t * 11)) * 10 : 0;
      o.kok.pos = k.vec2(o.v.x, o.zemY - o.h - ziplama);
      o.kok.z = o === tutulan ? 5000 : o.zemY;
      const yukseklik = Math.min(o.h, 500);
      o.golge.hidden = false;
      o.golge.pos = k.vec2(o.v.x, o.zemY);
      o.golge.z = o.zemY - 0.5;
      const gs = (o.golgeEn / 50) * s * (1 - yukseklik / 900);
      o.golge.scale = k.vec2(gs, gs * 0.25);
      o.golge.opacity = 0.3 * (1 - yukseklik / 700);
      if (o.kr) {
        o.kok.angle = hal === "yuru" ? Math.sin(t * 11) * 3 : hal === "tutuluyor" ? Math.sin(t * 7) * 6 : Math.sin(t * 1.6);
        const nefes = hal === "dur" ? Math.sin(t * 2.4) * 0.015 : hal === "ye" ? Math.abs(Math.sin(t * 14)) * 0.03 : 0;
        o.kok.scale = k.vec2(s * o.yon * (1 - nefes), s * (1 + nefes));
        K.canlandir(o.kr, t, hal);
      } else {
        o.kok.scale = k.vec2(s);
        o.kok.angle = hal === "tutuluyor" ? Math.sin(t * 8) * 10 : 0;
      }
    }
    // Elde duran eşya elin ucunda durur. Yenirken ağza gider ve her ısırıkta küçülür.
    function eldeGuncelle(o) {
      const sahip = o.elde, s = derinlik(sahip.zemY) * (1 - o.isirik * 0.25);
      const yer = o.yeniyor ? K.agizYeri(sahip.kr) : K.elYeri(sahip.kr);
      o.kok.pos = k.vec2(yer.x, yer.y + (o.boy * s) / 2);
      o.kok.scale = k.vec2(s);
      o.kok.angle = 0;
      o.kok.z = sahip.kok.z + 0.5;
      o.zemY = sahip.zemY; o.v.x = sahip.v.x; o.v.y = sahip.v.y; o.h = 0;
      o.golge.hidden = true;
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
