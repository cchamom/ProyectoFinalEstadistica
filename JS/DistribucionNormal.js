class Excel {
  constructor(content) {
    this.content = content;
  }

  header() {
    return this.content[0];
  }

  rows() {
    return this.content.slice(1);
  }

  toObjectArray() {
    const headers = this.header();
    return this.rows().map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });
  }
}

const DistribucionNormal = {
  normalEstandarAcumulada: function (z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    prob = 1 - prob;
    return z >= 0 ? prob : 1 - prob;
  },

  probMenorQue: function (x, mu, sigma) {
    if (sigma <= 0) throw new Error("La desviación estándar debe ser mayor que cero.");
    const z = (x - mu) / sigma;
    return this.normalEstandarAcumulada(z);
  }
};

document.getElementById("excel-input").addEventListener("change", async function () {
  try {
    const contenido = await readXlsxFile(this.files[0]);
    const excel = new Excel(contenido);
    const output = document.getElementById("output");
    let textoSalida = "";

    const edadMap = {
      "Menor de edad": 17,
      "18-25": 21.5,
      "26-35": 30.5,
      "36-45": 40.5,
      "45 o más": 50
    };

    const confianzaMap = {
      "Baja": 1,
      "Media": 2,
      "Alta": 3
    };

    const datos = excel.toObjectArray();
    const edades = [], confianzas = [];

    datos.forEach(row => {
      const edadNum = edadMap[row["Edad"]];
      if (edadNum !== undefined) edades.push(edadNum);

      const confianza = confianzaMap[row["¿Qué nivel de confianza tiene en los resultados que proporciona la IA?"]];
      if (confianza !== undefined) confianzas.push(confianza);
    });

    function calcular(label, valores, ejemplos) {
      const n = valores.length;
      const media = valores.reduce((a, b) => a + b, 0) / n;
      const desviacion = Math.sqrt(valores.map(x => Math.pow(x - media, 2)).reduce((a, b) => a + b) / n);
      textoSalida += `🔸 ${label}:\n   Media (μ): ${media.toFixed(2)}\n   Desviación estándar (σ): ${desviacion.toFixed(2)}\n`;

      ejemplos.forEach(val => {
        const prob = DistribucionNormal.probMenorQue(val, media, desviacion);
        textoSalida += `   P(X ≤ ${val}) = ${prob.toFixed(6)}\n`;
      });
      textoSalida += "\n";
    }

    if (edades.length > 0) calcular("Edad", edades, [20, 30, 40]);
    if (confianzas.length > 0) calcular("Nivel de confianza en la IA", confianzas, [1, 2, 3]);

    output.textContent = textoSalida || "No se encontraron variables válidas para distribución normal.";
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("output").textContent = `Error: ${error.message}`;
  }
});
