const logo = "https://69f3a2d41c78705e2c4c2413.imgix.net/ChatGPT%20Image%2030%20de%20abr.%20de%202026,%2016_41_59.png";
const heroImages = [
  "https://69f3a2d41c78705e2c4c2413.imgix.net/logo.png",
];

const massaiImages = [
  "https://69f3a2d41c78705e2c4c2413.imgix.net/6.jpeg",
  "https://69f3a2d41c78705e2c4c2413.imgix.net/5.jpeg",
  "https://69f3a2d41c78705e2c4c2413.imgix.net/1.jpeg",
];

const corpizImages = [
  "https://69f3a2d41c78705e2c4c2413.imgix.net/WhatsApp%20Image%202026-04-30%20at%2015.11.30.jpeg",
  "https://69f3a2d41c78705e2c4c2413.imgix.net/WhatsApp%20Image%202026-04-30%20at%2015.11.31.jpeg",
  "https://69f3a2d41c78705e2c4c2413.imgix.net/WhatsApp%20Image%202026-04-30%20at%20.jpeg",
];

const defaultProducts = [
  {
    id: "massai",
    name: "Savane Tusk",
    tag: "Elegância minimalista.",
    price: 499,
    images: massaiImages,
  },
  {
    id: "corpiz",
    name: "Savane Corpiz",
    tag: "Conforto e presença.",
    price: 599,
    images: corpizImages,
  },
  {
    id: "aura",
    name: "Savane Massai",
    tag: "Leveza para todos os dias.",
    price: 549,
    images: [
      "assets/massai-0.jpeg",
      "assets/massai-1.jpeg",
      "assets/massai-2.jpeg",
    ],
  },
  {
    id: "terra",
    name: "Savane Trackeer",
    tag: "Presença urbana com acabamento premium.",
    price: 649,
    images: [
      "assets/trackeer-0.jpeg",
      "assets/trackeer-1.jpeg",
      "assets/trackeer-2.jpeg",
      "assets/trackeer-3.jpeg",
      "assets/trackeer-4.jpeg",
      "assets/trackeer-5.jpeg",
    ],
  },
];

const catalogStorageKey = "savane_catalog_v1";
const catalogSeedKey = "savane_catalog_seeded_v2";
const settingsStorageKey = "savane_settings_v1";
const adminSessionKey = "savane_admin_session";
const adminPassword = "savane2026";
const allowedSizes = new Set(["38", "39", "40", "41", "42", "43"]);
const editorLimits = {
  brand: 32,
  headline: 80,
  cta: 32,
};

function loadStoredJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function createProductId() {
  return `produto-${Date.now().toString(36)}`;
}

function isAdminSessionActive() {
  try {
    return sessionStorage.getItem(adminSessionKey) === "true";
  } catch {
    return false;
  }
}

function safeId(value, fallback = createProductId()) {
  const id = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return id || fallback;
}

function normalizeStoredProducts(value) {
  const source = Array.isArray(value) ? value : defaultProducts;
  const usedIds = new Set();

  return source.map((product, index) => {
    const fallback = defaultProducts[index] || defaultProducts[0];
    const requestedId = safeId(product?.id || fallback.id);
    const id = requestedId && !usedIds.has(requestedId) ? requestedId : createProductId();
    usedIds.add(id);

    const images = Array.isArray(product?.images)
      ? product.images.map((image) => safeImageUrl(image)).filter(Boolean).slice(0, 8)
      : [];

    return {
      id,
      name: safeText(product?.name || fallback.name || "Produto", 60),
      tag: safeText(product?.tag || fallback.tag || "Descrição do produto.", 120),
      price: Math.min(999999, Math.max(0, Number(product?.price || fallback.price || 0))),
      images: images.length ? images : [...fallback.images],
    };
  });
}

const state = {
  currentPage: "home",
  currentImage: 0,
  productImageIndexes: {},
  galleryProductId: null,
  galleryImageIndex: 0,
  mobileMenuOpen: false,
  cartItems: [],
  brand: "Savane Suede",
  headline: "NÃO É SÓ UM TÊNIS. É MOVIMENTO.",
  cta: "ENTRAR NA COLEÇÃO",
  products: normalizeStoredProducts(loadStoredJson(catalogStorageKey, defaultProducts)),
  selectedSizes: {},
  adminLoggedIn: isAdminSessionActive(),
  adminError: "",
  selectedItem: {
    name: "Savane Tusk",
    price: 499,
    color: "Cor única",
    size: "40",
    image: massaiImages[0],
  },
};

const storedSettings = loadStoredJson(settingsStorageKey, {
  brand: state.brand,
  headline: state.headline,
  cta: state.cta,
});

state.brand = safeText(storedSettings.brand || state.brand, editorLimits.brand) || state.brand;
state.headline = safeText(storedSettings.headline || state.headline, editorLimits.headline) || state.headline;
state.cta = safeText(storedSettings.cta || state.cta, editorLimits.cta) || state.cta;

state.products.forEach((product) => {
  state.selectedSizes[product.id] = state.selectedSizes[product.id] || "40";
  state.productImageIndexes[product.id] = state.productImageIndexes[product.id] || 0;
});

let catalogSeeded = false;
try {
  catalogSeeded = localStorage.getItem(catalogSeedKey) === "true";
} catch {
  catalogSeeded = true;
}

if (!catalogSeeded) {
  defaultProducts.forEach((defaultProduct) => {
    if (!state.products.some((product) => product.id === defaultProduct.id)) {
      state.products.push({ ...defaultProduct, images: [...defaultProduct.images] });
    }
  });
  try {
    localStorage.setItem(catalogSeedKey, "true");
  } catch {
    // Sem armazenamento, a página ainda carrega normalmente.
  }
}

const auraProduct = state.products.find((product) => product.id === "aura");
if (auraProduct && auraProduct.name === "Savane Aura") {
  auraProduct.name = "Savane Massai";
  auraProduct.images = [
    "assets/massai-0.jpeg",
    "assets/massai-1.jpeg",
    "assets/massai-2.jpeg",
  ];
}

const terraProduct = state.products.find((product) => product.id === "terra");
if (terraProduct && terraProduct.name === "Savane Terra") {
  terraProduct.name = "Savane Trackeer";
  terraProduct.images = [
    "assets/trackeer-0.jpeg",
    "assets/trackeer-1.jpeg",
    "assets/trackeer-2.jpeg",
    "assets/trackeer-3.jpeg",
    "assets/trackeer-4.jpeg",
    "assets/trackeer-5.jpeg",
  ];
}

state.products.forEach((product) => {
  state.selectedSizes[product.id] = state.selectedSizes[product.id] || "40";
  state.productImageIndexes[product.id] = state.productImageIndexes[product.id] || 0;
});
saveCatalog();

const root = document.getElementById("root");

function safeText(value, maxLength = 120) {
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeImageUrl(value) {
  const localPath = String(value).trim();
  if (/^assets\/[a-z0-9._-]+\.(jpe?g|png|webp)$/i.test(localPath)) {
    return localPath;
  }

  try {
    const url = new URL(value);
    const allowedHosts = new Set([
      "69f3a2d41c78705e2c4c2413.imgix.net",
      "images.unsplash.com",
    ]);

    if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
      return "";
    }

    return url.href.replace(/'/g, "%27").replace(/"/g, "%22");
  } catch {
    return "";
  }
}

function displayImageUrl(value) {
  return safeImageUrl(value) || safeImageUrl(logo);
}

function allowedProductIds() {
  return new Set(state.products.map((product) => product.id));
}

function saveCatalog() {
  try {
    localStorage.setItem(catalogStorageKey, JSON.stringify(state.products));
  } catch {
    // A loja continua funcionando mesmo se o navegador bloquear armazenamento.
  }
}

function saveSettings() {
  try {
    localStorage.setItem(settingsStorageKey, JSON.stringify({
      brand: state.brand,
      headline: state.headline,
      cta: state.cta,
    }));
  } catch {
    // A loja continua funcionando mesmo se o navegador bloquear armazenamento.
  }
}

function normalizeImages(value) {
  return String(value)
    .split(/\r?\n/)
    .map((line) => safeImageUrl(line.trim()))
    .filter(Boolean)
    .slice(0, 8);
}

function money(value) {
  const amount = Number(value);
  return `R$ ${Number.isFinite(amount) ? amount : 0}`;
}

function productImage(product) {
  const images = product.images?.length ? product.images : [logo];
  const index = state.productImageIndexes[product.id] || 0;
  return images[index % images.length];
}

function cartCount() {
  return state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

function cartTotal() {
  return state.cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

function galleryProduct() {
  return state.products.find((product) => product.id === state.galleryProductId);
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  state.mobileMenuOpen = false;
}

function showPayment(product) {
  if (product) {
    if (!allowedProductIds().has(product.id)) return;
    const size = allowedSizes.has(state.selectedSizes[product.id]) ? state.selectedSizes[product.id] : "40";
    const image = productImage(product);
    const existingItem = state.cartItems.find((item) => item.productId === product.id && item.size === size);

    if (existingItem) {
      existingItem.quantity = Math.min(99, existingItem.quantity + 1);
      existingItem.image = image;
    } else {
      state.cartItems.push({
        key: `${product.id}-${size}`,
        productId: product.id,
        name: safeText(product.name, 60),
        price: Number(product.price) || 0,
        color: "Cor única",
        size,
        image,
        quantity: 1,
      });
    }
  }

  state.currentPage = "payment";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderHeader() {
  return `
    <header class="header ${state.mobileMenuOpen ? "menu-open" : ""}">
      <div class="header-inner">
        <div class="brand-lockup">
          <span class="logo-frame">
            <img class="logo" src="${logo}" alt="Logo Savane Suede" />
          </span>
          <span class="brand-name serif">${escapeHtml(state.brand)}</span>
        </div>
        <button class="menu-toggle" data-menu-toggle type="button" aria-label="Abrir menu" aria-expanded="${state.mobileMenuOpen ? "true" : "false"}">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav class="nav" aria-label="Navegação principal">
          <button data-scroll="top">Início</button>
          <button data-scroll="colecao">Coleção</button>
          <button data-scroll="sobre">Sobre</button>
          <button data-admin>Admin</button>
          <button data-payment>Carrinho <span class="icon-cart">${cartCount()}</span></button>
        </nav>
      </div>
    </header>
  `;
}

function renderProducts() {
  return state.products.map((product) => `
    <article class="product-card">
      <button class="product-media" data-open-gallery="${escapeHtml(product.id)}" type="button" aria-label="Ver imagens de ${escapeHtml(product.name)}">
        <img src="${displayImageUrl(productImage(product))}" alt="${escapeHtml(product.name)}" loading="lazy" referrerpolicy="no-referrer" />
        <span class="view-badge">Ver imagens</span>
      </button>
      <div class="product-body">
        <div class="product-topline">
          <button class="product-title" data-open-gallery="${escapeHtml(product.id)}" type="button">${escapeHtml(product.name)}</button>
          <span class="price">${money(product.price)}</span>
        </div>
        <p class="tag">${escapeHtml(product.tag)}</p>

        <div class="control-label">Tamanho</div>
        <div class="sizes">
          ${["38", "39", "40", "41", "42", "43"].map((size) => `
            <button class="size-button ${state.selectedSizes[product.id] === size ? "active" : ""}" data-size="${size}" data-product="${escapeHtml(product.id)}" type="button">
              ${size}
            </button>
          `).join("")}
        </div>
        <div class="buy-row">
          <button class="button secondary" data-buy="${escapeHtml(product.id)}" type="button">Comprar</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderGallery() {
  const product = galleryProduct();
  if (!product) return "";

  const images = product.images?.length ? product.images : [logo];
  const imageIndex = Math.min(images.length - 1, Math.max(0, state.galleryImageIndex));

  return `
    <div class="gallery-backdrop" role="dialog" aria-modal="true" aria-label="Galeria de ${escapeHtml(product.name)}">
      <div class="gallery-modal">
        <div class="gallery-header">
          <div>
            <h2 class="serif">${escapeHtml(product.name)}</h2>
            <p>${escapeHtml(product.tag)} · ${money(product.price)}</p>
          </div>
          <button class="gallery-close" data-close-gallery type="button" aria-label="Fechar galeria">×</button>
        </div>

        <div class="gallery-stage">
          <button class="gallery-arrow left" data-gallery-step="-1" type="button" aria-label="Imagem anterior">‹</button>
          <img src="${displayImageUrl(images[imageIndex])}" alt="${escapeHtml(product.name)} imagem ${imageIndex + 1}" referrerpolicy="no-referrer" />
          <button class="gallery-arrow right" data-gallery-step="1" type="button" aria-label="Próxima imagem">›</button>
        </div>

        <div class="gallery-thumbs">
          ${images.map((image, index) => `
            <button class="${index === imageIndex ? "active" : ""}" data-gallery-image="${index}" type="button" aria-label="Abrir imagem ${index + 1}">
              <img src="${displayImageUrl(image)}" alt="" referrerpolicy="no-referrer" />
            </button>
          `).join("")}
        </div>

        <div class="gallery-actions">
          <button class="button secondary" data-close-gallery type="button">Voltar</button>
          <button class="button" data-buy="${escapeHtml(product.id)}" type="button">Comprar este modelo</button>
        </div>
      </div>
    </div>
  `;
}

function renderHome() {
  return `
    <main class="page">
      ${renderHeader()}
      <section id="top" class="hero">
        ${heroImages.map((image, index) => `
          <div class="hero-slide ${index === state.currentImage ? "active" : ""}" style="background-image: url('${displayImageUrl(image)}')"></div>
        `).join("")}
        <div class="hero-content">
          <h1 class="serif">${escapeHtml(state.brand)}</h1>
          <p>${escapeHtml(state.headline)}</p>
          <button class="button" data-scroll="colecao">${escapeHtml(state.cta)}</button>
          <div class="dots">
            ${heroImages.map((_, index) => `
              <button class="dot ${index === state.currentImage ? "active" : ""}" data-hero="${index}" aria-label="Mostrar imagem ${index + 1}" type="button"></button>
            `).join("")}
          </div>
        </div>
      </section>

      <section id="colecao" class="section alt">
        <div class="section-inner">
          <h2 class="section-title serif">Coleção</h2>
          <div class="products">${renderProducts()}</div>
        </div>
      </section>

      <section id="sobre" class="section">
        <div class="section-inner dna-main">
          <h2 class="section-title serif">DNA da Marca</h2>
          <p class="story-copy">
            A Savane nasce da união entre estilo, conforto e autenticidade.
            Criamos calçados para quem busca presença, acabamento premium e
            qualidade no dia a dia sem perder leveza.
          </p>
        </div>
      </section>

      <section class="section banner">
        <h2 class="serif">Não apenas um tenis, um estilo de vida.</h2>
        <p>Design premium, conforto absoluto e presença marcante em cada passo.</p>
      </section>

      <footer class="footer">
        <h3 class="serif">Quem Somos</h3>
        <p>A ${escapeHtml(state.brand)} combina estética urbana com materiais de toque sofisticado para entregar calçados versáteis, confortáveis e marcantes.</p>
      </footer>
      ${renderGallery()}
    </main>
  `;
}

function renderLogin() {
  return `
    <main class="page admin-page">
      <section class="admin-shell">
        <button class="back" data-home>← Voltar à loja</button>
        <div class="admin-card login-card">
          <h1 class="section-title serif">Login Administrativo</h1>
          <p class="admin-muted">Acesse para editar marca, textos, produtos, preços e imagens do catálogo.</p>
          <form class="admin-login-form">
            <input name="password" type="password" placeholder="Senha do administrador" autocomplete="current-password" maxlength="40" required />
            <button class="button full" type="submit">Entrar</button>
            ${state.adminError ? `<p class="admin-error">${escapeHtml(state.adminError)}</p>` : ""}
            <p class="secure">Senha local de demonstração: savane2026. Para loja real, use login com servidor.</p>
          </form>
        </div>
      </section>
    </main>
  `;
}

function renderAdmin() {
  return `
    <main class="page admin-page">
      <section class="admin-shell">
        <div class="admin-topbar">
          <button class="back" data-home>← Voltar à loja</button>
          <button class="button secondary" data-admin-logout type="button">Sair</button>
        </div>

        <h1 class="section-title serif">Catálogo da Marca</h1>
        <p class="admin-muted">Edite os campos e salve. As alterações ficam guardadas neste navegador.</p>

        <div class="admin-grid">
          <section class="admin-card">
            <h2 class="serif">Marca</h2>
            <label>Nome da marca<input data-admin-setting="brand" value="${escapeHtml(state.brand)}" maxlength="${editorLimits.brand}" /></label>
            <label>Frase principal<input data-admin-setting="headline" value="${escapeHtml(state.headline)}" maxlength="${editorLimits.headline}" /></label>
            <label>Texto do botão<input data-admin-setting="cta" value="${escapeHtml(state.cta)}" maxlength="${editorLimits.cta}" /></label>
            <button class="button" data-save-settings type="button">Salvar marca</button>
          </section>

          <section class="admin-card">
            <h2 class="serif">Novo produto</h2>
            <button class="button" data-add-product type="button">Adicionar produto</button>
            <p class="secure">Depois de adicionar, edite nome, preço, descrição e imagens abaixo.</p>
          </section>
        </div>

        <div class="admin-products">
          ${state.products.map((product) => renderAdminProduct(product)).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderAdminProduct(product) {
  return `
    <article class="admin-card admin-product" data-admin-product="${escapeHtml(product.id)}">
      <div class="admin-product-preview">
        <img src="${displayImageUrl(productImage(product))}" alt="${escapeHtml(product.name)}" referrerpolicy="no-referrer" />
      </div>
      <div class="admin-product-fields">
        <label>Nome<input data-product-field="name" value="${escapeHtml(product.name)}" maxlength="60" /></label>
        <label>Descrição<input data-product-field="tag" value="${escapeHtml(product.tag)}" maxlength="120" /></label>
        <label>Preço<input data-product-field="price" value="${escapeHtml(product.price)}" inputmode="numeric" maxlength="6" /></label>
        <label>Imagens, uma URL por linha<textarea data-product-field="images" rows="4">${escapeHtml((product.images || []).join("\n"))}</textarea></label>
        <div class="admin-actions">
          <button class="button" data-save-product="${escapeHtml(product.id)}" type="button">Salvar produto</button>
          <button class="button danger" data-delete-product="${escapeHtml(product.id)}" type="button">Apagar</button>
        </div>
      </div>
    </article>
  `;
}

function renderPayment() {
  const safeCartCount = cartCount();
  const total = cartTotal();
  const hasItems = state.cartItems.length > 0;

  return `
    <main class="page payment">
      <div class="payment-inner">
        <button class="back" data-home>← Voltar à loja</button>
        <h1 class="section-title serif">Seu Carrinho</h1>
        <div class="checkout-grid">
          <section class="checkout-panel">
            <h2 class="serif">Detalhes do Pedido</h2>
            <div class="line">
              <span>Itens no carrinho</span>
              <strong>${safeCartCount}</strong>
            </div>
            ${hasItems ? renderCartItems() : renderEmptyCart()}

            <div class="line">
              <span>Subtotal</span>
              <strong>${money(total)}</strong>
            </div>
            <div class="line">
              <span>Frete</span>
              <strong>Grátis</strong>
            </div>
            <div class="line total">
              <span>Total</span>
              <strong>${money(total)}</strong>
            </div>
          </section>

          <section class="checkout-panel">
            <h2 class="serif">Finalizar Compra</h2>
            <form class="form">
              <input placeholder="Nome completo" autocomplete="name" maxlength="80" required />
              <input placeholder="Email" type="email" autocomplete="email" maxlength="120" required />
              <input placeholder="Telefone" autocomplete="tel" maxlength="20" inputmode="tel" required />
              <input placeholder="Endereço de entrega" autocomplete="street-address" maxlength="140" required />
              <input class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true" />
              <div class="two-cols">
                <input placeholder="Cidade" autocomplete="address-level2" maxlength="80" required />
                <input placeholder="CEP" autocomplete="postal-code" maxlength="12" required />
              </div>
              <select>
                <option>Cartão de Crédito</option>
                <option>PIX</option>
                <option>Boleto</option>
              </select>
              <button class="button full" type="submit" ${hasItems ? "" : "disabled"}>Pagar agora</button>
              <p class="secure">Protótipo visual. O botão não envia dados nem processa pagamento.</p>
            </form>
          </section>
        </div>
      </div>
    </main>
  `;
}

function renderCartItems() {
  return `
    <div class="cart-list">
      ${state.cartItems.map((item) => `
        <article class="cart-item">
          <img src="${displayImageUrl(item.image)}" alt="${escapeHtml(item.name)}" referrerpolicy="no-referrer" />
          <div class="cart-item-main">
            <div class="cart-item-top">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${money(item.price * item.quantity)}</span>
            </div>
            <div class="cart-item-meta">
              <span>Tamanho ${escapeHtml(item.size)}</span>
              <span>${escapeHtml(item.color)}</span>
              <span>${money(item.price)} un.</span>
            </div>
            <div class="quantity" aria-label="Quantidade de ${escapeHtml(item.name)}">
              <button data-cart-qty="${escapeHtml(item.key)}" data-qty="-1" type="button">−</button>
              <span>${item.quantity}</span>
              <button data-cart-qty="${escapeHtml(item.key)}" data-qty="1" type="button">+</button>
              <button class="remove-item" data-remove-cart="${escapeHtml(item.key)}" type="button">Remover</button>
            </div>
          </div>
        </article>
      `).join("")}
    </div>

    <div class="cart-spec">
      <h3 class="serif">O que tem no carrinho</h3>
      <dl>
        <div>
          <dt>Modelos diferentes</dt>
          <dd>${state.cartItems.length}</dd>
        </div>
        <div>
          <dt>Total de pares</dt>
          <dd>${cartCount()}</dd>
        </div>
        <div>
          <dt>Entrega</dt>
          <dd>Frete grátis</dd>
        </div>
      </dl>
      <p>Confira modelo, tamanho e quantidade antes de finalizar. O pedido fica em modo demonstrativo até conectar um pagamento real.</p>
    </div>
  `;
}

function renderEmptyCart() {
  return `
    <div class="empty-cart">
      <h3 class="serif">Seu carrinho está vazio</h3>
      <p>Você ainda não adicionou nenhum tênis. Volte para a coleção e escolha um modelo.</p>
      <button class="button secondary" data-home type="button">Ver coleção</button>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => scrollToSection(button.dataset.scroll));
  });

  document.querySelectorAll("[data-hero]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentImage = Number(button.dataset.hero);
      render();
    });
  });

  document.querySelectorAll("[data-menu-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
      render();
    });
  });

  document.querySelectorAll("[data-size]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!allowedProductIds().has(button.dataset.product) || !allowedSizes.has(button.dataset.size)) return;
      state.selectedSizes[button.dataset.product] = button.dataset.size;
      render();
    });
  });

  document.querySelectorAll("[data-admin]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentPage = state.adminLoggedIn ? "admin" : "login";
      state.adminError = "";
      state.mobileMenuOpen = false;
      render();
    });
  });

  document.querySelectorAll("[data-buy]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = state.products.find((item) => item.id === button.dataset.buy);
      state.galleryProductId = null;
      showPayment(product);
    });
  });

  document.querySelectorAll("[data-open-gallery]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!allowedProductIds().has(button.dataset.openGallery)) return;
      state.galleryProductId = button.dataset.openGallery;
      state.galleryImageIndex = state.productImageIndexes[button.dataset.openGallery] || 0;
      render();
    });
  });

  document.querySelectorAll("[data-close-gallery]").forEach((button) => {
    button.addEventListener("click", () => {
      state.galleryProductId = null;
      state.galleryImageIndex = 0;
      render();
    });
  });

  document.querySelectorAll("[data-gallery-image]").forEach((button) => {
    button.addEventListener("click", () => {
      state.galleryImageIndex = Number(button.dataset.galleryImage) || 0;
      render();
    });
  });

  document.querySelectorAll("[data-gallery-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = galleryProduct();
      const images = product?.images?.length ? product.images : [logo];
      state.galleryImageIndex = (state.galleryImageIndex + Number(button.dataset.galleryStep) + images.length) % images.length;
      render();
    });
  });

  document.querySelectorAll("[data-payment]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mobileMenuOpen = false;
      showPayment();
    });
  });

  document.querySelectorAll("[data-home]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentPage = "home";
      render();
    });
  });

  document.querySelectorAll(".admin-login-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const password = form.elements.password.value;
      if (password === adminPassword) {
        try {
          sessionStorage.setItem(adminSessionKey, "true");
        } catch {
          // O painel ainda abre nesta sessão mesmo sem armazenamento.
        }
        state.adminLoggedIn = true;
        state.adminError = "";
        state.currentPage = "admin";
      } else {
        state.adminError = "Senha incorreta.";
      }
      render();
    });
  });

  document.querySelectorAll("[data-admin-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      try {
        sessionStorage.removeItem(adminSessionKey);
      } catch {
        // Nada a limpar quando o navegador bloqueia armazenamento.
      }
      state.adminLoggedIn = false;
      state.currentPage = "home";
      render();
    });
  });

  document.querySelectorAll("[data-save-settings]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-admin-setting]").forEach((input) => {
        if (!Object.prototype.hasOwnProperty.call(editorLimits, input.dataset.adminSetting)) return;
        state[input.dataset.adminSetting] = safeText(input.value, editorLimits[input.dataset.adminSetting]);
      });
      saveSettings();
      render();
    });
  });

  document.querySelectorAll("[data-add-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = createProductId();
      state.products.push({
        id,
        name: "Novo Produto",
        tag: "Descrição do produto.",
        price: 499,
        images: [massaiImages[0]],
      });
      state.selectedSizes[id] = "40";
      state.productImageIndexes[id] = 0;
      saveCatalog();
      render();
    });
  });

  document.querySelectorAll("[data-save-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-admin-product]");
      const product = state.products.find((item) => item.id === button.dataset.saveProduct);
      if (!card || !product) return;

      const nameInput = card.querySelector('[data-product-field="name"]');
      const tagInput = card.querySelector('[data-product-field="tag"]');
      const priceInput = card.querySelector('[data-product-field="price"]');
      const imagesInput = card.querySelector('[data-product-field="images"]');
      const nextImages = normalizeImages(imagesInput.value);
      product.name = safeText(nameInput.value, 60) || "Produto";
      product.tag = safeText(tagInput.value, 120) || "Descrição do produto.";
      product.price = Math.min(999999, Math.max(0, Number(priceInput.value.replace(/\D/g, "")) || 0));
      product.images = nextImages.length ? nextImages : [massaiImages[0]];
      state.productImageIndexes[product.id] = 0;
      saveCatalog();
      render();
    });
  });

  document.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.products.length <= 1) return;
      const product = state.products.find((item) => item.id === button.dataset.deleteProduct);
      if (!window.confirm(`Apagar ${product?.name || "este produto"} do catálogo?`)) return;
      state.products = state.products.filter((product) => product.id !== button.dataset.deleteProduct);
      state.cartItems = state.cartItems.filter((item) => item.productId !== button.dataset.deleteProduct);
      delete state.selectedSizes[button.dataset.deleteProduct];
      delete state.productImageIndexes[button.dataset.deleteProduct];
      saveCatalog();
      render();
    });
  });

  document.querySelectorAll("[data-cart-qty]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.cartItems.find((cartItem) => cartItem.key === button.dataset.cartQty);
      if (!item) return;
      item.quantity = Math.min(99, Math.max(0, item.quantity + Number(button.dataset.qty)));
      state.cartItems = state.cartItems.filter((cartItem) => cartItem.quantity > 0);
      render();
    });
  });

  document.querySelectorAll("[data-remove-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      state.cartItems = state.cartItems.filter((item) => item.key !== button.dataset.removeCart);
      render();
    });
  });

  document.querySelectorAll(".form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const honeypot = form.querySelector(".hp-field");
      if (honeypot?.value) return;
      form.querySelector(".secure").textContent = "Pedido protegido em modo demonstracao. Nenhum dado foi enviado.";
    });
  });

  syncHeader();
}

function syncHeader() {
  const header = document.querySelector(".header");
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 40);
}

function render() {
  const pages = {
    home: renderHome,
    payment: renderPayment,
    login: renderLogin,
    admin: () => (state.adminLoggedIn ? renderAdmin() : renderLogin()),
  };

  root.innerHTML = (pages[state.currentPage] || pages.home)();
  bindEvents();
  makeHeaderLogoTransparent();
}

function makeHeaderLogoTransparent() {
  const logoImage = document.querySelector(".logo");
  if (!logoImage || logoImage.dataset.processed === "true") return;

  const source = logoImage.currentSrc || logoImage.src;
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    try {
      const size = 160;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = size;
      canvas.height = size;
      context.drawImage(image, 0, 0, size, size);

      const pixels = context.getImageData(0, 0, size, size);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const red = pixels.data[i];
        const green = pixels.data[i + 1];
        const blue = pixels.data[i + 2];
        if (red > 225 && green > 225 && blue > 225) {
          pixels.data[i + 3] = 0;
        }
      }

      context.putImageData(pixels, 0, 0);
      logoImage.src = canvas.toDataURL("image/png");
      logoImage.dataset.processed = "true";
    } catch {
      logoImage.classList.add("logo-clean-fallback");
    }
  };
  image.onerror = () => logoImage.classList.add("logo-clean-fallback");
  image.src = source;
}

window.addEventListener("scroll", syncHeader);

setInterval(() => {
  if (state.currentPage !== "home" || heroImages.length <= 1) return;
  state.currentImage = (state.currentImage + 1) % heroImages.length;
  render();
}, 4200);

setInterval(() => {
  if (state.currentPage !== "home" || state.galleryProductId) return;
  state.products.forEach((product) => {
    const images = product.images?.length ? product.images : [logo];
    state.productImageIndexes[product.id] = ((state.productImageIndexes[product.id] || 0) + 1) % images.length;
  });
  render();
}, 3200);

render();
