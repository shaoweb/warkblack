import { Component, OnInit } from '@angular/core';
import { MenuService } from "../meun.service";

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  routerUrl: any = {};

  messages: string;

  constructor(private menuSerice: MenuService) { }


  ngOnInit() {
    this.menuSerice.currentMessage.subscribe(message => this.messages = message);
    console.log(this.messages);
  }

}
