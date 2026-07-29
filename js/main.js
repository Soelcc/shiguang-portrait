/**
 * 时光肖像馆 - 主脚本 v3
 * ============================================
 * 模块: 存储 / 认证 / 导航 / 预约 / VIP / 画廊 / 统计
 * 所有 SG_* 函数保持全局可用 (HTML onclick 引用)
 */

/* ==============================
   1. 数据初始化 & 版本迁移
   ============================== */
(function initStorage() {
  const STORE = "sg_";

  if (!localStorage.getItem(STORE + "users")) {
    localStorage.setItem(STORE + "users", JSON.stringify([
      { id: 1, username: "admin", password: "admin888", role: "admin", name: "管理员", phone: "15532061331", email: "19331022216@163.com", regTime: "2025/01/01 00:00:00", regIP: "127.0.0.1", regLoc: "中国 北京" },
      { id: 2, username: "user",  password: "user888",  role: "user",  name: "张三", phone: "13800138000", email: "" }
    ]));
  }
  if (!localStorage.getItem(STORE + "bookings")) localStorage.setItem(STORE + "bookings", "[]");
  if (!localStorage.getItem(STORE + "vip"))     localStorage.setItem(STORE + "vip", JSON.stringify({ 1: true }));
  if (!localStorage.getItem(STORE + "vipApps"))  localStorage.setItem(STORE + "vipApps", "[]");
  if (!localStorage.getItem(STORE + "aiLogs"))   localStorage.setItem(STORE + "aiLogs", "[]");

  // 数据版本迁移
  const dbVer = localStorage.getItem(STORE + "db_ver");
  if (dbVer !== "2") {
    ["users", "bookings", "vip", "vipApps", "session"].forEach(function(k) {
      localStorage.removeItem(STORE + k);
    });
    localStorage.setItem(STORE + "db_ver", "2");
    location.reload();
  }
})();

/* ==============================
   2. 存储工具函数
   ============================== */
function SG_g(key)       { return JSON.parse(localStorage.getItem("sg_" + key) || "null"); }
function SG_s(key, val)  { localStorage.setItem("sg_" + key, JSON.stringify(val)); }
function SG_ses()        { return SG_g("session"); }
function SG_uid()        { const session = SG_ses(); return session ? session.id : null; }
function SG_isVip()      { const uid = SG_uid(), vipMap = SG_g("vip"); return uid && vipMap ? !!vipMap[uid] : false; }

const CATEGORY_MAP = { portrait: "个人写真", couple: "情侣写真", family: "家庭肖像", artistic: "艺术肖像", other: "其他" };
function SG_type(cat)    { return CATEGORY_MAP[cat] || cat; }

const STATUS_MAP = { pending: "待处理", approved: "已确认", rejected: "已拒绝", completed: "已完成" };
function SG_st(status)   { return STATUS_MAP[status] || status; }

/* ==============================
   3. PV/UV 访问追踪
   ============================== */
(function trackPageView() {
  let sessionId = sessionStorage.getItem("sg_sid");
  if (!sessionId) {
    sessionId = "s" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    sessionStorage.setItem("sg_sid", sessionId);
  }
  const pvLog = SG_g("pv") || [];
  const pageName = location.pathname.replace(/.*\//, "").replace(".html", "") || "index";
  const timestamp = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });
  pvLog.push({ page: pageName, time: timestamp, sid: sessionId });
  SG_s("pv", pvLog.length > 500 ? pvLog.slice(-500) : pvLog);
})();

/* ==============================
   4. 导航 & 登录状态
   ============================== */
function SG_goBack()          { window.location.href = "index.html"; }
function SG_logout()          { localStorage.removeItem("sg_session"); SG_updateNav(); }

function SG_updateNav() {
  const session = SG_ses();
  const loginBtn = document.getElementById("navLoginBtn");
  const userDropdown = document.getElementById("navUserDropdown");
  if (!loginBtn || !userDropdown) return;

  if (session) {
    loginBtn.style.display = "none";
    userDropdown.style.display = "block";
    document.getElementById("navUserName").textContent = "👤 " + session.name;
    const adminLink = document.getElementById("goAdmin");
    if (adminLink) adminLink.style.display = session.role === "admin" ? "block" : "none";
  } else {
    loginBtn.style.display = "block";
    userDropdown.style.display = "none";
  }
}

/* ==============================
   5. 登录 / 注册弹窗
   ============================== */
function SG_openAuth(tab) {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  SG_switchAuthTab(tab || "login");
}

function SG_closeAuth() {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
  const loginErr = document.getElementById("loginError");
  const regErr = document.getElementById("regError");
  if (loginErr) loginErr.textContent = "";
  if (regErr) regErr.textContent = "";
}

function SG_switchAuthTab(tab) {
  document.querySelectorAll("#authModal .auth-tab").forEach(function(el) {
    el.classList.toggle("active", el.dataset.tab === tab);
  });
  const loginForm = document.getElementById("loginForm");
  const regForm = document.getElementById("registerForm");
  if (loginForm) loginForm.classList.toggle("active", tab === "login");
  if (regForm) regForm.classList.toggle("active", tab === "register");
}

function SG_doLogin() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const users = SG_g("users") || [];
  const user = users.find(function(u) { return u.username === username && u.password === password; });

  if (!user) {
    document.getElementById("loginError").textContent = "用户名或密码错误";
    return false;
  }
  SG_s("session", { id: user.id, username: user.username, role: user.role, name: user.name });
  SG_closeAuth();
  SG_updateNav();
  return false;
}

let SG_verifyCode = null;

function SG_sendCode() {
  const phone = document.getElementById("regPhone").value.trim();
  const errEl = document.getElementById("regError");
  if (!phone || phone.length < 11) { errEl.textContent = "请输入正确的手机号"; return; }

  const users = SG_g("users") || [];
  if (users.find(function(u) { return u.phone === phone; })) {
    errEl.textContent = "该手机号已注册";
    return;
  }
  SG_verifyCode = String(Math.floor(1000 + Math.random() * 9000));
  alert("验证码: " + SG_verifyCode + " (模拟环境，直接显示)");
  errEl.textContent = "";
}

function SG_doRegister() {
  const username = document.getElementById("regUsername").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const code = document.getElementById("regCode").value.trim();
  const errEl = document.getElementById("regError");

  if (!username)   { errEl.textContent = "请输入用户名"; return false; }
  if (!phone)      { errEl.textContent = "请输入手机号"; return false; }
  if (!password)   { errEl.textContent = "请输入密码"; return false; }
  if (!code)       { errEl.textContent = "请输入验证码"; return false; }
  if (code !== SG_verifyCode) { errEl.textContent = "验证码错误"; return false; }

  const users = SG_g("users") || [];
  if (users.find(function(u) { return u.username === username; })) { errEl.textContent = "用户名已存在"; return false; }
  if (users.find(function(u) { return u.phone === phone; }))     { errEl.textContent = "该手机号已注册"; return false; }

  const newUser = {
    id: users.length ? Math.max.apply(null, users.map(function(u) { return u.id; })) + 1 : 1,
    username: username, password: password, role: "user", name: username,
    phone: phone, email: "", regTime: new Date().toLocaleString("zh-CN"), regIP: "127.0.0.1", regLoc: "本地"
  };
  users.push(newUser);
  SG_s("users", users);
  SG_s("session", { id: newUser.id, username: newUser.username, role: newUser.role, name: newUser.name });
  SG_closeAuth();
  SG_updateNav();
  alert("注册成功！");
  return false;
}

/* ==============================
   6. VIP 付费解锁弹窗
   ============================== */
let SG_currentPlan = "monthly";
let SG_currentPay = "wechat";

const PLANS = { monthly: { name: "月度会员", price: "9.9", unit: "/月", key: "月度会员 ¥9.9" }, yearly: { name: "年度会员", price: "68", unit: "/年", key: "年度会员 ¥68" } };

function SG_openUnlock() {
  const modal = document.getElementById("unlockModal");
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  SG_currentPlan = "monthly";
  SG_currentPay = "wechat";
  updatePlanUI();
  document.getElementById("unlockStep1").style.display = "block";
  document.getElementById("unlockStep2").style.display = "none";
}

function SG_closeUnlock() {
  const modal = document.getElementById("unlockModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function SG_selectPlan(plan) {
  SG_currentPlan = plan;
  updatePlanUI();
}

function SG_selectPay(method) {
  SG_currentPay = method;
  updatePlanUI();
}

function updatePlanUI() {
  const plan = PLANS[SG_currentPlan];
  document.querySelectorAll("#unlockStep1 .unlock-option").forEach(function(el) {
    el.classList.toggle("active", el.querySelector("input").value === SG_currentPlan);
  });
  document.querySelectorAll("#unlockStep1 .payment-btn").forEach(function(el) {
    const isWechat = el.id === "payWechat";
    el.classList.toggle("active", isWechat ? SG_currentPay === "wechat" : SG_currentPay === "alipay");
  });
  document.getElementById("unlockPrice").textContent = "下一步：扫码支付 ¥" + plan.price;
}

function SG_showQR() {
  const plan = PLANS[SG_currentPlan];
  document.getElementById("unlockStep1").style.display = "none";
  document.getElementById("unlockStep2").style.display = "block";
  document.getElementById("qrPlanLabel").textContent = plan.name + " ¥" + plan.price;
  document.getElementById("qrPayLabel").textContent = SG_currentPay === "wechat" ? "请使用微信扫码支付" : "请使用支付宝扫码支付";
  document.getElementById("qrImage").src = "images/qr-" + (SG_currentPay === "wechat" ? "wechat" : "alipay") + ".png";
}

function SG_backToPlan() {
  document.getElementById("unlockStep2").style.display = "none";
  document.getElementById("unlockStep1").style.display = "block";
}

function SG_submitPayment() {
  const plan = PLANS[SG_currentPlan];
  const session = SG_ses();
  if (!session) { alert("请先登录"); return; }

  const vipApps = SG_g("vipApps") || [];
  vipApps.push({
    id: Date.now(), userId: session.id, username: session.username,
    plan: SG_currentPlan, amount: plan.price, payMethod: SG_currentPay,
    status: "pending", time: new Date().toLocaleString("zh-CN")
  });
  SG_s("vipApps", vipApps);
  SG_closeUnlock();
  showToast("支付申请已提交，管理员审核后将开通 VIP 权限");
}

function showToast(message) {
  const toast = document.getElementById("unlockToast");
  if (!toast) return;
  toast.querySelector(".toast-text").textContent = message;
  toast.classList.add("show");
  setTimeout(function() { toast.classList.remove("show"); }, 2500);
}

/* ==============================
   7. 预约系统
   ============================== */
function SG_submitBooking() {
  const session = SG_ses();
  if (!session) { alert("请先登录"); SG_openAuth("login"); return false; }

  const name   = document.getElementById("bookingName").value.trim();
  const phone  = document.getElementById("bookingPhone").value.trim();
  const type   = document.getElementById("bookingType").value;
  const date   = document.getElementById("bookingDate").value;
  const note   = document.getElementById("bookingNote").value.trim();

  if (!name || !phone || !date) { alert("请填写完整的预约信息"); return false; }

  const bookings = SG_g("bookings") || [];
  bookings.push({
    id: Date.now(), userId: session.id, username: session.username,
    name: name, phone: phone, type: type, date: date, time: "", note: note,
    status: "pending", createTime: new Date().toLocaleString("zh-CN")
  });
  SG_s("bookings", bookings);

  document.getElementById("bookingForm").reset();
  alert("预约成功！管理员将尽快与您联系确认。");
  return false;
}

function SG_renderMyBookings() {
  const session = SG_ses();
  const container = document.getElementById("myBookingsList");
  if (!container) return;

  const bookings = (SG_g("bookings") || []).filter(function(b) { return b.userId === session.id; });
  if (!bookings.length) {
    container.innerHTML = '<div class="admin-empty"><p>📋 暂无预约记录</p></div>';
    return;
  }
  container.innerHTML = bookings.reverse().map(function(b) {
    return '<div class="booking-card">' +
      '<div class="booking-info">' +
        '<h4>' + SG_type(b.type) + '</h4>' +
        '<div class="booking-meta">' +
          '<span>📅 ' + b.date + ' ' + b.time + '</span>' +
          '<span>👤 ' + b.name + '</span>' +
          '<span>📞 ' + b.phone + '</span>' +
        '</div>' +
      '</div>' +
      '<span class="booking-status status-' + b.status + '">' + SG_st(b.status) + '</span>' +
    '</div>';
  }).join("");
}

function SG_renderAdminBookings() {
  const tbody = document.getElementById("bookingsTableBody");
  if (!tbody) return;

  const filterVal = (document.getElementById("bookingFilter") || {}).value || "all";
  let bookings = SG_g("bookings") || [];
  if (filterVal !== "all") bookings = bookings.filter(function(b) { return b.status === filterVal; });

  if (!bookings.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999">暂无数据</td></tr>';
    updateBookingCount(bookings);
    return;
  }
  tbody.innerHTML = bookings.reverse().map(function(b) {
    return '<tr>' +
      '<td>' + b.id + '</td><td>' + b.username + '</td><td>' + b.name + '</td>' +
      '<td>' + b.phone + '</td><td>' + SG_type(b.type) + '</td>' +
      '<td>' + b.date + ' ' + b.time + '</td>' +
      '<td><span class="badge" style="background:' + statusColor(b.status) + '">' + SG_st(b.status) + '</span></td>' +
      '<td>' + actionButtons(b) + '</td>' +
    '</tr>';
  }).join("");
  updateBookingCount(bookings);
}

function statusColor(s) { return { pending: "#fff3cd", approved: "#d4edda", rejected: "#f8d7da", completed: "#cce5ff" }[s] || "#eee"; }

function actionButtons(b) {
  let html = "";
  if (b.status === "pending") {
    html += '<button class="btn-xs btn-ok" onclick="SG_approveBooking(' + b.id + ')">通过</button>';
    html += '<button class="btn-xs btn-no" onclick="SG_rejectBooking(' + b.id + ')">拒绝</button>';
  }
  if (b.status === "approved") {
    html += '<button class="btn-xs btn-fin" onclick="SG_completeBooking(' + b.id + ')">完成</button>';
  }
  return html || "--";
}

function SG_approveBooking(id) { updateBookingStatus(id, "approved"); }
function SG_rejectBooking(id)  { updateBookingStatus(id, "rejected"); }
function SG_completeBooking(id){ updateBookingStatus(id, "completed"); }

function updateBookingStatus(id, status) {
  const bookings = SG_g("bookings") || [];
  const booking = bookings.find(function(b) { return b.id === id; });
  if (booking) { booking.status = status; SG_s("bookings", bookings); SG_renderAdminBookings(); SG_renderMyBookings(); }
}

function updateBookingCount(arr) {
  const el = document.getElementById("bookingCount");
  if (el) el.textContent = "共 " + arr.length + " 条";
}

/* ==============================
   8. 个人中心
   ============================== */
function SG_renderMyProfile() {
  const container = document.getElementById("myProfileContent");
  if (!container) return;
  const session = SG_ses();
  if (!session) return;

  const users = SG_g("users") || [];
  const user = users.find(function(u) { return u.id === session.id; });
  if (!user) return;

  container.innerHTML =
    '<form class="dash-form" onsubmit="return SG_updateProfile()">' +
      '<div class="form-group"><label>用户名</label><input type="text" value="' + user.username + '" readonly></div>' +
      '<div class="form-group"><label>姓名</label><input type="text" id="profileName" value="' + (user.name || "") + '" required></div>' +
      '<div class="form-group"><label>手机号</label><input type="text" id="profilePhone" value="' + (user.phone || "") + '" required></div>' +
      '<div class="form-group"><label>邮箱</label><input type="email" id="profileEmail" value="' + (user.email || "") + '"></div>' +
      '<button type="submit" class="btn btn-primary">保存修改</button>' +
    '</form>';
}

function SG_updateProfile() {
  const session = SG_ses();
  if (!session) return false;
  const users = SG_g("users") || [];
  const user = users.find(function(u) { return u.id === session.id; });
  if (!user) return false;

  user.name  = document.getElementById("profileName").value.trim();
  user.phone = document.getElementById("profilePhone").value.trim();
  user.email = document.getElementById("profileEmail").value.trim();
  SG_s("users", users);
  session.name = user.name;
  SG_s("session", session);
  SG_updateNav();
  alert("个人信息已更新");
  return false;
}

/* ==============================
   9. VIP 管理
   ============================== */
function SG_renderMyVip() {
  const container = document.getElementById("myVipContent");
  if (!container) return;
  const isVip = SG_isVip();

  if (isVip) {
    container.innerHTML = '<div class="vip-status-card unlocked">' +
      '<div class="vip-status-icon">👑</div>' +
      '<h3>VIP 会员已激活</h3>' +
      '<p>您可畅享全部独家艺术作品</p>' +
      '<a href="index.html#works" class="btn btn-primary">浏览独家作品</a>' +
    '</div>';
  } else {
    container.innerHTML = '<div class="vip-status-card">' +
      '<div class="vip-status-icon">🔒</div>' +
      '<h3>尚未开通 VIP</h3>' +
      '<p>开通后可解锁全部艺术肖像作品</p>' +
      '<button class="btn btn-primary" onclick="SG_openVipApp()">申请开通 VIP</button>' +
    '</div>';
  }
}

function SG_openVipApp() {
  const modal = document.getElementById("vipAppModal");
  if (modal) { modal.classList.add("active"); document.body.style.overflow = "hidden"; }
}

function SG_submitVipApp() {
  const session = SG_ses();
  if (!session) { alert("请先登录"); return; }
  const planEl = document.getElementById("vipAppPlan");
  const plan = planEl ? planEl.value : "monthly";

  const vipApps = SG_g("vipApps") || [];
  vipApps.push({
    id: Date.now(), userId: session.id, username: session.username,
    plan: plan, amount: plan === "yearly" ? "68" : "9.9", payMethod: "wechat",
    status: "pending", time: new Date().toLocaleString("zh-CN")
  });
  SG_s("vipApps", vipApps);

  const modal = document.getElementById("vipAppModal");
  if (modal) { modal.classList.remove("active"); document.body.style.overflow = ""; }
  alert("VIP 申请已提交，请等待管理员审核");
}

function SG_renderVipApps() {
  const tbody = document.getElementById("vipAppsTableBody");
  if (!tbody) return;
  const apps = SG_g("vipApps") || [];
  if (!apps.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999">暂无待审核申请</td></tr>'; return; }
  tbody.innerHTML = apps.map(function(a) {
    return '<tr>' +
      '<td>' + a.id + '</td><td>' + a.username + '</td><td>' + (a.plan === "yearly" ? "年度" : "月度") + '</td>' +
      '<td>¥' + a.amount + '</td><td>' + a.time + '</td>' +
      '<td>' + (a.status === "pending"
        ? '<button class="btn-xs btn-ok" onclick="SG_approveVip(' + a.id + ')">通过</button>' +
          '<button class="btn-xs btn-no" onclick="SG_rejectVip(' + a.id + ')">拒绝</button>'
        : '<span class="badge" style="background:' + statusColor(a.status) + '">' + SG_st(a.status) + '</span>') +
      '</td>' +
    '</tr>';
  }).join("");
}

function SG_approveVip(appId) { updateVipStatus(appId, "approved"); }
function SG_rejectVip(appId)  { updateVipStatus(appId, "rejected"); }

function updateVipStatus(appId, status) {
  const apps = SG_g("vipApps") || [];
  const app = apps.find(function(a) { return a.id === appId; });
  if (!app) return;
  app.status = status;
  SG_s("vipApps", apps);
  if (status === "approved") {
    const vipMap = SG_g("vip") || {};
    vipMap[app.userId] = true;
    SG_s("vip", vipMap);
  }
  SG_renderVipApps();
  SG_renderVipMgmt();
}

function SG_renderVipMgmt() {
  const tbody = document.getElementById("vipMgmtTableBody");
  if (!tbody) return;
  const vipMap = SG_g("vip") || {};
  const users = SG_g("users") || [];
  const vipUsers = users.filter(function(u) { return vipMap[u.id]; });

  if (!vipUsers.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999">暂无 VIP 会员</td></tr>'; return; }
  tbody.innerHTML = vipUsers.map(function(u) {
    return '<tr>' +
      '<td>' + u.id + '</td><td>' + u.username + '</td><td>' + (u.name || "-") + '</td><td>' + (u.phone || "-") + '</td>' +
      '<td><button class="btn-xs btn-no" onclick="SG_cancelVip(' + u.id + ')">取消 VIP</button></td>' +
    '</tr>';
  }).join("");
}

function SG_cancelVip(userId) {
  if (!confirm("确认取消该用户的 VIP 权限？")) return;
  const vipMap = SG_g("vip") || {};
  delete vipMap[userId];
  SG_s("vip", vipMap);
  SG_renderVipMgmt();
}

/* ==============================
   10. 用户管理 (管理员)
   ============================== */
function SG_renderUsers() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  const users = SG_g("users") || [];
  const vipMap = SG_g("vip") || {};

  tbody.innerHTML = users.map(function(u) {
    return '<tr>' +
      '<td>' + u.id + '</td><td>' + u.username + '</td><td>' + (u.name || "-") + '</td>' +
      '<td>' + (u.phone || "-") + '</td>' +
      '<td><span class="badge" style="background:' + (u.role === "admin" ? "#c5a572" : "#eee") + ';color:' + (u.role === "admin" ? "#fff" : "#555") + '">' + u.role + '</span></td>' +
      '<td>' + (vipMap[u.id] ? "✅" : "❌") + '</td>' +
      '<td>' + (u.id > 1 ? '<button class="btn-xs btn-no" onclick="SG_deleteUser(' + u.id + ')">删除</button>' : "--") + '</td>' +
    '</tr>';
  }).join("");

  document.getElementById("statTotalUsers").textContent = users.length;
}

function SG_deleteUser(userId) {
  if (userId === 1) { alert("不能删除管理员"); return; }
  if (!confirm("确认删除该用户？")) return;

  let users = SG_g("users") || [];
  users = users.filter(function(u) { return u.id !== userId; });
  SG_s("users", users);

  let bookings = SG_g("bookings") || [];
  bookings = bookings.filter(function(b) { return b.userId !== userId; });
  SG_s("bookings", bookings);

  const vipMap = SG_g("vip") || {};
  delete vipMap[userId];
  SG_s("vip", vipMap);

  SG_renderUsers();
  SG_renderVipMgmt();
}

/* ==============================
   11. 统计 & AI 日志
   ============================== */
function SG_renderStats() {
  const pvLog = SG_g("pv") || [];
  const now = new Date();
  const todayStr = now.toLocaleDateString("zh-CN");

  let todayPV = 0, todaySids = {};
  const allSids = {};
  pvLog.forEach(function(entry) {
    const entryDate = entry.time.split(" ")[0];
    allSids[entry.sid] = true;
    if (entryDate === todayStr) { todayPV++; todaySids[entry.sid] = true; }
  });

  document.getElementById("statTodayPV").textContent = todayPV;
  document.getElementById("statTotalPV").textContent = pvLog.length;
  document.getElementById("statTodayUV").textContent = Object.keys(todaySids).length;
  document.getElementById("statTotalUV").textContent = Object.keys(allSids).length;

  const users = SG_g("users") || [];
  const bookings = SG_g("bookings") || [];
  const vipMap = SG_g("vip") || {};
  const vipApps = SG_g("vipApps") || [];

  document.getElementById("statTotalUsers").textContent = users.length;
  document.getElementById("statTotalBookings").textContent = bookings.length;
  document.getElementById("statPendingBookings").textContent = bookings.filter(function(b) { return b.status === "pending"; }).length;
  document.getElementById("statTodayBookings").textContent = bookings.filter(function(b) { return b.createTime && b.createTime.split(" ")[0] === todayStr; }).length;
  document.getElementById("statTotalVip").textContent = Object.keys(vipMap).length;
  document.getElementById("statPendingVipApps").textContent = vipApps.filter(function(a) { return a.status === "pending"; }).length;

  // PV 记录表
  const tbody = document.getElementById("pvTable").getElementsByTagName("tbody")[0];
  if (!tbody) return;
  const recent = pvLog.slice(-50).reverse();
  tbody.innerHTML = recent.length
    ? recent.map(function(p) { return '<tr><td>' + p.page + '.html</td><td>' + p.time + '</td><td>' + p.sid + '</td></tr>'; }).join("")
    : '<tr><td colspan="3" style="text-align:center;color:#999">暂无数据</td></tr>';
}

function SG_saveAILog(log) {
  const logs = SG_g("aiLogs") || [];
  logs.push({ id: Date.now(), ...log, time: new Date().toLocaleString("zh-CN") });
  if (logs.length > 200) logs.splice(0, logs.length - 200);
  SG_s("aiLogs", logs);
}

function SG_renderAiLogs() {
  const container = document.getElementById("aiLogsList");
  if (!container) return;
  const logs = SG_g("aiLogs") || [];
  if (!logs.length) { container.innerHTML = '<div class="admin-empty"><p>🤖 暂无 AI 生成记录</p></div>'; return; }
  container.innerHTML = logs.reverse().map(function(log) {
    return '<div style="background:#fff;border-radius:8px;padding:0.8rem;margin-bottom:0.5rem;border:1px solid rgba(0,0,0,0.04)">' +
      '<strong>' + (log.username || "游客") + '</strong> 使用了 <em>' + log.style + '</em> - ' + log.time +
      '<br><small style="color:#999">Prompt: ' + log.prompt + '</small>' +
    '</div>';
  }).join("");
}

/* ==============================
   12. 后台仪表盘入口
   ============================== */
function SG_openDash(mode) {
  if (mode === "admin") { window.location.href = "admin.html"; }
  else { window.location.href = "admin.html"; }
}

/* ==============================
   13. 画廊渲染
   ============================== */
const SG_galleryItems = [
  { src: "images/gallery/portrait-1.jpg",  fallback: "images/gallery-1.svg",  title: "晨光微露", cat: "portrait" },
  { src: "images/gallery/portrait-2.jpg",  fallback: "images/gallery-2.svg",  title: "静默时光", cat: "portrait" },
  { src: "images/gallery/portrait-3.jpg",  fallback: "images/gallery-3.svg",  title: "城市剪影", cat: "portrait" },
  { src: "images/gallery/couple-1.jpg",    fallback: "images/gallery-4.svg",  title: "爱的光影", cat: "couple" },
  { src: "images/gallery/couple-2.jpg",    fallback: "images/gallery-5.svg",  title: "携手同行", cat: "couple" },
  { src: "images/gallery/couple-3.jpg",    fallback: "images/gallery-6.svg",  title: "甜蜜时刻", cat: "couple" },
  { src: "images/gallery/family-1.jpg",    fallback: "images/gallery-7.svg",  title: "家的温度", cat: "family" },
  { src: "images/gallery/family-2.jpg",    fallback: "images/gallery-8.svg",  title: "幸福时光", cat: "family" },
  { src: "images/gallery/family-3.jpg",    fallback: "images/gallery-9.svg",  title: "童真年代", cat: "family" },
  { src: "images/gallery/artistic-1.jpg",  fallback: "images/gallery-10.svg", title: "灵魂之窗", cat: "artistic", vip: true },
  { src: "images/gallery/artistic-2.jpg",  fallback: "images/gallery-11.svg", title: "梦幻光影", cat: "artistic", vip: true },
  { src: "images/gallery/artistic-3.jpg",  fallback: "images/gallery-12.svg", title: "时空交错", cat: "artistic", vip: true }
];

let SG_currentFilter = "all";
let SG_visibleCount = 8;

function renderGallery(filter, count) {
  filter = filter || SG_currentFilter;
  count = count || SG_visibleCount;
  SG_currentFilter = filter;
  SG_visibleCount = count;

  const items = filter === "all" ? SG_galleryItems : SG_galleryItems.filter(function(item) { return item.cat === filter; });
  const visible = items.slice(0, count);
  const isVip = SG_isVip();
  const grid = document.getElementById("worksGrid");
  if (!grid) return;

  grid.innerHTML = visible.map(function(item) {
    const catName = SG_type(item.cat);
    const fallbackSrc = item.fallback || "";
    const imgHtml = '<img src="' + item.src + '" alt="' + item.title + '" onerror="this.onerror=null;this.src=\'' + fallbackSrc + '\'" class="work-img" loading="lazy">';

    if (item.vip && !isVip) {
      return '<div class="work-item locked" onclick="SG_openUnlock()">' +
        imgHtml +
        '<div class="work-overlay"><span class="lock-badge">🔒 VIP</span><h3>' + item.title + '</h3><span>' + catName + '</span></div>' +
      '</div>';
    }
    return '<div class="work-item">' +
      imgHtml +
      '<div class="work-overlay"><h3>' + item.title + '</h3><span>' + catName + '</span></div>' +
    '</div>';
  }).join("");

  const loadMoreBtn = document.getElementById("loadMore");
  if (loadMoreBtn) loadMoreBtn.style.display = count >= items.length ? "none" : "inline-block";

  document.querySelectorAll(".filter-btn").forEach(function(btn) {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
}

/* ==============================
   13.5 客户评价轮播
   ============================== */
function initTestimonials() {
  const slider = document.getElementById("testimonialsSlider");
  if (!slider) return;
  const cards = slider.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll("#testimonialsDots .dot");
  if (cards.length <= 1) return;
  let idx = 0;
  function show(i) {
    cards.forEach(function(c) { c.classList.remove("active"); });
    dots.forEach(function(d) { d.classList.remove("active"); });
    cards[i].classList.add("active");
    if (dots[i]) dots[i].classList.add("active");
    idx = i;
  }
  dots.forEach(function(d) {
    d.addEventListener("click", function() { show(parseInt(this.dataset.i, 10)); });
  });
  setInterval(function() { show((idx + 1) % cards.length); }, 5000);
}

/* ==============================
   14. 页面初始化
   ============================== */
SG_updateNav();

document.addEventListener("DOMContentLoaded", function() {
  // 加载动画
  setTimeout(function() {
    const loader = document.getElementById("loader");
    if (loader) { loader.classList.add("hidden"); document.body.style.overflow = ""; }
  }, 1000);

  // 画廊
  renderGallery();
  document.querySelectorAll(".filter-btn").forEach(function(btn) {
    btn.addEventListener("click", function() { renderGallery(this.dataset.filter); });
  });

  const loadMoreBtn = document.getElementById("loadMore");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function() {
      SG_visibleCount += 8;
      renderGallery();
    });
  }

  // 导航滚动
  window.addEventListener("scroll", function() {
    const nav = document.getElementById("navbar");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);
  });

  // 移动端菜单
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  if (navToggle) {
    navToggle.addEventListener("click", function() {
      this.classList.toggle("active");
      if (navMenu) navMenu.classList.toggle("active");
    });
  }

  // 锚点平滑滚动
  document.querySelectorAll('.nav-link[href^="#"]').forEach(function(link) {
    link.addEventListener("click", function(e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
      if (navMenu) navMenu.classList.remove("active");
    });
  });

  // 滚动渐显动画
  const revealElements = document.querySelectorAll(
    ".section-header, .service-card, .photographer-card, .work-item, .about-content, .booking-container, .vip-teaser, .pricing-card"
  );
  const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  revealElements.forEach(function(el) {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });

  // 管理后台预约筛选
  const bookingFilter = document.getElementById("bookingFilter");
  if (bookingFilter) bookingFilter.addEventListener("change", function() { SG_renderAdminBookings(); });

  // 客户评价轮播
  initTestimonials();

  // 拍摄日期的中文占位符（覆盖 Chrome 原生 yyyy/mm/dd 提示）
  const dateInput = document.getElementById("bookingDate");
  const datePh = document.getElementById("datePlaceholder");
  if (dateInput && datePh) {
    const syncDatePh = () => {
      const hasValue = !!dateInput.value;
      datePh.classList.toggle("is-hidden", hasValue);
      dateInput.classList.toggle("has-value", hasValue);
    };
    dateInput.addEventListener("input", syncDatePh);
    dateInput.addEventListener("change", syncDatePh);
    setTimeout(syncDatePh, 50);
  }
});