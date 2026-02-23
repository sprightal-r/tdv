import { SatelliteStatuses } from "./enums/satellite-statuses";
import { SatelliteId } from "./satellite.model";

export type TelemetryPointId = string;

export interface TelemetryPoint {
    id: TelemetryPointId,
    satelliteId: SatelliteId,
    timestamp: Date,
    altitude: number,
    velocity: number,
    status: SatelliteStatuses
}