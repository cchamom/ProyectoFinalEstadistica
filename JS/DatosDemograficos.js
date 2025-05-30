document.getElementById("excel-input").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  readXlsxFile(file).then((rows) => {
    const headers = rows[0];
    const edadIndex = headers.indexOf("Edad");
    const generoIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes("género"));
    const ubicacionIndex = headers.indexOf("Ubicación");

    const edades = [];
    const generos = {};
    const ubicaciones = {};

    rows.slice(1).forEach((row) => {
      const edad = parseInt(row[edadIndex]);
      const genero = row[generoIndex];
      const ubicacion = row[ubicacionIndex];

      if (!isNaN(edad)) edades.push(edad);

      if (genero) generos[genero] = (generos[genero] || 0) + 1;
      if (ubicacion) ubicaciones[ubicacion] = (ubicaciones[ubicacion] || 0) + 1;
    });

    graficarEdades(edades);
    graficarDistribucion(generos, "generoChart", "Género");
    graficarDistribucion(ubicaciones, "ubicacionChart", "Ubicación");
  });
});

function graficarEdades(edades) {
  const bins = {};
  edades.forEach((edad) => {
    const rango = `${Math.floor(edad / 10) * 10}-${Math.floor(edad / 10) * 10 + 9}`;
    bins[rango] = (bins[rango] || 0) + 1;
  });

  const labels = Object.keys(bins).sort();
  const data = labels.map(label => bins[label]);

  new Chart(document.getElementById("edadChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Número de Personas",
        data,
        backgroundColor: "#36a2eb"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

function graficarDistribucion(objeto, idCanvas, etiqueta) {
  const labels = Object.keys(objeto);
  const data = labels.map(label => objeto[label]);

  new Chart(document.getElementById(idCanvas), {
    type: "pie",
    data: {
      labels,
      datasets: [{
        label: etiqueta,
        data,
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#8e5ea2", "#3cba9f"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}
