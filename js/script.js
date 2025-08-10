// Selección de elementos del DOM
const form = document.querySelector('#formulario form');
const numeroInput = document.getElementById('numero');
const origenInput = document.getElementById('origen');
const destinoInput = document.getElementById('destino');
const destinatarioInput = document.getElementById('destinatario');
const fechaInput = document.getElementById('fecha');
const estadoInput = document.getElementById('estado');
const tablaBody = document.querySelector('.listas__tbody');
const totalGuias = document.querySelectorAll('.estado__p')[0];
const guiasTransito = document.querySelectorAll('.estado__p')[1];
const guiasEntregadas = document.querySelectorAll('.estado__p')[2];

let guias = [];
let historial = {};


function cargarDatos() {
    const guiasLS = localStorage.getItem('guias');
    const historialLS = localStorage.getItem('historial');
    if (guiasLS) guias = JSON.parse(guiasLS);
    if (historialLS) historial = JSON.parse(historialLS);
}


function guardarDatos() {
    localStorage.setItem('guias', JSON.stringify(guias));
    localStorage.setItem('historial', JSON.stringify(historial));
}


function mostrarError(msg) {
    let error = document.getElementById('form-error');
    if (!error) {
        error = document.createElement('p');
        error.id = 'form-error';
        error.style.color = 'red';
        form.prepend(error);
    }
    error.textContent = msg;
}


function limpiarError() {
    let error = document.getElementById('form-error');
    if (error) error.remove();
}


function textoEstado(estado) {
    if (estado === 'pendiente') return 'Pendiente';
    if (estado === 'transito') return 'En tránsito';
    if (estado === 'entregado') return 'Entregado';
    return estado;
}


function mostrarGuias() {
    tablaBody.innerHTML = '';
    guias.forEach(g => {
        let fila = document.createElement('tr');
        fila.className = 'listas__tr';
        fila.innerHTML = `
            <td class="listas__td">${g.numero}</td>
            <td class="listas__td">${textoEstado(g.estado)}</td>
            <td class="listas__td">${g.origen}</td>
            <td class="listas__td">${g.destino}</td>
            <td class="listas__td">${g.ultimaActualizacion}</td>
            <td class="listas__td">
                <button class="listas__button" data-accion="actualizar" data-numero="${g.numero}">Actualizar</button>
                <button class="listas__button" data-accion="historial" data-numero="${g.numero}">Historial</button>
            </td>
        `;
        tablaBody.appendChild(fila);
    });
}


function actualizarTotales() {
    let total = guias.length;
    let transito = guias.filter(g => g.estado === 'transito').length;
    let entregadas = guias.filter(g => g.estado === 'entregado').length;
    totalGuias.innerHTML = `N&uacute;mero total de Gu&iacute;as registradas: ${total}`;
    guiasTransito.innerHTML = `Gu&iacute;as en tr&aacute;nsito: ${transito}`;
    guiasEntregadas.innerHTML = `Gu&iacute;as entregadas: ${entregadas}`;
}


form.addEventListener('submit', function(e) {
    e.preventDefault();
    limpiarError();

    let numero = numeroInput.value.trim();
    let origen = origenInput.value.trim();
    let destino = destinoInput.value.trim();
    let destinatario = destinatarioInput.value.trim();
    let fecha = fechaInput.value;
    let estado = estadoInput.value;

    if (!numero || !origen || !destino || !destinatario || !fecha || !estado) {
        mostrarError('Todos los campos son obligatorios.');
        return;
    }
    if (guias.some(g => g.numero === numero)) {
        mostrarError('El número de guía ya existe.');
        return;
    }

    let fechaRegistro = new Date().toLocaleString();
    let guia = {
        numero,
        origen,
        destino,
        destinatario,
        fecha,
        estado,
        ultimaActualizacion: fechaRegistro
    };
    guias.push(guia);
    historial[numero] = [{ estado, fecha: fechaRegistro }];
    guardarDatos();
    mostrarGuias();
    actualizarTotales();
    form.reset();
});


tablaBody.addEventListener('click', function(e) {
    if (e.target.dataset.accion === 'actualizar') {
        let numero = e.target.dataset.numero;
        let guia = guias.find(g => g.numero === numero);
        if (!guia) return;
        let nuevoEstado = '';
        if (guia.estado === 'pendiente') nuevoEstado = 'transito';
        else if (guia.estado === 'transito') nuevoEstado = 'entregado';
        else return; 

        guia.estado = nuevoEstado;
        guia.ultimaActualizacion = new Date().toLocaleString();
        historial[numero].push({ estado: nuevoEstado, fecha: guia.ultimaActualizacion });
        guardarDatos();
        mostrarGuias();
        actualizarTotales();
    }
    if (e.target.dataset.accion === 'historial') {
        let numero = e.target.dataset.numero;
        mostrarHistorial(numero);
    }
});


function mostrarHistorial(numero) {
    let modal = document.getElementById('modal-historial');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-historial';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '1000';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background:#fff;padding:2rem;max-width:400px;border-radius:8px;position:relative;">
            <button id="cerrar-modal" style="position:absolute;top:8px;right:8px;">&times;</button>
            <h3>Historial de la guía ${numero}</h3>
            <ul style="list-style:none;padding:0;">
                ${historial[numero].map(h => `<li>Estado: <b>${textoEstado(h.estado)}</b> <br>Fecha: ${h.fecha}</li>`).join('<hr>')}
            </ul>
        </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('cerrar-modal').onclick = () => modal.style.display = 'none';
}


cargarDatos();
mostrarGuias();
actualizarTotales();



function mostrarGuias() {
    tablaBody.innerHTML = '';
    guias.forEach(g => {
        let fila = document.createElement('tr');
        fila.className = 'listas__tr';
        fila.innerHTML = `
            <td class="listas__td">${g.numero}</td>
            <td class="listas__td">${textoEstado(g.estado)}</td>
            <td class="listas__td">${g.origen}</td>
            <td class="listas__td">${g.destino}</td>
            <td class="listas__td">${g.ultimaActualizacion}</td>
            <td class="listas__td">
                <button class="listas__button" data-accion="actualizar" data-numero="${g.numero}">Actualizar</button>
                <button class="listas__button" data-accion="historial" data-numero="${g.numero}">Historial</button>
                <button class="listas__button" data-accion="editar" data-numero="${g.numero}">Editar</button>
                <button class="listas__button" data-accion="borrar" data-numero="${g.numero}">Borrar</button>
            </td>
        `;
        tablaBody.appendChild(fila);
    });
}




tablaBody.addEventListener('click', function(e) {
    const numero = e.target.dataset.numero;
    if (!numero) return;

    if (e.target.dataset.accion === 'actualizar') {
        let guia = guias.find(g => g.numero === numero);
        if (!guia) return;
        let nuevoEstado = '';
        if (guia.estado === 'pendiente') nuevoEstado = 'transito';
        else if (guia.estado === 'transito') nuevoEstado = 'entregado';
        else return; // Ya está entregado

        guia.estado = nuevoEstado;
        guia.ultimaActualizacion = new Date().toLocaleString();
        historial[numero].push({ estado: nuevoEstado, fecha: guia.ultimaActualizacion });
        guardarDatos();
        mostrarGuias();
        actualizarTotales();
    }
    if (e.target.dataset.accion === 'historial') {
        mostrarHistorial(numero);
    }
    if (e.target.dataset.accion === 'editar') {
        editarGuia(numero);
    }
    if (e.target.dataset.accion === 'borrar') {
        if (confirm('¿Seguro que deseas borrar esta guía?')) {
            guias = guias.filter(g => g.numero !== numero);
            delete historial[numero];
            guardarDatos();
            mostrarGuias();
            actualizarTotales();
        }
    }
});

