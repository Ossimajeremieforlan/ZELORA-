/* =========================================
   ZELORA — Application du catalogue
   Démonstration : aucun achat réel activé
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const products = [
    { id: 1, name: "T-shirt Essential", category: "Mode", description: "Un style simple et élégant." },
    { id: 2, name: "Ensemble Streetwear", category: "Mode", description: "Un look urbain pour tous les jours." },
    { id: 3, name: "Chemise classique", category: "Mode", description: "Une pièce élégante et polyvalente." },
    { id: 4, name: "Sneakers Urban", category: "Chaussures", description: "Des chaussures au style moderne." },
    { id: 5, name: "Baskets Sport", category: "Chaussures", description: "Pour un look dynamique." },
    { id: 6, name: "Sac tendance", category: "Accessoires", description: "Un accessoire pratique et stylé." },
    { id: 7, name: "Casquette Premium", category: "Accessoires", description: "La touche finale de ton style." },
    { id: 8, name: "Ensemble sportif", category: "Sport", description: "Une tenue complète pour le sport." },
    { id: 9, name: "Maillot de sport", category: "Sport", description: "Un incontournable des passionnés." },
    { id: 10, name: "Soin beauté", category: "Beauté", description: "Un produit à découvrir auprès des vendeurs." },
    { id: 11, name: "Accessoire beauté", category: "Beauté", description: "Pour compléter ta routine." },
    { id: 12, name: "Décoration maison", category: "Maison", description: "Une touche de personnalité chez toi." }
  ];

  const grid = document.querySelector("#products-grid, .products-grid, [data-products]");
  const searchInput = document.querySelector("#search-input, [data-search]");
  const categoryButtons = document.querySelectorAll("[data-category], .category-button");
  const cartButton = document.querySelector("#cart-button, [data-cart-open]");
  const cartDrawer = document.querySelector("#cart-drawer, [data-cart-drawer]");
  const cartItemsContainer = document.querySelector("#cart-items, [data-cart-items]");
  const cartCount = document.querySelector("#cart-count, [data-cart-count]");
  const closeCartButton = document.querySelector("#close-cart, [data-cart-close]");
  const checkoutButton = document.querySelector("#checkout-button, [data-checkout]");

  let selectedCategory = "Tout";
  let searchTerm = "";
  let cart = [];

  function renderProducts() {
    if (!grid) return;

    const filtered = products.filter(product => {
      const matchesCategory =
        selectedCategory === "Tout" ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-products">
          <p>Aucun article trouvé.</p>
          <small>Essaie une autre recherche.</small>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(product => `
      <article class="product-card">
        <div class="product-image product-placeholder">
          <span>${product.category}</span>
        </div>
        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p class="product-price">Prix à définir</p>
          <button type="button" class="add-to-cart" data-add="${product.id}">
            Ajouter au panier
          </button>
          <small class="demo-label">Article de démonstration</small>
        </div>
      </article>
    `).join("");
  }

  function renderCart() {
    if (cartCount) {
      cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Ton panier est vide.</p>";
      return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <p>Quantité : ${item.quantity}</p>
          <small>Prix à confirmer auprès du vendeur</small>
        </div>
        <button type="button" data-remove="${item.id}">Retirer</button>
      </div>
    `).join("");
  }

  function openCart() {
    if (cartDrawer) {
      cartDrawer.classList.add("active");
      cartDrawer.setAttribute("aria-hidden", "false");
    }
  }

  function closeCart() {
    if (cartDrawer) {
      cartDrawer.classList.remove("active");
      cartDrawer.setAttribute("aria-hidden", "true");
    }
  }

  if (grid) {
    grid.addEventListener("click", event => {
      const addButton = event.target.closest("[data-add]");
      if (!addButton) return;

      const product = products.find(p => p.id === Number(addButton.dataset.add));
      if (!product) return;

      const existing = cart.find(item => item.id === product.id);

      if (existing) {
        existing.quantity++;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      renderCart();
      addButton.textContent = "Ajouté !";
      setTimeout(() => {
        addButton.textContent = "Ajouter au panier";
      }, 1000);
    });
  }

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", event => {
      const removeButton = event.target.closest("[data-remove]");
      if (!removeButton) return;

      cart = cart.filter(item => item.id !== Number(removeButton.dataset.remove));
      renderCart();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", event => {
      searchTerm = event.target.value.trim().toLowerCase();
      renderProducts();
    });
  }

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory =
        button.dataset.category || button.textContent.trim();

      categoryButtons.forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      renderProducts();
    });
  });

  if (cartButton) cartButton.addEventListener("click", openCart);
  if (closeCartButton) closeCartButton.addEventListener("click", closeCart);

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      alert("ZELORA est encore en démonstration. Les commandes et paiements ne sont pas encore activés.");
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCart();
  });

  // Menu mobile
  const menuButton = document.querySelector("#menu-button, [data-menu-toggle]");
  const mobileMenu = document.querySelector("#mobile-menu, [data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });
  }

  // Année automatique dans le pied de page
  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  renderProducts();
  renderCart();
});
