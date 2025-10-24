// public/app.js
document.addEventListener("DOMContentLoaded", () => {
  // NAV toggle
 

  const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMenu.classList.toggle("show");  

    // Change icon ☰ to ✖
    navToggle.textContent = expanded ? "☰" : "✖";
  });
}


  //  Close menu when a link is clicked
  const navLinks = navMenu.querySelectorAll("a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("show");        // hide menu
      navToggle.textContent = "☰";             // revert icon
      navToggle.setAttribute("aria-expanded", "false");
    });
  });


  // Carousel
  const slides = Array.from(document.querySelectorAll(".slide"));
  let idx = 0,
    timer = null;
  function show(i) {
    slides.forEach((s, si) => (s.style.display = si === i ? "block" : "none"));
  }
  function next() {
    idx = (idx + 1) % slides.length;
    show(idx);
  }
  function prev() {
    idx = (idx - 1 + slides.length) % slides.length;
    show(idx);
  }

  // Lazy load src
  slides.forEach((img) => {
    const src = img.getAttribute("data-src");
    if (src) img.src = src;
  });

  if (slides.length) {
    show(0);
    timer = setInterval(next, 4500);
    // pause on hover
    const carousel = document.getElementById("carousel");
    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener(
      "mouseleave",
      () => (timer = setInterval(next, 4500))
    );
  }

  document.querySelectorAll(".carousel-btn.next").forEach((b) =>
    b.addEventListener("click", () => {
      clearInterval(timer);
      next();
    })
  );
  document.querySelectorAll(".carousel-btn.prev").forEach((b) =>
    b.addEventListener("click", () => {
      clearInterval(timer);
      prev();
    })
  );

  // Contact form
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "Sending…";
      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim(),
      };
      if (!data.name || !data.email || !data.message) {
        status.textContent = "Please fill required fields.";
        return;
      }
      try {
         const res = await fetch("https://nyakgaichuol.onrender.com/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        status.textContent =
          json?.message ||
          (res.ok ? "Message sent." : "Error sending message.");
        if (res.ok) form.reset();
      } catch (err) {
        status.textContent = "Network error. Try again later.";
      }
    });
  }

  // Year
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
});
