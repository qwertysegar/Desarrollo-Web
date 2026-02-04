// js/main.js
// Comportamientos JS para el portafolio:
// - Manejo del campo "otro asunto"
// - Validación de formulario (Bootstrap-style) y manejo de alerts + modal
// - Cierre de offcanvas cuando se hace click en links (mejora UX en mobile)

document.addEventListener('DOMContentLoaded', function () {

  // === Utils ===
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // === Offcanvas: cerrar al click en enlaces internos (mejora UX mobile) ===
  const offcanvasEl = $('#offcanvasNavbar');
  if (offcanvasEl) {
    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    $$('.offcanvas-body .nav-link').forEach(a => {
      a.addEventListener('click', () => {
        // solo cerrar si está abierto
        try { bsOffcanvas.hide(); } catch (e) { /* noop */ }
      });
    });
  }

  // === Select "asunto" -> mostrar campo "otro" ===
  const asunto = $('#asunto');
  const otroCont = $('#otroAsunto');
  const otroInput = $('#otroTexto');

  function toggleOtroAsunto() {
    if (!asunto) return;
    const val = asunto.value;
    if (val === 'otro') {
      otroCont.classList.remove('d-none');
      // marcar como requerido para que la validación lo tome en cuenta
      otroInput.setAttribute('required', 'required');
      // focus para mejor UX
      setTimeout(() => otroInput.focus(), 150);
    } else {
      otroCont.classList.add('d-none');
      otroInput.removeAttribute('required');
      otroInput.value = '';
    }
  }
  if (asunto) {
    asunto.addEventListener('change', toggleOtroAsunto);
    // init
    toggleOtroAsunto();
  }

  // === Form validation (Bootstrap 5 pattern) ===
  const form = $('#contactForm');
  const alertError = $('#alertError');
  const alertSuccess = $('#alertSuccess');
  const confirmModalEl = $('#confirmModal');
  const bsConfirmModal = confirmModalEl ? new bootstrap.Modal(confirmModalEl) : null;

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      // Clear previous alerts
      if (alertError) alertError.classList.add('d-none');
      if (alertSuccess) alertSuccess.classList.add('d-none');

      // Bootstrap validation visual
      form.classList.remove('was-validated');
      // Use constraint validation API
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        if (alertError) alertError.classList.remove('d-none');
        // Scroll to alert for visibility
        if (alertError) alertError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Form is valid
      form.classList.add('was-validated');

      // Show success alert and modal
      if (alertSuccess) {
        alertSuccess.classList.remove('d-none');
        alertSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Show confirmation modal (if present)
      if (bsConfirmModal) {
        bsConfirmModal.show();
      }

      // TODO: aquí podrías ejecutar fetch() para enviar datos a un endpoint (backend)
      // Simular envío y luego resetear
      setTimeout(() => {
        try {
          form.reset();
          // escondemos campos condicionados
          if (otroCont) {
            otroCont.classList.add('d-none');
            if (otroInput) otroInput.removeAttribute('required');
          }
          // limpiar validación
          form.classList.remove('was-validated');
        } catch (e) {
          console.error(e);
        }
      }, 300); // pequeño retraso para que el usuario vea la alerta/modal
    });

    // Reiniciar alertas al hacer reset (botón 'Limpiar')
    form.addEventListener('reset', function () {
      setTimeout(() => {
        if (alertError) alertError.classList.add('d-none');
        if (alertSuccess) alertSuccess.classList.add('d-none');
        form.classList.remove('was-validated');
        // ocultar "otro"
        if (otroCont) {
          otroCont.classList.add('d-none');
          if (otroInput) otroInput.removeAttribute('required');
        }
      }, 10);
    });
  }

  // Optional: smooth scroll for internal anchor links with offset for fixed navbar
  $$('a[href^="#"]').forEach(a => {
    // ignore links that only target '#' or the offcanvas controls
    const href = a.getAttribute('href');
    if (!href || href === '#' || a.hasAttribute('data-bs-toggle')) return;
    a.addEventListener('click', function (e) {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // adjust to navbar height
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
