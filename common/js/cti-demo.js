(function(){
    function icons(){ if(window.lucide) lucide.createIcons(); }

    let callSeconds = 0;
    let callTimer = null;
    let callConnected = false;
    let callMinimized = false;
    let activeCallId = null;
    let activeCallContext = null;
    let currentCallerNumber = "12345";
    let demoRunNumber = 1;
    let searchedVendorId = null;

    const panel = document.createElement("div");
    panel.className = "cti-call-pop";
    panel.innerHTML = `
      <div class="cti-call-head">
        <div class="cti-call-avatar"><i data-lucide="phone"></i></div>
        <div class="cti-call-head-info">
          <div class="cti-call-number" id="cti-call-number">12345</div>
          <div class="cti-call-campaign">Campaign: Inbound_918044789612</div>
        </div>
        <button class="cti-call-minimize" type="button" aria-label="Minimize call">−</button>
        <button class="cti-call-more" type="button">•••</button>
      </div>

      <div class="cti-call-body">
        <div class="cti-call-row">
          <div class="cti-call-title"><i data-lucide="phone-call"></i> Incoming Call</div>
          <div class="cti-call-timer" id="cti-call-timer">00:00:00</div>
        </div>

        <div class="cti-call-label">Call Description</div>
        <textarea class="cti-call-description" placeholder="Enter call description..."></textarea>

        <div class="cti-call-customer" id="cti-call-customer">
          <div class="cti-customer-status">Checking customer...</div>
        </div>

        <div class="cti-call-buttons">
          <button class="cti-call-accept" type="button">
            <i data-lucide="check"></i> Accept / Receive
          </button>
          <button class="cti-call-reject" type="button">
            <i data-lucide="x"></i> Reject
          </button>
        </div>
      </div>`;

    document.body.appendChild(panel);

    // Demo control: each click alternates Registered -> New Customer -> Registered -> New Customer.
    const nextCallBtn = document.createElement("button");
    nextCallBtn.type = "button";
    nextCallBtn.className = "cti-test-next-call";
    nextCallBtn.innerHTML = '<span>☎</span> Test Next Incoming Call';
    document.body.appendChild(nextCallBtn);

    // Small rating popup shown only after the call ends.
    const ratingPop = document.createElement("div");
    ratingPop.className = "cti-rating-pop";
    ratingPop.innerHTML = `
      <div class="cti-rating-head">
        <div>
          <div class="cti-rating-title">Rating</div>
          <div class="cti-rating-subtitle">Rate this customer interaction</div>
        </div>
        <button class="cti-rating-close" type="button" aria-label="Close rating">×</button>
      </div>
      <div class="cti-rating-options">
        <button class="cti-rating-option good" type="button" data-rating="Good">
          <span class="cti-rating-face">☺</span><span>Good</span>
        </button>
        <div class="cti-rating-bad-wrap">
          <button class="cti-rating-option bad" type="button">
            <span class="cti-rating-face">☹</span><span>Bad</span>
          </button>
          <div class="cti-rating-issues">
            <button type="button" data-rating="Bad - Abuse / Scam inquiry"><b>1</b> Abuse / Scam inquiry</button>
            <button type="button" data-rating="Bad - Provide"><b>2</b> Provide</button>
            <button type="button" data-rating="Bad - Time consuming"><b>3</b> Time consuming</button>
            <button type="button" data-rating="Bad - Stubborn"><b>4</b> Stubborn</button>
          </div>
        </div>
        <button class="cti-rating-option better" type="button" data-rating="Better">
          <span class="cti-rating-face">—</span><span>Better</span>
        </button>
      </div>
      <div class="cti-rating-saved">✓ Rating saved</div>
    `;
    document.body.appendChild(ratingPop);

    const timerEl = panel.querySelector("#cti-call-timer");
    const acceptBtn = panel.querySelector(".cti-call-accept");
    const rejectBtn = panel.querySelector(".cti-call-reject");
    const minimizeBtn = panel.querySelector(".cti-call-minimize");
    const ratingCloseBtn = ratingPop.querySelector(".cti-rating-close");
    const ratingSaved = ratingPop.querySelector(".cti-rating-saved");
    const ratingSubtitle = ratingPop.querySelector(".cti-rating-subtitle");
    const customerBox = panel.querySelector("#cti-call-customer");
    const callNumberEl = panel.querySelector("#cti-call-number");

    function formatTime(total){
        const h = String(Math.floor(total / 3600)).padStart(2, "0");
        const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
        const s = String(total % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    }

    function findVendorForCaller(callerNumber){
        const clean = String(callerNumber || "").replace(/\D/g, "");
        const list = Object.values(window.VENDOR_DATA || {});
        return list.find(v =>
            String(v.phone || "").replace(/\D/g, "") === clean ||
            String(v.id || "").replace(/\D/g, "") === clean
        ) || null;
    }

    function updateCustomerBox(){
        if(!customerBox || !activeCallContext) return;
        const v = activeCallContext.associatedVendorId
            ? (window.VENDOR_DATA || {})[activeCallContext.associatedVendorId]
            : (searchedVendorId ? (window.VENDOR_DATA || {})[String(searchedVendorId)] : null);

        if(v){
            const isAssociated = !!activeCallContext.associatedVendorId;
            customerBox.innerHTML = `
              <div>✓ Customer found: <strong>${escapeHtml(v.name || "Customer")}</strong></div>
              <div>Vendor ID: ${escapeHtml(v.id)}</div>
              <div>${escapeHtml(v.email || "")}</div>
              ${isAssociated
                ? '<div class="cti-associated-note">Associated with this call</div>'
                : '<button type="button" class="cti-pop-associate-btn"><i data-lucide="link"></i> Associate</button>'}
            `;
            ratingSubtitle.textContent = isAssociated
                ? `Rating will be saved to Vendor ${v.id}`
                : `Customer found — associate this call with Vendor ${v.id} if required`;

            if(!isAssociated){
                const associateBtn = customerBox.querySelector(".cti-pop-associate-btn");
                if(associateBtn){
                    associateBtn.addEventListener("click", function(){
                        openAssociateConfirmation(v);
                    });
                }
            }
        } else {
            customerBox.innerHTML = `
              <div>⚠ Customer not found for <strong>${escapeHtml(activeCallContext.incomingNumber)}</strong></div>
              <div class="cti-unknown-note">Search the customer using the search bar above. After a record is found, the Associate button will appear here.</div>
            `;
            ratingSubtitle.textContent = "No customer associated — search first, then associate if required";
        }
        icons();
    }

    function openAssociateConfirmation(vendor){
        document.querySelectorAll(".cti-associate-confirm-overlay").forEach(el => el.remove());

        const tickets = (window.VENDOR_TICKETS && window.VENDOR_TICKETS[String(vendor.id)]) || [];
        const ticket = tickets.length ? tickets[0] : null;

        const overlay = document.createElement("div");
        overlay.className = "cti-associate-confirm-overlay";
        overlay.innerHTML = `
          <div class="cti-associate-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="cti-associate-confirm-title">
            <div class="cti-associate-confirm-icon"><i data-lucide="link-2"></i></div>
            <h3 id="cti-associate-confirm-title">Are you sure you want to Associate?</h3>
            <p>Associate this incoming call with <strong>${escapeHtml(vendor.name || "Customer")}</strong>${ticket ? ` and ticket <strong>${escapeHtml(ticket.id)}</strong>` : ""}?</p>
            <div class="cti-associate-confirm-actions">
              <button type="button" class="cti-associate-cancel">Cancel</button>
              <button type="button" class="cti-associate-confirm">Yes, Associate</button>
            </div>
          </div>`;

        document.body.appendChild(overlay);
        icons();

        const close = () => overlay.remove();
        overlay.querySelector(".cti-associate-cancel").addEventListener("click", close);
        overlay.addEventListener("click", e => { if(e.target === overlay) close(); });

        overlay.querySelector(".cti-associate-confirm").addEventListener("click", function(){
            const response = typeof window.associateActiveCall === "function"
                ? window.associateActiveCall(vendor.id, ticket ? ticket.id : null)
                : {ok:false, reason:"Call association module is not loaded."};

            if(!response.ok){
                alert(response.reason || "No active call is available to associate.");
                return;
            }

            close();
            if(typeof window.openVendorOverview === "function") window.openVendorOverview(vendor.id);
            updateCustomerBox();
        });
    }

    function showCtiDataNotFoundPage(callerNumber){
        const dashboard = document.querySelector(".dashboard");
        const headerTitle = document.querySelector(".header-title");
        if(!dashboard) return;

        if(headerTitle){
            headerTitle.innerHTML = 'Incoming Call <span class="breadcrumb-arrow">›</span> <b>Customer Not Found</b>';
        }

        dashboard.innerHTML = `
          <div class="cti-not-found-page">
            <div class="cti-not-found-card">
              <div class="cti-not-found-icon"><i data-lucide="user-round-x"></i></div>
              <h2>Data not found</h2>
              <p>Customer data was not found for incoming number <strong>${escapeHtml(callerNumber)}</strong>.</p>
              <p class="cti-search-hint">Use the search bar in the top header to find an existing customer/vendor.</p>
            </div>
          </div>`;

        showIncomingCallSearch();
        icons();
    }

    function showIncomingCallSearch(){
        const searchWrap = document.querySelector(".header-search");
        if(!searchWrap) return;
        searchWrap.classList.add("cti-header-search-active");
        searchWrap.innerHTML = `
          <div class="cti-header-search-box">
            <i data-lucide="search"></i>
            <input id="cti-header-search-input" type="text"
                   placeholder="Search customer/vendor..."
                   autocomplete="off"
                   aria-label="Search customer or vendor">
            <button id="cti-header-search-btn" type="button">Search</button>
          </div>`;
        const input = searchWrap.querySelector("#cti-header-search-input");
        const btn = searchWrap.querySelector("#cti-header-search-btn");

        function runSearch(){
            const value = input.value.trim().toLowerCase();
            if(!value) return;

            const clean = value.replace(/\D/g, "");
            const matches = Object.values(window.VENDOR_DATA || {}).filter(v =>
                String(v.id || "").toLowerCase() === value ||
                String(v.email || "").toLowerCase() === value ||
                String(v.name || "").toLowerCase().includes(value) ||
                (clean && String(v.phone || "").replace(/\D/g, "") === clean)
            );

            if(!matches.length){
                searchedVendorId = null;
                updateCustomerBox();
                input.classList.add("cti-search-error");
                input.value = value;
                input.focus();
                return;
            }

            // Use the first exact/best match for this demo search.
            const vendor = matches[0];
            searchedVendorId = String(vendor.id);
            input.classList.remove("cti-search-error");

            if(typeof window.openVendorOverview === "function"){
                window.openVendorOverview(vendor.id);
            } else if(typeof window.searchVendorByPhone === "function"){
                window.searchVendorByPhone(vendor.phone || vendor.id, {openDetails:true});
            }

            updateCustomerBox();
        }

        btn.addEventListener("click", runSearch);
        input.addEventListener("keydown", e => {
            if(e.key === "Enter") runSearch();
        });
        lucide.createIcons();
        setTimeout(() => input.focus(), 40);
    }

    function restoreHeaderSearch(){
        const searchWrap = document.querySelector(".header-search");
        if(!searchWrap) return;
        searchWrap.classList.remove("cti-header-search-active");
        searchWrap.innerHTML = '<i data-lucide="search"></i>';
        searchWrap.title = "Search";
        icons();
    }

    function startCall(){
        if(callConnected) return;

        callConnected = true;
        callSeconds = 0;
        timerEl.textContent = "00:00:00";

        const callerNumber = String(currentCallerNumber);
        const vendor = findVendorForCaller(callerNumber);
        searchedVendorId = null;
        activeCallId = "CALL-" + Date.now();
        activeCallContext = {
            callId: activeCallId,
            incomingNumber: callerNumber,
            associatedVendorId: vendor ? String(vendor.id) : null,
            associatedPhone: vendor ? String(vendor.phone || "") : null,
            associatedTicketId: null,
            associatedAt: vendor ? new Date().toISOString() : null
        };
        updateCustomerBox();

        callTimer = setInterval(function(){
            callSeconds++;
            timerEl.textContent = formatTime(callSeconds);
        }, 1000);

        acceptBtn.innerHTML = '<i data-lucide="phone-call"></i> Call Connected';
        acceptBtn.classList.add("connected");
        rejectBtn.innerHTML = '<i data-lucide="phone-off"></i> End Call';
        icons();

        if(vendor){
            restoreHeaderSearch();
            if (typeof window.searchVendorByPhone === "function") {
                window.searchVendorByPhone(callerNumber, { openDetails: true });
            }
        } else {
            // Unknown/new customer: show Data Not Found on the main screen and expose Associate.
            showCtiDataNotFoundPage(callerNumber);
        }
    }

    function showRating(){
        ratingPop.classList.add("show");
        ratingSaved.classList.remove("show");
    }

    function saveRating(rating){
        const ctx = activeCallContext || {
            callId: "CALL-" + Date.now(),
            incomingNumber: "Unknown",
            associatedVendorId: null,
            associatedPhone: ""
        };
        const vendor = ctx.associatedVendorId
            ? ((window.VENDOR_DATA || {})[ctx.associatedVendorId] || {})
            : {};
        const isUnknown = !ctx.associatedVendorId;

        const record = {
            id: "RATING-" + Date.now(),
            callId: ctx.callId,
            incomingNumber: ctx.incomingNumber,
            phone: isUnknown ? ctx.incomingNumber : (vendor.phone || ctx.associatedPhone || ""),
            vendorId: isUnknown ? null : String(vendor.id || ctx.associatedVendorId),
            customer: isUnknown ? "Unknown" : (vendor.name || "Customer"),
            customerStatus: isUnknown ? "Unknown" : "Associated",
            ticketId: isUnknown ? null : (ctx.associatedTicketId || null),
            agent: "Rohit Kumar",
            rating: rating,
            ratingScore: String(rating).startsWith("Bad - ") ? 1 :
                         rating === "Good" ? 3 :
                         rating === "Better" ? 5 : 0,
            reason: String(rating).startsWith("Bad - ") ? String(rating).slice(6) : "",
            callDuration: formatTime(callSeconds),
            createdAt: new Date().toISOString()
        };

        const ratings = JSON.parse(localStorage.getItem("shipglobal_call_ratings") || "[]");
        ratings.push(record);
        localStorage.setItem("shipglobal_call_ratings", JSON.stringify(ratings));

        if (typeof window.refreshRatingPage === "function") {
            window.refreshRatingPage();
        }

        ratingSaved.textContent = isUnknown
            ? "✓ " + rating + " saved under Unknown"
            : "✓ " + rating + " saved for Vendor " + vendor.id;
        ratingSaved.classList.add("show");
        setTimeout(function(){ ratingPop.classList.remove("show"); }, 900);
    }

    // Associate the current/last call with a vendor. If the rating was already
    // saved for this call, move that rating to the associated vendor as well.
    window.associateActiveCall = function(vendorId, ticketId){
        const id = String(vendorId || "");
        const vendor = (window.VENDOR_DATA || {})[id];
        if(!vendor) return { ok:false, reason:"Vendor not found" };

        if(!activeCallContext){
            return { ok:false, reason:"No active call available" };
        }

        activeCallContext.associatedVendorId = id;
        activeCallContext.associatedPhone = String(vendor.phone || "");
        activeCallContext.associatedTicketId = ticketId ? String(ticketId) : null;
        activeCallContext.associatedAt = new Date().toISOString();
        searchedVendorId = id;
        restoreHeaderSearch();
        updateCustomerBox();

        try {
            const ratings = JSON.parse(localStorage.getItem("shipglobal_call_ratings") || "[]");
            let changed = false;
            const updated = ratings.map(r => {
                if(String(r.callId || "") !== String(activeCallContext.callId || "")) return r;
                changed = true;
                return {
                    ...r,
                    incomingNumber: activeCallContext.incomingNumber,
                    vendorId: id,
                    phone: String(vendor.phone || ""),
                    customer: vendor.name || "Customer",
                    customerStatus: "Associated",
                    ticketId: activeCallContext.associatedTicketId || null,
                    associatedAt: activeCallContext.associatedAt
                };
            });
            if(changed){
                localStorage.setItem("shipglobal_call_ratings", JSON.stringify(updated));
                if(typeof window.refreshRatingPage === "function") window.refreshRatingPage();
            }
        } catch(_) {}

        return { ok:true, vendorId:id, ticketId: activeCallContext.associatedTicketId || null };
    };

    function endCall(){
        if(callTimer){
            clearInterval(callTimer);
            callTimer = null;
        }

        // Reject or End Call: remove the CTI pop-up and immediately show
        // the small rating pop-up.
        panel.style.display = "none";
        showRating();

        callConnected = false;
        acceptBtn.innerHTML = '<i data-lucide="check"></i> Accept / Receive';
        acceptBtn.classList.remove("connected");
        rejectBtn.innerHTML = '<i data-lucide="x"></i> Reject';
        timerEl.textContent = "00:00:00";
        icons();
    }

    function resetForNextIncomingCall(){
        if(callTimer){ clearInterval(callTimer); callTimer = null; }
        callConnected = false;
        callSeconds = 0;
        activeCallId = null;
        activeCallContext = null;
        ratingPop.classList.remove("show");
        callMinimized = false;
        panel.classList.remove("cti-minimized");
        minimizeBtn.textContent = "−";
        acceptBtn.innerHTML = '<i data-lucide="check"></i> Accept / Receive';
        acceptBtn.classList.remove("connected");
        rejectBtn.innerHTML = '<i data-lucide="x"></i> Reject';
        timerEl.textContent = "00:00:00";
        panel.style.display = "block";
        icons();
    }

    function prepareDemoRun(runNumber){
        demoRunNumber = runNumber;
        // Odd runs are registered; even runs are new/unknown customers.
        if(runNumber % 2 === 1){
            currentCallerNumber = runNumber === 1 ? "12345" : "25159";
        } else {
            currentCallerNumber = runNumber === 2 ? "9876543210" : "9876543222";
        }
        if(callNumberEl) callNumberEl.textContent = currentCallerNumber;
        panel.style.display = "block";
        if(typeof window.showCtiDemoRunHint === "function") window.showCtiDemoRunHint(runNumber, currentCallerNumber);
        icons();
    }

    nextCallBtn.addEventListener("click", function(){
        resetForNextIncomingCall();
        prepareDemoRun(demoRunNumber + 1);
    });

    prepareDemoRun(1);

    minimizeBtn.addEventListener("click", function(){
        callMinimized = !callMinimized;
        panel.classList.toggle("cti-minimized", callMinimized);
        minimizeBtn.textContent = callMinimized ? "+" : "−";
        minimizeBtn.setAttribute("aria-label", callMinimized ? "Expand call" : "Minimize call");
    });

    panel.querySelector(".cti-call-head").addEventListener("dblclick", function(){
        callMinimized = !callMinimized;
        panel.classList.toggle("cti-minimized", callMinimized);
        minimizeBtn.textContent = callMinimized ? "+" : "−";
    });

    acceptBtn.addEventListener("click", startCall);
    rejectBtn.addEventListener("click", endCall);

    ratingCloseBtn.addEventListener("click", function(){
        ratingPop.classList.remove("show");
        panel.style.display = "block";
        callMinimized = false;
        panel.classList.remove("cti-minimized");
        minimizeBtn.textContent = "−";
    });

    ratingPop.querySelectorAll("[data-rating]").forEach(function(btn){
        btn.addEventListener("click", function(){
            saveRating(btn.getAttribute("data-rating"));
        });
    });
})();
