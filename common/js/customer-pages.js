window.loadCustomerPage = function(page) {
    if (page === "vendors" && window.openVendorsPage) {
        window.openVendorsPage();
        return;
    }

    const dashboard = document.querySelector(".dashboard");
    const headerTitle = document.querySelector(".header-title");
    if (!dashboard) return;

    if (page === "kyc") {
        headerTitle.innerHTML = 'Customers <span class="breadcrumb-arrow">›</span> <b>KYC</b>';
        dashboard.innerHTML = `<div style="padding:40px"><h2>KYC</h2><p>KYC module is kept separate and can be built next.</p></div>`;
    }

    if (page === "franchise") {
        headerTitle.innerHTML = 'Customers <span class="breadcrumb-arrow">›</span> <b>Franchise Customers</b>';
        dashboard.innerHTML = `<div style="padding:40px"><h2>Franchise Customers</h2><p>Franchise Customers module is kept separate and can be built next.</p></div>`;
    }
};