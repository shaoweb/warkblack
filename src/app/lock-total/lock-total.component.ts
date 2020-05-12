import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { RequestService } from "../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { CategoryComponent } from '../component';
import { RegulatoryComponent } from '../regulatory/regulatory.component';

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

  @ViewChild(RegulatoryComponent, { static: false }) category: RegulatoryComponent;

  // 由父级获取
  routItem: any = { name: '全国水闸工程', link: '/content/lockTotal' }

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
  routerList: any = JSON.parse(localStorage.getItem("currentCity")) == null ? [{'name':'全国行政区水利工程', 'link': '/content/basin', 'cityCode': 100000}] : JSON.parse(localStorage.getItem("currentCity"));

  // 水闸列表
  locklistAll: any;
  
  // 字母列表，选中字母
  testMenu: any = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#'];
  currentIndex: any;

  ngOnInit() {

    // 水闸信息的查询
    this.req.getData(this.routerApi.getTypeCount).subscribe(res => {
      let data = [], typeData = [];

      for (let item in res['data']['typeListOverdue']) {
        data.push({ 'name': res['data']['typeListOverdue'][item]['type'], 'value': res['data']['typeListOverdue'][item]['typeCount'], 'color': this.returnColor(res['data']['typeListOverdue'][item]['type']) })
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
      let data = [], charts = { cityList: [], cityData: [] };
      for (let item in res['data']) {
        charts.cityList.push(res['data'][item]['size']);
        charts.cityData.push(res['data'][item]['count']);
        data.push({ name: res['data'][item]['size'], value: res['data'][item]['count'] })
      }
      echarts.init(document.getElementById("sidePietion")).setOption(this.sidePietion(data), true);
      echarts.init(document.getElementById("sideBartion")).setOption(this.sideBartion(charts), true);
    }, error => {
      this.message.create('error', `${error}`)
    })

    // 根据省市区查询
    if (this.routerList.length > 1) {
      this.title = this.routerList[this.routerList.length - 1]['name'] + '水闸工程';
      this.selectProvinces(this.routerList[this.routerList.length - 1]['cityCode']);
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
    this.req.getData(this.routerApi.getConCountByValue).subscribe(res => {
      for (let item in res['data']) {
        for (let any in res['data'][item]['typeList']) {
          switch (res['data'][item]['typeList'][any]['value']) {
            case 'A类':
              res['data'][item]['typeList'][any]['strokeColor'] = { '0%': '#2D70F8', '100%': '#92B4FB' };
              break;
            case 'B类':
              res['data'][item]['typeList'][any]['strokeColor'] = { '0%': '#F8B62D', '100%': '#F8D282' };
              break;
            case 'C类':
              res['data'][item]['typeList'][any]['strokeColor'] = { '0%': '#E80042', '100%': '#FF9AB7' };
              break;
          }
        }
      }
      this.checkSecurity = res['data'];
    }, error => {
      this.message.create('error', error);
    })

    // 根据省市ID，查询数据
    this.alldata(this.routerList[this.routerList.length - 1]['cityCode'])
  };

  // 根据省市ID，查询数据
  alldata(areaId: any): void {
    this.req.getData(this.routerApi.getOrderProByArea, {'areaId': areaId}).subscribe(res=>{
      this.locklistAll = res['data'];
    }, error=>{
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
  }

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
  }

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
  }

  // 综合评价-圆的参数配置
  sideTotal(title: string, data: any): object {
    let option = {
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['30%', '40%'],
          label: {
            position: 'outside',
            formatter: '{b}\n{@2012} ({d}%)'
          },
          labelLine: {
            show: true,
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
  }

  // 工程规模-圆的参数配置
  sidePietion(data: any): object {
    let arrName = getArrayValue(data, "name");
    let arrValue = getArrayValue(data, "value");
    let sumValue = eval(arrValue.join('+'));
    let objData = array2obj(data, "name");
    let optionData = getData(data);
    function getArrayValue(array, key) {
      let name = key || "value";
      let res = [];
      if (array) {
        array.forEach(function (t) {
          res.push(t[name]);
        });
      }
      return res;
    }

    function array2obj(array, key) {
      let resObj = {};
      for (let i = 0; i < array.length; i++) {
        resObj[array[i][key]] = array[i];
      }
      return resObj;
    }

    function getData(data) {
      let res = {
        series: [],
        yAxis: []
      };
      for (let i = 0; i < data.length; i++) {
        // console.log([70 - i * 15 + '%', 67 - i * 15 + '%']);
        res.series.push({
          name: '',
          type: 'pie',
          clockWise: false, //顺时加载
          hoverAnimation: false, //鼠标移入变大
          radius: [73 - i * 15 + '%', 68 - i * 15 + '%'],
          center: ["30%", "55%"],
          label: {
            show: false
          },
          itemStyle: {
            label: {
              show: false,
            },
            labelLine: {
              show: false
            },
            borderWidth: 5,
          },
          data: [{
            value: data[i].value,
            name: data[i].name
          }, {
            value: sumValue - data[i].value,
            name: '',
            itemStyle: {
              color: "rgba(0,0,0,0)",
              borderWidth: 0
            },
            tooltip: {
              show: false
            },
            hoverAnimation: false
          }]
        });
        res.series.push({
          name: '',
          type: 'pie',
          silent: true,
          z: 1,
          clockWise: false, //顺时加载
          hoverAnimation: false, //鼠标移入变大
          radius: [73 - i * 15 + '%', 68 - i * 15 + '%'],
          center: ["30%", "55%"],
          label: {
            show: false
          },
          itemStyle: {
            label: {
              show: false,
            },
            labelLine: {
              show: false
            },
            borderWidth: 5,
          },
          data: [{
            value: 7.5,
            itemStyle: {
              color: "rgb(3, 31, 62)",
              borderWidth: 0
            },
            tooltip: {
              show: false
            },
            hoverAnimation: false
          }, {
            value: 2.5,
            name: '',
            itemStyle: {
              color: "rgba(0,0,0,0)",
              borderWidth: 0
            },
            tooltip: {
              show: false
            },
            hoverAnimation: false
          }]
        });
        res.yAxis.push((data[i].value / sumValue * 100).toFixed(2) + "%");
      }
      return res;
    }

    let option = {
      legend: {
        show: true,
        icon: "circle",
        top: '15%',
        right: '5%',
        data: arrName,
        width: '50',
        padding: [0, 5],
        itemGap: 10,
        formatter: function (name) {
          return "{title|" + name + "}{value| " + (objData[name].value) + "}{title| 项}"
        },
        textStyle: {
          rich: {
            title: {
              fontSize: 12,
              lineHeight: 12,
              color: "rgb(0, 178, 246)"
            },
            value: {
              fontSize: 12,
              lineHeight: 12,
              color: "#fff"
            }
          }
        },
      },
      tooltip: {
        show: true,
        trigger: "item",
        formatter: "{a}<br>{b}:{c}({d}%)"
      },
      color: ['rgb(16,122,209)', 'rgb(12,177,181)', 'rgb(192,135,19)', 'rgb(192,86,48)', 'rgb(129,48,192)'],
      grid: {
        top: '16%',
        bottom: '53%',
        left: "30%",
        containLabel: false
      },
      yAxis: [{
        type: 'category',
        inverse: true,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          interval: 0,
          inside: true,
          textStyle: {
            color: "#fff",
            fontSize: 12,
          },
          show: true
        },
        data: optionData.yAxis
      }],
      xAxis: [{
        show: false
      }],
      series: optionData.series
    };
    return option;
  }

  // 工程规模-进度条的参数配置
  sideBartion(charts: any): object {
    let top10CityList = charts.cityList;
    let top10CityData = charts.cityData;
    let color = ['rgba(16,122,209', 'rgba(12,177,181', 'rgba(192,135,19', 'rgba(192,86,48', 'rgba(129,48,192']

    let lineY = []
    for (let i = 0; i < charts.cityList.length; i++) {
      let x = i
      if (x > color.length - 1) {
        x = color.length - 1
      }
      let data = {
        name: charts.cityList[i],
        color: color[x] + ')',
        value: top10CityData[i],
        itemStyle: {
          normal: {
            show: true,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
              offset: 0,
              color: color[x] + ', 0.3)'
            }, {
              offset: 1,
              color: color[x] + ', 1)'
            }], false),
            barBorderRadius: 10
          },
          emphasis: {
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
      lineY.push(data)
    }

    let option = {
      title: {
        show: false
      },
      tooltip: {
        trigger: 'item'
      },
      grid: {
        borderWidth: 0,
        top: '0',
        left: '5%',
        right: '5%',
        bottom: '3%'
      },
      color: color,
      yAxis: [{
        type: 'category',
        inverse: true,
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          show: false,
          inside: false
        },
        data: top10CityList
      }, {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false,
          inside: false,
          textStyle: {
            color: '#b3ccf8',
            fontSize: '14',
            fontFamily: 'PingFangSC-Regular'
          },
          formatter: function (val) {
            return `${val}项`
          }
        },
        splitArea: {
          show: false
        },
        splitLine: {
          show: false
        },
        data: top10CityData
      }],
      xAxis: {
        type: 'value',
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        }
      },
      series: [{
        name: '',
        type: 'bar',
        zlevel: 2,
        barWidth: '12px',
        data: lineY,
        animationDuration: 1500,
        label: {
          normal: {
            color: '#b3ccf8',
            show: true,
            position: [8, 2],
            textStyle: {
              fontSize: 10
            },
            formatter: function (a, b) {
              return a.name
            }
          }
        }
      }],
      animationEasing: 'cubicOut'
    }
    return option;
  }

  // 安全检测的查询
  getExamine(item: any, child: any): void {
    this.safeselect = child;
    this.req.getData(this.routerApi.getExamine, { "id": "6b4b1fd1-0f51-11ea-9582-68f728d62cad", 'part': item.name, 'site': child }).subscribe(res => {
      this.safeSearch = res['data']
    }, error => {
      this.message.create('error', `${error}`)
    })
  }

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
  }

  // 线状图的参数配置
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
  }

  // 这个方法由子页面调用
  checkedBack(data: any) {
    var event = data[data.length - 1];
    this.title = event.name + '水闸工程';
    this.currentProvinces = event.cityCode;
    this.selectProvinces(event.cityCode);
    this.alldata(event.cityCode);
    this.routerList = data;
  };

  // 菜单栏点击事件
  menuClick(data: any): void {
    if (data.link == '/content/lockTotal') {
      this.category.getBack(data);
    } else {
      if (data.cityCode == 100000) {
        this.routerList.splice(1, this.routerList.length - 1);
      } else {
        for (let item in this.routerList) {
          if (data.cityCode == this.routerList[item]['cityCode']) {
            this.routerList.splice(Number(item) + 1, this.routerList.length - 1);
            break;
          }
        };
      }
      // 本地存储-菜单栏
      localStorage.setItem("currentCity", JSON.stringify(this.routerList))
      // 跳转页面
      this.router.navigateByUrl(data.link);
    }
  };

  // 选择水闸
  selectLocak(data: any): void{
    this.router.navigate(['/content/waterGate'], {
      queryParams: { 'id': data.areasId, 'name': data.name }
    });
  };

  // 索引选择
  selectIndex(data: any): void{
    this.currentIndex = data;
    var currentDiv = document.getElementById(data);
    var lockboxMenu = document.getElementById('lockboxMenu');
    if(currentDiv){
      lockboxMenu.scrollTo(0, currentDiv.getBoundingClientRect().top)
    }
  };


}
