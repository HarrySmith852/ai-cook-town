#!/usr/bin/env node
/**
 * Generates a WBS (Work Breakdown Structure) .xlsx file from a JSON description.
 *
 * Usage:
 *   node generate-wbs.js <input.json> <output.xlsx>
 *
 * Input JSON shape:
 * {
 *   "project": "My Project",
 *   "columns": ["Dependencies", "Frontend Status", "Backend Status", "ETA"],   // optional override
 *   "modules": [
 *     {
 *       "name": "User Flow",
 *       "subModules": [
 *         {
 *           "name": "Authentication",
 *           "tasks": [
 *             { "name": "Signup", "dependencies": "", "frontendStatus": "Not Started", "backendStatus": "Not Started", "eta": "2026-09-01" }
 *           ]
 *         }
 *       ],
 *       // a module can also have tasks directly, without sub-modules
 *       "tasks": []
 *     }
 *   ]
 * }
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx-js-style");

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node generate-wbs.js <input.json> <output.xlsx>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const columns = data.columns || ["Dependencies", "Frontend Status", "Backend Status", "ETA"];

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "2F5496" } },
  alignment: { vertical: "center" },
};
const MODULE_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "4472C4" } },
};
const SUBMODULE_STYLE = {
  font: { bold: true },
  fill: { fgColor: { rgb: "D9E2F3" } },
};
const TASK_NAME_STYLE = { alignment: { indent: 2 } };

const STATUS_COLORS = {
  "Not Started": "F4B084",
  Pending: "F4B084",
  "In Progress": "FFE699",
  Complete: "C6E0B4",
  Done: "C6E0B4",
  Blocked: "F8696B",
};

function statusStyle(value) {
  const rgb = STATUS_COLORS[value];
  return rgb ? { fill: { fgColor: { rgb } } } : {};
}

function styledCell(value, style) {
  return { v: value == null ? "" : value, t: "s", s: style };
}

const rows = [];
const rowStyles = [];

rows.push(["Task Description", ...columns]);
rowStyles.push(columns.map(() => HEADER_STYLE));
rowStyles[0].unshift(HEADER_STYLE);

function pushTaskRow(task) {
  const row = [task.name];
  const styles = [TASK_NAME_STYLE];
  for (const col of columns) {
    const key = col
      .toLowerCase()
      .replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^\w/, (c) => c.toLowerCase());
    const value = task[key] ?? "";
    row.push(value);
    styles.push(/status/i.test(col) ? statusStyle(value) : {});
  }
  rows.push(row);
  rowStyles.push(styles);
}

for (const mod of data.modules || []) {
  rows.push([mod.name, ...columns.map(() => "")]);
  rowStyles.push([MODULE_STYLE, ...columns.map(() => MODULE_STYLE)]);

  for (const task of mod.tasks || []) {
    pushTaskRow(task);
  }

  for (const sub of mod.subModules || []) {
    rows.push([sub.name, ...columns.map(() => "")]);
    rowStyles.push([SUBMODULE_STYLE, ...columns.map(() => SUBMODULE_STYLE)]);
    for (const task of sub.tasks || []) {
      pushTaskRow(task);
    }
  }
}

const ws = XLSX.utils.aoa_to_sheet(rows);

for (let r = 0; r < rows.length; r++) {
  for (let c = 0; c < rows[r].length; c++) {
    const ref = XLSX.utils.encode_cell({ r, c });
    if (!ws[ref]) continue;
    const style = rowStyles[r][c];
    if (style && Object.keys(style).length) {
      ws[ref].s = style;
    }
  }
}

ws["!cols"] = [{ wch: 48 }, ...columns.map(() => ({ wch: 20 }))];
ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length } }) };

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "WBS");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
XLSX.writeFile(wb, outputPath);

console.log(`WBS written to ${outputPath}`);
