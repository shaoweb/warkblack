import { Component, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

import { RequestService } from "../request.service";
import { MapBoxComponent, RiverBasionComponent } from '../component';
import { WaterGateComponent } from '../water-gate/water-gate.component';

import { APIROUTER } from "../router.api"
import * as echarts from 'echarts';

@Component({
  selector: 'app-basin',
  templateUrl: './basin.component.html',
  styleUrls: ['./basin.component.css']
})
export class BasinComponent implements OnInit {

  messages: string;

  constructor(
    private req: RequestService,
    private message: NzMessageService,
    private router: Router
  ) { }

  @ViewChild(MapBoxComponent, { static: false }) mapbox: MapBoxComponent;
  @ViewChild(WaterGateComponent, { static: true }) watergate: WaterGateComponent;
  @ViewChild(RiverBasionComponent, { static: true }) riverbasion: RiverBasionComponent;

  // 接口
  routerApi: any = APIROUTER;

  // 接收水闸的数据
  lockTotal: any = {};

  // 接收全国省份
  provincesTotal: any;

  // 当前省份
  currentProvinces: any = '';

  // 标题
  title: any = '全国行政区水利工程';
  routerList: any = JSON.parse(localStorage.getItem("routerList")) == null ? [{ 'name': '全国行政区水利工程', link: '/content/basin', 'areasId': '' }] : JSON.parse(localStorage.getItem("routerList"));

  // 其他类的数据
  otherData: any = {};
  testing: boolean = false;
  information: boolean = true;

  ngOnInit() {
    // 随机数的生成
    this.randomData();

    // 水闸信息的查询
    this.getTypeCount();

    // 水闸历年(历省)的数据
    this.getCountByProvince();

    // 获取全国省份的数据
    this.req.getData(this.routerApi.getArea, { 'levelType': 1 }).subscribe(res => {
      this.provincesTotal = res['data'];
    }, error => {
      this.message.create('error', `${error}`)
    })

  }

  // 水闸历年(历省)的数据
  getCountByProvince(event?): void {
    this.req.getData(this.routerApi.getCountByProvince, event).subscribe(res => {
      let xArr = [], yArr = [{ name: '一类水闸', type: 'bar', data: [] }, { name: '二类水闸', type: 'bar', data: [] }, { name: '三类水闸', type: 'bar', data: [] }, { name: '四类水闸', type: 'bar', data: [] }];
      for (let item in res['data']['oneList']) {
        xArr.push(res['data']['oneList'][item]['pro']);
        yArr[0]['data'].push(res['data']['oneList'][item]['count']);
        yArr[1]['data'].push(res['data']['twoList'][item]['count']);
        yArr[2]['data'].push(res['data']['threeList'][item]['count']);
        yArr[3]['data'].push(res['data']['fourist'][item]['count']);
      }
      echarts.init(document.getElementById("conMiddle")).setOption(this.columnParameter(xArr, yArr), true);
    }, error => {
      this.message.create('error', `${error}`);
    })
  };

  // 水闸信息的查询--省份
  getTypeCount(id?: any): void {
    var data = {};
    if (id != undefined) {
      data['code'] = id
    }
    this.req.getData(this.routerApi.getTypeCount, data).subscribe(res => {
      let arr = [];
      for (let item in res['data']['typeListOverdue']) {
        arr.push({ name: res['data']['typeListOverdue'][item]['type'], value: res['data']['typeListOverdue'][item]['typeCount'] })
      }
      for (let item in res['data']['typePro']) {
        res['data']['typePro'][item]['proportion'] = Math.ceil((res['data']['typePro'][item]['count'] / res['data']['projectsCount']) * 100);
        switch (res['data']['typePro'][item]['type']) {
          case "一类":
            res['data']['typePro'][item]['color'] = { '0%': '#47C978', '100%': '#47C978' };
            break;
          case "二类":
            res['data']['typePro'][item]['color'] = { '0%': '#006AE8', '100%': '#006AE8' };
            break;
          case "三类":
            res['data']['typePro'][item]['color'] = { '0%': '#F8B62D', '100%': '#F8B62D' };
            break;
          case "四类":
            res['data']['typePro'][item]['color'] = { '0%': '#D92A5C', '100%': '#D92A5C' };
            break;
        }
      };

      this.lockTotal = res['data'];

      echarts.init(document.getElementById("proporTotaltions")).setOption(this.stackParameter('水闸数据', arr), true);
      // 其他的展示
      echarts.init(document.getElementById("proporTotal")).setOption(this.stackParameter('大坝', arr), true);
      echarts.init(document.getElementById("proporTotals")).setOption(this.stackParameter('堤防', arr), true);
      echarts.init(document.getElementById("proporTotalIng")).setOption(this.stackParameter('隧洞', arr), true);
      echarts.init(document.getElementById("proporTotaltion")).setOption(this.stackParameter('泵站', arr), true);
    })
  };

  // 流域等级查询
  getCountByWater(evnet): void {
    this.title = '全国各流域水利工程';
    this.req.getData(this.routerApi.getCountByWater, evnet).subscribe(res => {
      let xArr = [], yArr = [{ name: '一类水闸', type: 'bar', data: [] }, { name: '二类水闸', type: 'bar', data: [] }, { name: '三类水闸', type: 'bar', data: [] }, { name: '四类水闸', type: 'bar', data: [] }];
      for (let item in res['data']['oneList']) {
        xArr.push(res['data']['oneList'][item]['name']);
        yArr[0]['data'].push(res['data']['oneList'][item]['COUNT']);
        yArr[1]['data'].push(res['data']['twoList'][item]['COUNT']);
        yArr[2]['data'].push(res['data']['threeList'][item]['COUNT']);
        yArr[3]['data'].push(res['data']['fourist'][item]['COUNT']);
      }
      echarts.init(document.getElementById("conMiddle")).setOption(this.columnParameter(xArr, yArr), true);
    }, error => {
      console.log(error);
    })
  };

  // 圆的参数配置
  stackParameter(title: string, data: any): object {
    let option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          labelLine: {
            show: false
          },
          itemStyle: {
            color: function (params) {
              switch (params.name) {
                case '一类':
                  return '#47C978';
                case '二类':
                  return '#006AE8';
                case '三类':
                  return '#F8B62D';
                case '四类':
                  return '#D92A5C';
              }
            }
          },
          data: data
        }
      ]
    };
    return option;
  };

  // 柱状图的参数配置
  columnParameter(xArr: any, data: any): object {
    let option = {
      color: ['#47C978', '#006AE8', '#F8B62D', '#D92A5C'],
      toolbox: {
        feature: {
          magicType: {
            type: ['line', 'bar', 'stack', 'tiled']
          },
          dataZoom: {
            xAxisIndex: [0]
          }
        }
      },
      dataZoom: [{
        type: 'inside',
        start: this.testing == false ? 15 : 100,
        end: this.testing == false ? 75 : 0,
        xAxisIndex: [0]
      }],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xArr,
        axisLine: {
          lineStyle: {
            color: '#657CA8'
          }
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLine: {
          lineStyle: {
            color: '#657CA8'
          }
        }
      },
      series: data
    };
    return option
  };

  // 查询省，市，区（县）的逐年分析
  selectProvinces(selectId: any): void {
    this.req.getData(this.routerApi.getYearCountByCode, { 'id': selectId }).subscribe(res => {
      let xArr = [], yArr = [{ name: '一类水闸', type: 'bar', data: [] }, { name: '二类水闸', type: 'bar', data: [] }, { name: '三类水闸', type: 'bar', data: [] }, { name: '四类水闸', type: 'bar', data: [] }];
      for (let item in res['data']['fourist']) {
        xArr.push(res['data']['fourist'][item]['year']);
        yArr[0]['data'].push(res['data']['fourist'][item]['count']);
        yArr[1]['data'].push(res['data']['oneList'][item]['count']);
        yArr[2]['data'].push(res['data']['threeList'][item]['count']);
        yArr[3]['data'].push(res['data']['twoList'][item]['count']);
      }
      echarts.init(document.getElementById("conMiddle")).setOption(this.columnParameter(xArr, yArr), true);
    }, error => {
      this.message.create('error', `${error}`);
    })
  };

  // 这个方法由子页面调用
  checkedBack(event: any) {
    this.title = event.name;
    this.currentProvinces = event.areasId;
    this.getTypeCount(event.areasId);
    this.randomData();
    if (event.areasId != 100000) {
      this.selectProvinces(event.areasId)
    } else {
      this.getCountByProvince(event);
    }
    this.routerList.push(event);
    if (this.routerList.length > 1) {
      for (var i = 0; i < this.routerList.length; i++) {
        for (var e = i + 1; e < this.routerList.length; e++) {
          if (this.routerList[i].areasId == this.routerList[e].areasId) {
            this.routerList.splice(e, 1);
            e--;
          }
        }
      }
    }
  };

  // 这个方法由子页面调用-切换页面
  switchTitle(status: any): void {
    this.testing = status;
    this.title = status == false ? '全国行政区水利工程' : '全国流域水利工程';
    this.routerList[0]['name'] = this.title;
  };

  // 随机生成数据
  randomData(): void {
    this.otherData = {
      'damThe': [
        { name: '一类大坝', data: Math.floor(Math.random() * 100), 'color': { '0%': '#47C978', '100%': '#47C978' } },
        { name: '二类大坝', data: Math.floor(Math.random() * 100), 'color': { '0%': '#006AE8', '100%': '#006AE8' } },
        { name: '三类大坝', data: Math.floor(Math.random() * 100), 'color': { '0%': '#F8B62D', '100%': '#F8B62D' } }
      ],
      'leveeThe': [
        { name: '一类堤防', data: Math.floor(Math.random() * 100), 'color': { '0%': '#47C978', '100%': '#47C978' } },
        { name: '二类堤防', data: Math.floor(Math.random() * 100), 'color': { '0%': '#006AE8', '100%': '#006AE8' } },
        { name: '三类堤防', data: Math.floor(Math.random() * 100), 'color': { '0%': '#F8B62D', '100%': '#F8B62D' } }
      ],
      'tunnel': [
        { name: '一类隧洞', data: Math.floor(Math.random() * 100), 'color': { '0%': '#47C978', '100%': '#47C978' } },
        { name: '二类隧洞', data: Math.floor(Math.random() * 100), 'color': { '0%': '#006AE8', '100%': '#006AE8' } },
        { name: '三类隧洞', data: Math.floor(Math.random() * 100), 'color': { '0%': '#F8B62D', '100%': '#F8B62D' } }
      ],
      'stoodJoan': [
        { name: '一类泵站', data: Math.floor(Math.random() * 100), 'color': { '0%': '#47C978', '100%': '#47C978' } },
        { name: '二类泵站', data: Math.floor(Math.random() * 100), 'color': { '0%': '#006AE8', '100%': '#006AE8' } },
        { name: '三类泵站', data: Math.floor(Math.random() * 100), 'color': { '0%': '#F8B62D', '100%': '#F8B62D' } }
      ]
    };
  };

  // 菜单栏点击事件
  menuClick(index: number): void {
    this.information = true;
    for (let item in this.routerList) {
      if (this.routerList[index].areasId == this.routerList[item]['areasId']) {
        this.routerList.splice(Number(item) + 1, this.routerList.length - 1);
        break;
      }
    };
    if (this.routerList[index]['areasId']) {
      this.mapbox.cityId(this.routerList[index]);
    } else {
      this.getCountByProvince();
      this.mapbox.returnEchart(this.routerList[index]);
    };
  };

  // 显示详情
  informationShow(event: any): void {
    this.information = false;
    this.watergate.fathFunction(event);
    // 本地存储
    localStorage.setItem('routerList',JSON.stringify(this.routerList));
  };

  // 跳转水闸工程
  routerUrl(): void{
    // 本地存储
    localStorage.setItem('routerList',JSON.stringify(this.routerList));
    this.router.navigate(['/content/lockTotal']);
  };


}
