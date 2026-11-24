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
 let toastTimer; 
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
      products = [
    {
      id: "zelora-tshirt-noir",
      name: "T-shirt ZELORA noir",
      category: "Mode",
      symbol: "✦",
      price: 7000,
      description: "T-shirt noir ZELORA.",
      photo_url: "images/produits/file_00000000130081f4884fe8e276391ca8.png",
      quantity: 10
    },
    {
      id: "zelora-tshirt-blanc",
      name: "T-shirt ZELORA blanc",
      category: "Mode",
      symbol: "✦",
      price: 8000,
      description: "T-shirt blanc ZELORA.",
      photo_url: "images/produits/file_000000009a6c81f4812ebf441fe31256.png",
      quantity: 10
    },
    {
      id: "zelora-baskets-blanches",
      name: "Baskets ZELORA blanches",
      category: "Chaussures",
      symbol: "✦",
      price: 15000,
      description: "Baskets blanches élégantes.",
      photo_url: "images/produits/file_000000000ddc81f49fb461c0bafb46bc.png",
      quantity: 6
    }
  ];

  function loadProducts() {
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
          ${
            product.photo_url
              ? `<img src="${escapeHTML(product.photo_url)}"
                  alt="${escapeHTML(product.name)}"
                  style="width:100%;height:100%;object-fit:cover">`
              : `<span class="visual-symbol">${escapeHTML(product.symbol || "✦")}</span>`
          }
          <span class="visual-label">ZELORA</span>
        </div>
        <div class="product-info">
          <span class="product-category">${escapeHTML(product.category)}</span>
          <h3>${escapeHTML(product.name)}</h3>
          <p class="product-note">
  ${escapeHTML(product.description || "Article proposé sur ZELORA")}
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

    const id = String(button.dataset.add);
    cart.set(id, (cart.get(id) || 0) + 1);
    renderCart();
    showNotice("Article ajouté au panier.");
  });

  items?.addEventListener("click", event => {
    const plus = event.target.closest("[data-plus]");
    const minus = event.target.closest("[data-minus]");

    if (plus) {
      const id = String(plus.dataset.plus);
      cart.set(id, (cart.get(id) || 0) + 1);
    }

    if (minus) {
      const id = String(minus.dataset.minus);
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

  $("sellerLoginForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const button = form.querySelector('button[type="submit"]');

  button.disabled = true;
  button.textContent = "Connexion...";

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: String(data.get("email")).trim(),
      password: data.get("password")
    });

    if (error) throw error;

    showNotice("Connexion réussie ! Vous pouvez proposer vos articles.");
    form.reset();

  } catch (error) {
    showNotice("Erreur : " + error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Se connecter";
  }
});
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

  $("productProposalForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const button = form.querySelector('button[type="submit"]');
  const file = data.get("photo");

  button.disabled = true;
  button.textContent = "Envoi...";

  try {
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser();

    if (userError) throw userError;

    const user = userData.user;

    if (!user) {
      throw new Error("Connectez-vous d'abord comme vendeur.");
    }

    if (!(file instanceof File) || !file.size) {
      throw new Error("Ajoutez une photo.");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Le fichier doit être une image.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("La photo ne doit pas dépasser 5 Mo.");
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicData } = supabaseClient.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabaseClient
      .from("produits")
      .insert({
        vendeur_id: user.id,
        nom: String(data.get("produit")).trim(),
        description: String(data.get("description")).trim(),
        prix: Number(data.get("prix")),
        categorie: data.get("categorie"),
        quantite: Number(data.get("quantite")),
        photo_url: publicData.publicUrl,
        statut: "en_attente"
      });

    if (insertError) throw insertError;

    showNotice("Article envoyé ! En attente de validation.");
    form.reset();

  } catch (error) {
    console.error(error);
    showNotice("Erreur : " + error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Envoyer mon article";
  }
});
    

  renderCart();
loadProducts();

})();

