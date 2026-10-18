// Oyun motoru: mahalle haritası, mekan geçişleri, sürükle-bırak, düşme, dokun-yürü,
// ele alma, yemek, oturma, yatma, salıncak, kaydırak ve kayıt.

const VERI = window.OYUN_VERI;
const KAYIT_ANAHTARI = "cizim-dunyasi-v3";
const SURUKLE_ESIGI = 12; // piksel; daha az kayan dokunuş "dokunma" sayılır
const YERCEKIMI = 2600;
const EKRAN_W = 1280, EKRAN_H = 720;

const k = kaplay({ width: EKRAN_W, height: EKRAN_H, letterbox: true, background: [40, 40, 60], global: false, crisp: false });
const G = window.GECICI(k);
const K = window.KARAKTER(k, VERI);
const KALEM = k.rgb(70, 50, 40);

// --- Dünya durumu ve kayıt ---
function dunyaOku() {
  try {
    const s = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI));
    if (s && VERI.mekanlar[s.mekan] && Array.isArray(s.varliklar)) {
      // Silinmiş bir şablon ya da mekan kayıtta kalırsa onu atla.
      s.varliklar = s.varliklar.filter((v) => (v.tur === "karakter" ? VERI.karakterler : VERI.esyalar)[v.sablon] && VERI.mekanlar[v.mekan]);
      // Başlangıca sonradan eklenen varlıklar eski kayda da gelir. Yenmiş ya da bilinen varlık geri gelmez.
      const bilinen = new Set(s.bilinen || []);
      s.varliklar.forEach((v) => bilinen.add(v.id));
      VERI.baslangic.varliklar.forEach((v) => { if (!bilinen.has(v.id)) { s.varliklar.push(JSON.parse(JSON.stringify(v))); bilinen.add(v.id); } });
      s.bilinen = [...bilinen];
      return s;
    }
  } catch (e) {}
  const yeni = JSON.parse(JSON.stringify(VERI.baslangic));
  yeni.bilinen = yeni.varliklar.map((v) => v.id);
  return yeni;
}
const dunya = dunyaOku();
function kaydet() {
  try { localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(dunya)); } catch (e) {}
}

// --- Varlık yükleme ---
// Karakterler, eşyalar ve simgeler küçüktür: baştan yüklenir.
// Mekan resimleri büyüktür: bir mekana ilk kez gidilince yüklenir, sonra bellekte kalır.
K.yukle();
Object.entries(VERI.esyalar).forEach(([id, e]) => { if (e.resim) k.loadSprite("esya-" + id, e.resim); });
Object.entries(VERI.simgeler).forEach(([ad, yolu]) => k.loadSprite("simge-" + ad, yolu));

function mekanResimleri(id) {
  const m = VERI.mekanlar[id], r = [];
  if (m.resim) r.push(m.resim);
  if (m.zeminResim) r.push(m.zeminResim);
  (m.yerler || []).forEach((y) => r.push(y.resim));
  (m.susler || []).forEach((s) => r.push(s.resim));
  (m.noktalar || []).forEach((n) => { if (n.resim) r.push(n.resim); });
  return r;
}
// Mekanın resimlerini yükler. Aynı resim iki kez yüklenmez: resmin yolu aynı zamanda adıdır.
function mekanYukle(id) {
  const bekle = [];
  mekanResimleri(id).forEach((yolu) => {
    const a = k.getSprite(yolu) || k.loadSprite(yolu, yolu);
    if (!a.loaded) bekle.push(new Promise((bitti) => { a.onLoad(bitti); a.onError(bitti); }));
  });
  return Promise.all(bekle);
}

// --- Merkezi geçiş: her mekan değişimi buradan geçer ---
let geciyor = false;
function gec(hedef) {
  if (geciyor || !VERI.mekanlar[hedef]) return;
  geciyor = true;
  kaydet();
  // Ekran kararır, bu sırada yeni mekanın resimleri yüklenir.
  const perde = k.add([k.rect(EKRAN_W, EKRAN_H), k.pos(0, 0), k.color(30, 30, 45), k.opacity(0), k.fixed(), k.z(9000)]);
  const kararma = new Promise((bitti) => k.tween(0, 1, 0.22, (o) => (perde.opacity = o)).onEnd(bitti));
  Promise.all([kararma, mekanYukle(hedef)]).then(() => { geciyor = false; k.go("mekan", hedef); });
}

// Haritada bir yerin kapısı: dünya koordinatında dikdörtgen.
const DUNYA = VERI.mekanlar.dunya;
function yerKapisi(y) {
  const taban = DUNYA.taban || 472;
  return { x: y.x + y.kapi.x, y: taban - y.kapi.h, w: y.kapi.w, h: y.kapi.h, hedef: y.hedef, yer: y.id };
}
// Kapıdan geçen karakterin öbür tarafta durduğu yer.
function girisYeri(d) {
  if (d.giris) return d.giris;
  if (d.hedef === "dunya") {
    const y = DUNYA.yerler.find((y) => y.id === d.yer);
    if (y) { const kp = yerKapisi(y); return { x: kp.x + kp.w / 2, y: DUNYA.zemin.ust + 50 }; }
  }
  return VERI.mekanlar[d.hedef].giris || { x: 640, y: 600 };
}

k.scene("mekan", (mekanId) => {
  const m = VERI.mekanlar[mekanId];
  const z = m.zemin;
  const genis = m.genislik || EKRAN_W;
  const harita = m.tur === "dunya";
  dunya.mekan = mekanId;
  kaydet();

  // --- Arka plan ---
  if (m.resim) k.add([k.sprite(m.resim, { width: EKRAN_W, height: EKRAN_H }), k.z(-100)]);
  if (m.zeminResim) for (let x = 0; x < genis; x += EKRAN_W) k.add([k.sprite(m.zeminResim), k.pos(x, 0), k.z(-100)]);
  (m.susler || []).forEach((s) => k.add([k.sprite(s.resim), k.pos(s.x, s.y), k.anchor("bot"), k.z(s.arka ? -99.5 : -98)]));
  (m.yerler || []).forEach((y) => k.add([k.sprite(y.resim), k.pos(y.x, m.taban || 472), k.anchor("botleft"), k.z(-99)]));
  if (!m.resim && !m.zeminResim && m.gecici) G.mekanlar[m.gecici]();

  // --- Kapılar ---
  // Haritada her yerin kapısı bir kapıdır. Odada kapılar veriden gelir, üstlerinde gidilen yerin simgesi durur.
  const kapilar = harita ? m.yerler.map(yerKapisi) : m.kapilar;
  if (!harita) kapilar.forEach((d) => G.kapi(d, !!m.resim, VERI.mekanlar[d.hedef].simge));
  // Kapının üstündeki ok: kamera tek başına öbür mekana geçer. Karakterler yerinde kalır.
  const okBul = (p) => (harita ? null : kapilar.find((d) => p.dist(k.vec2(d.x + d.w / 2, d.y - 40)) < 50));
  const kapiBul = (p) => kapilar.find((d) => p.x > d.x && p.x < d.x + d.w && p.y > d.y && p.y < d.y + d.h);
  // Haritada binanın herhangi bir yerine dokunmak da o yerin kapısına gider.
  const yerBul = (p) => {
    if (!harita) return null;
    const y = m.yerler.find((y) => {
      const s = k.getSprite(y.resim), w = s && s.data ? s.data.width : 300, h = s && s.data ? s.data.height : 300;
      return p.x > y.x && p.x < y.x + w && p.y > (m.taban || 472) - h && p.y < (m.taban || 472);
    });
    return y ? yerKapisi(y) : null;
  };

  // --- Noktalar: musluk, fıskiye, dolap, raf, küvet, oturak, yatak, salıncak, kaydırak ---
  const noktalar = (m.noktalar || []).map((n) => {
    const o = { ...n };
    if (n.tur === "musluk") { o.akis = G.su(n.su.x, n.su.y, n.su.boy, n.su.renk); o.akis.hidden = true; }
    if (n.tur === "fiskiye") { o.akis = G.fiskiye(n.su.x, n.su.y); o.akis.hidden = !n.acik; }
    if (n.tur === "dolap") {
      // Açık dolap resmi. Kapalıyken gizli.
      o.acik = k.add([k.sprite(n.resim), k.pos(n.x0, n.y0), k.z(-90)]);
      o.acik.hidden = true;
    }
    if (n.raflar) {
      o.raflar = n.raflar.map((r) => ({
        ...r,
        boy: VERI.esyalar[r.sablon].boy * 0.62,
        resim: k.add([k.sprite("esya-" + r.sablon, { height: VERI.esyalar[r.sablon].boy * 0.62 }), k.pos(r.x, r.y), k.anchor("bot"), k.z(-89)]),
      }));
      o.raflar.forEach((r) => (r.resim.hidden = n.tur === "dolap"));
    }
    if (n.tur === "kuvet") {
      o.on = k.add([k.sprite(n.resim), k.pos(n.x0, n.y0), k.z(-80)]);
      o.yerler = n.yerler.map((y) => ({ ...y, dolu: null }));
    }
    if (n.tur === "salincak") {
      // İpler ve oturak: asma noktasında döner. Karakter oturunca ipler önünde kalır, tutuyormuş gibi durur.
      o.kol = k.add([k.pos(n.asma.x, n.asma.y), k.rotate(0), k.z(-83)]);
      for (const dx of [-36, 36]) o.kol.add([k.rect(5, n.ip, { radius: 2 }), k.pos(dx, 0), k.anchor("top"), k.color(120, 110, 100)]);
      o.kol.add([k.rect(96, 16, { radius: 6 }), k.pos(0, n.ip), k.anchor("center"), k.color(90, 160, 230), k.outline(3, KALEM)]);
      o.genlik = 0;
    }
    return o;
  });
  const icinde = (n, p) => n.w && p.x > n.x && p.x < n.x + n.w && p.y > n.y && p.y < n.y + n.h;
  const noktaBul = (p, tur) => noktalar.find((n) => (!tur || tur.includes(n.tur)) && icinde(n, p));
  const kuvetler = noktalar.filter((n) => n.tur === "kuvet");
  const OTURAK = ["klozet", "otur", "yatak", "salincak"];
  function dolapAcKapa(n) {
    const ac = n.acik.hidden;
    n.acik.hidden = !ac;
    n.raflar.forEach((r) => (r.resim.hidden = !ac || r.bos));
  }
  // Açık dolapta ya da rafta dokunulan yiyecek veya eşya.
  function rafBul(p) {
    for (const n of noktalar) {
      if (!n.raflar || (n.acik && n.acik.hidden)) continue;
      const r = n.raflar.find((r) => !r.bos && p.dist(k.vec2(r.x, r.y - r.boy / 2)) < Math.max(28, r.boy * 0.8));
      if (r) return { n, r };
    }
    return null;
  }

  const derinlik = (y) => (0.62 + 0.38 * Math.max(0, Math.min(1, (y - z.ust) / (z.alt - z.ust)))) * (m.olcek || 1);
  const zemineSabitle = (y) => Math.max(z.ust, Math.min(z.alt, y));
  // Odada zemin arkaya doğru daralır. y derinliğinde basılabilen en sol ve en sağ x.
  function xSinir(y) {
    if (!z.ufuk) return [z.sol, z.sag];
    const t = (y - z.ufuk.y) / (z.arka.y - z.ufuk.y), pay = 45;
    return [Math.max(z.sol, z.ufuk.x + (z.arka.sol - z.ufuk.x) * t + pay), Math.min(z.sag, z.ufuk.x + (z.arka.sag - z.ufuk.x) * t - pay)];
  }
  const xSabitle = (x, y) => { const [a, b] = xSinir(y); return Math.max(a, Math.min(b, x)); };

  // --- Kamera: geniş mekanda (harita) sağa sola kayar ---
  let kameraX = EKRAN_W / 2, takip = false, panYon = 0;
  const kameraSinirla = () => { kameraX = Math.max(EKRAN_W / 2, Math.min(genis - EKRAN_W / 2, kameraX)); };
  const ekran = () => k.mousePos();
  const fare = () => k.toWorld(k.mousePos());

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
        o.en = sp.width;
      } else {
        G.sus[s.sekil](o.kok.add([...G.esya[s.sekil](), k.pos(0, -s.boy / 2), k.anchor("center")]));
        o.golgeEn = s.boy * 0.55;
      }
    }
    o.v.x = xSabitle(o.v.x, o.zemY);
    o.yenir = !o.kr && VERI.esyalar[v.sablon].yenir;
    o.eylemTur = !o.kr && VERI.esyalar[v.sablon].eylem;
    o.isirik = 0;
    return o;
  }
  // Kayıtta küvette olanları yerine koy.
  varliklar.forEach((o) => {
    if (o.v.kuvet == null) return;
    const kv = kuvetler[0], yer = kv && kv.yerler[o.v.kuvet];
    if (o.kr && yer && !yer.dolu) { o.kuvet = { kv, yer }; yer.dolu = o; }
    else if (!o.kr && kv) o.yuzuyor = kv;
    else delete o.v.kuvet;
  });
  // Kayıtta oturan ya da yatanı yerine koy.
  varliklar.forEach((o) => {
    if (o.v.oturak == null) return;
    const n = noktalar[o.v.oturak];
    if (o.kr && n && OTURAK.includes(n.tur) && !n.dolu) otur(o, n, false);
    else delete o.v.oturak;
  });
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
      if (o.kr) return karakterUstunde(o, p);
      if (o.yeniyor) return false;
      return p.dist(merkez(o)) < Math.max(26, o.boy * olcek(o) * 0.75);
    });
    adaylar.sort((a, b) => (b === tutulan ? 1 : 0) - (a === tutulan ? 1 : 0) || (b.kr ? 0 : 1) - (a.kr ? 0 : 1) || b.zemY - a.zemY);
    return adaylar[0] || null;
  }
  function karakterUstunde(o, p) {
    const s = olcek(o), ay = o.kok.pos.y;
    if (o.oturak && o.oturak.tur === "yatak") {
      const y = o.oturak.yatis;
      return p.x > y.x - 20 && p.x < y.x + o.oturak.uzunluk && Math.abs(p.y - y.y) < 70;
    }
    const alt = o.kuvet ? o.kuvet.kv.su + 10 : ay + 10;
    return Math.abs(p.x - o.kok.pos.x) < (o.kr.genislik * s) / 2 && p.y < alt && p.y > ay - o.kr.yukseklik * s;
  }

  // --- Küvet ---
  // Karakter küvete girer: suyun altında kalan gövdesini küvetin ön yüzü örter.
  function kuveteGir(o, kv) {
    const yer = kv.yerler.filter((y) => !y.dolu).sort((a, b) => Math.abs(a.x - o.v.x) - Math.abs(b.x - o.v.x))[0];
    if (!yer) return false;
    o.kuvet = { kv, yer }; yer.dolu = o;
    o.v.kuvet = kv.yerler.indexOf(yer);
    o.hedef = null; o.vy = 0; o.zemY = z.ust; o.v.x = yer.x; o.v.y = z.ust;
    for (let i = 0; i < 12; i++) G.kopuk(yer.x + k.rand(-70, 70), kv.su + k.rand(-6, 6));
    kaydet();
    return true;
  }
  function kuvettenCik(o) {
    const p = o.kok.pos;
    if (o.kuvet) { o.kuvet.yer.dolu = null; o.kuvet = null; }
    o.yuzuyor = null;
    delete o.v.kuvet;
    o.zemY = z.ust; o.v.x = p.x; o.h = Math.max(0, o.zemY - p.y);
  }
  function suyaBirak(o, kv, p) {
    o.yuzuyor = kv; o.v.kuvet = 0;
    o.v.x = Math.max(kv.x + 50, Math.min(kv.x + kv.w - 50, p.x)); o.zemY = z.ust; o.v.y = z.ust;
    o.h = 0; o.vy = 0;
    for (let i = 0; i < 5; i++) G.kopuk(o.v.x + k.rand(-30, 30), kv.su);
    kaydet();
  }

  // --- Oturaklar: klozet, sandalye, yatak, salıncak ---
  function otur(o, n, kayit = true) {
    n.dolu = o; o.oturak = n; o.v.oturak = noktalar.indexOf(n);
    o.hedef = null; o.vy = 0; o.vx = 0; o.h = 0; o.zemY = z.ust;
    const yer = n.oturma || n.yatis || n.asma;
    o.v.x = yer.x; o.v.y = z.ust;
    if (n.tur === "klozet") o.sansur = G.sansur();
    if (n.tur === "yatak") {
      // Yorgan karakterin bacaklarını örter.
      const y = n.yorgan;
      o.yorgan = k.add([k.rect(y.w, y.h, { radius: 18 }), k.pos(y.x, y.y), k.color(...n.renk), k.outline(3, KALEM), k.z(-83)]);
      o.uyku = 0;
    }
    if (n.tur === "salincak") n.genlik = Math.max(n.genlik, 18);
    if (kayit) kaydet();
  }
  function kalk(o) {
    const n = o.oturak, p = o.kok.pos;
    n.dolu = null; o.oturak = null; delete o.v.oturak;
    if (o.sansur) { o.sansur.destroy(); o.sansur = null; }
    if (o.yorgan) { o.yorgan.destroy(); o.yorgan = null; }
    o.kok.angle = 0;
    o.zemY = z.ust; o.v.x = p.x; o.h = Math.max(0, o.zemY - p.y);
    if (n.tur === "klozet") sifon(n);
  }
  // Sifon: klozetin içinde su döner, köpükler çıkar.
  function sifon(n) {
    const m = k.vec2(n.oturma.x, 382);
    for (let i = 0; i < 10; i++) k.wait(i * 0.06, () => G.kopuk(m.x + Math.cos(i) * 30, m.y + Math.sin(i) * 6, -79, k.rand(3, 7)));
    G.kirinti(m, [120, 180, 240]);
  }

  // --- Kaydırak: karakter üstten alta kayar, sonra yere atlar ---
  function kaymayaBasla(o, n) {
    o.kayiyor = { n, t0: k.time() };
    o.hedef = null; o.vy = 0; o.vx = 0; o.h = 0;
  }

  // Eşyanın ekrandaki orta noktası (yerde, havada ya da elde).
  function merkez(o) {
    return k.vec2(o.kok.pos.x, o.kok.pos.y - (o.boy * o.kok.scale.y) / 2);
  }

  // --- Seçili karakter: dokun-yürü onu yürütür ---
  let secili = varliklar.find((o) => o.kr && o.v.id === dunya.secili) || varliklar.find((o) => o.kr) || null;
  const isaret = k.add([k.polygon([k.vec2(-14, -12), k.vec2(14, -12), k.vec2(0, 6)]), k.pos(0, 0), k.color(255, 210, 50), k.outline(3, KALEM), k.z(4500)]);
  function sec(o) {
    if (!o || !o.kr) return;
    secili = o;
    dunya.secili = o.v.id;
  }

  function yuru(o, p, sonra = null) {
    const y = zemineSabitle(p.y);
    o.hedef = k.vec2(xSabitle(p.x, y), y);
    o.varinca = sonra;
    if (harita && o === secili) takip = true;
  }

  // Varlığı başka mekana gönderir. Karakter ise kamera da onunla gider.
  function kapidanGec(o, d) {
    const g = girisYeri(d);
    o.v.mekan = d.hedef;
    // Eşyalar girişte üst üste binmesin diye biraz dağılır.
    o.v.x = g.x + (o.kr ? 0 : k.rand(-80, 80)); o.v.y = g.y + (o.kr ? 0 : k.rand(0, 80));
    if (o.kr) {
      varliklar.filter((e) => e.elde === o).forEach((e) => { e.v.mekan = d.hedef; e.v.x = o.v.x; e.v.y = o.v.y; });
      dunya.secili = o.v.id;
      if (d.hedef === "dunya") dunya.kamera = g.x;
      return gec(d.hedef);
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
    sahip.mesgul = k.time() + 1.6;
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
    const kl = G.kalp(o.kok.pos.x, o.kok.pos.y - o.kr.yukseklik * s - 30);
    k.tween(0, 1, 1.2, (t) => { kl.pos.y -= 1.2; kl.opacity = 1 - t; kl.scale = k.vec2(1 + t * 0.3); }).onEnd(() => kl.destroy());
  }
  // Küçük kalp: steteskop, çiçek koklama.
  function kucukKalp(p) {
    const kl = G.kalp(p.x, p.y);
    kl.scale = k.vec2(0.45);
    k.tween(0, 1, 1, (t) => { kl.pos.y -= 1; kl.opacity = 1 - t; }).onEnd(() => kl.destroy());
  }
  // Eşyanın hareketi. Yiyecek yenir; atılan eşya fırlar; diğerleri elde bir süre oynatılır.
  const EYLEM_SURE = { konus: 2.4, oku: 2.6, ic: 1.8, fircala: 2.2, yaz: 2.6, yika: 2.4, kurula: 2.2, sik: 1.2, dinle: 2.4, tara: 2.4, kurut: 2.4, sula: 2.6, kaz: 2.0, kokla: 2.0 };
  function eylemYap(sahip, o) {
    if (o.yenir) return ye(sahip, o);
    const tur = o.eylemTur;
    if (!tur || o.eylem || o.yeniyor) return;
    eleVer(sahip, o);
    sahip.hedef = null;
    if (tur === "at" || tur === "sur") {
      const yer = o.kok.pos;
      eldenBirak(o);
      o.vx = sahip.yon * (tur === "at" ? 380 : 520);
      if (tur === "at") { o.vy = -950; o.h = Math.max(o.h, 1); }
      else { o.h = 0; o.vy = 0; o.zemY = zemineSabitle(sahip.zemY + 12); o.v.x = yer.x; }
      kaydet();
      return;
    }
    const t0 = k.time(), sure = EYLEM_SURE[tur];
    o.eylem = { tur, t0, sayac: 0 };
    sahip.mesgul = t0 + sure;
    if (tur === "yaz") {
      const el = K.elYeri(sahip.kr);
      o.eylem.kagit = G.kagit(el.x + sahip.yon * 30, el.y + 10, sahip.kok.z + 0.3);
    }
    if (tur === "sik") G.nota(o.kok.pos.x, o.kok.pos.y - 40, [250, 190, 40]);
    k.wait(sure, () => {
      if (o.eylem && o.eylem.kagit) { const kg = o.eylem.kagit; k.wait(1.2, () => kg.destroy()); }
      o.eylem = null;
    });
  }
  // Bırakılan eşya bir karakterin üstündeyse: yiyecek ağza yakınsa yenir, değilse ele alınır.
  function karakteraBirak(o, p) {
    const sahip = varliklar.filter((c) => c.kr && !(c.oturak && c.oturak.tur === "yatak") && karakterUstunde(c, p)).sort((a, b) => b.zemY - a.zemY)[0];
    if (!sahip) return false;
    const agiz = K.agizYeri(sahip.kr), s = olcek(sahip);
    if (o.yenir && p.dist(agiz) < sahip.kr.genislik * s * 0.35) ye(sahip, o);
    else eleVer(sahip, o);
    return true;
  }

  // Raftan al: rafta duran yerde gerçek bir eşya olur, parmak onu tutar.
  // Raf biraz sonra yeniden dolar.
  function raftanAl({ n, r }) {
    if (varliklar.filter((o) => !o.kr).length >= 24) return null;
    const v = { id: r.sablon + Date.now(), tur: "esya", sablon: r.sablon, mekan: mekanId, x: r.x, y: z.ust + 50 };
    dunya.varliklar.push(v);
    dunya.bilinen.push(v.id);
    const o = varlikKur(v);
    varliklar.push(o);
    o.h = o.zemY - r.y;
    o.kok.pos = k.vec2(r.x, r.y);
    o.kok.scale = k.vec2(derinlik(o.zemY));
    r.bos = true; r.resim.hidden = true;
    k.wait(1.5, () => { r.bos = false; r.resim.hidden = !!(n.acik && n.acik.hidden); });
    kaydet();
    return o;
  }

  // --- Arayüz: ekrana sabit düğmeler ---
  // Odada: sol üstte haritaya dönüş. Haritada: iki yanda kaydırma okları.
  const dugmeler = [];
  function dugme(x, y, ciz, tur, yon = 0) {
    const o = k.add([k.pos(x, y), k.fixed(), k.z(6000), k.opacity(1)]);
    ciz(o);
    dugmeler.push({ o, x, y, r: 46, tur, yon });
    return o;
  }
  if (!harita) dugme(66, 66, (o) => o.add([k.sprite("simge-harita", { width: 88, height: 88 }), k.anchor("center"), k.fixed()]), "harita");
  else {
    for (const yon of [-1, 1]) {
      dugme(yon < 0 ? 50 : EKRAN_W - 50, 330, (o) => {
        o.add([k.circle(36), k.color(255, 255, 255), k.outline(4, KALEM), k.opacity(0.85), k.fixed()]);
        o.add([k.polygon([k.vec2(-12 * yon, -18), k.vec2(16 * yon, 0), k.vec2(-12 * yon, 18)]), k.color(70, 50, 40), k.fixed()]);
      }, "kaydir", yon);
    }
  }
  const dugmeBul = (e) => dugmeler.find((d) => !d.o.hidden && e.dist(k.vec2(d.x, d.y)) < d.r);

  // Mekanın adı: girişte üstte kısa bir süre görünür.
  const tabela = k.add([k.pos(EKRAN_W / 2, 44), k.fixed(), k.z(6000), k.opacity(1)]);
  const tabelaYazi = tabela.add([k.text(m.ad || "", { size: 30, font: "sans-serif" }), k.anchor("center"), k.pos(26, 2), k.color(70, 50, 40), k.fixed(), k.opacity(1)]);
  const tabelaEn = tabelaYazi.width + 110;
  tabela.add([k.rect(tabelaEn, 60, { radius: 30 }), k.anchor("center"), k.color(255, 250, 235), k.outline(4, KALEM), k.fixed(), k.opacity(1), k.z(-1)]);
  if (m.simge) tabela.add([k.sprite("simge-" + m.simge, { width: 48, height: 48 }), k.anchor("center"), k.pos(-tabelaEn / 2 + 34, 0), k.fixed(), k.opacity(1)]);
  k.wait(1.8, () => k.tween(1, 0, 0.5, (a) => tabela.children.forEach((c) => (c.opacity = a))).onEnd(() => tabela.destroy()));
  // Giriş perdesi: kararmış ekran açılır.
  const perde = k.add([k.rect(EKRAN_W, EKRAN_H), k.pos(0, 0), k.color(30, 30, 45), k.opacity(1), k.fixed(), k.z(9000)]);
  k.tween(1, 0, 0.3, (a) => (perde.opacity = a)).onEnd(() => perde.destroy());

  // Kameranın başlangıç yeri: haritada kayıtlı yer, yoksa seçili karakter.
  if (harita) {
    kameraX = dunya.kamera != null ? dunya.kamera : secili ? secili.v.x : m.giris.x;
    kameraSinirla();
  }
  k.setCamPos(kameraX, EKRAN_H / 2);

  // --- Dokunma ve sürükleme ---
  let tutulan = null, basla = null, kayma = null, surukluyor = false;
  let basiliDugme = null, kaydirma = null, kaydiriyor = false;

  // Tutulan varlığın ayak noktası parmağı izler. Zemin bandındaysa derinlik değişir, üstündeyse havaya kalkar.
  function tasi() {
    const p = fare();
    const ayakX = p.x + kayma.x, ayakY = p.y + kayma.y;
    tutulan.v.x = Math.max(20, Math.min(genis - 20, ayakX));
    if (ayakY >= z.ust) {
      tutulan.zemY = zemineSabitle(ayakY); tutulan.h = 0;
      tutulan.v.x = xSabitle(tutulan.v.x, tutulan.zemY);
    } else tutulan.h = tutulan.zemY - ayakY;
    tutulan.hal = "tutuluyor";
  }

  k.onMousePress(() => {
    const e = ekran();
    basiliDugme = dugmeBul(e);
    if (basiliDugme) { if (basiliDugme.tur === "kaydir") panYon = basiliDugme.yon; return; }
    const p = fare();
    basla = p;
    surukluyor = false;
    tutulan = dokunulan(p);
    if (!tutulan) { const r = rafBul(p); if (r) tutulan = raftanAl(r); }
    if (tutulan) kayma = k.vec2(tutulan.kok.pos.x - p.x, tutulan.kok.pos.y - p.y);
    // Boş yerde parmak kayarsa harita kayar.
    else if (genis > EKRAN_W) kaydirma = { x0: e.x, kam0: kameraX };
  });

  k.onMouseMove(() => {
    if (basiliDugme) return;
    if (kaydirma) {
      const dx = ekran().x - kaydirma.x0;
      if (!kaydiriyor && Math.abs(dx) > SURUKLE_ESIGI) kaydiriyor = true;
      if (kaydiriyor) { kameraX = kaydirma.kam0 - dx; takip = false; kameraSinirla(); }
      return;
    }
    if (!tutulan || !basla) return;
    const p = fare();
    if (!surukluyor && p.dist(basla) < SURUKLE_ESIGI) return;
    if (!surukluyor) {
      surukluyor = true;
      tutulan.hedef = null;
      tutulan.vy = 0;
      tutulan.vx = 0;
      if (tutulan.elde) eldenBirak(tutulan);
      if (tutulan.kuvet || tutulan.yuzuyor) kuvettenCik(tutulan);
      if (tutulan.oturak) kalk(tutulan);
      tutulan.kayiyor = null;
      if (tutulan.kr) sec(tutulan);
    }
    tasi();
  });

  k.onMouseRelease(() => {
    if (basiliDugme) {
      const d = basiliDugme;
      basiliDugme = null; panYon = 0;
      if (d.tur === "harita") gec("dunya");
      return;
    }
    if (kaydiriyor || kaydirma) {
      const kaydi = kaydiriyor;
      kaydiriyor = false; kaydirma = null;
      if (kaydi) { basla = null; dunya.kamera = kameraX; kaydet(); return; }
    }
    const p = fare();
    const o = tutulan;
    tutulan = null;
    if (surukluyor && o) {
      surukluyor = false;
      o.hal = "dur";
      const d = kapiBul(p) || yerBul(p);
      if (d) return kapidanGec(o, d);
      if (!o.kr && karakteraBirak(o, p)) return;
      if (o.kr) {
        const n = noktaBul(p, OTURAK);
        if (n && !n.dolu) return otur(o, n);
        const kd = noktaBul(p, ["kaydirak"]);
        if (kd) return kaymayaBasla(o, kd);
      }
      const kv = noktaBul(p, ["kuvet"]);
      if (kv && o.kr && kuveteGir(o, kv)) return;
      if (kv && !o.kr) return suyaBirak(o, kv, p);
      if (o.h <= 0) { o.v.y = o.zemY; kaydet(); }
      return;
    }
    if (!basla) return;
    basla = null;
    // Dokunma
    if (o && o.kr) {
      sec(o);
      // Uyuyan karakter uyanır ve kalkar.
      if (o.oturak && o.oturak.tur === "yatak") { kalk(o); o.salla = k.time() + 1.6; kalpCikar(o); kaydet(); return; }
      // Salıncaktaki karakter itilir.
      if (o.oturak && o.oturak.tur === "salincak") { o.oturak.genlik = Math.min(34, o.oturak.genlik + 10); return; }
      // Elinde eşya varsa onunla oynar (yiyecekse yer), yoksa el sallar.
      const eldeki = varliklar.find((e) => e.elde === o && (e.yenir || e.eylemTur));
      if (eldeki) return eylemYap(o, eldeki);
      o.salla = k.time() + 1.6;
      kalpCikar(o);
      if (o.kuvet) for (let i = 0; i < 8; i++) G.kopuk(o.v.x + k.rand(-60, 60), o.kuvet.kv.su);
      kaydet();
      return;
    }
    if (o && o.elde) return eylemYap(o.elde, o);
    if (o && o.yuzuyor) { for (let i = 0; i < 4; i++) G.kopuk(o.v.x + k.rand(-20, 20), o.yuzuyor.su); return; }
    if (o) { o.vy = -700; o.h = Math.max(o.h, 1); return; } // eşya zıplar
    const ok = okBul(p);
    if (ok) return gec(ok.hedef);
    const n = noktaBul(p);
    if (n && (n.tur === "musluk" || n.tur === "fiskiye")) { n.akis.hidden = !n.akis.hidden; return; }
    if (n && n.tur === "dolap") return dolapAcKapa(n);
    if (n && n.tur === "klozet" && !n.dolu) return sifon(n);
    if (n && n.tur === "salincak" && !n.dolu) { n.genlik = Math.min(30, n.genlik + 14); return; }
    const d = kapiBul(p) || yerBul(p);
    if (d) {
      if (secili && !secili.oturak) return yuru(secili, k.vec2(d.x + d.w / 2, z.ust + 20), () => kapidanGec(secili, d));
      return gec(d.hedef);
    }
    if (secili && !secili.oturak && !secili.kuvet) yuru(secili, p);
  });

  // --- Her kare ---
  k.onUpdate(() => {
    const t = k.time(), dt = k.dt();
    // Salıncaklar: ip asma noktasında döner. Boş salıncak yavaşça durur.
    for (const n of noktalar) {
      if (n.tur !== "salincak") continue;
      n.genlik = n.dolu ? Math.max(14, n.genlik - dt * 3) : Math.max(0, n.genlik - dt * 6);
      n.aci = n.genlik * Math.sin(t * 2.6);
      n.kol.angle = n.aci;
    }
    for (const o of varliklar) {
      if (o.elde) { eldeGuncelle(o); continue; }
      if (o.kuvet || o.yuzuyor) { kuvetGuncelle(o, t, dt); continue; }
      if (o.oturak) { oturakGuncelle(o, t, dt); continue; }
      if (o.kayiyor) { kaymaGuncelle(o, t); continue; }
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
        const fark = k.vec2(o.hedef.x - o.v.x, o.hedef.y - o.zemY), adim = 340 * dt * (harita ? 1.5 : 1);
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
      // Atılan ya da sürülen eşya yatay kayar. Yerde sürtünme yavaşlatır, duvardan seker.
      if (o.vx && o !== tutulan) {
        o.v.x += o.vx * dt;
        const [sol, sag] = xSinir(o.zemY);
        if ((o.v.x < sol && o.vx < 0) || (o.v.x > sag && o.vx > 0)) o.vx = -o.vx * 0.6;
        if (o.h === 0) o.vx *= 1 - Math.min(1, dt * (o.eylemTur === "sur" ? 0.7 : 2.5));
        if (Math.abs(o.vx) < 8) { o.vx = 0; o.v.y = o.zemY; kaydet(); }
      }
      // Duvarın önüne düşen varlık zemine doğru kayar.
      if (o.h === 0 && o !== tutulan) {
        const x2 = xSabitle(o.v.x, o.zemY);
        if (Math.abs(x2 - o.v.x) > 0.5) o.v.x += (x2 - o.v.x) * Math.min(1, dt * 8);
      }
      if (hal === "dur" && t < o.mesgul) hal = "ye";
      if (hal === "dur" && t < o.salla) hal = "salla";
      const s = olcek(o);
      const ziplama = hal === "yuru" ? Math.abs(Math.sin(t * 11)) * 10 * (m.olcek || 1) : 0;
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
      let yer = o.yeniyor ? K.agizYeri(sahip.kr) : K.elYeri(sahip.kr), aci = 0, olc = 1;
      if (o.eylem) ({ yer, aci, olc } = eylemKaresi(o, sahip, s));
      o.kok.pos = k.vec2(yer.x, yer.y + (o.boy * s * olc) / 2);
      o.kok.scale = k.vec2(s * olc);
      o.kok.angle = aci;
      o.kok.z = sahip.kok.z + 0.5;
      o.zemY = sahip.zemY; o.v.x = sahip.v.x; o.v.y = sahip.v.y; o.h = 0;
      o.golge.hidden = true;
    }
    // Eylemin bu karedeki hali: eşyanın yeri, açısı ve ölçeği. Köpük, damla, nota ve çizgi de burada çıkar.
    function eylemKaresi(o, sahip, s) {
      const e = o.eylem, t = k.time() - e.t0, cs = olcek(sahip);
      const gen = sahip.kr.genislik * cs, boyu = sahip.kr.yukseklik * cs, yon = sahip.yon;
      const agiz = K.agizYeri(sahip.kr), on = sahip.kok.z + 1;
      e.sayac -= k.dt();
      const sira = (aralik) => { if (e.sayac > 0) return false; e.sayac = aralik; return true; };
      switch (e.tur) {
        case "fircala":
          if (sira(0.1)) G.kopuk(agiz.x + k.rand(-12, 12), agiz.y + k.rand(-6, 6), on, k.rand(3, 6));
          // Fırçanın başı sağ uçtadır: baş ağza gelsin diye eşya sola kayar.
          return { yer: agiz.add(Math.sin(t * 28) * gen * 0.07 - o.en * s * 0.4, 4), aci: 0, olc: 1 };
        case "ic":
          if (sira(0.3)) G.kirinti(agiz, [120, 180, 240]);
          return { yer: agiz.add(yon * gen * 0.08, 0), aci: -35 * yon, olc: 1 };
        case "oku":
          return { yer: agiz.add(0, boyu * 0.14), aci: Math.sin(t * 2) * 4, olc: 1.3 };
        case "konus":
          if (sira(0.45)) G.nota(agiz.x + yon * gen * 0.35, agiz.y - boyu * 0.15);
          return { yer: agiz.add(yon * gen * 0.22, -boyu * 0.04), aci: 15 * yon, olc: 1 };
        case "yaz": {
          const kg = e.kagit.pos, uc = kg.add(-30 + ((t * 40) % 60), -18 + Math.floor((t * 40) / 60) * 18 + Math.sin(t * 30) * 4);
          if (uc.y < kg.y + 30 && sira(0.03)) e.kagit.add([k.circle(2.5), k.pos(uc.sub(kg)), k.anchor("center"), k.color(140, 90, 220)]);
          // Kalemin ucu sağ uçtadır: ucu kağıda değsin diye eşya sola kaydırılır.
          return { yer: uc.add((-o.en * s) / 2, (-o.boy * s) / 2), aci: -25, olc: 1 };
        }
        case "yika": {
          const govde = sahip.kok.pos.add(0, -boyu * 0.45);
          if (sira(0.08)) G.kopuk(govde.x + k.rand(-gen * 0.3, gen * 0.3), govde.y + k.rand(-boyu * 0.3, boyu * 0.3), on);
          return { yer: govde.add(Math.cos(t * 6) * gen * 0.22, Math.sin(t * 6) * boyu * 0.15), aci: Math.sin(t * 6) * 15, olc: 1 };
        }
        case "kurula":
          if (sira(0.15)) G.kirinti(agiz.add(0, -boyu * 0.2), [120, 180, 240]);
          return { yer: agiz.add(Math.sin(t * 14) * gen * 0.2, -boyu * 0.24), aci: Math.sin(t * 14) * 10, olc: 1 };
        case "sik":
          if (sira(0.35)) G.nota(o.kok.pos.x, o.kok.pos.y - 40, [250, 190, 40]);
          return { yer: K.elYeri(sahip.kr), aci: 0, olc: 1 - 0.25 * Math.abs(Math.sin(t * 10)) };
        case "dinle": {
          // Steteskop göğüste gezer, kalp atışı küçük kalpler olarak çıkar.
          const gogus = sahip.kok.pos.add(yon * gen * 0.05, -boyu * 0.5);
          if (sira(0.5)) kucukKalp(gogus.add(yon * gen * 0.3, -boyu * 0.1));
          return { yer: gogus.add(Math.sin(t * 3) * gen * 0.12, Math.cos(t * 2) * boyu * 0.06), aci: 0, olc: 1 };
        }
        case "tara": {
          // Tarak başın üstünde ileri geri gider, saçtan parıltı çıkar.
          const bas = agiz.add(0, -boyu * 0.2);
          if (sira(0.2)) G.parilti(bas.x + k.rand(-gen * 0.3, gen * 0.3), bas.y + k.rand(-10, 10));
          return { yer: bas.add(Math.sin(t * 8) * gen * 0.2, 0), aci: Math.sin(t * 8) * 8, olc: 1 };
        }
        case "kurut": {
          // Fön başın yanında durur, ağzı başa bakar. Sıcak hava küçük baloncuklarla gösterilir.
          const bas = agiz.add(0, -boyu * 0.12), fon = bas.add(-gen * 0.5, Math.sin(t * 5) * 6);
          if (sira(0.06)) G.kopuk(fon.x + o.en * s * 0.5, fon.y + k.rand(-8, 8), on, k.rand(2, 4));
          if (sira(0.3)) G.parilti(bas.x + k.rand(-gen * 0.2, gen * 0.2), bas.y - 10, [255, 255, 255]);
          return { yer: fon, aci: 0, olc: 1 };
        }
        case "sula": {
          // Sulama kabı öne eğilir, ağzından damlalar düşer.
          const el = K.elYeri(sahip.kr).add(yon * gen * 0.2, 0);
          if (sira(0.08)) G.kirinti(el.add(o.en * s * 0.45, -o.boy * s * 0.2), [120, 190, 250]);
          return { yer: el, aci: 25 + Math.sin(t * 3) * 5, olc: 1 };
        }
        case "kaz": {
          // Kova sallanır, içinden kum dökülür.
          const el = K.elYeri(sahip.kr);
          if (sira(0.15)) G.kirinti(el.add(0, -o.boy * s * 0.4), [240, 210, 150]);
          return { yer: el, aci: Math.sin(t * 6) * 20, olc: 1 };
        }
        case "kokla": {
          // Çiçek buruna gelir, kalpler çıkar.
          const burun = agiz.add(yon * gen * 0.12, -boyu * 0.02);
          if (sira(0.5)) kucukKalp(burun.add(yon * gen * 0.2, -boyu * 0.15));
          return { yer: burun, aci: -10 * yon, olc: 1 };
        }
      }
      return { yer: K.elYeri(sahip.kr), aci: 0, olc: 1 };
    }
    // Oturan karakter biraz basık durur. Klozette hafifçe titrer, beli sansürle örtülür.
    // Yataktaki karakter uzanır ve uyur. Salıncaktaki ip ile birlikte sallanır.
    function oturakGuncelle(o, t, dt) {
      const n = o.oturak, s = olcek(o);
      o.golge.hidden = true;
      o.kok.z = -84;
      if (n.tur === "yatak") {
        // Boyu yatağa sığar: ayaklar yatis noktasında, baş yastıkta. Yandan bakılınca ince görünür.
        const sy = n.uzunluk / o.kr.yukseklik;
        o.kok.pos = k.vec2(n.yatis.x, n.yatis.y);
        o.kok.angle = 90;
        o.kok.scale = k.vec2(sy * 0.55 * (1 + Math.sin(t * 1.8) * 0.03), sy);
        K.canlandir(o.kr, t, "uyu");
        o.uyku -= dt;
        if (o.uyku <= 0) { o.uyku = 1.1; G.zzz(n.yatis.x + n.uzunluk * 0.95, n.yatis.y - 60); }
        return;
      }
      const bas = 0.85;
      if (n.tur === "salincak") {
        const r = (n.aci * Math.PI) / 180;
        o.kok.pos = k.vec2(n.asma.x - n.ip * Math.sin(r), n.asma.y + n.ip * Math.cos(r) + 6);
        o.kok.angle = n.aci;
      } else {
        o.kok.pos = k.vec2(n.oturma.x, n.oturma.y);
        o.kok.angle = n.tur === "klozet" ? Math.sin(t * 22) * 1.2 : 0;
      }
      o.kok.scale = k.vec2(s * o.yon, s * bas);
      K.canlandir(o.kr, t, t < o.salla ? "salla" : "dur");
      if (o.sansur) {
        const boyu = o.kr.yukseklik * s * bas, gen = o.kr.genislik * s;
        o.sansur.ayarla(n.oturma.x, n.oturma.y - boyu * 0.3, gen * 0.6, boyu * 0.24, -83);
      }
    }
    // Kaydırakta: hızlanarak iner, sonunda yere atlar ve biraz kayar.
    function kaymaGuncelle(o, t) {
      const { n, t0 } = o.kayiyor, u = Math.min(1, ((t - t0) / 1.1) ** 2), s = olcek(o);
      o.golge.hidden = true;
      o.kok.pos = k.vec2(n.ust.x + (n.alt.x - n.ust.x) * u, n.ust.y + (n.alt.y - n.ust.y) * u);
      o.kok.angle = -12;
      o.kok.scale = k.vec2(s * o.yon, s * 0.85);
      o.kok.z = n.alt.y;
      K.canlandir(o.kr, t, "salla");
      if (u < 1) return;
      o.kayiyor = null;
      o.kok.angle = 0;
      o.zemY = zemineSabitle(n.alt.y + 30); o.v.x = n.alt.x; o.v.y = o.zemY; o.h = 0;
      o.vx = 260 * Math.sign(n.alt.x - n.ust.x);
      kalpCikar(o);
      kaydet();
    }
    // Küvetteki karakter yavaşça sallanır, çevresinden köpük çıkar. Eşya suyun üstünde yüzer.
    function kuvetGuncelle(o, t, dt) {
      const s = olcek(o);
      o.golge.hidden = true;
      if (o.yuzuyor) {
        o.kok.pos = k.vec2(o.v.x, o.yuzuyor.su + 8 + Math.sin(t * 2 + o.v.x) * 3);
        o.kok.scale = k.vec2(s); o.kok.angle = Math.sin(t * 1.7 + o.v.x) * 6; o.kok.z = -78;
        return;
      }
      const { kv, yer } = o.kuvet;
      o.v.x = yer.x;
      o.kok.pos = k.vec2(yer.x, kv.dip + Math.sin(t * 2 + yer.x) * 3);
      o.kok.z = -85;
      o.kok.angle = Math.sin(t * 1.5 + yer.x) * 3;
      o.kok.scale = k.vec2(s * o.yon, s);
      K.canlandir(o.kr, t, t < o.salla ? "salla" : "dur");
      o.kopukSayac = (o.kopukSayac || 0) - dt;
      if (o.kopukSayac <= 0) { o.kopukSayac = 0.18; G.kopuk(yer.x + k.rand(-65, 65), kv.su + k.rand(-4, 4)); }
    }
    // Seçili karakterin üstündeki ok
    isaret.hidden = !secili;
    if (secili) {
      const s = olcek(secili);
      const yatiyor = secili.oturak && secili.oturak.tur === "yatak";
      const ust = yatiyor ? secili.kok.pos.y - 60 : secili.kok.pos.y - secili.kr.yukseklik * s * (secili.oturak || secili.kayiyor ? 0.85 : 1);
      const x = yatiyor ? secili.kok.pos.x + secili.oturak.uzunluk * 0.5 : secili.kok.pos.x;
      isaret.pos = k.vec2(x, ust - 18 + Math.sin(t * 4) * 5);
      isaret.scale = k.vec2(harita ? 0.8 : 1);
    }
    // Kamera: okla ya da kenara sürüklenen varlıkla kayar, yürüyen seçili karakteri izler.
    if (genis > EKRAN_W) {
      if (panYon) { kameraX += panYon * 900 * dt; takip = false; }
      else if (tutulan && surukluyor) {
        const ex = ekran().x;
        if (ex < 110) kameraX -= 700 * dt;
        else if (ex > EKRAN_W - 110) kameraX += 700 * dt;
      } else if (takip && secili && varliklar.includes(secili)) kameraX += (secili.v.x - kameraX) * Math.min(1, dt * 3);
      const once = kameraX;
      kameraSinirla();
      if (once !== kameraX) panYon = 0;
      k.setCamPos(kameraX, EKRAN_H / 2);
      if (tutulan && surukluyor) tasi();
      dunya.kamera = kameraX;
      for (const d of dugmeler) if (d.tur === "kaydir") d.o.hidden = d.yon < 0 ? kameraX <= EKRAN_W / 2 + 1 : kameraX >= genis - EKRAN_W / 2 - 1;
    }
  });
});

k.onLoad(() => mekanYukle(dunya.mekan).then(() => k.go("mekan", dunya.mekan)));
