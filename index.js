//
class Excel {
    constructor(content) {
        this.content = content; 
    }

    header() {
        return this.content[0];
    }

    rows() {
        return new RowCollection(this.content.slice(1, this.content.length));
    }
}

class RowCollection {
    constructor(rows) {
        this.rows = rows;
    }

    get(index) {
        return this.rows[index];
    }

    count() {
        return this.rows.length;
    }
}

// Clase para manejar las filas del Excel
//Esto se debe de cambair segun el formato del excel
//Cada uno se debe de llamar igual que el encabezado del excel esto solo es un ejemplo de una prueba que hice

//clase para manejar la impresión de los datos en la tabla
class ExcelPrint {
    static print(excel) {
        const table = document.getElementById("resultado-table");
        const thead = table.querySelector("thead tr");
        const tbody = table.querySelector("tbody");

        if (!table || !thead || !tbody) {
            console.error("No se encontraron los elementos de la tabla");
            return;
        }

        // Limpiar la tabla
        thead.innerHTML = "";
        tbody.innerHTML = "";

        // Agregar encabezados
        const headerRow = excel.header();
        headerRow.forEach(title => {
            thead.innerHTML += `<th>${title}</th>`;
        });

        // Agregar datos
        const rows = excel.rows();
        for(let i = 0; i < rows.count(); i++) {
            const row = rows.get(i);
            let rowHtml = "<tr>";
            row.forEach(cell => {
                rowHtml += `<td>${cell ??""}</td>`;
            })
            rowHtml += "</tr>";
            tbody.innerHTML += rowHtml;
        }
    }
}

//Evento para manejar la carga del archivo Excel
const excelInput = document.getElementById("exel-input");
excelInput.addEventListener("change", async function() {
    try {
        const contenido = await readXlsxFile(excelInput.files[0]);
        const excel = new Excel(contenido);
        
        //Imprimir los datos en la tabla
        ExcelPrint.print(excel)
        console.log('Excel cargado:', {
            contenido: contenido,
            encabezados: excel.header(),
            filas: excel.rows()
        })
    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        document.getElementById("result-body").innerHTML = `
            <tr>
                <td colspan="9" class="text-danger">
                    Error al procesar el archivo: ${error.message}
                </td>
            </tr>`;
    }
    function calcularMedia(arr) {
    const suma = arr.reduce((acc, val) => acc + val, 0);
    return suma / arr.length;
}

function calcularDesviacion(arr, media) {
    const sumaCuadrados = arr.reduce((acc, val) => acc + Math.pow(val - media, 2), 0);
    return Math.sqrt(sumaCuadrados / arr.length);
}

function generarCurvaNormal(media, desviacion, rango = 3) {
    const x = [];
    const y = [];
    const min = media - rango * desviacion;
    const max = media + rango * desviacion;
    const paso = (max - min) / 100;

    for (let i = min; i <= max; i += paso) {
        x.push(i);
        const pdf = (1 / (desviacion * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i - media) / desviacion, 2));
        y.push(pdf);
    }

    return { x, y };
}

function graficarCurvaNormal(datosNumericos) {
    const media = calcularMedia(datosNumericos);
    const desviacion = calcularDesviacion(datosNumericos, media);
    const { x, y } = generarCurvaNormal(media, desviacion);

    const curva = {
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines',
        name: 'Curva Normal',
        line: { color: 'blue' },
        fill: 'tozeroy',
        fillcolor: 'rgba(0, 128, 255, 0.3)'
    };

    Plotly.newPlot('curva-normal', [curva], {
        title: 'Distribución Normal',
        xaxis: { title: 'Valor' },
        yaxis: { title: 'Densidad de probabilidad' }
    });
}

})
