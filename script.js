
const form = document.getElementById("leakForm");
const timeline = document.getElementById("timeline");
const ranking = document.getElementById("rankingList");
const resetBtn = document.getElementById("resetData");
let lastLeaksSignature = "";

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Er ging iets mis met de server.");
  }
  return response.json();
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function buildTimeline(leaks) {
  timeline.innerHTML = "";

  if (!leaks.length) {
    const empty = document.createElement("p");
    empty.textContent = "Nog geen leaks toegevoegd.";
    timeline.appendChild(empty);
    return;
  }

  let lastDate = "";

  leaks.forEach(leak => {
    if (leak.date !== lastDate) {
      const dateEl = document.createElement("div");
      dateEl.className = "date-label";
      dateEl.textContent = formatDate(leak.date);
      timeline.appendChild(dateEl);
      lastDate = leak.date;
    }

    const entry = document.createElement("div");
    entry.className = "entry";

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    const image = document.createElement("img");
    image.src = leak.image_url;
    image.alt = leak.slachtoffer;
    thumb.appendChild(image);

    const card = document.createElement("div");
    card.className = "card";
    const title = document.createElement("h3");
    title.textContent = leak.slachtoffer;
    const description = document.createElement("p");
    description.textContent = leak.description;
    card.appendChild(title);
    card.appendChild(description);

    entry.appendChild(thumb);
    entry.appendChild(card);
    timeline.appendChild(entry);
  });
}

function buildRanking(leaks) {
  ranking.innerHTML = "";
  const counts = {};

  leaks.forEach(leak => {
    counts[leak.slachtoffer] = (counts[leak.slachtoffer] || 0) + 1;
  });

  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([name, count], index) => {
      const li = document.createElement("li");

      const left = document.createElement("span");
      left.textContent = `#${index + 1} ${name}`;

      const right = document.createElement("span");
      right.textContent = `${count} leaks`;

      li.appendChild(left);
      li.appendChild(right);
      ranking.appendChild(li);
    });
}

async function loadLeaks() {
  const data = await fetchJson("/api/leaks");
  const nextSignature = data.leaks
    .map(leak => `${leak.id}:${leak.date}:${leak.image_url}`)
    .join("|");

  if (nextSignature === lastLeaksSignature) {
    return;
  }

  lastLeaksSignature = nextSignature;

  if (timeline) {
    buildTimeline(data.leaks);
  }
  if (ranking) {
    buildRanking(data.leaks);
  }
}

function setupAutoRefresh() {
  if (!timeline && !ranking) {
    return;
  }

  if ("EventSource" in window) {
    const events = new EventSource("/api/events");
    events.addEventListener("data-changed", () => {
      loadLeaks().catch(error => {
        console.error(error);
      });
    });

    events.onerror = () => {
      // EventSource retries automatically. We keep this silent to avoid noisy alerts.
    };
    return;
  }

  setInterval(() => {
    loadLeaks().catch(error => {
      console.error(error);
    });
  }, 15000);
}

if (timeline || ranking) {
  loadLeaks().catch(error => {
    console.error(error);
    if (timeline) {
      timeline.innerHTML = "";
      const errorEl = document.createElement("p");
      errorEl.textContent = error.message;
      timeline.appendChild(errorEl);
    }
  });
  setupAutoRefresh();
}

if (form) {
  form.addEventListener("submit", async event => {
    event.preventDefault();

    const slachtoffer = document.getElementById("slachtoffer").value.trim();
    const description = document.getElementById("description").value.trim();
    const date = document.getElementById("date").value;
    const photoInput = document.getElementById("photo");

    if (!photoInput.files.length) {
      alert("Selecteer een foto");
      return;
    }

    const payload = new FormData();
    payload.append("slachtoffer", slachtoffer);
    payload.append("description", description);
    payload.append("date", date);
    payload.append("photo", photoInput.files[0]);

    try {
      await fetchJson("/api/leaks", {
        method: "POST",
        body: payload
      });
      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    if (!confirm("Weet je zeker dat je ALLE data wilt verwijderen?")) {
      return;
    }

    try {
      await fetchJson("/api/leaks", { method: "DELETE" });
      location.reload();
    } catch (error) {
      alert(error.message);
    }
  });
}
