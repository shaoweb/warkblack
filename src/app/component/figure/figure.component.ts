import { Component, OnInit, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RequestService } from "../../request.service";
import { APIROUTER } from "../../router.api"

import * as echarts from 'echarts';
@Component({
  selector: 'app-figure',
  templateUrl: './figure.component.html',
  styleUrls: ['./figure.component.css']
})
export class FigureComponent implements OnInit {

  constructor(private req: RequestService, private message: NzMessageService) { }

  // 把数据引入
  @Input() information: Array<any> = [];

  // 接口
  routerApi: any = APIROUTER;

  // 色值范围
  colors = [
    "#00ADD0",
    "#FFA12F",
    "#B62AFF",
    "#604BFF",
    "#6E35FF",
    "#002AFF",
    "#20C0F4",
    "#95F300",
    "#04FDB8",
    "#AF5AFF"
  ];

  option: any;

  ngOnInit() {

  }

  // 调用
  optionSumbit(): void {
    this.option = {
      type: "tree",
      toolbox: { //工具栏
        show: true,
        iconStyle: {
          borderColor: "#03ceda"
        },
        feature: {
          restore: {}
        }
      },
      tooltip: {//提示框
        trigger: "item",
        triggerOn: "mousemove",
        backgroundColor: "rgba(1,70,86,1)",
        borderColor: "rgba(0,246,255,1)",
        borderWidth: 0.5,
        textStyle: {
          fontSize: 10
        }
      },
      series: [
        {
          type: "tree",
          hoverAnimation: true, //hover样式
          data: this.getData(this.information),
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          layout: "radial",
          symbol: "circle",
          symbolSize: 10,
          nodePadding: 20,
          animationDurationUpdate: 750,
          expandAndCollapse: true, //子树折叠和展开的交互，默认打开
          initialTreeDepth: 2,
          roam: true, //是否开启鼠标缩放和平移漫游。scale/move/true
          focusNodeAdjacency: true,
          itemStyle: {
            borderWidth: 1,
          },
          label: { //标签样式
            color: "#fff",
            fontSize: 12,
            fontFamily: "SourceHanSansCN",
            position: "inside",
            rotate: 0,
          },
          lineStyle: {
            width: 1,
            curveness: 0.5,
          }
        }
      ]
    };
  };

  getData(event): object {
    let data = {
      name: event[event.length - 1]['name'],
      value: 0,
      children: []
    };
    for (let i = 1; i <= 9; i++) {
      let obj = {
        name: '201' + i + '年',
        value: i,
        children: [],
      };
      for (let j = 1; j <= 5; j++) {
        let obj2 = {};
        switch (j) {
          case 1:
            obj2 = { name: `水闸总量-${i + j}`, value: 1 + i + j, children: [] };
            break;
          case 2:
            obj2 = { name: `大坝总量-${i + j}`, value: 1 + i + j, children: [] };
            break;
          case 3:
            obj2 = { name: `堤防总量-${i + j}`, value: 1 + i + j, children: [] };
            break;
          case 4:
            obj2 = { name: `隧洞总量-${i + j}`, value: 1 + i + j, children: [] };
            break;
          case 5:
            obj2 = { name: `泵站总量-${i + j}`, value: 1 + i + j, children: [] };
            break;
        }
        for (let k = 1; k <= 3; k++) {
          let obj3 = {};
          switch (k) {
            case 1:
              obj3 = { name: '一类', value: obj2['value'] - k };
              break;
            case 2:
              obj3 = { name: '二类', value: obj2['value'] - k };
              break;
            case 3:
              obj3 = { name: '三类', value: obj2['value'] - k };
              break;
          }
          obj2['children'].push(obj3);
        }
        obj.children.push(obj2);
      }
      data.children.push(obj);
    }
    let arr = []
    arr.push(data);
    arr = this.handleData(arr, 0);
    return arr;
  };

  handleData(data: any[], index: number, color = '#00f6ff'): Array<any> {
    //index标识第几层
    return data.map((item, index2) => {
      //计算出颜色
      if (index == 1) {
        color = this.colors.find((item, eq) => eq == index2 % 10);
      }
      // 设置节点大小
      if (index === 0 || index === 1) {
        item.label = {
          position: "inside",
          //   rotate: 0,
          //   borderRadius: "50%",
        }
      }
      // 设置label大小
      switch (index) {
        case 0:
          item.symbolSize = 70
          break;
        case 1:
          item.symbolSize = 50
          break;
        default:
          item.symbolSize = 10
          break;
      }
      // 设置线条颜色
      item.lineStyle = { color: color }

      if (item.children) {//存在子节点
        item.itemStyle = {
          borderColor: color,
          color: color
        };
        item.children = this.handleData(item.children, index + 1, color);
      } else {//不存在
        item.itemStyle = {
          color: 'transparent',
          borderColor: color
        };
      }
      return item
    })
  }



}
