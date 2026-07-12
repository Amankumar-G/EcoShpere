export interface Gas {
  id: number;
  name: string;
  symbol: string;
  gwp: number;
  gwpMetric: string;
}

export interface GasPayload {
  name: string;
  symbol: string;
  gwp: number;
}
