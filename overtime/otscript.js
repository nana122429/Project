let startTimeRecord = null;

// =============================
// 🕓 แปลงนาทีเป็นทศนิยม
// =============================
function convertMinutesToDecimal(minutes) {
  if (minutes < 8) return 0.00;
  if (minutes < 14) return 0.17;
  if (minutes < 18) return 0.25;
  if (minutes < 28) return 0.33;
  if (minutes < 38) return 0.50;
  if (minutes < 44) return 0.67;
  if (minutes < 48) return 0.75;
  if (minutes < 58) return 0.83;
  return 1.00;
}

// =============================
// 🟢 เริ่มเข้างาน
// =============================
function startWork() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  startTimeRecord = `${h}:${m}`;
  document.getElementById("startDisplay").innerText = `เวลาเข้า: ${startTimeRecord}`;
  document.getElementById("endDisplay").innerText = "";
  document.getElementById("otResult").innerText = "กำลังบันทึกเวลา...";
}

// =============================
// 🔴 ออกงาน + คำนวณ OT
// =============================
function endWork() {
  if (!startTimeRecord) {
    alert("กรุณากดเริ่มเข้างานก่อน");
    return;
  }

  const salary = Number(document.getElementById("salary").value) || 0;
  const date = document.getElementById("otDate").value;
  const rate = Number(document.getElementById("otRate").value) || 1;
  const note = document.getElementById("note").value;

  if (!date || salary <= 0) {
    alert("กรุณากรอกข้อมูลให้ครบ (เงินเดือนและวันที่)");
    return;
  }

  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const endTimeRecord = `${h}:${m}`;
  document.getElementById("endDisplay").innerText = `เวลาออก: ${endTimeRecord}`;

  calculateAndSave(date, salary, rate, startTimeRecord, endTimeRecord, note);
  startTimeRecord = null;
}

// =============================
// ✍️ Manual Toggle
// =============================
function toggleManual() {
  const box = document.getElementById("manualBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

// =============================
// 📋 Manual Add
// =============================
function manualAdd() {
  const salary = Number(document.getElementById("salary").value) || 0;
  const date = document.getElementById("mDate").value;
  const start = document.getElementById("mStart").value;
  const end = document.getElementById("mEnd").value;
  const rate = Number(document.getElementById("mRate").value);
  const note = document.getElementById("mNote").value;

  if (!date || !start || !end || salary <= 0) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  calculateAndSave(date, salary, rate, start, end, note);
  document.getElementById("manualBox").style.display = "none";
}

// =============================
// 💰 คำนวณและบันทึกข้อมูล
// =============================
function calculateAndSave(date, salary, rate, start, end, note) {
  const startTime = new Date(`2000-01-01T${start}:00`);
  const endTime = new Date(`2000-01-01T${end}:00`);
  const diffMs = endTime - startTime;

  if (diffMs <= 0) {
    alert("เวลาออกต้องมากกว่าเวลาเข้า");
    return;
  }

  const totalMinutes = diffMs / 1000 / 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  const decimalHours = hours + convertMinutesToDecimal(minutes);
  const hourlyRate = salary / 30 / 8;
  const otPay = hourlyRate * rate * decimalHours;

  let timeDetail = hours === 0 ? `${minutes} นาที` :
                   minutes === 0 ? `${hours} ชั่วโมง` :
                   `${hours} ชั่วโมง ${minutes} นาที`;

  document.getElementById("otResult").innerText =
    `วันที่: ${date}\n` +
    `เวลา: ${start} - ${end}\n` +
    `รวมเวลา: ${timeDetail}\n` +
    `รวมค่า OT: ${otPay.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท`;

  const otData = JSON.parse(localStorage.getItem("otData")) || [];
  otData.push({
    id: Date.now(),
    date, start, end, hours, minutes, rate, pay: otPay, note
  });
  localStorage.setItem("otData", JSON.stringify(otData));

  renderOT();
}

// =============================
// 🧾 แสดงรายการทั้งหมด
// =============================
function renderOT() {
  const otData = JSON.parse(localStorage.getItem("otData")) || [];
  const list = document.getElementById("otList");
  list.innerHTML = "";

  if (otData.length === 0) {
    list.innerHTML = "<li style='color:#888;'>ยังไม่มีข้อมูล OT</li>";
    return;
  }

  const totalPay = otData.reduce((sum, i) => sum + i.pay, 0);
  const totalBox = document.createElement("div");
  totalBox.className = "total-box";
  totalBox.innerHTML = `💰 รวมค่า OT ทั้งหมด: ${totalPay.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท`;
  list.appendChild(totalBox);

  otData.forEach(item => {
    const li = document.createElement("li");
    const timeDetail = item.hours === 0 ? `${item.minutes} นาที` :
                       item.minutes === 0 ? `${item.hours} ชั่วโมง` :
                       `${item.hours} ชั่วโมง ${item.minutes} นาที`;
    li.innerHTML = `
      <div>
        <strong>${item.date}</strong> (${item.start} - ${item.end})<br>
        ⏱ ${timeDetail} ×${item.rate} = 
        <span style="color:#0f0;">${item.pay.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> บาท
        ${item.note ? "<br>📝 " + item.note : ""}
      </div>
      <button class="delete-btn" onclick="deleteOT(${item.id})">ลบ</button>`;
    list.appendChild(li);
  });

  const clearBtn = document.createElement("button");
  clearBtn.innerText = "🗑️ ลบทั้งหมด";
  clearBtn.className = "clear-btn";
  clearBtn.onclick = clearAllOT;
  list.appendChild(clearBtn);
}

// =============================
// ❌ ลบข้อมูล
// =============================
function deleteOT(id) {
  if (!confirm("ต้องการลบรายการนี้หรือไม่?")) return;
  let otData = JSON.parse(localStorage.getItem("otData")) || [];
  otData = otData.filter(item => item.id !== id);
  localStorage.setItem("otData", JSON.stringify(otData));
  renderOT();
}

function clearAllOT() {
  if (!confirm("⚠️ ต้องการลบข้อมูล OT ทั้งหมดหรือไม่?")) return;
  localStorage.removeItem("otData");
  renderOT();
}

window.onload = renderOT;
