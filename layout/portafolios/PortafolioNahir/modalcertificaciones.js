document.addEventListener('DOMContentLoaded', () => {
    const certificadosModal = document.querySelector('.modal-certificados-contenido');
    const imagenGrandeModalCheckbox = document.getElementById('modal-imagen-grande');
    const imagenCertificadoGrande = document.getElementById('imagen-certificado-grande');
    const modalImagenGrandeTitulo = document.querySelector('#ventana-imagen-grande .barra-titulo-texto h2');

    if (certificadosModal) {
        certificadosModal.addEventListener('click', (event) => {
            if (event.target.tagName === 'IMG') {
                const clickedImageSrc = event.target.src;
                const clickedImageAlt = event.target.alt;

                imagenCertificadoGrande.src = clickedImageSrc;
                imagenCertificadoGrande.alt = clickedImageAlt;
                modalImagenGrandeTitulo.textContent = clickedImageAlt || "Certificado";

                imagenGrandeModalCheckbox.checked = true;
            }
        });
    }

    const certificadoImages = document.querySelectorAll('.modal-certificados-contenido img');
    certificadoImages.forEach(img => {
        img.style.cursor = 'pointer';
    });
});


// Función para actualizar el reloj en la barra de tareas
function actualizarReloj() {
    const relojElement = document.querySelector('.reloj p');
    if (relojElement) {
        const ahora = new Date();
        let horas = ahora.getHours();
        let minutos = ahora.getMinutes();
        const ampm = horas >= 12 ? 'PM' : 'AM';

        horas = horas % 12;
        horas = horas ? horas : 12; 
        minutos = minutos < 10 ? '0' + minutos : minutos;

        relojElement.textContent = `${horas}:${minutos} ${ampm}`;
    }
}

// Llamo a la función para actualizar el reloj cada segundo
setInterval(actualizarReloj, 1000);

// Llamo  al cargar para mostrar la hora inicial
actualizarReloj();