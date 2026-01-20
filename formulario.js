/* =====================================================
   formulario.js
   Lógica del Formulario de Contacto
   ===================================================== */

// Referencias a elementos del DOM
const asuntoSelect = document.getElementById('asunto');
const otroAsuntoGroup = document.getElementById('otro-asunto');
const otroTextoInput = document.getElementById('otroTexto');
const formulario = document.querySelector('.contact-form');

// Mostrar u ocultar campo "Otro"
asuntoSelect.addEventListener('change', () => {
    if (asuntoSelect.value === 'otro') {
        otroAsuntoGroup.hidden = false;
        otroTextoInput.setAttribute('required', 'required');
    } else {
        otroAsuntoGroup.hidden = true;
        otroTextoInput.removeAttribute('required');
        otroTextoInput.value = '';
    }
});

// Validación personalizada del formulario
formulario.addEventListener('submit', (event) => {
    let formularioValido = true;

    const camposRequeridos = formulario.querySelectorAll('[required]');

    camposRequeridos.forEach(campo => {
        const mensajeError = campo.parentElement.querySelector('.error-message');

        if (!campo.checkValidity()) {
            formularioValido = false;
            if (mensajeError) {
                mensajeError.style.display = 'block';
            }
        } else {
            if (mensajeError) {
                mensajeError.style.display = 'none';
            }
        }
    });

    if (!formularioValido) {
        event.preventDefault();
    }
});
