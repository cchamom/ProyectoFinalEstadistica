class Excel {
    constructor(content) {
        this.content = content;
    }

    header() {
        return this.content[0];
    }

    rows() {
        return new RowCollection(this.content.slice(1));
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

class ExcelPrint {
    static print(excel) {
        const table = document.getElementById("resultado-table");
        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");

        if (!table || !thead || !tbody) {
            console.error("No se encontraron los elementos de la tabla");
            return;
        }

        // Limpiar tabla
        thead.innerHTML = "";
        tbody.innerHTML = "";

        // Agregar encabezados
        const headerRow = excel.header();
        thead.innerHTML = "<tr>" + headerRow.map(title => `<th>${title}</th>`).join("") + "</tr>";

        // Agregar filas
        const rows = excel.rows();
        for (let i = 0; i < rows.count(); i++) {
            const row = rows.get(i);
            let rowHtml = "<tr>";
            row.forEach(cell => {
                rowHtml += `<td>${cell ?? ""}</td>`;
            });
            rowHtml += "</tr>";
            tbody.innerHTML += rowHtml;
        }
    }
}

// Al cargar la página, intenta cargar los datos desde localStorage
window.addEventListener("DOMContentLoaded", () => {
    const guardado = localStorage.getItem("excelContent");
    if (guardado) {
        const contenido = JSON.parse(guardado);
        const excel = new Excel(contenido);
        ExcelPrint.print(excel);
    }
});

// Evento cuando se selecciona un archivo Excel
const excelInput = document.getElementById("excel-input");
excelInput.addEventListener("change", async function () {
    try {
        const contenido = await readXlsxFile(excelInput.files[0]);

        // Guardar en localStorage
        localStorage.setItem("excelContent", JSON.stringify(contenido));

        const excel = new Excel(contenido);
        ExcelPrint.print(excel);

    } catch (error) {
        console.error("Error al procesar el archivo:", error);
        document.getElementById("result-body").innerHTML = `
            <tr>
                <td colspan="9" class="text-danger">
                    Error al procesar el archivo: ${error.message}
                </td>
            </tr>`;
    }
});

// Botón para limpiar tabla y localStorage
const limpiarBtn = document.getElementById("limpiar-tabla");
limpiarBtn.addEventListener("click", () => {
    localStorage.removeItem("excelData");

    const table = document.getElementById("resultado-table");
    table.querySelector("thead").innerHTML = "<tr></tr>";
    table.querySelector("tbody").innerHTML = "";

    console.log("Tabla limpiada y datos eliminados de localStorage.");
});
// Recuperar contenido guardado al cargar la página
window.addEventListener("DOMContentLoaded", function() {
    const stored = localStorage.getItem("excelData");
    if (stored) {
        const contenido = JSON.parse(stored);
        const excel = new Excel(contenido);
        ExcelPrint.print(excel);
    }
});
