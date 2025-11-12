// ✅ โหลดค่าจาก LocalStorage (หรือค่าเริ่มต้น)
let income = JSON.parse(localStorage.getItem("income")) || { salary: 12500, license: 0, incentive: 0, ot: 0 };
let fixed = JSON.parse(localStorage.getItem("fixed")) || { rent: 3500, water: 100, elecStart: 0, elecNow: 0, totalElec: 0 };
let dailyRecords = JSON.parse(localStorage.getItem("dailyRecords")) || [];
let extraRecords = JSON.parse(localStorage.getItem("extraRecords")) || [];

// ✅ โหลดค่าลง input ตอนเปิดหน้า
window.onload = () => {
  document.getElementById("salary").value = income.salary;
  document.getElementById("license").value = income.license;
  document.getElementById("incentive").value = income.incentive;
  document.getElementById("ot").value = income.ot;

  document.getElementById("rent").value = fixed.rent;
  document.getElementById("water").value = fixed.water;
  document.getElementById("elecStart").value = fixed.elecStart;
  document.getElementById("elecNow").value = fixed.elecNow;

  // เปลี่ยนปุ่มเป็น "อัพเดท" ถ้ามีข้อมูลใน localStorage
  if (localStorage.getItem("income")) document.getElementById("btn-income").innerText = "อัพเดทรายรับ";
  if (localStorage.getItem("fixed")) document.getElementById("btn-fixed").innerText = "อัพเดทค่าใช้จ่าย";

  updateSummary();
};

// ✅ บันทึก/อัพเดทรายรับ
function saveIncome() {
  income = {
    salary: Number(document.getElementById("salary").value) || 0,
    license: Number(document.getElementById("license").value) || 0,
    incentive: Number(document.getElementById("incentive").value) || 0,
    ot: Number(document.getElementById("ot").value) || 0,
  };
  localStorage.setItem("income", JSON.stringify(income));
  document.getElementById("btn-income").innerText = "อัพเดทรายรับ";
  alert("✅ บันทึกข้อมูลรายรับเรียบร้อยแล้ว");
  updateSummary();
}

// ✅ เคลียร์รายรับ
function clearIncome() {
  if (!confirm("ต้องการล้างข้อมูลรายรับทั้งหมดหรือไม่?")) return;
  localStorage.removeItem("income");
  income = { salary: 12500, license: 0, incentive: 0, ot: 0 };
  document.getElementById("salary").value = income.salary;
  document.getElementById("license").value = "";
  document.getElementById("incentive").value = "";
  document.getElementById("ot").value = "";
  document.getElementById("btn-income").innerText = "บันทึกรายรับ";
  updateSummary();
}

// ✅ บันทึก/อัพเดทค่าที่พักอาศัย
function saveFixed() {
  const elecStart = Number(document.getElementById("elecStart").value) || 0;
  const elecNow = Number(document.getElementById("elecNow").value) || 0;
  const totalElec = (elecNow - elecStart) * 7; // คิดหน่วยละ 7 บาท
  fixed = {
    rent: Number(document.getElementById("rent").value) || 0,
    water: Number(document.getElementById("water").value) || 0,
    elecStart,
    elecNow,
    totalElec: totalElec > 0 ? totalElec : 0,
  };
  localStorage.setItem("fixed", JSON.stringify(fixed));
  document.getElementById("btn-fixed").innerText = "อัพเดทค่าใช้จ่าย";
  document.getElementById("elecResult").innerText = `💡 ค่าไฟ ${fixed.totalElec.toLocaleString()} บาท`;
  document.getElementById("totalFixed").innerText = `รวมทั้งหมด ${(fixed.rent + fixed.water + fixed.totalElec).toLocaleString()} บาท`;
  alert("✅ บันทึกข้อมูลค่าใช้จ่ายเรียบร้อยแล้ว");
  updateSummary();
}

// ✅ เคลียร์ค่าที่พักอาศัย
function clearFixed() {
  if (!confirm("ต้องการล้างข้อมูลค่าใช้จ่ายทั้งหมดหรือไม่?")) return;
  localStorage.removeItem("fixed");
  fixed = { rent: 3500, water: 100, elecStart: 0, elecNow: 0, totalElec: 0 };
  document.getElementById("rent").value = fixed.rent;
  document.getElementById("water").value = fixed.water;
  document.getElementById("elecStart").value = "";
  document.getElementById("elecNow").value = "";
  document.getElementById("elecResult").innerText = "";
  document.getElementById("totalFixed").innerText = "";
  document.getElementById("btn-fixed").innerText = "บันทึกค่าใช้จ่าย";
  updateSummary();
}

// ✅ ฟังก์ชันคำนวณสรุปยอดรวมทั้งหมด
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

/* ✅ Scroll เมื่อมีรายการมากกว่า 7 */
function toggleScroll() {
  const dailyLog = document.getElementById("dailyLog");
  const extraLog = document.getElementById("extraLog");
  if (dailyRecords.length > 7) dailyLog.classList.add("scroll-active"); else dailyLog.classList.remove("scroll-active");
  if (extraRecords.length > 7) extraLog.classList.add("scroll-active"); else extraLog.classList.remove("scroll-active");
}

/* ✅ ฟังก์ชันรายจ่ายประจำ */
function addDailyRecord(type) {
  const amount = Number(document.getElementById(type).value) || 0;
  const note = document.getElementById(type + "Note").value.trim();
  if (amount <= 0) return alert("กรุณากรอกจำนวนเงิน");
  const label = type === "food" ? "ค่ากินอยู่" : type === "fuel" ? "ค่าน้ำมันรถ" : "ค่าใช้จ่ายเพิ่มเติม";
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

/* ✅ รายรับเพิ่มเติม */
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

/* ✅ ล้างข้อมูลทั้งหมด */
function resetAll() {
  if (!confirm("⚠️ ต้องการล้างข้อมูลทั้งหมดใช่หรือไม่?\nข้อมูลทั้งหมดจะถูกลบถาวร!")) return;
  localStorage.clear();
  alert("✅ ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว");
  location.reload();
}

// ✅ เคลียร์ข้อมูลค่าใช้จ่ายประจำ
function clearDaily() {
  if (!confirm("ต้องการล้างข้อมูลค่าใช้จ่ายประจำทั้งหมดหรือไม่?")) return;
  dailyRecords = [];
  localStorage.removeItem("dailyRecords");
  updateSummary();
  alert("✅ ล้างข้อมูลค่าใช้จ่ายประจำเรียบร้อยแล้ว");
}

// ✅ เคลียร์ข้อมูลรายรับเพิ่มเติม
function clearExtra() {
  if (!confirm("ต้องการล้างข้อมูลรายรับเพิ่มเติมทั้งหมดหรือไม่?")) return;
  extraRecords = [];
  localStorage.removeItem("extraRecords");
  updateSummary();
  alert("✅ ล้างข้อมูลรายรับเพิ่มเติมเรียบร้อยแล้ว");
}
