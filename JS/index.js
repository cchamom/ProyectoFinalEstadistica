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
})