import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RequestService } from "../../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';

import { APIROUTER } from "../../router.api"
import * as echarts from 'echarts';
import * as $ from 'jquery';
declare let AMap: any;
declare let AMapUI: any;

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  constructor(private req: RequestService, private message: NzMessageService) { }

  // 定义输出：
  @Output('checked') checkedBack = new EventEmitter<any>();

  // 接口
  routerApi: any = APIROUTER;

  // 工程等级
  levnl: any = '';

  // 工程规模
  sizeOfthe: any = '';

  // 当前查看的省市区的id和名字
  currentCity: any = [{ 'name': '全国行政区', 'cityCode': '' }];

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

  // 数据
  person: any;

  ngOnInit() {

    // 地图初始化
    this.start();

    // 默认回调
    this.distribution(this.levnl, this.sizeOfthe);

  }

  // 选择工程规模，工程等级调用
  changeSelect():void{
    this.start();
    this.distribution(this.levnl, this.sizeOfthe);
  }

  // 初始化
  start():void{
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


  // 返回
  getBack(): void {
    if (this.deepTree.length > 1) {
      this.mapData = this.deepTree[this.deepTree.length - 1].mapData
      this.deepTree.pop();
      this.currentCity.pop();
      this.checkedCallback(this.currentCity[this.currentCity.length - 1]);
      this.loadMapData(this.deepTree[this.deepTree.length - 1].code)
    }
  }

  // 获取水闸类别地图分布的数据
  distribution(levenlOne: any, levenlTwo: any, areasId?: any): void {
    let data = { 'rank': levenlOne, 'size': levenlTwo };
    if (areasId) {
      data['areasId'] = areasId;
    }
    this.req.getData(this.routerApi.getProTypeCount, data).subscribe(res => {
      this.person = res['data'];
    }, error => {
      this.message.create('error', `${error}`);
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
    var that = this;
    if (data) {
      echarts.registerMap(mapName, data);
      var option = {
        tooltip: {
          show: true,
          formatter: function (params) {
            var toolTiphtml = params.name + ':<br>';
            if (params.data.data == undefined) {
              toolTiphtml += '暂未数据'
            } else {
              for (var i = 0; i < params.data.data.length; i++) {
                toolTiphtml += params.data.data[i]['level'] + ':' + params.data.data[i]['count'] + "<br>"
              }
            }

            return toolTiphtml;
          }
        },
        series: [
          {
            name: '数据名称',
            type: 'map',
            roam: false,
            mapType: mapName,
            selectedMode: 'single',
            showLegendSymbol: false,
            visibility: 'off',
            top: '5%',
            bottom: '5%',
            itemStyle: {
              normal: {
                color: '#ccc',
                borderColor: '#feaf3d',
                borderWidth: 1,
                shadowColor: 'rgba(128, 217, 248, 1)',
                shadowOffsetX: -2,
                shadowOffsetY: 2,
                shadowBlur: 10,
                label: {
                  show: true,
                  textStyle: {
                    color: "rgb(249, 249, 249)"
                  }
                },
                areaColor: {
                  type: 'radial',
                  x: 0.5,
                  y: 0.5,
                  r: 0.8,
                  colorStops: [{
                    offset: 0,
                    color: 'rgba(147, 235, 248, 0)' // 0% 处的颜色
                  }, {
                    offset: 1,
                    color: 'rgba(147, 235, 248, .2)' // 100% 处的颜色
                  }]
                },
              },
              emphasis: {
                areaColor: false,
                borderColor: '#fff',
                areaStyle: {
                  color: '#fff'
                },
                label: {
                  show: true,
                  textStyle: {
                    color: "rgb(249, 249, 249)"
                  }
                }
              }
            },
            data: this.mapData,
          }
        ]
      };
      this.myChart.setOption(option);
    }
  };

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
  echartsMapClick(params): void {
    this.checkedCallback(params);
    let data = { 'name': params.name, 'cityCode': params.data.cityCode }
    this.currentCity.push(data);
    this.distribution(this.levnl, this.sizeOfthe, params.data.cityCode)
    if (!params.data || params.data.level == 'street') return;
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
        this.getData(result.districtList[0], params.data.level, params.data.cityCode);
      }
    });

    this.setSearchOption(params.data, params.data.level, params.data.cityCode);

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
        return this.person[item]['typeList'];
      }
    }

  }

}
