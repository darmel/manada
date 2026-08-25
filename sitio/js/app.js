const ROUTES = {
  portada: {
    title: "Portada",
    kind: "portada",
  },

  // ── Acantonamiento ──────────────────────────────────────────────────────────
  planificacion: {
    title: "Planificación",
    kind: "markdown",
    src: "acantonamiento/planificacion/acantonamiento_agosto_2026.md",
  },
  "presupuesto-compras": {
    title: "Compras / presupuesto",
    kind: "markdown",
    src: "acantonamiento/presupuesto/compras_gastos_presupuesto_agosto_2026.md",
  },
  "presupuesto-lista": {
    title: "Lista de compras",
    kind: "markdown",
    src: "acantonamiento/presupuesto/lista_de_compras.md",
  },
  "presupuesto-tickets": {
    title: "Tickets",
    kind: "tickets",
    images: [
      {
        src: "acantonamiento/presupuesto/tickets_compras/carrefour_1.jpg",
        label: "Carrefour — ticket 1",
      },
      {
        src: "acantonamiento/presupuesto/tickets_compras/carrefour_2_hamburguesas.jpg",
        label: "Carrefour — hamburguesas",
      },
      {
        src: "acantonamiento/presupuesto/tickets_compras/verduleria.jpg",
        label: "Verdulería",
      },
      {
        src: "acantonamiento/presupuesto/tickets_compras/ginanelli.jpg",
        label: "Ginanelli",
      },
    ],
  },

  // ── Campamento de Invierno ──────────────────────────────────────────────────
  "campa-cronograma": {
    title: "Cronograma",
    kind: "markdown",
    src: "campamento/cronograma.md",
  },
  "campa-juegos": {
    title: "Juegos",
    kind: "markdown",
    src: "campamento/juegos.md",
  },
  "campa-actividades": {
    title: "Actividades",
    kind: "markdown",
    src: "campamento/actividades.md",
  },
  "campa-evaluacion": {
    title: "Evaluación",
    kind: "markdown",
    src: "campamento/evaluacion.md",
  },
};

const DEEP_LINK_TARGETS = {
  "camino-al-alpatauca": "Camino al Alpatauca",
  "el-mapa-vivo": "El Mapa Vivo",
  "las-habilidades-de-rikki-tikki-tavi": "Las Habilidades De Rikki Tikki Tavi",
  "guardianes-del-campa": "GUARDIANES DEL CAMPA",
  "exploracion-de-la-selva": "Exploración de la selva",
  "laboratorio-de-juegos": "Laboratorio de Juegos",
  "huellas-que-hacen-manada": "Huellas que hacen Manada",
  "el-rincon-de-la-guarida": "El Rincón de la Guarida",
  "taller-de-magia": "Taller de magia",
};

const els = {
  portada: document.getElementById("view-portada"),
  app: document.getElementById("app"),
  content: document.getElementById("content"),
  title: document.getElementById("page-title"),
  sidebar: document.getElementById("sidebar"),
  backdrop: document.getElementById("sidebar-backdrop"),
  menuToggle: document.getElementById("menu-toggle"),
  lightbox: document.getElementById("lightbox"),
  lightboxImg: document.getElementById("lightbox-img"),
  presupuestoToggle: document.getElementById("nav-presupuesto"),
  presupuestoSub: document.getElementById("nav-presupuesto-sub"),
};

function setActiveNav(routeId) {
  document.querySelectorAll("[data-route]").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.route === routeId);
  });
  const underPresupuesto = routeId.startsWith("presupuesto-");
  els.presupuestoSub.classList.toggle("is-open", underPresupuesto);
  els.presupuestoToggle.classList.toggle("is-open", underPresupuesto);
}

function closeMobileNav() {
  els.sidebar.classList.remove("is-open");
  els.backdrop.classList.remove("is-open");
}

function parseHash(rawHash) {
  const clean = (rawHash || "").replace(/^#/, "").trim();
  if (!clean) return { routeId: "portada", deepId: "" };
  const [routeId, deepId = ""] = clean.split("/");
  return { routeId, deepId };
}

function findDeepTarget(root, deepId) {
  const wanted = DEEP_LINK_TARGETS[deepId];
  if (!wanted) return null;

  const normalize = (value) =>
    (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const wantedNorm = normalize(wanted);
  const nodes = root.querySelectorAll("h1, h2, h3, h4, h5, h6, td, th, p");
  for (const node of nodes) {
    const text = normalize(node.textContent || "");
    if (text.includes(wantedNorm)) return node;
  }
  return null;
}

function scrollToDeepTarget(routeId, deepId) {
  if (!deepId || routeId !== "campa-actividades") return;
  const target = findDeepTarget(els.content, deepId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function applyRouteFromHash() {
  const { routeId, deepId } = parseHash(location.hash);
  if (routeId === "portada") {
    showPortada();
    return;
  }
  navigate(routeId, { push: false, deepId });
}

function showPortada() {
  els.portada.classList.remove("is-hidden");
  els.app.classList.add("is-hidden");
  history.replaceState(null, "", "#portada");
}

async function loadMarkdown(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`No se pudo cargar ${src} (${res.status})`);
  const text = await res.text();
  return marked.parse(text);
}

/** Ficha tables store long descriptions in one cell; restore readable blocks. */
function formatFichaTables(root) {
  root.querySelectorAll("td").forEach((td) => {
    if ((td.textContent || "").length < 100) return;

    let html = td.innerHTML;

    // Major sections: Motivación, Experimentación, Recupero, DURAS, tips…
    html = html.replace(
      /(?=<(?:strong|b)>\s*(?:Motivación|Experimentación|Recupero|Parte\s+[A-Z]|Chequeo\s+DURAS|Tip(?:\s+si)?|Ley de la Manada|Antes de|Ambientación)[^<]*<\/(?:strong|b)>)/gi,
      "<br><br>"
    );

    // Station blocks with emoji (Destino Campamento, etc.)
    html = html.replace(/(?=(?:🚰|🍽|🍽️|🌳|🛏|🛏️)\s*)/g, "<br><br>");

    // Numbered steps after a sentence: ". 1) …"
    html = html.replace(/(?<=[.!?…])\s+(?=\d+[\)\.]\s)/g, "<br>");

    // DURAS letters as short lines: "<strong>D</strong> — …"
    html = html.replace(
      /\s+(<(?:strong|b)>[DURASIL]<\/(?:strong|b)>\s*[—–-])/g,
      "<br>$1"
    );

    html = html.replace(/^(?:<br>\s*)+/, "").replace(/(?:<br>\s*)+$/, "");
    td.innerHTML = html;
  });
}

function renderTickets(images) {
  const grid = images
    .map(
      (img) => `
      <button type="button" class="ticket-card" data-full="${img.src}" aria-label="Ver ${img.label}">
        <img src="${img.src}" alt="${img.label}" loading="lazy" />
        <figcaption>${img.label}</figcaption>
      </button>`
    )
    .join("");
  return `<div class="tickets">${grid}</div>`;
}

async function navigate(routeId, { push = true, deepId = "" } = {}) {
  const route = ROUTES[routeId] || ROUTES.planificacion;
  const id = ROUTES[routeId] ? routeId : "planificacion";

  if (id === "portada") {
    showPortada();
    return;
  }

  els.portada.classList.add("is-hidden");
  els.app.classList.remove("is-hidden");
  els.title.textContent = route.title;
  setActiveNav(id);
  closeMobileNav();

  if (push) {
    const nextHash = deepId ? `#${id}/${deepId}` : `#${id}`;
    history.pushState({ route: id, deepId }, "", nextHash);
  }

  els.content.className = "content loading";
  els.content.textContent = "Cargando…";

  try {
    if (route.kind === "markdown") {
      const html = await loadMarkdown(route.src);
      els.content.className = "content md";
      els.content.innerHTML = html;
      formatFichaTables(els.content);
      scrollToDeepTarget(id, deepId);
    } else if (route.kind === "tickets") {
      els.content.className = "content";
      els.content.innerHTML = renderTickets(route.images);
    }
    els.content.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (err) {
    els.content.className = "content error";
    els.content.innerHTML = `<p><strong>Error:</strong> ${err.message}</p>
      <p>Abrí la web con un servidor local, por ejemplo desde la carpeta <code>sitio</code>:</p>
      <pre><code>python3 -m http.server 8765</code></pre>
      <p>y entrá a <code>http://localhost:8765</code>.</p>`;
  }
}

function init() {
  document.getElementById("btn-enter").addEventListener("click", () => {
    navigate("planificacion");
  });

  document.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(el.dataset.route);
    });
  });

  els.presupuestoToggle.addEventListener("click", () => {
    const open = !els.presupuestoSub.classList.contains("is-open");
    els.presupuestoSub.classList.toggle("is-open", open);
    els.presupuestoToggle.classList.toggle("is-open", open);
  });

  els.menuToggle.addEventListener("click", () => {
    els.sidebar.classList.toggle("is-open");
    els.backdrop.classList.toggle("is-open");
  });

  els.backdrop.addEventListener("click", closeMobileNav);

  els.content.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const href = anchor.getAttribute("href") || "";
      const { routeId, deepId } = parseHash(href);
      if (ROUTES[routeId]) {
        e.preventDefault();
        navigate(routeId, { deepId });
        return;
      }
    }

    const card = e.target.closest(".ticket-card");
    if (!card) return;
    els.lightboxImg.src = card.dataset.full;
    els.lightboxImg.alt = card.querySelector("figcaption")?.textContent || "Ticket";
    els.lightbox.classList.add("is-open");
  });

  document.getElementById("lightbox-close").addEventListener("click", () => {
    els.lightbox.classList.remove("is-open");
    els.lightboxImg.src = "";
  });

  els.lightbox.addEventListener("click", (e) => {
    if (e.target === els.lightbox) {
      els.lightbox.classList.remove("is-open");
      els.lightboxImg.src = "";
    }
  });

  window.addEventListener("popstate", applyRouteFromHash);
  window.addEventListener("hashchange", applyRouteFromHash);

  applyRouteFromHash();
}

init();
