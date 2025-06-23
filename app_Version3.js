// Vul hieronder het juiste script-ID van je eigen Google Apps Script webapp in!
const SHEET_API = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Alle boeken worden via het Google Sheet backend opgehaald, maar hieronder een fallback voor als backend niet bereikbaar is:
const booksFallback = {
  "A1–A2": {
    "Avontuur": [
      {title:"The Treasure of the Loch Ness Monster", author:"Lari Don", cover:"https://covers.openlibrary.org/b/id/9788928-L.jpg"},
      {title:"The Enormous Crocodile", author:"Roald Dahl", cover:"https://covers.openlibrary.org/b/id/10614653-L.jpg"},
      {title:"The Lighthouse Keeper’s Lunch", author:"Ronda Armitage", cover:"https://covers.openlibrary.org/b/id/10814797-L.jpg"},
      {title:"The Pirates Next Door", author:"Jonny Duddle", cover:"https://covers.openlibrary.org/b/id/8393670-L.jpg"},
      {title:"The Bear Scouts", author:"Stan & Jan Berenstain", cover:"https://covers.openlibrary.org/b/id/10507094-L.jpg"}
    ],
    // ... voeg hier ALLE genres en boeken toe volgens jouw lijst!
  },
  "B1": {
    "Avontuur": [
      {title:"The Wild Robot", author:"Peter Brown", cover:"https://covers.openlibrary.org/b/id/8378225-L.jpg"},
      {title:"Island of the Blue Dolphins", author:"Scott O'Dell", cover:"https://covers.openlibrary.org/b/id/8228821-L.jpg"},
      {title:"The Miraculous Journey of Edward Tulane", author:"Kate DiCamillo", cover:"https://covers.openlibrary.org/b/id/8230994-L.jpg"},
      {title:"Hatchet", author:"Gary Paulsen", cover:"https://covers.openlibrary.org/b/id/8228742-L.jpg"},
      {title:"The Invention of Hugo Cabret", author:"Brian Selznick", cover:"https://covers.openlibrary.org/b/id/8228706-L.jpg"}
    ],
    // ... voeg hier ALLE genres en boeken toe volgens jouw lijst!
  }
};

// Backend: Boekentips ophalen uit Google Sheet
async function fetchSheetTips(niveau, genre) {
  const url = `${SHEET_API}?action=getTips&niveau=${encodeURIComponent(niveau)}&genre=${encodeURIComponent(genre)}`;
  const res = await fetch(url);
  return await res.json();
}

// Backend: Boekentip delen
async function shareTip(tip) {
  await fetch(SHEET_API, {
    method: "POST",
    body: JSON.stringify({...tip, action:"addTip"}),
    headers: {"Content-Type":"application/json"}
  });
}

// Backend: Boek loggen
async function addToLogboek(log) {
  await fetch(SHEET_API, {
    method: "POST",
    body: JSON.stringify({...log, action:"addLog"}),
    headers: {"Content-Type":"application/json"}
  });
}

// Boekentips tonen
document.getElementById("boekForm").onsubmit = async function(e){
  e.preventDefault();
  const niveau = document.getElementById("niveau").value;
  const genre = document.getElementById("genre").value;
  let tipList = booksFallback[niveau]?.[genre] || [];
  // Voeg gedeelde tips toe
  try {
    const shared = await fetchSheetTips(niveau, genre);
    tipList = tipList.concat(shared);
  } catch(e){
    // als geen backend, gewoon lokale lijst tonen
  }
  document.getElementById("tips").innerHTML = tipList.length
    ? `<div class="tips-list">${tipList.map(tip=>`
      <div class="boek">
        <img src="${tip.cover||'https://via.placeholder.com/90x130?text=No+Cover'}" alt="cover">
        <div class="boek-title">${tip.title}</div>
        <div class="boek-author">${tip.author}</div>
        <button class="add-log" onclick="window.addToLogboekUI('${niveau}','${genre}','${tip.title.replace(/'/g,"&apos;")}', '${tip.author.replace(/'/g,"&apos;")}', '${tip.cover||''}')">➕ Log</button>
      </div>
    `).join('')}</div>`
    : "Geen tips gevonden.";
};

// Logboek bijhouden (frontend + backend)
window.addToLogboekUI = async (niveau, genre, title, author, cover) => {
  const log = {niveau, genre, title, author, cover, timestamp: new Date().toISOString()};
  await addToLogboek(log);
  alert("Toegevoegd aan je leeslogboek!");
  // eventueel logboek opnieuw ophalen/tonen
}

// Boekentip delen (frontend + backend)
document.getElementById("tipFormSection").innerHTML = `
  <form id="tipForm">
    <h3>💡 Deel jouw boekentip!</h3>
    <input type="text" id="tipTitle" placeholder="Titel" required>
    <input type="text" id="tipAuthor" placeholder="Auteur" required>
    <input type="text" id="tipCover" placeholder="Cover URL (optioneel)">
    <button type="submit">Tip delen</button>
    <div id="tipConfirm"></div>
  </form>
`;

document.getElementById("tipForm").onsubmit = async function(e){
  e.preventDefault();
  const niveau = document.getElementById("niveau").value;
  const genre = document.getElementById("genre").value;
  const tip = {
    niveau,
    genre,
    title: document.getElementById("tipTitle").value,
    author: document.getElementById("tipAuthor").value,
    cover: document.getElementById("tipCover").value
  };
  await shareTip(tip);
  document.getElementById("tipConfirm").innerText = "Tip gedeeld!";
  document.getElementById("tipForm").reset();
};