
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { RequestService } from "../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { APIROUTER } from "../router.api";

import * as echarts from 'echarts';

@Component({
  selector: 'app-water-gate',
  templateUrl: './water-gate.component.html',
  styleUrls: ['./water-gate.component.css']
})
export class WaterGateComponent implements OnInit {

  isVisible: boolean = false;

  // 获取URL上的参数
  parementUrl: any = {};
  // 选中的水闸
  selectWater: any = {};

  // 输出定义
  @Output('checked') checkedBack = new EventEmitter<any>();

  constructor(
    private router: Router,
    private req: RequestService,
    private activatedRoute: ActivatedRoute,
    private message: NzMessageService,
    private sanitizer: DomSanitizer
  ) {
    // 根据url的参数，查询该项目详情
    this.activatedRoute.queryParams.subscribe(queryParam => {
      this.parementUrl['id'] = queryParam.id;
      this.parementUrl['name'] = queryParam.name;
    })
    this.getUrl(this.url);
  };

  // 测试
  testTop: any = {};

  // 接口
  routerApi: any = APIROUTER;

  imgArr: any = [{ src: 'assets/image/tupian.png' }, { src: 'assets/image/tupian.png' }, { src: 'assets/image/tupian.png' }]

  // 可选菜单
  menuList: any = {
    status: [{ name: '现状调查', status: 1 }, { name: '安全检测', status: 2 }, { name: '安全复核', status: 3 }],
    introduce: [{ name: '工程概况', status: 1 }, { name: '历史评价', status: 2 }, { name: '历史险情', status: 3 }, { name: '工程档案', status: 4 }]
  }

  // 默认菜单
  currentStatus: any = this.menuList.status[0];
  currentIntroduce: any = this.menuList.introduce[0];

  // 接收现状调查的数据
  satuSurvey: any;

  // 接收当前工程的基本数据
  totalData: any = {};

  // 接收现状逐次分析的数据
  thestatusUp: any = {};

  // 接收安全检测的搜索条件
  safetyInspection: any;

  // 接收安全检测根据条件搜索到的数据
  safeSearch: any = {};

  // 接收历史险情的数据
  dangersOfhistory: any;

  // 接收安全复核的数据
  checkSecurity: any;

  // 接收历史安全复核的数据
  checkSecuritys: any = {};

  // 选择安全检测的条件
  safeselect: any;

  // 测试数据
  imageSliders: any = [];

  // 所有的水闸
  totalWater: any;

  // 工程档案
  archives: any;

  // 视频连接
  url = 'assets/image/oceans.mp4';
  safeUrl: any;

  ngOnInit() {

  }

  // 处理视频连接
  getUrl(url: string): void {
    this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
  };

  // 父级调用--根据省市查项目
  fathFunction(data: { areasId: any; }): void {
    this.req.getData(this.routerApi.getProjectsByArea, { 'areasId': data.areasId }).subscribe(res => {
      this.totalWater = res['data'];
      // 默认选中第一个
      this.selectWater = this.totalWater[0];
      let data = { 'name': this.selectWater.name + '信息', link: null };
      this.checkedBack.emit(data);
      // 查询综合评价
      this.comprehensive(this.selectWater.id);
      // 默认回调现状调查，安全复核查询
      this.testFun(this.currentStatus);
    }, error => {
      this.message.create('error', error);
    })
  };

  // 父级调用--根据项目ID查看详情
  projectIdmation(event: any): void {
    // 项目详情赋值
    this.selectWater = event;
    // 返给父级的值
    let data = { 'name': event.name + '信息', link: null };
    this.checkedBack.emit(data);
    // 查询综合评价
    this.comprehensive(event.id);
    // 默认回调现状调查，安全复核查询
    this.testFun(this.currentStatus);
  };

  // 综合评价的查询
  comprehensive(id: any): void {
    this.req.postData(this.routerApi.getProject, { 'id': id }).subscribe(res => {
      for (let item in res['data']['imgs']) {
        let obj = { imgUrl: res['data']['imgs'][item], link: '', caption: '' }
        this.imageSliders.push(obj)
      }
      this.totalData = res['data'];
    }, error => {
      this.message.create('error', `${error}`)
    })
  };

  // 选择菜单--（1:现状，安全，复核，2:工程概况,历史评价,历史险情）
  selectFunstatus(item: any, code: any): void {
    switch (code) {
      case 1:
        this.currentStatus = item;
        if (item.status == 1) {
          this.testFun(item)
        } else if (item.status == 2) {
          this.getExamineByid();
        } else if (item.status == 3) {
          this.testFun(item);
        }
        break;
      case 2:
        this.currentIntroduce = item;
        if (this.currentIntroduce.status == 2) {
          this.getAssesss();
        } else if (this.currentIntroduce.status == 3) {
          this.querygetDangers();
        } else if (this.currentIntroduce.status == 4) {
          this.getRecords();
        }
        break;
    }
  };

  // 现状调查，安全复核查询
  testFun(item: any): void {
    this.req.postData(this.routerApi.getSurvey, { "id": this.selectWater.id, 'type': item.name }).subscribe(res => {
      switch (item.status) {
        case 1:
          this.satuSurvey = res['data'];
          break;
        case 3:
          this.checkSecurity = res['data'];
          break;
      }
      this.statusUp(item);
    }, error => {
      this.message.create('error', `${error}`)
    })
  };

  // 现状逐次分析,安全复核逐次分析
  statusUp(item: any): void {
    this.req.postData(this.routerApi.getSurveyValues, { "id": this.selectWater.id, 'type': item.name }).subscribe(res => {
      switch (item.status) {
        case 1:
          this.thestatusUp = res['data'];
          break;
        case 3:
          this.checkSecuritys = res['data'];
          break;
      }
    }, error => {
      this.message.create('error', `${error}`)
    })
  };

  // 安全检测的搜索参数查询
  getExamineByid(): void {
    this.req.getData(this.routerApi.getExamineByid, { "id": this.selectWater.id }).subscribe(res => {
      this.safetyInspection = res['data'];
      this.getExamine(res['data'][0], res['data'][0]['siteList'][0])
    }, error => {
      this.message.create('error', `${error}`)
    })
  };

  // 安全检测的查询
  getExamine(item: any, child: any): void {
    this.safeselect = child;
    this.req.getData(this.routerApi.getExamine, { "id": this.selectWater.id, 'part': item.name, 'site': child }).subscribe(res => {
      this.safeSearch = res['data']
    }, error => {
      this.message.create('error', `${error}`)
    })
  };

  // 历史评价的查询
  getAssesss(): void {
    this.req.postData(this.routerApi.getAssesss, { "proid": this.selectWater.id }).subscribe(res => {
      let xshaft = [], yshaft = [];
      for (let item in res['data']) {
        xshaft.push(res['data'][item].year);
        switch (res['data'][item].type) {
          case '一类':
            res['data'][item]['number'] = 1;
            break;
          case '二类':
            res['data'][item]['number'] = 2;
            break;
          case '三类':
            res['data'][item]['number'] = 3;
            break;
          case '四类':
            res['data'][item]['number'] = 4;
            break;
        }
        yshaft.push(res['data'][item].number);
      }
      echarts.init(document.getElementById("underConSimple")).setOption(this.historyParameters(xshaft, yshaft), true);
    }, error => {
      this.message.create('error', `${error}`)
    })
  };

  // 历史评价的统计参数配置
  historyParameters(xshaft: any, yshaft: any): object {
    let option = {
      color: ['#5CEEFA'],
      grid: {
        show: true,
        bottom: '20',
        borderColor: '#657CA8'
      },
      tooltip: {
        show: true
      },
      toolbox: {
        feature: {
          dataZoom: {
            xAxisIndex: [0]
          }
        }
      },
      dataZoom: [{
        type: 'inside',
        xAxisIndex: [0]
      }],
      xAxis: {
        type: 'category',
        axisLine: {
          lineStyle: {
            color: '#657CA8'
          }
        },
        axisPointer: {
          show: true
        },
        data: xshaft
      },
      yAxis: {
        name: '类别',
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#657CA8'
          }
        },
        axisLabel: {
          formatter: function (value: number) {
            var texts = [];
            if (value == 0) {
              texts.push('评价');
            } else if (value == 1) {
              texts.push('一类');
            } else if (value == 2) {
              texts.push('二类');
            } else if (value == 3) {
              texts.push('三类');
            } else if (value == 4) {
              texts.push('四类');
            }
            return texts;
          }
        }
      },
      series: [{
        name: '历史评价',
        data: yshaft,
        type: 'line',
        smooth: true
      }]
    };
    return option
  };

  // 安全复核的统计参数配置
  auditSecurityParameters(): object {
    let option = {
      grid: {
        show: true,
        top: "6%",
        left: "4%",
        right: "2%",
        bottom: "10%",
        borderColor: '#657CA8'
      },
      tooltip: {
        show: true
      },
      xAxis: {
        type: 'category',
        data: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        axisLine: {
          lineStyle: {
            color: '#657CA8'
          }
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#657CA8'
          }
        },
        axisLabel: {
          formatter: function (value) {
            var texts = [];
            if (value == 1) {
              texts.push('C类');
            }
            else if (value == 2) {
              texts.push('B类');
            }
            else if (value == 3) {
              texts.push('A类');
            }
            return texts;
          }
        }
      },
      series: [{
        type: 'bar',
        data: [1, 2, 3, 3, 2, 1, 2],
        itemStyle: {
          normal: {
            color: function (params) {
              switch (params.value) {
                case 1:
                  return "#E80042";
                case 2:
                  return "#F8B62D";
                case 3:
                  return "#2D70F8";
              }
            }
          }
        }
      }]
    };
    return option
  };

  // 查询历史险情
  querygetDangers(): void {
    this.req.postData(this.routerApi.getDangers, { "proid": this.selectWater.id }).subscribe(res => {
      this.dangersOfhistory = res['data'];
    }, error => {
      this.message.create('error', `${error}`)
    })
  };

  // 获取工程档案
  getRecords(): void {
    let data = { 'state': 4, 'pid': this.selectWater.id, 'page': -1 };
    this.req.postData(this.routerApi.getRecords, data).subscribe(res => {
      this.archives = res['data'];
    }, error => {
      this.message.create('error', error);
    })
  };

  // 滚动事件
  topSrcoll($event): void {
    // this.testTop = {'position': 'fixed', 'background': 'red','z-index': '99'}
    // console.log($event);
  };

}
