export interface FleetVehicleModel {
  id: number;
  name: string;
  // Prisma Decimal (kgCO2e per km) is serialized as a string over JSON.
  co2Emissions: string;
  status: string;
}

export interface FleetVehicleModelPayload {
  name: string;
  co2Emissions: number;
  status?: string;
}

export interface FleetVehicle {
  id: number;
  employeeId: number;
  modelId: number;
  model?: FleetVehicleModel;
  startDate: string;
  endDate: string | null;
}

export interface FleetVehiclePayload {
  employeeId: number;
  modelId: number;
  startDate: string;
  endDate?: string;
}
