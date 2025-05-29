const DistribucionNormal = {
    /**
     * Función de distribución acumulativa (CDF) de la normal estándar.
     * @param {number} z
     * @returns {number}
     */
    normalEstandarAcumulada: function (z) {
        // Aproximación de la función de error
        const t = 1 / (1 + 0.2316419 * Math.abs(z));
        const d = 0.3989423 * Math.exp(-z * z / 2);
        let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        prob = 1 - prob;

        return z >= 0 ? prob : 1 - prob;
    },

    /**
     * Cálculo de P(X ≤ x) con media mu y desviación estándar sigma
     * @param {number} x
     * @param {number} mu
     * @param {number} sigma
     * @returns {number}
     */
    probMenorQue: function (x, mu, sigma) {
        if (sigma <= 0) {
            throw new Error("La desviación estándar debe ser mayor que cero.");
        }
        const z = (x - mu) / sigma;
        return this.normalEstandarAcumulada(z);
    },

    /**
     * Cálculo de P(a ≤ X ≤ b)
     * @param {number} a
     * @param {number} b
     * @param {number} mu
     * @param {number} sigma
     * @returns {number}
     */
    probEntre: function (a, b, mu, sigma) {
        if (sigma <= 0) {
            throw new Error("La desviación estándar debe ser mayor que cero.");
        }
        const zA = (a - mu) / sigma;
        const zB = (b - mu) / sigma;
        const probA = this.normalEstandarAcumulada(zA);
        const probB = this.normalEstandarAcumulada(zB);
        return probB - probA;
    }
};
