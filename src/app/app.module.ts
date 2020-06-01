import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WaterGateComponent } from './water-gate/water-gate.component';
import { RequestService } from "./request.service";
import { MenuService } from "./meun.service";

import { ImageSliderComponent, ProgressComponent, MapBoxComponent, CategoryComponent, RiverBasionComponent, VideoComponent, FigureComponent, TimelineComponent, ChinaThreedComponent } from './component';
import { BasinComponent } from './basin/basin.component';
import { HomeComponent } from './home/home.component';
import { ContentComponent } from './content/content.component';
import { LockTotalComponent } from './lock-total/lock-total.component';
import { RegulatoryComponent } from './regulatory/regulatory.component';
import { MiningDataComponent } from './mining-data/mining-data.component';
import { ReportAnalysisComponent } from './report-analysis/report-analysis.component';
import { RemindComponent } from './remind/remind.component';
import { NewsComponent } from './news/news.component';

/** 配置 angular i18n **/
import zh from '@angular/common/locales/zh';
registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    WaterGateComponent,
    ImageSliderComponent,
    BasinComponent,
    ProgressComponent,
    MapBoxComponent,
    HomeComponent,
    ContentComponent,
    LockTotalComponent,
    CategoryComponent,
    RiverBasionComponent,
    RegulatoryComponent,
    VideoComponent,
    TimelineComponent,
    FigureComponent,
    MiningDataComponent,
    ChinaThreedComponent,
    ReportAnalysisComponent,
    RemindComponent,
    NewsComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxEchartsModule,
    NgZorroAntdModule,
    BrowserAnimationsModule
  ],
  providers: [
    RequestService,
    MenuService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    { provide: NZ_I18N, useValue: zh_CN }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
