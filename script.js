let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = null;

let notes = JSON.parse(localStorage.getItem("calendarNotes")) || {};

function updateDateTime() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById("date").innerText = now.toLocaleDateString('th-TH', options);
  document.getElementById("time").innerText = now.toLocaleTimeString('th-TH');
}

/* ✅ สร้างปฏิทินแบบใหม่ */
function generateCalendar(month, year) {
  const today = new Date();
  const monthNames = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];
  const dayNames = ["อา","จ","อ","พ","พฤ","ศ","ส"];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `<div class="calendar-header">${monthNames[month]} ${year + 543}</div>`;
  html += `<div class="calendar-grid">`;
  for (let d of dayNames) html += `<div class="day-name">${d}</div>`;
  for (let i = 0; i < firstDay; i++) html += `<div class="day empty"></div>`;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const noteList = notes[dateKey] || [];
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    let numberHTML = isToday
      ? `<span>${day}</span>`
      : `<div class="day-number">${day}</div>`;

    let iconsHTML = "";
    if (noteList.includes("holiday") && noteList.includes("ot")) {
      iconsHTML = `<div class="note-icons"><div class="note-square holiday"></div><div class="note-square ot"></div></div>`;
    } else if (noteList.includes("holiday")) {
      iconsHTML = `<div class="note-icons"><div class="note-square holiday"></div></div>`;
    } else if (noteList.includes("ot")) {
      iconsHTML = `<div class="note-icons"><div class="note-square ot"></div></div>`;
    } else {
      iconsHTML = `<div class="note-icons"></div>`;
    }

    html += `<div class="day ${isToday ? 'today' : ''}" onclick="selectDate(${day},${month},${year})">${numberHTML}${iconsHTML}</div>`;
  }
  html += `</div>`;
  document.getElementById("calendar").innerHTML = html;
}

function prevMonth() { if (currentMonth > 0) currentMonth--; else { currentMonth=11; currentYear--; } generateCalendar(currentMonth,currentYear); }
function nextMonth() { if (currentMonth < 11) currentMonth++; else { currentMonth=0; currentYear++; } generateCalendar(currentMonth,currentYear); }

function selectDate(day,month,year){
  selectedDay = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  document.getElementById("selectedDate").innerText = `วันที่เลือก: ${day}/${month+1}/${year+543}`;
}

function addNote(type){
  if(!selectedDay){ alert("กรุณาเลือกวันก่อน"); return; }
  if(!notes[selectedDay]) notes[selectedDay]=[];
  if(!notes[selectedDay].includes(type)) notes[selectedDay].push(type);
  saveNotes(); generateCalendar(currentMonth,currentYear);
}
function removeNote(){
  if(!selectedDay){ alert("กรุณาเลือกวันก่อน"); return; }
  if(notes[selectedDay]) delete notes[selectedDay];
  saveNotes(); generateCalendar(currentMonth,currentYear);
}
function saveNotes(){ localStorage.setItem("calendarNotes",JSON.stringify(notes)); }

updateDateTime(); setInterval(updateDateTime,1000); generateCalendar(currentMonth,currentYear);
