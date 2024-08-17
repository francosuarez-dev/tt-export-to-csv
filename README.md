
# TanStack Table Export to CSV

This library provides a function to export data from a TanStack table to a CSV file.


## Installation

```bash
  npm i tt-export-to-csv
```
or
```bash
  yarn add tt-export-to-csv
```

## Dependencies

This library has the following dependencies:

- `papaparse`: To handle data conversion to CSV format. It must be installed in your project for the library to work correctly.

Puedes instalar `papaparse` usando `npm` o `yarn`:
```bash
  npm install papaparse
```
```bash
  yarn add papaparse
```

## Usage

### `exportToCsv`
The main function of the library is `exportToCsv`, which allows you to export the table data to a CSV file.

## Parámetros:

- **filename**: The name of the CSV file to be generated.

- **headers**: An array of `Header` objects that defines the table headers.

- **rows**: An array of `Row` objects containing the table data.

- **original** (optional): If specified as `true`, a CSV will be generated with the original data according to the interface used to define the columns. If not specified, the CSV will be created from `headers` and `rows`.

### Column Customization:

You can customize the column export using the meta property in the column definition. The `exportCsvString` property allows you to define a string that will be used to customize the exported content. You can use ${variable}

```javascript
...
  meta: {
        exportCsvString: '${name} more string' // allows you to define a string that will be used to customize the exported content. You can use ${variable} to insert values ​​obtained from getValue.
      }
...
```
### Example:

```javascript
import {
  columnDef,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { exportToCsv } from 'tt-export-to-csv'

type User = {
  id: string;
  first-name: string;
  last-name: string;
  active: boolean;
};

const columnHelper = createColumnHelper<User>();

const UserColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accesorFn: row => ({ name: row.first-name, lastName: row.last-name id: row.id}),
    cell: info => {
      const { name, lastName, id } = info.getValue() as {name: string, lastName: string, id: number};
      return (
        <a href={`/user/profile/${id}`}>
          <span>
          {`${name}-${lastName}`}
          </span>
        </a>
      )
    },
    meta: {
      exportCsvString: '${name}' // allows you to define a string that will be used to customize the exported content. You can use ${variable} to insert values ​​obtained from getValue.
    }
  },
  {
    id: 'state',
    header: 'State',
    accesorKey: 'active'
  }
]

const App: React.FC = () => {

  const [data, setData] = React.useState(() => [...defaultData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleExportToCsv = (): void => {
    const headers = table
      .getHeaderGroups()
      .map((x) => x.headers)
      .flat();

    const rows = table.getCoreRowModel().rows; // All Rows
    const rows = table.getSelectedRowModel().rows; // Selected rows

    exportToCsv('users.csv', headers, rows);
  };

  return(
    <>
      <button onClick={handleExportToCsv}>Export to csv</button>
    </>
  )
}

```


## License

[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)

