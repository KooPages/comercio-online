// script.js
(function antiCopy(){
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) || (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });
    document.addEventListener('selectstart', function(e) { e.preventDefault(); });
    document.addEventListener('copy', function(e) { e.preventDefault(); alert('❌ Contenido protegido'); return false; });
})();

let cart = [];

function saveCart() { localStorage.setItem("gestores_cart_pro", JSON.stringify(cart)); }
function loadCart() {
    const stored = localStorage.getItem("gestores_cart_pro");
    if (stored) { try { cart = JSON.parse(stored); if (!Array.isArray(cart)) cart = []; } catch(e) { cart = []; } }
    else cart = [];
    renderCart(); updateGlobalCount();
}
function updateGlobalCount() { const total = cart.reduce((s,i) => s + i.quantity, 0); document.getElementById("cartGlobalCount").innerText = total; }
function getCartTotal() { return cart.reduce((s,i) => s + (i.price * i.quantity), 0); }
function addToCart(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ id: prod.id, name: prod.name, price: prod.price, image: prod.image, quantity: 1 });
    saveCart(); renderCart(); updateGlobalCount(); showToast(`✓ ${prod.name.substring(0,30)} agregado`);
}
function updateQuantity(itemId, delta) {
    const idx = cart.findIndex(i => i.id === itemId);
    if (idx === -1) return;
    const newQty = cart[idx].quantity + delta;
    if (newQty <= 0) cart.splice(idx,1);
    else cart[idx].quantity = newQty;
    saveCart(); renderCart(); updateGlobalCount();
}
function removeItem(itemId) { cart = cart.filter(i => i.id !== itemId); saveCart(); renderCart(); updateGlobalCount(); showToast("Producto eliminado"); }
function clearCart() { if(cart.length===0) return; cart = []; saveCart(); renderCart(); updateGlobalCount(); showToast("Carrito vaciado"); }
function renderCart() {
    const container = document.getElementById("cartItemsList");
    const totalSpan = document.getElementById("cartTotalPrice");
    if (!container) return;
    if (cart.length === 0) { container.innerHTML = `<div class="empty-cart-msg">🛒 Tu carrito está vacío</div>`; totalSpan.innerText = "$0.00"; return; }
    let html = "";
    cart.forEach(item => {
        html += `<div class="cart-item"><img class="cart-item-img" src="${item.image}" alt="${item.name}"><div class="cart-item-details"><div class="cart-item-name">${item.name.substring(0,45)}</div><div class="cart-item-price">$${item.price} USD</div><div class="cart-qty-control"><button class="qty-btn decQty" data-id="${item.id}">−</button><span class="cart-item-qty">${item.quantity}</span><button class="qty-btn incQty" data-id="${item.id}">+</button><button class="remove-item-btn" data-id="${item.id}"><i class="fas fa-trash-can"></i></button></div></div></div>`;
    });
    container.innerHTML = html;
    totalSpan.innerText = `$${getCartTotal().toFixed(2)} USD`;
    document.querySelectorAll(".decQty").forEach(btn => btn.addEventListener("click", (e) => { updateQuantity(btn.dataset.id, -1); }));
    document.querySelectorAll(".incQty").forEach(btn => btn.addEventListener("click", (e) => { updateQuantity(btn.dataset.id, 1); }));
    document.querySelectorAll(".remove-item-btn").forEach(btn => btn.addEventListener("click", (e) => { removeItem(btn.dataset.id); }));
}
function showToast(msg) {
    let t = document.createElement("div");
    t.innerText = msg; t.style.position = "fixed"; t.style.bottom = "20px"; t.style.left = "50%"; t.style.transform = "translateX(-50%)";
    t.style.backgroundColor = "#1e2f3f"; t.style.color = "#fff"; t.style.padding = "8px 20px"; t.style.borderRadius = "40px";
    t.style.fontSize = "0.8rem"; t.style.zIndex = "1200"; t.style.fontWeight = "500"; t.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    document.body.appendChild(t); setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 1800);
}
function renderProducts() {
    const grid = document.getElementById("productsGrid"); if (!grid) return;
    grid.innerHTML = "";
    PRODUCTS.forEach(prod => {
        const card = document.createElement("div"); card.className = "product-card";
        card.innerHTML = `<img class="product-img" src="${prod.image}" alt="${prod.name}" loading="lazy"><div class="product-info"><div class="product-title">${prod.name}</div><div class="product-price">$${prod.price} USD</div><div class="card-buttons"><button class="btn-add" data-id="${prod.id}"><i class="fas fa-cart-plus"></i> Comprar</button><button class="btn-details" data-id="${prod.id}"><i class="fas fa-info-circle"></i> Detalles</button></div></div>`;
        grid.appendChild(card);
    });
    document.querySelectorAll(".btn-add").forEach(btn => btn.addEventListener("click", (e) => addToCart(btn.dataset.id)));
    document.querySelectorAll(".btn-details").forEach(btn => btn.addEventListener("click", (e) => openModal(btn.dataset.id)));
}
let currentModalProductId = null;
function openModal(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;
    currentModalProductId = prod.id;
    document.getElementById("modalTitle").innerHTML = prod.name;
    document.getElementById("modalBody").innerHTML = `<div style="white-space: pre-wrap;">${prod.fullDescription}</div>`;
    document.getElementById("productModal").style.display = "flex";
}
function closeModal() { document.getElementById("productModal").style.display = "none"; currentModalProductId = null; }
function sendOrderToWhatsApp() {
    if (cart.length === 0) { showToast("⚠️ Carrito vacío, agrega productos"); return; }
    let details = "🛍️ *NUEVO PEDIDO - GESTORES DE VENTA*%0A%0A📋 *PRODUCTOS:*%0A";
    cart.forEach(i => { details += `• ${i.name} x${i.quantity} → $${(i.price * i.quantity).toFixed(2)} USD%0A`; });
    details += `%0A💰 *TOTAL: $${getCartTotal().toFixed(2)} USD*%0A%0A🚚 Envío incluido%0A💳 Formas de pago: Efectivo USD / Zelle%0A%0A📦 *Datos de envío:* (Nombre y dirección completa)%0A✅ Responda para confirmar.`;
    window.open(`https://wa.me/5356962235?text=${details}`, "_blank");
}
document.getElementById("clearCartBtn")?.addEventListener("click", () => { if(cart.length && confirm("¿Vaciar carrito?")) clearCart(); else if(!cart.length) showToast("Carrito vacío"); });
document.getElementById("checkoutWhatsAppBtn")?.addEventListener("click", sendOrderToWhatsApp);
document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
window.addEventListener("click", (e) => { if(e.target === document.getElementById("productModal")) closeModal(); });
document.getElementById("modalAddToCartBtn")?.addEventListener("click", () => { if(currentModalProductId) { addToCart(currentModalProductId); closeModal(); } });
renderProducts(); loadCart();