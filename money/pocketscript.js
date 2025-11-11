let income = JSON.parse(localStorage.getItem("income")) || { salary: 12500, license: 0, incentive: 0, ot: 0 };
let fixed = JSON.parse(localStorage.getItem("fixed")) || { rent: 3500, water: 100, elecStart: 0, elecNow: 0, totalElec: 0 };
let dailyRecords = JSON.parse(localStorage.getItem("dailyRecords")) || [];
let extraRecords = JSON.parse(localStorage.getItem("extraRecords")) || [];

function updateSummary() {
  const totalExtra = extraRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalIncome = income.salary + income.license + income.incentive + income.ot + totalExtra;
  const totalDaily = dailyRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = fixed.rent + fixed.water + fixed.totalElec + totalDaily;
  const balance = totalIncome - totalExpense;

  document.getElementById("totalIncome").innerText = totalIncome.toLocaleString();
  document.getElementById("totalExpense").innerText = totalExpense.toLocaleString();
  document.getElementById("balance").innerText = balance.toLocaleString();
  document.getElementById("totalDaily").innerText = totalDaily.toLocaleString();
  document.getElementById("totalExtra").innerText = totalExtra.toLocaleString();

  renderDailyLog();
  renderExtraLog();
  toggleScroll();
}

/* ✅ เปิด Scroll เมื่อรายการเกิน 7 รายการ */
function toggleScroll() {
  const dailyLog = document.getElementById("dailyLog");
  const extraLog = document.getElementById("extraLog");

  if (dailyRecords.length > 7) dailyLog.classList.add("scroll-active");
  else dailyLog.classList.remove("scroll-active");

  if (extraRecords.length > 7) extraLog.classList.add("scroll-active");
  else extraLog.classList.remove("scroll-active");
}

/* ✅ ฟังก์ชันเพิ่ม / ลบ / render เดิม */
function addDailyRecord(type) {
  const amount = Number(document.getElementById(type).value) || 0;
  const note = document.getElementById(type + "Note").value.trim();
  if (amount <= 0) return alert("กรุณากรอกจำนวนเงิน");
  const label =
    type === "food" ? "ค่ากินอยู่" :
    type === "fuel" ? "ค่าน้ำมันรถ" : "ค่าใช้จ่ายเพิ่มเติม";
  dailyRecords.push({ type, label, amount, note });
  localStorage.setItem("dailyRecords", JSON.stringify(dailyRecords));
  document.getElementById(type).value = "";
  document.getElementById(type + "Note").value = "";
  updateSummary();
}

function renderDailyLog() {
  const el = document.getElementById("dailyLog");
  el.innerHTML = dailyRecords.length
    ? dailyRecords.map(
        (r, i) => `
        <div class='log-item'>
          <span>• ${r.label}: ${r.amount.toLocaleString()} บาท${r.note ? " — " + r.note : ""}</span>
          <button onclick='deleteDailyRecord(${i})'>🗑️</button>
        </div>`
      ).join("")
    : "<p style='text-align:center;color:#777;'>ไม่มีรายการบันทึก</p>";
}

function deleteDailyRecord(i) {
  if (!confirm("ลบรายการนี้?")) return;
  dailyRecords.splice(i, 1);
  localStorage.setItem("dailyRecords", JSON.stringify(dailyRecords));
  updateSummary();
}

function addExtraRecord(type) {
  const amount = Number(document.getElementById(type).value) || 0;
  const note = document.getElementById(type + "Note").value.trim();
  if (amount <= 0) return alert("กรุณากรอกจำนวนเงิน");
  const label = type === "trip" ? "เดินทางต่างจังหวัด" : "รายรับอื่นๆ";
  extraRecords.push({ type, label, amount, note });
  localStorage.setItem("extraRecords", JSON.stringify(extraRecords));
  document.getElementById(type).value = "";
  document.getElementById(type + "Note").value = "";
  updateSummary();
}

function renderExtraLog() {
  const el = document.getElementById("extraLog");
  el.innerHTML = extraRecords.length
    ? extraRecords.map(
        (r, i) => `
        <div class='log-item'>
          <span>• ${r.label}: ${r.amount.toLocaleString()} บาท${r.note ? " — " + r.note : ""}</span>
          <button onclick='deleteExtraRecord(${i})'>🗑️</button>
        </div>`
      ).join("")
    : "<p style='text-align:center;color:#777;'>ไม่มีรายการบันทึก</p>";
}

function deleteExtraRecord(i) {
  if (!confirm("ลบรายการนี้?")) return;
  extraRecords.splice(i, 1);
  localStorage.setItem("extraRecords", JSON.stringify(extraRecords));
  updateSummary();
}

/* ✅ โหลดข้อมูลตอนเปิดหน้า */
window.onload = () => { updateSummary(); };
/* 🧹 ล้างข้อมูลทั้งหมด */
function resetAll() {
  if (!confirm("⚠️ ต้องการล้างข้อมูลทั้งหมดใช่หรือไม่?\nข้อมูลทั้งหมดจะถูกลบถาวร!")) return;
  localStorage.clear();
  alert("✅ ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว");
  location.reload();
}
