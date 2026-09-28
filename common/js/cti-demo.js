(function(){
    function icons(){ if(window.lucide) lucide.createIcons(); }

    let callSeconds = 0;
    let callTimer = null;
    let callConnected = false;
    let callMinimized = false;
    let activeCallId = null;
    let activeCallContext = null;

    const panel = document.createElement("div");
    panel.className = "cti-call-pop";
    panel.innerHTML = `
      <div class="cti-call-head">
        <div class="cti-call-avatar"><i data-lucide="phone"></i></div>
        <div class="cti-call-head-info">
          <div class="cti-call-number">12345</div>
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
            : null;

        if(v){
            customerBox.innerHTML = `
              <div>✓ Customer found: <strong>${escapeHtml(v.name || "Customer")}</strong></div>
              <div>Vendor ID: ${escapeHtml(v.id)}</div>
              <div>${escapeHtml(v.email || "")}</div>
              <div class="cti-associated-note">Associated with this call</div>
            `;
            ratingSubtitle.textContent = `Rating will be saved to Vendor ${v.id}`;
        } else {
            customerBox.innerHTML = `
              <div>⚠ Customer not found for <strong>${escapeHtml(activeCallContext.incomingNumber)}</strong></div>
              <div class="cti-unknown-note">This call will be saved as Unknown unless you associate a customer.</div>
            `;
            ratingSubtitle.textContent = "No customer associated — rating will be saved as Unknown";
        }
    }

    function startCall(){
        if(callConnected) return;

        callConnected = true;
        callSeconds = 0;
        timerEl.textContent = "00:00:00";

        const callerNumber = "12345";
        const vendor = findVendorForCaller(callerNumber);
        activeCallId = "CALL-" + Date.now();
        activeCallContext = {
            callId: activeCallId,
            incomingNumber: String(callerNumber),
            associatedVendorId: vendor ? String(vendor.id) : null,
            associatedPhone: vendor ? String(vendor.phone || "") : null,
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

        // Automatically search the incoming number. If no match exists,
        // the call remains Unknown until the agent uses Associate.
        if (typeof window.searchVendorByPhone === "function") {
            window.searchVendorByPhone(callerNumber, { openDetails: !!vendor });
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
    window.associateActiveCall = function(vendorId){
        const id = String(vendorId || "");
        const vendor = (window.VENDOR_DATA || {})[id];
        if(!vendor) return { ok:false, reason:"Vendor not found" };

        if(!activeCallContext){
            return { ok:false, reason:"No active call available" };
        }

        activeCallContext.associatedVendorId = id;
        activeCallContext.associatedPhone = String(vendor.phone || "");
        activeCallContext.associatedAt = new Date().toISOString();
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
                    associatedAt: activeCallContext.associatedAt
                };
            });
            if(changed){
                localStorage.setItem("shipglobal_call_ratings", JSON.stringify(updated));
                if(typeof window.refreshRatingPage === "function") window.refreshRatingPage();
            }
        } catch(_) {}

        return { ok:true, vendorId:id };
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
