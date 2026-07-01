// ponytail: single-file vanilla + localStorage. No build, no backend, no auth server.
// Upgrade path: swap store() calls for fetch() to a real API when this grows past a demo.

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

/* ---------- storage ---------- */
const store = {
  get(k, d){ try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) },
};

const ADMIN = { email:"admin@limpio.com", password:"admin123", name:"Admin" };

const SEED = [
  { id:"s1", name:"Detergente floral 1L",   price:1200, category:"cocina", description:"Aroma a jazmín, concentrado. Rinde el doble.", image:"" },
  { id:"s2", name:"Limpiador multiuso 500ml", price:900,  category:"cocina", description:"Desengrasa mesadas, azulejos y anafes sin dejar marca.", image:"" },
  { id:"s3", name:"Lavandina en gel 1L",    price:750,  category:"bano",   description:"Se adhiere a superficies verticales. Fórmula sin salpicaduras.", image:"" },
  { id:"s4", name:"Limpia baño espuma",     price:1350, category:"bano",   description:"Elimina sarro y jabón acumulado en un solo pase.", image:"" },
  { id:"s5", name:"Cera para pisos 900ml",  price:2100, category:"pisos",  description:"Brillo natural, secado rápido. Para porcelanato y cerámico.", image:"" },
  { id:"s6", name:"Jabón líquido ropa 3L",  price:3400, category:"ropa",   description:"Baja espuma, ideal para lavarropas automáticos.", image:"" },
];

function loadProducts(){
  const p = store.get("products", null);
  if (p) return p;
  store.set("products", SEED);
  return SEED;
}

let state = {
  products: loadProducts(),
  cart:     store.get("cart", []),
  user:     store.get("user", null),
  filter:   "todos",
};

/* ---------- rendering ---------- */
const money = n => "$" + n.toLocaleString("es-AR");

function renderCatalog(){
  const grid  = $("[data-grid]");
  const list  = state.filter === "todos"
    ? state.products
    : state.products.filter(p => p.category === state.filter);

  $("[data-count]").textContent = `${list.length} producto${list.length===1?"":"s"}`;
  $("[data-empty]").hidden = list.length !== 0;
  grid.innerHTML = list.map(p => `
    <article class="card-p" data-id="${p.id}">
      <div class="thumb ${p.image ? "" : "placeholder"}">
        ${p.image ? `<img src="${p.image}" alt="${escape(p.name)}"/>` : ""}
      </div>
      <span class="tag">${labelCat(p.category)}</span>
      <p class="name">${escape(p.name)}</p>
      <p class="price">${money(p.price)}</p>
      <button class="add" data-add="${p.id}" aria-label="Agregar">+</button>
    </article>
  `).join("");
}

function renderCart(){
  const list = $("[data-cart-list]");
  const total = state.cart.reduce((s,i)=>{
    const p = state.products.find(x=>x.id===i.id);
    return p ? s + p.price * i.qty : s;
  }, 0);
  const count = state.cart.reduce((s,i)=>s+i.qty, 0);

  $("[data-cart-count]").textContent = count;
  $("[data-cart-count]").setAttribute("data-cart-count", count);
  $("[data-cart-count-mini]").hidden = count === 0;

  const empty = state.cart.length === 0;
  $("[data-cart-empty]").hidden = !empty;
  $("[data-cart-total]").hidden = empty;
  $("[data-subtotal]").textContent = money(total);

  list.innerHTML = state.cart.map(i => {
    const p = state.products.find(x=>x.id===i.id);
    if (!p) return "";
    return `
      <li class="cart-item" data-id="${p.id}">
        <div class="thumb">${p.image ? `<img src="${p.image}" alt=""/>` : ""}</div>
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
  if (!state.user){
    anon.hidden = false; authed.hidden = true;
    return;
  }
  anon.hidden = true; authed.hidden = false;
  $("[data-user-name]").textContent  = state.user.name || state.user.email;
  $("[data-user-email]").textContent = state.user.email;
  $("[data-avatar]").textContent = (state.user.name || state.user.email).trim()[0].toUpperCase();
  $("[data-admin-entry]").hidden = state.user.email !== ADMIN.email;
}

function renderAdminList(){
  const ul = $("[data-admin-list]");
  ul.innerHTML = state.products.map(p => `
    <li data-id="${p.id}">
      <div class="thumb">${p.image ? `<img src="${p.image}" alt=""/>` : ""}</div>
      <div>
        <p class="n">${escape(p.name)}</p>
        <p class="p">${money(p.price)} · ${labelCat(p.category)}</p>
      </div>
      <button data-del="${p.id}">Borrar</button>
    </li>
  `).join("");
}

/* ---------- navigation ---------- */
function nav(name){
  $$(".view").forEach(v => v.hidden = v.dataset.view !== name);
  $$(".tab-btn").forEach(b => b.classList.toggle("is-active", b.dataset.nav === name));
  if (name === "cart")    renderCart();
  if (name === "profile") renderProfile();
  if (name === "admin")   renderAdminList();
  window.scrollTo({top:0, behavior:"instant"});
}

/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-nav],[data-add],[data-inc],[data-dec],[data-remove],[data-filter],[data-tab],[data-logout],[data-admin-entry],[data-del],[data-sheet-close],[data-sheet-add],[data-checkout],.card-p");
  if (!t) return;

  if (t.dataset.nav)       return nav(t.dataset.nav);
  if (t.dataset.filter)    return setFilter(t.dataset.filter);
  if (t.dataset.tab)       return switchAuthTab(t.dataset.tab);
  if (t.dataset.logout !== undefined) return logout();
  if (t.dataset.adminEntry !== undefined) return nav("admin");
  if (t.dataset.sheetClose !== undefined) return closeSheet();
  if (t.dataset.sheetAdd)  return (addToCart(t.dataset.sheetAdd), closeSheet());
  if (t.dataset.checkout !== undefined) return checkout();
  if (t.dataset.add) { e.stopPropagation(); return addToCart(t.dataset.add); }
  if (t.dataset.inc) return changeQty(t.dataset.inc, +1);
  if (t.dataset.dec) return changeQty(t.dataset.dec, -1);
  if (t.dataset.remove) return removeItem(t.dataset.remove);
  if (t.dataset.del) return deleteProduct(t.dataset.del);
  if (t.classList.contains("card-p")) return openSheet(t.dataset.id);
});

function setFilter(f){
  state.filter = f;
  $$(".chip").forEach(c => c.classList.toggle("is-active", c.dataset.filter === f));
  renderCatalog();
}

function switchAuthTab(name){
  $$(".tab").forEach(b => b.classList.toggle("is-active", b.dataset.tab === name));
  $("[data-form='login']").hidden    = name !== "login";
  $("[data-form='register']").hidden = name !== "register";
}

/* ---------- cart ---------- */
function addToCart(id){
  const item = state.cart.find(i => i.id === id);
  if (item) item.qty++;
  else state.cart.push({ id, qty: 1 });
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
function removeItem(id){
  state.cart = state.cart.filter(i => i.id !== id);
  persistCart();
}
function persistCart(){
  store.set("cart", state.cart);
  renderCart(); renderCatalog();
}
function checkout(){
  if (!state.user){
    toast("Iniciá sesión para finalizar");
    nav("profile");
    return;
  }
  state.cart = [];
  persistCart();
  toast("¡Pedido enviado! Te contactamos por email.");
  nav("home");
}

/* ---------- auth ---------- */
$("[data-form='login']").addEventListener("submit", (e) => {
  e.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(e.target));
  if (email === ADMIN.email && password === ADMIN.password){
    return setUser({ name: ADMIN.name, email });
  }
  const users = store.get("users", []);
  const u = users.find(x => x.email === email && x.password === password);
  if (!u) return toast("Credenciales inválidas");
  setUser({ name: u.name, email: u.email });
});

$("[data-form='register']").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const users = store.get("users", []);
  if (users.some(u => u.email === data.email)) return toast("Ese email ya existe");
  users.push(data);
  store.set("users", users);
  setUser({ name: data.name, email: data.email });
  toast("Cuenta creada");
});

function setUser(u){
  state.user = u;
  store.set("user", u);
  renderProfile();
  toast("Hola, " + (u.name || u.email));
}
function logout(){
  state.user = null;
  localStorage.removeItem("user");
  renderProfile();
}

/* ---------- admin ---------- */
$("[data-form='product']").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!state.user || state.user.email !== ADMIN.email) return toast("Solo admin");

  const fd = new FormData(e.target);
  const file = fd.get("image");
  const image = file && file.size ? await toDataURL(file) : "";
  const product = {
    id: "p" + Date.now(),
    name: fd.get("name").trim(),
    price: Number(fd.get("price")),
    category: fd.get("category"),
    description: fd.get("description").trim(),
    image,
  };
  state.products.unshift(product);
  store.set("products", state.products);
  e.target.reset();
  renderAdminList(); renderCatalog();
  toast("Producto publicado");
});

function deleteProduct(id){
  if (!confirm("¿Borrar este producto?")) return;
  state.products = state.products.filter(p => p.id !== id);
  store.set("products", state.products);
  renderAdminList(); renderCatalog();
}

function toDataURL(file){
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ---------- product sheet ---------- */
function openSheet(id){
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  $("[data-sheet-img]").src = p.image || "";
  $("[data-sheet-img]").style.display = p.image ? "" : "none";
  $("[data-sheet-cat]").textContent = labelCat(p.category);
  $("[data-sheet-name]").textContent = p.name;
  $("[data-sheet-price]").textContent = money(p.price);
  $("[data-sheet-desc]").textContent = p.description || "Sin descripción.";
  $("[data-sheet-add]").dataset.sheetAdd = p.id;
  $("[data-sheet]").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeSheet(){
  $("[data-sheet]").hidden = true;
  document.body.style.overflow = "";
}

/* ---------- toast ---------- */
let toastTimer;
function toast(msg){
  const t = $("[data-toast]");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.hidden = true, 1900);
}

/* ---------- helpers ---------- */
function labelCat(c){
  return { cocina:"Cocina", bano:"Baño", pisos:"Pisos", ropa:"Ropa" }[c] || c;
}
function escape(s=""){
  return s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

/* ---------- boot ---------- */
renderCatalog();
renderCart();
renderProfile();

/* ---------- self-check (only runs when ?selfcheck=1) ---------- */
if (new URLSearchParams(location.search).get("selfcheck") === "1"){
  console.assert(money(1500) === "$1.500", "money format");
  console.assert(escape("<script>") === "&lt;script&gt;", "escape");
  console.assert(labelCat("bano") === "Baño", "labelCat");
  console.log("selfcheck: ok");
}
