
function formatearFecha(fecha) {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

export default formatearFecha;