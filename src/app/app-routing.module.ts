import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaterGateComponent } from './water-gate/water-gate.component';
import { BasinComponent } from './basin/basin.component';
import { HomeComponent } from './home/home.component';
import { ContentComponent } from './content/content.component';
import { LockTotalComponent } from './lock-total/lock-total.component';
import { ProgressComponent, RiverBasionComponent } from './component';
import { RegulatoryComponent } from './regulatory/regulatory.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home',component: HomeComponent},
  { path: 'progress',component: ProgressComponent},
  { path: 'riverbasion',component: RiverBasionComponent},
  { path: 'regulatory',component: RegulatoryComponent},
  { path: 'content', component: ContentComponent, children: [
    { path: '', redirectTo: '/content/basin', pathMatch: 'full'},
    { path: 'waterGate',component: WaterGateComponent},
    { path: 'basin',component: BasinComponent},
    { path: 'lockTotal',component: LockTotalComponent},
  ]}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
