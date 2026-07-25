/* 时光肖像馆 - 主脚本 v2 */
// ===== 种子数据 =====
if(!localStorage.getItem("sg_users")) localStorage.setItem("sg_users",JSON.stringify([
  {id:1,username:"admin",password:"admin888",role:"admin",name:"管理员",phone:"15532061331",email:"19331022216@163.com",regTime:"2025/01/01 00:00:00",regIP:"127.0.0.1",regLoc:"中国 北京"},
  {id:2,username:"user",password:"user888",role:"user",name:"张三",phone:"13800138000",email:""}
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

// ===== 工具函数 =====
function SG_g(k){return JSON.parse(localStorage.getItem("sg_"+k)||"null")}
function SG_s(k,v){localStorage.setItem("sg_"+k,JSON.stringify(v))}
function SG_ses(){return SG_g("session")}
function SG_uid(){var s=SG_ses();return s?s.id:null}
function SG_isVip(){var u=SG_uid(),v=SG_g("vip");return u&&v?!!v[u]:false}
function SG_type(t){var m={portrait:"个人写真",couple:"情侣写真",family:"家庭肖像",artistic:"艺术肖像",other:"其他"};return m[t]||t}
function SG_st(s){var m={pending:"待处理",approved:"已确认",rejected:"已拒绝",completed:"已完成"};return m[s]||s}

// ===== Nav =====
function SG_goBack(){window.location.href='index.html'}
function SG_updateNav(){
  var s=SG_ses();
  var lb=document.getElementById("navLoginBtn");
  var ud=document.getElementById("navUserDropdown");
  if(!lb||!ud)return;
  if(s){lb.style.display="none";ud.style.display="block";document.getElementById("navUserName").textContent="👤 "+s.name;
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
  if(!user){document.getElementById("loginError").textContent="用户名或密码错误";return false}
  SG_s("session",{id:user.id,username:user.username,role:user.role,name:user.name});
  SG_closeAuth();SG_updateNav();
  return false;
}
var SG_verifyCode=null;
function SG_sendCode(){
  var ph=document.getElementById("regPhone").value.trim();
  var err=document.getElementById("regError");
  if(!ph||ph.length<11){err.textContent="请输入正确的手机号";return}
  var users=SG_g("users")||[];
  if(users.find(function(x){return x.phone===ph})){err.textContent="该手机号已注册";return}
  SG_verifyCode=String(Math.floor(1000+Math.random()*9000));
  var btn=document.getElementById("sendCodeBtn");
  alert("验证码: "+SG_verifyCode+"\n(模拟短信发送至 "+ph+")");
  btn.disabled=true;var sec=60;
  var timer=setInterval(function(){
    sec--;
    if(sec<=0){clearInterval(timer);btn.disabled=false;btn.textContent="获取验证码"}
    else{btn.textContent=sec+"s后重发"}
  },1000);
}

function SG_doRegister(){
  var u=document.getElementById("regUsername").value.trim();
  var p=document.getElementById("regPassword").value.trim();
  var ph=document.getElementById("regPhone").value.trim();
  var code=document.getElementById("regCode").value.trim();
  var err=document.getElementById("regError");
  if(!u||!p||!ph||!code){err.textContent="请填写完整信息";return false}
  if(u.length<2){err.textContent="用户名至少2个字符";return false}
  if(p.length<8){err.textContent="密码不能少于8个字符";return false}
  if(!SG_verifyCode||code!==SG_verifyCode){err.textContent="验证码错误";return false}
  var users=SG_g("users")||[];
  if(users.find(function(x){return x.username===u})){err.textContent="用户名已存在";return false}
  if(users.find(function(x){return x.phone===ph})){err.textContent="该手机号已注册";return false}
  var geo={ip:"未知",loc:"未知"};
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
      users2[idx2].regLoc=((d.country||"")+" "+(d.city||"")).trim().replace(/China/gi,"中国").replace(/Beijing/gi,"北京").replace(/Shanghai/gi,"上海").replace(/Guangdong/gi,"广东").replace(/Zhejiang/gi,"浙江").replace(/Jiangsu/gi,"江苏").replace(/Sichuan/gi,"四川").replace(/Hubei/gi,"湖北").replace(/Fujian/gi,"福建").replace(/Shandong/gi,"山东").replace(/Hong Kong/gi,"香港");
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
  document.getElementById("unlockPrice").textContent="下一步：扫码支付 ¥"+price;
}
function SG_selectPay(m){
  SG_unlockPay=m;
  document.getElementById("payWechat").classList.toggle("active",m==="wechat");
  document.getElementById("payAlipay").classList.toggle("active",m==="alipay");
}
function SG_showQR(){
  var s=SG_ses();if(!s){alert("请先登录");return}
  document.getElementById("unlockStep1").style.display="none";
  document.getElementById("unlockStep2").style.display="block";
  var price=SG_unlockPlan==="monthly"?"9.9":"68";
  var planName=SG_unlockPlan==="monthly"?"月度会员":"年度会员";
  document.getElementById("qrPlanLabel").textContent=planName+" ¥"+price;
  var isWechat=SG_unlockPay==="wechat";
  document.getElementById("qrPayLabel").textContent="请使用"+(isWechat?"微信":"支付宝")+"扫码支付";
  document.getElementById("qrImage").src="images/qr-"+(isWechat?"wechat":"alipay")+".png";
  document.getElementById("qrConfirmBtn").textContent="✅ 我已完成支付 ¥"+price;
}
function SG_backToPlan(){
  document.getElementById("unlockStep2").style.display="none";
  document.getElementById("unlockStep1").style.display="block";
}
function SG_submitPayment(){
  var s=SG_ses();if(!s){alert("请先登录");return}
  var apps=SG_g("vipApps")||[];
  var planName=SG_unlockPlan==="monthly"?"月度会员":"年度会员";
  var price=SG_unlockPlan==="monthly"?"9.9":"68";
  apps.push({
    id:Date.now(),userId:s.id,username:s.username,name:s.name,
    plan:SG_unlockPlan,planName:planName,price:price,payMethod:SG_unlockPay,
    status:"pending",createdAt:new Date().toISOString()
  });
  SG_s("vipApps",apps);
  SG_closeUnlock();
  var t=document.getElementById("unlockToast");
  t.querySelector(".toast-text").textContent="支付申请已提交，等待管理员审核开通";
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
  btn.textContent="✓ 预约成功！";btn.style.background="#5a8a5a";btn.disabled=true;
  setTimeout(function(){btn.textContent="提交预约";btn.style.background="";btn.disabled=false;form.reset()},3000);
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
  document.getElementById("profileRole").value=u.role==="admin"?"管理员":"用户";
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
  el.textContent="✓ 个人信息已保存";
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
    return '<div class="booking-card"><div class="booking-info"><h4>'+SG_type(x.type)+'</h4><div class="booking-meta"><span>📅 '+x.date+'</span><span>📞 '+x.phone+'</span></div>'+(x.message?'<p style="margin-top:0.3rem;font-size:0.82rem;color:#999">备注: '+x.message+'</p>':"")+'</div><span class="booking-status status-'+x.status+'">'+SG_st(x.status)+'</span></div>';
  }).join("");
}
function SG_renderMyVip(){
  var card=document.getElementById("vipStatusCard");if(!card)return;
  if(SG_isVip()){card.innerHTML='<div class="vipicon">👑</div><h3>VIP会员</h3><p>您已解锁全部独家作品，畅享尊贵体验</p>';}
  else{card.innerHTML='<div class="vipicon">🔒</div><h3>未开通VIP</h3><p>开通VIP解锁全部独家作品</p><button class="btn" onclick="window.location.href=\'index.html#vip\'">去开通</button>';}
}

// ===== Admin Dashboard =====
function SG_renderAdminBookings(){
  var b=SG_g("bookings")||[];
  var f=document.getElementById("bookingFilter");
  var filter=f?f.value:"all";
  var filtered=filter==="all"?b:b.filter(function(x){return x.status===filter});
  var el=document.getElementById("bookingCount");if(el)el.textContent="共 "+filtered.length+" 条";
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
    if(x.status==="pending")act='<button class="btn-sm btn-approve" onclick="SG_approveBooking('+x.id+')">确认</button><button class="btn-sm btn-reject" onclick="SG_rejectBooking('+x.id+')">拒绝</button>';
    else if(x.status==="approved")act='<button class="btn-sm btn-complete" onclick="SG_completeBooking('+x.id+')">完成</button>';
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
    return "<tr><td>"+u.id+"</td><td>"+u.username+"</td><td>"+u.name+"</td><td>"+(u.phone||"-")+"</td><td>"+(u.role==="admin"?"🔧管理员":"👤用户")+"</td><td>"+(isVip?"✅VIP":"❌普通")+"</td><td>"+rt+"</td><td>"+(u.regLoc||"-")+"</td><td>"+(u.regIP||"-")+"</td><td>"+(u.role!=="admin"?'<button class="btn-sm btn-reject" onclick="SG_deleteUser('+u.id+')">删除</button>':"-")+"</td></tr>";
  }).join("");
}
function SG_deleteUser(id){
  if(!confirm("确定删除该用户？"))return;
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
    return "<tr><td>"+u.id+"</td><td>"+u.username+"</td><td>"+u.name+"</td><td>"+(isVip?"✅VIP":"❌普通")+"</td><td>"+(isVip?"永久":"-")+"</td><td>"+(isVip?'<button class="btn-sm btn-reject" onclick="SG_removeVip('+u.id+')">取消VIP</button>':'<button class="btn-sm btn-approve" onclick="SG_addVip('+u.id+')">开通VIP</button>')+"</td></tr>";
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
    var st=a.status==="pending"?"<span class=\"badge badge-pend\">待审核</span>":a.status==="approved"?"<span class=\"badge badge-ok\">已开通</span>":"<span class=\"badge badge-no\">已拒绝</span>";
    var act=a.status==="pending"?'<button class="btn-xs btn-ok" onclick="SG_approveVipApp('+a.id+')">确认收款</button><button class="btn-xs btn-no" onclick="SG_rejectVipApp('+a.id+')">拒绝</button>':"-";
    return "<tr><td>"+a.name+" ("+a.username+")</td><td>"+a.planName+"</td><td>¥"+a.price+"</td><td>"+(a.payMethod==="wechat"?"💚微信":"💙支付宝")+"</td><td>"+(a.createdAt?a.createdAt.slice(0,10):"-")+"</td><td>"+st+"</td><td>"+act+"</td></tr>";
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
  var el=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v};
  el("statTotalBookings",b.length);
  el("statPendingBookings",b.filter(function(x){return x.status==="pending"}).length);
  el("statTotalUsers",users.length);
  el("statTotalVip",vc);
  var va=SG_g("vipApps")||[];
  el("statPendingVipApps",va.filter(function(x){return x.status==="pending"}).length);
}

// ===== AI Generation Log =====
function SG_saveAILog(data){
  var logs=SG_g("aiLogs")||[];
  logs.push({
    id:Date.now(),
    userId:data.userId||null,
    username:data.username||"游客",
    style:data.style||"未知",
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
    return "<tr><td>"+l.username+"</td><td>"+l.style+"</td><td style='max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' title='"+l.prompt+"'>"+(l.prompt||"-")+"</td><td>"+(l.imageUrl?'<a href="'+l.imageUrl+'" target="_blank" style="color:#c5a572">查看图片</a>':"-")+"</td><td>"+l.createdAt+"</td></tr>";
  }).join("");
}

// ===== Gallery =====
var SG_galleryItems=[
  {src:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=800&fit=crop",fallback:"images/gallery-1.svg",title:"晨光微露",cat:"portrait"},
  {src:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=800&fit=crop",fallback:"images/gallery-2.svg",title:"静谧时光",cat:"portrait"},
  {src:"https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=800&fit=crop",fallback:"images/gallery-3.svg",title:"城市剪影",cat:"portrait"},
  {src:"https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=800&fit=crop",fallback:"images/gallery-4.svg",title:"爱的光影",cat:"couple"},
  {src:"https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=800&fit=crop",fallback:"images/gallery-5.svg",title:"携手同行",cat:"couple"},
  {src:"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=800&fit=crop",fallback:"images/gallery-6.svg",title:"甜蜜时刻",cat:"couple"},
  {src:"https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=800&fit=crop",fallback:"images/gallery-7.svg",title:"家的温度",cat:"family"},
  {src:"https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=400&h=800&fit=crop",fallback:"images/gallery-8.svg",title:"幸福时光",cat:"family"},
  {src:"https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&h=800&fit=crop",fallback:"images/gallery-9.svg",title:"童真年代",cat:"family"},
  {src:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=800&fit=crop",fallback:"images/gallery-10.svg",title:"灵魂之窗",cat:"artistic",vip:true},
  {src:"https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=800&fit=crop",fallback:"images/gallery-11.svg",title:"梦幻光影",cat:"artistic",vip:true},
  {src:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=800&fit=crop",fallback:"images/gallery-12.svg",title:"时空交错",cat:"artistic",vip:true}
];
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
      return '<div class="work-item locked" onclick="SG_openUnlock()"><img src="'+item.src+'" alt="'+item.title+'" onerror="this.onerror=null;this.src=\''+fb+'\'" class="work-img"><div class="work-overlay"><span class="lock-badge">🔒 VIP</span><h3>'+item.title+'</h3><span>'+catName+'</span></div></div>';
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

