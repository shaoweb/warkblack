import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaterGateComponent } from './water-gate/water-gate.component';
import { BasinComponent } from './basin/basin.component';
import { HomeComponent } from './home/home.component';
import { ContentComponent } from './content/content.component';
import { LockTotalComponent } from './lock-total/lock-total.component';
import { RegulatoryComponent } from './regulatory/regulatory.component';
import { MiningDataComponent } from './mining-data/mining-data.component';
import { ReportAnalysisComponent } from './report-analysis/report-analysis.component';
import { RemindComponent } from './remind/remind.component';
import { NewsComponent } from './news/news.component';
import { ProgressComponent, RiverBasionComponent, FigureComponent, TimelineComponent, ChinaThreedComponent } from './component';

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
  ]},
  { path: 'miningData',component: MiningDataComponent, children: [
    { path: 'figure',component: FigureComponent},
    { path: 'timeline',component: TimelineComponent}
  ]},
  { path: 'chinathreed',component: ChinaThreedComponent},
  { path: 'reportAnalysis',component: ReportAnalysisComponent},
  { path: 'remind',component: RemindComponent},
  { path: 'news',component: NewsComponent}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
