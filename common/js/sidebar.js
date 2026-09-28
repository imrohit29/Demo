const sidebar=document.getElementById("sidebar-content");

sidebar.innerHTML=`
<div class="sidebar-inner">
<div class="sidebar-logo"><img src="assets/logo/shipglobal-logo.png" alt="ShipGlobal.in"></div>
<div class="sidebar-menu">

<div class="menu-item" data-page="dashboard"><i data-lucide="layout-grid" class="menu-icon"></i><span class="menu-text">Dashboard</span></div>
<div class="menu-item" data-page="operations"><i data-lucide="archive" class="menu-icon"></i><span class="menu-text">Operations</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>
<div class="menu-item" data-page="orders"><i data-lucide="shopping-cart" class="menu-icon"></i><span class="menu-text">Orders</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>

<div class="menu-item customer-parent" id="customerParent">
<i data-lucide="users-round" class="menu-icon"></i><span class="menu-text">Customers</span>
<i data-lucide="chevron-down" class="menu-arrow customer-arrow"></i>
</div>

<div class="customer-submenu open" id="customerSubmenu">
<div class="submenu-item" data-customer-page="kyc"><i data-lucide="user-round-check"></i><span>KYC</span><i data-lucide="chevron-right" class="submenu-arrow"></i></div>
<div class="submenu-item active-submenu" data-customer-page="vendors"><i data-lucide="users"></i><span>Vendors</span></div>
<div class="submenu-item" data-customer-page="franchise"><i data-lucide="briefcase-business"></i><span>Franchise Customers</span></div>
</div>

<div class="menu-item" data-page="wallet"><i data-lucide="credit-card" class="menu-icon"></i><span class="menu-text">Wallet</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>
<div class="menu-item" data-page="manifest"><i data-lucide="file-text" class="menu-icon"></i><span class="menu-text">Manifest</span></div>
<div class="menu-item" data-page="pickup"><i data-lucide="truck" class="menu-icon"></i><span class="menu-text">Pickup</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>
<div class="menu-item" data-page="modules"><i data-lucide="layers" class="menu-icon"></i><span class="menu-text">Modules</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>
<div class="menu-item" data-page="kam-sales"><i data-lucide="handshake" class="menu-icon"></i><span class="menu-text">KAM &amp; Sales</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>
<div class="menu-item" data-page="tracking"><i data-lucide="send" class="menu-icon"></i><span class="menu-text">Tracking</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>
<div class="menu-item" data-page="tech"><i data-lucide="database" class="menu-icon"></i><span class="menu-text">Tech</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>
<div class="menu-item" data-page="reports"><i data-lucide="bar-chart-3" class="menu-icon"></i><span class="menu-text">Reports</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>
<div class="menu-item" data-page="settings"><i data-lucide="files" class="menu-icon"></i><span class="menu-text">Settings</span><i data-lucide="chevron-right" class="menu-arrow"></i></div>
<div class="menu-item" data-page="rating"><i data-lucide="star" class="menu-icon"></i><span class="menu-text">Rating</span></div>
</div>

<div class="sidebar-bottom">
<div class="dark-mode-button" id="darkModeButton"><i data-lucide="moon"></i><span class="menu-text">Dark mode</span></div>
<div class="profile-wrap">
<div class="profile-box" id="profileBox"><div class="profile-avatar">RK</div><div class="profile-info"><div class="profile-name">Rohit Kumar</div><div class="profile-email">Rohit.kumar1@shipglobal.in</div></div><i data-lucide="chevrons-up-down"></i></div>
<div class="profile-popover" id="profilePopover">
  <div class="popover-user"><div class="popover-avatar">RK</div><div><div class="popover-name">Rohit Kumar</div><div class="popover-email">Rohit.kumar1@shipglobal.in</div></div></div>
  <div class="popover-logout" id="profileLogout"><i data-lucide="log-out"></i><span>Log out</span></div>
</div>
</div>
</div>
</div>`;

function refreshIcons(){ if(window.lucide) lucide.createIcons(); }
setTimeout(refreshIcons,0);

const customerParent=document.getElementById("customerParent");
const customerSubmenu=document.getElementById("customerSubmenu");

customerParent.addEventListener("click",()=>{
 const open=customerSubmenu.classList.toggle("open");
 customerParent.classList.toggle("customer-open",open);
 const arrow=customerParent.querySelector(".customer-arrow");
 if(arrow) arrow.setAttribute("data-lucide",open?"chevron-down":"chevron-right");
 refreshIcons();
});

document.querySelectorAll(".submenu-item").forEach(item=>{
 item.addEventListener("click",()=>{
  document.querySelectorAll(".submenu-item").forEach(x=>x.classList.remove("active-submenu"));
  item.classList.add("active-submenu");
  if(window.loadCustomerPage) window.loadCustomerPage(item.dataset.customerPage);
 });
});


// Main menu navigation

document.querySelectorAll(".menu-item[data-page]").forEach(item=>{
 item.addEventListener("click",()=>{
  const page=item.dataset.page;
  document.querySelectorAll(".menu-item[data-page]").forEach(x=>x.classList.remove("active-menu"));
  item.classList.add("active-menu");
  if(page==="rating" && window.openRatingPage){ window.openRatingPage(); }
  else if(page==="dashboard"){ window.location.href="index.html"; }
 });
});

// Profile menu
const profileBox=document.getElementById("profileBox");
const profilePopover=document.getElementById("profilePopover");
if(profileBox && profilePopover){
 profileBox.addEventListener("click",(e)=>{e.stopPropagation(); profilePopover.classList.toggle("open"); refreshIcons();});
 profilePopover.addEventListener("click",e=>e.stopPropagation());
 document.addEventListener("click",()=>profilePopover.classList.remove("open"));
 const logout=document.getElementById("profileLogout");
 if(logout) logout.addEventListener("click",()=>{
  profilePopover.classList.remove("open");
  window.location.href="index.html";
});
}
