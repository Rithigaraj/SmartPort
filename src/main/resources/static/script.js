const API = "http://localhost:8080";

// Global cache for dropdown options
let carriersList = [];
let customersList = [];
let movesList = [];
let invoicesList = [];

// ===============================
// DASHBOARD
// ===============================

async function loadDashboard() {
    try {
        const response = await fetch(API + "/api/dashboard");
        if (!response.ok) throw new Error("Dashboard API failed");

        const data = await response.json();

        document.getElementById("totalCarriers").innerText = data.totalCarriers || 0;
        document.getElementById("available").innerText = data.availableCarriers || 0;
        document.getElementById("lowBattery").innerText = data.lowBatteryCarriers || 0;
        document.getElementById("totalMoves").innerText = data.totalMoves || 0;
        document.getElementById("completed").innerText = data.completedMoves || 0;
        document.getElementById("revenue").innerText = "₹" + (data.totalRevenue || 0).toLocaleString();
        document.getElementById("planned").innerText = "₹" + (data.plannedBudget || 0).toLocaleString();
        document.getElementById("actual").innerText = "₹" + (data.actualBudget || 0).toLocaleString();
        document.getElementById("remaining").innerText = "₹" + (data.remainingBudget || 0).toLocaleString();

        const planned = data.plannedBudget || 0;
        const actual = data.actualBudget || 0;
        let percentage = planned > 0 ? (actual / planned) * 100 : 0;
        document.getElementById("progress").style.width = Math.min(percentage, 100) + "%";

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}


// ===============================
// FLEET (CARRIERS)
// ===============================

async function loadFleet() {
    try {
        const response = await fetch(API + "/api/carriers");
        if (!response.ok) throw new Error("Fleet API failed");

        carriersList = await response.json();
        const table = document.getElementById("fleetTable");
        table.innerHTML = "";

        if (carriersList.length === 0) {
            table.innerHTML = `<tr><td colspan="6">No carriers found. Click "+ Add Carrier" to create one.</td></tr>`;
            return;
        }

        carriersList.forEach(carrier => {
            let batteryClass = "good";
            if (carrier.batteryPercentage < 15) {
                batteryClass = "low";
            } else if (carrier.batteryPercentage < 40) {
                batteryClass = "medium";
            }

            table.innerHTML += `
                <tr>
                    <td><b>${escapeHtml(carrier.carrierNumber)}</b></td>
                    <td>${escapeHtml(carrier.manufacturer || "-")}</td>
                    <td>${escapeHtml(carrier.model || "-")}</td>
                    <td><span class="badge ${batteryClass}">${carrier.batteryPercentage}%</span></td>
                    <td><span class="badge good">${escapeHtml(carrier.status || "-")}</span></td>
                    <td>
                        <button class="action-btn edit" onclick="openCarrierModal(${carrier.id})">✏️ Edit</button>
                        <button class="action-btn delete" onclick="deleteCarrier(${carrier.id})">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Fleet Error:", error);
    }
}

function openCarrierModal(id = null) {
    const isEdit = id !== null;
    let item = { carrierNumber: "", manufacturer: "", model: "", batteryPercentage: 100, status: "AVAILABLE" };
    if (isEdit) {
        item = carriersList.find(c => c.id === id) || item;
    }

    document.getElementById("modalTitle").innerText = isEdit ? "Edit Straddle Carrier" : "Add New Carrier";
    document.getElementById("entityId").value = isEdit ? id : "";
    document.getElementById("crudForm").dataset.entity = "carrier";

    document.getElementById("modalFormFields").innerHTML = `
        <div class="form-group">
            <label>Carrier Number</label>
            <input type="text" id="f_carrierNumber" class="form-control" value="${escapeHtml(item.carrierNumber)}" required placeholder="e.g. SC-101">
        </div>
        <div class="form-group">
            <label>Manufacturer</label>
            <input type="text" id="f_manufacturer" class="form-control" value="${escapeHtml(item.manufacturer)}" placeholder="e.g. Kalmar">
        </div>
        <div class="form-group">
            <label>Model</label>
            <input type="text" id="f_model" class="form-control" value="${escapeHtml(item.model)}" placeholder="e.g. FastCharge-V2">
        </div>
        <div class="form-group">
            <label>Battery Percentage (%)</label>
            <input type="number" id="f_batteryPercentage" class="form-control" min="0" max="100" value="${item.batteryPercentage}" required>
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="f_status" class="form-control">
                <option value="AVAILABLE" ${item.status === "AVAILABLE" ? "selected" : ""}>AVAILABLE</option>
                <option value="BUSY" ${item.status === "BUSY" ? "selected" : ""}>BUSY</option>
                <option value="CHARGING" ${item.status === "CHARGING" ? "selected" : ""}>CHARGING</option>
                <option value="MAINTENANCE" ${item.status === "MAINTENANCE" ? "selected" : ""}>MAINTENANCE</option>
            </select>
        </div>
    `;
    openModal();
}

async function saveCarrier(id) {
    const carrier = {
        carrierNumber: document.getElementById("f_carrierNumber").value.trim(),
        manufacturer: document.getElementById("f_manufacturer").value.trim(),
        model: document.getElementById("f_model").value.trim(),
        batteryPercentage: Number(document.getElementById("f_batteryPercentage").value),
        status: document.getElementById("f_status").value
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/api/carriers/${id}` : `${API}/api/carriers`;

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carrier)
    });

    if (!res.ok) throw new Error("Save carrier failed");
    closeModal();
    loadFleet();
    loadDashboard();
}

async function deleteCarrier(id) {
    if (!confirm("Are you sure you want to delete this carrier?")) return;
    try {
        const res = await fetch(`${API}/api/carriers/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete carrier failed");
        loadFleet();
        loadDashboard();
    } catch (err) {
        alert("Unable to delete carrier.");
    }
}


// ===============================
// BATTERIES
// ===============================

async function loadBatteries() {
    try {
        const response = await fetch(API + "/api/batteries");
        if (!response.ok) throw new Error("Battery API failed");

        const batteries = await response.json();
        window.batteriesList = batteries;
        const table = document.getElementById("batteryTable");
        table.innerHTML = "";

        if (batteries.length === 0) {
            table.innerHTML = `<tr><td colspan="4">No battery packs found. Click "+ Add Battery" to create one.</td></tr>`;
            return;
        }

        batteries.forEach(battery => {
            let batteryClass = "good";
            if (battery.chargePercentage < 20) {
                batteryClass = "low";
            } else if (battery.chargePercentage < 50) {
                batteryClass = "medium";
            }

            table.innerHTML += `
                <tr>
                    <td><b>${escapeHtml(battery.batteryNumber)}</b></td>
                    <td><span class="badge ${batteryClass}">${battery.chargePercentage}%</span></td>
                    <td><span class="badge good">${escapeHtml(battery.status || "-")}</span></td>
                    <td>
                        <button class="action-btn edit" onclick="openBatteryModal(${battery.id})">✏️ Edit</button>
                        <button class="action-btn delete" onclick="deleteBattery(${battery.id})">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Battery Error:", error);
    }
}

function openBatteryModal(id = null) {
    const isEdit = id !== null;
    let item = { batteryNumber: "", chargePercentage: 100, status: "AVAILABLE" };
    if (isEdit && window.batteriesList) {
        item = window.batteriesList.find(b => b.id === id) || item;
    }

    document.getElementById("modalTitle").innerText = isEdit ? "Edit Battery Pack" : "Add New Battery Pack";
    document.getElementById("entityId").value = isEdit ? id : "";
    document.getElementById("crudForm").dataset.entity = "battery";

    document.getElementById("modalFormFields").innerHTML = `
        <div class="form-group">
            <label>Battery Number</label>
            <input type="text" id="f_batteryNumber" class="form-control" value="${escapeHtml(item.batteryNumber)}" required placeholder="e.g. BAT-201">
        </div>
        <div class="form-group">
            <label>Charge Percentage (%)</label>
            <input type="number" id="f_chargePercentage" class="form-control" min="0" max="100" value="${item.chargePercentage}" required>
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="f_status" class="form-control">
                <option value="AVAILABLE" ${item.status === "AVAILABLE" ? "selected" : ""}>AVAILABLE</option>
                <option value="IN_USE" ${item.status === "IN_USE" ? "selected" : ""}>IN_USE</option>
                <option value="CHARGING" ${item.status === "CHARGING" ? "selected" : ""}>CHARGING</option>
            </select>
        </div>
    `;
    openModal();
}

async function saveBattery(id) {
    const battery = {
        batteryNumber: document.getElementById("f_batteryNumber").value.trim(),
        chargePercentage: Number(document.getElementById("f_chargePercentage").value),
        status: document.getElementById("f_status").value
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/api/batteries/${id}` : `${API}/api/batteries`;

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(battery)
    });

    if (!res.ok) throw new Error("Save battery failed");
    closeModal();
    loadBatteries();
    loadDashboard();
}

async function deleteBattery(id) {
    if (!confirm("Are you sure you want to delete this battery pack?")) return;
    try {
        const res = await fetch(`${API}/api/batteries/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete battery failed");
        loadBatteries();
        loadDashboard();
    } catch (err) {
        alert("Unable to delete battery.");
    }
}


// ===============================
// CONTAINER MOVES
// ===============================

async function loadMoves() {
    try {
        const response = await fetch(API + "/api/moves");
        if (!response.ok) throw new Error("Moves API failed");

        movesList = await response.json();
        const table = document.getElementById("movesTable");
        table.innerHTML = "";

        if (movesList.length === 0) {
            table.innerHTML = `<tr><td colspan="7">No container moves found. Click "+ Add Container Move" to create one.</td></tr>`;
            return;
        }

        movesList.forEach(move => {
            const carrierName = move.carrier ? (move.carrier.carrierNumber || `Carrier #${move.carrier.id}`) : "-";
            table.innerHTML += `
                <tr>
                    <td><b>${escapeHtml(move.containerNumber)}</b></td>
                    <td>${escapeHtml(move.source || "-")}</td>
                    <td>${escapeHtml(move.destination || "-")}</td>
                    <td>₹${(move.amount || 0).toLocaleString()}</td>
                    <td><span class="badge good">${escapeHtml(move.status || "-")}</span></td>
                    <td>${escapeHtml(carrierName)}</td>
                    <td>
                        <button class="action-btn edit" onclick="openMoveModal(${move.id})">✏️ Edit</button>
                        <button class="action-btn delete" onclick="deleteMove(${move.id})">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Moves Error:", error);
    }
}

async function openMoveModal(id = null) {
    const isEdit = id !== null;
    let item = { containerNumber: "", source: "", destination: "", amount: 0, status: "PENDING", carrier: null };
    if (isEdit) {
        item = movesList.find(m => m.id === id) || item;
    }

    // Ensure carriers list is fresh
    if (!carriersList || carriersList.length === 0) {
        try {
            const res = await fetch(API + "/api/carriers");
            carriersList = await res.json();
        } catch (e) {}
    }

    let carrierOptions = `<option value="">-- None / Auto Assign --</option>`;
    carriersList.forEach(c => {
        const selected = item.carrier && item.carrier.id === c.id ? "selected" : "";
        carrierOptions += `<option value="${c.id}" ${selected}>${escapeHtml(c.carrierNumber)} (${escapeHtml(c.status)})</option>`;
    });

    document.getElementById("modalTitle").innerText = isEdit ? "Edit Container Move" : "Add Container Move";
    document.getElementById("entityId").value = isEdit ? id : "";
    document.getElementById("crudForm").dataset.entity = "move";

    document.getElementById("modalFormFields").innerHTML = `
        <div class="form-group">
            <label>Container Number</label>
            <input type="text" id="f_containerNumber" class="form-control" value="${escapeHtml(item.containerNumber)}" required placeholder="e.g. MSCU-8832109">
        </div>
        <div class="form-group">
            <label>Source Location</label>
            <input type="text" id="f_source" class="form-control" value="${escapeHtml(item.source)}" placeholder="e.g. Yard A-4">
        </div>
        <div class="form-group">
            <label>Destination Location</label>
            <input type="text" id="f_destination" class="form-control" value="${escapeHtml(item.destination)}" placeholder="e.g. Berth 2">
        </div>
        <div class="form-group">
            <label>Service Fee / Amount (₹)</label>
            <input type="number" id="f_amount" class="form-control" value="${item.amount}" min="0">
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="f_status" class="form-control">
                <option value="PENDING" ${item.status === "PENDING" ? "selected" : ""}>PENDING</option>
                <option value="IN_PROGRESS" ${item.status === "IN_PROGRESS" ? "selected" : ""}>IN_PROGRESS</option>
                <option value="COMPLETED" ${item.status === "COMPLETED" ? "selected" : ""}>COMPLETED</option>
            </select>
        </div>
        <div class="form-group">
            <label>Assigned Straddle Carrier</label>
            <select id="f_carrierId" class="form-control">${carrierOptions}</select>
        </div>
    `;
    openModal();
}

async function saveMove(id) {
    const carrierId = document.getElementById("f_carrierId").value;
    const move = {
        containerNumber: document.getElementById("f_containerNumber").value.trim(),
        source: document.getElementById("f_source").value.trim(),
        destination: document.getElementById("f_destination").value.trim(),
        amount: Number(document.getElementById("f_amount").value),
        status: document.getElementById("f_status").value,
        carrier: carrierId ? { id: Number(carrierId) } : null
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/api/moves/${id}` : `${API}/api/moves`;

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(move)
    });

    if (!res.ok) throw new Error("Save move failed");
    closeModal();
    loadMoves();
    loadDashboard();
}

async function deleteMove(id) {
    if (!confirm("Are you sure you want to delete this move record?")) return;
    try {
        const res = await fetch(`${API}/api/moves/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete move failed");
        loadMoves();
        loadDashboard();
    } catch (err) {
        alert("Unable to delete move record.");
    }
}


// ===============================
// CUSTOMERS
// ===============================

async function loadCustomers() {
    try {
        const response = await fetch(API + "/api/customers");
        if (!response.ok) throw new Error("Customers API failed");

        customersList = await response.json();
        const table = document.getElementById("customersTable");
        table.innerHTML = "";

        if (customersList.length === 0) {
            table.innerHTML = `<tr><td colspan="5">No customers found. Click "+ Add Customer" to create one.</td></tr>`;
            return;
        }

        customersList.forEach(c => {
            table.innerHTML += `
                <tr>
                    <td>#${c.id}</td>
                    <td><b>${escapeHtml(c.companyName)}</b></td>
                    <td>${escapeHtml(c.contact || "-")}</td>
                    <td>${escapeHtml(c.email || "-")}</td>
                    <td>
                        <button class="action-btn edit" onclick="openCustomerModal(${c.id})">✏️ Edit</button>
                        <button class="action-btn delete" onclick="deleteCustomer(${c.id})">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Customers Error:", error);
    }
}

function openCustomerModal(id = null) {
    const isEdit = id !== null;
    let item = { companyName: "", contact: "", email: "" };
    if (isEdit) {
        item = customersList.find(c => c.id === id) || item;
    }

    document.getElementById("modalTitle").innerText = isEdit ? "Edit Customer" : "Add New Customer";
    document.getElementById("entityId").value = isEdit ? id : "";
    document.getElementById("crudForm").dataset.entity = "customer";

    document.getElementById("modalFormFields").innerHTML = `
        <div class="form-group">
            <label>Company Name</label>
            <input type="text" id="f_companyName" class="form-control" value="${escapeHtml(item.companyName)}" required placeholder="e.g. Maersk Logistics">
        </div>
        <div class="form-group">
            <label>Contact Phone</label>
            <input type="text" id="f_contact" class="form-control" value="${escapeHtml(item.contact)}" placeholder="e.g. 9876543210">
        </div>
        <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="f_email" class="form-control" value="${escapeHtml(item.email)}" placeholder="e.g. contact@maersk.com">
        </div>
    `;
    openModal();
}

async function saveCustomer(id) {
    const customer = {
        companyName: document.getElementById("f_companyName").value.trim(),
        contact: document.getElementById("f_contact").value.trim(),
        email: document.getElementById("f_email").value.trim()
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/api/customers/${id}` : `${API}/api/customers`;

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
    });

    if (!res.ok) throw new Error("Save customer failed");
    closeModal();
    loadCustomers();
}

async function deleteCustomer(id) {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
        const res = await fetch(`${API}/api/customers/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete customer failed");
        loadCustomers();
    } catch (err) {
        alert("Unable to delete customer.");
    }
}


// ===============================
// INVOICES
// ===============================

async function loadInvoices() {
    try {
        const response = await fetch(API + "/api/invoices");
        if (!response.ok) throw new Error("Invoices API failed");

        invoicesList = await response.json();
        const table = document.getElementById("invoicesTable");
        table.innerHTML = "";

        if (invoicesList.length === 0) {
            table.innerHTML = `<tr><td colspan="6">No invoices found. Click "+ Add Invoice" to create one.</td></tr>`;
            return;
        }

        invoicesList.forEach(inv => {
            const customerName = inv.customer ? inv.customer.companyName : "-";
            const moveContainer = inv.move ? inv.move.containerNumber : "-";
            table.innerHTML += `
                <tr>
                    <td><b>#INV-${inv.id}</b></td>
                    <td>${escapeHtml(customerName)}</td>
                    <td>${escapeHtml(moveContainer)}</td>
                    <td>₹${(inv.amount || 0).toLocaleString()}</td>
                    <td><span class="badge good">${escapeHtml(inv.status || "-")}</span></td>
                    <td>
                        <button class="action-btn edit" onclick="openInvoiceModal(${inv.id})">✏️ Edit</button>
                        <button class="action-btn delete" onclick="deleteInvoice(${inv.id})">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Invoices Error:", error);
    }
}

async function openInvoiceModal(id = null) {
    const isEdit = id !== null;
    let item = { amount: 0, status: "PENDING", customer: null, move: null };
    if (isEdit) {
        item = invoicesList.find(inv => inv.id === id) || item;
    }

    // Load customers and moves if needed
    if (!customersList || customersList.length === 0) {
        try {
            const res = await fetch(API + "/api/customers");
            customersList = await res.json();
        } catch(e) {}
    }
    if (!movesList || movesList.length === 0) {
        try {
            const res = await fetch(API + "/api/moves");
            movesList = await res.json();
        } catch(e) {}
    }

    let customerOptions = `<option value="">-- Select Customer --</option>`;
    customersList.forEach(c => {
        const selected = item.customer && item.customer.id === c.id ? "selected" : "";
        customerOptions += `<option value="${c.id}" ${selected}>${escapeHtml(c.companyName)}</option>`;
    });

    let moveOptions = `<option value="">-- Select Container Move --</option>`;
    movesList.forEach(m => {
        const selected = item.move && item.move.id === m.id ? "selected" : "";
        moveOptions += `<option value="${m.id}" ${selected}>${escapeHtml(m.containerNumber)} (₹${m.amount})</option>`;
    });

    document.getElementById("modalTitle").innerText = isEdit ? "Edit Invoice" : "Add New Invoice";
    document.getElementById("entityId").value = isEdit ? id : "";
    document.getElementById("crudForm").dataset.entity = "invoice";

    document.getElementById("modalFormFields").innerHTML = `
        <div class="form-group">
            <label>Customer</label>
            <select id="f_customerId" class="form-control">${customerOptions}</select>
        </div>
        <div class="form-group">
            <label>Container Move</label>
            <select id="f_moveId" class="form-control">${moveOptions}</select>
        </div>
        <div class="form-group">
            <label>Invoice Amount (₹)</label>
            <input type="number" id="f_amount" class="form-control" value="${item.amount}" required min="0">
        </div>
        <div class="form-group">
            <label>Invoice Status</label>
            <select id="f_status" class="form-control">
                <option value="PENDING" ${item.status === "PENDING" ? "selected" : ""}>PENDING</option>
                <option value="PAID" ${item.status === "PAID" ? "selected" : ""}>PAID</option>
                <option value="OVERDUE" ${item.status === "OVERDUE" ? "selected" : ""}>OVERDUE</option>
            </select>
        </div>
    `;
    openModal();
}

async function saveInvoice(id) {
    const custId = document.getElementById("f_customerId").value;
    const moveId = document.getElementById("f_moveId").value;
    const invoice = {
        amount: Number(document.getElementById("f_amount").value),
        status: document.getElementById("f_status").value,
        customer: custId ? { id: Number(custId) } : null,
        move: moveId ? { id: Number(moveId) } : null
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/api/invoices/${id}` : `${API}/api/invoices`;

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice)
    });

    if (!res.ok) throw new Error("Save invoice failed");
    closeModal();
    loadInvoices();
    loadFinance();
    loadDashboard();
}

async function deleteInvoice(id) {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
        const res = await fetch(`${API}/api/invoices/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete invoice failed");
        loadInvoices();
        loadFinance();
        loadDashboard();
    } catch (err) {
        alert("Unable to delete invoice.");
    }
}


// ===============================
// PAYMENTS
// ===============================

async function loadPayments() {
    try {
        const response = await fetch(API + "/api/payments");
        if (!response.ok) throw new Error("Payments API failed");

        const payments = await response.json();
        window.paymentsList = payments;
        const table = document.getElementById("paymentsTable");
        table.innerHTML = "";

        if (payments.length === 0) {
            table.innerHTML = `<tr><td colspan="6">No payment transactions found. Click "+ Add Payment" to create one.</td></tr>`;
            return;
        }

        payments.forEach(p => {
            const invoiceRef = p.invoice ? `#INV-${p.invoice.id}` : "-";
            table.innerHTML += `
                <tr>
                    <td><b>#PAY-${p.id}</b></td>
                    <td>${escapeHtml(invoiceRef)}</td>
                    <td>₹${(p.amount || 0).toLocaleString()}</td>
                    <td><span class="badge good">${escapeHtml(p.method || "-")}</span></td>
                    <td>${p.paymentDate || "-"}</td>
                    <td>
                        <button class="action-btn edit" onclick="openPaymentModal(${p.id})">✏️ Edit</button>
                        <button class="action-btn delete" onclick="deletePayment(${p.id})">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Payments Error:", error);
    }
}

async function openPaymentModal(id = null) {
    const isEdit = id !== null;
    let item = { amount: 0, method: "BANK_TRANSFER", paymentDate: new Date().toISOString().split('T')[0], invoice: null };
    if (isEdit && window.paymentsList) {
        item = window.paymentsList.find(p => p.id === id) || item;
    }

    if (!invoicesList || invoicesList.length === 0) {
        try {
            const res = await fetch(API + "/api/invoices");
            invoicesList = await res.json();
        } catch(e) {}
    }

    let invoiceOptions = `<option value="">-- Select Invoice --</option>`;
    invoicesList.forEach(inv => {
        const selected = item.invoice && item.invoice.id === inv.id ? "selected" : "";
        invoiceOptions += `<option value="${inv.id}" ${selected}>#INV-${inv.id} (₹${inv.amount})</option>`;
    });

    document.getElementById("modalTitle").innerText = isEdit ? "Edit Payment" : "Record New Payment";
    document.getElementById("entityId").value = isEdit ? id : "";
    document.getElementById("crudForm").dataset.entity = "payment";

    document.getElementById("modalFormFields").innerHTML = `
        <div class="form-group">
            <label>Invoice Reference</label>
            <select id="f_invoiceId" class="form-control">${invoiceOptions}</select>
        </div>
        <div class="form-group">
            <label>Payment Amount (₹)</label>
            <input type="number" id="f_amount" class="form-control" value="${item.amount}" required min="0">
        </div>
        <div class="form-group">
            <label>Payment Method</label>
            <select id="f_method" class="form-control">
                <option value="BANK_TRANSFER" ${item.method === "BANK_TRANSFER" ? "selected" : ""}>BANK_TRANSFER</option>
                <option value="CREDIT_CARD" ${item.method === "CREDIT_CARD" ? "selected" : ""}>CREDIT_CARD</option>
                <option value="UPI" ${item.method === "UPI" ? "selected" : ""}>UPI</option>
                <option value="CHEQUE" ${item.method === "CHEQUE" ? "selected" : ""}>CHEQUE</option>
            </select>
        </div>
        <div class="form-group">
            <label>Payment Date</label>
            <input type="date" id="f_paymentDate" class="form-control" value="${item.paymentDate || ''}" required>
        </div>
    `;
    openModal();
}

async function savePayment(id) {
    const invId = document.getElementById("f_invoiceId").value;
    const payment = {
        amount: Number(document.getElementById("f_amount").value),
        method: document.getElementById("f_method").value,
        paymentDate: document.getElementById("f_paymentDate").value,
        invoice: invId ? { id: Number(invId) } : null
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/api/payments/${id}` : `${API}/api/payments`;

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment)
    });

    if (!res.ok) throw new Error("Save payment failed");
    closeModal();
    loadPayments();
    loadFinance();
}

async function deletePayment(id) {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    try {
        const res = await fetch(`${API}/api/payments/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete payment failed");
        loadPayments();
        loadFinance();
    } catch (err) {
        alert("Unable to delete payment.");
    }
}


// ===============================
// BUDGETS
// ===============================

async function loadBudgets() {
    try {
        const response = await fetch(API + "/api/budgets");
        if (!response.ok) throw new Error("Budgets API failed");

        const budgets = await response.json();
        window.budgetsList = budgets;
        const table = document.getElementById("budgetsTable");
        table.innerHTML = "";

        if (budgets.length === 0) {
            table.innerHTML = `<tr><td colspan="5">No sector budgets found. Click "+ Add Sector Budget" to create one.</td></tr>`;
            return;
        }

        budgets.forEach(b => {
            const remaining = (b.plannedAmount || 0) - (b.actualAmount || 0);
            table.innerHTML += `
                <tr>
                    <td><b>${escapeHtml(b.sector)}</b></td>
                    <td>₹${(b.plannedAmount || 0).toLocaleString()}</td>
                    <td>₹${(b.actualAmount || 0).toLocaleString()}</td>
                    <td><span class="badge ${remaining >= 0 ? 'good' : 'low'}">₹${remaining.toLocaleString()}</span></td>
                    <td>
                        <button class="action-btn edit" onclick="openBudgetModal(${b.id})">✏️ Edit</button>
                        <button class="action-btn delete" onclick="deleteBudget(${b.id})">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Budgets Error:", error);
    }
}

function openBudgetModal(id = null) {
    const isEdit = id !== null;
    let item = { sector: "", plannedAmount: 0, actualAmount: 0 };
    if (isEdit && window.budgetsList) {
        item = window.budgetsList.find(b => b.id === id) || item;
    }

    document.getElementById("modalTitle").innerText = isEdit ? "Edit Sector Budget" : "Add Sector Budget";
    document.getElementById("entityId").value = isEdit ? id : "";
    document.getElementById("crudForm").dataset.entity = "budget";

    document.getElementById("modalFormFields").innerHTML = `
        <div class="form-group">
            <label>Sector Name</label>
            <input type="text" id="f_sector" class="form-control" value="${escapeHtml(item.sector)}" required placeholder="e.g. Battery Infrastructure">
        </div>
        <div class="form-group">
            <label>Planned Budget Amount (₹)</label>
            <input type="number" id="f_plannedAmount" class="form-control" value="${item.plannedAmount}" min="0" required>
        </div>
        <div class="form-group">
            <label>Actual Usage Amount (₹)</label>
            <input type="number" id="f_actualAmount" class="form-control" value="${item.actualAmount}" min="0" required>
        </div>
    `;
    openModal();
}

async function saveBudget(id) {
    const budget = {
        sector: document.getElementById("f_sector").value.trim(),
        plannedAmount: Number(document.getElementById("f_plannedAmount").value),
        actualAmount: Number(document.getElementById("f_actualAmount").value)
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/api/budgets/${id}` : `${API}/api/budgets`;

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget)
    });

    if (!res.ok) throw new Error("Save budget failed");
    closeModal();
    loadBudgets();
    loadFinance();
    loadDashboard();
}

async function deleteBudget(id) {
    if (!confirm("Are you sure you want to delete this sector budget?")) return;
    try {
        const res = await fetch(`${API}/api/budgets/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete budget failed");
        loadBudgets();
        loadFinance();
        loadDashboard();
    } catch (err) {
        alert("Unable to delete budget.");
    }
}


// ===============================
// FINANCE OVERVIEW
// ===============================

async function loadFinance() {
    try {
        const budgetResponse = await fetch(API + "/api/reports/budget");
        const budget = await budgetResponse.json();

        const profitResponse = await fetch(API + "/api/reports/profit-loss");
        const profit = await profitResponse.json();

        // Calculate total payments received
        let totalPayments = 0;
        try {
            const payRes = await fetch(API + "/api/payments");
            const payments = await payRes.json();
            totalPayments = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        } catch(e) {}

        document.getElementById("fRevenue").innerText = "₹" + (profit.totalRevenue || 0).toLocaleString();
        document.getElementById("fPayments").innerText = "₹" + totalPayments.toLocaleString();
        document.getElementById("fPlanned").innerText = "₹" + (budget.plannedBudget || 0).toLocaleString();
        document.getElementById("fRemaining").innerText = "₹" + (budget.remainingBudget || 0).toLocaleString();

    } catch (error) {
        console.error("Finance Error:", error);
    }
}


// ===============================
// MODAL CONTROLLER & FORM SUBMIT
// ===============================

function openModal() {
    document.getElementById("crudModal").classList.add("active");
}

function closeModal() {
    document.getElementById("crudModal").classList.remove("active");
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const entity = document.getElementById("crudForm").dataset.entity;
    const id = document.getElementById("entityId").value;

    try {
        if (entity === "carrier") await saveCarrier(id);
        else if (entity === "battery") await saveBattery(id);
        else if (entity === "move") await saveMove(id);
        else if (entity === "customer") await saveCustomer(id);
        else if (entity === "invoice") await saveInvoice(id);
        else if (entity === "payment") await savePayment(id);
        else if (entity === "budget") await saveBudget(id);
    } catch (err) {
        console.error("Form submit error:", err);
        alert("Operation failed: " + err.message);
    }
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// SIDEBAR NAVIGATION
// ===============================

function show(page, button) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active");
    });

    const selectedPage = document.getElementById(page);
    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    document.querySelectorAll(".nav").forEach(nav => {
        nav.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    const titles = {
        dashboard: "Dashboard",
        fleet: "Fleet Management",
        batteries: "Battery Management",
        moves: "Container Moves",
        customers: "Customer Management",
        invoices: "Invoice Management",
        payments: "Payment Transactions",
        budgets: "Sector Budgets",
        finance: "Financial Overview"
    };

    document.getElementById("title").innerText = titles[page] || "SmartPort";

    if (page === "dashboard") loadDashboard();
    else if (page === "fleet") loadFleet();
    else if (page === "batteries") loadBatteries();
    else if (page === "moves") loadMoves();
    else if (page === "customers") loadCustomers();
    else if (page === "invoices") loadInvoices();
    else if (page === "payments") loadPayments();
    else if (page === "budgets") loadBudgets();
    else if (page === "finance") loadFinance();
}


// ===============================
// LOAD EVERYTHING
// ===============================

function loadAll() {
    loadDashboard();
    loadFleet();
    loadBatteries();
    loadMoves();
    loadCustomers();
    loadInvoices();
    loadPayments();
    loadBudgets();
    loadFinance();
}

// Start application
loadAll();