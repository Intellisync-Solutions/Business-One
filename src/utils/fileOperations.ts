// Type for validating the structure of imported data
export interface ImportableData {
  version: string;
  timestamp: string;
  type: string;
  data: unknown;
}

// Function to validate imported data structure
const validateImportedData = (data: any): data is ImportableData => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.version === 'string' &&
    typeof data.timestamp === 'string' &&
    typeof data.type === 'string' &&
    'data' in data
  );
};

export const saveToFile = <T>(data: T, type: string, filename: string): void => {
  const exportData: ImportableData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    type,
    data
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const loadFromFile = async <T>(
  file: File,
  expectedType: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        if (!validateImportedData(jsonData)) {
          throw new Error('Invalid file format');
        }
        
        if (jsonData.type !== expectedType) {
          throw new Error(`Invalid file type. Expected ${expectedType}, got ${jsonData.type}`);
        }
        
        resolve(jsonData.data as T);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Error parsing file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
