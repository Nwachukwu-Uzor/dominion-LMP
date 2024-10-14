import * as XLSX from "xlsx";

export interface Config {
  [key: string]: string;
}

export interface ExtractedData {
  [key: string]: string | number;
}

const camelCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase(),
    )
    .replace(/\s+/g, "");
};

export const extractDataFromFile = (
  file: File,
  VALIDCOLUMNS: string[],
  config: Config,
  defaultValue: string | null = null,
): Promise<ExtractedData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      if (!jsonData.length) {
        return reject("No data found in the file");
      }

      const headers = jsonData[0] as string[];

      const headerMap: { [key: string]: string } = {};
      VALIDCOLUMNS.forEach((validColumn) => {
        const header = headers.find(
          (h) => h.toLowerCase() === validColumn.toLowerCase(),
        );
        if (header) {
          headerMap[header] = config[validColumn] || camelCase(validColumn);
        } else {
          return reject(`Missing required header: ${validColumn}`);
        }
      });

      const result = jsonData.slice(1).map((row) => {
        const rowObject: ExtractedData = {};
        headers.forEach((header, index) => {
          if (headerMap[header]) {
            rowObject[headerMap[header]] = row[index] ?? defaultValue;
          }
        });
        return rowObject;
      });

      resolve(result);
    };

    reader.onerror = (error) => {
      reject("Error reading file: " + error);
    };

    reader.readAsArrayBuffer(file);
  });
};
