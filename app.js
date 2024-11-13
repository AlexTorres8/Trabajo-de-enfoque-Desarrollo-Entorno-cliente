document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const appointmentsTable = document.getElementById('appointmentsTable').querySelector('tbody');
    const mensajeVacio = document.querySelector("#appointmentsTable tr[data-empty]");

    const citasGuardadas = JSON.parse(localStorage.getItem('citas')) || [];

    citasGuardadas.sort((a, b) => new Date(a.fechaCita) - new Date(b.fechaCita));

    if (citasGuardadas.length > 0) {
        if (mensajeVacio) {
            mensajeVacio.remove();
        }
        citasGuardadas.forEach(cita => agregarCitaATabla(cita));
    } else {
        if (!mensajeVacio) {
            const row = document.createElement('tr');
            row.setAttribute('data-empty', 'true');
            row.innerHTML = '<td colspan="7">Dato vacío</td>';
            appointmentsTable.appendChild(row);
        }
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const nombre = form.nombre.value.trim();
        const dni = form.dni.value.trim();
        const telefono = form.telefono.value.trim();
        const fechaNacimiento = form.fechaNacimiento.value;
        const fechaCita = form.fechaCita.value;
        const observaciones = form.observaciones.value.trim();

        const dniValido = /^[0-9]{8}[A-Za-z]$/.test(dni);
        if (!dniValido) {
            alert("El DNI debe tener 8 números seguidos de una letra.");
            return;
        }

        const telefonoValido = /^[0-9]{9}$/.test(telefono);
        if (!telefonoValido) {
            alert("El teléfono debe tener exactamente 9 dígitos.");
            return;
        }

        const fechaNacimientoValida = /^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento);
        if (!fechaNacimientoValida) {
            alert("La fecha de nacimiento debe estar en el formato dd-mm-aaaa.");
            return;
        }

        if (!fechaCita) {
            alert("Por favor, seleccione una fecha y hora para la cita.");
            return;
        }

        const añoCita = fechaCita.split('-')[0]; 
        if (!/^\d{4}$/.test(añoCita)) {
            alert("El año de la fecha de la cita debe tener exactamente 4 dígitos.");
            return;
        }

        const citaHoraOcupada = citasGuardadas.some(cita => cita.fechaCita === fechaCita);
        if (citaHoraOcupada) {
            alert("La hora seleccionada ya está ocupada. Elija otra.");
            return;
        }

        const cita = {
            nombre,
            dni,
            telefono,
            fechaNacimiento,
            fechaCita,
            observaciones,
            id: Date.now() 
        };

        agregarCitaATabla(cita);
        guardarCitasEnLocalStorage(cita);

        form.reset();
    });

    function agregarCitaATabla(cita) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', cita.id);

        const fechaHoraCitaFormateada = formatearFechaHora(cita.fechaCita);

        row.innerHTML = `
            <td>${cita.nombre}</td>
            <td>${cita.dni}</td>
            <td>${cita.telefono}</td>
            <td>${cita.fechaNacimiento}</td>
            <td>${fechaHoraCitaFormateada}</td>
            <td>${cita.observaciones}</td>
            <td>
                <button class="edit-btn">Modificar</button>
                <button class="delete-btn">Eliminar</button>
            </td>
        `;
        appointmentsTable.appendChild(row);

        if (mensajeVacio) {
            mensajeVacio.remove();
        }

        row.querySelector('.delete-btn').addEventListener('click', function() {
            row.remove();
            eliminarCitaDeLocalStorage(cita);
        });

        row.querySelector('.edit-btn').addEventListener('click', function() {
            form.nombre.value = cita.nombre;
            form.dni.value = cita.dni;
            form.telefono.value = cita.telefono;
            form.fechaNacimiento.value = cita.fechaNacimiento;
            form.fechaCita.value = cita.fechaCita;
            form.observaciones.value = cita.observaciones;

            row.remove();
            eliminarCitaDeLocalStorage(cita);
        });
    }

    function formatearFechaHora(fechaHora) {
        const fecha = new Date(fechaHora);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const año = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');

        return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    }

    function guardarCitasEnLocalStorage(cita) {
        citasGuardadas.push(cita);

        citasGuardadas.sort((a, b) => new Date(a.fechaCita) - new Date(b.fechaCita));

        localStorage.setItem('citas', JSON.stringify(citasGuardadas));
    }

    function eliminarCitaDeLocalStorage(cita) {
        const index = citasGuardadas.findIndex(item => item.id === cita.id);
        if (index !== -1) {
            citasGuardadas.splice(index, 1);
            localStorage.setItem('citas', JSON.stringify(citasGuardadas));
        }

        if (citasGuardadas.length === 0) {
            const row = document.createElement('tr');
            row.setAttribute('data-empty', 'true');
            row.innerHTML = '<td colspan="7">Dato vacío</td>';
            appointmentsTable.appendChild(row);
        } else {
            citasGuardadas.sort((a, b) => new Date(a.fechaCita) - new Date(b.fechaCita));

            appointmentsTable.innerHTML = '';
            citasGuardadas.forEach(cita => agregarCitaATabla(cita));
        }
    }
});
