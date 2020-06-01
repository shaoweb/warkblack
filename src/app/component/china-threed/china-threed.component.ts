import { environment } from './../../../environments/environment.prod';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

import { RequestService } from "../../request.service";
import { APIROUTER } from "../../router.api"
import * as echarts from 'echarts';
import 'echarts-gl';
@Component({
  selector: 'app-china-threed',
  templateUrl: './china-threed.component.html',
  styleUrls: ['./china-threed.component.css']
})
export class ChinaThreedComponent implements OnInit {

  constructor(private req: RequestService, private message: NzMessageService, private router: Router) { };

  // 接口
  routerApi: any = APIROUTER;

  // 地图参数
  option: any = {};
  showloading: boolean = true;
  geoCoordMap: any = {};
  scatterTotal: any;

  // 请求数据
  person: any;

  ngOnInit() {

    this.req.getData('assets/map/china.json').subscribe(res => {
      res['features'].forEach(element => {
        let name = element.properties.name;
        this.geoCoordMap[name] = element.properties.cp;
      });
      echarts.registerMap('china', res);
      this.showloading = false;
    });

    this.distribution();
  };

  // 获取水闸地图分布的数据 
  distribution(areasId?: any): void {
    this.req.getData(this.routerApi.getCount).subscribe(res => {
      this.scatterTotal = this.scatter(res['data']);
      console.log(this.scatterTotal);
      this.option = this.optionParament(this.scatterTotal);
    }, error => {
      this.message.create('error', `${error}`);
    })
  };

  // 地图参数配置
  optionParament(data, scatterTotal?: any): object {
    var option = {
      title: {
        text: '全国行政区划3D地图',
        x: 'center',
        top: "20",
        textStyle: {
          color: '#000',
          fontSize: 24
        }
      },
      tooltip: {
        show: true,
      },
      geo3D:{
        show: true,
        map: 'china',
        boxHeight: 10,

      },
      series: [
        {
          type: 'map3D',
          map: 'china',
          roam: true,
          itemStyle: {
            color: '#051640',
            opacity: 1,
            borderWidth: 0.8,
            borderColor: '#ffb43a'
          },
          label: {
            show: false,
          },
          emphasis: { //当鼠标放上去  地区区域是否显示名称
            label: {
              show: true,
              formatter: function (params) {
                console.log(params);
                return '鼠标移入'
              },
              textStyle: {
                color: '#fff',
                fontSize: 14,
                backgroundColor: '#03a9ff'
              }
            }
          },
          data: this.convertData(data)
        },
        {
          name: '点',
          type: 'scatter3D',
          symbol: 'pin',
          symbolSize: 10,
          coordinateSystem: 'geo3D',
          geo3DIndex: 0,
          zlevel: 10,
          label: {
            normal: {
              show: false,
              formatter: '{b}',
              position: 'right'
            },
            emphasis: {
              show: true
            }
          },
          itemStyle: {
            normal: {
              color: '#41EFF9'
            }
          },
          data: scatterTotal,
        }
      ]
    };

    return option;
  }

  // 地图点击事件--echarts
  selectCity(event: any): void {
    console.log(event);
  };

  // 坐标点数据处理
  convertData(data): object {
    var res = [];
    for (let item in data) {
      var geoCoord = this.geoCoordMap[data[item]['name']];
      if (geoCoord) {
        res.push({
          name: data[item]['name'],
          value: geoCoord.concat(Math.ceil(data[item]['value'])),
          data: data[item]
        });
      }
    };
    return res;
  };

  // 散点坐标
  scatter(data): object {
    var res = [];
    for (let item in data) {
      var gream = this.geoCoordMap[data[item]['pro']];
      if (gream) {
        res.push({
          name: data[item]['pro'],
          value: gream.concat(Math.random() * 10),
          data: data[item]['data']
        })
      }
    }
    console.log(res);
    return res;
  }

}
