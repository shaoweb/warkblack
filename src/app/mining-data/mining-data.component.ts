import { Component, OnInit, ViewChild } from '@angular/core';
import { FigureComponent, TimelineComponent } from '../component';

@Component({
  selector: 'app-mining-data',
  templateUrl: './mining-data.component.html',
  styleUrls: ['./mining-data.component.css']
})
export class MiningDataComponent implements OnInit {

  constructor() { }
  
  @ViewChild(FigureComponent, { static: false }) figure: FigureComponent;
  @ViewChild(TimelineComponent, { static: true }) timeline: TimelineComponent;

  // 状态展示
  status: boolean = false;

  routerList: any = [
    {name:'大数据挖掘', status: false}
  ]

  ngOnInit() {
  }

  // 选中菜单栏
  menuClick(item: any): void{
    this.routerList.splice(this.routerList.length - 1, 1);
    this.status = this.routerList[this.routerList.length - 1]['status'];
  };

  // 子页面回调
  childrenView(data: any): void{
    this.status = data.status;
    this.routerList.push(data);
    this.figure.optionSumbit();
  };

}
