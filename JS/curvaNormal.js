document.addEventListener("DOMContentLoaded", () => {
    const inputArchivo = document.getElementById("archivoExcel");
    const selectColumna = document.getElementById("columna-datos");
    const tipoCalculo = document.getElementById("tipo-calculo");
    const x1Input = document.getElementById("x1");
    const x2Input = document.getElementById("x2");
    const resultado = document.getElementById("resultado");

    let datosOriginales = [];
    let conteoPorRespuesta = {};

    inputArchivo.addEventListener("change", async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const data = await archivo.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(hoja, { header: 1 });

        datosOriginales = json;
        const encabezados = json[0];
        selectColumna.innerHTML = "";
        encabezados.forEach((col, i) => {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = col || `Columna ${i + 1}`;
            selectColumna.appendChild(option);
        });
    });

    tipoCalculo.addEventListener("change", () => {
        if (tipoCalculo.value === "entre") {
            x2Input.style.display = "inline-block";
        } else {
            x2Input.style.display = "none";
        }
    });

    document.getElementById("graficar").addEventListener("click", () => {
        if (!datosOriginales.length) return alert("Primero sube un archivo Excel");
        const colIndex = parseInt(selectColumna.value);
        const respuestas = datosOriginales.slice(1).map(fila => fila[colIndex]);

        // Conteo de frecuencias por respuesta
        conteoPorRespuesta = {};
        respuestas.forEach(resp => {
            if (!conteoPorRespuesta[resp]) conteoPorRespuesta[resp] = 0;
            conteoPorRespuesta[resp]++;
        });

        // Convertimos el conteo a un array de números
        const valores = Object.values(conteoPorRespuesta);

        const media = calcularMedia(valores);
        const desviacion = calcularDesviacion(valores, media);

        const x1 = parseFloat(x1Input.value);
        const x2 = parseFloat(x2Input.value);

        let probabilidad = 0;

        switch (tipoCalculo.value) {
            case "exacta":
                probabilidad = probabilidadExacta(x1, media, desviacion);
                graficar(media, desviacion, x1, x1);
                resultado.innerText = `P(X = ${x1}) ≈ ${probabilidad.toFixed(5)} (aproximado)`;
                break;
            case "mayor":
                probabilidad = 1 - cdf(x1, media, desviacion);
                graficar(media, desviacion, x1, media + 5 * desviacion);
                resultado.innerText = `P(X > ${x1}) = ${probabilidad.toFixed(5)}`;
                break;
            case "menor":
                probabilidad = cdf(x1, media, desviacion);
                graficar(media, desviacion, media - 5 * desviacion, x1);
                resultado.innerText = `P(X < ${x1}) = ${probabilidad.toFixed(5)}`;
                break;
            case "entre":
                const min = Math.min(x1, x2);
                const max = Math.max(x1, x2);
                probabilidad = cdf(max, media, desviacion) - cdf(min, media, desviacion);
                graficar(media, desviacion, min, max);
                resultado.innerText = `P(${min} < X < ${max}) = ${probabilidad.toFixed(5)}`;
                break;
        }
    });
});

function calcularMedia(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calcularDesviacion(arr, media) {
    const varianza = arr.reduce((a, b) => a + Math.pow(b - media, 2), 0) / arr.length;
    return Math.sqrt(varianza);
}

function cdf(x, mu, sigma) {
    return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
}

function erf(x) {
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736,
          a3 = 1.421413741, a4 = -1.453152027,
          a5 = 1.061405429, p = 0.3275911;

    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
    return sign * y;
}

function probabilidadExacta(x, media, desviacion) {
    const densidad = (1 / (desviacion * Math.sqrt(2 * Math.PI))) *
                     Math.exp(-0.5 * Math.pow((x - media) / desviacion, 2));
    return densidad;
}

function graficar(media, desviacion, desde, hasta) {
    const x = [], y = [];
    for (let i = media - 4 * desviacion; i <= media + 4 * desviacion; i += 0.1) {
        const f = (1 / (desviacion * Math.sqrt(2 * Math.PI))) *
                  Math.exp(-0.5 * Math.pow((i - media) / desviacion, 2));
        x.push(i);
        y.push(f);
    }

    const sombraX = [], sombraY = [];
    for (let i = desde; i <= hasta; i += 0.1) {
        const f = (1 / (desviacion * Math.sqrt(2 * Math.PI))) *
                  Math.exp(-0.5 * Math.pow((i - media) / desviacion, 2));
        sombraX.push(i);
        sombraY.push(f);
    }

    const trace1 = {
        x, y,
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

    Plotly.newPlot("grafica", [trace1, trace2], {
        title: "Distribución Normal",
        xaxis: { title: "X" },
        yaxis: { title: "Densidad de probabilidad" }
    });
}
