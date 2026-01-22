
// Funciones utilitarias para mostrar/ocultar errores y foco
const showError = (field, message) => {
  if (!field) return;
  const wrapper = field.closest('.form-group') || field.parentElement;
  const err = wrapper?.querySelector('.error-message');
  if (err) {
    err.textContent = message;
    err.style.display = 'block';
  }
  field.setAttribute('aria-invalid', 'true');
  field.classList.add('input-error');
};

const hideError = (field) => {
  if (!field) return;
  const wrapper = field.closest('.form-group') || field.parentElement;
  const err = wrapper?.querySelector('.error-message');
  if (err) {
    err.textContent = '';
    err.style.display = 'none';
  }
  field.removeAttribute('aria-invalid');
  field.classList.remove('input-error');
};

const focusFirstError = (form) => {
  const first = form.querySelector('.input-error, [aria-invalid="true"]');
  if (first && typeof first.focus === 'function') first.focus();
};

// ------------------ NAVBAR: hamburguesa ------------------
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('nav--open');
  });

  // Cerrar nav al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!mainNav.classList.contains('nav--open')) return;
    if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
      mainNav.classList.remove('nav--open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ------------------ Smooth scroll ------------------
const links = document.querySelectorAll('a[href^="#"]');
links.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    // evitar interceptar enlaces vacíos o sólo '#'
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // cerrar menú si está abierto (útil en móvil)
      mainNav?.classList.remove('nav--open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

// ------------------ Mostrar / ocultar campo "otro" ------------------
const asunto = document.getElementById('asunto');
const otroAsunto = document.getElementById('otro-asunto');

if (asunto && otroAsunto) {
  asunto.addEventListener('change', () => {
    const isOtro = asunto.value === 'otro';
    otroAsunto.hidden = !isOtro;
    // if we show it, focus inmediato
    if (isOtro) {
      const input = otroAsunto.querySelector('input');
      if (input) input.focus();
    } else {
      // limpiar y ocultar posibles errores cuando se cambia
      const input = otroAsunto.querySelector('input');
      if (input) {
        input.value = '';
        hideError(input);
      }
    }
  });
}

// ------------------ VALIDACIÓN Y ENVÍO DEL FORMULARIO ------------------
const form = document.getElementById('contactForm');

if (form) {
  // Hide error on input
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('input', () => hideError(field));
    field.addEventListener('change', () => hideError(field));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Campos principales
    const nombre = form.querySelector('#nombre');
    const email = form.querySelector('#email');
    const telefono = form.querySelector('#telefono');
    const asuntoField = form.querySelector('#asunto');
    const otroTexto = form.querySelector('#otroTexto');
    const mensaje = form.querySelector('#mensaje');
    const terminos = form.querySelector('#terminos');

    // Limpia errores previos
    [nombre, email, telefono, asuntoField, otroTexto, mensaje, terminos].forEach(f => {
      if (f) hideError(f);
    });

    let hasError = false;

    // Nombre (requerido)
    if (!nombre || nombre.value.trim().length === 0) {
      showError(nombre, 'Ingresa tu nombre.');
      hasError = true;
    }

    // Email (requerido + formato)
    if (!email || email.value.trim().length === 0) {
      showError(email, 'Ingresa tu correo.');
      hasError = true;
    } else {
      // Validación básica de email (HTML5 también lo hace, pero reforzamos)
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value.trim())) {
        showError(email, 'Correo inválido.');
        hasError = true;
      }
    }

    // Asunto (requerido)
    if (!asuntoField || asuntoField.value === '') {
      showError(asuntoField, 'Selecciona un asunto.');
      hasError = true;
    }

    // Si asunto = otro, validar texto
    if (asuntoField && asuntoField.value === 'otro') {
      if (!otroTexto || otroTexto.value.trim().length === 0) {
        showError(otroTexto, 'Especifica el motivo.');
        hasError = true;
      }
    }

    // Mensaje (requerido)
    if (!mensaje || mensaje.value.trim().length === 0) {
      showError(mensaje, 'El mensaje es obligatorio.');
      hasError = true;
    }

    // Términos (checkbox requerido)
    if (!terminos || !terminos.checked) {
      showError(terminos, 'Debes aceptar los términos.');
      hasError = true;
    }

    // Si hay error, enfocar el primer error y detener envío
    if (hasError) {
      focusFirstError(form);
      return;
    }

    // ------- En este punto la validación pasó -------
    // Mostrar un mensaje de éxito sencillo (toast temporal)
    const showSuccess = (text = 'Mensaje enviado correctamente.') => {
      const alert = document.createElement('div');
      alert.className = 'form-success';
      alert.setAttribute('role', 'status');
      alert.style.cssText = `
        position:fixed;
        right:1rem;
        bottom:1rem;
        background: #0f5132;
        color: #fff;
        padding:0.75rem 1rem;
        border-radius:8px;
        box-shadow: 0 8px 24px rgba(2,6,23,0.12);
        z-index:9999;
        font-weight:600;
      `;
      alert.textContent = text;
      document.body.appendChild(alert);
      setTimeout(() => alert.remove(), 4500);
    };

    // Preparamos datos para enviar
    const formData = {
      nombre: nombre.value.trim(),
      email: email.value.trim(),
      telefono: telefono?.value?.trim() || '',
      asunto: asuntoField.value,
      otro: (otroTexto && otroTexto.value.trim()) || '',
      mensaje: mensaje.value.trim()
    };

    // -------------- OPCIONES DE ENVÍO --------------
    // 1) Si tienes un backend: puedes hacer fetch('/api/contact', {method:'POST', body: JSON.stringify(formData), headers:{'Content-Type':'application/json'}})
    // 2) Si quieres usar Formspree (u otro servicio similar): sustituye la URL por la de tu formulario Formspree
    // Ejemplo (descomentarlo y poner tu URL):
    //
    // try {
    //   const resp = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    //     body: JSON.stringify(formData)
    //   });
    //   if (resp.ok) {
    //     showSuccess('Tu mensaje ha sido enviado. ¡Gracias!');
    //     form.reset();
    //   } else {
    //     showSuccess('Ocurrió un error enviando el mensaje. Intenta más tarde.');
    //   }
    // } catch (err) {
    //   showSuccess('Ocurrió un error de red. Intenta más tarde.');
    // }
    //
    // Si no quieres enviar ahora, mostramos el toast localmente y limpiamos el formulario:
    showSuccess('Validación OK — datos listos para enviar (aún no configurado el endpoint).');
    form.reset();
    // También esconder input "otro" si estaba visible
    if (otroAsunto) {
      otroAsunto.hidden = true;
    }
  });
}

// ------------------ Año dinámico ------------------
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Header visible al hacer scroll hacia arriba
let lastScrollY = window.scrollY;
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  if (!header) return;

  if (window.scrollY < lastScrollY) {
    header.style.transform = 'translateY(0)';
  } else {
    header.style.transform = 'translateY(-100%)';
  }

  lastScrollY = window.scrollY;
});
