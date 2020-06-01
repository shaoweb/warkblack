import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RequestService } from "../request.service";
import { APIROUTER } from "../router.api"

@Component({
  selector: 'app-report-analysis',
  templateUrl: './report-analysis.component.html',
  styleUrls: ['./report-analysis.component.css']
})
export class ReportAnalysisComponent implements OnInit {

  constructor(
    private req: RequestService,
    private message: NzMessageService
  ) { }

  /**
   * 接口
   * 选中的三级联动
   * 三级联动
   * 查询参数
   * 详情弹框
   * 查询到的当前数据
   * 某个项目的详情
   * 数据总条数
   * */
  routerApi: any = APIROUTER;
  currentLevel: any = { 'province': '', 'city': '', 'area': '' };
  levelThree: any = {};
  parament: any = { 'page': 1, 'count': 15 };
  visible: boolean = false;
  dataAll: any;
  projectInformation: any = {};
  totalCount: number = 10;

  /**
   * 总选择
   * 单选择
   * 选中的数据
   * 请求到的全部数据
   * */
  selectTotaldata: number = 2; // 0：没有选中的，1：有选中的，2：全部选中
  selectAlldata: any = [];
  totalAlldata: any = [];

  ngOnInit() {
    let height = document.getElementById('table').clientHeight | document.getElementById('table').offsetHeight;
    if (height > 1000) {
      this.parament.count = 20;
    }

    // 查询行政区
    this.req.getData(this.routerApi.getArea).subscribe(res => {
      this.levelThree['province'] = res['data'];
    }, error => {
      this.message.create('error', error);
    })

    this.getProjects(this.parament); // 默认回调
  }

  // 请求所有项目数据
  getProjects(data): void {
    this.req.postData(this.routerApi.getProjects, data).subscribe(res => {
      for (let item in res['data']) {
        this.totalAlldata.push(res['data'][item]);
        let index = this.selectAlldata.indexOf(res['data'][item]['id']);
        index > -1 ? res['data'][item]['select'] = true : res['data'][item]['select'] = false;
      };
      this.dataAll = res['data'];
      this.totalCount = res['count'];
      this.selectTotaldata = this.currentPageDataChange(); // 初始化监测有没有全选
    }, error => {
      this.message.create('error', error);
    })
  };

  // 条件搜索
  search(): void {
    this.parament.page = 1;
    this.parament.areasId = this.currentLevel.area | this.currentLevel.city | this.currentLevel.province;
    this.getProjects(this.parament); // 默认回调
  };

  // 条件重置
  reset(): void {
    this.currentLevel = { 'province': '', 'city': '', 'area': '' };
    this.parament.areasId = null;
    this.parament.name = null;
    this.getProjects(this.parament); // 默认回调
  };

  // 查询某个项目的详情
  getProjectInformation(projectId: any): void {
    this.req.postData(this.routerApi.getProjectInformation, { 'id': projectId }).subscribe(res => {
      this.visible = true;
      this.projectInformation = res['data'];
    }, error => {
      this.message.create('error', error);
    })
  };

  // 查询市
  onExpandChange(currentId): void {
    this.req.getData(this.routerApi.getArea, { 'parentId': currentId }).subscribe(res => {
      this.levelThree.city = res['data'];
    }, error => {
      this.message.create('error', error);
    })
  };

  // 查询区/县
  onChangeCounty(currentId): void {
    this.req.getData(this.routerApi.getArea, { 'parentId': currentId }).subscribe(res => {
      this.levelThree.area = res['data'];
    }, error => {
      this.message.create('error', error);
    })
  };

  // 分页
  pageChange(event): void {
    this.parament.page = event;
    this.getProjects(this.parament); // 默认回调
  };

  // 数据发生变化时
  currentPageDataChange(): number {
    var status = 0;
    for(let item in this.dataAll){
      let index = this.selectAlldata.indexOf(this.dataAll[item]['id']);
      if(index == -1){
        Number(item) == 0 ? status = 0 : status = 1;
        return status;
      }
    }
    return status = 2;
  };

  // 单选
  refreshStatus(data: any): void {
    data.select = !data.select;
    if (data.select) {
      this.selectAlldata.push(data.id);
    } else {
      let index = this.selectAlldata.indexOf(data.id);
      this.selectAlldata.splice(index, 1);
    };
    this.selectTotaldata = this.currentPageDataChange();
  };

  // 全选
  checkAll(): void {
    if (this.selectTotaldata == 0 || this.selectTotaldata == 1) {
      this.selectTotaldata = 2;
      this.dataAll.forEach(element => {
        let index = this.selectAlldata.indexOf(element.id);
        if (index < 0) {
          element.select = true;
          this.selectAlldata.push(element.id);
        }
      });
    } else {
      this.selectTotaldata = 0;
      this.dataAll.forEach(element => {
        element.select = false;
        let index = this.selectAlldata.indexOf(element.id);
        this.selectAlldata.splice(index, 1);
      });
    }

  };

  // 导出
  export(): void{
    if(this.selectAlldata.length == 0){
      this.message.create('warning','请选择要导出的数据');
    }else{
      window.open(this.routerApi.exportProDetail + "?ids=" + this.selectAlldata)
    }
  };

}
