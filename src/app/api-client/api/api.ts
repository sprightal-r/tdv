export * from './default.service';
import { DefaultService } from './default.service';
export * from './satellites.service';
import { SatellitesService } from './satellites.service';
export * from './telemetry.service';
import { TelemetryService } from './telemetry.service';
export const APIS = [DefaultService, SatellitesService, TelemetryService];
