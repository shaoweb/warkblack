import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // 打开新链接
  openLink(): void{
    window.open('http://58.246.211.154:14200/forwcps/#/login')
  };

}
