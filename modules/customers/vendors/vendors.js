
window.VENDOR_DATA = {
    "12345": {
        id: "12345",
        name: "Rohit Kumar",
        initials: "RK",
        email: "Rohit.kumar1@shipglobal.in",
        phone: "8409767926",
        salesId: "N/A",
        kamId: "N/A",
        marginGroup: "F",
        balance: "INR 0",
        kyc: "KYC Pending",
        status: "Active",
        type: "Individual",
        source: "WEB",
        salesCount: "259",
        onboardingDate: "N/A",
        firstOrderDate: "N/A",
        lastOrderDate: "N/A"
    },
    "25159": {
        id: "25159",
        name: "Krantik Das",
        initials: "KD",
        email: "Krantik.das@shipglobal.in",
        phone: "9717687709",
        salesId: "259",
        kamId: "N/A",
        marginGroup: "F",
        balance: "INR 0",
        kyc: "KYC Pending",
        status: "Active",
        type: "Individual",
        source: "WEB",
        salesCount: "259",
        onboardingDate: "2024-12-11",
        firstOrderDate: "N/A",
        lastOrderDate: "N/A"
    }
};

try {
    const savedVendorData = localStorage.getItem("shipglobalVendorData");
    if (savedVendorData) Object.assign(VENDOR_DATA, JSON.parse(savedVendorData));
} catch (_) {}

window.openVendorsPage = function () {
    const dashboard = document.querySelector(".dashboard");
    const headerTitle = document.querySelector(".header-title");
    if (!dashboard) return;

    if (headerTitle) {
        headerTitle.innerHTML =
            'Customers <span class="breadcrumb-arrow">›</span> <b>Vendors</b>';
    }

    dashboard.innerHTML = `
        <div class="vendor-page">
            <section class="vendor-banner">
                <div class="vendor-banner-icon"><i data-lucide="circle-user-round"></i></div>
                <div class="vendor-banner-content">
                    <div class="vendor-kicker">CUSTOMERS · VENDORS</div>
                    <h2>All Vendors</h2>
                    <p>A single view of your vendor network and operations</p>
                </div>
            </section>

            <section class="vendor-search-card">
                <div class="vendor-find-icon"><i data-lucide="circle-user-round"></i></div>
                <h1>Find a Vendor</h1>
                <p>Search by Email address to quickly find the record you’re looking for.</p>

                <div class="vendor-search-row">
                    <div class="vendor-email-box">
                        <i data-lucide="search"></i>
                        <input id="vendorEmail" type="text"
                            placeholder="Enter Email . . ." autocomplete="off">
                    </div>
                    <button class="vendor-search-btn" id="vendorSearchBtn">Search</button>
                    <button class="vendor-reset-btn" id="vendorResetBtn">Reset</button>
                </div>
                <div id="vendorResult" class="vendor-result"></div>
            </section>

            <section id="vendorTableArea" class="vendor-table-card" style="display:none"></section>
        </div>
    `;

    lucide.createIcons();

    const input = document.getElementById("vendorEmail");
    const searchButton = document.getElementById("vendorSearchBtn");
    const resetButton = document.getElementById("vendorResetBtn");
    const tableArea = document.getElementById("vendorTableArea");
    const result = document.getElementById("vendorResult");

    function searchVendor() {
        const value = input.value.trim().toLowerCase();

        if (!value) {
            result.innerHTML = `<div class="vendor-message error">Please enter Vendor ID, Email address, Phone number or Vendor name.</div>`;
            tableArea.style.display = "none";
            return;
        }

        const vendor = Object.values(VENDOR_DATA).find(v =>
            v.id.toLowerCase() === value ||
            v.email.toLowerCase() === value ||
            v.phone.replace(/\D/g, "") === value.replace(/\D/g, "") ||
            v.name.toLowerCase().includes(value)
        );

        if (!vendor) {
            result.innerHTML = `<div class="vendor-message error">No vendor found for <strong>${escapeHtml(input.value.trim())}</strong>.</div>`;
            tableArea.style.display = "none";
            return;
        }

        result.innerHTML = "";
        tableArea.style.display = "block";
        tableArea.innerHTML = renderVendorTable(vendor);
        lucide.createIcons();

        bindVendorActionMenu(vendor.id);
        bindRowsPerPage();
    }

    searchButton.addEventListener("click", searchVendor);
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") searchVendor();
    });

    resetButton.addEventListener("click", () => {
        input.value = "";
        result.innerHTML = "";
        tableArea.innerHTML = "";
        tableArea.style.display = "none";
        input.focus();
    });
};


window.searchVendorByPhone = function(phone, options) {
    const dashboard = document.querySelector(".dashboard");
    if (!dashboard) return { found: false, reason: "Dashboard not available" };

    options = options || {};
    const clean = String(phone || "").replace(/\D/g, "");
    // Match the incoming value against the vendor phone number first.
    // If the dummy CTI sends a Vendor ID (for example 12345), support that too.
    const vendor = Object.values(VENDOR_DATA).find(v =>
        String(v.phone || "").replace(/\D/g, "") === clean ||
        String(v.id || "").replace(/\D/g, "") === clean
    );

    if (typeof window.openVendorsPage === "function") {
        window.openVendorsPage();
    }

    setTimeout(() => {
        const input = document.getElementById("vendorEmail");
        const button = document.getElementById("vendorSearchBtn");
        if (!input || !button) return;

        // Automatically put the incoming caller number into Find a Vendor.
        input.value = clean;
        button.click();

        // For the CTI flow, automatically open the matched vendor details.
        if (vendor && options.openDetails !== false) {
            setTimeout(() => {
                if (typeof window.openVendorOverview === "function") {
                    window.openVendorOverview(vendor.id);
                }
            }, 180);
        }
    }, 60);

    return vendor ? { found: true, vendorId: vendor.id } : { found: false };
};

function renderVendorTable(v) {
    return `
        <div class="vendor-view-button-row">
            <button class="view-button"><span>View</span><i data-lucide="sliders-horizontal"></i></button>
        </div>

        <div class="vendor-table-wrap">
            <table class="vendor-table">
                <thead>
                    <tr>
                        <th class="check-col"><input type="checkbox"></th>
                        <th>Vendor Details <span>↕</span></th>
                        <th>Vendor Overview</th>
                        <th>Monthly Sales <span>↕</span></th>
                        <th>Margin Group</th>
                        <th>KYC Status</th>
                        <th>Dates Overview <span>↕</span></th>
                        <th>Laps <span>↕</span></th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr id="vendorRow" class="clickable-vendor-row">
                        <td><input type="checkbox" onclick="event.stopPropagation()"></td>
                        <td>
                            <strong>Vendor ID: <span class="muted-blue">${escapeHtml(v.id)}</span></strong>
                            <div>${escapeHtml(v.name)}</div>
                        </td>
                        <td>
                            <strong>Source: <span class="muted-blue">${escapeHtml(v.source)}</span></strong>
                            <div>Sales Id: ${escapeHtml(v.salesCount)}</div>
                            <div>Type: ${escapeHtml(v.type)}</div>
                        </td>
                        <td></td>
                        <td>${escapeHtml(v.marginGroup)}</td>
                        <td>
                            KYC : <span class="na-pill">${escapeHtml(v.kyc === "KYC Pending" ? "NA" : v.kyc)}</span><br>
                            CSB V : <span class="na-pill">NA</span><br>
                            <span class="kyc-label">Completed On:</span> ${escapeHtml(v.onboardingDate)}
                        </td>
                        <td><span class="kyc-label">Date Added:</span> ${escapeHtml(v.onboardingDate)}</td>
                        <td></td>
                        <td class="actions">
                            <button class="action-menu-btn" type="button" aria-label="Actions" title="Actions">
                                <span>⋮</span>
                            </button>
                            <div class="action-menu" id="vendorActionMenu">
                                <button type="button" class="action-menu-item admin-login-option">Admin Login</button>
                                <button type="button" class="action-menu-item vendor-overview-option">Vendor Overview</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="vendor-table-footer">
            <span>0 of 1 row(s) selected.</span>
            <div class="pagination">
                <span>Rows per page</span>
                <div class="rows-page-select">
                    <button type="button" class="rows-page-btn" aria-expanded="false">20⌄</button>
                    <div class="rows-page-menu">
                        <button type="button" data-page-size="10">10</button>
                        <button type="button" data-page-size="20" class="selected">20 <span>✓</span></button>
                        <button type="button" data-page-size="100">100</button>
                    </div>
                </div>
                <span>Page 1</span>
                <button type="button">«</button><button type="button">‹</button><button type="button">›</button><button type="button">»</button>
            </div>
        </div>
    `;
}



function bindRowsPerPage() {
    const wrapper = document.querySelector(".rows-page-select");
    const button = document.querySelector(".rows-page-btn");
    const menu = document.querySelector(".rows-page-menu");
    if (!wrapper || !button || !menu) return;

    button.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = menu.classList.toggle("open");
        button.setAttribute("aria-expanded", String(open));
    });

    menu.querySelectorAll("button[data-page-size]").forEach(option => {
        option.addEventListener("click", (event) => {
            event.stopPropagation();
            const size = option.dataset.pageSize;
            button.textContent = size + "⌄";
            menu.querySelectorAll("button[data-page-size]").forEach(item => item.classList.remove("selected"));
            option.classList.add("selected");
            menu.classList.remove("open");
            button.setAttribute("aria-expanded", "false");
        });
    });

    if (window.__rowsPageClickHandler) {
        document.removeEventListener("click", window.__rowsPageClickHandler);
    }
    window.__rowsPageClickHandler = (event) => {
        if (!wrapper.contains(event.target)) {
            menu.classList.remove("open");
            button.setAttribute("aria-expanded", "false");
        }
    };
    document.addEventListener("click", window.__rowsPageClickHandler);
}

function bindVendorActionMenu(vendorId) {
    const button = document.querySelector(".action-menu-btn");
    const menu = document.querySelector("#vendorActionMenu");
    if (!button || !menu) return;

    button.addEventListener("click", (event) => {
        event.stopPropagation();
        document.querySelectorAll(".action-menu.open").forEach(m => {
            if (m !== menu) m.classList.remove("open");
        });
        menu.classList.toggle("open");
    });

    const overview = menu.querySelector(".vendor-overview-option");
    if (overview) {
        overview.addEventListener("click", (event) => {
            event.stopPropagation();
            menu.classList.remove("open");
            openVendorOverview(vendorId);
        });
    }

    const admin = menu.querySelector(".admin-login-option");
    if (admin) {
        admin.addEventListener("click", (event) => {
            event.stopPropagation();
            menu.classList.remove("open");
            alert("Admin Login selected for Vendor ID: " + vendorId);
        });
    }

    if (window.__vendorMenuClickHandler) {
        document.removeEventListener("click", window.__vendorMenuClickHandler);
    }
    window.__vendorMenuClickHandler = (event) => {
        if (!menu.contains(event.target) && !button.contains(event.target)) {
            menu.classList.remove("open");
        }
    };
    document.addEventListener("click", window.__vendorMenuClickHandler);
}

window.openVendorOverview = function(id) {
    const v = VENDOR_DATA[id];
    if (!v) return;

    const dashboard = document.querySelector(".dashboard");
    const headerTitle = document.querySelector(".header-title");

    if (headerTitle) {
        headerTitle.innerHTML = `
            <button class="header-associate-btn" type="button" title="Associate current call">
                <i data-lucide="link-2"></i><span>Associate</span>
            </button>
            <span class="header-breadcrumb-text">Edit Vendor <span class="breadcrumb-arrow">›</span> <b>Vendor Overview</b></span>`;
    }

    dashboard.innerHTML = `
        <div class="vendor-overview-page">
            <section class="vendor-profile-card">
                <div class="vendor-profile-head">
                    <div class="large-avatar">${escapeHtml(v.initials)}</div>
                    <div class="vendor-profile-title">
                        <div class="name-line">
                            <h2>${escapeHtml(v.name)}</h2>
                            <button class="edit-icon" type="button" title="Edit Vendor"><i data-lucide="square-pen"></i></button>
                        </div>
                        <div class="vendor-contact">
                            Vendor ID: ${escapeHtml(v.id)} |
                            <span>${escapeHtml(v.email)}</span> |
                            ${escapeHtml(v.phone)}
                        </div>
                        <div class="status-pills">
                            <span class="pill pending">${escapeHtml(v.kyc)}</span>
                            <span class="pill active">${escapeHtml(v.status)}</span>
                            <span class="pill gray">${escapeHtml(v.type)}</span>
                            <span class="pill blue">${escapeHtml(v.source)}</span>
                        </div>
                    </div>
                </div>

                <div class="profile-stats">
                    <div><label>Sales ID</label><strong>${escapeHtml(v.salesId)}</strong></div>
                    <div><label>KAM ID</label><strong>${escapeHtml(v.kamId)}</strong></div>
                    <div><label>Vendor Margin Group</label><strong>${escapeHtml(v.marginGroup)}</strong></div>
                    <div><label>Current Balance</label><strong class="balance">${escapeHtml(v.balance)}</strong></div>
                </div>
            </section>

            <nav class="vendor-tabs">
                ${["Vendor Overview","Profile Setting","Kyc Details","Addresses","Finance","Documents","Activity Logs"].map((x,i)=>
                    `<button class="${i===0?"selected":""}" data-tab="${i}">${x}</button>`).join("")}
                <button type="button" class="rating-tab" data-tab="rating">Rating</button>
            </nav>

            <div id="vendorTabContent">
                ${renderVendorOverviewContent(v)}
            </div>
        </div>
    `;

    lucide.createIcons();
    bindVendorProfileEdit(v.id);
    bindVendorAssociate(v.id);

    document.querySelectorAll(".vendor-tabs button").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".vendor-tabs button").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            const tab = Number(btn.dataset.tab);
            document.getElementById("vendorTabContent").innerHTML =
                tab === 0 ? renderVendorOverviewContent(v) :
                btn.textContent.trim().toLowerCase() === "rating" ? renderVendorRatingContent(v) :
                renderSimpleVendorTab(btn.textContent);
            lucide.createIcons();
            bindOverviewAccordions();
        });
    });

    bindOverviewAccordions();
};


function bindVendorAssociate(currentVendorId) {
    const button = document.querySelector(".header-associate-btn");
    if (!button) return;

    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openVendorAssociateModal(currentVendorId);
    });
}

function openVendorAssociateModal(currentVendorId) {
    document.querySelectorAll(".vendor-associate-modal-overlay").forEach(el => el.remove());

    const overlay = document.createElement("div");
    overlay.className = "vendor-associate-modal-overlay";
    overlay.innerHTML = `
        <div class="vendor-associate-modal" role="dialog" aria-modal="true">
            <div class="vendor-associate-modal-header">
                <div>
                    <h2>Associate Customer</h2>
                    <p>Search another vendor/customer and associate it with the current call.</p>
                </div>
                <button type="button" class="vendor-associate-close">×</button>
            </div>

            <div class="vendor-associate-search-row">
                <div class="vendor-associate-search-box">
                    <i data-lucide="search"></i>
                    <input id="associateVendorSearch" type="text"
                        placeholder="Search by Vendor ID, phone, email or name" autocomplete="off">
                </div>
                <button type="button" class="vendor-associate-search-btn">Search</button>
            </div>

            <div class="vendor-associate-current">
                <span>Current Vendor</span>
                <strong>${escapeHtml(currentVendorId)}</strong>
            </div>

            <div id="associateVendorResults" class="vendor-associate-results">
                <div class="vendor-associate-empty">Enter a customer/vendor detail to search.</div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons();

    const input = overlay.querySelector("#associateVendorSearch");
    const searchBtn = overlay.querySelector(".vendor-associate-search-btn");
    const results = overlay.querySelector("#associateVendorResults");

    const close = () => overlay.remove();
    overlay.querySelector(".vendor-associate-close").addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

    function doSearch() {
        const value = input.value.trim().toLowerCase();
        if (!value) {
            results.innerHTML = `<div class="vendor-associate-empty">Please enter Vendor ID, phone, email or customer name.</div>`;
            return;
        }

        const clean = value.replace(/\D/g, "");
        const matches = Object.values(VENDOR_DATA).filter(v =>
            String(v.id || "").toLowerCase() === value ||
            String(v.email || "").toLowerCase() === value ||
            String(v.name || "").toLowerCase().includes(value) ||
            (clean && String(v.phone || "").replace(/\D/g, "") === clean)
        );

        if (!matches.length) {
            results.innerHTML = `<div class="vendor-associate-empty">No customer/vendor found for <strong>${escapeHtml(input.value.trim())}</strong>.</div>`;
            return;
        }

        results.innerHTML = matches.map(v => `
            <div class="vendor-associate-result">
                <div class="vendor-associate-result-info">
                    <strong>${escapeHtml(v.name)}</strong>
                    <span>Vendor ID: ${escapeHtml(v.id)} · ${escapeHtml(v.phone)}</span>
                    <span>${escapeHtml(v.email)}</span>
                </div>
                <button type="button" class="vendor-associate-select" data-vendor-id="${escapeHtml(v.id)}">
                    Associate
                </button>
            </div>
        `).join("");

        results.querySelectorAll(".vendor-associate-select").forEach(select => {
            select.addEventListener("click", () => {
                const vendorId = select.getAttribute("data-vendor-id");
                const vendor = VENDOR_DATA[vendorId];
                if (!vendor) return;

                const response = typeof window.associateActiveCall === "function"
                    ? window.associateActiveCall(vendorId)
                    : { ok:false, reason:"Call association module is not loaded." };

                if (!response.ok) {
                    alert(response.reason || "No active call is available to associate.");
                    return;
                }

                close();
                openVendorOverview(vendorId);
            });
        });
    }

    searchBtn.addEventListener("click", doSearch);
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") doSearch();
    });
    setTimeout(() => input.focus(), 50);
}

function bindVendorProfileEdit(vendorId) {
    const editButton = document.querySelector(".vendor-profile-card .edit-icon");
    if (!editButton) return;

    editButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openVendorProfileModal(vendorId);
    });
}

function openVendorProfileModal(vendorId) {
    const v = VENDOR_DATA[vendorId];
    if (!v) return;

    document.querySelectorAll(".vendor-profile-modal-overlay").forEach(el => el.remove());

    const nameParts = String(v.name || "").trim().split(/\s+/);
    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");

    const overlay = document.createElement("div");
    overlay.className = "vendor-profile-modal-overlay";
    overlay.innerHTML = `
        <div class="vendor-profile-modal" role="dialog" aria-modal="true" aria-labelledby="updateVendorTitle">
            <div class="vendor-profile-modal-header">
                <h2 id="updateVendorTitle">Update Vendor Profile</h2>
                <button type="button" class="vendor-modal-close" aria-label="Close">×</button>
            </div>
            <form id="vendorProfileForm" class="vendor-profile-form">
                <div class="vendor-form-grid">
                    <label>
                        <span>First Name <em>*</em></span>
                        <input name="firstName" type="text" value="${escapeHtml(firstName)}" required>
                    </label>
                    <label>
                        <span>Last Name <em>*</em></span>
                        <input name="lastName" type="text" value="${escapeHtml(lastName)}" required>
                    </label>
                    <label>
                        <span>Email <em>*</em></span>
                        <input name="email" type="email" value="${escapeHtml(v.email)}" required>
                    </label>
                    <label>
                        <span>Mobile <em>*</em></span>
                        <input name="phone" type="tel" value="${escapeHtml(v.phone)}" required>
                    </label>
                    <label class="password-field">
                        <span>Password</span>
                        <div class="password-input-wrap">
                            <input name="password" type="password" placeholder="Enter new password">
                            <button type="button" class="password-toggle" aria-label="Show password"><i data-lucide="eye-off"></i></button>
                        </div>
                    </label>
                    <label class="password-field">
                        <span>Confirm Password</span>
                        <div class="password-input-wrap">
                            <input name="confirmPassword" type="password" placeholder="Confirm password">
                            <button type="button" class="password-toggle" aria-label="Show password"><i data-lucide="eye-off"></i></button>
                        </div>
                    </label>
                </div>
                <div class="vendor-modal-actions">
                    <button type="button" class="vendor-cancel-btn">Cancel</button>
                    <button type="submit" class="vendor-submit-btn">Submit</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons();

    const close = () => overlay.remove();
    overlay.querySelector(".vendor-modal-close").addEventListener("click", close);
    overlay.querySelector(".vendor-cancel-btn").addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

    overlay.querySelectorAll(".password-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            const input = toggle.parentElement.querySelector("input");
            const showing = input.type === "text";
            input.type = showing ? "password" : "text";
            toggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
            toggle.innerHTML = `<i data-lucide="${showing ? "eye-off" : "eye"}"></i>`;
            lucide.createIcons();
        });
    });

    const form = overlay.querySelector("#vendorProfileForm");
    form.addEventListener("submit", e => {
        e.preventDefault();
        const data = new FormData(form);
        const password = String(data.get("password") || "");
        const confirmPassword = String(data.get("confirmPassword") || "");

        if (password !== confirmPassword) {
            alert("Password and Confirm Password must match.");
            return;
        }

        const updatedName = `${String(data.get("firstName") || "").trim()} ${String(data.get("lastName") || "").trim()}`.trim();
        v.name = updatedName;
        v.initials = updatedName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
        v.email = String(data.get("email") || "").trim();
        v.phone = String(data.get("phone") || "").trim();

        try {
            localStorage.setItem("shipglobalVendorData", JSON.stringify(VENDOR_DATA));
        } catch (_) {}

        close();
        openVendorOverview(vendorId);
    });
}

function renderVendorOverviewContent(v) {
    return `
        <section class="date-overview-card">
            <div><label>Onboarding Date</label><strong>${escapeHtml(v.onboardingDate)}</strong></div>
            <div><label>First Order Date</label><strong>${escapeHtml(v.firstOrderDate)}</strong></div>
            <div><label>Last Order Date</label><strong>${escapeHtml(v.lastOrderDate)}</strong></div>
        </section>

        <section class="summary-section open">
            <button class="summary-header">
                <span class="summary-icon blue-bg"><i data-lucide="shopping-cart"></i></span>
                <span class="summary-title"><b>Orders Summary</b><small>Recent Vendor Order Activity</small></span>
                <i data-lucide="chevron-up" class="accordion-arrow"></i>
            </button>
            <div class="summary-body">
                <div class="order-stats">
                    <div><label>Total Orders</label><strong>0</strong></div>
                    <div><label>Dispute Order</label><strong>0</strong></div>
                    <div><label>Delivered</label><strong>0</strong></div>
                    <div><label>Cancelled</label><strong>0</strong></div>
                </div>
                <div class="orders-table-head">
                    <span>Order ID</span><span>Customer Details</span><span>Order Date</span>
                    <span>Package Details</span><span>Status</span><span>Last Mile Details</span><span>View Order</span>
                </div>
                <div class="empty-orders">
                    <div class="empty-icon"><i data-lucide="search-x"></i></div>
                    <h3>No data available</h3>
                    <p>No records to display at the moment.<br>Check back later or contact support if unexpected.</p>
                </div>
                <div class="view-all">View All Orders ↗</div>
            </div>
        </section>

        ${renderAccordion("Multibox Orders","Recent Multibox Order Activity","boxes","green-bg")}
        ${renderAccordion("Pickup Summary","Recent Pickup Request","truck","orange-bg")}
        ${renderAccordion("Manifest Summary","Recent Manifest Summary","file-text","red-bg")}
    `;
}

function renderAccordion(title,subtitle,icon,bg) {
    return `
        <section class="summary-section compact">
            <button class="summary-header">
                <span class="summary-icon ${bg}"><i data-lucide="${icon}"></i></span>
                <span class="summary-title"><b>${title}</b><small>${subtitle}</small></span>
                <i data-lucide="chevron-down" class="accordion-arrow"></i>
            </button>
            <div class="summary-body collapsed-body"></div>
        </section>
    `;
}

function bindOverviewAccordions() {
    document.querySelectorAll(".summary-section .summary-header").forEach(header => {
        header.onclick = () => {
            const section = header.closest(".summary-section");
            section.classList.toggle("open");
            const icon = header.querySelector(".accordion-arrow");
            if (icon) icon.setAttribute("data-lucide", section.classList.contains("open") ? "chevron-up" : "chevron-down");
            lucide.createIcons();
        };
    });
}


function getVendorRatingRecords(vendor) {
    const demo = [
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Good", reason:"", callDuration:"04:32", createdAt:"2026-09-25T10:10:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"06:18", createdAt:"2026-09-25T11:30:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Bad", reason:"Time consuming", callDuration:"08:42", createdAt:"2026-09-25T12:15:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Good", reason:"", callDuration:"03:51", createdAt:"2026-09-25T13:05:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"05:10", createdAt:"2026-09-25T14:20:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"04:05", createdAt:"2026-09-25T15:00:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Good", reason:"", callDuration:"07:22", createdAt:"2026-09-26T10:10:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"03:42", createdAt:"2026-09-26T11:45:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Good", reason:"", callDuration:"05:31", createdAt:"2026-09-26T13:15:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"04:20", createdAt:"2026-09-26T16:20:00"}
    ];

    let saved = [];
    try { saved = JSON.parse(localStorage.getItem("shipglobal_call_ratings") || "[]"); } catch (_) { saved = []; }

    const all = Array.isArray(saved) && saved.length ? saved : demo;
    const id = String(vendor.id || "").replace(/\D/g, "");
    const phone = String(vendor.phone || "").replace(/\D/g, "");

    return all.filter(r => {
        const rid = String(r.vendorId || "").replace(/\D/g, "");
        const rp = String(r.phone || "").replace(/\D/g, "");

        // Keep each vendor/contact completely isolated. A record belongs to
        // this Vendor Overview only when BOTH the Vendor ID and contact
        // number match the vendor currently being viewed. This prevents
        // ratings/calls from another number or another vendor from appearing
        // in this customer's history.
        return rid === id && rp === phone;
    });
}

function vendorRatingScore(value) {
    const x = String(value || "").toLowerCase();
    if (x.startsWith("bad")) return 1;
    if (x === "good") return 3;
    if (x === "better") return 5;
    return 0;
}

function vendorRatingBadge(value) {
    const text = escapeHtml(value || "-");
    const lower = String(value || "").toLowerCase();
    const cls = lower.startsWith("bad") ? "bad" : lower === "better" ? "better" : "good";
    return `<span class="vendor-rating-badge ${cls}">${text}</span>`;
}

function vendorMonthKey(value) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "Unknown";
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function vendorMonthLabel(key) {
    if (key === "Unknown") return key;
    const parts = key.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, 1).toLocaleString("en-IN", {month:"long", year:"numeric"});
}

function renderVendorRatingContent(v) {
    const records = getVendorRatingRecords(v);
    const scores = records.map(r => vendorRatingScore(r.rating)).filter(Boolean);
    const avg = scores.length ? scores.reduce((a,b) => a+b, 0) / scores.length : 0;
    const good = records.filter(r => String(r.rating).toLowerCase() === "good").length;
    const better = records.filter(r => String(r.rating).toLowerCase() === "better").length;
    const bad = records.filter(r => String(r.rating).toLowerCase().startsWith("bad")).length;

    const months = {};
    records.forEach(r => {
        const key = vendorMonthKey(r.createdAt || r.callEnd);
        if (!months[key]) months[key] = [];
        months[key].push(r);
    });

    const monthRows = Object.keys(months).sort().reverse().map(key => {
        const list = months[key];
        const monthScores = list.map(r => vendorRatingScore(r.rating)).filter(Boolean);
        const monthAvg = monthScores.length ? monthScores.reduce((a,b) => a+b, 0) / monthScores.length : 0;
        return `<tr>
            <td><strong>${escapeHtml(vendorMonthLabel(key))}</strong></td>
            <td>${list.length}</td>
            <td>${monthScores.length}</td>
            <td><strong>${monthScores.length ? monthAvg.toFixed(1) + " / 5" : "—"}</strong></td>
            <td>${list.filter(r => String(r.rating).toLowerCase() === "good").length}</td>
            <td>${list.filter(r => String(r.rating).toLowerCase() === "better").length}</td>
            <td>${list.filter(r => String(r.rating).toLowerCase().startsWith("bad")).length}</td>
        </tr>`;
    }).join("");

    const historyRows = records.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((r,i) => {
        const reason = r.reason || (String(r.rating).startsWith("Bad - ") ? String(r.rating).slice(6) : "-");
        return `<tr>
            <td>${records.length - i}</td>
            <td>${escapeHtml(new Date(r.createdAt).toLocaleString("en-IN", {day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"}))}</td>
            <td>${escapeHtml(r.callDuration || "-")}</td>
            <td>${escapeHtml(r.agent || "Rohit Kumar")}</td>
            <td>${vendorRatingBadge(r.rating)}</td>
            <td>${escapeHtml(reason)}</td>
        </tr>`;
    }).join("");

    return `
        <section class="vendor-rating-page">
            <div class="vendor-rating-title-row">
                <div>
                    <h3>Rating</h3>
                    <p>Rating history for Vendor ID <strong>${escapeHtml(v.id)}</strong> · Contact <strong>${escapeHtml(v.phone)}</strong> · Only this vendor/contact data is shown.</p>
                </div>
            </div>

            <div class="vendor-rating-summary">
                <div><span>Total Calls</span><strong>${records.length}</strong></div>
                <div><span>Average Rating</span><strong>${avg ? avg.toFixed(1) : "0.0"} / 5</strong></div>
                <div><span>Good</span><strong>${good}</strong></div>
                <div><span>Better</span><strong>${better}</strong></div>
                <div><span>Bad</span><strong>${bad}</strong></div>
            </div>

            <section class="vendor-rating-panel">
                <div class="vendor-rating-panel-head">
                    <div><strong>Monthly Performance</strong><span>Monthly call count and average rating for this vendor only.</span></div>
                </div>
                <div class="vendor-rating-table-wrap">
                    <table class="vendor-rating-table">
                        <thead><tr><th>Month</th><th>Total Calls</th><th>Rated Calls</th><th>Average Rating</th><th>Good</th><th>Better</th><th>Bad</th></tr></thead>
                        <tbody>${monthRows || '<tr><td colspan="7" class="vendor-rating-empty">No monthly call data available.</td></tr>'}</tbody>
                    </table>
                </div>
            </section>

            <section class="vendor-rating-panel">
                <div class="vendor-rating-panel-head">
                    <div><strong>Individual Call Ratings</strong><span>Every rating is stored separately for this vendor.</span></div>
                </div>
                <div class="vendor-rating-table-wrap">
                    <table class="vendor-rating-table">
                        <thead><tr><th>Call #</th><th>Date &amp; Time</th><th>Duration</th><th>Agent</th><th>Rating</th><th>Reason</th></tr></thead>
                        <tbody>${historyRows || '<tr><td colspan="6" class="vendor-rating-empty">No ratings saved yet.</td></tr>'}</tbody>
                    </table>
                </div>
            </section>
        </section>`;
}

function renderSimpleVendorTab(title) {
    return `
        <section class="simple-tab-card">
            <h3>${escapeHtml(title)}</h3>
            <p>This ${escapeHtml(title)} section is ready for frontend fields. Backend/database integration can be connected later.</p>
        </section>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
        .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
