import { createReducer, on } from "@ngrx/store";
import { createFailure, createSuccess, deleteFailure, deleteSuccess, loadFailure, loadSuccess, TelemetryActions } from "./telemetry.actions";
import { TelemetryPoint } from "@models/telemetry-point.model";
import { dbg } from "@utils/debug.utils";
import { EMPTY_PAGED, Paged } from "@models/dtos/paged";

export interface TelemetryState {
    type?: TelemetryActions,
    data?: Paged<TelemetryPoint>
}

const initialState: TelemetryState = {}

export const telemetryReducer = createReducer(
    initialState,

    on(loadSuccess, (state, { data }) => {
        if (dbg.payloads) console.log('returned data from telemetry load', data);
        return ({
            type: TelemetryActions.LoadSuccess,
            data
        });
    }),

    on(loadFailure, (state, { error }) => {
        if (dbg.payloads) console.log('error from telemetry load', error);
        return ({
            type: TelemetryActions.LoadFailure,
            data: EMPTY_PAGED
        });
    }),

    on(deleteSuccess, state => {
        return ({
            type: TelemetryActions.DeleteSuccess,
            data: state.data
        });
    }),

    on(deleteFailure, state => {
        return ({
            type: TelemetryActions.DeleteFailure,
            data: state.data
        });
    }),

    on(createSuccess, state => {
        return ({
            type: TelemetryActions.CreateSuccess,
            data: state.data
        });
    }),

    on(createFailure, state => {
        return ({
            type: TelemetryActions.CreateFailure,
            data: state.data
        });
    })
);