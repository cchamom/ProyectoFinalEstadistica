function generarCurvaNormal(media = 0, desviacion = 1, desde = -4, hasta = 4, paso = 0.1, sombraDesde = -1, sombraHasta = 1) {
    const x = [];
    const y = [];

    for (let i = desde; i <= hasta; i += paso) {
        x.push(i.toFixed(2));
        const valor = (1 / (desviacion * Math.sqrt(2 * Math.PI))) *
                      Math.exp(-0.5 * Math.pow((i - media) / desviacion, 2));
        y.push(valor);
    }

    const ctx = document.getElementById("curvaNormalChart").getContext("2d");

    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: x,
            datasets: [{
                label: "Curva Normal",
                data: y,
                borderColor: "blue",
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                annotation: {
                    annotations: {
                        sombra: {
                            type: 'box',
                            xMin: sombraDesde,
                            xMax: sombraHasta,
                            yMin: 0,
                            yMax: Math.max(...y),
                            backgroundColor: 'rgba(255, 99, 132, 0.25)',
                            borderWidth: 0
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Curva Normal con Área Sombreada'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Z (Valor estandarizado)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Densidad de probabilidad'
                    }
                }
            }
        }
    });
}

// Puedes ajustar estos valores según los datos reales:
generarCurvaNormal(0, 1, -4, 4, 0.1, -1, 1);
