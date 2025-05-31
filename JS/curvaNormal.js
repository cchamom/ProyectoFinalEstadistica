let datos = [];

document.getElementById("archivoExcel").addEventListener("change", function (e) {
  const archivo = e.target.files[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(hoja, { header: 1 });

    if (json.length === 0) {
      alert("El archivo está vacío o mal formateado.");
      return;
    }

    const encabezado = json[0];
    const filas = json.slice(1);

    const select = document.getElementById("columna");
    select.innerHTML = "";

    encabezado.forEach((titulo, index) => {
      const muestra = filas.map(fila => fila[index]).filter(v => v !== undefined && v !== null);
      const hayNumeros = muestra.some(v => !isNaN(parseFloat(v)));
      const haySiNo = muestra.every(v => {
        if (typeof v !== "string") return false;
        const val = v.toString().toLowerCase();
        return val === "sí" || val === "si" || val === "no";
      });

      if (hayNumeros || haySiNo) {
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

document.getElementById("columna").addEventListener("change", function () {
  const index = parseInt(this.value);
  const json = window._datosOriginales || [];
  const filas = json.slice(1);

  const valoresBrutos = filas.map(row => row[index]).filter(v => v !== undefined && v !== null);
  const esSiNo = valoresBrutos.length > 0 && valoresBrutos.every(v => {
    if (typeof v !== "string") return false;
    const val = v.toString().toLowerCase();
    return val === "sí" || val === "si" || val === "no";
  });

  datos = esSiNo
    ? valoresBrutos.map(v => (v.toString().toLowerCase() === "sí" || v.toString().toLowerCase() === "si") ? 1 : 0)
    : filas.map(row => parseFloat(row[index])).filter(v => !isNaN(v));

  document.getElementById("resultado").textContent = "";
  document.getElementById("estadisticas").textContent = "";
  document.getElementById("grafica").innerHTML = "";

  console.log("Datos cargados:", datos);
});

function mean(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr) {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function normalPDF(x, mean, std) {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

function linspace(start, end, num) {
  const arr = [];
  const step = (end - start) / (num - 1);
  for (let i = 0; i < num; i++) arr.push(start + step * i);
  return arr;
}

function calcular() {
  if (!datos || datos.length === 0) {
    alert("Selecciona una columna con datos válidos primero.");
    return;
  }

  const tipo = document.getElementById("tipo").value;
  let val1 = parseFloat(document.getElementById("valor1").value);
  let val2 = parseFloat(document.getElementById("valor2").value);

  const media = mean(datos);
  const desv = stdDev(datos);
  const n = datos.length;

  if (desv === 0) {
    alert("La desviación estándar es cero, no se puede calcular la curva normal.");
    return;
  }

  function normalCDF(x, mean, std) {
    return (1 + erf((x - mean) / (std * Math.sqrt(2)))) / 2;
  }

  function erf(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741,
          a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  if (val1 < 0) val1 = 0;
  if (val1 > 1) val1 = 1;
  if (val2 < 0) val2 = 0;
  if (val2 > 1) val2 = 1;

  let probabilidad = 0;
  let texto = "";
  let z1 = ((val1 - media) / desv).toFixed(2);
  let z2 = ((val2 - media) / desv).toFixed(2);

  switch (tipo) {
    case "exacto":
      probabilidad = normalCDF(val1 + 0.5, media, desv) - normalCDF(val1 - 0.5, media, desv);
      texto = `Probabilidad valor exacto ${val1}: ${(probabilidad * 100).toFixed(2)}%<br>Z = ${z1}`;
      break;
    case "mayor":
      probabilidad = 1 - normalCDF(val1, media, desv);
      texto = `Probabilidad valores mayores que ${val1}: ${(probabilidad * 100).toFixed(2)}%<br>Z = ${z1}`;
      break;
    case "menor":
      probabilidad = normalCDF(val1, media, desv);
      texto = `Probabilidad valores menores que ${val1}: ${(probabilidad * 100).toFixed(2)}%<br>Z = ${z1}`;
      break;
    case "rango":
      if (val2 < val1) {
        alert("Valor 2 debe ser mayor o igual a Valor 1");
        return;
      }
      probabilidad = normalCDF(val2, media, desv) - normalCDF(val1, media, desv);
      texto = `Probabilidad valores entre ${val1} y ${val2}: ${(probabilidad * 100).toFixed(2)}%<br>Z1 = ${z1}, Z2 = ${z2}`;
      break;
  }

  document.getElementById("resultado").innerHTML = texto;
  document.getElementById("estadisticas").innerHTML = `
    <strong>Estadísticas:</strong><br>
    n = ${n}<br>
    Media (μ) = ${media.toFixed(2)}<br>
    Desviación estándar (σ) = ${desv.toFixed(2)}
  `;

  const minX = Math.min(...datos);
  const maxX = Math.max(...datos);
  const rangoXmin = (minX === 0 && maxX === 1) ? -0.5 : minX - 3 * desv;
  const rangoXmax = (minX === 0 && maxX === 1) ? 1.5 : maxX + 3 * desv;

  const x = linspace(rangoXmin, rangoXmax, 500);
  const y = x.map(xx => normalPDF(xx, media, desv));

  const ySombra = x.map(xx => {
    switch (tipo) {
      case "exacto": return (Math.abs(xx - val1) <= 0.5) ? normalPDF(xx, media, desv) : 0;
      case "mayor":  return (xx >= val1) ? normalPDF(xx, media, desv) : 0;
      case "menor":  return (xx <= val1) ? normalPDF(xx, media, desv) : 0;
      case "rango":  return (xx >= val1 && xx <= val2) ? normalPDF(xx, media, desv) : 0;
      default:       return 0;
    }
  });

  const curva = {
    x, y, type: "scatter", mode: "lines", name: "Curva normal",
    line: { color: "blue" }
  };

  const areaSombreada = {
    x: [...x, ...x.slice().reverse()],
    y: [...ySombra, ...ySombra.map(() => 0).reverse()],
    fill: "toself",
    fillcolor: "rgba(0, 0, 255, 0.3)",
    line: { color: "transparent" },
    type: "scatter",
    name: "Área sombreada"
  };

  const layout = {
    title: "Distribución Normal",
    yaxis: { title: "Densidad de probabilidad", zeroline: false },
    xaxis: { title: "Valores" },
    showlegend: true,
  };

  Plotly.newPlot("grafica", [curva, areaSombreada], layout, { responsive: true });
}
