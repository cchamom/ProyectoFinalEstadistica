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
  },
  probEntre: function (a, b, mu, sigma) {
    if (sigma <= 0) throw new Error("La desviación estándar debe ser mayor que cero.");
    return this.probMenorQue(b, mu, sigma) - this.probMenorQue(a, mu, sigma);
  }
};