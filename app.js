/* PASSWORT */
const PASSWORD = "jmk123";

const input = prompt("Passwort eingeben:");
if (input !== PASSWORD) {
  document.body.innerHTML = "<h1>Zugriff verweigert</h1>";
  throw new Error("Falsches Passwort");
}

document.getElementById("app").classList.remove("hidden");

/* DATEN */
let allData = [];

fetch("index.json")
  .then(r => r.json())
  .then(data => {
    allData = data.eintraege || [];

    showStand(data.stand); // 👈 NEU

    populateCategories(allData);
    populateGenres(allData);
    render(allData);
  });

/* STAND */
function showStand(dateString) {
  if (!dateString) return;

  const el = document.getElementById("standInfo");

  const date = new Date(dateString);

  const formatted = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  el.innerHTML = `<small>Stand: ${formatted}</small>`;
}

/* SIDEBAR */
const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menuToggle");

toggle.onclick = () => {
  sidebar.classList.toggle("active");
};

const closeBtn = document.getElementById("closeSidebar");

toggle.onclick = () => {
  sidebar.classList.add("active");
  overlay.classList.remove("hidden");
};

closeBtn.onclick = () => {
  sidebar.classList.remove("active");
  overlay.classList.add("hidden");
};

overlay.onclick = () => {
  sidebar.classList.remove("active");
  overlay.classList.add("hidden");
};

/* UPDATE Filter Status */
function updateFilterStatus(search, personSearch, category, genre) {
  const el = document.getElementById("filterStatus");

  let parts = [];

  if (search) parts.push(`Text: "${search}"`);
  if (personSearch) parts.push(`Person: "${personSearch}"`);
  if (category) parts.push(`Kategorie: ${category}`);
  if (genre) parts.push(`Genre: ${genre}`);

  if (parts.length === 0) {
    el.innerHTML = "<small>Keine Filter aktiv</small>";
  } else {
    el.innerHTML = "<small>Filter: " + parts.join(" | ") + "</small>";
  }
}

/* SUCHE */
function matchesSearch(item, search) {
  const text = ((item.titel || "") + " " + (item.untertitel || "")).toLowerCase();
  return text.includes(search.toLowerCase());
}

function matchesPerson(item, search) {
  const text = (
    (item.komponist || "") + " " + (item.arrangeur || "")
  ).toLowerCase();

  return text.includes(search.toLowerCase());
}

/* FILTER */
function filterData(data, search, personSearch, category, genre) {
  return data.filter(item => {

    const matchesText =
      !search || matchesSearch(item, search);

    const matchesPersonText =
      !personSearch || matchesPerson(item, personSearch);

    const matchesCategory =
      !category || item.kategorie === category;

    const matchesGenre =
      !genre || item.genre === genre;

    return matchesText && matchesPersonText && matchesCategory && matchesGenre;
  });
}

/* LISTE */
function render(data) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  const fragment = document.createDocumentFragment();

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div class="title">${item.titel || "Ohne Titel"}</div>
      <div class="subtitle">${item.untertitel || ""}</div>
      <div class="category">${item.kategorie || ""}</div>
    `;

    div.onclick = () => showDetail(item);
    fragment.appendChild(div);
  });

  list.appendChild(fragment);
}

/* KATEGORIEN */
function populateCategories(data) {
  const select = document.getElementById("categoryFilter");

  const categories = [...new Set(
    data.map(d => d.kategorie).filter(Boolean)
  )];

  categories.sort().forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

/* GENRES */
function populateGenres(data) {
  const select = document.getElementById("genreFilter");

  const genres = [...new Set(
    data.map(d => d.genre).filter(Boolean)
  )];

  genres.sort().forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    select.appendChild(option);
  });
}

/* DETAILANSICHT */
function showDetail(item) {
  const list = document.getElementById("list");
  const detailView = document.getElementById("detailView");
  const content = document.getElementById("detailContent");

  list.style.display = "none";
  detailView.classList.remove("hidden");

  content.innerHTML = "";

  // wichtige Felder zuerst
  const priorityFields = ["titel", "untertitel", "komponist", "kategorie"];

  priorityFields.forEach(key => {
    if (item[key]) {
      content.appendChild(createRow(key, item[key]));
    }
  });

  // restliche Felder
  Object.entries(item).forEach(([key, value]) => {
    if (priorityFields.includes(key)) return;
    if (value === null || value === "") return;

    // Notizen extra hervorheben
    if (key === "notizen") {
      const note = document.createElement("div");
      note.className = "notes";
      note.innerHTML = `<b>Notizen:</b><br>${value}`;
      content.appendChild(note);
      return;
    }

    content.appendChild(createRow(key, value));
  });
}

/* ROW ERZEUGEN */
function createRow(key, value) {
  const row = document.createElement("div");
  row.className = "detail-row";

  row.innerHTML = `
    <span class="detail-label">${formatLabel(key)}:</span>
    <span>${formatValue(value)}</span>
  `;

  return row;
}

/* LABEL FORMAT */
function formatLabel(key) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}

/* VALUE FORMAT */
function formatValue(value) {
  if (value === true) return "Ja";
  if (value === false) return "Nein";
  return value;
}

/* ZURÜCK */
function closeDetail() {
  document.getElementById("detailView").classList.add("hidden");
  document.getElementById("list").style.display = "block";
}

/* EVENTS */
document.getElementById("search").addEventListener("input", update);
document.getElementById("personSearch").addEventListener("input", update);
document.getElementById("categoryFilter").addEventListener("change", update);
document.getElementById("genreFilter").addEventListener("change", update);

function update() {
  const search = document.getElementById("search").value;
  const personSearch = document.getElementById("personSearch").value;
  const category = document.getElementById("categoryFilter").value;
  const genre = document.getElementById("genreFilter").value;

  updateFilterStatus(search, personSearch, category, genre);

  const filtered = filterData(allData, search, personSearch, category, genre);
  render(filtered);
}
