
export const exportToCsv = (filename: string, rows: (string | number)[][]): void => {
    const processRow = (row: (string | number)[]): string => {
        let finalVal = '';
        for (let j = 0; j < row.length; j++) {
            let innerValue = row[j] === null || row[j] === undefined ? '' : String(row[j]);
            if (String(row[j]).includes(',')) {
                innerValue = '"' + innerValue + '"';
            }
            if (j > 0) {
                finalVal += ',';
            }
            finalVal += innerValue;
        }
        return finalVal + '\n';
    };

    let csvFile = '';
    for (let i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
