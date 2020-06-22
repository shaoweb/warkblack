import { Component, OnInit, ViewChild } from '@angular/core';

import { NewsInformationComponent, NewsContentComponent } from '../component';
@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  constructor() { }
  
  @ViewChild(NewsContentComponent, { static: true }) newsContent: NewsContentComponent;
  @ViewChild(NewsInformationComponent, { static: false }) newsInformation: NewsInformationComponent;

  ngOnInit() {
  }

}
