export interface CodeExample {
  title: string;
  description?: string;
  code: string;
  language: string;
  highlightedLines?: number[];
  fileName?: string;
}
