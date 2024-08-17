/*
 * Copyright (C) 2024 doctaDev - Franco Suarez
 * This file is part of tt-export-to-csv.
 *
 * tt-export-to-csv is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * tt-export-to-csv is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with tt-export-to-csv.  If not, see <https://www.gnu.org/licenses/>.
 */

import { ReactElement, ReactNode } from "react";
import { Header, Row } from "@tanstack/react-table";
import Papa from 'papaparse'


type MetaType = {
    exportCsvString?: string
}
interface ResultObject {
    [key: string]: string; // Claves de tipo string con valores de tipo string
}
interface InnerText {
    (jsx: ReactNode): string;
    default: InnerText;
}

const hasProps = (jsx: ReactNode): jsx is ReactElement =>
    Object.prototype.hasOwnProperty.call(jsx, 'props');

const reduceJsxToString = (previous: string, current: ReactNode): string =>
    // eslint-disable-next-line no-use-before-define
    previous + innerText(current);

// Expresión regular para encontrar los valores dentro de ${}
const regex = /\${(.*?)}/g;

const replaceVariables = (template: string, variables: []) => {
    return template.replace(regex, (_, key) => {
        // Devuelve el valor correspondiente a la clave en el objeto de variables
        return variables[key] || '';
    });
}

//Inner Text
const innerText: InnerText = (jsx: ReactNode): string => {

    // Empty
    if (
        jsx === null ||
        typeof jsx === 'boolean' ||
        typeof jsx === 'undefined'
    ) {
        return '';
    }

    // Numeric children.
    if (typeof jsx === 'number') {
        return jsx.toString();
    }

    // String literals.
    if (typeof jsx === 'string') {
        return jsx;
    }

    // Array of JSX.
    if (Array.isArray(jsx)) {
        return jsx.reduce<string>(reduceJsxToString, '');
    }

    // Children prop.
    if (
        hasProps(jsx) &&
        Object.prototype.hasOwnProperty.call(jsx.props, 'children')
    ) {
        return innerText(jsx.props.children);
    }

    // Default
    return '';
};

innerText.default = innerText;



const getHeaderNames = (headers: Header<any, unknown>[]): string[] =>
    headers.map((header) => {
        if (typeof header.column.columnDef.header === "function") {
            const headerContext = header.column.columnDef.header(header.getContext());
            if (typeof headerContext === "string") {
                return headerContext;
            }
            return innerText(headerContext);
        } else {
            return header.column.columnDef.header ?? header.id;
        }
    });

const getRowsData = (rows: Row<any>[]): string[][] => {
    return rows.map((row: Row<any>) => {

        const cells = row.getAllCells()

        const cellsContent = cells.filter((x) => x.column.getIsVisible()).map((x) => {
            const metaCell = x.column.columnDef.meta as MetaType
            const value: any = x.getValue()

            if (metaCell && metaCell.exportCsvString && value) {
                const stringT = metaCell.exportCsvString as string
                if (typeof value === 'object') {
                    return replaceVariables(stringT, value)
                } else {
                    return stringT
                }
            } else {
                return value
            }
        });

        return cellsContent;
    });
};


const createCsvBlob = (
    headers: Header<any, unknown>[],
    rows: Row<any>[],
    original?: boolean
): Blob => {
    let csvContent = "";

    if (original) {
        const selectedOri = rows.map(row => row.original)
        csvContent += Papa.unparse(selectedOri);
    } else {
        const headerNames = getHeaderNames(headers);
        csvContent += headerNames.join(",") + "\n";

        const data = getRowsData(rows);
        data.forEach((row) => {
            csvContent += row.join(",") + "\n";
        });
    }

    return new Blob([csvContent], { type: "text/csv" });
};

export const exportToCsv = (
    fileName: string,
    headers: Header<any, unknown>[],
    rows: Row<any>[],
    original?: boolean
): void => {
    const blob = createCsvBlob(headers, rows, original);
    const link = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
}