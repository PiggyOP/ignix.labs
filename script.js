// Add Stripe Payment Links here. Never put Stripe secret keys in this public website.
function injectCheckoutStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .pricing-callout {
      display: grid;
      gap: 8px;
      margin: -6px 0 24px;
      padding: 22px 24px;
      border: 1px solid rgba(178, 140, 255, 0.55);
      border-radius: 8px;
      background: linear-gradient(90deg, rgba(140, 87, 255, 0.28), rgba(255, 255, 255, 0.08)), #111118;
      box-shadow: 0 18px 58px rgba(140, 87, 255, 0.18);
    }
    .pricing-callout strong {
      color: var(--text);
      font-size: clamp(22px, 3vw, 34px);
      line-height: 1.08;
      font-weight: 900;
    }
    .pricing-callout span,
    .pricing-footnote {
      color: var(--muted);
      line-height: 1.55;
    }
    .pricing-footnote {
      margin: 18px 0 0;
      font-size: 13px;
    }
    .package-card.selected {
      border-color: var(--green);
      box-shadow: 0 24px 70px rgba(84, 230, 168, 0.14);
    }
    .cart-line-badge {
      display: inline-flex;
      margin-bottom: 8px;
      color: var(--green);
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .cart-summary {
      display: grid;
      gap: 10px;
      margin-top: auto;
      padding-top: 18px;
    }
    .cart-summary div {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      color: var(--muted);
      font-size: 14px;
    }
    .cart-summary strong {
      color: var(--text);
    }
    .cart-total {
      margin-top: 0;
      padding: 18px 0 22px;
    }
    .checkout-selected {
      display: grid;
      gap: 6px;
      padding: 16px;
      border: 1px solid rgba(178, 140, 255, 0.34);
      border-radius: 8px;
      background: rgba(140, 87, 255, 0.1);
    }
    .checkout-selected span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .checkout-selected strong {
      color: var(--text);
      font-size: 18px;
    }
    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      color: var(--muted);
      font-weight: 700;
      line-height: 1.45;
    }
    .checkbox-label input {
      width: 18px;
      min-height: 18px;
      margin-top: 2px;
      accent-color: var(--violet);
    }
  `;
  document.head.append(style);
}

const packages = [
  {
    id: "starter",
    name: "Basic Site",
    badge: "Basic",
    price: 749,
    stripePaymentLink: "https://buy.stripe.com/test_28E8wR3Wf67afMV1yzcbC00",
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
    price: 1499,
    stripePaymentLink: "https://buy.stripe.com/test_aFa9AV9gz0MQeIR6STcbC01",
    summary: "A polished online store with product pages, checkout flow, and conversion-focused sections.",
    features: [
      "Up to 20 products loaded",
      "Cart and checkout setup",
      "Product, collection, and policy pages",
      "Email capture and analytics setup",
      "Speed and mobile QA",
      "Payment integration",
      "SEO Optimization"
    ],
    highlight: true
  },
  {
    id: "signature",
    name: "Signature Platform",
    badge: "Premium",
    price: 2249,
    stripePaymentLink: "https://buy.stripe.com/test_dRm6oJ50jgLOcAJ2CDcbC02",
    summary: "A custom website system for brands that need deeper content, integrations, and scale.",
    features: [
      "Custom page system",
      "Advanced animations and interactions",
      "Booking, CRM, or payment integrations",
      "Content architecture and copy polish",
      "30 days of post-launch support",
      "Clean website design",
      "24/7 Customer support"
    ]
  }
];

const seasonalSales = {
  winter: {
    title: "Winter Website Sale",
    season: "Winter pricing",
    eyebrow: "Winter launch offer",
    discount: 20,
    message: "Book your website build this winter and save on every Ignix Labs package."
  },
  spring: {
    title: "Spring Website Refresh",
    season: "Spring pricing",
    eyebrow: "Spring growth offer",
    discount: 20,
    message: "Freshen up your brand for the season with discounted website packages."
  },
  summer: {
    title: "Summer Website Sale",
    season: "Summer pricing",
    eyebrow: "Summer build offer",
    discount: 20,
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

const cartStorageKey = "ignixLabsSelectedPackage";
let selectedPackageId = window.localStorage.getItem(cartStorageKey) || "";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const packageGrid = document.querySelector("[data-package-grid]");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartSubtotal = document.querySelector("[data-cart-subtotal]");
const cartSavings = document.querySelector("[data-cart-savings]");
const cartTotal = document.querySelector("[data-cart-total]");
const checkoutModal = document.querySelector("[data-checkout-modal]");
const checkoutSelected = document.querySelector("[data-checkout-selected]");
const checkoutNote = document.querySelector("[data-checkout-note]");
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

function getSelectedPackage() {
  return packages.find((entry) => entry.id === selectedPackageId) || null;
}

function getCheckoutUrl(item, formData) {
  const business = String(formData.get("business") || "ignix-client")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const params = new URLSearchParams({
    client_reference_id: `${item.id}-${business || "client"}-${Date.now()}`
  });

  const email = formData.get("email");
  if (email) params.set("prefilled_email", email);

  if (!item.stripePaymentLink) return "";
  const separator = item.stripePaymentLink.includes("?") ? "&" : "?";
  return `${item.stripePaymentLink}${separator}${params.toString()}`;
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
    .map((item) => {
      const salePrice = getDiscountedPrice(item.price);
      const isSelected = selectedPackageId === item.id;

      return `
        <article class="package-card ${item.highlight ? "highlight" : ""} ${isSelected ? "selected" : ""}">
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
            ${isSelected ? "Selected Deal" : "Add Discounted Deal"}
          </button>
        </article>
      `;
    })
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
  const selectedPackage = getSelectedPackage();
  if (!selectedPackage) {
    openCart();
    return;
  }

  checkoutSelected.innerHTML = `
    <span>Selected package</span>
    <strong>${selectedPackage.name} - ${currency.format(getDiscountedPrice(selectedPackage.price))}</strong>
  `;
  checkoutNote.textContent = selectedPackage.stripePaymentLink
    ? "You will be redirected to Stripe to complete the payment."
    : "Stripe Payment Link not added yet. Add your Stripe test/live link in script.js for this package.";

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

  selectedPackageId = id;
  window.localStorage.setItem(cartStorageKey, id);
  renderPackages();
  renderCart();
  openCart();
}

function removePackage(id) {
  if (selectedPackageId !== id) return;

  selectedPackageId = "";
  window.localStorage.removeItem(cartStorageKey);
  renderPackages();
  renderCart();
}

function renderCart() {
  const selectedPackage = getSelectedPackage();
  const subtotal = selectedPackage ? selectedPackage.price : 0;
  const total = selectedPackage ? getDiscountedPrice(selectedPackage.price) : 0;
  const savings = subtotal - total;

  cartCount.textContent = selectedPackage ? "1" : "0";
  cartSubtotal.textContent = currency.format(subtotal);
  cartSavings.textContent = `-${currency.format(savings)}`;
  cartTotal.textContent = currency.format(total);

  if (!selectedPackage) {
    cartItems.innerHTML = `<p class="cart-empty">No website deal selected yet.</p>`;
    return;
  }

  cartItems.innerHTML = `
    <article class="cart-line">
      <div>
        <span class="cart-line-badge">${activeSale.season}</span>
        <h3>${selectedPackage.name}</h3>
        <p>
          ${currency.format(total)}
          <span>${currency.format(subtotal)}</span>
        </p>
      </div>
      <button class="remove-button" type="button" data-remove-package="${selectedPackage.id}">Remove</button>
    </article>
  `;
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
    const selectedPackage = getSelectedPackage();

    if (!selectedPackage) {
      checkoutNote.textContent = "Select a website package before checkout.";
      return;
    }

    const checkoutUrl = getCheckoutUrl(selectedPackage, new FormData(event.currentTarget));

    if (!checkoutUrl) {
      checkoutNote.textContent =
        "Stripe Payment Link not added yet. Create a Stripe Payment Link for this package and paste it into script.js.";
      return;
    }

    window.location.href = checkoutUrl;
  });
}

function startSaleTimer() {
  window.setTimeout(openSalePopup, 5000);
}

injectCheckoutStyles();
renderPackages();
renderSalePopup();
renderCart();
setupEvents();
startSaleTimer();
