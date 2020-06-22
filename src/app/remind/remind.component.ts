import { Component, OnInit, ViewChild } from '@angular/core';

import { RequestService } from "../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { WaterGateComponent } from '../water-gate/water-gate.component';

import { APIROUTER } from "../router.api"

@Component({
  selector: 'app-remind',
  templateUrl: './remind.component.html',
  styleUrls: ['./remind.component.css']
})
export class RemindComponent implements OnInit {

  constructor(
    private req: RequestService,
    private message: NzMessageService
  ) { }

  @ViewChild(WaterGateComponent, { static: true }) watergate: WaterGateComponent;

  // 接口
  routerApi: any = APIROUTER;

  // 类型
  paramenter: any = { 'type': '' };

  // 详情展示
  information:boolean = true;

  // 详情数据
  projectInformation: any = {};

  // 到期未检的总数据
  locklistAll: any = {};
  // res['data'][item]['pros'][any]['expect'] = 
  ngOnInit() {
    // 病患工程
    this.req.getData(this.routerApi.getProjectCall).subscribe(res => {
      for (let item in res['data']['list1']) {
        let time;
        if (res['data']['list1'][item]['year'].length == 4) {
          time = Number(res['data']['list1'][item]['year']) + res['data']['list1'][item]['time'];
        } else {
          let arr = res['data']['list1'][item]['year'].split('-');
          time = Number(arr[0]) + res['data']['list1'][item]['time'] + '-' + arr[1];
        };
        res['data']['list1'][item]['expect'] = time;
      }
      this.locklistAll = res['data'];
    }, error => {
      this.message.create('error', error);
    })
  }

  // 查询某个项目的详情
  getProjectInformation(projectId: any): void {
    this.req.postData(this.routerApi.getProjectInformation, { 'id': projectId }).subscribe(res => {
      this.information = false;
      this.projectInformation = res['data'];
      this.watergate.fathFunction(res['data']);
    }, error => {
      this.message.create('error', error);
    })
  };



}
