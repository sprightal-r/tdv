import { Type } from "@angular/core"
import { Home } from "@pages/home/home";

export enum Paths {
    Home = ''
}

export interface RouteInfo {
    component: Type<any>;
}

export const ROUTEMAP = new Map<Paths, RouteInfo>([
    [Paths.Home, { component: Home }]
]);