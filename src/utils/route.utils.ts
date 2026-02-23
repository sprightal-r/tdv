import { ActivatedRoute, NavigationExtras } from "@angular/router";

// Get NavigationExtras object for querying
export function queryNEs(route: ActivatedRoute, queryParams: any): NavigationExtras {
    return {
        relativeTo: route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true
    }
}