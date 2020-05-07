import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RequestService } from "../../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

import { APIROUTER } from "../../router.api"
import * as echarts from 'echarts';
declare let AMap: any;
declare let AMapUI: any;

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

  constructor(private req: RequestService, private message: NzMessageService, private router: Router) { }

  // 定义输出：
  @Output('checked') checkedBack = new EventEmitter<any>();

  // 接口
  routerApi: any = APIROUTER;

  // 工程等别
  levnl: any = '';

  // 工程规模
  sizeOfthe: any = '';

  // 当前查看的省市区的id和名字
  currentCity: any = [{ 'name': '全国', 'cityCode': '' }];

  // 地图到数据
  myChart; map; district; polygons: any = [];
  mapData: any = [];
  cityCode: any = 100000;
  cityName: any = '中国';
  areaCode: any = 10000;
  geoJsonData: any;
  provinceSelect = document.getElementById('province');
  citySelect = document.getElementById('city');
  districtSelect = document.getElementById('district');
  areaSelect = document.getElementById('street');
  areaData = {};
  deepTree = [{
    mapData: this.mapData,
    code: 100000
  }];

  geoCoordMap: { [key: string]: string } = {};

  // 流域数据数据
  person: any;
  riverBasion: any;

  ngOnInit() {

    // 默认回调
    this.distribution(this.levnl, this.sizeOfthe);

    // 地图初始化
    this.start();
  }

  // 选择工程规模，工程等别调用
  changeSelect(): void {
    this.distribution(this.levnl, this.sizeOfthe);
    this.start();
  }

  // 初始化
  start(): void {
    // 地图初始化
    var that = this;
    this.map = new AMap.Map('container', {
      resizeEnable: true,
      center: [116.30946, 39.937629],
      zoom: 3
    });
    //行政区划查询
    var opts = {
      subdistrict: 1, //返回下一级行政区
      showbiz: false //最后一级返回街道信息
    };

    this.district = new AMap.DistrictSearch(opts); //注意：需要使用插件同步下发功能才能这样直接使用

    this.district.search('中国', function (status, result) {
      if (status == 'complete') {
        that.getData(result.districtList[0], '', 100000);
      }
    });

    this.myChart = echarts.init(document.getElementById('chart'));

    this.myChart.on('click', function (params) {
      that.echartsMapClick(params)
    });
  }

  // 地图初始化
  loadMapData(areaCode): void {
    AMapUI.loadUI(['geo/DistrictExplorer'], DistrictExplorer => {

      //创建一个实例
      var districtExplorer = new DistrictExplorer({
        eventSupport: true, //打开事件支持
        map: this.map
      });

      districtExplorer.loadAreaNode(areaCode, (error, areaNode) => {
        if (error) {
          return;
        }
        let mapJson = {};
        mapJson['features'] = areaNode.getSubFeatures();
        this.loadMap(this.cityName, mapJson);
        this.geoJsonData = mapJson;
      });
    });
  };

  //地图点击事件
  echartsMapClick(parement): void {
    console.log(parement);
  };

  // 获取水闸类别地图分布的数据
  distribution(levenlOne: any, levenlTwo: any): void {
    let data = { 'rank': levenlOne, 'size': levenlTwo };
    this.req.getData(this.routerApi.getCountWater, data).subscribe(res => {
      this.person = res['data'];
      this.getCountByWater(data);
    }, error => {
      this.message.create('error', `${error}`);
    })
  }

  // 流域等级查询
  getCountByWater(evnet?): void {
    this.req.getData(this.routerApi.getCountByWater, evnet).subscribe(res => {
      let xArr = {}, yArr = [{ name: '一类水闸', type: 'bar', data: 0 }, { name: '二类水闸', type: 'bar', data: 0 }, { name: '三类水闸', type: 'bar', data: 0 }, { name: '四类水闸', type: 'bar', data: 0 }];
      for(let item in res['data']['oneList']){
        let name = res['data']['oneList'][item]['name'];
        yArr[0]['data'] += res['data']['oneList'][item]['COUNT'];
        yArr[1]['data'] += res['data']['twoList'][item]['COUNT'];
        yArr[2]['data'] += res['data']['threeList'][item]['COUNT'];
        yArr[3]['data'] += res['data']['fourist'][item]['COUNT'];
        xArr[name] = yArr;
      }
      this.riverBasion = xArr;
    }, error => {
      this.message.create('error', error);
    })
  }

  // 选择省市，数据插入
  setSearchOption(data, level, adcode): void {
    var subList = data.districtList;
    if (subList) {
      var contentSub = new Option('--请选择--');
      var curlevel = subList[0].level;
      if (curlevel === 'street') {
        let mapJsonList = this.geoJsonData['features'];
        let mapJson = {};
        for (let i in mapJsonList) {
          if (mapJsonList[i].properties.name == this.cityName) {
            mapJson['features'] = [].concat(mapJsonList[i]);
          }
        }
        this.mapData = [];
        this.mapData.push({
          name: this.cityName,
          value: Math.random() * 100,
          level: curlevel
        });
        this.loadMap(this.cityName, mapJson);
        this.geoJsonData = mapJson;
        return;
      }

      this.mapData = [];
      for (var i = 0, l = subList.length; i < l; i++) {
        var listData = this.formatterHover(subList[i].name);
        var name = subList[i].name;
        var citycode = subList[i].adcode;
        this.mapData.push({
          name: name,
          value: Math.random() * 100,
          cityCode: citycode,
          level: curlevel,
          data: listData
        });
        var levelSub = subList[i].level;
        contentSub = new Option(name);
        contentSub.setAttribute("value", levelSub);
        contentSub.setAttribute("text", name);
        contentSub['center'] = subList[i].center;
        contentSub['adcode'] = subList[i].adcode;
      }
      this.loadMapData(adcode);
    }
  }

  // 地图初始化，参数配置
  loadMap(mapName, data): void {
    if (data) {
      echarts.registerMap(mapName, data);
      var that = this;
      // echarts 参数配置
      var option = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            if (params.componentSubType == "lines") {
              var toolTiphtml = params.name + ':<br>';
              for(let i in that.riverBasion[params.name]){
                toolTiphtml += that.riverBasion[params.name][i]['name'] + ':' + that.riverBasion[params.name][i]['data'] + "<br>"
              }
              return toolTiphtml;
            }
          }
        },
        geo: {
          show: true,
          roam: true,
          map: mapName,
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false,
              textStyle: {
                color: '#fff'
              }
            }
          },
          itemStyle: {
            normal: {
              areaColor: '#051640',
              borderColor: '#ffb43a'
            },
            emphasis: {
              areaColor: '#2B91B7',
            }
          }
        },
        series: [
          {
            type: 'lines',
            polyline: true,
            geoIndex: 0,
            large: true,
            label: {
              position: 'right',
              formatter: '{b}'
            },
            lineStyle: {
              width: 3,
              color: '#3bc5fe',
              curveness: 0.5
            },
            emphasis: {
              lineStyle: {
                width: 6,
                color: '#00ECFC'
              }
            },
            smooth: true,
            data: this.lineData(data)
          },
          {
            type: 'scatter',
            coordinateSystem: 'geo',
            polyline: true,
            itemStyle: {
              color: '#3bc5fe'
            },
            emphasis: {
              show: true,
              position: 'start',
              formatter: '{a}-{b}--{c}'
            },
            data: this.convertData(data)
          }
        ]
      };
      this.myChart.setOption(option);
    }
  };

  getData(data, level, adcode): void {
    var bounds = data.boundaries;
    if (bounds) {
      for (var i = 0, l = bounds.length; i < l; i++) {
        var polygon = new AMap.Polygon({
          map: this.map,
          strokeWeight: 1,
          strokeColor: '#0091ea',
          fillColor: '#80d8ff',
          fillOpacity: 0.2,
          path: bounds[i]
        });
        this.polygons.push(polygon);
      }
      this.map.setFitView(); //地图自适应
    }

    this.setSearchOption(data, level, adcode);

  }

  // 选中回调
  checkedCallback(data: any) {
    this.checkedBack.emit(data);
  }

  // 数据对比
  formatterHover(name: any): object {
    for (let item in this.person) {
      if (this.person[item]['pro'] == name) {
        return this.person[item]['waterList'];
      }
    }
  }

  // 坐标点数据处理
  convertData(data): object {
    var geoCoordMap = {}, res = [];
    data['features'].forEach(element => {
      // 地区名
      var name = element.properties.name;
      // 地区经度
      geoCoordMap[name] = element.properties.center;
    });
    for (let item in this.mapData) {
      var geoCoord = geoCoordMap[this.mapData[item]['name']];
      if (geoCoord) {
        res.push({
          name: this.mapData[item]['name'],
          value: geoCoord.concat(Math.ceil(this.mapData[item]['value'])),
          data: this.mapData[item]
        });
      }
    };
    return res;
  };

  // 线条坐标点
  lineData(data): object {
    var geoCoordMap = {}, res = [],
      riverTotal = [
        // { name: '太湖流域', coords: [] },
        // { name: '松花江流域', coords: [] },
        // { name: '海河流域', coords: [] },
        { name: '淮河流域', coords: [] },
        { name: '珠江流域', coords: [] },
        { name: '辽河流域', coords: [] },
        { name: '长江流域', coords: [] },
        { name: '黄河流域', coords: [] }
      ];

    data['features'].forEach(element => {
      // 地区名
      var adcode = element.properties.adcode;
      // 地区经度
      geoCoordMap[adcode] = element.properties.center;
    });

    this.mapData.forEach(element => {
      for (let item in element.data) {
        element.data[item]['code'] = geoCoordMap[element.cityCode]
        res.push(element.data[item]);
      }
    })


    for (let i in res) {
      switch (res[i]['sname']) {
        // case '太湖流域':
        //   riverTotal[0]['coords'].push(res[i]['code']);
        //   break;
        // case '松花江流域':
        //   riverTotal[1]['coords'].push(res[i]['code']);
        //   break;
        // case '海河流域':
        //   riverTotal[2]['coords'].push(res[i]['code']);
        //   break;
        case '淮河流域':
          riverTotal[0]['coords'].push(res[i]['code']);
          break;
        case '珠江流域':
          riverTotal[1]['coords'].push(res[i]['code']);
          break;
        case '辽河流域':
          riverTotal[2]['coords'].push(res[i]['code']);
          break;
        case '长江流域':
          riverTotal[3]['coords'].push(res[i]['code']);
          break;
        case '黄河流域':
          riverTotal[4]['coords'].push(res[i]['code']);
          break;
      }
    }
    return riverTotal;
  }

}
