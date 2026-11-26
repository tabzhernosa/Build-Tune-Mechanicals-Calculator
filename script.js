const MARKUP = 1.5;

let services = [];
let resetArmed = false;
let resetTimer = null;
let lastTotal = null;

function addService() {
    const priceInput = document.getElementById("servicePrice");
    const price = Number(priceInput.value);

    if (priceInput.value === "" || !Number.isFinite(price) || price < 0) {
        setMessage("Enter a cosmetics price of ₱0 or more.", true);
        priceInput.focus();
        return;
    }

    services.push({
        price: price
    });

    priceInput.value = "";
    setMessage("Part added.", false);
    priceInput.focus();

    updateCalculator();
}

function deleteService(index) {
    services.splice(index, 1);
    setMessage("Part removed.", false);
    updateCalculator();
}

function resetCalculator() {
    if (services.length === 0) return;

    const btn = document.getElementById("resetBtn");

    // First click arms the button, second click confirms.
    if (!resetArmed) {
        resetArmed = true;
        btn.textContent = "Click again to confirm";
        btn.classList.add("armed");
        resetTimer = setTimeout(disarmReset, 3000);
        return;
    }

    disarmReset();
    services = [];
    setMessage("Calculator reset.", false);
    updateCalculator();
}

function disarmReset() {
    clearTimeout(resetTimer);
    resetArmed = false;
    const btn = document.getElementById("resetBtn");
    btn.textContent = "Reset calculator";
    btn.classList.remove("armed");
}

function setMessage(text, isError) {
    const el = document.getElementById("formMessage");
    el.textContent = text;
    el.classList.toggle("error", Boolean(isError));
}

function updateCalculator() {
    const totalParts = services.length;

    const subtotal = services.reduce((sum, service) => {
        return sum + service.price;
    }, 0);

    const finalTotal = subtotal * MARKUP;

    document.getElementById("totalParts").textContent = totalParts;
    document.getElementById("partsBadge").textContent =
        totalParts + (totalParts === 1 ? " part" : " parts");

    document.getElementById("subtotal").textContent = formatMoney(subtotal);

    const totalEl = document.getElementById("finalTotal");
    totalEl.textContent = formatMoney(finalTotal);

    if (lastTotal !== null && lastTotal !== finalTotal) {
        totalEl.classList.remove("tick");
        void totalEl.offsetWidth; // restart animation
        totalEl.classList.add("tick");
    }
    lastTotal = finalTotal;

    const serviceList = document.getElementById("serviceList");

    if (services.length === 0) {
        serviceList.innerHTML = `
            <li class="empty">
                <strong>No parts yet</strong>
                <span>Enter a cosmetics price above to start the quote.</span>
            </li>
        `;
    } else {
        serviceList.innerHTML = services.map((service, index) => {
            return `
            <li class="part">
                <span class="idx">${index + 1}</span>
                <div class="part-main">
                    <strong>${formatMoney(service.price)}</strong>
                </div>
                <button class="delete-btn" aria-label="Delete part ${index + 1}" title="Delete" onclick="deleteService(${index})">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/>
                    </svg>
                </button>
            </li>`;
        }).join("");

        serviceList.scrollTop = serviceList.scrollHeight;
    }

    document.getElementById("resetBtn").disabled = services.length === 0;
    if (services.length === 0 && resetArmed) disarmReset();
}

function formatMoney(amount, decimals = 2) {
    return amount.toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

updateCalculator();


document.getElementById("servicePrice").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addService();
    }
});

