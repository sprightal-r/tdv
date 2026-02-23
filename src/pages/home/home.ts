import { AfterViewInit, ChangeDetectorRef, Component, effect, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { _delete, create, load, TelemetryActions } from '@app/stores/telemetry/telemetry.actions';
import { TelemetryState } from '@app/stores/telemetry/telemetry.reducer';
import { Store } from '@ngrx/store';
import { dbg } from '@utils/debug.utils';
import { Subscription, take } from 'rxjs';
import { TelemetryPoint, TelemetryPointId } from '@models/telemetry-point.model';
import { queryNEs } from '@utils/route.utils';
import { EMPTY_PAGED, Paged } from '@models/dtos/paged';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Satellite, SatelliteId } from '@models/satellite.model';
import { SatelliteStatuses } from '@models/enums/satellite-statuses';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { SatellitesService } from '@app/api-client';
import { MessageService } from '@services/message.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators, FormGroupMessagesConfig, FormMessageHandler } from '@utils/form.utils';
import { MatButtonModule } from '@angular/material/button';

const telemetryFormMessagesConfig: FormGroupMessagesConfig = {
  satelliteId: {
    required: 'Satellite is required'
  },
  timestamp: {
    required: 'Timestamp is required'
  },
  altitude: {
    required: 'Altitude is required',
    greaterThan: 'Altitude must be greater than 0'
  },
  velocity: {
    required: 'Velocity is required',
    greaterThan: 'Velocity must be greater than 0'
  },
  status: {
    required: 'Health status is required'
  }
}

class TelemetryTableViewHandler {
  // View model
  // undefined means the row is loading
  vm: Paged<TelemetryPoint | undefined> = EMPTY_PAGED;

  // Default loading VM
  static loadingVM = {
    items: Array(7).map(_ => undefined),
    length: 0
  };

  private _loading = false;
  get loading(): boolean { return this._loading; }

  startLoading(id?: TelemetryPointId): void {
    if (id !== undefined) {
      // Show single row as loading based on ID
      this.vm.items = this.vm.items.map(x =>
        x?.id !== id ? x : undefined
      );
    }
    else {
      this._loading = true;
      this.vm = TelemetryTableViewHandler.loadingVM;
    }
  }

  receiveData(data?: Paged<TelemetryPoint>) {
    this._loading = data !== undefined;
    this.vm = data !== undefined ? {
      items: [...data.items], // Copy list for editability as a view model
      length: data.length
    } : TelemetryTableViewHandler.loadingVM;
  }
}

interface PageConfig {
  page: number,
  pageSize: number
}

interface SortConfig {
  column: 'timestamp' | 'altitude' | 'velocity',
  direction: 'ascending' | 'descending'
}

interface FilterConfig {
  satelliteId?: SatelliteId,
  status?: SatelliteStatuses
}

const DEFAULT_PAGECONFIG: PageConfig = {
  page: 0,
  pageSize: 10
};

const DEFAULT_SORTCONFIG: SortConfig = {
  column: 'timestamp',
  direction: 'descending'
};

@Component({
  selector: 'tdv-home',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  standalone: true
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  // Routing
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private queryParamMapSubscription!: Subscription;

  // Telemetry
  private readonly telemetryStore: Store<{ telemetry: TelemetryState }> = inject(Store);
  telemetry: Signal<TelemetryState> = this.telemetryStore.selectSignal(state => state.telemetry);

  // Satellites
  private readonly satellitesService = inject(SatellitesService);
  satellites?: Satellite[];

  // Messages
  private readonly messageService = inject(MessageService);
  private readonly snackBar = inject(MatSnackBar);
  private messageSubscription!: Subscription;

  // Table
  tableVH = new TelemetryTableViewHandler();
  columnsToDisplay = [
    'satelliteId',
    'timestamp',
    'altitude',
    'velocity',
    'status',
    'delete'
  ];
  editLock = false;
  
  // Paging
  private _pageConfig: PageConfig = DEFAULT_PAGECONFIG;
  get pageConfig(): PageConfig { return this._pageConfig; }
  set pageConfig(value: PageConfig) {
    this._pageConfig = value;
    this.router.navigate([], queryNEs(this.route, this._pageConfig));
  }

  // Sorting
  private _sortConfig: SortConfig = DEFAULT_SORTCONFIG;
  get sortConfig(): SortConfig { return this._sortConfig; }
  set sortConfig(value: SortConfig) {
    this._sortConfig = value;
    this.router.navigate([], queryNEs(this.route, {
      sortBy: this._sortConfig.column,
      sortDirection: this._sortConfig.direction
    }));
  }

  // Filtering
  private _filterConfig: FilterConfig = {};
  get filterConfig(): FilterConfig { return this._filterConfig; }
  set filterConfig(value: FilterConfig) {
    this._filterConfig = value;
    this.router.navigate([], queryNEs(this.route, this._filterConfig));
  }
  statuses = Object.values(SatelliteStatuses);

  // Form
  telemetryForm = new FormGroup({
    satelliteId: new FormControl(undefined, Validators.required),
    timestamp: new FormControl(new Date(Date.now()).toISOString().slice(0, 19), Validators.required),
    altitude: new FormControl(undefined, [Validators.required, CustomValidators.greaterThan(0)]),
    velocity: new FormControl(undefined, [Validators.required, CustomValidators.greaterThan(0)]),
    status: new FormControl(SatelliteStatuses.Healthy, Validators.required)
  });
  telemetryFormMH = new FormMessageHandler(this.telemetryForm, telemetryFormMessagesConfig);
  showTelemetryForm = false;
  showTelemetryFormMessages = false;

  // Change detection
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    // effect fires whenever the telemetry state changes
    effect(() => {
      // After create or delete success/failure, unlock edits and reload data
      switch (this.telemetry().type) {
        case TelemetryActions.CreateSuccess:
        case TelemetryActions.CreateFailure:
        case TelemetryActions.DeleteSuccess:
        case TelemetryActions.DeleteFailure:
          this.editLock = false;
          this.load(this.route.snapshot.queryParams);
      }

      // Receive data and sync VM updates
      this.tableVH.receiveData(this.telemetry().data);
      this.cdr.detectChanges();
    })
  }

  ngOnInit(): void {
    // queryParamMap from route determines parameters for API call
    // Whenever a new queryParamMap comes in, make an API call
    this.queryParamMapSubscription = this.route.queryParams.subscribe((queryParams: any) => {
      if (dbg.routing) console.log('queryParams', queryParams);
      
      // Update page config without triggering routing
      this._pageConfig = {
        page: queryParams.page ?? DEFAULT_PAGECONFIG.page,
        pageSize: queryParams.pageSize ?? DEFAULT_PAGECONFIG.pageSize
      };

      // Update sort config without triggering routing
      this._sortConfig = {
        column: queryParams.sortBy ?? DEFAULT_SORTCONFIG.column,
        direction: queryParams.sortDirection ?? DEFAULT_SORTCONFIG.direction
      }

      // If parameters are missing from paging and sorting, set those to default and update URL
      // Otherwise, the route is the source of truth
      if ([
        queryParams.page,
        queryParams.pageSize,
        queryParams.sortBy,
        queryParams.sortDirection
      ].includes(undefined)) {
        this.router.navigate([], queryNEs(this.route, {
          page: this._pageConfig.page,
          pageSize: this._pageConfig.pageSize,
          sortBy: this._sortConfig.column,
          sortDirection: this._sortConfig.direction
        }));
        // Return after routing to avoid loading data twice
        return;
      }

      // By this point, the page config should be complete and loaded into the URL
      if (dbg.routing) console.log('page config', this._pageConfig);

      this._filterConfig = {
        // If satellites aren't populated at this point, leave this undefined
        // The satelliteId parameter will still go into the API call since it's based on queryParams
        // This will be updated once the satellites are populated
        satelliteId: (this.satellites?.some(x => x.id === queryParams.satelliteId) ?? false)
          ? queryParams.satelliteId : undefined,
        status: this.statuses.includes(queryParams.status)
          ? queryParams.status : undefined
      };

      this.load(queryParams);
    });
  }

  ngAfterViewInit(): void {
    this.satellitesService.listSatellitesSatellitesGet()
      .pipe(take(1))
      .subscribe(x => {
        // Populate list of satellites
        this.satellites = x;
        // Select option if in route without triggering routing
        this._filterConfig.satelliteId = this.route.snapshot.queryParamMap.get('satelliteId') ?? undefined;

        this.cdr.detectChanges();
      });

    this.messageSubscription = this.messageService.messages$.subscribe(x => {
        // Display toast message when received
        this.snackBar.open(x.text, undefined, {
          duration: 6000
        });
    });
  }

  ngOnDestroy(): void {
    this.queryParamMapSubscription?.unsubscribe();
    this.messageSubscription?.unsubscribe();
    this.telemetryFormMH.destroy();
  }

  // Helper functions

  private load(queryParams: any): void {
      // Start loading animation
      this.tableVH.startLoading();
      this.cdr.detectChanges();
      
      // Send request to API to fetch data
      this.telemetryStore.dispatch(load(queryParams));
  }

  // UI interactions

  // Page updates from paginator
  onPage(event: PageEvent): void {
    this.pageConfig = {
      page: event.pageIndex,
      pageSize: event.pageSize
    };
  }

  onSort(config: SortConfig): void {
    // Capture current config for reverse sorting case
    const current = { ...this.sortConfig };

    this.sortConfig = {
      column: config.column,
      direction: current.column === config.column
        // If column is the same as current, reverse direction
        ? (current.direction === 'ascending'
          ? 'descending'
          : 'ascending'
        )
        // Otherwise, take config direction
        : config.direction
    }
  }

  onFilterBySatelliteId(event: MatSelectChange): void {
    this.filterConfig = {
      satelliteId: event.value,
      status: this._filterConfig.status
    };
  }

  onFilterByStatus(event: MatSelectChange): void {
    this.filterConfig = {
      satelliteId: this._filterConfig.satelliteId,
      status: event.value
    };
  }
  
  onCreateTelemetryPoint(): void {
    if (!this.telemetryForm.valid)
      return;

    // Flip edit lock if unlocked, otherwise return
    if (this.editLock)
      return;
    else
      this.editLock = true;

    this.telemetryStore.dispatch(create({ info: this.telemetryForm.value as any }));
  }

  onDeleteTelemetryPoint(id?: TelemetryPointId): void {
    // There is a possibility delete is clicked for a row that isn't loaded
    // In that case, simply return
    if (id === undefined)
      return;

    // Flip edit lock if unlocked, otherwise return
    if (this.editLock)
      return;
    else
      this.editLock = true;

    this.tableVH.startLoading(id);
    this.telemetryStore.dispatch(_delete({ id }));
  }
}
