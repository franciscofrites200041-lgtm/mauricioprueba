// ponytail: vanilla + localStorage. No build, no backend.
// Images = URLs (not Data URLs) so a catalog of hundreds fits well under the 5MB storage cap.
// Upgrade path: swap `store` for fetch() to a real API + a CDN when this grows past a demo.

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
  { id:"cocina", name:"Cocina", icon:"🍳" },
  { id:"bano",   name:"Baño",   icon:"🛁" },
  { id:"pisos",  name:"Pisos",  icon:"✨" },
  { id:"ropa",   name:"Ropa",   icon:"👕" },
  { id:"hogar",  name:"Hogar",  icon:"🏠" },
];

// image URLs from Unsplash so the demo has real photos out of the box.
const IMG = (id, w=600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
const SEED = [
  { id:"s1",  name:"Detergente floral 1L",        price:1200, category:"cocina", stock:120, description:"Aroma a jazmín, concentrado. Rinde el doble.",                       image:IMG("photo-1585421514738-01798e348b17") },
  { id:"s2",  name:"Limpiador multiuso 500ml",    price:900,  category:"cocina", stock:80,  description:"Desengrasa mesadas, azulejos y anafes sin dejar marca.",             image:IMG("photo-1583947215259-38e31be8751f") },
  { id:"s3",  name:"Lavandina en gel 1L",         price:750,  category:"bano",   stock:150, description:"Se adhiere a superficies verticales. Sin salpicaduras.",              image:IMG("photo-1610557892470-55d9e80c0bce") },
  { id:"s4",  name:"Limpia baño espuma 500ml",    price:1350, category:"bano",   stock:60,  description:"Elimina sarro y jabón acumulado en un solo pase.",                    image:IMG("photo-1600185365483-26d7a4cc7519") },
  { id:"s5",  name:"Cera para pisos 900ml",       price:2100, category:"pisos",  stock:40,  description:"Brillo natural, secado rápido. Para porcelanato y cerámico.",          image:IMG("photo-1527515637462-cff94eecc1ac") },
  { id:"s6",  name:"Jabón líquido ropa 3L",       price:3400, category:"ropa",   stock:35,  description:"Baja espuma, ideal para lavarropas automáticos.",                     image:IMG("photo-1610557892470-55d9e80c0bce") },
  { id:"s7",  name:"Suavizante concentrado 1L",   price:1800, category:"ropa",   stock:50,  description:"Aroma prolongado, fórmula concentrada.",                              image:IMG("photo-1585232004423-244e0e6904e3") },
  { id:"s8",  name:"Alcohol en gel 500ml",        price:650,  category:"hogar",  stock:200, description:"70% de alcohol, hidrata las manos con glicerina.",                    image:IMG("photo-1584744646711-d0b6b7d18ce8") },
  { id:"s9",  name:"Desengrasante para horno",    price:1650, category:"cocina", stock:30,  description:"Ataca la grasa carbonizada sin fregar.",                              image:IMG("photo-1563453392212-326f5e854473") },
  { id:"s10", name:"Limpia vidrios 500ml",        price:800,  category:"hogar",  stock:90,  description:"Sin manchas ni rayas. Con gatillo pulverizador.",                     image:IMG("photo-1585421514738-01798e348b17") },
  { id:"s11", name:"Trapo de piso microfibra",    price:1200, category:"pisos",  stock:150, description:"Máxima absorción, no larga pelusa.",                                  image:IMG("photo-1527515637462-cff94eecc1ac") },
  { id:"s12", name:"Esponja doble faz x3",        price:450,  category:"cocina", stock:220, description:"Cara suave y cara abrasiva. Larga duración.",                          image:IMG("photo-1583947215259-38e31be8751f") },
  { id:"s13", name:"Desodorante de ambiente",     price:1100, category:"hogar",  stock:70,  description:"Neutraliza olores en lugar de taparlos. Aroma lavanda.",               image:IMG("photo-1584744646711-d0b6b7d18ce8") },
  { id:"s14", name:"Quitamanchas ropa 500ml",     price:1400, category:"ropa",   stock:45,  description:"Actúa en frío, sin dañar los colores.",                                image:IMG("photo-1585232004423-244e0e6904e3") },
  { id:"s15", name:"Detergente antibacterial 1L", price:1450, category:"cocina", stock:80,  description:"Elimina el 99,9% de bacterias. Suave con las manos.",                  image:IMG("photo-1600185365483-26d7a4cc7519") },
  { id:"s16", name:"Limpiador inodoros 750ml",    price:950,  category:"bano",   stock:110, description:"Fórmula densa, se adhiere al borde interior.",                        image:IMG("photo-1610557892470-55d9e80c0bce") },
  { id:"s17", name:"Jabón de coco en pan",        price:380,  category:"ropa",   stock:180, description:"Clásico para prelavado. Quita manchas difíciles.",                    image:IMG("photo-1585232004423-244e0e6904e3") },
  { id:"s18", name:"Balde con escurridor 12L",    price:2800, category:"pisos",  stock:20,  description:"Balde reforzado con escurridor incorporado.",                          image:IMG("photo-1527515637462-cff94eecc1ac") },
  { id:"s19", name:"Guantes de látex par",        price:550,  category:"hogar",  stock:150, description:"Antideslizantes, forrados en algodón.",                                image:IMG("photo-1584744646711-d0b6b7d18ce8") },
  { id:"s20", name:"Aromatizante textil 250ml",   price:1350, category:"ropa",   stock:55,  description:"Se rocía sobre la ropa seca. Aroma prolongado.",                       image:IMG("photo-1585232004423-244e0e6904e3") },
];

const PRODUCTS_KEY = "products_v2"; // ponytail: bump when SEED schema changes
function loadProducts(){
  store.del("products"); // clean up v1
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
  editingId:   null,
};

/* ---------- helpers ---------- */
const money  = n => "$" + n.toLocaleString("es-AR");
const catName = id => (CATS.find(c => c.id === id) || {}).name || id;
const escape = (s="") => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- selection pipeline ---------- */
function selectProducts(){
  const q = state.search.trim().toLowerCase();
  let list = state.products.filter(p => {
    if (state.cats.size && !state.cats.has(p.category)) return false;
    if (state.priceMin != null && p.price < state.priceMin) return false;
    if (state.priceMax != null && p.price > state.priceMax) return false;
    if (q){
      const hay = (p.name + " " + (p.description || "") + " " + catName(p.category)).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  switch (state.sort){
    case "price-asc":  list.sort((a,b) => a.price - b.price); break;
    case "price-desc": list.sort((a,b) => b.price - a.price); break;
    case "name-asc":   list.sort((a,b) => a.name.localeCompare(b.name)); break;
    case "newest":     list.sort((a,b) => (b.id > a.id ? 1 : -1)); break;
  }
  return list;
}

/* ---------- render ---------- */
function renderCategories(){
  const wrap = $("[data-cat-grid]");
  const counts = Object.fromEntries(CATS.map(c => [c.id, state.products.filter(p => p.category === c.id).length]));
  wrap.innerHTML = CATS.map(c => {
    const active = state.cats.has(c.id) ? " is-active" : "";
    return `<button class="cat-tile${active}" data-cat-tile="${c.id}">
      <span class="icon">${c.icon}</span>
      <div>
        <p class="name">${c.name}</p>
        <p class="n">${counts[c.id] || 0} productos</p>
      </div>
    </button>`;
  }).join("");
}

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
    return `
      <article class="card-p" data-id="${p.id}">
        <div class="thumb ${p.image ? "" : "placeholder"}">
          ${p.image ? `<img src="${p.image}" alt="${escape(p.name)}" loading="lazy" onerror="this.remove()"/>` : ""}
          ${oos ? `<div class="oos">Sin stock</div>` : ""}
        </div>
        <span class="tag">${catName(p.category)}</span>
        <p class="name">${escape(p.name)}</p>
        <div class="row">
          <p class="price">${money(p.price)}</p>
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
  if (pages <= 1) return el.innerHTML = "";
  const cur = state.page;
  const pageBtn = (n, label = n, active = false) =>
    `<button data-page="${n}" class="${active ? "is-active" : ""}">${label}</button>`;
  const parts = [];
  parts.push(`<button data-page="${cur-1}" ${cur === 1 ? "disabled" : ""}>←</button>`);
  // compact page numbers: 1 … cur-1 cur cur+1 … last
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

function renderCart(){
  const list = $("[data-cart-list]");
  const total = state.cart.reduce((s,i) => {
    const p = state.products.find(x => x.id === i.id);
    return p ? s + p.price * i.qty : s;
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
          <p class="p">${money(p.price)}</p>
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
  if (!state.user){ anon.hidden = false; authed.hidden = true; return }
  anon.hidden = true; authed.hidden = false;
  $("[data-user-name]").textContent  = state.user.name || state.user.email;
  $("[data-user-email]").textContent = state.user.email;
  $("[data-avatar]").textContent = (state.user.name || state.user.email).trim()[0].toUpperCase();
  $("[data-admin-entry]").hidden = state.user.email !== ADMIN.email;
}

function renderAdminList(){
  const q = state.adminSearch.trim().toLowerCase();
  const list = q ? state.products.filter(p => (p.name + " " + catName(p.category)).toLowerCase().includes(q)) : state.products;
  $("[data-admin-count]").textContent = `(${list.length})`;
  $("[data-admin-list]").innerHTML = list.map(p => `
    <li data-id="${p.id}">
      <div class="thumb">${p.image ? `<img src="${p.image}" alt="" loading="lazy" onerror="this.remove()"/>` : ""}</div>
      <div>
        <p class="n">${escape(p.name)}</p>
        <p class="p">${money(p.price)} · ${catName(p.category)} · stock ${p.stock ?? 0}</p>
      </div>
      <button class="edit" data-edit="${p.id}">Editar</button>
      <button class="del"  data-del="${p.id}">Borrar</button>
    </li>
  `).join("");
}

function renderFilterDrawer(){
  const wrap = $("[data-cat-filters]");
  const counts = Object.fromEntries(CATS.map(c => [c.id, state.products.filter(p => p.category === c.id).length]));
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
  if (name === "admin"){ resetAdminForm(); renderAdminList(); }
  window.scrollTo({top:0, behavior:"instant"});
}

/* ---------- event delegation ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-nav],[data-add],[data-inc],[data-dec],[data-remove],[data-tab],[data-logout],[data-admin-entry],[data-del],[data-edit],[data-sheet-close],[data-sheet-add],[data-checkout],[data-cat-tile],[data-open-filters],[data-drawer-close],[data-apply-filters],[data-clear-filters],[data-clear],[data-clear-cat],[data-page],[data-form-reset],.card-p");
  if (!t) return;

  if (t.dataset.nav)              return nav(t.dataset.nav);
  if (t.dataset.tab)              return switchAuthTab(t.dataset.tab);
  if ("logout" in t.dataset)      return logout();
  if ("adminEntry" in t.dataset)  return nav("admin");
  if ("sheetClose" in t.dataset)  return closeSheet();
  if (t.dataset.sheetAdd)         return (addToCart(t.dataset.sheetAdd), closeSheet());
  if ("checkout" in t.dataset)    return checkout();
  if (t.dataset.add)              { e.stopPropagation(); return addToCart(t.dataset.add) }
  if (t.dataset.inc)              return changeQty(t.dataset.inc, +1);
  if (t.dataset.dec)              return changeQty(t.dataset.dec, -1);
  if (t.dataset.remove)           return removeItem(t.dataset.remove);
  if (t.dataset.del)              return deleteProduct(t.dataset.del);
  if (t.dataset.edit)             return editProduct(t.dataset.edit);
  if (t.dataset.catTile)          return toggleCat(t.dataset.catTile);
  if ("openFilters" in t.dataset) return openDrawer();
  if ("drawerClose" in t.dataset) return closeDrawer();
  if ("applyFilters" in t.dataset)return applyDrawer();
  if ("clearFilters" in t.dataset)return clearDrawer();
  if (t.dataset.clear)            return clearOne(t.dataset.clear);
  if (t.dataset.clearCat)         return (state.cats.delete(t.dataset.clearCat), state.page = 1, renderCategories(), renderCatalog());
  if (t.dataset.page)             return setPage(+t.dataset.page);
  if ("formReset" in t.dataset)   return resetAdminForm();
  if (t.classList.contains("card-p")) return openSheet(t.dataset.id);
});

/* ---------- toolbar / filters ---------- */
$("[data-search]").addEventListener("input", debounce((e) => {
  state.search = e.target.value; state.page = 1; renderCatalog();
}, 180));

$("[data-sort]").addEventListener("change", (e) => {
  state.sort = e.target.value; state.page = 1; renderCatalog();
});

function toggleCat(id){
  state.cats.has(id) ? state.cats.delete(id) : state.cats.add(id);
  state.page = 1;
  renderCategories(); renderCatalog();
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
  document.querySelector("[data-grid]").scrollIntoView({behavior:"smooth", block:"start"});
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
  closeDrawer(); renderCategories(); renderCatalog();
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
    if (cats.size && !cats.has(p.category)) return false;
    if (min != null && p.price < min) return false;
    if (max != null && p.price > max) return false;
    return true;
  }).length;
  $("[data-apply-count]").textContent = n;
}

/* ---------- cart ---------- */
function addToCart(id){
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

/* ---------- admin ---------- */
$("[data-form='product']").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.user || state.user.email !== ADMIN.email) return toast("Solo admin");
  const fd = new FormData(e.target);
  const obj = Object.fromEntries(fd);
  const product = {
    id: obj.id || ("p" + Date.now()),
    name: obj.name.trim(),
    price: Number(obj.price),
    category: obj.category,
    stock: Number(obj.stock || 0),
    description: (obj.description || "").trim(),
    image: obj.image.trim(),
  };
  if (!product.name || !product.image || !(product.price >= 0)) return toast("Faltan datos");

  const i = state.products.findIndex(p => p.id === product.id);
  if (i >= 0) state.products[i] = product;
  else state.products.unshift(product);
  store.set(PRODUCTS_KEY, state.products);
  toast(i >= 0 ? "Producto actualizado" : "Producto publicado");
  resetAdminForm();
  renderAdminList(); renderCatalog(); renderCategories();
});

function editProduct(id){
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  state.editingId = id;
  const form = $("[data-form='product']");
  form.name.value = p.name;
  form.price.value = p.price;
  form.category.value = p.category;
  form.stock.value = p.stock ?? 0;
  form.image.value = p.image;
  form.description.value = p.description || "";
  form.id.value = p.id;
  $("[data-form-title]").textContent = "Editar producto";
  $("[data-form-submit]").textContent = "Guardar cambios";
  $("[data-form-reset]").hidden = false;
  form.scrollIntoView({behavior:"smooth", block:"start"});
}
function resetAdminForm(){
  state.editingId = null;
  const form = $("[data-form='product']");
  form.reset(); form.id.value = "";
  $("[data-form-title]").textContent = "Nuevo producto";
  $("[data-form-submit]").textContent = "Publicar producto";
  $("[data-form-reset]").hidden = true;
}
function deleteProduct(id){
  if (!confirm("¿Borrar este producto?")) return;
  state.products = state.products.filter(p => p.id !== id);
  store.set(PRODUCTS_KEY, state.products);
  renderAdminList(); renderCatalog(); renderCategories();
}
$("[data-admin-search]").addEventListener("input", debounce((e) => {
  state.adminSearch = e.target.value; renderAdminList();
}, 150));

/* ---------- product sheet ---------- */
function openSheet(id){
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const img = $("[data-sheet-img]");
  if (p.image){ img.src = p.image; img.style.display = ""; } else img.style.display = "none";
  $("[data-sheet-cat]").textContent = catName(p.category);
  $("[data-sheet-name]").textContent = p.name;
  $("[data-sheet-price]").textContent = money(p.price);
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
  toastTimer = setTimeout(() => t.hidden = true, 1900);
}
function debounce(fn, ms){
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}

/* ---------- boot ---------- */
$("[data-year]").textContent = new Date().getFullYear();
renderCategories();
renderCatalog();
renderCart();
renderProfile();

/* ---------- self-check (only runs when ?selfcheck=1) ---------- */
if (new URLSearchParams(location.search).get("selfcheck") === "1"){
  console.assert(money(1500) === "$1.500", "money format");
  console.assert(escape("<b>") === "&lt;b&gt;", "escape");
  console.assert(catName("bano") === "Baño", "catName");
  const oldPage = state.page, oldSearch = state.search;
  state.search = "zzznope"; console.assert(selectProducts().length === 0, "search miss");
  state.search = "detergente"; console.assert(selectProducts().length >= 1, "search hit");
  state.search = ""; state.cats = new Set(["bano"]);
  const only = selectProducts(); console.assert(only.every(p => p.category === "bano"), "cat filter");
  state.cats.clear(); state.priceMax = 500;
  console.assert(selectProducts().every(p => p.price <= 500), "price cap");
  state.priceMax = null; state.page = oldPage; state.search = oldSearch;
  console.log("selfcheck: ok");
}
