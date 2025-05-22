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

    Edad() {
        return this.row[0];
    }

    Género() {
        return this.row[1];
    }

    OcupaciónActual() {
        return this.row[2];
    }

    Ha_utilizado_alguna_vez_una_herramienta_de_inteligencia_artificial_como_ChatGPT_Copilot_o_similares() {
        return this.row[3];
    }

    Está_de_acuerdo_con_el_uso_de_la_IA_en_la_educación_por_ejemplo_para_apoyar_en_tareas_o_estudios() {
        return this.row[4];
    }

    Prefiere_que_una_empresa_utilice_IA_para_atención_al_cliente_o_que_sea_atendido_por_una_persona() {
        return this.row[5];
    }

   Para_qué_ha_utilizado_o_usaría_la_IA () {
    return this.row[6];
    }

    Qué_nivel_de_confianza_tiene_en_los_resultados_que_proporciona_la_IA() {
        return this.row[7];
    }

    Qué_cree_que_es_más_probable_con_el_avance_de_la_IA() {
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
                    <td>${row.Edad()}</td>
                    <td>${row.Género()}</td>
                    <td>${row.OcupaciónActual()}</td>
                    <td>${row.Ha_utilizado_alguna_vez_una_herramienta_de_inteligencia_artificial_como_ChatGPT_Copilot_o_similares()}</td>
                    <td>${row.Está_de_acuerdo_con_el_uso_de_la_IA_en_la_educación_por_ejemplo_para_apoyar_en_tareas_o_estudios()}</td>
                    <td>${row.Prefiere_que_una_empresa_utilice_IA_para_atención_al_cliente_o_que_sea_atendido_por_una_persona()}</td>
                    <td>${row.Para_qué_ha_utilizado_o_usaría_la_IA()}</td>
                    <td>${row.Qué_nivel_de_confianza_tiene_en_los_resultados_que_proporciona_la_IA()}</td>
                    <td>${row.Qué_cree_que_es_más_probable_con_el_avance_de_la_IA()}</td>
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