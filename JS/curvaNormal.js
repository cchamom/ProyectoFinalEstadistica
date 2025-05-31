let datosExcel = [];
let datos = [];

document.getElementById("excelFile").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(hoja, { header: 1 });

    datosExcel = json;
    mostrarOpcionesColumnas(json[0]); // Encabezados
  };
  reader.readAsArrayBuffer(e.target.files[0]);
});

function mostrarOpcionesColumnas(encabezados) {
  const select = document.getElementById("columnaSelect");
  select.innerHTML = "";
  encabezados.forEach((col, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = col || `Columna ${i + 1}`;
    select.appendChild(opt);
  });
  select.disabled = false;
  select.addEventListener("change", cargarDatosColumna);
  cargarDatosColumna(); // Cargar la primera por defecto
}

function cargarDatosColumna() {
  const colIndex = parseInt(document.getElementById("columnaSelect").value);
  datos = datosExcel.slice(1).map(row => parseFloat(row[colIndex])).filter(x => !isNaN(x));
  alert("Columna seleccionada cargada: " + datos.length + " valores válidos.");
}

function calcularMedia(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calcularDesviacion(arr, media) {
  const varianza = arr.reduce((acc, val) => acc + (val - media) ** 2, 0) / arr.length;
  return Math.sqrt(varianza);
}

function normalPDF(x, mu, sigma) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function normalCDF(x, mu, sigma) {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429;
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function calcular() {
  if (datos.length === 0) return alert("Primero carga una columna con datos válidos.");

  const tipo = document.getElementById("tipo").value;
  const x1 = parseFloat(document.getElementById("valor1").value);
  const x2 = parseFloat(document.getElementById("valor2").value);
  const media = calcularMedia(datos);
  const desviacion = calcularDesviacion(datos, media);

  let probabilidad = 0;
  let sombreadoX = [], sombreadoY = [];

  const x = [], y = [];
  for (let i = media - 4 * desviacion; i <= media + 4 * desviacion; i += 0.1) {
    const val = normalPDF(i, media, desviacion);
    x.push(i);
    y.push(val);
  }

  if (tipo === "exacto") {
    probabilidad = 0;
    sombreadoX = [x1];
    sombreadoY = [normalPDF(x1, media, desviacion)];
  } else if (tipo === "mayor") {
    probabilidad = 1 - normalCDF(x1, media, desviacion);
    sombreadoX = x.filter(v => v >= x1);
    sombreadoY = sombreadoX.map(v => normalPDF(v, media, desviacion));
  } else if (tipo === "menor") {
    probabilidad = normalCDF(x1, media, desviacion);
    sombreadoX = x.filter(v => v <= x1);
    sombreadoY = sombreadoX.map(v => normalPDF(v, media, desviacion));
  } else if (tipo === "rango") {
    probabilidad = normalCDF(x2, media, desviacion) - normalCDF(x1, media, desviacion);
    sombreadoX = x.filter(v => v >= x1 && v <= x2);
    sombreadoY = sombreadoX.map(v => normalPDF(v, media, desviacion));
  }

  document.getElementById("resultado").innerHTML = `
    <p><strong>Media:</strong> ${media.toFixed(2)} | <strong>Desviación estándar:</strong> ${desviacion.toFixed(2)}</p>
    <p><strong>Probabilidad:</strong> ${(probabilidad * 100).toFixed(2)}%</p>
  `;

  const grafica = [
    {
      x: x,
      y: y,
      type: 'scatter',
      mode: 'lines',
      name: 'Distribución normal'
    },
    {
      x: sombreadoX,
      y: sombreadoY,
      fill: 'tozeroy',
      type: 'scatter',
      mode: 'lines',
      name: 'Área sombreada',
      fillcolor: 'rgba(0,100,200,0.4)'
    }
  ];

  Plotly.newPlot('grafica', grafica, { title: "Curva Normal" });
}
