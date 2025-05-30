document.addEventListener("DOMContentLoaded", () => {
    const botonGraficar = document.getElementById("graficar");
    const selectColumna = document.getElementById("columna-datos");

    // Llenar el select con las columnas del Excel cargado
    const datosGuardados = localStorage.getItem("excelData");
    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        const encabezados = datos[0];

        selectColumna.innerHTML = ""; // Limpiar select
        encabezados.forEach((col, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = col;
            selectColumna.appendChild(option);
        });

        mostrarTablaHTML(datos);
    }

    botonGraficar.addEventListener("click", () => {
        const datos = JSON.parse(localStorage.getItem("excelData"));
        const indexCol = parseInt(selectColumna.value);
        const columna = datos.slice(1).map(fila => parseFloat(fila[indexCol])).filter(n => !isNaN(n));

        if (columna.length === 0) {
            alert("No hay datos válidos numéricos en la columna seleccionada.");
            return;
        }

        const media = calcularMedia(columna);
        const desviacion = calcularDesviacion(columna, media);

        const x1 = parseFloat(document.getElementById("x1").value);
        const x2 = parseFloat(document.getElementById("x2").value);

        if (isNaN(x1) || isNaN(x2)) {
            alert("Por favor, ingresa valores numéricos válidos para X1 y X2.");
            return;
        }

        graficarCurvaNormal(media, desviacion, x1, x2);
    });
});

// Mostrar tabla HTML
function mostrarTablaHTML(datos) {
    const tbody = document.getElementById("result-body");
    const thead = document.querySelector("#resultado-table thead tr");
    tbody.innerHTML = "";
    thead.innerHTML = "";

    const headers = datos[0];
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        thead.appendChild(th);
    });

    datos.slice(1).forEach(fila => {
        const tr = document.createElement("tr");
        fila.forEach(celda => {
            const td = document.createElement("td");
            td.textContent = celda;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Calcular media
function calcularMedia(datos) {
    const suma = datos.reduce((acc, val) => acc + val, 0);
    return suma / datos.length;
}

// Calcular desviación estándar
function calcularDesviacion(datos, media) {
    const varianza = datos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / datos.length;
    return Math.sqrt(varianza);
}

// Graficar curva normal con Plotly
function graficarCurvaNormal(media, desviacion, sombraDesde, sombraHasta) {
    const x = [];
    const y = [];
    const paso = (sombraHasta - sombraDesde) > 10 ? 0.5 : 0.1;

    for (let i = media - 4 * desviacion; i <= media + 4 * desviacion; i += paso) {
        const densidad = (1 / (desviacion * Math.sqrt(2 * Math.PI))) *
                         Math.exp(-0.5 * Math.pow((i - media) / desviacion, 2));
        x.push(i);
        y.push(densidad);
    }

    // Sombreado
    const sombraX = [];
    const sombraY = [];
    for (let i = sombraDesde; i <= sombraHasta; i += paso) {
        const densidad = (1 / (desviacion * Math.sqrt(2 * Math.PI))) *
                         Math.exp(-0.5 * Math.pow((i - media) / desviacion, 2));
        sombraX.push(i);
        sombraY.push(densidad);
    }

    const trace1 = {
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines',
        name: 'Curva Normal',
        line: { color: 'blue' }
    };

    const trace2 = {
        x: [...sombraX, ...sombraX.reverse()],
        y: [...sombraY, ...Array(sombraY.length).fill(0)],
        fill: 'toself',
        fillcolor: 'rgba(255, 99, 132, 0.4)',
        type: 'scatter',
        mode: 'lines',
        name: 'Área sombreada',
        line: { color: 'rgba(0,0,0,0)' }
    };

    const layout = {
        title: 'Curva Normal con Área Sombreada',
        xaxis: { title: 'Valor' },
        yaxis: { title: 'Densidad de Probabilidad' }
    };

    Plotly.newPlot('grafica', [trace1, trace2], layout);
}
