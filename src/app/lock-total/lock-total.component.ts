import { Component, OnInit } from '@angular/core';
import { RequestService } from "../request.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { CategoryComponent } from '../component';

import { APIROUTER } from "../router.api"
import * as echarts from 'echarts';

@Component({
  selector: 'app-lock-total',
  templateUrl: './lock-total.component.html',
  styleUrls: ['./lock-total.component.css']
})
export class LockTotalComponent implements OnInit {

  constructor(private req: RequestService, private message: NzMessageService) { }

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
  title: any = '全国各行政区水利工程';

  // tab栏
  menuList: any = [
    { name: '现状调查', status: 1 },
    { name: '安全监测', status: 2 },
    { name: '安全复核', status: 3 },
  ];

  // 默认tab栏的第一项
  currentStatus: any = this.menuList[0];

  // 接收水闸的数据
  lockTotal: any = {};

  // 接收全国省份
  provincesTotal: any;

  // 当前省份
  currentProvinces: any = '';

  // 接收

  ngOnInit() {

    // 水闸信息的查询
    this.req.getData(this.routerApi.getTypeCount).subscribe(res => {
      let data = [], typeData = [];

      for (let item in res['data']['typeListOverdue']) {
        data.push({ 'name': res['data']['typeListOverdue'][item]['type'], 'value': res['data']['typeListOverdue'][item]['typeCount'], 'color': this.returnColor(res['data']['typeListOverdue'][item]['type']) })
      }
      for (let item in res['data']['typePro']) {
        typeData.push({ 'color': this.returnColor(res['data']['typePro'][item]['type']), 'accounted': Math.ceil((res['data']['typePro'][item]['count'] / res['data']['projectsCount']) * 100), 'remaining': (100 - Math.ceil((res['data']['typePro'][item]['count'] / res['data']['projectsCount']) * 100)) });
        res['data']['typePro'][item]['imgUrl'] = this.returnImg(res['data']['typePro'][item]['type'])['imgUrl'];
        res['data']['typePro'][item]['borderColor'] = this.returnImg(res['data']['typePro'][item]['type'])['border'];
      }
      this.lockTotal = res['data'];
      echarts.init(document.getElementById("sidePie")).setOption(this.stackParameter(typeData), true);
      echarts.init(document.getElementById("sideTotal")).setOption(this.sideTotal(data, res['data']['countByOverdue']), true);
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

    // 水闸历年(历省)的数据
    this.req.getData(this.routerApi.getCountByProvince).subscribe(res => {
      let xArr = [], yArr = [{ name: '一类水闸', type: 'line', data: [] }, { name: '二类水闸', type: 'line', data: [] }, { name: '三类水闸', type: 'line', data: [] }, { name: '四类水闸', type: 'line', data: [] }];
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

    // 获取全国省份的数据
    this.req.getData(this.routerApi.getArea, { 'levelType': 1 }).subscribe(res => {
      this.provincesTotal = res['data'];
    }, error => {
      this.message.create('error', `${error}`)
    })

    // 默认回调tab栏第一个
    this.testFun(this.currentStatus);
  }

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

  // 选择tab栏
  selectFunstatus(item: any): void {
    this.currentStatus = item;
    switch (item.status) {
      case 1:
        this.testFun(item);
        break;
      case 2:
        this.getExamineByid();
        break;
      case 3:
        this.security();
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
  sideTotal(scaleData: any, total: any): object {
    let rich = {
      white: {
        color: '#ddd',
        align: 'center',
        padding: [5, 0]
      }
    };
    let placeHolderStyle = {
      normal: {
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        color: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 0
      }
    };
    let data = [];
    for (let i = 0; i < scaleData.length; i++) {
      data.push({
        value: scaleData[i].value,
        name: scaleData[i].name,
        itemStyle: {
          normal: {
            borderWidth: 5,
            shadowBlur: 20,
            borderColor: scaleData[i].color,
            shadowColor: scaleData[i].color
          }
        }
      }, {
        value: scaleData.length,
        name: '',
        itemStyle: placeHolderStyle
      });
    }
    let seriesObj = [{
      name: '',
      type: 'pie',
      clockWise: false,
      radius: [50, 55],
      hoverAnimation: false,
      itemStyle: {
        normal: {
          label: {
            show: true,
            position: 'outside',
            color: '#ddd',
            formatter: function (params) {
              let percent = '0';
              let total = 0;
              for (let i = 0; i < scaleData.length; i++) {
                total += scaleData[i].value;
              }
              percent = ((params.value / total) * 100).toFixed(0);
              if (params.name !== '') {
                return params.name + ':{white|' + '占比' + percent + '%}';
              } else {
                return '';
              }
            },
            rich: rich
          },
          labelLine: {
            show: false
          }
        }
      },
      data: data
    }];
    let option = {
      title: {
        text: '到期未检',
        subtext: total,
        x: 'center',
        y: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: '#FFF'
        },
        subtextStyle: {
          color: '#FFF',
          fontSize: 12
        },
      },
      tooltip: {
        show: false
      },
      legend: {
        show: false
      },
      toolbox: {
        show: false
      },
      series: seriesObj
    }
    return option
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
        right: '10%',
        bottom: '10%',
        data: arrName,
        width: '50',
        padding: [0, 5],
        itemGap: 10,
        formatter: function (name) {
          return "{title|" + name + "}{value|" + (objData[name].value) + "}{title|项}"
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
        top: '10%',
        left: '5%',
        right: '15%',
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
        barWidth: '10px',
        data: lineY,
        animationDuration: 1500,
        label: {
          normal: {
            color: '#b3ccf8',
            show: true,
            position: [0, 0],
            textStyle: {
              fontSize: 12
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

  // 现状调查
  testFun(item: any): void {
    this.req.postData(this.routerApi.getSurvey, { "id": "6b4b1fd1-0f51-11ea-9582-68f728d62cad", 'type': item.name }).subscribe(res => {
      this.satuSurvey = res['data'];
    }, error => {
      this.message.create('error', `${error}`)
    })
  }

  // 安全复核查询
  security(): void {
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
      console.log(res);
      this.checkSecurity = res['data'];
    }, error => {
      this.message.create('error', `${error}`);
    })
  }

  // 安全检测的搜索参数查询
  getExamineByid(): void {
    this.req.getData(this.routerApi.getExamineByid, { "id": "6b4b1fd1-0f51-11ea-9582-68f728d62cad" }).subscribe(res => {
      this.safetyInspection = res['data'];
      this.getExamine(res['data'][0], res['data'][0]['siteList'][0])
    }, error => {
      this.message.create('error', `${error}`)
    })
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
      let xArr = [], yArr = [{ name: '一类水闸', type: 'line', data: [] }, { name: '二类水闸', type: 'line', data: [] }, { name: '三类水闸', type: 'line', data: [] }, { name: '四类水闸', type: 'line', data: [] }];
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

  // 条状图的参数配置
  columnParameter(xArr: any, data: any): object {
    let option = {
      color: ['#47C978', '#006AE8', '#F8B62D', '#D92A5C'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        top: '3%',
        left: '3%',
        right: '4%',
        containLabel: true
      },
      dataZoom: {
        show: true,
        realtime: true,
        start: 0,
        end: 100
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
  checkedBack(event:any) {
    this.title = event.name + '水利工程'
    this.selectProvinces(event.cityCode);
  }


}
