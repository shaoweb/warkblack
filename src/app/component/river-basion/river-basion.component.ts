import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RequestService } from "../../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';

import { APIROUTER } from "../../router.api"
declare let AMap: any;
declare let AMapUI: any;

@Component({
  selector: 'app-river-basion',
  templateUrl: './river-basion.component.html',
  styleUrls: ['./river-basion.component.css']
})
export class RiverBasionComponent implements OnInit {

  constructor(private req: RequestService, private message: NzMessageService) { }

  // 定于输出
  @Output('switchType') switchTitle = new EventEmitter<any>();
  @Output('getCountWater') getCountByWater = new EventEmitter<any>();
  @Output('dataRandom') randomData = new EventEmitter<any>();

  // 接口
  routerApi: any = APIROUTER;

  // 地图数据
  map;
  marker: any = [];
  riverBasion: any;

  // 工程规模,工程等别
  sizeOfthe: any = '';
  levnl: any = '';

  // 点标记显示内容，HTML要素字符串
  markerContent = '' +
    '<div class="custom-content-marker" style="width: 25px;height: 34px">' +
    '   <img style="width:100%" src="//a.amap.com/jsapi_demos/static/demo-center/icons/dir-via-marker.png">' +
    '</div>';

  ngOnInit() {
    // 地图初始化
    this.map = new AMap.Map('container', {
      mapStyle: 'amap://styles/60da58b3d8e77ac25b45ae050ddb0453', //设置地图的显示样式
      view: new AMap.View2D({
        resizeEnable: true,
        center: [104.2297,35.2677],
        zoom: 4//地图显示的缩放级别
      }),
    });

    // 默认回调
    this.riverLevenl();

  }

  // 切换
  switch(status: any): void {
    this.switchTitle.emit(status);
  };

  // 流域等级查询
  riverLevenl(): void {
    let parament = { 'rank': this.levnl, 'size': this.sizeOfthe };
    this.req.getData(this.routerApi.getCountWater, parament).subscribe(res => {
      let data = [];
      for (let item in res['data']) {
        data.push({
          name: res['data'][item]['name'],
          levenl: res['data'][item]['level'],
          position: [res['data'][item]['lng'], res['data'][item]['lat']]
        });
      };
      if (this.marker) { this.map.remove(this.marker)};// 清空标记
      this.addMarker(data); //创建地图坐标点
      this.getCountByWater.emit(parament); // 查询流域等级
      this.randomData.emit(); //更新其他数据
    }, error => {
      this.message.create('error', error);
    })
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
        markerion.setTitle(event.name + ":" + event.levenl)
        that.marker.push(markerion);
      })
    });
  };

}
