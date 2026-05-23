const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-link");
const mobileMenu = document.getElementById("mobile-menu");
const hamburger = document.getElementById("hamburger");
const allMenuLinks = document.querySelectorAll('a[href^="#"]');
const projectCards = document.querySelectorAll(".project-card");
const form = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");
const animatedElements = document.querySelectorAll('[data-animate="fade-up"]');
const readMoreBlocks = document.querySelectorAll("[data-read-more]");
const profileImages = document.querySelectorAll(".profile-image");
const MOBILE_BREAKPOINT = 768;

function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function handleNavbarScroll() {
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 80);
}

if (navbar) {
  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll, { passive: true });
}

const sections = document.querySelectorAll("main section[id]");
if (sections.length > 0 && navLinks.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

      const currentSection = visibleEntries[0];
      if (!currentSection) return;

      const id = currentSection.target.getAttribute("id");
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    },
    {
      threshold: [0.2, 0.35, 0.5, 0.65],
      rootMargin: "-12% 0px -45% 0px",
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function closeMobileMenu() {
  if (!mobileMenu || !hamburger) return;
  mobileMenu.classList.remove("open");
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-label", "Abrir menú");
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  document.addEventListener("click", (event) => {
    if (!isMobileViewport() || !mobileMenu.classList.contains("open")) return;
    if (event.target.closest("#hamburger, #mobile-menu")) return;

    closeMobileMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeMobileMenu();
  });

  window.addEventListener("resize", () => {
    if (!isMobileViewport()) closeMobileMenu();
  });
}

allMenuLinks.forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    const offset =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-height-offset").trim(),
        10,
      ) || 80;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top: targetPosition, behavior: "smooth" });
    if (isMobileViewport()) closeMobileMenu();
  });
});

projectCards.forEach((card) => {
  const closeButton = card.querySelector(".close-detail");

  const toggleCard = () => {
    const isExpanded = card.classList.contains("expanded");
    projectCards.forEach((otherCard) => otherCard.classList.remove("expanded"));
    if (!isExpanded) card.classList.add("expanded");
  };

  card.addEventListener("click", (event) => {
    if (event.target.closest(".close-detail")) return;
    toggleCard();
  });

  if (closeButton) {
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      card.classList.remove("expanded");
    });
  }
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setError(fieldName, message) {
  const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.classList.toggle("show", Boolean(message));
}

function validateField(field) {
  const value = field.value.trim();

  if (!value) {
    setError(field.name, "Este campo es obligatorio.");
    return false;
  }

  if (field.name === "email" && !emailRegex.test(value)) {
    setError(field.name, "Ingresá un email válido.");
    return false;
  }

  if (field.name === "telefono") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 8) {
      setError(field.name, "El teléfono debe tener al menos 8 dígitos.");
      return false;
    }
  }

  setError(field.name, "");
  return true;
}

if (form && submitBtn) {
  const allFields = Array.from(form.querySelectorAll(".field-control"));

  allFields.forEach((field) => {
    const parent = field.closest(".field-group");
    if (!parent) return;

    const refreshFloatingState = () => {
      parent.classList.toggle(
        "has-value",
        field.value.trim().length > 0 || document.activeElement === field,
      );
    };

    field.addEventListener("input", () => {
      refreshFloatingState();
      validateField(field);
    });

    field.addEventListener("focus", refreshFloatingState);
    field.addEventListener("blur", () => {
      refreshFloatingState();
      validateField(field);
    });

    refreshFloatingState();
  });

  function setSubmitState(state) {
    if (state === "idle") {
      submitBtn.className = "submit-btn";
      submitBtn.innerHTML = "Enviar mensaje →";
      return;
    }

    if (state === "loading") {
      submitBtn.className = "submit-btn loading";
      submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
      return;
    }

    if (state === "success") {
      submitBtn.className = "submit-btn success";
      submitBtn.innerHTML = "✓ ¡Mensaje enviado con éxito!";
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isValid = allFields.every((field) => validateField(field));
    if (!isValid) return;

    setSubmitState("loading");

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || String(result.success).toLowerCase() !== "true") {
        const reason = result.message || "No se pudo enviar el formulario en este momento.";
        throw new Error(reason);
      }

      setSubmitState("success");
      form.reset();
      allFields.forEach((field) => {
        const parent = field.closest(".field-group");
        parent?.classList.remove("has-value");
      });
      setError("nombre", "");
      setError("email", "");
      setError("telefono", "");
      setError("proyecto", "");

      setTimeout(() => {
        setSubmitState("idle");
      }, 2600);
    } catch (error) {
      setSubmitState("idle");
      setError(
        "proyecto",
        error?.message || "No se pudo enviar el mensaje. Probá de nuevo en unos segundos.",
      );
    }
  });
}

const animationObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);

      setTimeout(() => {
        entry.target.classList.add("is-visible");
      }, delay);

      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  },
);

animatedElements.forEach((element) => animationObserver.observe(element));

readMoreBlocks.forEach((block) => {
  const toggleBtn = block.querySelector(".read-more-btn");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isExpanded = block.classList.toggle("expanded");
    toggleBtn.textContent = isExpanded ? "Ver menos" : "Seguir leyendo";
    toggleBtn.setAttribute("aria-expanded", String(isExpanded));
  });
});

profileImages.forEach((image) => {
  const placeholder = image.nextElementSibling;

  const revealImage = () => {
    image.classList.add("is-loaded");
    placeholder?.classList.add("is-hidden");
  };

  const hideBrokenImage = () => {
    image.classList.add("is-hidden");
  };

  image.addEventListener("load", revealImage);
  image.addEventListener("error", hideBrokenImage);

  if (image.complete && image.naturalWidth > 0) revealImage();
});

const currentYearEl = document.getElementById("current-year");
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}
