import { inject, Injectable } from "@angular/core";
import { TelemetryService } from "@app/api-client";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { dbg } from "@utils/debug.utils";
import { catchError, exhaustMap, map, of } from "rxjs";
import { TelemetryActions } from "./telemetry.actions";
import { MessageService, MessageTypes } from "@services/message.service";

@Injectable()
export class TelemetryEffects {
    private actions$ = inject(Actions);
    private telemetryService = inject(TelemetryService);
    private messageService = inject(MessageService);

    load$ = createEffect(() => this.actions$
        .pipe(
            ofType(TelemetryActions.Load),
            exhaustMap(params => {
                if (dbg.api_calls) console.log('params for telemetry load', params);
                return this.telemetryService.listTelemetryTelemetryGet(
                    params.page,
                    params.pageSize,
                    params.sortBy,
                    params.sortDirection,
                    params.satelliteId,
                    params.status
                ).pipe(
                    map(data => ({
                        type: TelemetryActions.LoadSuccess,
                        data
                    })),
                    catchError(error => {
                        this.messageService.post(error.message, MessageTypes.Error);
                        return of({
                            type: TelemetryActions.LoadFailure,
                            error
                        });
                    })
                )
            })
        ))

    create$ = createEffect(() => this.actions$
        .pipe(
            ofType(TelemetryActions.Create),
            exhaustMap(params => {
                if (dbg.api_calls) console.log('params for telemetry create', params);;
                return this.telemetryService.createTelemetryPointTelemetryPost(
                    params.info
                ).pipe(
                    map(() => ({
                        type: TelemetryActions.CreateSuccess
                    })),
                    catchError(error => {
                        this.messageService.post(error.message, MessageTypes.Error);
                        return of({
                            type: TelemetryActions.CreateFailure,
                            error
                        })
                    })
                )
            })
        ))

    delete$ = createEffect(() => this.actions$
        .pipe(
            ofType(TelemetryActions.Delete),
            exhaustMap(params => {
                if (dbg.api_calls) console.log('params for telemetry delete', params);;
                return this.telemetryService.deleteTelemetryPointTelemetryIdDelete(
                    params.id
                ).pipe(
                    map(() => ({
                        type: TelemetryActions.DeleteSuccess
                    })),
                    catchError(error => {
                        this.messageService.post(error.message, MessageTypes.Error);
                        return of({
                            type: TelemetryActions.DeleteFailure,
                            error
                        })
                    })
                )
            })
        ))
}