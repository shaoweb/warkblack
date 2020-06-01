import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-remind',
  templateUrl: './remind.component.html',
  styleUrls: ['./remind.component.css']
})
export class RemindComponent implements OnInit {

  constructor() { }

  testData: any = [
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'},
    {'name': '南京市三叉河河口闸', 'date': '2020.10.20', 'time': '5年', 'type': '水闸'}
  ];

  paramenter: any = {'type': ''};

  ngOnInit() {
  }

}
