let cart = {};

fetch('products.json')
    .then(res => res.json())
    .then(data => {
        setupCategoryNav(data);
        renderProducts(data);
    });

function setupCategoryNav(data) {
    const nav = document.getElementById('category-nav');
    const categories = [...new Set(data.map(item => item.Category))];
    nav.innerHTML = categories.map(cat => `
        <a href="#cat-${cat.replace(/\s+/g, '')}" class="cat-pill">${cat}</a>
    `).join('');
}

function renderProducts(data) {
    const listDiv = document.getElementById('product-list');
    const categories = [...new Set(data.map(item => item.Category))];

    let html = '';
    categories.forEach(cat => {
        html += `<h3 class="category-title" id="cat-${cat.replace(/\s+/g, '')}">${cat}</h3>`;
        const items = data.filter(i => i.Category === cat);
        items.forEach(item => {
            const displayMrp = Math.round(parseFloat(item.MRP.replace(/[₹,]/g, '')));
            const displayRate = Math.round(parseFloat(item.Rate.replace(/[₹,]/g, '')));
            const cleanName = item.Product.replace(/'/g, "\\'");

            html += `
                <div class="product-row">
                    <div class="p-info">
                        <span class="p-name">${item.Product}</span>
                        <span class="p-sku">SKU: ${item.SKU}</span>
                        <div class="p-prices">
                            <span class="mrp-val">₹${displayMrp}</span>
                            <span class="disc-tag">75% OFF</span>
                            <span class="rate-val">₹${displayRate}</span>
                        </div>
                    </div>
                    <div class="p-action">
                        <div class="item-subtotal" id="subtotal-${item.SKU}">₹0</div>
                        <div class="qty-control">
                            <button type="button" class="qty-btn minus" onclick="changeQty('${item.SKU}', -1, '${cleanName}', ${displayRate})">-</button>
                            <input type="number" id="qty-${item.SKU}" class="qty-input" min="0" value="0" 
                                oninput="updateCart('${item.SKU}', this.value, '${cleanName}', ${displayRate})">
                            <button type="button" class="qty-btn plus" onclick="changeQty('${item.SKU}', 1, '${cleanName}', ${displayRate})">+</button>
                        </div>
                    </div>
                </div>`;
        });
    });
    listDiv.innerHTML = html;
}

// Helper to handle +/- button clicks
function changeQty(sku, change, name, rate) {
    const input = document.getElementById(`qty-${sku}`);
    let currentQty = parseInt(input.value) || 0;
    currentQty = Math.max(0, currentQty + change);
    input.value = currentQty;
    updateCart(sku, currentQty, name, rate);
}


function updateCart(sku, qty, name, rate) {
    qty = parseInt(qty) || 0;
    const itemTotal = qty * rate;
    document.getElementById(`subtotal-${sku}`).innerText = `₹${itemTotal}`;
    if (qty > 0) cart[sku] = { name, rate, qty, total: itemTotal };
    else delete cart[sku];

    const totals = Object.values(cart).reduce((acc, curr) => {
        acc.total += curr.total;
        acc.count += curr.qty;
        return acc;
    }, { total: 0, count: 0 });

    document.getElementById('itemCount').innerText = totals.count;
    document.getElementById('netTotal').innerText = totals.total.toLocaleString('en-IN');
}

function showModal() {
    if (Object.keys(cart).length === 0) {
        alert("Please select at least one item before ordering.");
        return;
    }
    document.getElementById('checkoutModal').style.display = "block";
}

function closeModal() { document.getElementById('checkoutModal').style.display = "none"; }

function shareStoreOnWhatsApp() {
    const siteUrl = window.location.href;

    const promoText =
        ` *JITHU CRACKERS-க்கு அன்புடன் வரவேற்கிறோம்!* 
QUALITY • QUANTITY • TRUST | Sivakasi

✅ நேரடி தொழிற்சாலை விலையில்
✅ அனைத்து பொருட்களுக்கும் Flat 75% தள்ளுபடி 
 *இப்போதே ஆர்டர் செய்ய:* ${siteUrl}

 *குறைந்தபட்ச ஆர்டர்:* ₹3,000 (தள்ளுபடிக்குப் பிறகு)

 *ஆர்டர் இறுதி நாட்கள்:*
• மற்ற மாநிலங்கள்: 20 அக்டோபர் 2026
• தமிழ்நாடு & கர்நாடகா: 02 நவம்பர் 2026

 பொருட்கள் இருப்பு மற்றும் கிடைக்கும் தன்மைக்கு ஏற்ப மாறக்கூடும்.
 டெலிவரி கட்டணம் தனியாக வசூலிக்கப்படும் (Lorry Freight).

 *கடைசி தேதி வரை காத்திருக்க வேண்டாம்!*
கடைசி நேர டெலிவரி சிரமங்களைத் தவிர்க்க, இன்றே உங்கள் ஆர்டரை பதிவு செய்யுங்கள்.

 *இந்த சிறப்பு சலுகையை தவறவிடாதீர்கள்!*
உங்கள் நண்பர்கள் மற்றும் உறவினர்களுக்கும் *JITHU CRACKERS*-ஐ பகிர்ந்து, ஸ்டாக் தீரும் முன் முந்துங்கள்! 

 *Phone / G-Pay:* +91 99527 32777, +91 82206 93192
 *WhatsApp:* https://wa.me/919952732777`;

    const shareUrl = "https://wa.me/?text=" + encodeURIComponent(promoText);
    window.open(shareUrl, "_blank");
}

function generateOrderId() {
    const now = new Date();
    const datePart = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');

    // Using Time (Hours, Minutes, Seconds) as the "Count"
    const timePart = now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');

    return datePart + "-" + timePart;
}

function submitOrder(type) {
    const nameEl = document.getElementById('custName');
    const phoneEl = document.getElementById('custPhone');
    const emailEl = document.getElementById('custEmail');
    const addressEl = document.getElementById('custAddress');

    // 2. Validate using the DOM elements (Pattern, Required, MinLength)
    if (!nameEl.checkValidity() || !phoneEl.checkValidity() || !emailEl.checkValidity() || !addressEl.checkValidity()) {
        alert("❌ Please fill in the details correctly:\n- Name (min 3 chars)\n- Phone (10 digits)\n- Valid Email\n- Detailed Address (min 10 chars)");

        // Highlight/Focus the first invalid field
        if (!nameEl.checkValidity()) nameEl.focus();
        else if (!phoneEl.checkValidity()) phoneEl.focus();
        else if (!emailEl.checkValidity()) emailEl.focus();
        else if (!addressEl.checkValidity()) addressEl.focus();

        return;
    }

    // 3. Extract trimmed values from elements
    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const email = emailEl.value.trim();
    const address = addressEl.value.trim();

    if (Object.keys(cart).length === 0) {
        alert("Your cart is empty. Please add items before placing an order.");
        return;
    }

    const orderId = generateOrderId();
    const orderDate = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    let totalQty = 0;
    let grandTotal = 0;
    let waItemsList = "";
    let emailItemsList = "";

    let itemIndex = 1;
    for (let sku in cart) {
        const item = cart[sku];
        totalQty += item.qty;
        grandTotal += item.total;

        // WhatsApp Item List (with formatting)
        waItemsList += `${itemIndex}. *${item.name}*\n`;
        waItemsList += `   └ SKU: ${sku} | ₹${item.rate} x ${item.qty} = *₹${item.total.toLocaleString('en-IN')}*\n`;

        // Email Item List (clean layout)
        emailItemsList += `${itemIndex}. ${item.name} (SKU: ${sku})\n`;
        emailItemsList += `   Qty: ${item.qty} x ₹${item.rate} = ₹${item.total.toLocaleString('en-IN')}\n\n`;

        itemIndex++;
    }

    // HIGHLIGHTED WHATSAPP MESSAGE
    const waMessage =
        `*NEW ORDER - JITHU CRACKERS*
--------------------------------------
*ORDER DETAILS:*
• *Order ID:* ${orderId}
• *Date & Time:* ${orderDate}

*CUSTOMER DETAILS:*
• *Name:* ${name}
• *WhatsApp:* ${phone}
• *Email:* ${email}
• *Delivery Address:* 
${address}

*ITEMS ORDERED:*
${waItemsList}
--------------------------------------
*ORDER SUMMARY:*
• *Total Quantity:* ${totalQty} items
• *GRAND TOTAL:* *₹${grandTotal.toLocaleString('en-IN')}*
--------------------------------------
*PAYMENT DETAILS:*
• *G-Pay / PhonePe:* 9952732777, 8220693192
• *Bank:* State Bank of India
• *A/c Name:* K Praveenkumar
• *A/c No:* 31492853796
• *IFSC:* SBIN0012767
• *Branch:* Thiruthangal
--------------------------------------
Please share your payment screenshot here after completing payment.`;

    // HIGHLIGHTED EMAIL MESSAGE
    const recipientEmail = "praveen07cracker@gmail.com";
    const mailSubject = `New Order: ${orderId} - ${name} (₹${grandTotal.toLocaleString('en-IN')})`;

    const mailBody =
        `==================================================
           JITHU CRACKERS - ORDER CONFIRMATION
==================================================

ORDER REFERENCE:
----------------
Order ID  : ${orderId}
Date/Time : ${orderDate}

CUSTOMER DETAILS:
-----------------
Customer Name    : ${name.toUpperCase()}
Contact Number   : ${phone}
Email Address    : ${email}
Delivery Address : 
${address.toUpperCase()}

ITEMS ORDERED:
--------------
${emailItemsList}
--------------------------------------------------
SUMMARY:
--------------------------------------------------
Total Items Count : ${totalQty}
GRAND TOTAL       : Rs. ${grandTotal.toLocaleString('en-IN')}

==================================================
PAYMENT DETAILS (TRANSFER TO CONFIRM):
==================================================
• G-Pay or PhonePe : 9952732777, 8220693192
• Bank Name        : State Bank of India
• A/c Name         : K Praveenkumar
• A/c Number       : 31492853796
• Branch           : Thiruthangal
• IFSC Code        : SBIN0012767
• MICR Code        : 626002025
==================================================
Note: Please reply with your payment screenshot once paid.`;

    // ==========================================
    // DISPATCH LOGIC
    // ==========================================
    if (type === 'whatsapp') {
        const waUrl = "https://wa.me/919952732777?text=" + encodeURIComponent(waMessage);
        window.open(waUrl, "_blank");
    }
    else if (type === 'email') {
        const encodedSubject = encodeURIComponent(mailSubject);
        const encodedBody = encodeURIComponent(mailBody);
        const mailtoLink = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

        // Check if on Desktop or Mobile
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
            // Triggers Gmail/Apple Mail app directly on phones
            window.location.href = mailtoLink;
        } else {
            // Opens Gmail compose tab directly for desktop browsers
            const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${encodedSubject}&body=${encodedBody}`;
            window.open(gmailWebUrl, '_blank');
        }
    }
    else if (type === 'save_json') {
        const fullOrder = {
            orderID: orderId,
            date: orderDate,
            customer: { name, phone, email, address },
            items: cart,
            totalQuantity: totalQty,
            grandTotal: grandTotal
        };
        const blob = new Blob([JSON.stringify(fullOrder, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Order_${orderId}_${name.replace(/\s+/g, '_')}.json`;
        a.click();
    }
}
