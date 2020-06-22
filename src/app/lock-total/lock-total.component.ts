import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryComponent } from '../component';
import { WaterGateComponent } from '../water-gate/water-gate.component';
import { RegulatoryComponent } from '../regulatory/regulatory.component';

import { RequestService } from "../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';

import { APIROUTER } from "../router.api"
import * as echarts from 'echarts';

@Component({
  selector: 'app-lock-total',
  templateUrl: './lock-total.component.html',
  styleUrls: ['./lock-total.component.css']
})
export class LockTotalComponent implements OnInit {

  constructor(
    private router: Router,
    private req: RequestService,
    private message: NzMessageService
  ) { }

  @ViewChild(WaterGateComponent, { static: true }) watergate: WaterGateComponent;
  @ViewChild(CategoryComponent, { static: false }) category: CategoryComponent;

  // 指定进度条的数据格式
  format = (percent: number) => `${percent}`;

  // 接口
  routerApi: any = APIROUTER;

  // 接收现状调查的数据
  satuSurvey: any;

  // 接收安全复核的数据
  checkSecurity: any;

  // 接收安全检测的搜索条件
  safetyInspection: any;

  // 选择安全检测的条件
  safeselect: any;

  // 接收安全检测根据条件搜索到的数据
  safeSearch: any = {};

  // 标题
  title: any = '全国水闸工程';

  // 接收水闸的数据
  lockTotal: any = {};

  // 接收全国省份
  provincesTotal: any;

  // 当前省份
  currentProvinces: any = '';

  // 菜单栏
  routerList: any = JSON.parse(localStorage.getItem("routerList")) == null ? [{ 'name': '全国行政区水利工程', 'link': '/content/basin', 'areasId': '' }] : JSON.parse(localStorage.getItem("routerList"));

  // 水闸列表
  locklistAll: any;

  // 字母列表，选中字母
  testMenu: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];
  currentIndex: any;

  // 是否展示详情
  information: boolean = true;

  // 菜单的切换
  menuType: any = [{ 'name': '安全复核数量统计', type: 1 }, { 'name': '水闸工程检索', type: 2 }];
  currentStatus: any = this.menuType[0];

  // 安全复核数量统计
  securityReview: any;

  // 水闸名
  lockName: any;

  ngOnInit() {

    // 水闸信息的查询
    this.req.getData(this.routerApi.getTypeCount).subscribe(res => {
      let data = [];
      for (let item in res['data']['typeListOverdue']) {
        data.push({
          'name': res['data']['typeListOverdue'][item]['type'],
          'value': res['data']['typeListOverdue'][item]['typeCount'],
          'color': this.returnColor(res['data']['typeListOverdue'][item]['type'])
        })
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
      echarts.init(document.getElementById("sideTotal")).setOption(this.sideTotal('标签', data), true);
    }, error => {
      this.message.create('error', `${error}`);
    })

    // 获取工程规模
    this.req.getData(this.routerApi.getCountBySize).subscribe(res => {
      let data = [], total = 0;
      res['data'].forEach(element => { total += element.count });
      for (let item in res['data']) {
        let any = {
          value: res['data'][item]['count'],
          name: res['data'][item]['size'],
          label: {
            color: '#fff'
          },
          itemStyle: {

          },
          emphasis: {
            itemStyle: {

            }
          }
        }
        data.push(any)
      }
      this.sidePietion(data)
    }, error => {
      this.message.create('error', `${error}`)
    })

    // 根据省市区查询
    if (this.routerList.length > 1) {
      this.title = this.routerList[this.routerList.length - 1]['name'] + '水闸工程';
      this.selectProvinces(this.routerList[this.routerList.length - 1]['areasId']);
    } else {
      this.getCountByProvince()
    }

    // 获取全国省份的数据
    this.req.getData(this.routerApi.getArea, { 'levelType': 1 }).subscribe(res => {
      this.provincesTotal = res['data'];
    }, error => {
      this.message.create('error', `${error}`)
    })

    // 安全复核查询
    this.getConCountByValue();

    // 根据省市ID，查询数据
    this.alldata(this.routerList[this.routerList.length - 1]['areasId'])
  };

  // 根据省市ID，查询安全复核数量统计
  getConCountByValue(): void {
    let data = { 'proName': this.currentStatus.name, 'areaId': this.routerList[this.routerList.length - 1]['areaId'] };
    this.req.getData(this.routerApi.getConCountByValue, data).subscribe(res => {
      for (let item in res['data']) {
        res['data'][item]['total'] = 0;
        res['data'][item]['typeList'].forEach(element => {
          res['data'][item]['total'] += element.count;
        });
        for (let any in res['data'][item]['typeList']) {
          res['data'][item]['typeList'][any]['percentage'] = Math.ceil((res['data'][item]['typeList'][any]['count'] / res['data'][item]['total']) * 100);
        }
      };
      this.securityReview = res['data'];
    }, error => {
      this.message.create('error', error);
    })
  };

  // 根据省市ID，查询水闸列表
  alldata(areaId: any): void {
    this.req.getData(this.routerApi.getOrderProByArea, { 'areaId': areaId }).subscribe(res => {
      this.locklistAll = res['data'];
    }, error => {
      this.message.create('error', error)
    })
  };

  // 查询到期未检
  alldataDueto(areaId: any): void{
    this.req.getData(this.routerApi.getOrderProByArea1, { 'areaId': areaId }).subscribe(res => {
      this.locklistAll = res['data'];
    }, error => {
      this.message.create('error', error)
    })
  };

  // 查询水闸历年(历省)的数据
  getCountByProvince(areaId?: any): void {
    this.req.getData(this.routerApi.getCountByProvince).subscribe(res => {
      let xArr = [], yArr = [{ name: '一类水闸', type: 'bar', data: [] }, { name: '二类水闸', type: 'bar', data: [] }, { name: '三类水闸', type: 'bar', data: [] }, { name: '四类水闸', type: 'bar', data: [] }];
      for (let item in res['data']['fourist']) {
        xArr.push(res['data']['fourist'][item]['pro']);
        yArr[0]['data'].push(res['data']['fourist'][item]['count']);
        yArr[1]['data'].push(res['data']['oneList'][item]['count']);
        yArr[2]['data'].push(res['data']['threeList'][item]['count']);
        yArr[3]['data'].push(res['data']['twoList'][item]['count']);
      }
      echarts.init(document.getElementById("lockBar")).setOption(this.columnParameter(xArr, yArr), true);
    }, error => {
      this.message.create('error', `${error}`);
    })
  };

  // 根据类别返回色值
  returnColor(data: any): String {
    switch (data) {
      case '一类':
        return "#47C978";
      case '二类':
        return "#006AE8";
      case '三类':
        return "#F8B62D";
      case '四类':
        return "#D92A5C";
    }
  };

  // 根据类别返回图片地址
  returnImg(data: any): Object {
    switch (data) {
      case '一类':
        return { border: 'bor_47', imgUrl: "assets/image/shuizha_lv.png" };
      case '二类':
        return { border: 'bor_00', imgUrl: "assets/image/shuizha_lan.png" };
      case '三类':
        return { border: 'bor_F8', imgUrl: "assets/image/shuizha_huang.png" };
      case '四类':
        return { border: 'bor_D9', imgUrl: "assets/image/shuizha_hong.png" };
    }
  };

  // 综合评价-圆的参数配置
  stackParameter(data: any): object {
    let dataStyle = {
      normal: {
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        shadowBlur: 0,
        shadowColor: '#203665'
      }
    };
    let option = {
      series: [
        {
          name: '第一个圆环',
          type: 'pie',
          clockWise: false,
          radius: [30, 35],
          itemStyle: dataStyle,
          hoverAnimation: false,
          center: ['10%', '50%'],
          data: [{
            value: data[0]['accounted'],
            label: {
              normal: {
                rich: {
                  a: {
                    color: '#3a7ad5',
                    align: 'center',
                    fontSize: 20,
                    fontWeight: "bold"
                  },
                  b: {
                    color: '#fff',
                    align: 'center',
                    fontSize: 16
                  }
                },
                formatter: '{d}%',
                position: 'center',
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'normal',
                  color: '#fff'
                }
              }
            },
            itemStyle: {
              normal: {
                color: data[0]['color'],
                shadowColor: data[0]['color'],
                shadowBlur: 0
              }
            }
          }, {
            value: data[0]['remaining'],
            name: 'invisible',
            itemStyle: {
              normal: {
                color: 'rgba(0, 0, 0, .2)'
              },
              emphasis: {
                color: 'rgba(0, 0, 0, .2)'
              }
            }
          }]
        },
        {
          name: '第二个圆环',
          type: 'pie',
          clockWise: false,
          radius: [30, 35],
          itemStyle: dataStyle,
          hoverAnimation: false,
          center: ['35%', '50%'],
          data: [{
            value: data[1]['accounted'],
            label: {
              normal: {
                rich: {
                  a: {
                    color: '#d03e93',
                    align: 'center',
                    fontSize: 20,
                    fontWeight: "bold"
                  },
                  b: {
                    color: '#fff',
                    align: 'center',
                    fontSize: 16
                  }
                },
                formatter: '{d}%',
                position: 'center',
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'normal',
                  color: '#fff'
                }
              }
            },
            itemStyle: {
              normal: {
                color: data[1]['color'],
                shadowColor: data[1]['color'],
                shadowBlur: 0
              }
            }
          }, {
            value: data[1]['remaining'],
            name: 'invisible',
            itemStyle: {
              normal: {
                color: 'rgba(0, 0, 0, .2)'
              },
              emphasis: {
                color: 'rgba(0, 0, 0, .2)'
              }
            }
          }]
        },
        {
          name: '第三个圆环',
          type: 'pie',
          clockWise: false,
          radius: [30, 35],
          itemStyle: dataStyle,
          hoverAnimation: false,
          center: ['60%', '50%'],
          data: [{
            value: data[2]['accounted'],
            label: {
              normal: {
                rich: {
                  a: {
                    color: '#603dd0',
                    align: 'center',
                    fontSize: 20,
                    fontWeight: "bold"
                  },
                  b: {
                    color: '#fff',
                    align: 'center',
                    fontSize: 16
                  }
                },
                formatter: '{d}%',
                position: 'center',
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'normal',
                  color: '#fff'
                }
              }
            },
            itemStyle: {
              normal: {
                color: data[2]['color'],
                shadowColor: data[2]['color'],
                shadowBlur: 0
              }
            }
          }, {
            value: data[2]['remaining'],
            name: 'invisible',
            itemStyle: {
              normal: {
                color: 'rgba(0, 0, 0, .2)'
              },
              emphasis: {
                color: 'rgba(0, 0, 0, .2)'
              }
            }
          }]
        },
        {
          name: '第四个圆环',
          type: 'pie',
          clockWise: false,
          radius: [30, 35],
          itemStyle: dataStyle,
          hoverAnimation: false,
          center: ['85%', '50%'],
          data: [{
            value: data[3]['accounted'],
            label: {
              normal: {
                rich: {
                  a: {
                    color: '#603dd0',
                    align: 'center',
                    fontSize: 20,
                    fontWeight: "bold"
                  },
                  b: {
                    color: '#fff',
                    align: 'center',
                    fontSize: 16
                  }
                },
                formatter: '{d}%',
                position: 'center',
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'normal',
                  color: '#fff'
                }
              }
            },
            itemStyle: {
              normal: {
                color: data[3]['color'],
                shadowColor: data[3]['color'],
                shadowBlur: 0
              }
            }
          }, {
            value: data[3]['remaining'],
            name: 'invisible',
            itemStyle: {
              normal: {
                color: 'rgba(0, 0, 0, .2)'
              },
              emphasis: {
                color: 'rgba(0, 0, 0, .2)'
              }
            }
          }]
        }]
    }
    return option
  };

  // 综合评价-圆的参数配置
  sideTotal(title: string, data: any): object {
    let option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['45%', '55%'],
          label: {
            show: false
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
        },
        {
          type: 'pie',
          color: '#2AC9FD',
          radius: ['40%', '41%'],
          data: [100],
          label: {
            show: false
          }
        }
      ]
    };
    return option;
  };

  // 工程规模-圆的参数配置
  sidePietion(data: any): void {
    let myChart = echarts.init(document.getElementById("sidePietion"));

    function angleText(i, num) {
      //每个元素的角度
      var everyAngle = 360 / num;
      //文字现在所在的角度
      var currentAngle = i * everyAngle + everyAngle / 2;
      //文字所在模块的所占角度
      var currentArea = (i + 1) * everyAngle;
      if (currentAngle <= 90) {
        return -currentAngle;
      } else if (currentAngle <= 180 && currentAngle > 90) {
        return 180 - currentAngle;
      } else if (currentAngle < 270 && currentAngle > 180) {
        return 180 - currentAngle;
      } else if (currentAngle < 360 && currentAngle >= 270) {
        return 360 - currentAngle;
      }
    }

    //有值的色图的正切处理
    var data3 = [];
    data3 = JSON.parse(JSON.stringify(data));
    for (var i = 0; i < data3.length; i++) {
      if (i === 0) {
        data3[i]['label']['color'] = '#333';
        data3[i]['itemStyle']['color'] = 'rgba(25, 255, 224)';
        data3[i]['emphasis']['itemStyle']['color'] = 'rgba(25, 255, 224)';
        data3[i]['label']['rotate'] = angleText(i, data3.length);
      } else {
        data3[i]['label']['color'] = '#fff';
        data3[i]['itemStyle']['color'] = '#4169E1';
        data3[i]['emphasis']['itemStyle']['color'] = '#6A5ACD';
        data3[i]['label']['rotate'] = angleText(i, data3.length);
      }
    }

    //最外层大圈的数据
    var data1 = [];
    data1 = JSON.parse(JSON.stringify(data));
    for (var i = 0; i < data1.length; i++) {
      data1[i].value = 1;
      data1[i]['label']['rotate'] = angleText(i, data1.length);
      if (i === 0) {
        data1[i]['label']['color'] = 'rgba(25, 255, 224)';
      }
    }

    //透明饼图的数据
    var data2 = [];
    for (var i = 0; i < data.length; i++) {
      if (i === 0) {
        data2.push({
          value: 1,
          itemStyle: {
            color: 'rgba(25, 255, 224,0.05)',
          }
        });
      } else {
        data2.push({
          value: 1,
          itemStyle: {
            color: 'transparent',
          }
        });
      }
    }

    var option = {
      grid: {},
      polar: {},
      angleAxis: {
        show: false,
        interval: 1,
        type: 'category',
        data: [],
      },
      //中间画圈圈的坐标轴
      radiusAxis: {
        show: false
      },
      series: [
        {
          type: 'pie',
          radius: ["68%", "90%"],
          hoverAnimation: false,
          itemStyle: {
            color: 'transparent'
          },
          labelLine: {
            normal: {
              show: false,
              length: 30,
              length2: 55
            },
          },
          label: {
            normal: {
              position: 'inside',
              align: 'right'
            }
          },
          name: "",
          data: data1
        },
        {
          stack: 'a',
          type: 'pie',
          radius: ['75%', '42%'],
          roseType: 'area',
          zlevel: 10,
          itemStyle: {
            color: '#4169E1',
          },
          emphasis: {
            itemStyle: {
              color: '#6A5ACD'
            }
          },
          label: {
            normal: {
              show: true,
              textStyle: {
                fontSize: 16,
                color: '#fff'
              },
              position: 'inside',
              rotate: 14,
              align: 'right',
              fontWeight: 'normal',
              formatter: '{c} 项'
            },
            emphasis: {
              show: true
            }
          },
          animation: false,
          data: data3
        },
        {
          type: 'pie',
          zlevel: 99,
          radius: ["15%", "95%"],
          selectedOffset: 0,
          animation: false,
          hoverAnimation: false,
          label: {
            normal: {
              show: false,
            }
          },
          data: data2
        }]
    };

    myChart.setOption(option);

    myChart.on('click', function (a) {
      //最外层的字体颜色重置变色
      for (var da1 = 0; da1 < option.series[0].data.length; da1++) {
        option.series[0].data[da1].label.color = '#fff';
      }

      //色圈的字体颜色和选中颜色重置
      for (var da2 = 0; da2 < option.series[1].data.length; da2++) {
        option.series[1].data[da2].itemStyle.color = '#4169E1';
        option.series[1].data[da2].label.color = '#fff';
        //hover颜色重置
        option.series[1].data[da2].emphasis.itemStyle.color = '#6A5ACD';

      }

      //背景的透明饼图的重置
      for (var da3 = 0; da3 < option.series[2].data.length; da3++) {
        option.series[2].data[da3].itemStyle.color = 'transparent';
      }

      option.series[1].data[a.dataIndex].itemStyle.color = 'rgba(25, 255, 224)';
      option.series[1].data[a.dataIndex].label.color = '#333';
      //hover 颜色改变
      option.series[1].data[a.dataIndex].emphasis.itemStyle.color = 'rgba(25, 255, 224)';
      option.series[0].data[a.dataIndex].label.color = 'rgba(25, 255, 224)';
      option.series[2].data[a.dataIndex].itemStyle.color = 'rgba(25, 255, 224,0.1)';
      //console.log(option)
      myChart.setOption(option);
    });

    myChart.on('mouseover', function (a) {
      myChart.dispatchAction({
        type: 'highlight',
        seriesIndex: 1,
        dataIndex: a.dataIndex
      });
    });

    myChart.on('mouseout', function (a) {
      myChart.dispatchAction({
        type: 'downplay',
        seriesIndex: 1,
        dataIndex: a.dataIndex
      });
    });
  };

  // 安全检测的查询
  getExamine(item: any, child: any): void {
    this.safeselect = child;
    this.req.getData(this.routerApi.getExamine, { "id": "6b4b1fd1-0f51-11ea-9582-68f728d62cad", 'part': item.name, 'site': child }).subscribe(res => {
      this.safeSearch = res['data']
    }, error => {
      this.message.create('error', `${error}`)
    })
  };

  // 选择省份
  selectProvinces(selectId: any): void {
    this.req.getData(this.routerApi.getYearCountByCode, { 'id': selectId }).subscribe(res => {
      let xArr = [], yArr = [{ name: '一类水闸', type: 'bar', smooth: true, data: [] }, { name: '二类水闸', type: 'bar', smooth: true, data: [] }, { name: '三类水闸', type: 'bar', smooth: true, data: [] }, { name: '四类水闸', type: 'bar', smooth: true, data: [] }];
      for (let item in res['data']['fourist']) {
        xArr.push(res['data']['fourist'][item]['year']);
        yArr[0]['data'].push(res['data']['fourist'][item]['count']);
        yArr[1]['data'].push(res['data']['oneList'][item]['count']);
        yArr[2]['data'].push(res['data']['threeList'][item]['count']);
        yArr[3]['data'].push(res['data']['twoList'][item]['count']);
      }
      echarts.init(document.getElementById("lockBar")).setOption(this.columnParameter(xArr, yArr), true);
    }, error => {
      this.message.create('error', `${error}`);
    })
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
        start: 15,
        end: 75,
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

  // 这个方法由子页面调用
  checkedBack(event: any) {
    this.title = event.name + '水闸工程';
    this.currentProvinces = event.areasId;
    this.selectProvinces(event.areasId); // 选择省份
    this.alldata(event.areasId); // 根据省市ID，查询数据
    this.getConCountByValue(); // 安全复核查询
    this.routerList.push(event);
    // 数组去重
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

  // 菜单栏点击事件
  menuClick(index: number): void {
    if (this.routerList[index].link == '/content/basin') {
      this.router.navigate(['/content/basin']);
    } else {
      this.information = true;
      for (let item in this.routerList) {
        if (this.routerList[index].areasId == this.routerList[item]['areasId']) {
          this.routerList.splice(Number(item) + 1, this.routerList.length - 1);
          break;
        }
      };
      if (this.routerList[index]['areasId']) {
        this.category.cityId(this.routerList[index]);
      } else {
        this.getCountByProvince();
        this.category.returnEchart(this.routerList[index]);
      };
    }
  };

  // 选择水闸
  selectLocak(data: any): void {
    this.information = false;
    this.watergate.projectIdmation(data);
  };

  // 索引选择
  selectIndex(data: any): void {
    this.currentIndex = data;
    var currentDiv = document.getElementById(data);
    var lockboxMenu = document.getElementById('lockboxMenu');
    if (currentDiv) {
      lockboxMenu.scrollTo(0, currentDiv.getBoundingClientRect().top)
    }
    // 本地存储
    localStorage.setItem('routerList', JSON.stringify(this.routerList));
  };

  // 显示详情
  informationShow(event: any): void {
    this.information = false;
    this.watergate.fathFunction(event);
    // 本地存储
    localStorage.setItem('routerList', JSON.stringify(this.routerList));
  };


}
