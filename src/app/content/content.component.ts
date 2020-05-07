import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  routerUrl: any = {};

  constructor(private router: Router) {
    router.events.pipe(filter((event) => event instanceof NavigationEnd), map(() => this.router)).subscribe(event => {
      // 当路由发生变化，刷新左侧的菜单栏
      this.routerUrl = event.url;
    })
  }

  routerList: any = [{ name: '首页', link: '/home' }]

  ngOnInit() {
  }

  // 获取子页面传来的值
  onActivate(event): void {
    let index = this.dataIndex(event);
    if (index == '-1') {
      this.routerList.push(event.routItem);
    } else {
      this.routerList.splice(Number(index) + 1, Number(index) + 1);
    }
  }

  // 返回值所在的位置
  dataIndex(event): string {
    for (let item in this.routerList) {
      if (event.routItem.name == this.routerList[item]['name']) {
        return item
      }
    }
    return '-1'
  }

}
