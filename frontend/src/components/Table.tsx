import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
  FaDownload,
  FaFilter,
  FaMagnifyingGlass,
  FaSort,
  FaSortDown,
  FaSortUp,
} from "react-icons/fa6";
import { clamp, isEqual, pick, sortBy, sum } from "lodash";
import type { Column, FilterFn, NoInfer, RowData } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table,
} from "@tanstack/react-table";
import Button from "@/components/Button";
import Popover from "@/components/Popover";
import Select from "@/components/Select";
import type { Option } from "@/components/Select";
import Slider from "@/components/Slider";
import TextBox from "@/components/TextBox";
import Tooltip from "@/components/Tooltip";
import { downloadCsv } from "@/util/download";
import classes from "./Table.module.css";

type Col<
  Datum extends object = object,
  Key extends keyof Datum = keyof Datum,
> = {
  /** key of row object to access as cell value */
  key: Key;
  /** label for header */
  name: string;
  /** is sortable (default true) */
  sortable?: boolean;
  /** whether col is individually filterable */
  filterable?: boolean;
  /**
   * how to treat cell value when filtering individually or globally (default
   * string)
   */
  filterType?: "string" | "number" | "enum" | "boolean";
  /** horizontal alignment */
  align?: "left" | "center" | "right";
  /** visibility (default true) */
  show?: boolean;
  /** custom render function for cell */
  render?: (cell: NoInfer<Datum[Key]>) => ReactNode;
};

/**
 * https://stackoverflow.com/questions/68274805/typescript-reference-type-of-property-by-other-property-of-same-object
 * https://github.com/vuejs/core/discussions/8851
 */
type _Col<Datum extends object> = {
  [Key in keyof Datum]: Col<Datum, Key>;
}[keyof Datum];

type Props<Datum extends object> = {
  cols: _Col<Datum>[];
  rows: Datum[];
};

/** https://tanstack.com/table/v8/docs/api/core/column-def#meta */
declare module "@tanstack/table-core" {
  // eslint-disable-next-line
  interface ColumnMeta<TData extends RowData, TValue> {
    filterable: NonNullable<Col["filterable"]>;
    filterType: NonNullable<Col["filterType"]>;
    align: NonNullable<Col["align"]>;
  }
}

/** map column definition to multi-select option */
const colToOption = <Datum extends object>(
  col: Props<Datum>["cols"][number],
  index: number,
): Option => ({
  id: String(index),
  text: col.name,
});

/**
 * table with sorting, filtering, searching, pagination, etc.
 *
 * reference:
 * https://codesandbox.io/p/devbox/tanstack-table-example-kitchen-sink-vv4871
 */
const Table = <Datum extends object>({ cols, rows }: Props<Datum>) => {
  /** column visibility options for multi-select */
  const visibleOptions = cols.map(colToOption);
  /** visible columns */
  const [visible, setVisible] = useState<Option[]>(
    cols
      .filter((col) => col.show === true || col.show === undefined)
      .map(colToOption),
  );

  /** table-wide search */
  const [search, setSearch] = useState("");

  /** per page options */
  const perPageOptions = [
    { id: "5", text: "5" },
    { id: "10", text: "10" },
    { id: "50", text: "50" },
    { id: "100", text: "100" },
    { id: "500", text: "500" },
  ];

  /** custom filter func */
  const filterFunc = useMemo<FilterFn<Datum>>(
    () => (row, columnId, filterValue: unknown) => {
      const type = cols[Number(columnId)]?.filterType;
      if (!type) return true;

      /** string column */
      if (type === "string") {
        const value = (filterValue as string).trim();
        if (!value) return true;
        const cell = (row.getValue(columnId) as string).trim();
        if (!cell) return true;
        return !!cell.match(new RegExp(value, "i"));
      }

      /** number col */
      if (type === "number") {
        const value = filterValue as [number, number];
        const cell = row.getValue(columnId) as number;
        return cell >= value[0] && cell <= value[1];
      }

      /** enumerated col */
      if (type === "enum") {
        const cell = row.getValue(columnId) as string;

        /** if filtering with multi-select (column filter) */
        if (Array.isArray(filterValue)) {
          const value = filterValue as Option[];
          if (!value.length) return true;
          return !!value.find((option) => option.text === cell);
        }

        /** if filtering with plain text (global search) */
        if (typeof filterValue === "string") {
          return !!cell.match(new RegExp(filterValue, "i"));
        }
      }

      /** boolean col */
      if (type === "boolean") {
        const cell = row.getValue(columnId);
        if (typeof cell !== "boolean") return true;

        /** if filtering with single-select (column filter) */
        if (typeof filterValue === "object") {
          const value = filterValue as Option;
          if (value.id === "all") return true;
          else return String(cell) === value.id;
        }

        /** if filtering with plain text (global search) */
        if (typeof filterValue === "string") {
          const value = filterValue.trim().toLowerCase();
          if (!value) return true;

          /** map search string to boolean */
          const boolMap: Record<string, boolean> = {
            true: true,
            false: false,
            t: true,
            f: false,
            yes: true,
            no: false,
            y: true,
            n: false,
          };
          const bool = boolMap[value];
          if (bool === undefined) return true;
          return bool === cell;
        }
      }

      return true;
    },
    [cols],
  );

  const columnHelper = createColumnHelper<Datum>();
  /** column definitions */
  const columns = cols.map((col, index) =>
    columnHelper.accessor((row: Datum) => row[col.key], {
      /** unique column id, from position in provided column list */
      id: String(index),
      /** name */
      header: col.name,
      /** sortable */
      enableSorting: col.sortable ?? true,
      /** individually filterable */
      enableColumnFilter: col.filterable ?? false,
      /** include in table-wide search if column is visible */
      enableGlobalFilter: !!visible.find(
        (visible) => visible.id === String(index),
      ),
      /** type of column */
      meta: {
        filterable: col.filterable ?? false,
        filterType: col.filterType ?? "string",
        align: col.align ?? "left",
      },
      /** func to use for filtering */
      filterFn: filterFunc,
      /** render func for cell */
      cell: (cell) =>
        col.render ? col.render(cell.getValue()) : cell.getValue(),
    }),
  );

  /** tanstack table api */
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: filterFunc,
    getColumnCanGlobalFilter: () => true,
    autoResetPageIndex: true,
    columnResizeMode: "onChange",
    /** initial sort, page, etc. state */
    initialState: {
      sorting: [{ id: "0", desc: false }],
      pagination: {
        pageIndex: 0,
        pageSize: Number(perPageOptions[0]!.id),
      },
    },
    /** sync some controls with table state */
    state: {
      /** table-wide search */
      globalFilter: search,
      /** which columns are visible */
      columnVisibility: Object.fromEntries(
        cols.map((col, index) => [
          String(index),
          !!visible.find((visible) => visible.id === String(index)),
        ]),
      ),
    },
  });

  return (
    <div className="flex-col gap-md">
      {/* top controls */}
      <div className="flex-row gap-md">
        {/* visible columns */}
        <Select
          label="Cols"
          layout="horizontal"
          multi={true}
          options={visibleOptions}
          value={visible}
          onChange={setVisible}
        />

        {/* table-wide search */}
        <TextBox
          placeholder="Search"
          width={150}
          icon={<FaMagnifyingGlass />}
          value={search}
          onChange={setSearch}
          tooltip="Search entire table for plain text or regex"
        />

        {/* download */}
        <Button
          icon={<FaDownload />}
          text="CSV"
          onClick={() => {
            /** get col defs that are visible */
            const defs = visible.map((visible) => cols[Number(visible.id)]!);

            /** visible keys */
            const keys = defs.map((def) => def.key);

            /** visible names */
            const names = defs.map((def) => def.name);

            /** filtered row data */
            const data = table
              .getFilteredRowModel()
              .rows.map((row) => Object.values(pick(row.original, keys)));

            /** download */
            downloadCsv([names, ...data], ["geneplexus", "table"]);
          }}
          design="accent"
        />
      </div>

      <div className={classes.scroll}>
        {/* table */}
        <table
          className={classes.table}
          /** https://tanstack.com/table/v8/docs/guide/migrating#migrate-table-markup */
          aria-rowcount={table.getPrePaginationRowModel().rows.length}
          aria-colcount={cols.length}
        >
          {/* head */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    align={header.column.columnDef.meta?.align}
                    aria-colindex={Number(header.id) + 1}
                  >
                    {header.isPlaceholder ? null : (
                      <div className={classes.th}>
                        {/* header label */}
                        <span className={classes["th-label"]}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>

                        {/* header sort */}
                        <Tooltip content="Sort this column">
                          <button
                            className={classes["header-button"]}
                            data-active={
                              header.column.getIsSorted() ? "" : undefined
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {header.column.getIsSorted() ? (
                              header.column.getIsSorted() === "asc" ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort />
                            )}
                          </button>
                        </Tooltip>

                        {/* header filter */}
                        {header.column.getCanFilter() ? (
                          <Popover
                            label="Filter this column"
                            content={<Filter column={header.column} />}
                          >
                            <button
                              className={classes["header-button"]}
                              data-active={
                                header.column.getIsFiltered() ? "" : undefined
                              }
                            >
                              <FaFilter />
                            </button>
                          </Popover>
                        ) : null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* body */}
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  aria-rowindex={
                    table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                    index +
                    1
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} align={cell.column.columnDef.meta?.align}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className={classes.empty} colSpan={cols.length}>
                  No Rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* bottom controls */}
      <div className="flex-row gap-md">
        {/* pagination */}
        <div className={classes.pagination}>
          <button
            className={classes["page-button"]}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <FaAnglesLeft />
          </button>
          <button
            className={classes["page-button"]}
            onClick={table.previousPage}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <FaAngleLeft />
          </button>
          <Tooltip content="Jump to page">
            <button
              className={classes["page-text"]}
              onClick={() => {
                const page = parseInt(window.prompt("Jump to page") || "");
                if (Number.isNaN(page)) return;
                table.setPageIndex(clamp(page, 1, table.getPageCount()) - 1);
              }}
            >
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </button>
          </Tooltip>
          <button
            className={classes["page-button"]}
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <FaAngleRight />
          </button>
          <button
            className={classes["page-button"]}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <FaAnglesRight />
          </button>
        </div>

        {/* per page */}
        <Select
          label="Per page"
          layout="horizontal"
          options={perPageOptions}
          onChange={(option) => table.setPageSize(Number(option.id))}
          width={70}
        />
      </div>
    </div>
  );
};

export default Table;

type FilterProps<Datum extends object> = {
  column: Column<Datum>;
};

/** content of filter popup for column */
const Filter = <Datum extends object>({ column }: FilterProps<Datum>) => {
  /** type of filter */
  const type = column.columnDef.meta?.filterType;

  /** filter as number range */
  if (type === "number") {
    const [min = 0, max = 100] = column.getFacetedMinMaxValues() || [];
    return (
      <Slider
        min={min}
        max={max}
        multi={true}
        value={(column.getFilterValue() as [number, number]) ?? [min, max]}
        onChange={(value) => {
          /** return as "unfiltered" if value equals min/max range */
          column.setFilterValue(isEqual(value, [min, max]) ? undefined : value);
        }}
      />
    );
  }

  /** filter as multi-select */
  if (type === "enum") {
    /** get unique values in column */
    const options: Option[] = sortBy(
      Array.from(column.getFacetedUniqueValues().entries()).map(
        ([name, count]) => ({ name, count }),
      ),
      "count",
    ).map(({ name, count }) => ({
      id: String(name),
      text: String(name),
      info: String(count),
    }));

    return (
      <Select
        options={options}
        value={(column.getFilterValue() as Option[]) ?? options}
        onChange={(value, count) =>
          /** return as "unfiltered" if all or none are selected */
          column.setFilterValue(
            count === "all" || count === "none" ? undefined : value,
          )
        }
        multi={true}
      />
    );
  }

  /** filter as boolean */
  if (type === "boolean") {
    /** get options */
    const options: Option[] = [
      {
        id: "all",
        text: "All",
        info: String(sum(Array.from(column.getFacetedUniqueValues().values()))),
      },
      {
        id: "true",
        text: "True/Yes",
        info: String(column.getFacetedUniqueValues().get(true) ?? 0),
      },
      {
        id: "false",
        text: "False/No",
        info: String(column.getFacetedUniqueValues().get(false) ?? 0),
      },
    ];

    return (
      <Select
        options={options}
        value={(column.getFilterValue() as Option) ?? options[0]!}
        onChange={(value) =>
          /** return as "unfiltered" if all are selected */
          column.setFilterValue(value.id === "all" ? undefined : value)
        }
      />
    );
  }

  /** filter as text */
  return (
    <TextBox
      placeholder="Search"
      value={(column.getFilterValue() as string) ?? ""}
      onChange={column.setFilterValue}
      icon={<FaMagnifyingGlass />}
    />
  );
};
