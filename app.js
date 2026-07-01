// ponytail: vanilla + localStorage. No build, no backend.
// Images = URLs (not Data URLs) so hundreds of products fit under the 5MB cap.
// Upgrade path: swap `store` for fetch() to a real API + a CDN for images.

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

/* ---------- CONFIG (edit these) ---------- */
const CONFIG = {
  whatsapp:          "5492614000000",   // Mendoza area code + number
  whatsappMsg:       "Hola! Quisiera consultar por un producto.",
  shippingThreshold: 15000,             // ARS for free shipping
  shippingCost:      1500,              // flat below threshold
};

/* ---------- storage ---------- */
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch { return d } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) },
  del(k){ localStorage.removeItem(k) },
};

const ADMIN = { email:"admin@limpio.com", password:"admin123", name:"Admin" };

const CATS = [
  { id:"cocina", name:"Cocina" },
  { id:"bano",   name:"Baño"   },
  { id:"pisos",  name:"Pisos"  },
  { id:"ropa",   name:"Ropa"   },
  { id:"hogar",  name:"Hogar"  },
];

const IMG = (id, w=600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
const SEED = [
  { id:"s1",  name:"Detergente floral 1L",        brand:"Limpio",   sku:"DET-FLR-1L",  price:1200, salePrice:0,    stock:120, active:true, featured:true,  category:"cocina", description:"Aroma a jazmín, concentrado. Rinde el doble.",             image:IMG("photo-1585421514738-01798e348b17") },
  { id:"s2",  name:"Limpiador multiuso 500ml",    brand:"Cif",      sku:"MUL-500",     price:900,  salePrice:0,    stock:80,  active:true, featured:false, category:"cocina", description:"Desengrasa mesadas, azulejos y anafes sin dejar marca.",  image:IMG("photo-1583947215259-38e31be8751f") },
  { id:"s3",  name:"Lavandina en gel 1L",         brand:"Ayudín",   sku:"LAV-GEL-1L",  price:750,  salePrice:0,    stock:3,   active:true, featured:false, category:"bano",   description:"Se adhiere a superficies verticales. Sin salpicaduras.",  image:IMG("photo-1610557892470-55d9e80c0bce") },
  { id:"s4",  name:"Limpia baño espuma 500ml",    brand:"Cif",      sku:"BNO-ESP-500", price:1350, salePrice:1150, stock:60,  active:true, featured:true,  category:"bano",   description:"Elimina sarro y jabón acumulado en un solo pase.",         image:IMG("photo-1600185365483-26d7a4cc7519") },
  { id:"s5",  name:"Cera para pisos 900ml",       brand:"Blem",     sku:"CRA-900",     price:2100, salePrice:1499, stock:40,  active:true, featured:true,  category:"pisos",  description:"Brillo natural, secado rápido. Para porcelanato y cerámico.",image:IMG("photo-1527515637462-cff94eecc1ac") },
  { id:"s6",  name:"Jabón líquido ropa 3L",       brand:"Ala",      sku:"ALA-LIQ-3L",  price:3400, salePrice:0,    stock:35,  active:true, featured:false, category:"ropa",   description:"Baja espuma, ideal para lavarropas automáticos.",         image:IMG("photo-1610557892470-55d9e80c0bce") },
  { id:"s7",  name:"Suavizante concentrado 1L",   brand:"Vivere",   sku:"VIV-SUV-1L",  price:1800, salePrice:1450, stock:50,  active:true, featured:true,  category:"ropa",   description:"Aroma prolongado, fórmula concentrada.",                   image:IMG("photo-1585232004423-244e0e6904e3") },
  { id:"s8",  name:"Alcohol en gel 500ml",        brand:"Limpio",   sku:"ALC-GEL-500", price:650,  salePrice:0,    stock:200, active:true, featured:false, category:"hogar",  description:"70% de alcohol, hidrata las manos con glicerina.",         image:IMG("photo-1584744646711-d0b6b7d18ce8") },
  { id:"s9",  name:"Desengrasante para horno",    brand:"Mr Músculo",sku:"DES-HRN",    price:1650, salePrice:0,    stock:30,  active:true, featured:false, category:"cocina", description:"Ataca la grasa carbonizada sin fregar.",                   image:IMG("photo-1563453392212-326f5e854473") },
  { id:"s10", name:"Limpia vidrios 500ml",        brand:"Mr Músculo",sku:"VID-500",    price:800,  salePrice:0,    stock:90,  active:true, featured:false, category:"hogar",  description:"Sin manchas ni rayas. Con gatillo pulverizador.",         image:IMG("photo-1585421514738-01798e348b17") },
  { id:"s11", name:"Trapo de piso microfibra",    brand:"Genérico", sku:"TRP-MIC",     price:1200, salePrice:0,    stock:150, active:true, featured:false, category:"pisos",  description:"Máxima absorción, no larga pelusa.",                       image:IMG("photo-1527515637462-cff94eecc1ac") },
  { id:"s12", name:"Esponja doble faz x3",        brand:"Virulana", sku:"ESP-3X",      price:450,  salePrice:0,    stock:220, active:true, featured:true,  category:"cocina", description:"Cara suave y cara abrasiva. Larga duración.",              image:IMG("photo-1583947215259-38e31be8751f") },
  { id:"s13", name:"Desodorante de ambiente",     brand:"Glade",    sku:"AMB-LVN",     price:1100, salePrice:0,    stock:70,  active:true, featured:false, category:"hogar",  description:"Neutraliza olores en lugar de taparlos. Aroma lavanda.",   image:IMG("photo-1584744646711-d0b6b7d18ce8") },
  { id:"s14", name:"Quitamanchas ropa 500ml",     brand:"Vanish",   sku:"QMN-500",     price:1400, salePrice:0,    stock:45,  active:true, featured:false, category:"ropa",   description:"Actúa en frío, sin dañar los colores.",                    image:IMG("photo-1585232004423-244e0e6904e3") },
  { id:"s15", name:"Detergente antibacterial 1L", brand:"Magistral",sku:"MAG-ANT-1L",  price:1450, salePrice:1199, stock:80,  active:true, featured:true,  category:"cocina", description:"Elimina el 99,9% de bacterias. Suave con las manos.",     image:IMG("photo-1600185365483-26d7a4cc7519") },
  { id:"s16", name:"Limpiador inodoros 750ml",    brand:"Harpic",   sku:"INO-750",     price:950,  salePrice:0,    stock:110, active:true, featured:false, category:"bano",   description:"Fórmula densa, se adhiere al borde interior.",             image:IMG("photo-1610557892470-55d9e80c0bce") },
  { id:"s17", name:"Jabón de coco en pan",        brand:"Federal",  sku:"COC-PAN",     price:380,  salePrice:0,    stock:180, active:true, featured:false, category:"ropa",   description:"Clásico para prelavado. Quita manchas difíciles.",         image:IMG("photo-1585232004423-244e0e6904e3") },
  { id:"s18", name:"Balde con escurridor 12L",    brand:"Colombraro",sku:"BLD-12L",    price:2800, salePrice:0,    stock:5,   active:true, featured:false, category:"pisos",  description:"Balde reforzado con escurridor incorporado.",              image:IMG("photo-1527515637462-cff94eecc1ac") },
  { id:"s19", name:"Guantes de látex par",        brand:"3M",       sku:"GLV-LTX",     price:550,  salePrice:0,    stock:150, active:true, featured:false, category:"hogar",  description:"Antideslizantes, forrados en algodón.",                    image:IMG("photo-1584744646711-d0b6b7d18ce8") },
  { id:"s20", name:"Aromatizante textil 250ml",   brand:"Poett",    sku:"ATX-250",     price:1350, salePrice:0,    stock:55,  active:true, featured:false, category:"ropa",   description:"Se rocía sobre la ropa seca. Aroma prolongado.",           image:IMG("photo-1585232004423-244e0e6904e3") },
];

const PRODUCTS_KEY = "products_v4"; // ponytail: bump when SEED schema changes
function loadProducts(){
  ["products", "products_v2", "products_v3"].forEach(k => store.del(k));
  const p = store.get(PRODUCTS_KEY, null);
  if (p && p.length) return p;
  store.set(PRODUCTS_KEY, SEED);
  return SEED;
}

const PAGE_SIZE = 12;

let state = {
  products: loadProducts(),
  cart:     store.get("cart", []),
  user:     store.get("user", null),
  search:   "",
  sort:     "relevance",
  cats:     new Set(),
  priceMin: null,
  priceMax: null,
  page:     1,
  adminSearch: "",
  adminSort:  "newest",
  adminTab:   "form",
  sheetQty:   1,
  sheetPid:   null,
};

/* ---------- helpers ---------- */
const money   = n => "$" + Number(n).toLocaleString("es-AR");
const catName = id => (CATS.find(c => c.id === id) || {}).name || id;
const escape  = (s="") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const activePrice = p => (p.salePrice && p.salePrice > 0 && p.salePrice < p.price) ? p.salePrice : p.price;

// Deterministic fake rating based on product id (until real reviews exist).
// ponytail: comment says the ceiling. Swap for real reviews API when we have any.
function ratingFor(id){
  const seed = String(id).split("").reduce((h,c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  const avg   = Math.round((3.8 + (seed % 121) / 100) * 10) / 10; // 3.8 – 5.0
  const count = 12 + (seed % 480);
  return { avg, count };
}
function starsRow(id){
  const { avg, count } = ratingFor(id);
  const full = Math.round(avg);
  return `<span class="st">${"★".repeat(full)}${"☆".repeat(5 - full)}</span><span>${avg.toFixed(1)}</span><span class="muted">(${count})</span>`;
}

/* ---------- selection pipeline ---------- */
function selectProducts(){
  const q = state.search.trim().toLowerCase();
  let list = state.products.filter(p => {
    if (p.active === false) return false;
    if (state.cats.size && !state.cats.has(p.category)) return false;
    const price = activePrice(p);
    if (state.priceMin != null && price < state.priceMin) return false;
    if (state.priceMax != null && price > state.priceMax) return false;
    if (q){
      const hay = [p.name, p.brand, p.description, catName(p.category)].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  switch (state.sort){
    case "price-asc":  list.sort((a,b) => activePrice(a) - activePrice(b)); break;
    case "price-desc": list.sort((a,b) => activePrice(b) - activePrice(a)); break;
    case "name-asc":   list.sort((a,b) => a.name.localeCompare(b.name)); break;
    case "newest":     list.sort((a,b) => (b.id > a.id ? 1 : -1)); break;
  }
  return list;
}

/* ---------- card renderer (reused for grid + featured) ---------- */
function cardHtml(p){
  const oos    = p.stock === 0;
  const sale   = p.salePrice && p.salePrice > 0 && p.salePrice < p.price;
  const off    = sale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
  const low    = !oos && p.stock <= 5;
  return `
    <article class="card-p" data-id="${p.id}">
      <div class="thumb ${p.image ? "" : "placeholder"}">
        ${p.image ? `<img src="${p.image}" alt="${escape(p.name)}" loading="lazy" onerror="this.remove()"/>` : ""}
        <span class="tag">${catName(p.category)}</span>
        ${sale     ? `<span class="sale-tag">-${off}%</span>`   : ""}
        ${p.featured ? `<span class="feat-tag">Más vendido</span>` : ""}
        ${oos      ? `<div class="oos">Sin stock</div>`         : ""}
      </div>
      ${p.brand ? `<p class="brand">${escape(p.brand)}</p>` : ""}
      <p class="name">${escape(p.name)}</p>
      <div class="rating">${starsRow(p.id)}</div>
      <div class="prices">
        <span class="price ${sale ? "sale" : ""}">${money(activePrice(p))}</span>
        ${sale ? `<span class="price-old">${money(p.price)}</span>` : ""}
      </div>
      ${low ? `<p class="urgency">¡Solo quedan ${p.stock}!</p>` : ""}
      <div class="row">
        <span></span>
        <button class="add" data-add="${p.id}" aria-label="Agregar" ${oos ? "disabled" : ""}>+</button>
      </div>
    </article>
  `;
}

/* ---------- render: categories ---------- */
function renderCatNav(){
  const nav = $("[data-cat-nav]");
  const counts = Object.fromEntries(CATS.map(c => [c.id, state.products.filter(p => p.category === c.id && p.active !== false).length]));
  const totalActive = state.products.filter(p => p.active !== false).length;
  const chip = (id, label, n, active) =>
    `<button class="cat-chip${active ? " is-active" : ""}" data-cat-chip="${id}">${label}<span class="n">${n}</span></button>`;
  nav.innerHTML = [
    chip("__all__", "Todos", totalActive, state.cats.size === 0),
    ...CATS.map(c => chip(c.id, c.name, counts[c.id] || 0, state.cats.has(c.id))),
  ].join("");
}

/* ---------- render: featured strip ---------- */
function renderFeatured(){
  const wrap = $("[data-featured-wrap]");
  const list = state.products.filter(p => p.featured && p.active !== false);
  wrap.hidden = list.length === 0;
  $("[data-featured]").innerHTML = list.map(cardHtml).join("");
}

/* ---------- render: catalog grid ---------- */
function renderCatalog(){
  const list = selectProducts();
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (state.page > pages) state.page = 1;
  const slice = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

  $("[data-count]").textContent = `${total} producto${total === 1 ? "" : "s"}`;
  $("[data-empty]").hidden = total !== 0;
  $("[data-grid]").innerHTML = slice.map(cardHtml).join("");

  renderPager(pages);
  renderActiveFilters();
  updateFilterCount();
}

function renderPager(pages){
  const el = $("[data-pager]");
  el.hidden = pages <= 1;
  if (pages <= 1){ el.innerHTML = ""; return; }
  const cur = state.page;
  const pageBtn = (n, label = n, active = false) =>
    `<button data-page="${n}" class="${active ? "is-active" : ""}">${label}</button>`;
  const parts = [];
  parts.push(`<button data-page="${cur-1}" ${cur === 1 ? "disabled" : ""}>←</button>`);
  const nums = new Set([1, pages, cur, cur-1, cur+1].filter(n => n >= 1 && n <= pages));
  const sorted = [...nums].sort((a,b) => a-b);
  let prev = 0;
  for (const n of sorted){
    if (n - prev > 1) parts.push(`<span class="ellipsis">…</span>`);
    parts.push(pageBtn(n, n, n === cur));
    prev = n;
  }
  parts.push(`<button data-page="${cur+1}" ${cur === pages ? "disabled" : ""}>→</button>`);
  el.innerHTML = parts.join("");
}

function renderActiveFilters(){
  const wrap = $("[data-active-filters]");
  const chips = [];
  if (state.search) chips.push(`<span class="filter-chip">"${escape(state.search)}" <button data-clear="search" aria-label="Quitar">×</button></span>`);
  for (const c of state.cats)
    chips.push(`<span class="filter-chip">${catName(c)} <button data-clear-cat="${c}" aria-label="Quitar">×</button></span>`);
  if (state.priceMin != null) chips.push(`<span class="filter-chip">Min ${money(state.priceMin)} <button data-clear="priceMin" aria-label="Quitar">×</button></span>`);
  if (state.priceMax != null) chips.push(`<span class="filter-chip">Max ${money(state.priceMax)} <button data-clear="priceMax" aria-label="Quitar">×</button></span>`);
  wrap.innerHTML = chips.join("");
  wrap.hidden = chips.length === 0;
}

function updateFilterCount(){
  const n = state.cats.size + (state.priceMin != null ? 1 : 0) + (state.priceMax != null ? 1 : 0);
  const el = $("[data-filter-count]");
  el.textContent = n; el.hidden = n === 0;
}

/* ---------- cart totals + shipping bar (in header + drawer) ---------- */
function cartTotal(){
  return state.cart.reduce((s,i) => {
    const p = state.products.find(x => x.id === i.id);
    return p ? s + activePrice(p) * i.qty : s;
  }, 0);
}
function cartCount(){ return state.cart.reduce((s,i) => s + i.qty, 0); }

function shipHtml(prefix = ""){
  const total = cartTotal();
  const threshold = CONFIG.shippingThreshold;
  if (total >= threshold){
    return `${prefix}<span>🎉 ¡Tenés <b>envío gratis</b>!</span>`;
  }
  const remaining = threshold - total;
  const pct = Math.min(100, Math.round((total / threshold) * 100));
  return `
    ${prefix}
    <span>Te faltan <b>${money(remaining)}</b> para envío gratis</span>
    <span class="ship-track"><span style="width:${pct}%"></span></span>
  `;
}

function renderShipBar(){
  const bar = $("[data-ship-bar]");
  if (state.cart.length === 0){ bar.hidden = true; return; }
  bar.hidden = false;
  bar.innerHTML = shipHtml();
  bar.classList.toggle("is-complete", cartTotal() >= CONFIG.shippingThreshold);
}

/* ---------- cart drawer ---------- */
function renderCartDrawer(){
  const total = cartTotal();
  const count = cartCount();
  const empty = state.cart.length === 0;

  const badge = $("[data-cart-count]");
  badge.textContent = count;
  badge.setAttribute("data-cart-count", count);
  $("[data-cart-count-mini]").hidden = count === 0;

  $("[data-cart-summary]").textContent = count ? `(${count} ítem${count === 1 ? "" : "s"})` : "";
  $("[data-cart-empty]").hidden = !empty;
  $("[data-cart-foot]").hidden  = empty;
  $("[data-subtotal]").textContent = money(total);
  $("[data-ship-note]").textContent = total >= CONFIG.shippingThreshold ? "Gratis" : money(CONFIG.shippingCost);

  const ship = $("[data-ship-progress]");
  if (empty){ ship.innerHTML = ""; ship.hidden = true; }
  else {
    ship.hidden = false;
    ship.innerHTML = shipHtml();
    ship.classList.toggle("is-complete", total >= CONFIG.shippingThreshold);
  }

  $("[data-cart-list]").innerHTML = state.cart.map(i => {
    const p = state.products.find(x => x.id === i.id);
    if (!p) return "";
    return `
      <li class="cart-item" data-id="${p.id}">
        <div class="thumb">${p.image ? `<img src="${p.image}" alt="" loading="lazy"/>` : ""}</div>
        <div>
          ${p.brand ? `<p class="brand">${escape(p.brand)}</p>` : ""}
          <p class="n">${escape(p.name)}</p>
          <p class="p">${money(activePrice(p))}</p>
          <button class="rm" data-remove="${p.id}">Quitar</button>
        </div>
        <div class="qty">
          <button data-dec="${p.id}" aria-label="Menos">−</button>
          <span>${i.qty}</span>
          <button data-inc="${p.id}" aria-label="Más">+</button>
        </div>
      </li>`;
  }).join("");

  renderShipBar();
}

function openCart(){
  renderCartDrawer();
  $("[data-cart-drawer]").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeCart(){
  $("[data-cart-drawer]").hidden = true;
  document.body.style.overflow = "";
}

function renderProfile(){
  const anon = $("[data-anon]"), authed = $("[data-authed]");
  if (!state.user){ anon.hidden = false; authed.hidden = true; return; }
  anon.hidden = true; authed.hidden = false;
  $("[data-user-name]").textContent  = state.user.name || state.user.email;
  $("[data-user-email]").textContent = state.user.email;
  $("[data-avatar]").textContent = (state.user.name || state.user.email).trim()[0].toUpperCase();
  $("[data-admin-entry]").hidden = state.user.email !== ADMIN.email;
}

/* ---------- admin ---------- */
function renderAdminList(){
  const q = state.adminSearch.trim().toLowerCase();
  let list = q ? state.products.filter(p =>
    (p.name + " " + (p.brand||"") + " " + (p.sku||"") + " " + catName(p.category)).toLowerCase().includes(q)
  ) : [...state.products];

  switch (state.adminSort){
    case "name":       list.sort((a,b) => a.name.localeCompare(b.name)); break;
    case "price-desc": list.sort((a,b) => b.price - a.price); break;
    case "price-asc":  list.sort((a,b) => a.price - b.price); break;
    case "stock-asc":  list.sort((a,b) => (a.stock||0) - (b.stock||0)); break;
    default:           list.sort((a,b) => (b.id > a.id ? 1 : -1));
  }

  $("[data-admin-count]").textContent = `(${state.products.length})`;
  $("[data-admin-empty]").hidden = list.length !== 0;

  $("[data-admin-list]").innerHTML = list.map(p => {
    const sale     = p.salePrice && p.salePrice > 0 && p.salePrice < p.price;
    const active   = p.active !== false;
    const lowStock = (p.stock ?? 0) <= 5;
    return `
      <li data-id="${p.id}">
        <div class="thumb">${p.image ? `<img src="${p.image}" alt="" loading="lazy" onerror="this.remove()"/>` : ""}</div>
        <div>
          <p class="n">${escape(p.name)}</p>
          <p class="p">
            <b>${money(activePrice(p))}</b>${sale ? ` <s>${money(p.price)}</s>` : ""}
            · ${catName(p.category)}
            · Stock: <span class="${lowStock ? "off" : ""}">${p.stock ?? 0}</span>
            · <span class="${active ? "ok" : "off"}">${active ? "Activo" : "Oculto"}</span>
            ${p.featured ? " · ⭐ Destacado" : ""}
            ${p.sku ? ` · SKU ${escape(p.sku)}` : ""}
          </p>
        </div>
        <div class="actions">
          <button class="edit" data-edit="${p.id}">Editar</button>
          <button class="del"  data-del="${p.id}">Borrar</button>
        </div>
      </li>
    `;
  }).join("");
}

function renderFilterDrawer(){
  const wrap = $("[data-cat-filters]");
  const counts = Object.fromEntries(CATS.map(c => [c.id, state.products.filter(p => p.category === c.id && p.active !== false).length]));
  wrap.innerHTML = CATS.map(c => `
    <label>
      <input type="checkbox" data-cat="${c.id}" ${state.cats.has(c.id) ? "checked" : ""}/>
      <span>${c.name}</span>
      <span class="n">${counts[c.id] || 0}</span>
    </label>
  `).join("");
  $("[data-price-min]").value = state.priceMin ?? "";
  $("[data-price-max]").value = state.priceMax ?? "";
  $("[data-apply-count]").textContent = selectProducts().length;
}

/* ---------- navigation ---------- */
function nav(name){
  $$(".view").forEach(v => v.hidden = v.dataset.view !== name);
  $$(".tab-btn").forEach(b => b.classList.toggle("is-active", b.dataset.nav === name));
  if (name === "profile") renderProfile();
  if (name === "admin"){ switchAdminTab(state.adminTab); renderAdminList(); }
  window.scrollTo({top:0, behavior:"instant"});
}
function switchAdminTab(name){
  state.adminTab = name;
  $$(".admin-tab").forEach(b => b.classList.toggle("is-active", b.dataset.atab === name));
  $$("[data-atab-panel]").forEach(p => p.hidden = p.dataset.atabPanel !== name);
  if (name === "list") renderAdminList();
}

/* ---------- event delegation ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-nav],[data-add],[data-inc],[data-dec],[data-remove],[data-tab],[data-atab],[data-atab-go],[data-logout],[data-admin-entry],[data-del],[data-edit],[data-sheet-close],[data-sheet-add],[data-sheet-qty-inc],[data-sheet-qty-dec],[data-checkout],[data-cat-chip],[data-open-filters],[data-drawer-close],[data-apply-filters],[data-clear-filters],[data-clear],[data-clear-cat],[data-page],[data-form-reset],[data-scroll-to],[data-open-cart],[data-close-cart],[data-related-open],.card-p");
  if (!t) return;

  if (t.dataset.nav)              return nav(t.dataset.nav);
  if (t.dataset.tab)              return switchAuthTab(t.dataset.tab);
  if (t.dataset.atab)             return switchAdminTab(t.dataset.atab);
  if (t.dataset.atabGo){ e.preventDefault(); return switchAdminTab(t.dataset.atabGo); }
  if ("logout" in t.dataset)      return logout();
  if ("adminEntry" in t.dataset)  return nav("admin");
  if ("openCart" in t.dataset){ e.preventDefault(); return openCart(); }
  if ("closeCart" in t.dataset)   return closeCart();
  if ("sheetClose" in t.dataset)  return closeSheet();
  if (t.dataset.sheetAdd)         return addToCartFromSheet();
  if ("sheetQtyInc" in t.dataset) return sheetQtyChange(+1);
  if ("sheetQtyDec" in t.dataset) return sheetQtyChange(-1);
  if ("checkout" in t.dataset)    return checkout();
  if (t.dataset.add)              { e.stopPropagation(); return addToCart(t.dataset.add); }
  if (t.dataset.inc)              return changeQty(t.dataset.inc, +1);
  if (t.dataset.dec)              return changeQty(t.dataset.dec, -1);
  if (t.dataset.remove)           return removeItem(t.dataset.remove);
  if (t.dataset.del)              return deleteProduct(t.dataset.del);
  if (t.dataset.edit)             return editProduct(t.dataset.edit);
  if (t.dataset.catChip)          return toggleCatChip(t.dataset.catChip);
  if ("openFilters" in t.dataset) return openDrawer();
  if ("drawerClose" in t.dataset) return closeDrawer();
  if ("applyFilters" in t.dataset)return applyDrawer();
  if ("clearFilters" in t.dataset)return clearDrawer();
  if (t.dataset.clear)            return clearOne(t.dataset.clear);
  if (t.dataset.clearCat)         return (state.cats.delete(t.dataset.clearCat), state.page = 1, renderCatNav(), renderCatalog());
  if (t.dataset.page)             return setPage(+t.dataset.page);
  if ("formReset" in t.dataset)   return resetAdminForm();
  if (t.dataset.scrollTo)         return document.getElementById(t.dataset.scrollTo)?.scrollIntoView({behavior:"smooth", block:"start"});
  if (t.dataset.relatedOpen)      return openSheet(t.dataset.relatedOpen);
  if (t.classList.contains("card-p")) return openSheet(t.dataset.id);
});

/* ---------- search + suggestions ---------- */
const searchInput = $("[data-search]");
const suggestBox  = $("[data-suggestions]");

searchInput.addEventListener("input", debounce((e) => {
  state.search = e.target.value; state.page = 1;
  renderSuggestions();
  renderCatalog();
}, 150));
searchInput.addEventListener("focus", renderSuggestions);
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) suggestBox.hidden = true;
});

function renderSuggestions(){
  const q = state.search.trim().toLowerCase();
  if (q.length < 2){ suggestBox.hidden = true; return; }
  const list = state.products.filter(p => {
    if (p.active === false) return false;
    return (p.name + " " + (p.brand||"") + " " + catName(p.category)).toLowerCase().includes(q);
  }).slice(0, 6);
  if (!list.length){ suggestBox.hidden = true; return; }
  suggestBox.hidden = false;
  suggestBox.innerHTML = list.map(p => `
    <button type="button" class="suggest-item" data-id="${p.id}" data-suggest>
      <img src="${p.image || ""}" alt="" onerror="this.style.opacity=.3"/>
      <div>
        ${p.brand ? `<p class="brand">${escape(p.brand)}</p>` : ""}
        <p class="name">${escape(p.name)}</p>
      </div>
      <p class="price">${money(activePrice(p))}</p>
    </button>
  `).join("");
}
suggestBox.addEventListener("click", (e) => {
  const it = e.target.closest("[data-suggest]");
  if (!it) return;
  suggestBox.hidden = true;
  searchInput.blur();
  openSheet(it.dataset.id);
});

/* ---------- sort ---------- */
$("[data-sort]").addEventListener("change", (e) => {
  state.sort = e.target.value; state.page = 1; renderCatalog();
});

function toggleCatChip(id){
  if (id === "__all__"){ state.cats.clear(); }
  else state.cats.has(id) ? state.cats.delete(id) : state.cats.add(id);
  state.page = 1;
  renderCatNav(); renderCatalog();
}
function clearOne(kind){
  if (kind === "search"){ state.search = ""; searchInput.value = ""; }
  if (kind === "priceMin") state.priceMin = null;
  if (kind === "priceMax") state.priceMax = null;
  state.page = 1; renderCatalog();
}
function setPage(n){
  state.page = n;
  renderCatalog();
  document.getElementById("catalog").scrollIntoView({behavior:"smooth", block:"start"});
}

/* ---------- filter drawer ---------- */
function openDrawer(){ renderFilterDrawer(); $("[data-drawer]").hidden = false; document.body.style.overflow = "hidden"; }
function closeDrawer(){ $("[data-drawer]").hidden = true; document.body.style.overflow = ""; }
function applyDrawer(){
  state.cats = new Set($$("[data-cat]:checked").map(el => el.dataset.cat));
  const min = $("[data-price-min]").value, max = $("[data-price-max]").value;
  state.priceMin = min === "" ? null : Number(min);
  state.priceMax = max === "" ? null : Number(max);
  state.page = 1;
  closeDrawer(); renderCatNav(); renderCatalog();
}
function clearDrawer(){
  $$("[data-cat]").forEach(el => el.checked = false);
  $("[data-price-min]").value = ""; $("[data-price-max]").value = "";
  state.cats.clear(); state.priceMin = null; state.priceMax = null;
  $("[data-apply-count]").textContent = selectProducts().length;
}
$("[data-price-min]").addEventListener("input", updateApplyCount);
$("[data-price-max]").addEventListener("input", updateApplyCount);
$("[data-cat-filters]").addEventListener("change", updateApplyCount);
function updateApplyCount(){
  const cats = new Set($$("[data-cat]:checked").map(el => el.dataset.cat));
  const min = $("[data-price-min]").value === "" ? null : Number($("[data-price-min]").value);
  const max = $("[data-price-max]").value === "" ? null : Number($("[data-price-max]").value);
  const n = state.products.filter(p => {
    if (p.active === false) return false;
    if (cats.size && !cats.has(p.category)) return false;
    const price = activePrice(p);
    if (min != null && price < min) return false;
    if (max != null && price > max) return false;
    return true;
  }).length;
  $("[data-apply-count]").textContent = n;
}

/* ---------- cart ops ---------- */
function addToCart(id, qty = 1){
  const p = state.products.find(x => x.id === id);
  if (!p || p.stock === 0) return;
  const item = state.cart.find(i => i.id === id);
  if (item) item.qty = Math.min(item.qty + qty, p.stock);
  else state.cart.push({ id, qty: Math.min(qty, p.stock) });
  persistCart();
  toast("Agregado al carrito");
}
function changeQty(id, d){
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  const p = state.products.find(x => x.id === id);
  const max = p ? p.stock : Infinity;
  item.qty = Math.min(Math.max(item.qty + d, 0), max);
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  persistCart();
}
function removeItem(id){ state.cart = state.cart.filter(i => i.id !== id); persistCart(); }
function persistCart(){
  store.set("cart", state.cart);
  renderShipBar();
  if (!$("[data-cart-drawer]").hidden) renderCartDrawer();
  // header badge
  const count = cartCount();
  const badge = $("[data-cart-count]");
  badge.textContent = count;
  badge.setAttribute("data-cart-count", count);
  $("[data-cart-count-mini]").hidden = count === 0;
}

function checkout(){
  if (!state.user){ toast("Iniciá sesión para finalizar"); closeCart(); nav("profile"); return; }
  state.cart = []; persistCart();
  closeCart();
  toast("¡Pedido enviado! Te contactamos por email.");
  nav("home");
}

/* ---------- auth ---------- */
function switchAuthTab(name){
  $$(".tab").forEach(b => b.classList.toggle("is-active", b.dataset.tab === name));
  $("[data-form='login']").hidden    = name !== "login";
  $("[data-form='register']").hidden = name !== "register";
}
$("[data-form='login']").addEventListener("submit", (e) => {
  e.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(e.target));
  if (email === ADMIN.email && password === ADMIN.password) return setUser({ name:ADMIN.name, email });
  const users = store.get("users", []);
  const u = users.find(x => x.email === email && x.password === password);
  if (!u) return toast("Credenciales inválidas");
  setUser({ name:u.name, email:u.email });
});
$("[data-form='register']").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  if (!data.email.includes("@")) return toast("Email inválido");
  if (data.password.length < 6)  return toast("La contraseña necesita 6+ caracteres");
  const users = store.get("users", []);
  if (users.some(u => u.email === data.email)) return toast("Ese email ya existe");
  users.push(data); store.set("users", users);
  setUser({ name:data.name, email:data.email });
  toast("Cuenta creada");
});
function setUser(u){ state.user = u; store.set("user", u); renderProfile(); toast("Hola, " + (u.name || u.email)); }
function logout(){ state.user = null; store.del("user"); renderProfile(); }

/* ---------- admin: product form ---------- */
const productForm  = $("[data-form='product']");
const imgInput     = $("[data-image-input]");
const imgPreview   = $("[data-image-preview]");
const descTextarea = productForm.description;
const descCounter  = $("[data-desc-count]");

imgInput.addEventListener("input", debounce(() => updateImagePreview(imgInput.value), 200));
function updateImagePreview(url){
  imgPreview.innerHTML = url && /^https?:\/\//.test(url)
    ? `<img src="${escape(url)}" alt="preview" onerror="this.parentNode.innerHTML='<span class=\\'preview-empty\\'>Imagen no válida</span>'"/>`
    : `<span class="preview-empty">Sin imagen</span>`;
}
descTextarea.addEventListener("input", () => descCounter.textContent = descTextarea.value.length);

productForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.user || state.user.email !== ADMIN.email) return toast("Solo admin puede publicar");

  const obj = Object.fromEntries(new FormData(e.target));
  const name  = (obj.name || "").trim();
  const image = (obj.image || "").trim();
  const price = Number(obj.price);
  const salePrice = obj.salePrice === "" ? 0 : Number(obj.salePrice);

  if (!name)             return toast("Falta el nombre");
  if (!image)            return toast("Falta la URL de la imagen");
  if (!(price >= 0))     return toast("Precio inválido");
  if (salePrice && salePrice >= price) return toast("El precio de oferta debe ser menor al precio");

  const existing = obj.id ? state.products.find(p => p.id === obj.id) : null;
  const product = {
    id: obj.id || ("p" + Date.now()),
    name,
    brand:    (obj.brand || "").trim(),
    sku:      (obj.sku   || "").trim() || autoSku(name),
    category: obj.category,
    price,
    salePrice,
    stock:    Number(obj.stock || 0),
    active:   obj.active === "on",
    featured: obj.featured === "on",
    description: (obj.description || "").trim(),
    image,
  };

  if (existing) Object.assign(existing, product);
  else state.products.unshift(product);

  store.set(PRODUCTS_KEY, state.products);
  toast(existing ? "Producto actualizado" : "Producto publicado");
  resetAdminForm();
  renderAdminList(); renderCatNav(); renderFeatured(); renderCatalog();
  switchAdminTab("list");
});

function autoSku(name){
  const slug = name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 12);
  return slug + "-" + String(Date.now()).slice(-4);
}

function editProduct(id){
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  switchAdminTab("form");
  const f = productForm;
  f.id.value          = p.id;
  f.name.value        = p.name;
  f.brand.value       = p.brand || "";
  f.sku.value         = p.sku || "";
  f.category.value    = p.category;
  f.price.value       = p.price;
  f.salePrice.value   = p.salePrice || "";
  f.stock.value       = p.stock ?? 0;
  f.active.checked    = p.active !== false;
  f.featured.checked  = !!p.featured;
  f.image.value       = p.image || "";
  f.description.value = p.description || "";
  updateImagePreview(p.image || "");
  descCounter.textContent = (p.description || "").length;
  $("[data-form-title]").textContent = "Editar producto";
  $("[data-form-hint]").textContent  = `Editando "${p.name}"`;
  $("[data-form-submit]").textContent = "Guardar cambios";
  $("[data-form-reset]").hidden = false;
  f.scrollIntoView({behavior:"smooth", block:"start"});
}
function resetAdminForm(){
  productForm.reset();
  productForm.id.value = "";
  productForm.active.checked = true;
  productForm.featured.checked = false;
  updateImagePreview("");
  descCounter.textContent = "0";
  $("[data-form-title]").textContent = "Nuevo producto";
  $("[data-form-hint]").textContent  = "Completá los campos y publicá.";
  $("[data-form-submit]").textContent = "Publicar producto";
  $("[data-form-reset]").hidden = true;
}
function deleteProduct(id){
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`¿Borrar "${p.name}"? Esta acción no se puede deshacer.`)) return;
  state.products = state.products.filter(x => x.id !== id);
  store.set(PRODUCTS_KEY, state.products);
  renderAdminList(); renderCatNav(); renderFeatured(); renderCatalog();
  toast("Producto eliminado");
}
$("[data-admin-search]").addEventListener("input", debounce((e) => {
  state.adminSearch = e.target.value; renderAdminList();
}, 150));
$("[data-admin-sort]").addEventListener("change", (e) => {
  state.adminSort = e.target.value; renderAdminList();
});

/* ---------- product sheet ---------- */
function openSheet(id){
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  state.sheetPid = id;
  state.sheetQty = 1;

  const img = $("[data-sheet-img]");
  if (p.image){ img.src = p.image; img.style.display = ""; } else img.style.display = "none";
  $("[data-sheet-cat]").textContent   = catName(p.category);
  $("[data-sheet-brand]").textContent = p.brand || "";
  $("[data-sheet-brand]").hidden      = !p.brand;
  $("[data-sheet-name]").textContent  = p.name;
  $("[data-sheet-rating]").innerHTML  = starsRow(p.id) + ` <a>Ver reseñas</a>`;

  const sale = p.salePrice && p.salePrice > 0 && p.salePrice < p.price;
  const off  = sale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
  $("[data-sheet-price]").textContent = money(activePrice(p));
  $("[data-sheet-price-old]").textContent = money(p.price);
  $("[data-sheet-price-old]").hidden = !sale;
  $("[data-sheet-sale]").textContent = `-${off}%`;
  $("[data-sheet-sale]").hidden = !sale;

  const shipEl = $("[data-sheet-ship]");
  if (activePrice(p) >= CONFIG.shippingThreshold){
    shipEl.innerHTML = "✓ Este producto tiene envío gratis";
  } else {
    const remaining = CONFIG.shippingThreshold - activePrice(p);
    shipEl.innerHTML = `Sumá ${money(remaining)} más para envío gratis`;
    shipEl.style.color = "var(--ink-3)";
  }

  $("[data-sheet-desc]").textContent = p.description || "Sin descripción.";
  $("[data-sheet-qty]").textContent = 1;

  const stockEl = $("[data-sheet-stock]");
  if (p.stock === 0){ stockEl.textContent = "Sin stock disponible"; stockEl.classList.add("low"); }
  else if (p.stock <= 5){ stockEl.textContent = `¡Últimas ${p.stock} unidades!`; stockEl.classList.add("low"); }
  else { stockEl.textContent = `${p.stock} disponibles`; stockEl.classList.remove("low"); }

  const addBtn = $("[data-sheet-add]");
  addBtn.disabled = p.stock === 0;
  addBtn.textContent = p.stock === 0 ? "Sin stock" : "Agregar al carrito";

  renderRelated(id, p.category);

  $("[data-sheet]").hidden = false;
  document.body.style.overflow = "hidden";
  const sc = $(".sheet-scroll"); if (sc) sc.scrollTop = 0;
}
function closeSheet(){ $("[data-sheet]").hidden = true; document.body.style.overflow = ""; }

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("[data-sheet]").hidden)        return closeSheet();
  if (!$("[data-cart-drawer]").hidden)  return closeCart();
  if (!$("[data-drawer]").hidden)       return closeDrawer();
});

function sheetQtyChange(d){
  const p = state.products.find(x => x.id === state.sheetPid);
  if (!p) return;
  state.sheetQty = Math.min(Math.max(state.sheetQty + d, 1), p.stock || 1);
  $("[data-sheet-qty]").textContent = state.sheetQty;
}
function addToCartFromSheet(){
  if (!state.sheetPid) return;
  addToCart(state.sheetPid, state.sheetQty);
  closeSheet();
}

function renderRelated(currentId, category){
  const wrap = $("[data-related-wrap]");
  const related = state.products.filter(p => p.id !== currentId && p.category === category && p.active !== false).slice(0, 6);
  wrap.hidden = related.length === 0;
  $("[data-related]").innerHTML = related.map(p => `
    <button type="button" class="rp" data-related-open="${p.id}">
      <div class="th">${p.image ? `<img src="${p.image}" alt="" loading="lazy"/>` : ""}</div>
      <p class="rn">${escape(p.name)}</p>
      <p class="rp-price">${money(activePrice(p))}</p>
    </button>
  `).join("");
}

/* ---------- WhatsApp float ---------- */
$("[data-whatsapp]").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappMsg)}`;

/* ---------- toast + utils ---------- */
let toastTimer;
function toast(msg){
  const t = $("[data-toast]");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.hidden = true, 2100);
}
function debounce(fn, ms){
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}

/* ---------- boot ---------- */
$("[data-year]").textContent = new Date().getFullYear();
renderCatNav();
renderFeatured();
renderCatalog();
renderShipBar();
renderProfile();
resetAdminForm();
// keep header badge in sync on boot
{
  const c = cartCount();
  const b = $("[data-cart-count]");
  b.textContent = c; b.setAttribute("data-cart-count", c);
  $("[data-cart-count-mini]").hidden = c === 0;
}

/* ---------- self-check (?selfcheck=1) ---------- */
if (new URLSearchParams(location.search).get("selfcheck") === "1"){
  console.assert(money(1500) === "$1.500", "money format");
  console.assert(escape("<b>") === "&lt;b&gt;", "escape");
  console.assert(catName("bano") === "Baño", "catName");
  console.assert(activePrice({price:100, salePrice:80}) === 80, "sale price wins");
  console.assert(activePrice({price:100, salePrice:0})  === 100, "no sale");
  console.assert(activePrice({price:100, salePrice:200})=== 100, "invalid sale ignored");
  const r1 = ratingFor("s1"), r2 = ratingFor("s1");
  console.assert(r1.avg === r2.avg && r1.count === r2.count, "rating deterministic");
  console.assert(r1.avg >= 3.8 && r1.avg <= 5.0, "rating range");
  console.log("selfcheck: ok");
}
