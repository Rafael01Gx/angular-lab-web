export interface UploadConfig {
  headerSearch?: {
    columnIndex: number;
    value: string;
  };
  elementosRowOffset?: number;
  unidadesRowOffset?: number;
  elementosStartColumn?: number;
  ignoreElementNames?: string[];
  sampleTypeValue?: string;
  sampleIdColumnOffset?: number;
  hasDateConfig?: boolean;
  hasValuesConfig?: string[] | string;
}
