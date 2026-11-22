/* ZELORA — Catalogue, panier et connexion Supabase */
(() => {
  "use strict";

  const SUPABASE_URL = "https://nzaejtwmwugtwlzbomov.supabase.co";
  const SUPABASE_KEY = "sb_publishable_qtljYGWgLCLu7N6MLoXelw_D0gw2mz-";

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  const $ = id => document.getElementById(id);

  const money = value =>
    `${Number(value).toLocaleString("fr-FR")} FCFA`;

  let products = [];
  
  const grid = $("productGrid");
  const search = $("searchInput");
  const categories = $("categoryGrid");
  const count = $("cartCount");
  const items = $("cartItems");
  const total = $("cartTotal");
  const drawer = $("cartDrawer");
  const backdrop = $("drawerBackdrop");
  const toast = $("toast");

  const cart = new Map();
  let activeCategory = "Tout";
  async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("produits")
    .select("id, nom, description, prix, categorie, quantite, photo_url")
    .eq("statut", "valide")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    showNotice("Erreur de chargement des produits.");
    return;
  }

  products = (data || []).map(p => ({
    id: String(p.id),
    name: p.nom,
    category: p.categorie || "Autres",
    symbol: "✦",
    price: String(p.prix),
    description: p.description || "",
    photo_url: p.photo_url || "",
    quantity: String(p.quantite || 0)
  }));

  renderProducts();
  renderCart();
}

  const escapeHTML = value =>
    String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",
      '"':"&quot;","'":"&#39;"
    })[char]);

  function showNotice(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => toast.classList.remove("show"), 2400
    );
  }

  // TEST DE CONNEXION SUPABASE
  async function testerSupabase() {
    try {
      const { error } = await supabaseClient
        .from("produits")
        .select("id")
        .limit(1);

      if (error) {
        console.error("Erreur Supabase :", error.message);
        showNotice("Connexion Supabase à vérifier.");
        return;
      }

      console.log("ZELORA est connectée à Supabase !");
      showNotice("Connexion Supabase réussie !");
    } catch (error) {
      console.error(error);
      showNotice("Impossible de joindre Supabase.");
    }
  }

  function renderProducts() {
    if (!grid) return;

    const term = (search?.value || "").trim().toLocaleLowerCase("fr");

    const filtered = products.filter(product => {
      const categoryMatch =
        activeCategory === "Tout" ||
        product.category === activeCategory;

      const searchMatch =
        (product.name + " " + product.category)
          .toLocaleLowerCase("fr")
          .includes(term);

      return categoryMatch && searchMatch;
    });

    grid.innerHTML = filtered.map(product => `
      <article class="product-card">
        <div class="product-visual">
          <span class="visual-symbol">${product.symbol}</span>
          <span class="visual-label">ZELORA · VISUEL PROVISOIRE</span>
        </div>
        <div class="product-info">
          <span class="product-category">${escapeHTML(product.category)}</span>
          <h3>${escapeHTML(product.name)}</h3>
          <p class="product-note">
            Visuel de présentation — article à confirmer auprès d'un vendeur
          </p>
          <div class="product-bottom">
            <span class="product-price">${money(product.price)}</span>
            <button class="add-button" type="button" data-add="${product.id}">
              Ajouter au panier
            </button>
          </div>
        </div>
      </article>
    `).join("");

    const empty = $("emptyState");
    if (empty) empty.hidden = filtered.length > 0;
  }

  function renderCart() {
    const rows = [...cart.entries()];
    const quantity = rows.reduce((sum, [, amount]) => sum + amount, 0);

    const cartTotal = rows.reduce((sum, [id, amount]) => {
      const product = products.find(item => item.id === id);
      return sum + (product ? product.price * amount : 0);
    }, 0);

    if (count) count.textContent = String(quantity);
    if (total) total.textContent = money(cartTotal);
    if (!items) return;

    items.innerHTML = rows.length ? rows.map(([id, amount]) => {
      const product = products.find(item => item.id === id);
      if (!product) return "";

      return `
        <div class="cart-row">
          <div class="cart-thumb">${product.symbol}</div>
          <div class="cart-row-info">
            <b>${escapeHTML(product.name)}</b>
            <small>${money(product.price)} / unité</small>
          </div>
          <div class="quantity-controls">
            <button type="button" data-minus="${id}">−</button>
            <span>${amount}</span>
            <button type="button" data-plus="${id}">+</button>
          </div>
        </div>
      `;
    }).join("") :
      '<p class="cart-empty">Votre panier est vide.</p>';
  }

  function openCart() {
    drawer?.classList.add("open");
    drawer?.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    drawer?.classList.remove("open");
    drawer?.setAttribute("aria-hidden", "true");
    if (backdrop) backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  grid?.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (!button) return;

    const id = Number(button.dataset.add);
    cart.set(id, (cart.get(id) || 0) + 1);
    renderCart();
    showNotice("Article ajouté au panier.");
  });

  items?.addEventListener("click", event => {
    const plus = event.target.closest("[data-plus]");
    const minus = event.target.closest("[data-minus]");

    if (plus) {
      const id = Number(plus.dataset.plus);
      cart.set(id, (cart.get(id) || 0) + 1);
    }

    if (minus) {
      const id = Number(minus.dataset.minus);
      const next = (cart.get(id) || 0) - 1;
      if (next <= 0) cart.delete(id);
      else cart.set(id, next);
    }

    renderCart();
  });

  search?.addEventListener("input", renderProducts);

  categories?.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    activeCategory = button.dataset.category;

    categories.querySelectorAll(".category-tile").forEach(tile => {
      tile.classList.toggle("active", tile === button);
    });

    renderProducts();
    $("produits")?.scrollIntoView({behavior:"smooth",block:"start"});
  });

  $("openCart")?.addEventListener("click", openCart);
  $("closeCart")?.addEventListener("click", closeCart);
  backdrop?.addEventListener("click", closeCart);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCart();
  });

  $("carouselPrev")?.addEventListener("click", () => {
    grid?.scrollBy({left:-grid.clientWidth * 0.8,behavior:"smooth"});
  });

  $("carouselNext")?.addEventListener("click", () => {
    grid?.scrollBy({left:grid.clientWidth * 0.8,behavior:"smooth"});
  });

  $("demoCheckout")?.addEventListener("click", () => {
    const rows = [...cart.entries()];

    if (!rows.length) {
      showNotice("Votre panier est vide.");
      return;
    }

    const orderLines = rows.map(([id, amount]) => {
      const product = products.find(item => item.id === id);
      return product
        ? `- ${product.name} x${amount} : ${money(product.price * amount)}`
        : "";
    }).filter(Boolean);

    const orderTotal = rows.reduce((sum, [id, amount]) => {
      const product = products.find(item => item.id === id);
      return sum + (product ? product.price * amount : 0);
    }, 0);

    const message = [
      "Bonjour ZELORA ! Je souhaite passer cette commande :",
      "",
      ...orderLines,
      "",
      `Total indicatif : ${money(orderTotal)}`,
      "",
      "Merci de confirmer la disponibilité, la livraison et le paiement."
    ].join("\n");

    window.open(
      "https://wa.me/24102779932?text=" + encodeURIComponent(message),
      "_blank",
      "noopener,noreferrer"
    );
  });

  const menuButton = $("menuButton");
  const nav = document.querySelector(".desktop-nav");

  menuButton?.addEventListener("click", () => {
    if (!nav) return;

    const isOpen = nav.classList.toggle("mobile-open");

    Object.assign(nav.style, isOpen ? {
      display:"flex",position:"absolute",top:"67px",
      left:"0",right:"0",padding:"18px 24px",
      background:"#fff",flexDirection:"column",
      boxShadow:"0 12px 24px rgba(116,75,91,.10)"
    } : {
      display:"",position:"",top:"",left:"",right:"",
      padding:"",background:"",flexDirection:"",boxShadow:""
    });

    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  const year = $("year");
  if (year) year.textContent = String(new Date().getFullYear());

  
$("sellerForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const bouton = form.querySelector('button[type="submit"]');

  bouton.disabled = true;
  bouton.textContent = "Création du compte...";

  try {
    const { data: result, error } =
      await supabaseClient.auth.signUp({
        email: data.get("email").trim(),
        password: data.get("password"),
        options: {
          data: {
            boutique: data.get("boutique"),
            responsable: data.get("responsable"),
            telephone: data.get("telephone"),
            ville: data.get("ville"),
            categorie: data.get("categorie"),
            presentation: data.get("presentation")
          }
        }
      });

    if (error) throw error;

    showNotice(
      result.session
        ? "Compte créé ! Boutique en attente de validation."
        : "Inscription enregistrée ! Vérifiez votre e-mail."
    );

    form.reset();

  } catch (error) {
    showNotice("Erreur : " + error.message);
  } finally {
    bouton.disabled = false;
    bouton.textContent = "Envoyer ma candidature";
  }
});

  $("productProposalForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const message = [
      "Bonjour ZELORA ! Nouvelle proposition d'article :",
      "",
      "Article : " + data.get("produit"),
      "Prix : " + data.get("prix") + " FCFA",
      "Catégorie : " + data.get("categorie"),
      "Description : " + data.get("description"),
      "Boutique : " + data.get("boutique"),
      "WhatsApp vendeur : " + data.get("telephone"),
      "",
      "Je vais joindre la photo de mon article."
    ].join("\n");

    window.open(
      "https://wa.me/24102779932?text=" + encodeURIComponent(message),
      "_blank"
    );
  });

  renderCart();
loadProducts();

})();

