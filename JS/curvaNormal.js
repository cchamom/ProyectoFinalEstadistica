let datos = [];

document.getElementById("archivoExcel").addEventListener("change", function(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(hoja, { header: 1 });

    if (json.length === 0) {
      alert("El archivo está vacío.");
      return;
    }

    const encabezado = json[0];
    const filas = json.slice(1);

    const select = document.getElementById("columna");
    select.innerHTML = "";

    encabezado.forEach((titulo, index) => {
      const muestra = filas
        .map(fila => fila[index])
        .filter(v => v !== undefined && v !== null);

      const hayNumeros = muestra.some(v => !isNaN(parseFloat(v)));
      const esBinario = muestra.every(v => {
        const val = String(v).toLowerCase();
        return val === "sí" || val === "si" || val === "no" || val === "0" || val === "1";
      });

      if (hayNumeros || esBinario) {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = titulo || `Columna ${index + 1}`;
        select.appendChild(option);
      }
    });

    window._datosOriginales = json;
    select.dispatchEvent(new Event("change"));
  };

  lector.readAsArrayBuffer(archivo);
});

document.getElementById("columna").addEventListener("change", function() {
  const index = parseInt(this.value);
  const json = window._datosOriginales || [];

  datos = json
    .slice(1)
    .map(row => {
      const val = row[index];
      if (val === undefined || val === null) return null;
      const valStr = String(val).toLowerCase();
      if (valStr === "sí" || valStr === "si") return 1;
      if (valStr === "no") return 0;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    })
    .filter(v => v !== null);

  console.log("✅ Datos cargados:", datos);
});

function calcular() {
  if (!datos || datos.length === 0) {
    alert("Debes cargar datos y seleccionar una columna válida.");
    return;
  }

  const tipo = document.getElementById("tipo").value;
  const valor1 = parseFloat(document.getElementById("valor1").value);
  const valor2 = parseFloat(document.getElementById("valor2").value);

  if (isNaN(valor1)) {
    alert("Debes ingresar al menos el Valor 1.");
    return;
  }
  if (tipo === "rango" && isNaN(valor2)) {
    alert("Debes ingresar el Valor 2 para el cálculo entre rangos.");
    return;
  }

  const media = promedio(datos);
  const desviacion = desviacionEstandar(datos);

  let probabilidad = 0;

  if (tipo === "exacto") {
    probabilidad = densidadNormal(valor1, media, desviacion);
  } else if (tipo === "mayor") {
    probabilidad = 1 - cdf(valor1, media, desviacion);
  } else if (tipo === "menor") {
    probabilidad = cdf(valor1, media, desviacion);
  } else if (tipo === "rango") {
    probabilidad = cdf(valor2, media, desviacion) - cdf(valor1, media, desviacion);
  }

  document.getElementById("resultado").innerHTML =
    `Probabilidad: <strong>${(probabilidad * 100).toFixed(2)}%</strong>`;

  dibujarGrafica(media, desviacion, valor1, valor2, tipo);
}

function promedio(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function desviacionEstandar(arr) {
  const m = promedio(arr);
  const sum = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0);
  return Math.sqrt(sum / arr.length);
}

function densidadNormal(x, media, desviacion) {
  const coef = 1 / (desviacion * Math.sqrt(2 * Math.PI));
  const exponente = -0.5 * Math.pow((x - media) / desviacion, 2);
  return coef * Math.exp(exponente);
}

function cdf(x, media, desviacion) {
  return 0.5 * (1 + erf((x - media) / (desviacion * Math.sqrt(2))));
}

// Aproximación función error
function erf(x) {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;

  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const t = 1 / (1 + p * x);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);

  return sign * y;
}

function dibujarGrafica(media, desviacion, v1, v2, tipo) {
  const x = [];
  const y = [];
  const pasos = 200;
  const inicio = media - 4 * desviacion;
  const fin = media + 4 * desviacion;

  for (let i = 0; i <= pasos; i++) {
    const xi = inicio + (i * (fin - inicio)) / pasos;
    x.push(xi);
    y.push(densidadNormal(xi, media, desviacion));
  }

  const base = {
    x: x,
    y: y,
    mode: "lines",
    name: "Curva Normal",
    line: { color: "blue" }
  };

  const sombreado = {
    x: [],
    y: [],
    fill: "tozeroy",
    type: "scatter",
    mode: "none",
    fillcolor: "rgba(255, 0, 0, 0.3)",
    name: "Área Sombreada"
  };

  if (tipo === "exacto") {
    // Sombrear una pequeña ventana alrededor del valor exacto
    const ancho = (fin - inicio) / pasos;
    for (let i = 0; i <= pasos; i++) {
      const xi = inicio + (i * (fin - inicio)) / pasos;
      if (Math.abs(xi - v1) < ancho) {
        sombreado.x.push(xi);
        sombreado.y.push(densidadNormal(xi, media, desviacion));
      }
    }
  } else if (tipo === "menor") {
    for (let i = 0; i <= pasos; i++) {
      const xi = inicio + (i * (fin - inicio)) / pasos;
      if (xi <= v1) {
        sombreado.x.push(xi);
        sombreado.y.push(densidadNormal(xi, media, desviacion));
      }
    }
  } else if (tipo === "mayor") {
    for (let i = 0; i <= pasos; i++) {
      const xi = inicio + (i * (fin - inicio)) / pasos;
      if (xi >= v1) {
        sombreado.x.push(xi);
        sombreado.y.push(densidadNormal(xi, media, desviacion));
      }
    }
  } else if (tipo === "rango") {
    for (let i = 0; i <= pasos; i++) {
      const xi = inicio + (i * (fin - inicio)) / pasos;
      if (xi >= v1 && xi <= v2) {
        sombreado.x.push(xi);
        sombreado.y.push(densidadNormal(xi, media, desviacion));
      }
    }
  }

  Plotly.newPlot("grafica", [base, sombreado], { margin: { t: 0 } });
}
