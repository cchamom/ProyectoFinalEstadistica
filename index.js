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

    first() {
        return new Row(this.rows[0]);
    }

    get(index) {
        return new Row(this.rows[index]);
    }

    count() {
        return this.rows.length;
    }
}

// Clase para manejar las filas del Excel
//Esto se debe de cambair segun el formato del excel
//Cada uno se debe de llamar igual que el encabezado del excel esto solo es un ejemplo de una prueba que hice
class Row {
    constructor(row) {
        this.row = row;
    }

    Nombre() {
        return this.row[0];
    }

    Apellido() {
        return this.row[1];
    }

    Direccion() {
        return this.row[2];
    }

    Telefono() {
        return this.row[3];
    }

    Correo() {
        return this.row[4];
    }

    Pregunta6() {
        return this.row[5];
    }

    Pregunta7() {
        return this.row[6];
    }

    Pregunta8() {
        return this.row[7];
    }

    Pregunta9() {
        return this.row[8];
    }
}

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
        excel.header().forEach(title => {
            thead.innerHTML += `<th>${title}</th>`;
        });

        // Agregar filas
        const rows = excel.rows();
        for(let i = 0; i < rows.count(); i++) {
            const row = rows.get(i);
            tbody.innerHTML += `
                <tr>
                    <td>${row.Nombre()}</td>
                    <td>${row.Apellido()}</td>
                    <td>${row.Direccion()}</td>
                    <td>${row.Telefono()}</td>
                    <td>${row.Correo()}</td>
                    <td>${row.Pregunta6()}</td>
                    <td>${row.Pregunta7()}</td>
                    <td>${row.Pregunta8()}</td>
                    <td>${row.Pregunta9()}</td>
                </tr>`;
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