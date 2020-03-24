import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RequestService } from "../../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';

import { APIROUTER } from "../../router.api"
import * as echarts from 'echarts';
import * as $ from 'jquery';
declare let AMap: any;
declare let AMapUI: any;
import { NzTheadComponent } from 'ng-zorro-antd';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

  constructor(private req: RequestService, private message: NzMessageService) { };

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

  person = [{
    lol: '123521',
    king: '5215463',
    cf: '6321525',
    car: '932154'
  },
  {
    lol: '532154',
    king: '3252152',
    cf: '321025',
    car: '302542'
  },
  {
    lol: '521345',
    king: '3452345',
    cf: '66734',
    car: '51235'
  },
  {
    lol: '4531235',
    king: '1285978',
    cf: '45612',
    car: '123571'
  },
  {
    lol: '123484',
    king: '678453',
    cf: '45612',
    car: '156786'
  },
  {
    lol: '9754158',
    king: '123453',
    cf: '4567812',
    car: '7541234'
  },
  {
    lol: '84536',
    king: '123654',
    cf: '4568',
    car: '15678'
  },
  {
    lol: '45611258',
    king: '123515',
    cf: '45612',
    car: '1452345'
  },
  {
    lol: '456847',
    king: '3157456',
    cf: '56456',
    car: '12357'
  },
  {
    lol: '314543',
    king: '312371',
    cf: '456878645',
    car: '45686'
  }
  ]

  ngOnInit() {

    var that = this;

    $('.back').click(function () {
      if (that.deepTree.length > 1) {
        that.mapData = that.deepTree[that.deepTree.length - 1].mapData
        that.deepTree.pop();
        that.loadMapData(that.deepTree[that.deepTree.length - 1].code)
      }
    })

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
      console.log(params);
      that.echartsMapClick(params)
    });

    var lastCode = '';
    this.myChart.on('mousemove', function (params) {
      if ($('.map_tips').is(':hidden')) {
        $('.map_tips').show();
      }
      var city = params.data.name;
      var city = city.substring(0, 2);

      if (lastCode !== params.data.cityCode) {
        $('.map_tips_city').text(city);
        $('.map_tips_lol').text('英雄联盟玩家：' + that.person[Math.floor(Math.random() * 10)].lol + '人');
        $('.map_tips_king').text('王者荣耀玩家：' + that.person[Math.floor(Math.random() * 10)].king + '人');
        $('.map_tips_cf').text('穿越火线玩家：' + that.person[Math.floor(Math.random() * 10)].cf + '人');
        $('.map_tips_car').text('QQ飞车玩家：' + that.person[Math.floor(Math.random() * 10)].car + '人');
      }
      lastCode = params.data.cityCode
      var layerX = params.event.offsetX;
      var layerY = params.event.offsetY;
      var heightAdd = 80;
      $('.map_tips').css({
        'top': layerY + 10,
        'left': layerX + 10
      });
    });

    this.myChart.on('mouseout', function (params) {
      $('.map_tips').hide();
    });

  }

  

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
        var name = subList[i].name;
        var citycode = subList[i].adcode;
        this.mapData.push({
          name: name,
          value: Math.random() * 100,
          cityCode: citycode,
          level: curlevel
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

  search(obj): void {
    var that = this;
    //清除地图上所有覆盖物
    for (var i = 0, l = this.polygons.length; i < l; i++) {
      this.polygons[i].setMap(null);
    }
    var option = obj[obj.options.selectedIndex];
    var keyword = option.text; //关键字
    var adcode = option.adcode;
    this.cityName = keyword;
    this.cityCode = adcode;
    this.district.setLevel(option.value); //行政区级别
    this.district.setExtensions('all');
    //行政区查询
    //按照adcode进行查询可以保证数据返回的唯一性
    this.district.search(adcode, function (status, result) {
      if (status === 'complete') {
        that.deepTree.push({
          mapData: that.mapData,
          code: adcode
        });
        that.getData(result.districtList[0], obj.id, adcode);
      }
    });
  }

  setCenter(obj): void {
    this.map.setCenter(obj[obj.options.selectedIndex].center)
  }

  loadMap(mapName, data): void {
    if (data) {
      echarts.registerMap(mapName, data);
      var option = {
        backgroundColor: 'rgba(0,0,0,.6)',

        series: [
          {
            name: '数据名称',
            type: 'map',
            roam: false,
            mapType: mapName,
            selectedMode: 'single',
            showLegendSymbol: false,
            visibility: 'off',
            itemStyle: {
              normal: {
                color: '#ccc',
                borderColor: '#feaf3d',
                borderWidth: 1,
                shadowColor: 'rgba(128, 217, 248, 1)',
                // shadowColor: 'rgba(255, 255, 255, 1)',
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

  echartsMapClick(params): void { //地图点击事件
   
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



}
