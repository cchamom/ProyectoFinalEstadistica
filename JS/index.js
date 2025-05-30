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

        if (!table) {
            console.error("La tabla con ID 'resultado-table' no se encuentra en esta página.");
            return;
        }

        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");

        if (!thead || !tbody) {
            console.error("Faltan <thead> o <tbody> dentro de la tabla.");
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

// Un solo evento DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem("excelContent");
    if (stored) {
        const contenido = JSON.parse(stored);
        const excel = new Excel(contenido);
        ExcelPrint.print(excel);
    }

    const excelInput = document.getElementById("excel-input");
    const limpiarBtn = document.getElementById("limpiar-tabla");

    if (excelInput) {
        excelInput.addEventListener("change", async function () {
            try {
                const contenido = await readXlsxFile(excelInput.files[0]);

                localStorage.setItem("excelContent", JSON.stringify(contenido));

                const excel = new Excel(contenido);
                ExcelPrint.print(excel);

            } catch (error) {
                console.error("Error al procesar el archivo:", error);
                const resultBody = document.getElementById("result-body");
                if (resultBody) {
                    resultBody.innerHTML = `
                        <tr>
                            <td colspan="9" class="text-danger">
                                Error al procesar el archivo: ${error.message}
                            </td>
                        </tr>`;
                }
            }
        });
    }

    if (limpiarBtn) {
        limpiarBtn.addEventListener("click", () => {
            localStorage.removeItem("excelContent");

            const table = document.getElementById("resultado-table");
            if (table) {
                const thead = table.querySelector("thead");
                const tbody = table.querySelector("tbody");

                if (thead) thead.innerHTML = "<tr></tr>";
                if (tbody) tbody.innerHTML = "";
            }

            console.log("Tabla limpiada y datos eliminados de localStorage.");
        });
    }
});
