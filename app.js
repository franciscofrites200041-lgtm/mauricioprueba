// ponytail: vanilla + localStorage. No build, no backend.
// Images = URLs (not Data URLs) so hundreds of products fit under the 5MB storage cap.
// Upgrade path: swap `store` for fetch() to a real API + a CDN for images.

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

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
  { id:"s1",  name:"Detergente floral 1L",        brand:"Limpio",   sku:"DET-FLR-1L",  price:1200, salePrice:0,    stock:120, active:true, category:"cocina", description:"Aroma a jazmín, concentrado. Rinde el doble.",             image:IMG("photo-1585421514738-01798e348b17") },
  { id:"s2",  name:"Limpiador multiuso 500ml",    brand:"Cif",      sku:"MUL-500",     price:900,  salePrice:0,    stock:80,  active:true, category:"cocina", description:"Desengrasa mesadas, azulejos y anafes sin dejar marca.",  image:IMG("photo-1583947215259-38e31be8751f") },
  { id:"s3",  name:"Lavandina en gel 1L",         brand:"Ayudín",   sku:"LAV-GEL-1L",  price:750,  salePrice:0,    stock:150, active:true, category:"bano",   description:"Se adhiere a superficies verticales. Sin salpicaduras.",  image:IMG("photo-1610557892470-55d9e80c0bce") },
  { id:"s4",  name:"Limpia baño espuma 500ml",    brand:"Cif",      sku:"BNO-ESP-500", price:1350, salePrice:1150, stock:60,  active:true, category:"bano",   description:"Elimina sarro y jabón acumulado en un solo pase.",         image:IMG("photo-1600185365483-26d7a4cc7519") },
  { id:"s5",  name:"Cera para pisos 900ml",       brand:"Blem",     sku:"CRA-900",     price:2100, salePrice:1499, stock:40,  active:true, category:"pisos",  description:"Brillo natural, secado rápido. Para porcelanato y cerámico.",image:IMG("photo-1527515637462-cff94eecc1ac") },
  { id:"s6",  name:"Jabón líquido ropa 3L",       brand:"Ala",      sku:"ALA-LIQ-3L",  price:3400, salePrice:0,    stock:35,  active:true, category:"ropa",   description:"Baja espuma, ideal para lavarropas automáticos.",         image:IMG("photo-1610557892470-55d9e80c0bce") },
  { id:"s7",  name:"Suavizante concentrado 1L",   brand:"Vivere",   sku:"VIV-SUV-1L",  price:1800, salePrice:1450, stock:50,  active:true, category:"ropa",   description:"Aroma prolongado, fórmula concentrada.",                   image:IMG("photo-1585232004423-244e0e6904e3") },
  { id:"s8",  name:"Alcohol en gel 500ml",        brand:"Limpio",   sku:"ALC-GEL-500", price:650,  salePrice:0,    stock:200, active:true, category:"hogar",  description:"70% de alcohol, hidrata las manos con glicerina.",         image:IMG("photo-1584744646711-d0b6b7d18ce8") },
  { id:"s9",  name:"Desengrasante para horno",    brand:"Mr Músculo",sku:"DES-HRN",    price:1650, salePrice:0,    stock:30,  active:true, category:"cocina", description:"Ataca la grasa carbonizada sin fregar.",                   image:IMG("photo-1563453392212-326f5e854473") },
  { id:"s10", name:"Limpia vidrios 500ml",        brand:"Mr Músculo",sku:"VID-500",    price:800,  salePrice:0,    stock:90,  active:true, category:"hogar",  description:"Sin manchas ni rayas. Con gatillo pulverizador.",         image:IMG("photo-1585421514738-01798e348b17") },
  { id:"s11", name:"Trapo de piso microfibra",    brand:"Genérico", sku:"TRP-MIC",     price:1200, salePrice:0,    stock:150, active:true, category:"pisos",  description:"Máxima absorción, no larga pelusa.",                       image:IMG("photo-1527515637462-cff94eecc1ac") },
  { id:"s12", name:"Esponja doble faz x3",        brand:"Virulana", sku:"ESP-3X",      price:450,  salePrice:0,    stock:220, active:true, category:"cocina", description:"Cara suave y cara abrasiva. Larga duración.",              image:IMG("photo-1583947215259-38e31be8751f") },
  { id:"s13", name:"Desodorante de ambiente",     brand:"Glade",    sku:"AMB-LVN",     price:1100, salePrice:0,    stock:70,  active:true, category:"hogar",  description:"Neutraliza olores en lugar de taparlos. Aroma lavanda.",   image:IMG("photo-1584744646711-d0b6b7d18ce8") },
  { id:"s14", name:"Quitamanchas ropa 500ml",     brand:"Vanish",   sku:"QMN-500",     price:1400, salePrice:0,    stock:45,  active:true, category:"ropa",   description:"Actúa en frío, sin dañar los colores.",                    image:IMG("photo-1585232004423-244e0e6904e3") },
  { id:"s15", name:"Detergente antibacterial 1L", brand:"Magistral",sku:"MAG-ANT-1L",  price:1450, salePrice:1199, stock:80,  active:true, category:"cocina", description:"Elimina el 99,9% de bacterias. Suave con las manos.",     image:IMG("photo-1600185365483-26d7a4cc7519") },
  { id:"s16", name:"Limpiador inodoros 750ml",    brand:"Harpic",   sku:"INO-750",     price:950,  salePrice:0,    stock:110, active:true, category:"bano",   description:"Fórmula densa, se adhiere al borde interior.",             image:IMG("photo-1610557892470-55d9e80c0bce") },
  { id:"s17", name:"Jabón de coco en pan",        brand:"Federal",  sku:"COC-PAN",     price:380,  salePrice:0,    stock:180, active:true, category:"ropa",   description:"Clásico para prelavado. Quita manchas difíciles.",         image:IMG("photo-1585232004423-244e0e6904e3") },
  { id:"s18", name:"Balde con escurridor 12L",    brand:"Colombraro",sku:"BLD-12L",    price:2800, salePrice:0,    stock:20,  active:true, category:"pisos",  description:"Balde reforzado con escurridor incorporado.",              image:IMG("photo-1527515637462-cff94eecc1ac") },
  { id:"s19", name:"Guantes de látex par",        brand:"3M",       sku:"GLV-LTX",     price:550,  salePrice:0,    stock:150, active:true, category:"hogar",  description:"Antideslizantes, forrados en algodón.",                    image:IMG("photo-1584744646711-d0b6b7d18ce8") },
  { id:"s20", name:"Aromatizante textil 250ml",   brand:"Poett",    sku:"ATX-250",     price:1350, salePrice:0,    stock:55,  active:true, category:"ropa",   description:"Se rocía sobre la ropa seca. Aroma prolongado.",           image:IMG("photo-1585232004423-244e0e6904e3") },
];

const PRODUCTS_KEY = "products_v3"; // ponytail: bump when SEED schema changes
function loadProducts(){
  store.del("products"); store.del("products_v2"); // clean older versions
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
  adminSort: "newest",
  adminTab:  "form",
};

/* ---------- helpers ---------- */
const money   = n => "$" + Number(n).toLocaleString("es-AR");
const catName = id => (CATS.find(c => c.id === id) || {}).name || id;
const escape  = (s="") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const activePrice = p => (p.salePrice && p.salePrice > 0 && p.salePrice < p.price) ? p.salePrice : p.price;

/* ---------- selection pipeline (public catalog) ---------- */
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

/* ---------- render: categories (horizontal chip strip) ---------- */
function renderCatNav(){
  const nav = $("[data-cat-nav]");
  const counts = Object.fromEntries(CATS.map(c => [c.id, state.products.filter(p => p.category === c.id && p.active !== false).length]));
  const totalActive = state.products.filter(p => p.active !== false).length;
  const allActive = state.cats.size === 0;
  const chip = (id, label, n, active) =>
    `<button class="cat-chip${active ? " is-active" : ""}" data-cat-chip="${id}">${label}<span class="n">${n}</span></button>`;
  nav.innerHTML = [
    chip("__all__", "Todos", totalActive, allActive),
    ...CATS.map(c => chip(c.id, c.name, counts[c.id] || 0, state.cats.has(c.id))),
  ].join("");
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

  const grid = $("[data-grid]");
  grid.innerHTML = slice.map(p => {
    const oos = p.stock === 0;
    const sale = p.salePrice && p.salePrice > 0 && p.salePrice < p.price;
    const off  = sale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
    return `
      <article class="card-p" data-id="${p.id}">
        <div class="thumb ${p.image ? "" : "placeholder"}">
          ${p.image ? `<img src="${p.image}" alt="${escape(p.name)}" loading="lazy" onerror="this.remove()"/>` : ""}
          <span class="tag">${catName(p.category)}</span>
          ${sale ? `<span class="sale-tag">-${off}%</span>` : ""}
          ${oos ? `<div class="oos">Sin stock</div>` : ""}
        </div>
        ${p.brand ? `<p class="brand">${escape(p.brand)}</p>` : ""}
        <p class="name">${escape(p.name)}</p>
        <div class="prices">
          <span class="price ${sale ? "sale" : ""}">${money(activePrice(p))}</span>
          ${sale ? `<span class="price-old">${money(p.price)}</span>` : ""}
        </div>
        <div class="row">
          <span></span>
          <button class="add" data-add="${p.id}" aria-label="Agregar" ${oos ? "disabled" : ""}>+</button>
        </div>
      </article>
    `;
  }).join("");

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

/* ---------- cart ---------- */
function renderCart(){
  const list = $("[data-cart-list]");
  const total = state.cart.reduce((s,i) => {
    const p = state.products.find(x => x.id === i.id);
    return p ? s + activePrice(p) * i.qty : s;
  }, 0);
  const count = state.cart.reduce((s,i) => s + i.qty, 0);

  const badge = $("[data-cart-count]");
  badge.textContent = count;
  badge.setAttribute("data-cart-count", count);
  $("[data-cart-count-mini]").hidden = count === 0;

  const empty = state.cart.length === 0;
  $("[data-cart-empty]").hidden = !empty;
  $("[data-cart-total]").hidden = empty;
  $("[data-subtotal]").textContent = money(total);

  list.innerHTML = state.cart.map(i => {
    const p = state.products.find(x => x.id === i.id);
    if (!p) return "";
    return `
      <li class="cart-item" data-id="${p.id}">
        <div class="thumb">${p.image ? `<img src="${p.image}" alt="" loading="lazy"/>` : ""}</div>
        <div>
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
    const sale   = p.salePrice && p.salePrice > 0 && p.salePrice < p.price;
    const active = p.active !== false;
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
  if (name === "cart")    renderCart();
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
  const t = e.target.closest("[data-nav],[data-add],[data-inc],[data-dec],[data-remove],[data-tab],[data-atab],[data-atab-go],[data-logout],[data-admin-entry],[data-del],[data-edit],[data-sheet-close],[data-sheet-add],[data-checkout],[data-cat-chip],[data-open-filters],[data-drawer-close],[data-apply-filters],[data-clear-filters],[data-clear],[data-clear-cat],[data-page],[data-form-reset],[data-scroll-to],.card-p");
  if (!t) return;

  if (t.dataset.nav)              return nav(t.dataset.nav);
  if (t.dataset.tab)              return switchAuthTab(t.dataset.tab);
  if (t.dataset.atab)             return switchAdminTab(t.dataset.atab);
  if (t.dataset.atabGo){ e.preventDefault(); return switchAdminTab(t.dataset.atabGo); }
  if ("logout" in t.dataset)      return logout();
  if ("adminEntry" in t.dataset)  return nav("admin");
  if ("sheetClose" in t.dataset)  return closeSheet();
  if (t.dataset.sheetAdd)         return (addToCart(t.dataset.sheetAdd), closeSheet());
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
  if (t.classList.contains("card-p")) return openSheet(t.dataset.id);
});

/* ---------- search + sort ---------- */
$("[data-search]").addEventListener("input", debounce((e) => {
  state.search = e.target.value; state.page = 1; renderCatalog();
}, 180));
$("[data-sort]").addEventListener("change", (e) => {
  state.sort = e.target.value; state.page = 1; renderCatalog();
});

function toggleCatChip(id){
  if (id === "__all__"){ state.cats.clear(); }
  else {
    state.cats.has(id) ? state.cats.delete(id) : state.cats.add(id);
  }
  state.page = 1;
  renderCatNav(); renderCatalog();
}
function clearOne(kind){
  if (kind === "search"){ state.search = ""; $("[data-search]").value = ""; }
  if (kind === "priceMin") state.priceMin = null;
  if (kind === "priceMax") state.priceMax = null;
  state.page = 1; renderCatalog();
}
function setPage(n){
  state.page = n;
  renderCatalog();
  document.getElementById("catalog").scrollIntoView({behavior:"smooth", block:"start"});
}

/* ---------- drawer ---------- */
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
function addToCart(id){
  const p = state.products.find(x => x.id === id);
  if (!p || p.stock === 0) return;
  const item = state.cart.find(i => i.id === id);
  if (item) item.qty++;
  else state.cart.push({ id, qty:1 });
  persistCart();
  toast("Agregado al carrito");
}
function changeQty(id, d){
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  persistCart();
}
function removeItem(id){ state.cart = state.cart.filter(i => i.id !== id); persistCart(); }
function persistCart(){ store.set("cart", state.cart); renderCart(); renderCatalog(); }

function checkout(){
  if (!state.user){ toast("Iniciá sesión para finalizar"); nav("profile"); return; }
  state.cart = []; persistCart();
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
  if (email === ADMIN.email && password === ADMIN.password){
    return setUser({ name:ADMIN.name, email });
  }
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
const productForm = $("[data-form='product']");
const imgInput    = $("[data-image-input]");
const imgPreview  = $("[data-image-preview]");
const descTextarea = productForm.description;
const descCounter  = $("[data-desc-count]");

// live image preview (debounced)
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

  const fd = new FormData(e.target);
  const obj = Object.fromEntries(fd);

  const name  = obj.name.trim();
  const image = obj.image.trim();
  const price = Number(obj.price);
  const salePrice = obj.salePrice === "" ? 0 : Number(obj.salePrice);

  if (!name)                 return toast("Falta el nombre");
  if (!image)                return toast("Falta la URL de la imagen");
  if (!(price >= 0))         return toast("Precio inválido");
  if (salePrice && salePrice >= price) return toast("El precio de oferta debe ser menor al precio");

  const existing = obj.id ? state.products.find(p => p.id === obj.id) : null;
  const product = {
    id: obj.id || ("p" + Date.now()),
    name,
    brand: (obj.brand || "").trim(),
    sku:   (obj.sku   || "").trim() || autoSku(name),
    category: obj.category,
    price,
    salePrice,
    stock: Number(obj.stock || 0),
    active: obj.active === "on",
    description: (obj.description || "").trim(),
    image,
  };

  if (existing) Object.assign(existing, product);
  else state.products.unshift(product);

  store.set(PRODUCTS_KEY, state.products);
  toast(existing ? "Producto actualizado" : "Producto publicado");
  resetAdminForm();
  renderAdminList(); renderCatNav(); renderCatalog();
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
  f.id.value        = p.id;
  f.name.value      = p.name;
  f.brand.value     = p.brand || "";
  f.sku.value       = p.sku || "";
  f.category.value  = p.category;
  f.price.value     = p.price;
  f.salePrice.value = p.salePrice || "";
  f.stock.value     = p.stock ?? 0;
  f.active.checked  = p.active !== false;
  f.image.value     = p.image || "";
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
  renderAdminList(); renderCatNav(); renderCatalog();
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
  const img = $("[data-sheet-img]");
  if (p.image){ img.src = p.image; img.style.display = ""; } else img.style.display = "none";
  $("[data-sheet-cat]").textContent = catName(p.category);
  $("[data-sheet-name]").textContent = p.name;
  $("[data-sheet-price]").textContent = money(activePrice(p));
  $("[data-sheet-desc]").textContent = p.description || "Sin descripción.";
  const addBtn = $("[data-sheet-add]");
  addBtn.dataset.sheetAdd = p.id;
  addBtn.disabled = p.stock === 0;
  addBtn.textContent = p.stock === 0 ? "Sin stock" : "Agregar al carrito";
  $("[data-sheet]").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeSheet(){ $("[data-sheet]").hidden = true; document.body.style.overflow = ""; }

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
renderCatalog();
renderCart();
renderProfile();
resetAdminForm();

/* ---------- self-check (only runs when ?selfcheck=1) ---------- */
if (new URLSearchParams(location.search).get("selfcheck") === "1"){
  console.assert(money(1500) === "$1.500", "money format");
  console.assert(escape("<b>") === "&lt;b&gt;", "escape");
  console.assert(catName("bano") === "Baño", "catName");
  console.assert(activePrice({price:100, salePrice:80}) === 80, "sale price wins");
  console.assert(activePrice({price:100, salePrice:0})  === 100, "no sale");
  console.assert(activePrice({price:100, salePrice:200})=== 100, "invalid sale ignored");
  const before = state.search;
  state.search = "zzznope"; console.assert(selectProducts().length === 0, "search miss");
  state.search = "detergente"; console.assert(selectProducts().length >= 1, "search hit");
  state.search = before;
  console.log("selfcheck: ok");
}
