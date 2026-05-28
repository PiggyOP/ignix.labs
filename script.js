const packages = [
  {
    id: "starter",
    name: "Launch Site",
    badge: "Starter",
    price: 129,
    summary: "A sharp business website for service brands that need a strong first impression.",
    features: [
      "Mobile responsive design",
      "Contact form and lead capture",
      "Basic SEO structure",
      "Launch support"
    ]
  },
  {
    id: "commerce",
    name: "Commerce Build",
    badge: "Most popular",
    price: 299,
    summary: "A polished online store with product pages, checkout flow, and conversion-focused sections.",
    features: [
      "Up to 20 products loaded",
      "Cart and checkout setup",
      "Product, collection, and policy pages",
      "Email capture and analytics setup",
      "Speed and mobile QA"
      "Payment intergration",
      "SEO Optimization",
    ],
    highlight: true
  },
  {
    id: "signature",
    name: "Signature Platform",
    badge: "Premium",
    price: 599,
    summary: "A custom website system for brands that need deeper content, integrations, and scale.",
    features: [
      "Custom page system",
      "Advanced animations and interactions",
      "Booking, CRM, or payment integrations",
      "Content architecture and copy polish",
      "30 days of post-launch support"
    ]
  }
];

const seasonalSales = {
  winter: {
    title: "Winter Website Sale",
    season: "Winter pricing",
    eyebrow: "Winter launch offer",
    discount: 18,
    message: "Book your website build this winter and save on every Ignix Labs package."
  },
  spring: {
    title: "Spring Website Refresh",
    season: "Spring pricing",
    eyebrow: "Spring growth offer",
    discount: 15,
    message: "Freshen up your brand for the season with discounted website packages."
  },
  summer: {
    title: "Summer Website Sale",
    season: "Summer pricing",
    eyebrow: "Summer build offer",
    discount: 25,
    message: "Summer discounts are live. Every website package is marked down for a limited time."
  },
  fall: {
    title: "Fall Launch Sale",
    season: "Fall pricing",
    eyebrow: "Fall launch offer",
    discount: 20,
    message: "Launch before the year-end rush with discounted Ignix Labs website packages."
  }
};

const cart = new Map();

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const packageGrid = document.querySelector("[data-package-grid]");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");
const checkoutModal = document.querySelector("[data-checkout-modal]");
const saleModal = document.querySelector("[data-sale-modal]");
const activeSale = getSeasonalSale();

function getSeasonalSale(date = new Date()) {
  const month = date.getMonth();

  if (month === 11 || month <= 1) return seasonalSales.winter;
  if (month >= 2 && month <= 3) return seasonalSales.spring;
  if (month >= 4 && month <= 7) return seasonalSales.summer;
  return seasonalSales.fall;
}

function getDiscountedPrice(price) {
  return Math.round(price * (1 - activeSale.discount / 100));
}

function syncBodyLock() {
  const hasOpenOverlay =
    cartDrawer.classList.contains("open") ||
    checkoutModal.classList.contains("open") ||
    saleModal.classList.contains("open");

  document.body.classList.toggle("locked", hasOpenOverlay);
}

function renderPackages() {
  packageGrid.innerHTML = packages
    .map(
      (item) => {
        const salePrice = getDiscountedPrice(item.price);

        return `
        <article class="package-card ${item.highlight ? "highlight" : ""}">
          <span class="package-badge">${item.badge}</span>
          <h3>${item.name}</h3>
          <p>${item.summary}</p>
          <div class="sale-pricing">
            <div class="price">${currency.format(salePrice)}</div>
            <div class="original-price">${currency.format(item.price)}</div>
          </div>
          <p class="sale-note">${activeSale.discount}% seasonal discount applied</p>
          <ul>
            ${item.features.map((feature) => `<li>${feature}</li>`).join("")}
          </ul>
          <button class="button ${item.highlight ? "primary" : "secondary"}" type="button" data-add-package="${item.id}">
            Add Discounted Deal
          </button>
        </article>
      `;
      }
    )
    .join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  syncBodyLock();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  syncBodyLock();
}

function openCheckout() {
  if (cart.size === 0) {
    openCart();
    return;
  }
  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden", "false");
  syncBodyLock();
}

function closeCheckout() {
  checkoutModal.classList.remove("open");
  checkoutModal.setAttribute("aria-hidden", "true");
  syncBodyLock();
}

function openSalePopup() {
  saleModal.classList.add("open");
  saleModal.setAttribute("aria-hidden", "false");
  syncBodyLock();
}

function closeSalePopup() {
  saleModal.classList.remove("open");
  saleModal.setAttribute("aria-hidden", "true");
  syncBodyLock();
}

function renderSalePopup() {
  document.querySelector("[data-sale-eyebrow]").textContent = activeSale.eyebrow;
  document.querySelector("[data-sale-title]").textContent = activeSale.title;
  document.querySelector("[data-sale-message]").textContent = activeSale.message;
  document.querySelector("[data-sale-discount]").textContent = `${activeSale.discount}% off`;
  document.querySelector("[data-sale-season]").textContent = activeSale.season;
}

function addPackage(id) {
  const item = packages.find((entry) => entry.id === id);
  if (!item) return;
  cart.set(id, item);
  renderCart();
  openCart();
}

function removePackage(id) {
  cart.delete(id);
  renderCart();
}

function renderCart() {
  const items = Array.from(cart.values());
  const total = items.reduce((sum, item) => sum + getDiscountedPrice(item.price), 0);

  cartCount.textContent = String(items.length);
  cartTotal.textContent = currency.format(total);

  if (items.length === 0) {
    cartItems.innerHTML = `<p class="cart-empty">No website deal selected yet.</p>`;
    return;
  }

  cartItems.innerHTML = items
    .map(
      (item) => `
        <article class="cart-line">
          <div>
            <h3>${item.name}</h3>
            <p>
              ${currency.format(getDiscountedPrice(item.price))}
              <span>${currency.format(item.price)}</span>
            </p>
          </div>
          <button class="remove-button" type="button" data-remove-package="${item.id}">Remove</button>
        </article>
      `
    )
    .join("");
}

function setupEvents() {
  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-package]");
    const removeButton = event.target.closest("[data-remove-package]");

    if (addButton) {
      addPackage(addButton.dataset.addPackage);
    }

    if (removeButton) {
      removePackage(removeButton.dataset.removePackage);
    }
  });

  document.querySelector("[data-open-cart]").addEventListener("click", openCart);
  document.querySelector("[data-close-cart]").addEventListener("click", closeCart);
  document.querySelector("[data-checkout]").addEventListener("click", openCheckout);
  document.querySelector("[data-close-checkout]").addEventListener("click", closeCheckout);
  document.querySelector("[data-close-sale]").addEventListener("click", closeSalePopup);
  document.querySelector("[data-shop-season-sale]").addEventListener("click", () => {
    closeSalePopup();
    document.querySelector("#packages").scrollIntoView({ behavior: "smooth" });
  });

  cartDrawer.addEventListener("click", (event) => {
    if (event.target === cartDrawer) closeCart();
  });

  checkoutModal.addEventListener("click", (event) => {
    if (event.target === checkoutModal) closeCheckout();
  });

  saleModal.addEventListener("click", (event) => {
    if (event.target === saleModal) closeSalePopup();
  });

  document.querySelector("[data-contact-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    document.querySelector("[data-form-note]").textContent =
      "Draft inquiry saved for testing. This can be connected to your real inbox later.";
  });

  document.querySelector("[data-checkout-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    cart.clear();
    renderCart();
    document.querySelector("[data-checkout-note]").textContent =
      "Test order placed. No payment was processed.";
  });
}

function startSaleTimer() {
  window.setTimeout(openSalePopup, 5000);
}

renderPackages();
renderSalePopup();
renderCart();
setupEvents();
startSaleTimer();
