import { Routes } from '@angular/router';
import { ROUTEMAP } from '@constants/route.constants';

export const routes: Routes = [...ROUTEMAP.entries()]
    .map(([path, info]) => ({ path, component: info.component}))
