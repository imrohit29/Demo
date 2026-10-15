(function(){
    function icons(){ if(window.lucide) lucide.createIcons(); }

    const DEMO_RATINGS = [
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Good", reason:"", callDuration:"04:32", createdAt:"2026-09-25T10:10:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"06:18", createdAt:"2026-09-25T11:30:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Bad", reason:"Time consuming", callDuration:"08:42", createdAt:"2026-09-25T12:15:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Good", reason:"", callDuration:"03:51", createdAt:"2026-09-25T13:05:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"05:10", createdAt:"2026-09-25T14:20:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"04:05", createdAt:"2026-09-25T15:00:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Good", reason:"", callDuration:"07:22", createdAt:"2026-09-26T10:10:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"03:42", createdAt:"2026-09-26T11:45:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Good", reason:"", callDuration:"05:31", createdAt:"2026-09-26T13:15:00"},
        {phone:"8409767926", vendorId:"12345", customer:"Rohit Kumar", agent:"Rohit Kumar", rating:"Better", reason:"", callDuration:"04:20", createdAt:"2026-09-26T16:20:00"},
        {phone:"9876543210", vendorId:"12346", customer:"Amit Sharma", agent:"Priyank", rating:"Better", reason:"", callDuration:"04:20", createdAt:"2026-09-25T10:25:00"},
        {phone:"9876543210", vendorId:"12346", customer:"Amit Sharma", agent:"Priyank", rating:"Good", reason:"", callDuration:"03:45", createdAt:"2026-09-25T12:05:00"},
        {phone:"9876543210", vendorId:"12346", customer:"Amit Sharma", agent:"Priyank", rating:"Better", reason:"", callDuration:"05:20", createdAt:"2026-09-25T13:40:00"},
        {phone:"9876543210", vendorId:"12346", customer:"Amit Sharma", agent:"Priyank", rating:"Good", reason:"", callDuration:"04:10", createdAt:"2026-09-25T15:15:00"},
        {phone:"9123456780", vendorId:"12347", customer:"Neha Singh", agent:"Vikas", rating:"Bad", reason:"Stubborn", callDuration:"07:10", createdAt:"2026-09-25T14:30:00"},
        {phone:"9123456780", vendorId:"12347", customer:"Neha Singh", agent:"Vikas", rating:"Bad", reason:"Provide", callDuration:"06:25", createdAt:"2026-09-25T16:00:00"},
        {phone:"9123456780", vendorId:"12347", customer:"Neha Singh", agent:"Vikas", rating:"Better", reason:"", callDuration:"04:50", createdAt:"2026-09-26T11:20:00"},
        {phone:"9123456780", vendorId:"12347", customer:"Neha Singh", agent:"Vikas", rating:"Good", reason:"", callDuration:"05:05", createdAt:"2026-09-26T12:40:00"},
        {phone:"9123456780", vendorId:"12347", customer:"Neha Singh", agent:"Vikas", rating:"Bad", reason:"Abuse / Scam inquiry", callDuration:"08:05", createdAt:"2026-09-26T14:10:00"},
        {phone:"9123456780", vendorId:"12347", customer:"Neha Singh", agent:"Vikas", rating:"Good", reason:"", callDuration:"03:55", createdAt:"2026-09-26T15:30:00"},
        {phone:"9123456780", vendorId:"12347", customer:"Neha Singh", agent:"Vikas", rating:"Bad", reason:"Time consuming", callDuration:"07:45", createdAt:"2026-09-26T16:40:00"}
    ];

    function getRatings(){
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem("shipglobal_call_ratings") || "[]");
        } catch(e) {
            saved = [];
        }

        // The Rating section uses exactly the records saved from the
        // Good / Better / Bad popup. Demo records are shown only when
        // no real rating has been saved yet.
        return Array.isArray(saved) && saved.length ? saved : DEMO_RATINGS;
    }

    function ratingScore(r){
        const x = String(r || "").toLowerCase();
        if(x.startsWith("bad")) return 1;
        if(x === "good") return 3;
        if(x === "better") return 5;
        return 0;
    }

    function esc(v){
        return String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function formatDate(value){
        const d = new Date(value);
        if(isNaN(d.getTime())) return value || "-";
        return d.toLocaleString("en-IN", {day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"});
    }

    function getGroups(ratings){
        const map = {};
        ratings.forEach(r => {
            const phone = String(r.phone || "").replace(/\D/g,"");
            if(!phone) return;
            if(!map[phone]) map[phone] = [];
            map[phone].push(r);
        });
        return Object.entries(map).map(([phone, items]) => {
            const scores = items.map(x=>ratingScore(x.rating)).filter(Boolean);
            const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
            const last = items.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];
            return {
                phone,
                vendorId: last.vendorId || "-",
                customer: last.customer || "Customer",
                calls: items.length,
                avg,
                last
            };
        }).sort((a,b)=>a.phone.localeCompare(b.phone));
    }

    function badge(rating){
        const text = String(rating || "-");
        let cls = text.toLowerCase().startsWith("bad") ? "rating-badge bad" :
                  text.toLowerCase()==="better" ? "rating-badge better" : "rating-badge good";
        return `<span class="${cls}">${esc(text)}</span>`;
    }

    function renderPage(){
        const dashboard = document.querySelector(".dashboard");
        const headerTitle = document.querySelector(".header-title");
        if(!dashboard) return;
        if(headerTitle) headerTitle.innerHTML = 'Rating';

        dashboard.innerHTML = `
        <div class="rating-page">
            <div class="rating-summary-grid rating-summary-grid-4">
                <div class="rating-summary-card">
                    <span>Total Customers Rated</span>
                    <strong id="ratingSummaryCustomers">0</strong>
                </div>
                <div class="rating-summary-card">
                    <span>Total Calls</span>
                    <strong id="ratingSummaryCalls">0</strong>
                </div>
                <div class="rating-summary-card">
                    <span>Rated Calls</span>
                    <strong id="ratingSummaryRatedCalls">0</strong>
                </div>
                <div class="rating-summary-card">
                    <span>Overall Average Rating</span>
                    <strong id="ratingSummaryAverage">0.0 / 5</strong>
                </div>
            </div>

            <div class="rating-search-card">
                <div class="rating-search-title">Find Customer</div>
                <div class="rating-search-row">
                    <label class="rating-search-input">
                        <i data-lucide="search"></i>
                        <input id="ratingSearchInput" type="text" inputmode="numeric" placeholder="Enter contact number e.g. 8409767926">
                    </label>
                    <button id="ratingSearchBtn" class="rating-search-btn" type="button">Search</button>
                    <button id="ratingDemoBtn" class="rating-demo-btn" type="button">Demo Customer</button>
                    <button id="ratingUnknownBtn" class="rating-unknown-btn" type="button">Unknown Customers</button>
                </div>
            </div>

            <div id="ratingSavedCard" class="rating-saved-card">
                <div>
                    <strong>Saved Customer Ratings</strong>
                    <span>Every rating selected after a call is stored here against the customer's contact number.</span>
                </div>
                <span class="rating-storage-status">Local storage active</span>
            </div>

            <div id="ratingMessage" class="rating-message" style="display:none"></div>

            <div class="rating-table-card">
                <div class="rating-table-wrap">
                    <table class="rating-table">
                        <thead>
                            <tr>
                                <th>Contact Number</th>
                                <th>Vendor ID</th>
                                <th>Total Calls</th>
                                <th>Average Rating</th>
                                <th>Last Rating</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="ratingCustomerRows"></tbody>
                    </table>
                </div>
            </div>

            <div class="rating-monthly-card">
                <div class="rating-section-heading">
                    <div>
                        <strong>Monthly Call Summary</strong>
                        <span>Call count and average rating month by month.</span>
                    </div>
                </div>
                <div class="rating-table-wrap">
                    <table class="rating-table rating-monthly-table">
                        <thead>
                            <tr><th>Month</th><th>Total Calls</th><th>Rated Calls</th><th>Average Rating</th></tr>
                        </thead>
                        <tbody id="ratingMonthlyRows"></tbody>
                    </table>
                </div>
            </div>
        </div>`;

        icons();
        updateSummary();
        renderCustomers();

        const searchBtn = document.getElementById("ratingSearchBtn");
        const searchInput = document.getElementById("ratingSearchInput");
        const demoBtn = document.getElementById("ratingDemoBtn");
        const unknownBtn = document.getElementById("ratingUnknownBtn");

        if(searchBtn) searchBtn.addEventListener("click", () => {
            renderCustomers(searchInput ? searchInput.value : "");
        });
        if(searchInput) searchInput.addEventListener("keydown", e => {
            if(e.key === "Enter") renderCustomers(e.target.value);
        });
        if(demoBtn) demoBtn.addEventListener("click", () => {
            if(searchInput) searchInput.value = "8409767926";
            renderCustomers("8409767926");
        });
        if(unknownBtn) unknownBtn.addEventListener("click", () => {
            if(searchInput) searchInput.value = "";
            renderCustomers("", { unknownOnly: true });
        });
    }

    function updateSavedCard(){
        const card = document.getElementById("ratingSavedCard");
        if(!card) return;

        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem("shipglobal_call_ratings") || "[]");
        } catch(e) {}

        if(!Array.isArray(saved) || !saved.length){
            card.querySelector("strong").textContent = "Saved Customer Ratings";
            card.querySelector("span").textContent =
                "Every rating selected after a call is stored here against the customer's contact number.";
            return;
        }

        const last = saved[saved.length - 1];
        card.querySelector("strong").textContent =
            `Last saved: ${last.customer || "Customer"} — ${last.rating || "-"}`;
        card.querySelector("span").textContent =
            `${last.phone || "-"} | Vendor ID: ${last.vendorId || "-"} | ${last.callDuration || "00:00:00"} | ${formatDate(last.createdAt)}`;
    }

    function updateSummary(){
        const ratings = getRatings();
        const groups = getGroups(ratings);
        const scores = ratings.map(r => ratingScore(r.rating)).filter(Boolean);
        const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0;

        const customers = document.getElementById("ratingSummaryCustomers");
        const calls = document.getElementById("ratingSummaryCalls");
        const average = document.getElementById("ratingSummaryAverage");

        if(customers) customers.textContent = groups.length;
        if(calls) calls.textContent = ratings.length;
        const ratedCalls = document.getElementById("ratingSummaryRatedCalls");
        if(ratedCalls) ratedCalls.textContent = scores.length;
        if(average) average.textContent = avg.toFixed(1) + " / 5";
        renderMonthlySummary(ratings);
        updateSavedCard();
    }

    function monthKey(value){
        const d = new Date(value);
        if(isNaN(d.getTime())) return "Unknown";
        return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
    }

    function monthLabel(key){
        if(key === "Unknown") return key;
        const parts = key.split("-");
        return new Date(Number(parts[0]), Number(parts[1])-1, 1)
            .toLocaleString("en-IN", {month:"long", year:"numeric"});
    }

    function renderMonthlySummary(ratings){
        const body = document.getElementById("ratingMonthlyRows");
        if(!body) return;

        const months = {};
        ratings.forEach(r => {
            const key = monthKey(r.createdAt || r.callEnd);
            if(!months[key]) months[key] = [];
            months[key].push(r);
        });

        const keys = Object.keys(months).sort().reverse();
        if(!keys.length){
            body.innerHTML = '<tr><td colspan="4" class="rating-empty">No call records found.</td></tr>';
            return;
        }

        body.innerHTML = keys.map(key => {
            const list = months[key];
            const scores = list.map(r => ratingScore(r.rating)).filter(Boolean);
            const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0;
            return `<tr>
                <td><strong>${esc(monthLabel(key))}</strong></td>
                <td>${list.length}</td>
                <td>${scores.length}</td>
                <td>${scores.length ? avg.toFixed(1) + " / 5" : "—"}</td>
            </tr>`;
        }).join("");
    }

    function renderCustomers(search, options){
        const rows = document.getElementById("ratingCustomerRows");
        const message = document.getElementById("ratingMessage");
        if(!rows) return;

        const groups = getGroups(getRatings());
        const q = String(search || "").replace(/\D/g,"");
        const unknownOnly = !!(options && options.unknownOnly);
        const filtered = unknownOnly
            ? groups.filter(g => !g.vendorId || g.vendorId === "-")
            : (q ? groups.filter(g => g.phone.includes(q)) : groups);

        if(!filtered.length){
            rows.innerHTML = `<tr><td colspan="6" class="rating-empty">${unknownOnly ? "No Unknown customer ratings have been saved yet." : `No rating records found for <strong>${esc(search || "")}</strong>.`}</td></tr>`;
            if(message) message.style.display = unknownOnly ? "block" : "none";
            return;
        }

        if(unknownOnly){
            const message = document.getElementById("ratingMessage");
            if(message){
                message.textContent = "Showing only customers whose incoming number was not matched to an existing account. Their name is saved as Unknown until they are associated.";
                message.style.display = "block";
            }
        } else {
            const message = document.getElementById("ratingMessage");
            if(message) message.style.display = "none";
        }

        rows.innerHTML = filtered.map((g,i) => `
            <tr class="rating-customer-row" data-phone="${esc(g.phone)}">
                <td>${esc(g.phone)}</td>
                <td>${esc((!g.vendorId || g.vendorId === "-") ? "Unknown" : g.vendorId)}</td>
                <td>${g.calls}</td>
                <td><strong class="average-number">${g.avg.toFixed(1)}</strong> / 5</td>
                <td>${badge(g.last.rating)}</td>
                <td><button class="rating-view-btn" type="button" data-phone="${esc(g.phone)}">View Details →</button></td>
            </tr>`).join("");

        rows.querySelectorAll(".rating-customer-row").forEach(row => {
            row.addEventListener("click", e => {
                if(!e.target.closest("button")) openDetails(row.dataset.phone);
            });
        });
        rows.querySelectorAll(".rating-view-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                openDetails(btn.dataset.phone);
            });
        });
    }

    function buildCustomerMonthly(ratings){
        const months = {};
        ratings.forEach(r => {
            const key = monthKey(r.createdAt || r.callEnd);
            if(!months[key]) months[key] = {calls:0, rated:0};
            months[key].calls++;
            if(ratingScore(r.rating)) months[key].rated++;
        });
        const keys = Object.keys(months).sort().reverse();
        if(!keys.length) return '<div class="customer-month-empty">No monthly data.</div>';
        return keys.map(key => `
            <div class="customer-month-card">
                <span>${esc(monthLabel(key))}</span>
                <strong>${months[key].calls}</strong>
                <small>calls · ${months[key].rated} rated</small>
            </div>`).join("");
    }

    function openDetails(phone){
        const ratings = getRatings().filter(r => String(r.phone || "").replace(/\D/g,"") === phone);
        if(!ratings.length) return;
        const first = ratings[0];
        const scores = ratings.map(r=>ratingScore(r.rating)).filter(Boolean);
        const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0;

        const overlay = document.createElement("div");
        overlay.className = "rating-details-overlay";
        overlay.innerHTML = `
        <div class="rating-details-modal">
            <div class="rating-details-header">
                <div>
                    <h2>Customer Rating Details</h2>
                    <p>Contact Number: <strong>${esc(phone)}</strong> &nbsp; | &nbsp; Vendor ID: <strong>${esc(first.vendorId || "-")}</strong></p>
                </div>
                <button class="rating-details-close">×</button>
            </div>
            <div class="rating-detail-summary">
                <div><span>Total Calls</span><strong>${ratings.length}</strong></div>
                <div><span>Average Rating</span><strong>${avg.toFixed(1)} / 5</strong></div>
                <div><span>Customer</span><strong>${esc(first.customer || "Customer")}</strong></div>
            </div>
            <div class="rating-customer-monthly">
                <h3>Monthly Call Count</h3>
                <div class="rating-customer-monthly-grid">
                    ${buildCustomerMonthly(ratings)}
                </div>
            </div>
            <div class="rating-history-wrap">
            <table class="rating-history-table">
                <thead><tr><th>Call</th><th>Date / Time</th><th>Duration</th><th>Agent</th><th>Rating Given</th><th>Reason</th></tr></thead>
                <tbody>
                ${ratings.slice().sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).map((r,i)=>`
                    <tr>
                        <td>${i+1}</td>
                        <td>${esc(formatDate(r.createdAt))}</td>
                        <td>${esc(r.callDuration || "-")}</td>
                        <td>${esc(r.agent || "Rohit Kumar")}</td>
                        <td>${badge(r.rating)}</td>
                        <td>${esc(r.reason || (String(r.rating).startsWith("Bad - ") ? String(r.rating).slice(6) : "-"))}</td>
                    </tr>`).join("")}
                </tbody>
            </table></div>
        </div>`;

        document.body.appendChild(overlay);
        overlay.querySelector(".rating-details-close").addEventListener("click", ()=>overlay.remove());
        overlay.addEventListener("click", e=>{ if(e.target===overlay) overlay.remove(); });
    }

    window.refreshRatingPage = function(){
        if(document.querySelector(".rating-page")){
            updateSummary();
            renderCustomers();
        }
    };

    window.openRatingPage = renderPage;
})();
