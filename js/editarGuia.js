


function editarGuia(numero) {
    let guia = guias.find(g => g.numero === numero);
    if (!guia) return;
  
    numeroInput.value = guia.numero;
    origenInput.value = guia.origen;
    destinoInput.value = guia.destino;
    destinatarioInput.value = guia.destinatario;
    fechaInput.value = guia.fecha;
    estadoInput.value = guia.estado;

    
    numeroInput.disabled = true;

    
    let btn = form.querySelector('button[type="submit"]');
    btn.textContent = "Actualizar Guía";

    
    form.onsubmit = function(e) {
        e.preventDefault();
        limpiarError();

        let origen = origenInput.value.trim();
        let destino = destinoInput.value.trim();
        let destinatario = destinatarioInput.value.trim();
        let fecha = fechaInput.value;
        let estado = estadoInput.value;

        if (!origen || !destino || !destinatario || !fecha || !estado) {
            mostrarError('Todos los campos son obligatorios.');
            return;
        }

        guia.origen = origen;
        guia.destino = destino;
        guia.destinatario = destinatario;
        guia.fecha = fecha;
        guia.estado = estado;
        guia.ultimaActualizacion = new Date().toLocaleString();
        historial[numero].push({ estado: estado, fecha: guia.ultimaActualizacion });

        guardarDatos();
        mostrarGuias();
        actualizarTotales();
        form.reset();
        numeroInput.disabled = false;
        btn.textContent = "Registrar Guia";
        form.onsubmit = originalSubmit;
    };
}


const originalSubmit = form.onsubmit;





function mostrarGuias() {
    tablaBody.innerHTML = '';
    guias.forEach(g => {
        let fila = document.createElement('tr');
        fila.className = 'listas__tr';

     
        if (g.editando) {
            fila.innerHTML = `
                <td class="listas__td">${g.numero}</td>
                <td class="listas__td">
                    <select class="listas__edit-estado">
                        <option value="pendiente" ${g.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="transito" ${g.estado === 'transito' ? 'selected' : ''}>En tránsito</option>
                        <option value="entregado" ${g.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
                    </select>
                </td>
                <td class="listas__td"><input class="listas__edit-origen" type="text" value="${g.origen}"></td>
                <td class="listas__td"><input class="listas__edit-destino" type="text" value="${g.destino}"></td>
                <td class="listas__td"><input class="listas__edit-fecha" type="date" value="${g.fecha}"></td>
                <td class="listas__td">
                    <button class="listas__button" data-accion="guardar-edicion" data-numero="${g.numero}">Guardar</button>
                    <button class="listas__button" data-accion="cancelar-edicion" data-numero="${g.numero}">Cancelar</button>
                </td>
            `;
        } else {
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
        }
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
        else return; 

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
        guias.forEach(g => delete g.editando); 
        let guia = guias.find(g => g.numero === numero);
        if (guia) guia.editando = true;
        mostrarGuias();
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
    if (e.target.dataset.accion === 'guardar-edicion') {
        let fila = e.target.closest('tr');
        let guia = guias.find(g => g.numero === numero);
        if (!guia) return;

        let nuevoEstado = fila.querySelector('.listas__edit-estado').value;
        let nuevoOrigen = fila.querySelector('.listas__edit-origen').value.trim();
        let nuevoDestino = fila.querySelector('.listas__edit-destino').value.trim();
        let nuevaFecha = fila.querySelector('.listas__edit-fecha').value;

        if (!nuevoOrigen || !nuevoDestino || !nuevaFecha || !nuevoEstado) {
            alert('Todos los campos son obligatorios.');
            return;
        }

        guia.estado = nuevoEstado;
        guia.origen = nuevoOrigen;
        guia.destino = nuevoDestino;
        guia.fecha = nuevaFecha;
        guia.ultimaActualizacion = new Date().toLocaleString();
        historial[numero].push({ estado: nuevoEstado, fecha: guia.ultimaActualizacion });
        delete guia.editando;
        guardarDatos();
        mostrarGuias();
        actualizarTotales();
    }
    if (e.target.dataset.accion === 'cancelar-edicion') {
        let guia = guias.find(g => g.numero === numero);
        if (guia) delete guia.editando;
        mostrarGuias();
    }
});