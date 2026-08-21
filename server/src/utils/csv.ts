/** Escape a single CSV cell (RFC 4180-ish). */
export const csvEscape = (value: string | number | null | undefined) => {
  const raw = value == null ? "" : String(value);
  if (/[",\r\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

export const toCsv = (headers: string[], rows: (string | number | null | undefined)[][]) => {
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ];
  return `${lines.join("\r\n")}\r\n`;
};
