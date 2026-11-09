/* =========================================
   ZELORA — Catalogue, recherche et panier
   Version de démonstration : aucun achat réel
========================================= */
(() => {
  "use strict";

  const products = [
    { id: 1, name: "T-shirt Essential", category: "Mode", symbol: "✦" },
    { id: 2, name: "Ensemble Streetwear", category: "Mode", symbol: "♧" },
    { id: 3, name: "Chemise classique", category: "Mode", symbol: "◇" },
    { id: 4, name: "Sneakers Urban", category: "Chaussures", symbol: "◒" },
    { id: 5, name: "Baskets Sport", category: "Chaussures", symbol: "◉" },
    { id: 6, name: "Sac tendance", category: "Accessoires", symbol: "▱" },
    { id: 7, name: "Casquette Premium", category: "Accessoires", symbol: "⌂" },
    { id: 8, name: "Ensemble sportif", category: "Sport", symbol: "⚽" },
    { id: 9, name: "Maillot de sport", category: "Sport", symbol: "✧" },
    { id: 10, name: "Soin beauté", category: "Beauté", symbol: "❀" },
    { id: 11, name: "Accessoire beauté", category: "Beauté", symbol: "✿" },
    { id: 12, name: "Décoration maison", category: "Maison", symbol: "⌂" }
  ];

  const $ = id => document.getElementById(id);
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
  let toastTimer;

  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  function showNotice(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
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
          <span class="visual-symbol" aria-hidden="true">
            ${product.symbol}
          </span>
          <span class="visual-label">ZELORA · EXEMPLE</span>
        </div>

        <div class="product-info">
          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <h3>${escapeHTML(product.name)}</h3>

          <p class="product-note">
            Exemple visuel — article non disponible à la vente
          </p>

          <div class="product-bottom">
            <span class="product-price">Prix à définir</span>
            <button class="add-button" type="button"
              data-add="${product.id}">
              Ajouter au test
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

    const quantity = rows.reduce(
      (sum, [, amount]) => sum + amount,
      0
    );

    if (count) count.textContent = String(quantity);
    if (total) total.textContent = "À définir";

    if (!items) return;

    items.innerHTML = rows.length
      ? rows.map(([id, amount]) => {
          const product = products.find(item => item.id === id);

          return `
            <div class="cart-row">
              <div class="cart-thumb" aria-hidden="true">
                ${product.symbol}
              </div>

              <div class="cart-row-info">
                <b>${escapeHTML(product.name)}</b>
                <small>Exemple · prix non défini</small>
              </div>

              <div class="quantity-controls">
                <button type="button" data-minus="${id}"
                  aria-label="Retirer un exemplaire">−</button>

                <span>${amount}</span>

                <button type="button" data-plus="${id}"
                  aria-label="Ajouter un exemplaire">+</button>
              </div>
            </div>
          `;
        }).join("")
      : '<p class="cart-empty">Votre panier de démonstration est vide.</p>';
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
    showNotice("Article ajouté au panier de démonstration.");
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

    $("produits")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  $("openCart")?.addEventListener("click", openCart);
  $("closeCart")?.addEventListener("click", closeCart);
  backdrop?.addEventListener("click", closeCart);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCart();
  });

  $("carouselPrev")?.addEventListener("click", () => {
    grid?.scrollBy({
      left: -grid.clientWidth * 0.8,
      behavior: "smooth"
    });
  });

  $("carouselNext")?.addEventListener("click", () => {
    grid?.scrollBy({
      left: grid.clientWidth * 0.8,
      behavior: "smooth"
    });
  });

  $("demoCheckout")?.addEventListener("click", () => {
    showNotice(
      "Démonstration uniquement : les commandes ne sont pas ouvertes."
    );
  });

  const menuButton = $("menuButton");
  const nav = document.querySelector(".desktop-nav");

  menuButton?.addEventListener("click", () => {
    if (!nav) return;

    const isOpen = nav.classList.toggle("mobile-open");

    Object.assign(nav.style, isOpen
      ? {
          display: "flex",
          position: "absolute",
          top: "67px",
          left: "0",
          right: "0",
          padding: "18px 24px",
          background: "#fff",
          flexDirection: "column",
          boxShadow: "0 12px 24px rgba(116,75,91,.10)"
        }
      : {
          display: "",
          position: "",
          top: "",
          left: "",
          right: "",
          padding: "",
          background: "",
          flexDirection: "",
          boxShadow: ""
        });

    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  const year = $("year");
  if (year) year.textContent = String(new Date().getFullYear());

  renderProducts();
  renderCart();
})();
