/* 鏃跺厜鑲栧儚棣?漏2025 Soelc - 19331022216@163.com */
/* 鏃跺厜鑲栧儚棣?- 涓昏剼鏈?v2 */
// ===== 绉嶅瓙鏁版嵁 =====
if(!localStorage.getItem("sg_users")) localStorage.setItem("sg_users",JSON.stringify([
  {id:1,username:"admin",password:"admin888",role:"admin",name:"绠＄悊鍛?,phone:"15532061331",email:"19331022216@163.com",regTime:"2025/01/01 00:00:00",regIP:"127.0.0.1",regLoc:"涓浗 鍖椾含"},
  {id:2,username:"user",password:"user888",role:"user",name:"寮犱笁",phone:"13800138000",email:""}
]));
if(!localStorage.getItem("sg_bookings")) localStorage.setItem("sg_bookings","[]");
if(!localStorage.getItem("sg_vip")) localStorage.setItem("sg_vip",JSON.stringify({1:true}));
if(!localStorage.getItem("sg_vipApps")) localStorage.setItem("sg_vipApps","[]");
if(!localStorage.getItem("sg_aiLogs")) localStorage.setItem("sg_aiLogs","[]");
// Migrate old data
(function(){
  var v=localStorage.getItem("sg_db_ver");
  if(v!=="2"){
    localStorage.removeItem("sg_users");
    localStorage.removeItem("sg_bookings");
    localStorage.removeItem("sg_vip");
    localStorage.removeItem("sg_vipApps");
    localStorage.removeItem("sg_session");
    localStorage.setItem("sg_db_ver","2");
    location.reload();
  }
})();

// ===== 宸ュ叿鍑芥暟 =====
function SG_g(k){return JSON.parse(localStorage.getItem("sg_"+k)||"null")}
function SG_s(k,v){localStorage.setItem("sg_"+k,JSON.stringify(v))}
function SG_ses(){return SG_g("session")}
function SG_uid(){var s=SG_ses();return s?s.id:null}
function SG_isVip(){var u=SG_uid(),v=SG_g("vip");return u&&v?!!v[u]:false}
function SG_type(t){var m={portrait:"涓汉鍐欑湡",couple:"鎯呬荆鍐欑湡",family:"瀹跺涵鑲栧儚",artistic:"鑹烘湳鑲栧儚",other:"鍏朵粬"};return m[t]||t}
function SG_st(s){var m={pending:"寰呭鐞?,approved:"宸茬‘璁?,rejected:"宸叉嫆缁?,completed:"宸插畬鎴?};return m[s]||s}


// ===== PV/UV Tracking =====
(function(){
  var sid = sessionStorage.getItem('sg_sid');
  if(!sid){ sid = 's' + Date.now() + '_' + Math.random().toString(36).substr(2,6); sessionStorage.setItem('sg_sid', sid); }
  var pv = SG_g('pv') || [];
  var page = location.pathname.replace(/.*\//,'').replace('.html','') || 'index';
  pv.push({ page: page, time: new Date().toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}), sid: sid });
  if(pv.length > 500) pv = pv.slice(-500);
  SG_s('pv', pv);
})();

// ===== Nav =====
function SG_goBack(){window.location.href='index.html'}
function SG_updateNav(){
  var s=SG_ses();
  var lb=document.getElementById("navLoginBtn");
  var ud=document.getElementById("navUserDropdown");
  if(!lb||!ud)return;
  if(s){lb.style.display="none";ud.style.display="block";document.getElementById("navUserName").textContent="馃懁 "+s.name;
    document.getElementById("goAdmin").style.display=s.role==="admin"?"block":"none";}
  else{lb.style.display="block";ud.style.display="none";}
}
function SG_logout(){localStorage.removeItem("sg_session");SG_updateNav()}

// ===== Auth Modal =====
function SG_openAuth(tab){
  var m=document.getElementById("authModal");if(!m)return;
  m.classList.add("active");document.body.style.overflow="hidden";
  SG_switchAuthTab(tab||"login");
}
function SG_closeAuth(){
  var m=document.getElementById("authModal");if(!m)return;
  m.classList.remove("active");document.body.style.overflow="";
  var le=document.getElementById("loginError");if(le)le.textContent="";
  var re=document.getElementById("regError");if(re)re.textContent="";
}
function SG_switchAuthTab(t){
  document.querySelectorAll("#authModal .auth-tab").forEach(function(x){x.classList.toggle("active",x.dataset.tab===t)});
  var lf=document.getElementById("loginForm");var rf=document.getElementById("registerForm");
  if(lf)lf.classList.toggle("active",t==="login");
  if(rf)rf.classList.toggle("active",t==="register");
}
function SG_doLogin(){
  var u=document.getElementById("loginUsername").value.trim();
  var p=document.getElementById("loginPassword").value.trim();
  var users=SG_g("users")||[];
  var user=users.find(function(x){return x.username===u&&x.password===p});
  if(!user){document.getElementById("loginError").textContent="鐢ㄦ埛鍚嶆垨瀵嗙爜閿欒";return false}
  SG_s("session",{id:user.id,username:user.username,role:user.role,name:user.name});
  SG_closeAuth();SG_updateNav();
  return false;
}
var SG_verifyCode=null;
function SG_sendCode(){
  var ph=document.getElementById("regPhone").value.trim();
  var err=document.getElementById("regError");
  if(!ph||ph.length<11){err.textContent="璇疯緭鍏ユ纭殑鎵嬫満鍙?;return}
  var users=SG_g("users")||[];
  if(users.find(function(x){return x.phone===ph})){err.textContent="璇ユ墜鏈哄彿宸叉敞鍐?;return}
  SG_verifyCode=String(Math.floor(1000+Math.random()*9000));
  var btn=document.getElementById("sendCodeBtn");
  alert("楠岃瘉鐮? "+SG_verifyCode+"\n(妯℃嫙鐭俊鍙戦€佽嚦 "+ph+")");
  btn.disabled=true;var sec=60;
  var timer=setInterval(function(){
    sec--;
    if(sec<=0){clearInterval(timer);btn.disabled=false;btn.textContent="鑾峰彇楠岃瘉鐮?}
    else{btn.textContent=sec+"s鍚庨噸鍙?}
  },1000);
}

function SG_doRegister(){
  var u=document.getElementById("regUsername").value.trim();
  var p=document.getElementById("regPassword").value.trim();
  var ph=document.getElementById("regPhone").value.trim();
  var code=document.getElementById("regCode").value.trim();
  var err=document.getElementById("regError");
  if(!u||!p||!ph||!code){err.textContent="璇峰～鍐欏畬鏁翠俊鎭?;return false}
  if(u.length<2){err.textContent="鐢ㄦ埛鍚嶈嚦灏?涓瓧绗?;return false}
  if(p.length<8){err.textContent="瀵嗙爜涓嶈兘灏戜簬8涓瓧绗?;return false}
  if(!SG_verifyCode||code!==SG_verifyCode){err.textContent="楠岃瘉鐮侀敊璇?;return false}
  var users=SG_g("users")||[];
  if(users.find(function(x){return x.username===u})){err.textContent="鐢ㄦ埛鍚嶅凡瀛樺湪";return false}
  if(users.find(function(x){return x.phone===ph})){err.textContent="璇ユ墜鏈哄彿宸叉敞鍐?;return false}
  var geo={ip:"鏈煡",loc:"鏈煡"};
  var ids=SG_g("users")||[];var newId=ids.length>0?Math.max.apply(null,ids.map(function(x){return x.id}))+1:2;var newU={id:newId,username:u,password:p,role:"user",name:u,phone:ph,email:"",regTime:new Date().toLocaleString("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}),regIP:geo.ip,regLoc:geo.loc};
  users.push(newU);SG_s("users",users);
  setTimeout(function(){
  var users2=SG_g("users")||[];
  var idx2=users2.findIndex(function(x){return x.id===newId});
  if(idx2<0) return;
  fetch("https://api-ipv4.ip.sb/ip").then(function(r){return r.text()}).then(function(ipText){
    var ipv4=ipText.trim();
    if(ipv4) users2[idx2].regIP=ipv4;
    return fetch("https://api.ip.sb/geoip/"+ipv4);
  }).then(function(r){return r.json()}).then(function(d){
    if(d.country||d.city){
      users2[idx2].regLoc=((d.country||"")+" "+(d.city||"")).trim().replace(/China/gi,"涓浗").replace(/Beijing/gi,"鍖椾含").replace(/Shanghai/gi,"涓婃捣").replace(/Guangdong/gi,"骞夸笢").replace(/Zhejiang/gi,"娴欐睙").replace(/Jiangsu/gi,"姹熻嫃").replace(/Sichuan/gi,"鍥涘窛").replace(/Hubei/gi,"婀栧寳").replace(/Fujian/gi,"绂忓缓").replace(/Shandong/gi,"灞变笢").replace(/Hong Kong/gi,"棣欐腐");
    }
    SG_s("users",users2);
  }).catch(function(){});
},1000);
  SG_s("session",{id:newId,username:u,role:"user",name:u});
  SG_closeAuth();SG_updateNav();
  return false;
}
// ===== VIP Unlock Modal =====
var SG_unlockPlan="monthly";
var SG_unlockPay="wechat";
function SG_openUnlock(){
  var m=document.getElementById("unlockModal");if(!m)return;
  m.classList.add("active");document.body.style.overflow="hidden";
  SG_selectPlan("monthly");SG_selectPay("wechat");
  document.getElementById("unlockStep1").style.display="block";
  document.getElementById("unlockStep2").style.display="none";
}
function SG_closeUnlock(){
  var m=document.getElementById("unlockModal");if(!m)return;
  m.classList.remove("active");document.body.style.overflow="";
}
function SG_selectPlan(p){
  SG_unlockPlan=p;
  document.getElementById("planMonthly").classList.toggle("active",p==="monthly");
  document.getElementById("planYearly").classList.toggle("active",p==="yearly");
  var price=p==="monthly"?"9.9":"68";
  document.getElementById("unlockPrice").textContent="涓嬩竴姝ワ細鎵爜鏀粯 楼"+price;
}
function SG_selectPay(m){
  SG_unlockPay=m;
  document.getElementById("payWechat").classList.toggle("active",m==="wechat");
  document.getElementById("payAlipay").classList.toggle("active",m==="alipay");
}
function SG_showQR(){
  var s=SG_ses();if(!s){alert("璇峰厛鐧诲綍");return}
  document.getElementById("unlockStep1").style.display="none";
  document.getElementById("unlockStep2").style.display="block";
  var price=SG_unlockPlan==="monthly"?"9.9":"68";
  var planName=SG_unlockPlan==="monthly"?"鏈堝害浼氬憳":"骞村害浼氬憳";
  document.getElementById("qrPlanLabel").textContent=planName+" 楼"+price;
  var isWechat=SG_unlockPay==="wechat";
  document.getElementById("qrPayLabel").textContent="璇蜂娇鐢?+(isWechat?"寰俊":"鏀粯瀹?)+"鎵爜鏀粯";
  document.getElementById("qrImage").src="images/qr-"+(isWechat?"wechat":"alipay")+".png";
  document.getElementById("qrConfirmBtn").textContent="鉁?鎴戝凡瀹屾垚鏀粯 楼"+price;
}
function SG_backToPlan(){
  document.getElementById("unlockStep2").style.display="none";
  document.getElementById("unlockStep1").style.display="block";
}
function SG_submitPayment(){
  var s=SG_ses();if(!s){alert("璇峰厛鐧诲綍");return}
  var apps=SG_g("vipApps")||[];
  var planName=SG_unlockPlan==="monthly"?"鏈堝害浼氬憳":"骞村害浼氬憳";
  var price=SG_unlockPlan==="monthly"?"9.9":"68";
  apps.push({
    id:Date.now(),userId:s.id,username:s.username,name:s.name,
    plan:SG_unlockPlan,planName:planName,price:price,payMethod:SG_unlockPay,
    status:"pending",createdAt:new Date().toISOString()
  });
  SG_s("vipApps",apps);
  SG_closeUnlock();
  var t=document.getElementById("unlockToast");
  t.querySelector(".toast-text").textContent="鏀粯鐢宠宸叉彁浜わ紝绛夊緟绠＄悊鍛樺鏍稿紑閫?;
  t.classList.add("show");
  setTimeout(function(){t.classList.remove("show")},4000);
}

// ===== Booking =====
function SG_submitBooking(form){
  var name=form.querySelector('[name="name"]').value.trim();
  var phone=form.querySelector('[name="phone"]').value.trim();
  var type=form.querySelector('[name="type"]').value;
  var date=form.querySelector('[name="date"]').value;
  var msg=form.querySelector('[name="message"]').value.trim();
  var s=SG_ses();
  var bookings=SG_g("bookings")||[];
  bookings.push({id:Date.now(),userId:s?s.id:null,name:name,phone:phone,type:type,date:date,message:msg,status:"pending",createdAt:new Date().toISOString()});
  SG_s("bookings",bookings);
  var btn=form.querySelector('button[type="submit"]');
  btn.textContent="鉁?棰勭害鎴愬姛锛?;btn.style.background="#5a8a5a";btn.disabled=true;
  setTimeout(function(){btn.textContent="鎻愪氦棰勭害";btn.style.background="";btn.disabled=false;form.reset()},3000);
  return false;
}

// ===== Dashboard =====
function SG_openDash(role){
  var s=SG_ses();if(!s){SG_openAuth("login");return}
  role=role||s.role;
  window.location.href="admin.html"+(role==="admin"?"?admin=1":"");
}




// ===== Profile =====
function SG_renderMyProfile(){
  var s=SG_ses();if(!s)return;
  var users=SG_g("users")||[];
  var u=users.find(function(x){return x.id===s.id});
  if(!u)return;
  document.getElementById("profileUsername").value=u.username;
  document.getElementById("profileRole").value=u.role==="admin"?"绠＄悊鍛?:"鐢ㄦ埛";
  document.getElementById("profileName").value=u.name||"";
  document.getElementById("profilePhone").value=u.phone||"";
  document.getElementById("profileEmail").value=u.email||"";
}
function SG_saveProfile(){
  var s=SG_ses();if(!s)return;
  var users=SG_g("users")||[];
  var idx=users.findIndex(function(x){return x.id===s.id});
  if(idx===-1)return;
  users[idx].name=document.getElementById("profileName").value.trim();
  users[idx].phone=document.getElementById("profilePhone").value.trim();
  users[idx].email=document.getElementById("profileEmail").value.trim();
  SG_s("users",users);
  SG_s("session",{id:users[idx].id,username:users[idx].username,role:users[idx].role,name:users[idx].name});
  SG_updateNav();
  var el=document.createElement("div");
  el.style.cssText="position:fixed;top:20px;right:20px;background:#5a8a5a;color:#fff;padding:0.8rem 1.5rem;border-radius:8px;z-index:9999;font-size:0.9rem;animation:fadeIn 0.3s ease";
  el.textContent="鉁?涓汉淇℃伅宸蹭繚瀛?;
  document.body.appendChild(el);
  setTimeout(function(){el.remove()},2500);
  return false;
}
// ===== User Dashboard =====
function SG_renderMyBookings(){
  var s=SG_ses();if(!s)return;
  var bookings=SG_g("bookings")||[];
  var mine=bookings.filter(function(x){return x.userId===s.id});
  var list=document.getElementById("myBookingList");
  var emp=document.getElementById("myBookingEmpty");
  if(mine.length===0){list.innerHTML="";emp.style.display="block";return}
  emp.style.display="none";
  list.innerHTML=mine.reverse().map(function(x){
    return '<div class="booking-card"><div class="booking-info"><h4>'+SG_type(x.type)+'</h4><div class="booking-meta"><span>馃搮 '+x.date+'</span><span>馃摓 '+x.phone+'</span></div>'+(x.message?'<p style="margin-top:0.3rem;font-size:0.82rem;color:#999">澶囨敞: '+x.message+'</p>':"")+'</div><span class="booking-status status-'+x.status+'">'+SG_st(x.status)+'</span></div>';
  }).join("");
}
function SG_renderMyVip(){
  var card=document.getElementById("vipStatusCard");if(!card)return;
  if(SG_isVip()){card.innerHTML='<div class="vipicon">馃憫</div><h3>VIP浼氬憳</h3><p>鎮ㄥ凡瑙ｉ攣鍏ㄩ儴鐙浣滃搧锛岀晠浜皧璐典綋楠?/p>';}
  else{card.innerHTML='<div class="vipicon">馃敀</div><h3>鏈紑閫歏IP</h3><p>寮€閫歏IP瑙ｉ攣鍏ㄩ儴鐙浣滃搧</p><button class="btn" onclick="window.location.href=\'index.html#vip\'">鍘诲紑閫?/button>';}
}

// ===== Admin Dashboard =====
function SG_renderAdminBookings(){
  var b=SG_g("bookings")||[];
  var f=document.getElementById("bookingFilter");
  var filter=f?f.value:"all";
  var filtered=filter==="all"?b:b.filter(function(x){return x.status===filter});
  var el=document.getElementById("bookingCount");if(el)el.textContent="鍏?"+filtered.length+" 鏉?;
  var tbody=document.querySelector("#adminBookingTable tbody");
  var emp=document.getElementById("adminBookingEmpty");
  if(!tbody)return;
  if(filtered.length===0){tbody.innerHTML="";if(emp)emp.style.display="block";return}
  if(emp)emp.style.display="none";
  var users=SG_g("users")||[];
  tbody.innerHTML=filtered.reverse().map(function(x){
    var u=users.find(function(u2){return u2.id===x.userId});
    var nm=u?u.name:x.name;
    var act="";
    if(x.status==="pending")act='<button class="btn-sm btn-approve" onclick="SG_approveBooking('+x.id+')">纭</button><button class="btn-sm btn-reject" onclick="SG_rejectBooking('+x.id+')">鎷掔粷</button>';
    else if(x.status==="approved")act='<button class="btn-sm btn-complete" onclick="SG_completeBooking('+x.id+')">瀹屾垚</button>';
    return "<tr><td>"+nm+"</td><td>"+x.phone+"</td><td>"+SG_type(x.type)+"</td><td>"+x.date+"</td><td><span class=\"booking-status status-"+x.status+"\">"+SG_st(x.status)+"</span></td><td>"+(x.message||"-")+"</td><td>"+act+"</td></tr>";
  }).join("");
}
function SG_approveBooking(id){SG_updateBooking(id,"approved")}
function SG_rejectBooking(id){SG_updateBooking(id,"rejected")}
function SG_completeBooking(id){SG_updateBooking(id,"completed")}
function SG_updateBooking(id,status){
  var b=SG_g("bookings");
  var idx=b.findIndex(function(x){return x.id===id});
  if(idx!==-1){b[idx].status=status;SG_s("bookings",b)}
  SG_renderAdminBookings();SG_renderStats();
}
function SG_renderUsers(){
  var users=SG_g("users")||[];
  var vip=SG_g("vip")||{};
  var tbody=document.querySelector("#userTable tbody");if(!tbody)return;
  tbody.innerHTML=users.map(function(u){
    var isVip=!!vip[u.id];
    var rt=u.regTime||"-";
    return "<tr><td>"+u.id+"</td><td>"+u.username+"</td><td>"+u.name+"</td><td>"+(u.phone||"-")+"</td><td>"+(u.role==="admin"?"馃敡绠＄悊鍛?:"馃懁鐢ㄦ埛")+"</td><td>"+(isVip?"鉁匳IP":"鉂屾櫘閫?)+"</td><td>"+rt+"</td><td>"+(u.regLoc||"-")+"</td><td>"+(u.regIP||"-")+"</td><td>"+(u.role!=="admin"?'<button class="btn-sm btn-reject" onclick="SG_deleteUser('+u.id+')">鍒犻櫎</button>':"-")+"</td></tr>";
  }).join("");
}
function SG_deleteUser(id){
  if(!confirm("纭畾鍒犻櫎璇ョ敤鎴凤紵"))return;
  var users=SG_g("users").filter(function(u){return u.id!==id});
  SG_s("users",users);SG_renderUsers();SG_renderVipMgmt();SG_renderStats();
}
function SG_renderVipMgmt(){
  var users=SG_g("users")||[];
  var vip=SG_g("vip")||{};
  var tbody=document.querySelector("#vipTable tbody");if(!tbody)return;
  tbody.innerHTML=users.map(function(u){
    if(u.role==="admin")return"";
    var isVip=!!vip[u.id];
    return "<tr><td>"+u.id+"</td><td>"+u.username+"</td><td>"+u.name+"</td><td>"+(isVip?"鉁匳IP":"鉂屾櫘閫?)+"</td><td>"+(isVip?"姘镐箙":"-")+"</td><td>"+(isVip?'<button class="btn-sm btn-reject" onclick="SG_removeVip('+u.id+')">鍙栨秷VIP</button>':'<button class="btn-sm btn-approve" onclick="SG_addVip('+u.id+')">寮€閫歏IP</button>')+"</td></tr>";
  }).join("");
}
function SG_addVip(id){var v=SG_g("vip")||{};v[id]=true;SG_s("vip",v);SG_renderVipMgmt();SG_renderUsers();SG_renderStats()}
function SG_removeVip(id){var v=SG_g("vip")||{};delete v[id];SG_s("vip",v);SG_renderVipMgmt();SG_renderUsers();SG_renderStats()}
// ===== VIP Applications =====
function SG_renderVipApps(){
  var apps=SG_g("vipApps")||[];
  var tbody=document.querySelector("#vipAppsTable tbody");
  var emp=document.getElementById("vipAppsEmpty");
  if(!tbody)return;
  if(apps.length===0){tbody.innerHTML="";if(emp)emp.style.display="block";return}
  if(emp)emp.style.display="none";
  tbody.innerHTML=apps.reverse().map(function(a){
    var st=a.status==="pending"?"<span class=\"badge badge-pend\">寰呭鏍?/span>":a.status==="approved"?"<span class=\"badge badge-ok\">宸插紑閫?/span>":"<span class=\"badge badge-no\">宸叉嫆缁?/span>";
    var act=a.status==="pending"?'<button class="btn-xs btn-ok" onclick="SG_approveVipApp('+a.id+')">纭鏀舵</button><button class="btn-xs btn-no" onclick="SG_rejectVipApp('+a.id+')">鎷掔粷</button>':"-";
    return "<tr><td>"+a.name+" ("+a.username+")</td><td>"+a.planName+"</td><td>楼"+a.price+"</td><td>"+(a.payMethod==="wechat"?"馃挌寰俊":"馃挋鏀粯瀹?)+"</td><td>"+(a.createdAt?a.createdAt.slice(0,10):"-")+"</td><td>"+st+"</td><td>"+act+"</td></tr>";
  }).join("");
}
function SG_approveVipApp(id){
  var apps=SG_g("vipApps")||[];
  var a=apps.find(function(x){return x.id===id});
  if(!a)return;
  a.status="approved";
  SG_s("vipApps",apps);
  var vip=SG_g("vip")||{};
  vip[a.userId]=true;
  SG_s("vip",vip);
  SG_renderVipApps();SG_renderStats();
}
function SG_rejectVipApp(id){
  var apps=SG_g("vipApps")||[];
  var a=apps.find(function(x){return x.id===id});
  if(a){a.status="rejected";SG_s("vipApps",apps)}
  SG_renderVipApps();SG_renderStats();
}

function SG_renderStats(){
  var b=SG_g("bookings")||[];
  var users=SG_g("users")||[];
  var vip=SG_g("vip")||{};
  var vc=users.filter(function(u){return !!vip[u.id]}).length;
  var va=SG_g("vipApps")||[];
  var pv=SG_g("pv")||[];
  var logs=SG_g("aiLogs")||[];
  var el=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v};
  var today=getBJToday();
  var todayPV=pv.filter(function(x){return x.time.startsWith(today)}).length;
  var todayBookings=b.filter(function(x){return x.createdAt&&x.createdAt.startsWith(today)}).length;
  var uniqueSids={};
  pv.forEach(function(x){uniqueSids[x.sid]=true});
  var todaySids={};
  pv.filter(function(x){return x.time.startsWith(today)}).forEach(function(x){todaySids[x.sid]=true});
  el("statTodayPV",todayPV);
  el("statTotalPV",pv.length);
  el("statTodayUV",Object.keys(todaySids).length);
  el("statTotalUV",Object.keys(uniqueSids).length);
  el("statTotalUsers",users.length);
  el("statTotalVip",vc);
  el("statTotalBookings",b.length);
  el("statPendingBookings",b.filter(function(x){return x.status==="pending"}).length);
  el("statTodayBookings",todayBookings);
  el("statPendingVipApps",va.filter(function(x){return x.status==="pending"}).length);
  el("statAiLogs",logs.length);
  var tbody=document.querySelector("#pvTable tbody");
  if(tbody){
    var recent=pv.slice(-50).reverse();
    tbody.innerHTML=recent.map(function(x){
      return "<tr><td>"+x.page+"</td><td>"+x.time+"</td><td style='font-size:0.75rem;color:#999'>"+x.sid.substring(0,12)+"</td></tr>";
    }).join("");
  }
}

function getBJToday(){
  var d=new Date();
  var bj=new Date(d.toLocaleString("en-US",{timeZone:"Asia/Shanghai"}));
  return bj.getFullYear()+"/"+
    String(bj.getMonth()+1).padStart(2,"0")+"/"+
    String(bj.getDate()).padStart(2,"0");
}
// ===== AI Generation Log =====
function SG_saveAILog(data){
  var logs=SG_g("aiLogs")||[];
  logs.push({
    id:Date.now(),
    userId:data.userId||null,
    username:data.username||"娓稿",
    style:data.style||"鏈煡",
    prompt:data.prompt||"",
    imageUrl:data.imageUrl||"",
    createdAt:new Date().toLocaleString("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})
  });
  SG_s("aiLogs",logs);
}
function SG_renderAiLogs(){
  var logs=SG_g("aiLogs")||[];
  var tbody=document.querySelector("#aiLogsTable tbody");
  var emp=document.getElementById("aiLogsEmpty");
  if(!tbody)return;
  if(logs.length===0){tbody.innerHTML="";if(emp)emp.style.display="block";return}
  if(emp)emp.style.display="none";
  tbody.innerHTML=logs.reverse().map(function(l){
    return "<tr><td>"+l.username+"</td><td>"+l.style+"</td><td style='max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' title='"+l.prompt+"'>"+(l.prompt||"-")+"</td><td>"+(l.imageUrl?'<a href="'+l.imageUrl+'" target="_blank" style="color:#c5a572">鏌ョ湅鍥剧墖</a>':"-")+"</td><td>"+l.createdAt+"</td></tr>";
  }).join("");
}

// ===== Gallery =====
var SG_galleryItems=[{"src":"images/gallery/portrait-1.jpg","fallback":"images/gallery-1.svg","title":"鏅ㄥ厜寰湶","cat":"portrait"},{"src":"images/gallery/portrait-2.jpg","fallback":"images/gallery-2.svg","title":"闈欒哀鏃跺厜","cat":"portrait"},{"src":"images/gallery/portrait-3.jpg","fallback":"images/gallery-3.svg","title":"鍩庡競鍓奖","cat":"portrait"},{"src":"images/gallery/couple-1.jpg","fallback":"images/gallery-4.svg","title":"鐖辩殑鍏夊奖","cat":"couple"},{"src":"images/gallery/couple-2.jpg","fallback":"images/gallery-5.svg","title":"鎼烘墜鍚岃","cat":"couple"},{"src":"images/gallery/couple-3.jpg","fallback":"images/gallery-6.svg","title":"鐢滆湝鏃跺埢","cat":"couple"},{"src":"images/gallery/family-1.jpg","fallback":"images/gallery-7.svg","title":"瀹剁殑娓╁害","cat":"family"},{"src":"images/gallery/family-2.jpg","fallback":"images/gallery-8.svg","title":"骞哥鏃跺厜","cat":"family"},{"src":"images/gallery/family-3.jpg","fallback":"images/gallery-9.svg","title":"绔ョ湡骞翠唬","cat":"family"},{"src":"images/gallery/artistic-1.jpg","fallback":"images/gallery-10.svg","title":"鐏甸瓊涔嬬獥","cat":"artistic","vip":true},{"src":"images/gallery/artistic-2.jpg","fallback":"images/gallery-11.svg","title":"姊﹀够鍏夊奖","cat":"artistic","vip":true},{"src":"images/gallery/artistic-3.jpg","fallback":"images/gallery-12.svg","title":"鏃剁┖浜ら敊","cat":"artistic","vip":true}];
var SG_currentFilter="all";
var SG_visibleCount=8;
function renderGallery(filter,count){
  filter=filter||SG_currentFilter;
  count=count||SG_visibleCount;
  SG_currentFilter=filter;SG_visibleCount=count;
  var items=filter==="all"?SG_galleryItems:SG_galleryItems.filter(function(x){return x.cat===filter});
  var visible=items.slice(0,count);
  var isVip=SG_isVip();
  var grid=document.getElementById("worksGrid");if(!grid)return;
  grid.innerHTML=visible.map(function(item){
    var catName=SG_type(item.cat);
    var fb=item.fallback||"";
    if(item.vip&&!isVip){
      return '<div class="work-item locked" onclick="SG_openUnlock()"><img src="'+item.src+'" alt="'+item.title+'" onerror="this.onerror=null;this.src=\''+fb+'\'" class="work-img"><div class="work-overlay"><span class="lock-badge">馃敀 VIP</span><h3>'+item.title+'</h3><span>'+catName+'</span></div></div>';
    }
    return '<div class="work-item"><img src="'+item.src+'" alt="'+item.title+'" onerror="this.onerror=null;this.src=\''+fb+'\'" class="work-img"><div class="work-overlay"><h3>'+item.title+'</h3><span>'+catName+'</span></div></div>';
  }).join("");
  var btn=document.getElementById("loadMore");
  if(btn)btn.style.display=count>=items.length?"none":"inline-block";
  document.querySelectorAll(".filter-btn").forEach(function(b){
    b.classList.toggle("active",b.dataset.filter===filter);
  });
}
// ===== Init =====
SG_updateNav();
document.addEventListener("DOMContentLoaded",function(){
  setTimeout(function(){
    var l=document.getElementById("loader");
    if(l){l.classList.add("hidden");document.body.style.overflow=""}
  },1000);
  renderGallery();
  document.querySelectorAll(".filter-btn").forEach(function(btn){
    btn.addEventListener("click",function(){renderGallery(this.dataset.filter)});
  });
  var lm=document.getElementById("loadMore");
  if(lm)lm.addEventListener("click",function(){SG_visibleCount+=8;renderGallery()});
  window.addEventListener("scroll",function(){
    var nav=document.getElementById("navbar");
    if(nav)nav.classList.toggle("scrolled",window.scrollY>50);
  });
  var nt=document.getElementById("navToggle");
  var nm=document.getElementById("navMenu");
  if(nt)nt.addEventListener("click",function(){
    this.classList.toggle("active");
    if(nm)nm.classList.toggle("active");
  });
  document.querySelectorAll('.nav-link[href^="#"]').forEach(function(a){
    a.addEventListener("click",function(e){
      var target=document.querySelector(this.getAttribute("href"));
      if(target){e.preventDefault();target.scrollIntoView({behavior:"smooth"})}
      if(nm)nm.classList.remove("active");
    });
  });
  // Scroll reveal animation
  var revealEls = document.querySelectorAll('.section-header, .service-card, .photographer-card, .work-item, .testimonial-card, .about-content, .booking-container, .vip-teaser, .pricing-card');
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach(function(el) {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Booking filter change
  var bf=document.getElementById("bookingFilter");
  if(bf)bf.addEventListener("change",function(){SG_renderAdminBookings()});
});

