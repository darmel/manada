const ROUTES = {
  portada: {
    title: "Portada",
    kind: "portada",
  },
  planificacion: {
    title: "Planificación",
    kind: "markdown",
    src: "planificacion/acantonamiento_agosto_2026.md",
  },
  "presupuesto-compras": {
    title: "Compras / presupuesto",
    kind: "markdown",
    src: "presupuesto/compras_gastos_presupuesto_agosto_2026.md",
  },
  "presupuesto-lista": {
    title: "Lista de compras",
    kind: "markdown",
    src: "presupuesto/lista_de_compras.md",
  },
  "presupuesto-tickets": {
    title: "Tickets",
    kind: "tickets",
    images: [
      {
        src: "presupuesto/tickets_compras/carrefour_1.jpg",
        label: "Carrefour — ticket 1",
      },
      {
        src: "presupuesto/tickets_compras/carrefour_2_hamburguesas.jpg",
        label: "Carrefour — hamburguesas",
      },
      {
        src: "presupuesto/tickets_compras/verduleria.jpg",
        label: "Verdulería",
      },
      {
        src: "presupuesto/tickets_compras/ginanelli.jpg",
        label: "Ginanelli",
      },
    ],
  },
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

async function navigate(routeId, { push = true } = {}) {
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

  if (push) history.pushState({ route: id }, "", `#${id}`);

  els.content.className = "content loading";
  els.content.textContent = "Cargando…";

  try {
    if (route.kind === "markdown") {
      const html = await loadMarkdown(route.src);
      els.content.className = "content md";
      els.content.innerHTML = html;
    } else if (route.kind === "tickets") {
      els.content.className = "content";
      els.content.innerHTML = renderTickets(route.images);
    }
    els.content.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (err) {
    els.content.className = "content error";
    els.content.innerHTML = `<p><strong>Error:</strong> ${err.message}</p>
      <p>Abrí la web con un servidor local, por ejemplo desde la carpeta <code>acantonamiento</code>:</p>
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

  window.addEventListener("popstate", () => {
    const hash = location.hash.replace("#", "") || "portada";
    if (hash === "portada") showPortada();
    else navigate(hash, { push: false });
  });

  const initial = location.hash.replace("#", "") || "portada";
  if (initial === "portada") showPortada();
  else navigate(initial, { push: false });
}

init();
