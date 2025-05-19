document.addEventListener("DOMContentLoaded", () => {
  let cart = [];

  // DOM Elements
  const cartIcon = document.getElementById("cart-icon");
  const cartPanel = document.getElementById("cart-panel");
  const cartCountEl = document.getElementById("cart-count");
  const cartPriceEl = document.getElementById("cart-price");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalPriceEl = document.getElementById("cart-total-price");
  const checkoutBtn = document.getElementById("checkout-btn");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const searchInput = document.getElementById("search-input");
  const productCards = document.querySelectorAll(".product-card");
  const voiceBtn = document.getElementById("voice-btn");

  // Restore cart from localStorage
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }

  // Show/hide cart panel
  cartIcon.addEventListener("click", () => {
    cartPanel.classList.toggle("hidden");
  });

  closeCartBtn.addEventListener("click", () => {
    cartPanel.classList.add("hidden");
  });

  // Add to cart with animation
  document.querySelectorAll(".footer button").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const name = card.querySelector("h2").innerText;
      const price = parseFloat(card.getAttribute("data-price"));
      const productImg = card.querySelector("img");
      const cartIconRect = cartIcon.getBoundingClientRect();
      const imgRect = productImg.getBoundingClientRect();

      // Fly image animation
      const flyingImg = productImg.cloneNode(true);
      flyingImg.classList.add("flying-image");
      document.body.appendChild(flyingImg);
      flyingImg.style.left = imgRect.left + "px";
      flyingImg.style.top = imgRect.top + "px";

      const flyX = cartIconRect.left + cartIconRect.width / 2 - imgRect.left - imgRect.width / 2;
      const flyY = cartIconRect.top + cartIconRect.height / 2 - imgRect.top - imgRect.height / 2;

      flyingImg.style.setProperty("--fly-x", `${flyX}px`);
      flyingImg.style.setProperty("--fly-y", `${flyY}px`);
      flyingImg.addEventListener("animationend", () => flyingImg.remove());

      const existingProduct = cart.find(item => item.name === name);
      if (existingProduct) {
        existingProduct.qty++;
      } else {
        cart.push({ name, price, qty: 1 });
      }

      updateCartUI();
    });
  });

  // Update cart display
  function updateCartUI() {
    const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    cartCountEl.textContent = totalCount;
    cartPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
    if (cartTotalPriceEl) {
      cartTotalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
    }
    checkoutBtn.disabled = totalCount === 0;

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    cartItemsEl.innerHTML = "";
    cart.forEach(({ name, price, qty }, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span>${name} - $${(price * qty).toFixed(2)}</span>
          <div>
            <button class="qty-btn" data-index="${index}" data-action="decrease">−</button>
            <span>${qty}</span>
            <button class="qty-btn" data-index="${index}" data-action="increase">+</button>
            <button class="delete-btn" data-index="${index}">🗑️</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(li);
    });

    // Quantity change
    cartItemsEl.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        const action = btn.getAttribute("data-action");
        if (action === "increase") {
          cart[idx].qty++;
        } else if (action === "decrease") {
          cart[idx].qty--;
          if (cart[idx].qty === 0) {
            cart.splice(idx, 1);
          }
        }
        updateCartUI();
      });
    });

    // Delete button
    cartItemsEl.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        cart.splice(idx, 1);
        updateCartUI();
      });
    });
  }

  // Checkout
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    alert(`Thank you for your purchase!\nTotal: ${cartPriceEl.textContent}`);
    cart = [];
    localStorage.removeItem("cart");
    updateCartUI();
    cartPanel.classList.add("hidden");
  });

  // Search input
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    productCards.forEach(card => {
      const productName = card.querySelector("h2").textContent.toLowerCase();
      card.style.display = productName.includes(query) ? "" : "none";
    });
  });

  // Voice Search
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceBtn.addEventListener("click", () => {
      recognition.start();
      voiceBtn.textContent = "🎙️ Listening...";
    });

    recognition.addEventListener("result", event => {
      const transcript = event.results[0][0].transcript;
      searchInput.value = transcript;
      searchInput.dispatchEvent(new Event("input"));
    });

    recognition.addEventListener("end", () => {
      voiceBtn.textContent = "🎤";
    });

    recognition.addEventListener("error", (e) => {
      alert("Voice recognition error: " + e.error);
      voiceBtn.textContent = "🎤";
    });
  } else {
    voiceBtn.disabled = true;
    voiceBtn.textContent = "🚫";
    voiceBtn.title = "Voice search not supported";
  }

  updateCartUI(); // initialize cart display
});
