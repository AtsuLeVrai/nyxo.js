export interface SymbolInfo {
  documentation: string;
  enumMembers?: string[];
  fileName: string;
  isExported: boolean;
  kind: string;
  methods?: { name: string; returnType: string }[];
  name: string;
  parameters?: { name: string; type: string }[];
  properties?: { name: string; type: string }[];
  type?: string;
}
