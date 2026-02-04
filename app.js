/************ GAMES ************/
let games = [
  "Kalyan Morning","Time Bazar","Milan Day","Rajdhani Day","Kalyan",
  "Milan Night","Rajdhani Night","Kalyan Night"
];

let rate = {
  single: 90,
  jodi: 950,
  singlep: 1400,
  doublep: 2800,
  triplep: 6000
};

if (document.getElementById("games")) {
  document.getElementById("bal").innerText = localStorage.getItem("coins") || 0;
  let gamesDiv = document.getElementById("games");

  games.forEach(g => {
    gamesDiv.innerHTML += `
      <div class="card game-row">
        <div>${g}<br><small style="color:green">Betting Running</small></div>
        <div class="play" onclick="openGame('${g}')">Play Now ▶</div>
      </div>`;
  });
}

function openGame(name){
  localStorage.setItem("gamename", name);
  location = "game.html";
}

if (document.getElementById("gname")) {
  document.getElementById("gname").innerText = localStorage.getItem("gamename");
}

function play(){
  let a = Number(document.getElementById("amt").value);
  let res = document.getElementById("res");
  let type = document.getElementById("type");

  if (a < 10) {
    res.innerHTML = "<span class='lose'>Min 10 required</span>";
    return;
  }

  let win = (a / 10) * rate[type.value];
  res.innerHTML = `<span class='win'>Winning Amount: ${win} coins</span>`;
}

/************ USERS / AUTH ************/
let users = JSON.parse(localStorage.getItem("users")) || {};

// REGISTER
function register(){
  let u = ruser.value.trim();
  let p = rpass.value.trim();

  if (!u || !p) return alert("Fill all fields");
  if (users[u]) return alert("User already exists");

  users[u] = { password: p, coins: 0, role: "user" };
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account Created");
}

// LOGIN
function login(){
  let u = luser.value.trim();
  let p = lpass.value.trim();

  if (users[u] && users[u].password === p) {
    localStorage.setItem("loggedUser", u);
    localStorage.setItem("coins", users[u].coins || 0);
    localStorage.setItem("role", users[u].role);

    location = (users[u].role === "admin") ? "admin.html" : "index.html";
  } else {
    alert("Invalid Login");
  }
}

// LOGOUT
function logout(){
  localStorage.removeItem("loggedUser");
  localStorage.removeItem("role");
  location = "login.html";
}

/************ ADD FUND REQUEST (USER) ************/
function sendRequest(){
  let amt = amount.value;
  let txn = document.getElementById("txn").value;
  let img = document.getElementById("img").files[0];

  if (!amt || !txn || !img) return alert("All fields required");

  let reader = new FileReader();
  reader.onload = function(){
    let reqs = JSON.parse(localStorage.getItem("fundRequests")) || [];

    reqs.push({
      user: localStorage.getItem("loggedUser"),
      amount: amt,
      txn: txn,
      image: reader.result,
      status: "pending"
    });

    localStorage.setItem("fundRequests", JSON.stringify(reqs));
    document.getElementById("msg").innerText =
      "Request sent. Waiting for admin approval.";
  };
  reader.readAsDataURL(img);
}

/************ ADMIN – FUND REQUESTS ************/
function loadFundRequests(){
  let reqs = JSON.parse(localStorage.getItem("fundRequests")) || [];
  let box = document.getElementById("fundList");
  if (!box) return;

  box.innerHTML = "";
  reqs.forEach((r,i)=>{
    if (r.status === "pending") {
      box.innerHTML += `
        <div style="border:1px solid #ccc;padding:10px;margin:10px">
          <b>User:</b> ${r.user}<br>
          <b>Coins:</b> ${r.amount}<br>
          <b>Txn:</b> ${r.txn}<br>
          <img src="${r.image}" width="120"><br><br>
          <button onclick="approveReq(${i})">Approve</button>
          <button onclick="rejectReq(${i})">Reject</button>
        </div>`;
    }
  });
}

function approveReq(i){
  let reqs = JSON.parse(localStorage.getItem("fundRequests"));
  let users = JSON.parse(localStorage.getItem("users"));

  let r = reqs[i];
  users[r.user].coins = (users[r.user].coins || 0) + Number(r.amount);
  r.status = "approved";

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("fundRequests", JSON.stringify(reqs));

  alert("Approved & Coins Added");
  loadFundRequests();
  loadUsers();
}

function rejectReq(i){
  let reqs = JSON.parse(localStorage.getItem("fundRequests"));
  reqs[i].status = "rejected";
  localStorage.setItem("fundRequests", JSON.stringify(reqs));
  alert("Rejected");
  loadFundRequests();
}

/************ ADMIN – USERS ************/
function loadUsers(){
  let users = JSON.parse(localStorage.getItem("users")) || {};
  let table = document.getElementById("userTable");
  if (!table) return;

  table.innerHTML =
    "<tr><th>User</th><th>Coins</th><th>Update</th></tr>";

  for (let u in users) {
    if (users[u].role !== "admin") {
      table.innerHTML += `
        <tr>
          <td>${u}</td>
          <td>${users[u].coins}</td>
          <td>
            <input id="c_${u}" type="number">
            <button onclick="updateCoins('${u}')">Save</button>
          </td>
        </tr>`;
    }
  }
}

function updateCoins(user){
  let users = JSON.parse(localStorage.getItem("users"));
  let val = document.getElementById("c_" + user).value;
  if (!val) return alert("Enter coins");

  users[user].coins = Number(val);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Coins Updated");
  loadUsers();
}

/************ ADMIN – GAME RATES ************/
function saveRate(){
  let t = gtype.value;
  let r = grate.value;
  if (!r) return alert("Enter rate");

  localStorage.setItem("rate_" + t, r);
  rateMsg.innerText = "Rate saved for " + t;
}
/************ WITHDRAW SYSTEM ************/
/************ ADMIN – ADD FUND REQUESTS ************/
function loadFundRequests(){
  let box = document.getElementById("fundList");
  if(!box) return;

  let reqs = JSON.parse(localStorage.getItem("fundRequests")) || [];
  box.innerHTML = "";

  reqs.forEach((r,i)=>{
    if(r.status === "pending"){
      box.innerHTML += `
        <div class="card">
          <b>User:</b> ${r.user}<br>
          <b>Coins:</b> ${r.amount}<br>
          <b>Txn:</b> ${r.txn}<br>
          <img src="${r.image}" width="120"><br><br>

          <button onclick="approveFund(${i})">Approve</button>
          <button onclick="rejectFund(${i})">Reject</button>
        </div>`;
    }
  });
}

function approveFund(i){
  let reqs = JSON.parse(localStorage.getItem("fundRequests"));
  let users = JSON.parse(localStorage.getItem("users"));

  let r = reqs[i];
  users[r.user].coins = (users[r.user].coins || 0) + Number(r.amount);
  r.status = "approved";

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("fundRequests", JSON.stringify(reqs));

  alert("Fund Approved");
  loadFundRequests();
  loadUsers();
}

function rejectFund(i){
  let reqs = JSON.parse(localStorage.getItem("fundRequests"));
  reqs[i].status = "rejected";
  localStorage.setItem("fundRequests", JSON.stringify(reqs));

  alert("Fund Rejected");
  loadFundRequests();
}

/************ RESULT DECLARATION ************/
function declareResult(){
  let g = gameName.value.trim();
  let r = gameResult.value.trim();
  if(!g || !r) return alert("Fill all");

  let results = JSON.parse(localStorage.getItem("results")) || {};
  results[g] = r;
  localStorage.setItem("results",JSON.stringify(results));

  resultMsg.innerText = "Result declared for " + g;
}
/************ USER – SEND WITHDRAW REQUEST ************/
function sendWithdraw(){
  let name = document.getElementById("wname").value.trim();
  let acc  = document.getElementById("wacc").value.trim();
  let ifsc = document.getElementById("wifsc").value.trim();
  let upi  = document.getElementById("wupi").value.trim();
  let amt  = Number(document.getElementById("wamt").value);

  if(!name || !acc || !ifsc || !amt){
    alert("Please fill all required fields");
    return;
  }

  let user = localStorage.getItem("loggedUser");
  let users = JSON.parse(localStorage.getItem("users"));

  if(!users[user] || users[user].coins < amt){
    alert("Insufficient balance");
    return;
  }

  let reqs = JSON.parse(localStorage.getItem("withdrawRequests")) || [];

  reqs.push({
    user: user,
    amount: amt,
    name: name,
    account: acc,
    ifsc: ifsc,
    upi: upi,
    status: "pending"
  });

  localStorage.setItem("withdrawRequests", JSON.stringify(reqs));
  document.getElementById("wmsg").innerText =
    "Withdraw request sent. Waiting for admin approval.";
}
