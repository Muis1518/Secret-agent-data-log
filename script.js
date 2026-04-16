

const STORAGE_KEY = "secret-agent-leaks";
const leaks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

/* ======================================================
   HULPFUNCTIE: AFBEELDING VERKLEINEN
   (voorkomt localStorage overflow)
====================================================== */
function resizeImage(file, maxWidth, callback) {
  const reader = new FileReader();
  const img = new Image();

  reader.onload = e => {
    img.src = e.target.result;
  };

  img.onload = () => {
    const scale = maxWidth / img.width;
    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // JPEG + compressie
    const resizedImage = canvas.toDataURL("image/jpeg", 0.7);
    callback(resizedImage);
  };

  reader.readAsDataURL(file);
}

/* ======================================================
   LEK OPSLAAN (add.html)
====================================================== */
const form = document.getElementById("leakForm");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const slachtoffer = document.getElementById("slachtoffer").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;
    const photoInput = document.getElementById("photo");

    if (!photoInput.files.length) {
      alert("Selecteer een foto");
      return;
    }

    // 👉 hier gebeurt het verkleinen
    resizeImage(photoInput.files[0], 800, resizedImage => {
      leaks.push({
        slachtoffer,
        description,
        date,
        image: resizedImage
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leaks));
        window.location.href = "index.html";
      } catch (err) {
        alert("Opslag is vol. Verwijder eerst data met reset.");
        console.error(err);
      }
    });
  });
}

/* ======================================================
   TIMELINE (index.html)
====================================================== */
const timeline = document.getElementById("timeline");

if (timeline) {
  const sorted = [...leaks].sort((a, b) => b.date.localeCompare(a.date));
  let lastDate = "";

  sorted.forEach(l => {
    if (l.date !== lastDate) {
      const dateEl = document.createElement("div");
      dateEl.className = "date-label";
      dateEl.textContent = new Date(l.date).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      timeline.appendChild(dateEl);
      lastDate = l.date;
    }

    const entry = document.createElement("div");
    entry.className = "entry";
    entry.innerHTML = `
      <div class="thumb">
        <img src="${l.image}" alt="">
      </div>
      <div class="card">
        <h3>${l.slachtoffer}</h3>
        <p>${l.description}</p>
      </div>
    `;
    timeline.appendChild(entry);
  });
}

/* ======================================================
   RANKING (Top 5 Slachtoffers)
====================================================== */
const ranking = document.getElementById("rankingList");

if (ranking) {
  ranking.innerHTML = "";
  const counts = {};

  leaks.forEach(l => {
    counts[l.slachtoffer] = (counts[l.slachtoffer] || 0) + 1;
  });

  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([name, count], i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>#${i + 1} ${name}</span>
        <span>${count} leaks</span>
      `;
      ranking.appendChild(li);
    });
}

/* ======================================================
   RESET ALLE DATA
====================================================== */
const resetBtn = document.getElementById("resetData");

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (confirm("Weet je zeker dat je ALLE data wilt verwijderen?")) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });
}




// const STORAGE_KEY = "secret-agent-leaks";
// const leaks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

// /* ======================
//    LEK OPSLAAN
// ====================== */
// const form = document.getElementById("leakForm");

// if (form) {
//   form.addEventListener("submit", function (e) {
//     e.preventDefault();

//     const slachtoffer = document.getElementById("slachtoffer").value;
//     const description = document.getElementById("description").value;
//     const date = document.getElementById("date").value;
//     const photoInput = document.getElementById("photo");

//     if (!photoInput.files.length) {
//       alert("Selecteer een foto");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = function () {
//       leaks.push({
//         slachtoffer,
//         description,
//         date,
//         image: `<img src="${reader.result}">`
//       });

//       localStorage.setItem(STORAGE_KEY, JSON.stringify(leaks));
//       window.location.href = "index.html";
//     };

//     reader.readAsDataURL(photoInput.files[0]);
//   });
// }

// /* ======================
//    TIMELINE
// ====================== */
// const timeline = document.getElementById("timeline");

// if (timeline) {
//   const sorted = [...leaks].sort((a, b) => b.date.localeCompare(a.date));
//   let lastDate = "";

//   sorted.forEach(l => {
//     if (l.date !== lastDate) {
//       const dateEl = document.createElement("div");
//       dateEl.className = "date-label";
//       dateEl.textContent = new Date(l.date).toLocaleDateString("nl-NL", {
//         day: "numeric",
//         month: "long",
//         year: "numeric"
//       });
//       timeline.appendChild(dateEl);
//       lastDate = l.date;
//     }

//     const entry = document.createElement("div");
//     entry.className = "entry";
//     entry.innerHTML = `
//       <div class="thumb">${l.image}</div>
//       <div class="card">
//         <h3>${l.slachtoffer}</h3>
//         <p>${l.description}</p>
//       </div>
//     `;
//     timeline.appendChild(entry);
//   });
// }

// /* ======================
//    RANKING
// ====================== */
// const ranking = document.getElementById("rankingList");

// if (ranking) {
//   ranking.innerHTML = "";
//   const counts = {};

//   leaks.forEach(l => {
//     counts[l.slachtoffer] = (counts[l.slachtoffer] || 0) + 1;
//   });

//   Object.entries(counts)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 5)
//     .forEach(([name, count], i) => {
//       const li = document.createElement("li");
//       li.innerHTML = `<span>#${i + 1} ${name}</span><span>${count} leaks</span>`;
//       ranking.appendChild(li);
//     });
// }

// /* ======================
//    RESET
// ====================== */
// const resetBtn = document.getElementById("resetData");

// if (resetBtn) {
//   resetBtn.addEventListener("click", () => {
//     if (confirm("Weet je zeker dat je alles wilt verwijderen?")) {
//       localStorage.removeItem(STORAGE_KEY);
//       location.reload();
//     }
//   });
// }






// const STORAGE_KEY = "secret-agent-leaks";
// const leaks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

// /* ======================
//    LEK OPSLAAN
// ====================== */
// const form = document.getElementById("leakForm");

// if (form) {
//   form.addEventListener("submit", function (e) {
//     e.preventDefault();

//     const agent = agentInput().value;
//     const description = descriptionInput().value;
//     const date = dateInput().value;
//     const photo = photoInput();

//     const reader = new FileReader();
//     reader.onload = () => {
//       leaks.push({
//         agent,
//         description,
//         date,
//         image: `<img src="${reader.result}">`
//       });

//       localStorage.setItem(STORAGE_KEY, JSON.stringify(leaks));
//       window.location.href = "index.html";
//     };

//     reader.readAsDataURL(photo.files[0]);
//   });
// }

// /* helpers */
// function agentInput() { return document.getElementById("agent"); }
// function descriptionInput() { return document.getElementById("description"); }
// function dateInput() { return document.getElementById("date"); }
// function photoInput() { return document.getElementById("photo"); }

// /* ======================
//    TIMELINE
// ====================== */
// const timeline = document.getElementById("timeline");

// if (timeline) {
//   const sorted = [...leaks].sort((a, b) => b.date.localeCompare(a.date));
//   let lastDate = "";

//   sorted.forEach(l => {
//     if (l.date !== lastDate) {
//       const dateEl = document.createElement("div");
//       dateEl.className = "date-label";
//       dateEl.textContent = new Date(l.date).toLocaleDateString("nl-NL", {
//         day: "numeric",
//         month: "long",
//         year: "numeric"
//       });
//       timeline.appendChild(dateEl);
//       lastDate = l.date;
//     }

//     const entry = document.createElement("div");
//     entry.className = "entry";
//     entry.innerHTML = `
//       <div class="thumb">${l.image}</div>
//       <div class="card">
//         <h3>${l.agent}</h3>
//         <p>${l.description}</p>
//       </div>
//     `;
//     timeline.appendChild(entry);
//   });
// }

// /* ======================
//    RANKING
// ====================== */
// const ranking = document.getElementById("rankingList");

// if (ranking) {
//   ranking.innerHTML = "";
//   const counts = {};

//   leaks.forEach(l => {
//     counts[l.agent] = (counts[l.agent] || 0) + 1;
//   });

//   Object.entries(counts)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 5)
//     .forEach(([name, count], i) => {
//       const li = document.createElement("li");
//       li.innerHTML = `<span>#${i + 1} ${name}</span><span>${count} leaks</span>`;
//       ranking.appendChild(li);
//     });
// }

// /* ======================
//    RESET
// ====================== */
// const resetBtn = document.getElementById("resetData");
// if (resetBtn) {
//   resetBtn.addEventListener("click", () => {
//     if (confirm("Weet je zeker dat je alles wilt verwijderen?")) {
//       localStorage.removeItem(STORAGE_KEY);
//       location.reload();
//     }
//   });
// }





// -----------------










// const STORAGE_KEY = "secret-agent-leaks";
// const leaks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

// // OPSLAAN
// if (document.getElementById("leakForm")) {
//   document.getElementById("leakForm").addEventListener("submit", e => {
//     e.preventDefault();

//     const file = photo.files[0];
//     const reader = new FileReader();

//     reader.onload = () => {
//       leaks.push({
//         agent: agent.value,
//         description: description.value,
//         date: date.value,
//         image: reader.result
//       });

//       localStorage.setItem(STORAGE_KEY, JSON.stringify(leaks));
//       location.href = "index.html";
//     };

//     reader.readAsDataURL(file);
//   });
// }

// // TIMELINE
// const timeline = document.getElementById("timeline");
// if (timeline) {
//   const sorted = [...leaks].sort((a,b) => b.date.localeCompare(a.date));
//   let lastDate = null;

//   sorted.forEach(l => {
//     if (l.date !== lastDate) {
//       const d = document.createElement("div");
//       d.className = "date-label";
//       d.textContent = new Date(l.date).toLocaleDateString("nl-NL", {
//         day: "numeric", month: "long", year: "numeric"
//       });
//       timeline.appendChild(d);
//       lastDate = l.date;
//     }

//     const entry = document.createElement("div");
//     entry.className = "entry";
//     entry.innerHTML = `
    
//  <div class="thumb"><img src="${l.image}"></div>
//       <div>
//         <strong>${l.agent}</strong>
//         <p>${l.description}</p>
//       </div>

//         <h3>${l.agent}</h3>
//         <p>${l.description}</p>
//       </div>
//     `;
//     timeline.appendChild(entry);
//   });
// }

// // RANKING
// const ranking = document.getElementById("rankingList");
// if (ranking) {
//   const counts = {};
//   leaks.forEach(l => counts[l.agent] = (counts[l.agent] || 0) + 1);

//   Object.entries(counts)
//     .sort((a,b) => b[1]-a[1])
//     .slice(0,5)
//     .forEach(([name,count],i) => {
//       const li = document.createElement("li");
//       li.innerHTML = `<span>#${i+1} ${name}</span><span>${count} leaks</span>`;
//       ranking.appendChild(li);
//     });
// }
