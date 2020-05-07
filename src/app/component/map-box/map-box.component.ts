import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RequestService } from "../../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';

import { APIROUTER } from "../../router.api"
import * as echarts from 'echarts';
import * as $ from 'jquery';
declare let AMap: any;
declare let AMapUI: any;

@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.css']
})
export class MapBoxComponent implements OnInit {

  constructor(private req: RequestService, private message: NzMessageService) { }

  // 定义输出：
  @Output('checked') checkedBack = new EventEmitter<any>();
  @Output('getCountby') getCountByProvince = new EventEmitter<any>();
  @Output('switchType') switchTitle = new EventEmitter<any>();

  // 判断当前是按照省份查询还是流域查询
  testing: boolean = false;

  // 接口
  routerApi: any = APIROUTER;

  // 工程等别
  levnl: any = '';

  // 工程规模
  sizeOfthe: any = '';

  // 当前查看的省市区的id和名字
  currentCity: any = [{ 'name': '全国行政区', 'cityCode': '', 'rank': this.levnl, 'size': this.sizeOfthe }];

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

  // 数据
  person: any;
  riverBasion: any;

  ngOnInit() {
    // 默认回调
    this.distribution();
    // 地图初始化
    this.start();
  }

  // 获取水闸地图分布的数据
  distribution(areasId?: any): void {
    let data = { 'rank': this.levnl, 'size': this.sizeOfthe };
    if (areasId) {
      data['areasId'] = areasId;
    }
    this.req.getData(this.routerApi.getCount, data).subscribe(res => {
      this.person = res['data'];
    }, error => {
      this.message.create('error', `${error}`);
    })
  };

  // 条件查询
  administrativeSelect(areasId: any, type?: any): void {
    if (type == '1') {
      this.sizeOfthe = '';
    };
    let that = this;
    let data = {};
    data['name'] = this.currentCity[this.currentCity.length - 1]['name'];
    data['cityCode'] = this.currentCity[this.currentCity.length - 1]['cityCode'];
    data['rank'] = this.levnl;
    data['size'] = this.sizeOfthe;
    this.distribution(this.currentCity[this.currentCity.length - 1]['cityCode']);// 回调查询数据
    this.checkedCallback(data); // 回调父级方法
    // 判断是否处于第一阶级
    if (this.deepTree.length > 1) {
      this.mapData = this.deepTree[this.deepTree.length - 1].mapData;
      this.deepTree.pop();
      this.loadMapData(this.deepTree[this.deepTree.length - 1].code);
      this.currentCity.pop();
      this.checkedCallback(this.currentCity[this.currentCity.length - 1]);
    } else {
      // 地图数据更新
      this.district.search('中国', function (status, result) {
        if (status == 'complete') {
          that.getTotal(result.districtList[0], '', 100000);
        }
      });
    }
  };

  // 页面初始化
  start(): void {
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
        that.getTotal(result.districtList[0], '', 100000);
      }
    });

    this.myChart = echarts.init(document.getElementById('chart'));

    // 点击
    this.myChart.on('click', function (params) {
      that.echartsMapClick(params);
    });
  }

  // 切换
  switch(status: any): void {
    this.switchTitle.emit(status);
  };

  // 返回
  getBack(): void {
    if (this.deepTree.length > 1) {
      this.mapData = this.deepTree[this.deepTree.length - 1].mapData;
      this.deepTree.pop();
      this.loadMapData(this.deepTree[this.deepTree.length - 1].code);
      this.currentCity.pop();
      this.checkedCallback(this.currentCity[this.currentCity.length - 1]);
      let data = { 'rank': this.levnl, 'size': this.sizeOfthe, 'areasId': this.currentCity[this.currentCity.length - 1]['cityCode'] };
      this.getCountByProvince.emit(data);
      this.distribution(this.currentCity[this.currentCity.length - 1]['cityCode']);
    }
  };

  //地图点击事件
  echartsMapClick(parement): void {
    // 判断当前地图是否有值
    if(parement.data.data.data){
      let params = parement.data;
      if (!params.data || params.data.level == 'district') return;
      this.checkedCallback(params.data);
      let data = { 'name': params.name, 'cityCode': params.data.cityCode }
      this.currentCity.push(data);
      this.distribution(params.data.cityCode)
      this.cityName = params.data.name;
      this.cityCode = params.data.cityCode;
      this.district.setLevel(params.data.level); //行政区级别
      this.district.setExtensions('all');
      //行政区查询
      //按照adcode进行查询可以保证数据返回的唯一性
      this.district.search(params.data.cityCode, (status, result) => {
        if (status === 'complete') {
          this.deepTree.push({
            mapData: this.mapData,
            code: params.data.cityCode
          });
          this.getTotal(result.districtList[0], params.data.level, params.data.cityCode);
        }
      });
      this.setSearchOption(params.data, params.data.level, params.data.cityCode);
    }
  };

  // 地图初始化
  loadMapData(areaCode): void {
    var that = this;
    AMapUI.loadUI(['geo/DistrictExplorer'], DistrictExplorer => {

      //创建一个实例
      var districtExplorer = new DistrictExplorer({
        eventSupport: true, //打开事件支持
        map: that.map
      });

      districtExplorer.loadAreaNode(areaCode, (error, areaNode) => {
        if (error) {
          return;
        }
        let mapJson = {};
        mapJson['features'] = areaNode.getSubFeatures();
        that.loadMap(that.cityName, mapJson);
        that.geoJsonData = mapJson;
      });
    });
  };

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
      for (var i = 0; i < subList.length; i++) {
        var listData = this.formatterHover(subList[i].name, this.person);
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
  };

  // 地图参数配置
  loadMap(mapName, data): void {
    if (data) {
      echarts.registerMap(mapName, data);
      // echarts 参数配置
      var max = 480, min = 9; // todo 
      var maxSize4Pin = 100, minSize4Pin = 20;
      var option = {
        tooltip: {
          trigger: 'item',
          formatter: function (params, ticket) {
            var parament = params.data;
            if (parament != undefined) {
              var toolTiphtml = parament.name + ':<br>';
              if (parament.data.data) {
                for (var i = 0; i < parament.data.data.length; i++) {
                  toolTiphtml += parament.data.data[i]['name'] + ':' + parament.data.data[i]['count'] + "<br>"
                };
                return toolTiphtml;
              } else {
                toolTiphtml += '暂无数据';
                return toolTiphtml;
              }
            }
          }
        },
        geo: {
          show: true,
          roam: false,
          map: mapName,
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: true,
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
            type: 'map',
            map: mapName,
            top: '0',
            geoIndex: 0,
            aspectScale: 0.9, //长宽比
            showLegendSymbol: false, // 存在legend时显示
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
                color: '#FFF',
                areaColor: '#2B91B7',
              }
            },
            animation: true,
            data: this.convertData(data)
          },
          {
            name: '点',
            type: 'scatter',
            symbol: 'pin',
            coordinateSystem: 'geo',
            symbolSize: function (val, params) {
              if (params.data.data.data) {
                var a = (maxSize4Pin - minSize4Pin) / (max - min);
                var b = minSize4Pin - a * min;
                b = maxSize4Pin - a * max;
                return a * val[2] + b;
              } else {
                return 0
              }
            },
            label: {
              normal: {
                formatter: '{b}',
                position: 'right',
                show: false
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
            data: this.convertData(data),
          }
        ]
      };
      this.myChart.setOption(option);
    }
  };

  getTotal(data, level, adcode): void {
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

  };

  // 选中回调
  checkedCallback(data: any) {
    this.checkedBack.emit(data);
  };

  // 数据对比
  formatterHover(name: any, data: any): object {
    for (let item in data) {
      if (data[item]['pro'] == name) {
        let obj = [];
        obj = data[item]['data']
        return obj;
      }
    }
  };

  // 坐标点数据处理
  convertData(data): object {
    var res = [], geoCoordMap = {};
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

}
