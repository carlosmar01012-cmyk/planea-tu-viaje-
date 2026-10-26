"use strict";

const formulario = document.querySelector("#formulario-busqueda");
const origen = document.querySelector("#origen");
const destino = document.querySelector("#destino");
const ida = document.querySelector("#fecha-ida");
const vuelta = document.querySelector("#fecha-vuelta");
const mensaje = document.querySelector("#mensaje-busqueda");

function hoyLocal() {
  const fecha = new Date();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function fechaLegible(valor) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${valor}T12:00:00`));
}

ida.min = hoyLocal();
vuelta.min = ida.min;

ida.addEventListener("change", () => {
  vuelta.min = ida.value || hoyLocal();

  if (vuelta.value && vuelta.value < vuelta.min) {
    vuelta.value = "";
  }
});

[origen, destino].forEach((campo) => {
  campo.addEventListener("change", () => {
    origen.setCustomValidity("");
  });
});

document.querySelector(".aviso-demo").textContent =
  "Cotización sujeta a confirmación";

document.querySelector(".nota-buscador").textContent =
  "Indica tu ruta para solicitar una cotización. " +
  "El precio y la disponibilidad se confirmarán por separado.";

formulario.querySelector('button[type="submit"]').textContent =
  "Solicitar cotización →";

const seccion = document.createElement("section");
seccion.className = "seccion";
seccion.id = "cotizacion";
seccion.hidden = true;
seccion.setAttribute("aria-labelledby", "titulo-cotizacion");
document.querySelector(".seccion-buscador").after(seccion);

let rutaSeleccionada = null;

seccion.innerHTML = `
  <div class="contenedor">
    <div class="formulario-cotizacion">
      <span class="etiqueta">CUÉNTANOS SOBRE TU VIAJE</span>

      <h2 id="titulo-cotizacion" tabindex="-1">
        Solicita tu cotización
      </h2>

      <p id="resumen-ruta"></p>

      <p>
        Esta solicitud no constituye una reserva ni garantiza
        cupos, horarios o tarifas. No realices pagos para enviarla.
      </p>

      <form id="datos-cotizacion">
        <div class="rejilla-cotizacion">
          <div class="campo">
            <label for="nombre-completo">Nombre completo</label>
            <input
              id="nombre-completo"
              name="nombre"
              type="text"
              autocomplete="name"
              maxlength="120"
              required
            >
          </div>

          <div class="campo">
            <label for="cedula">Cédula del solicitante</label>
            <input
              id="cedula"
              name="cedula"
              type="text"
              inputmode="numeric"
              pattern="[0-9]{5,12}"
              minlength="5"
              maxlength="12"
              title="Escribe entre 5 y 12 dígitos, sin puntos ni espacios."
              aria-describedby="ayuda-cedula"
              required
            >
            <small id="ayuda-cedula">
              Se utilizará para identificar al solicitante
              y dar seguimiento a la cotización.
              No adjuntes una fotografía del documento.
            </small>
          </div>
            <div class="campo">
  <label for="correo">Correo electrónico</label>
  <input
    id="correo"
    name="correo"
    type="email"
    autocomplete="email"
    maxlength="254"
    placeholder="tu@correo.com"
    required
  >
</div>
          <div class="campo">
            <label for="telefono">Número de teléfono</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              autocomplete="tel"
              maxlength="25"
              pattern="[+0-9() .-]{7,25}"
              title="Escribe un teléfono de contacto válido."
              required
            >
          </div>

          <div class="campo">
            <label for="pasajeros">Cantidad de pasajeros</label>
            <input
              id="pasajeros"
              name="pasajeros"
              type="number"
              min="1"
              max="50"
              step="1"
              value="1"
              required
            >
          </div>
        </div>

        <label class="autorizacion-datos">
          <input
            id="autoriza-datos"
            name="autorizacion"
            type="checkbox"
            required
          >
          <span>
            Autorizo a Víctor Alfonso Cruz Amortegui a tratar
            mi nombre, cédula, teléfono, correo electrónico y datos del viaje a la
            <a href="privacidad.html">
              Política de Privacidad y Tratamiento de Datos Personales
            </a>.
            Esta autorización no incluye publicidad.
          </span>
        </label>

        <p class="nota-buscador">
          Al continuar se abrirá tu aplicación de correo con
          la solicitud preparada. Debes revisar el contenido
          y enviarlo desde allí. El sitio no guarda el formulario.
        </p>

        <button class="boton boton-principal" type="submit">
          Preparar solicitud por correo →
        </button>

        <p id="estado-cotizacion" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>
`;

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  origen.setCustomValidity("");
  ida.min = hoyLocal();

  if (origen.value === destino.value) {
    origen.setCustomValidity("Selecciona ciudades diferentes.");
  }

  if (!formulario.reportValidity()) return;

  const nuevaRuta = {
    origen: origen.value,
    destino: destino.value,
    ida: ida.value,
    vuelta: vuelta.value
  };

  // Evita conservar datos personales al cambiar el trayecto.
  if (JSON.stringify(nuevaRuta) !== JSON.stringify(rutaSeleccionada)) {
    document.querySelector("#datos-cotizacion").reset();
  }

  rutaSeleccionada = nuevaRuta;

  document.querySelector("#resumen-ruta").textContent =
    `${nuevaRuta.origen} → ${nuevaRuta.destino}` +
    ` · Ida: ${fechaLegible(nuevaRuta.ida)}` +
    (nuevaRuta.vuelta
      ? ` · Regreso: ${fechaLegible(nuevaRuta.vuelta)}`
      : " · Solo ida");

  mensaje.textContent = "";
  document.querySelector("#estado-cotizacion").textContent = "";
  seccion.hidden = false;

  document.querySelector("#titulo-cotizacion").focus({
    preventScroll: true
  });

  seccion.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth"
  });
});

document.querySelector("#datos-cotizacion")
  .addEventListener("submit", (evento) => {
    evento.preventDefault();

    const datos = evento.currentTarget;

    if (!rutaSeleccionada || !datos.reportValidity()) return;

    const nombre = datos.elements.nombre.value.trim();
    const telefono = datos.elements.telefono.value.trim();

    if (nombre.length < 3) {
      document.querySelector("#estado-cotizacion").textContent =
        "Escribe tu nombre completo.";
      datos.elements.nombre.focus();
      return;
    }

    if (telefono.replace(/\D/g, "").length < 7) {
      document.querySelector("#estado-cotizacion").textContent =
        "Revisa tu número de teléfono.";
      datos.elements.telefono.focus();
      return;
    }

    const asunto =
      `Solicitud de cotización: ${rutaSeleccionada.origen}` +
      ` a ${rutaSeleccionada.destino}`;

    const cuerpo = [
      "SOLICITUD DE COTIZACIÓN",
      "",
      `Origen: ${rutaSeleccionada.origen}`,
      `Destino: ${rutaSeleccionada.destino}`,
      `Ida: ${fechaLegible(rutaSeleccionada.ida)}`,
      `Regreso: ${
        rutaSeleccionada.vuelta
          ? fechaLegible(rutaSeleccionada.vuelta)
          : "No solicitado"
      }`,
      `Pasajeros: ${datos.elements.pasajeros.value}`,
      "",
      `Nombre: ${nombre}`,
      `Cédula: ${datos.elements.cedula.value}`,
      `Teléfono: ${telefono}`,
      `Correo de contacto: ${datos.elements.correo.value.trim()}`,
      "",
      "Autorizo a Víctor Alfonso Cruz Amortegui a tratar estos",
      "datos para identificarme, atender mi solicitud y",
      "contactarme sobre la cotización, conforme a la política",
      "de privacidad consultada en el sitio.",
      "Esta autorización no incluye publicidad.",
      "",
      "Entiendo que esta solicitud no confirma una reserva",
      "y que la tarifa y disponibilidad están por confirmar."
    ].join("\n");

    const enlace =
      "mailto:dijendrakumadas@gmail.com" +
      `?subject=${encodeURIComponent(asunto)}` +
      `&body=${encodeURIComponent(cuerpo)}`;

    document.querySelector("#estado-cotizacion").textContent =
      "Se solicitó abrir tu aplicación de correo. Revisa el mensaje " +
      "y pulsa Enviar allí. Si no se abre, configura una aplicación " +
      "de correo o escribe directamente a dijendrakumadas@gmail.com. " +
      "Esta página no puede confirmar si el mensaje fue enviado.";

    window.location.href = enlace;
  });
   // Preferencias de privacidad.
(() => {
  const clave = "tv-preferencias-v2";

  try {
    if (localStorage.getItem(clave)) return;
  } catch {}

  const aviso = document.createElement("aside");
  aviso.className = "aviso-cookies";
  aviso.setAttribute("aria-labelledby", "titulo-cookies");

  aviso.innerHTML = `
    <h2 id="titulo-cookies">¿Aceptas todas las cookies?</h2>

    <p>
      Actualmente no utilizamos cookies de publicidad ni
      estadísticas. Solo guardamos tu elección en este navegador.
      El diseño carga fuentes de Google.
    </p>

    <a href="cookies.html">Saber más acerca de las cookies</a>

    <div id="detalle-cookies" hidden>
      <p>
        <strong>Preferencia del aviso:</strong>
        permite recordar tu elección.
      </p>
      <p>
        <strong>Cookies opcionales:</strong>
        ninguna instalada actualmente.
      </p>
      <button type="button" class="boton boton-secundario"
        id="guardar-cookies">
        Guardar preferencias
      </button>
    </div>

    <div class="acciones-cookies">
      <button type="button" class="boton boton-secundario"
        id="configurar-cookies"
        aria-expanded="false"
        aria-controls="detalle-cookies">
        Configurar
      </button>

      <button type="button" class="boton boton-principal"
        id="aceptar-cookies">
        Aceptar todas
      </button>
    </div>
  `;

  document.body.append(aviso);

  function guardar(eleccion) {
    try {
      localStorage.setItem(clave, JSON.stringify({
        eleccion,
        opcionales: [],
        fecha: new Date().toISOString()
      }));
    } catch {}

    aviso.remove();
  }

  aviso.querySelector("#configurar-cookies")
    .addEventListener("click", (evento) => {
      const detalle = aviso.querySelector("#detalle-cookies");
      detalle.hidden = !detalle.hidden;
      evento.currentTarget.setAttribute(
        "aria-expanded",
        String(!detalle.hidden)
      );
    });

  aviso.querySelector("#guardar-cookies")
    .addEventListener("click", () => guardar("configurada"));

  aviso.querySelector("#aceptar-cookies")
    .addEventListener("click", () => guardar("aceptar-todas"));
})();