export const csvToJson = async (csvPath: string): Promise<any[]> => {
    const response = await fetch(csvPath);
    const csvText = await response.text();
  
    const lines = csvText.split("\n").filter((line) => line.trim() !== ""); // Supprime les lignes vides
    const headers = lines[0].split(",").map((header) => header.trim());
  
    const json = lines.slice(1).map((line) => {
      const values = line.split(",").map((value) => value.trim());
      const entry: Record<string, string> = {};
      headers.forEach((header, index) => {
        entry[header] = values[index] || "";
      });
      return entry;
    });
  
    return json;
  };