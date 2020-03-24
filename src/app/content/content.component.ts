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
      this.routerUrl = this.router;
    })
  }


  ngOnInit() {
  }

}
