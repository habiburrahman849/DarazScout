const catSearchEl = document.getElementById("catSearch");
const catDropdownEl = document.getElementById("catDropdown");
const commEl = document.getElementById("comm");

// Custom fast autocomplete for 7,851 categories
catSearchEl.addEventListener("input", () => {
  const q = catSearchEl.value.trim().toLowerCase();
  catDropdownEl.innerHTML = "";
  if (!q || typeof DARAZ_CATEGORIES === "undefined") {
    catDropdownEl.classList.add("hidden");
    return;
  }
  const matches = [];
  for (let i = 0; i < DARAZ_CATEGORIES.length; i++) {
    if (DARAZ_CATEGORIES[i][0].toLowerCase().includes(q)) {
      matches.push(DARAZ_CATEGORIES[i]);
      if (matches.length >= 25) break;
    }
  }
  if (!matches.length) {
    catDropdownEl.classList.add("hidden");
    return;
  }
  matches.forEach(([name, rate]) => {
    const div = document.createElement("div");
    div.className = "drop-item";
    div.innerHTML = `<span>${name}</span><span class="drop-rate">${rate.toFixed(2)}%</span>`;
    div.addEventListener("click", () => {
      catSearchEl.value = name;
      commEl.value = rate.toFixed(2);
      catDropdownEl.classList.add("hidden");
      calculateFBM();
    });
    catDropdownEl.appendChild(div);
  });
  catDropdownEl.classList.remove("hidden");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".autocomplete-wrap")) {
    catDropdownEl.classList.add("hidden");
  }
});

function fmt(num) {
  const sign = num < 0 ? "-" : "";
  return sign + "Rs. " + Math.round(Math.abs(num)).toLocaleString("en-PK");
}

function getDropoffFee(price) {
  if (price <= 500) return 10;
  if (price <= 1000) return 20;
  if (price <= 2000) return 40;
  return 60;
}

function computeModel(price, cost, commRate, vatRate, handlingMode, paymentType, useFsm, useVoucher, isNonAtl) {
  const commissionValue = price * commRate;
  const commissionVat = commissionValue * vatRate;
  const commissionWithVat = commissionValue + commissionVat;

  const paymentFee = price * 0.0225;
  let handleFee = 0;
  if (handlingMode === "dropoff") handleFee = getDropoffFee(price);
  else if (handlingMode === "pickup_std") handleFee = 30;
  else handleFee = 120;

  const fsmFee = useFsm ? Math.min(200, Math.max(30, price * 0.06)) : 0;
  const voucherFee = useVoucher ? price * 0.02 : 0;
  const campaignFee = fsmFee + voucherFee;

  const otherVat = (paymentFee + handleFee + campaignFee) * vatRate;

  let taxRate = paymentType === "cod" ? 0.02 : 0.01;
  if (isNonAtl) taxRate = (taxRate * 2) + 0.01;
  const whtFee = price * taxRate;

  const totalFees = commissionWithVat + paymentFee + handleFee + campaignFee + otherVat + whtFee;
  const payout = price - totalFees;
  const profit = payout - cost;
  return { commissionValue, commissionVat, commissionWithVat, paymentFee, handleFee, campaignFee, otherVat, whtFee, totalFees, payout, profit };
}

function findBreakEvenPrice(cost, commRate, vatRate, handlingMode, paymentType, useFsm, useVoucher, isNonAtl) {
  let lo = cost, hi = Math.max(cost * 4, 1000);
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const res = computeModel(mid, cost, commRate, vatRate, handlingMode, paymentType, useFsm, useVoucher, isNonAtl);
    if (res.profit >= 0) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi);
}

let lastSnapshot = null;

function calculateFBM() {
  const price = parseFloat(document.getElementById("price").value) || 0;
  const cost = parseFloat(document.getElementById("cost").value) || 0;
  const commRate = (parseFloat(commEl.value) || 0) / 100;
  const vatRate = parseFloat(document.getElementById("vat").value) || 0.15;
  const handlingMode = document.getElementById("handling").value;
  const paymentType = document.getElementById("paymentType").value;
  const units = Math.max(1, parseInt(document.getElementById("monthlyUnits").value) || 1);

  const useFsm = document.getElementById("fsm").checked;
  const useVoucher = document.getElementById("voucher").checked;
  const isNonAtl = document.getElementById("nonAtl").checked;

  const r = computeModel(price, cost, commRate, vatRate, handlingMode, paymentType, useFsm, useVoucher, isNonAtl);
  const margin = price > 0 ? (r.profit / price) * 100 : 0;
  const roi = cost > 0 ? (r.profit / cost) * 100 : 0;
  const feePct = price > 0 ? (r.totalFees / price) * 100 : 0;
  const breakEven = findBreakEvenPrice(cost, commRate, vatRate, handlingMode, paymentType, useFsm, useVoucher, isNonAtl);

  // KPIs
  const profitEl = document.getElementById("kpiProfit");
  profitEl.textContent = fmt(r.profit);
  profitEl.className = "kpi-value " + (r.profit >= 0 ? "text-pos" : "text-neg");
  document.getElementById("kpiPayout").textContent = "Net Payout: " + fmt(r.payout);

  const marginEl = document.getElementById("kpiMargin");
  marginEl.textContent = margin.toFixed(1) + "%";
  marginEl.className = "kpi-value " + (margin >= 0 ? "text-pos" : "text-neg");

  document.getElementById("kpiRoi").textContent = roi.toFixed(1) + "%";
  document.getElementById("kpiBreakEven").textContent = fmt(breakEven);
  document.getElementById("totalFeePctBadge").textContent = feePct.toFixed(1) + "% Fees";

  // Breakdown rows
  document.getElementById("rowComm").textContent = fmt(r.commissionValue);
  document.getElementById("rowCommVat").textContent = fmt(r.commissionVat);
  document.getElementById("rowCommWithVat").textContent = fmt(r.commissionWithVat);
  document.getElementById("rowPay").textContent = fmt(r.paymentFee);
  document.getElementById("rowHandle").textContent = fmt(r.handleFee);
  document.getElementById("rowCamp").textContent = fmt(r.campaignFee);
  document.getElementById("rowOtherVat").textContent = fmt(r.otherVat);
  document.getElementById("rowWht").textContent = fmt(r.whtFee);
  document.getElementById("rowTotalFees").textContent = fmt(r.totalFees);

  // Visual bar
  const posProfit = Math.max(0, r.profit);
  const otherFees = r.totalFees - r.commissionWithVat;
  const total = posProfit + cost + r.commissionWithVat + otherFees || 1;
  document.getElementById("barProfit").style.width = ((posProfit / total) * 100) + "%";
  document.getElementById("barCost").style.width = ((cost / total) * 100) + "%";
  document.getElementById("barComm").style.width = ((r.commissionWithVat / total) * 100) + "%";
  document.getElementById("barOther").style.width = ((otherFees / total) * 100) + "%";

  // Monthly projection
  document.getElementById("lblUnits").textContent = units;
  document.getElementById("moRev").textContent = fmt(price * units);
  document.getElementById("moFees").textContent = fmt(r.totalFees * units);
  const moProfEl = document.getElementById("moProfit");
  moProfEl.textContent = fmt(r.profit * units);
  moProfEl.className = r.profit >= 0 ? "text-pos" : "text-neg";

  lastSnapshot = {
    name: document.getElementById("productName").value.trim() || catSearchEl.value.trim() || "Custom Product",
    price, cost, commPct: (commRate * 100).toFixed(2), totalFees: r.totalFees, profit: r.profit, margin: margin.toFixed(1), roi: roi.toFixed(1)
  };
}

// LocalStorage Product Comparison Tracker
let savedProducts = JSON.parse(localStorage.getItem("daraz_scout_saved") || "[]");

function renderSaved() {
  const tbody = document.getElementById("savedBody");
  if (!savedProducts.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="9">No products saved yet. Click "+ Save to Comparison" above to compare products.</td></tr>`;
    return;
  }
  tbody.innerHTML = savedProducts.map((p, idx) => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${fmt(p.price)}</td>
      <td>${fmt(p.cost)}</td>
      <td>${p.commPct}%</td>
      <td>${fmt(p.totalFees)}</td>
      <td class="${p.profit >= 0 ? 'text-pos' : 'text-neg'}"><strong>${fmt(p.profit)}</strong></td>
      <td>${p.margin}%</td>
      <td>${p.roi}%</td>
      <td><button type="button" class="del-btn" data-idx="${idx}">x</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".del-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      savedProducts.splice(parseInt(btn.dataset.idx), 1);
      localStorage.setItem("daraz_scout_saved", JSON.stringify(savedProducts));
      renderSaved();
    });
  });
}

document.getElementById("btnSaveProduct").addEventListener("click", () => {
  if (!lastSnapshot) return;
  savedProducts.unshift(lastSnapshot);
  localStorage.setItem("daraz_scout_saved", JSON.stringify(savedProducts));
  renderSaved();
});

document.getElementById("btnClearSaved").addEventListener("click", () => {
  savedProducts = [];
  localStorage.setItem("daraz_scout_saved", JSON.stringify(savedProducts));
  renderSaved();
});

document.getElementById("btnExportCsv").addEventListener("click", () => {
  if (!savedProducts.length) return;
  const rows = [["Product", "Price", "Cost", "Commission %", "Total Fees", "Net Profit", "Margin %", "ROI %"]];
  savedProducts.forEach((p) => rows.push([`"${p.name.replace(/"/g, '""')}"`, p.price, p.cost, p.commPct, Math.round(p.totalFees), Math.round(p.profit), p.margin, p.roi]));
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "daraz_fbm_comparison.csv";
  a.click();
});

document.querySelectorAll("input, select").forEach((el) => {
  if (el.id !== "catSearch") {
    el.addEventListener("input", calculateFBM);
    el.addEventListener("change", calculateFBM);
  }
});

calculateFBM();
renderSaved();
