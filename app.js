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
    populateCategories(allData);
    render(allData);
  });

/* SUCHE */
function matchesSearch(item, search) {
  const text = ((item.titel || "") + " " + (item.untertitel || "")).toLowerCase();
  return text.includes(search.toLowerCase());
}

/* FILTER */
function filterData(data, search, category) {
  return data.filter(item => {
    const matchesText = !search || matchesSearch(item, search);
    const matchesCategory = !category || item.kategorie === category;
    return matchesText && matchesCategory;
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
document.getElementById("categoryFilter").addEventListener("change", update);

function update() {
  const search = document.getElementById("search").value;
  const category = document.getElementById("categoryFilter").value;

  const filtered = filterData(allData, search, category);
  render(filtered);
}
