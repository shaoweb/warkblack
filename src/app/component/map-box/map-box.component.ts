import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { RequestService } from "../../request.service";
import { APIROUTER } from "../../router.api"
import * as echarts from 'echarts';
declare let AMap: any;
declare let AMapUI: any;

@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.css']
})
export class MapBoxComponent implements OnInit {

  constructor(private req: RequestService, private message: NzMessageService, private router: Router, private sanitizer: DomSanitizer) { }

  // 定于输出
  @Output('switchType') switchTitle = new EventEmitter<any>();
  @Output('checked') checkedBack = new EventEmitter<any>();
  @Output('inforShow') informationShow = new EventEmitter<any>();

  /**
   * 接口API
   * 工程规模
   * 工程等别
   * echart地图数据
   * 等待数据加载完成在渲染地图
   * 地图数据
   * */
  routerApi: any = APIROUTER;
  size: any = '';
  rank: any = '';
  option: any;
  showloading: boolean = true;
  geoCoordMap: any = {};
  gaodeMap: boolean = true;
  mapAlldata: any;

  // 当前查看的省市区的id和名字
  routerList = JSON.parse(localStorage.getItem("routerList")) == null ? [{ 'name': '全国行政区水利工程', link: '/content/basin', 'areasId': '' }] : JSON.parse(localStorage.getItem("routerList"));
  currentCity: any = this.routerList[this.routerList.length - 1];

  // 高德点标记显示内容，HTML要素字符串
  icon: any = 'assets/image/dingwei_shuizha.png';
  markerContent = '' +
    '<div class="custom-content-marker" style="width: 25px;height: 34px">' +
    '   <img style="width:100%" src="' + this.icon + '">' +
    '</div>';

  /**
   * 地图数据
   * */
  map: any;
  district: any;
  marker: any = [];
  riverBasion: any;
  polygons: any = [];
  gaodeAllMap: any = {};

  ngOnInit() {

    if (this.currentCity.center) {
      // 高德 地图初始化
      this.gaodeMap = false;
      let data = { 'value': this.currentCity.center, 'data': [{ 'url': this.currentCity.areasId }], 'levenl': this.currentCity.levenl }
      this.gaoDeMapStart(data);
    } else {
      // echarts 地图初始化
      this.echartsMapStart();
    }
  };

  // 返回 echarts 地图
  returnEchart(event): void {
    this.gaodeMap = true;
    this.currentCity = event;
    // echarts 地图初始化
    this.echartsMapStart();
  };

  // echarts 地图初始化
  echartsMapStart(): void {
    this.req.getData('assets/map/china.json').subscribe(res => {
      res['features'].forEach(element => {
        // 地区名
        var name = element.properties.name;
        // 地区经度
        this.geoCoordMap[name] = element.properties.cp;
      });
      echarts.registerMap('china', res);
      this.searchCity(); // 默认回调
    });
  };

  // 高德 地图初始化
  gaoDeMapStart(data): void {
    this.map = new AMap.Map('gaoMap', {
      mapStyle: 'amap://styles/6d22d4e96993fd840a616e863ab0ccd0', //设置地图的显示样式
      resizeEnable: true,
      center: [data.value[0], data.value[1]],
      zoom: 6
    });

    //行政区划查询
    var opts = {
      subdistrict: 1, //返回下一级行政区
      showbiz: false //最后一级返回街道信息
    };

    this.district = new AMap.DistrictSearch(opts); //注意：需要使用插件同步下发功能才能这样直接使用

    this.district.setLevel(data.levenl); //行政区级别
    this.district.setExtensions('all');
    //按照adcode进行查询可以保证数据返回的唯一性
    this.district.search(data.data[0]['url'], (status, result) => {
      result.districtList[0]['districtList'].forEach(item => {
        let name = item.name;
        this.gaodeAllMap[name] = item;
      });
      this.searchCity(this.currentCity.areasId)
    });
  };

  // 查询水利工程分布位置
  searchCity(areasId?: string): void {
    let data = {};
    this.size ? data['size'] = this.size : null;
    this.rank ? data['rank'] = this.rank : null;
    areasId ? data['areasId'] = areasId : null;
    this.req.getData(this.routerApi.getCount, data).subscribe(res => {
      if (this.gaodeMap) {
        this.option = this.optionParamenter(res['data']);
        this.showloading = false;
      } else {
        let arr = [];
        for (let item in res['data']) {
          let geoCurrentmap = this.gaodeAllMap[res['data'][item]['pro']];
          if (geoCurrentmap) {
            arr.push({
              name: geoCurrentmap.name,
              levenl: geoCurrentmap.levenl,
              position: [geoCurrentmap.center.lng, geoCurrentmap.center.lat],
              areasId: geoCurrentmap.adcode,
              data: res['data'][item]['data']
            })
          }
        };
        if (this.marker) { this.map.remove(this.marker) }; // 清空标记
        this.addMarker(arr); // 创建标记
      }
    }, error => {
      this.message.create('error', error);
    })
  };

  // 条件重置
  emptyAll(): void {
    this.size = '';
    this.rank = '';
    this.searchCity(this.currentCity.areasId);
  };

  // 切换
  switch(status: any): void {
    this.switchTitle.emit(status);
  };

  // echarts 地图点击方法
  selectCity(event): void {
    if (event.data) {
      this.gaodeMap = false; // 关闭 echarts 地图
      this.currentCity = { 'name': event.name, 'link': '/content/basin', 'areasId': event.data.data[0]['url'], 'rank': this.rank, 'size': this.size, 'levenl': 'city', 'center': event.data.value };
      this.gaoDeMapStart(event.data);
      this.checkedBack.emit(this.currentCity); // 调用父级方法
    } else {
      this.message.create('warning', '暂无数据')
    }
  };

  // 地图参数配置
  optionParamenter(data): object {
    var option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: 'rgba(0,0,0,.8)',
        borderColor: '#3574c8',
        borderWidth: '1',
        extraCssText: 'padding:10px;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
        show: true,
        formatter: function (params) {
          var title = '';
          if (params.data) {
            title = params.data.name + '<br>';
            for (let item in params.data.data) {
              title += params.data.data[item]['name'] + ":" + params.data.data[item]['count'] + "<br>";
            }
            return title
          }
        }
      },
      geo: {
        map: 'china',
        type: 'map',
        top: '10px',
        bottom: '10px',
        aspectScale: 0.75, //长宽比
        showLegendSymbol: false, // 存在legend时显示
        label: {
          normal: {
            show: false,
            textStyle: {
              color: '#fff'
            }
          },
          emphasis: {
            textStyle: {
              color: '#fff'
            }
          }
        },
        roam: true,
        itemStyle: {
          normal: {
            areaColor: 'rgba(0,255,255,.02)',
            borderColor: '#00ffff',
            borderWidth: 1.5,
            shadowColor: '#00ffff',
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            shadowBlur: 10,
          },
          emphasis: {
            areaColor: 'transparent', //悬浮背景
            textStyle: {
              color: '#fff'
            }
          }
        }
      },
      series: [
        {
          type: 'map',
          aspectScale: 0.75, //长宽比
          geoIndex: 0,
          data: this.convertData(data),
        },
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          data: this.convertData(data),
          symbol: this.routerApi.echartsIcon,
          symbolSize: function (val) {
            return val[2];
          },
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              color: '#4bbbb2',
              borderWidth: 2,
              borderColor: '#b4dccd'
            }
          }
        },
      ]
    };
    return option;
  };

  // 坐标点数据处理
  convertData(data): object {
    var res = [];
    for (let item in data) {
      var geoCoord = this.geoCoordMap[data[item]['pro']];
      if (geoCoord) {
        res.push({
          name: data[item]['pro'],
          value: geoCoord.concat(Math.ceil(25 + Math.random() * 10)),
          data: data[item]['data']
        });
      }
    };
    return res;
  };

  // 地图创建标记
  addMarker(markers: any): void {
    var that = this;
    markers.forEach((event) => {
      // 百度坐标转高德坐标
      let path = [event.position[0], event.position[1]]
      AMap.convertFrom(path, 'baidu', function (status, result) {
        // 实例化标记
        var markerion = new AMap.Marker({
          map: that.map,
          content: that.markerContent,
          position: result.locations[0],
          offset: new AMap.Pixel(-13, -30)
        });

        // 标记文本
        markerion.setTitle(event.name + ":" + event.data[0]['count'] + '个');
        that.marker.push(markerion);

        // 点击事件
        markerion.on('click', (item) => {
          if (event.data[0]['count'] > 1) {
            that.cityId(event);
          } else {
            that.informationShow.emit(event);
          }
        })
      })
    });
  };

  // 根据省市ID查询
  cityId(event): void {
    this.district.setLevel(event.levenl); //行政区级别
    this.district.setExtensions('all');
    //按照adcode进行查询可以保证数据返回的唯一性
    this.district.search(event.areasId, (status, result) => {
      if (status === 'complete') {
        result.districtList[0]['districtList'].forEach(item => {
          let name = item.name;
          this.gaodeAllMap[name] = item;
        });
        this.currentCity = { 'name': event.name, link: '/content/basin', 'areasId': event.areasId, 'rank': this.rank, 'size': this.size, 'levenl': event.levenl, 'center': event.position };
        this.searchCity(this.currentCity.areasId);
        this.checkedBack.emit(this.currentCity); // 调用父级方法
      }
    });
  };

}
