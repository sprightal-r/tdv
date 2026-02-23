import { HttpErrorResponse } from "@angular/common/http";
import { TelemetryPointInfo } from "@app/api-client";
import { Paged } from "@models/dtos/paged";
import { SatelliteStatuses } from "@models/enums/satellite-statuses";
import { SatelliteId } from "@models/satellite.model";
import { TelemetryPoint, TelemetryPointId } from "@models/telemetry-point.model";
import { createAction, props } from "@ngrx/store";

export enum TelemetryActions {
    Load = '[Telemetry] Load',
    LoadSuccess = '[Telemetry] Load Success',
    LoadFailure = '[Telemetry] Load Failure',

    Create = '[Telemetry] Create',
    CreateSuccess = '[Telemetry] Create Success',
    CreateFailure = '[Telemetry] Create Failure',

    Delete = '[Telemetry] Delete',
    DeleteSuccess = '[Telemetry] Delete Success',
    DeleteFailure = '[Telemetry] Delete Failure'
}

export const load = createAction(
    TelemetryActions.Load,
    props<{
        page?: number,
        pageSize?: number,
        satelliteId?: SatelliteId,
        status?: SatelliteStatuses
    }>()
);

export const loadSuccess = createAction(
    TelemetryActions.LoadSuccess,
    props<{
        data: Paged<TelemetryPoint>
    }>()
);

export const loadFailure = createAction(
    TelemetryActions.LoadFailure,
    props<{
        error: HttpErrorResponse
    }>()
);

export const create = createAction(
    TelemetryActions.Create,
    props<{
        info: TelemetryPointInfo
    }>()
);

export const createSuccess = createAction(
    TelemetryActions.CreateSuccess
);

export const createFailure = createAction(
    TelemetryActions.CreateFailure,
    props<{
        error: HttpErrorResponse
    }>()
);

export const _delete = createAction(
    TelemetryActions.Delete,
    props<{
        id: TelemetryPointId
    }>()
);

export const deleteSuccess = createAction(
    TelemetryActions.DeleteSuccess
);

export const deleteFailure = createAction(
    TelemetryActions.DeleteFailure,
    props<{
        error: HttpErrorResponse
    }>()
);