import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';

import { RequestService } from "../../request.service";
import { APIROUTER } from "../../router.api"

@Component({
  selector: 'app-news-content',
  templateUrl: './news-content.component.html',
  styleUrls: ['./news-content.component.css']
})
export class NewsContentComponent implements OnInit {

  constructor(private req: RequestService, private messages: NzMessageService, private http: HttpClient) { }

  /**
   * 数据接口
   * 新闻数据
  */

  routerApi: any = APIROUTER;
  newsTotaldata: any;

  testData: any = [
    { title: '流域雨洪资源高效开发利用技术及示范', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33903.html' },
    { title: '黄渤海沿海地区地下水管理与海水入侵防治研究', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33902.html' },
    { title: '跨境流域水资源权属体系及利益分配', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33900.html' },
    { title: '长三角地区水循环模拟系统集成与应用', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33899.html' },
    { title: '人工降雨雪影响下空陆一体化的区域水资源适应性调控研究', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33898.html' },
    { title: '自然和人类活动对地球系统陆地水循环的影响机理', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33897.html' },
    { title: '黄渤海沿海地区海水入侵综合防治与管理对策研究', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33896.html' },
    { title: '海平面上升对沿海地区海水入侵的影响研究', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33895.html' },
    { title: '应对突发水安全事件的水库群应急调度技术', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33894.html' },
    { title: '云水资源与陆地水资源耦合利用模式及适应性调控技术研究', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33893.html' },
    { title: '长三角山丘区水循环过程与模拟研究', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33892.html' },
    { title: '重点地区水资源承载动态预测与调控', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33891.html' },
    { title: '流域雨洪利用技术体系与智能管理平台', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33890.html' },
    { title: '水库群汛期运行水位设计技术', href: 'http://swszy.nhri.cn/art/2017/1/20/art_788_33889.html' },
    { title: '多源雨洪信息综合挖掘与预测预报方法', href: 'http://swszy.nhri.cn/art/2016/11/26/art_788_33480.html' },
    { title: '我国城市洪涝灾害防治策略与措施研究', href: 'http://swszy.nhri.cn/art/2016/3/1/art_788_31991.html' },
    { title: '城镇化发展背景下太湖流域防洪关键问题研究', href: 'http://swszy.nhri.cn/art/2016/3/1/art_788_31990.html' },
    { title: '长江黄河淮河海河治理的地学基础研究', href: 'http://swszy.nhri.cn/art/2016/3/1/art_788_31989.html' },
    { title: '长江中下游实时洪水应急响应关键技术研究', href: 'http://swszy.nhri.cn/art/2016/3/1/art_788_31988.html' },
    { title: '变化环境下不同气候区河川径流变化归因定量识别研究', href: 'http://swszy.nhri.cn/art/2016/3/1/art_788_31987.html' },
    { title: '三亚市大中型水库洪水预报与调度系统', href: 'http://swszy.nhri.cn/art/2016/3/1/art_788_31981.html' },
    { title: '衢州市城市洪水风险图编制', href: 'http://swszy.nhri.cn/art/2016/3/1/art_788_31979.html' },
  ];

  specification: any = [
    { title: '制定《水资源监测要素》', href: 'http://swszy.nhri.cn/art/2016/3/1/art_788_31986.html' },
    { title: '制定《径流观测实验规范》', href: 'http://swszy.nhri.cn//art/2016/3/1/art_788_31985.html' },
    { title: '《岩土工程学报》2020年第6期中文摘要', href: 'http://www.nhri.cn/art/2020/6/11/art_23_43252.html' },
    { title: '《海洋工程》2020年第3期中文摘要', href: 'http://www.nhri.cn/art/2020/6/8/art_23_43132.html' },
    { title: '《水科学进展》2020年第3期中文摘要', href: 'http://www.nhri.cn/art/2020/6/2/art_23_42931.html' },
    { title: '《岩土工程学报》2020年第5期中文摘要', href: 'http://www.nhri.cn/art/2020/5/12/art_23_42353.html' },
    { title: '《海洋工程》2020年第2期中文摘要', href: 'http://www.nhri.cn/art/2020/4/27/art_23_41853.html' },
    { title: '《海洋工程》2020年第1期中文摘要', href: 'http://www.nhri.cn/art/2020/4/27/art_23_41852.html' },
    { title: '《水利水运工程学报》2020年第2期中文摘要', href: 'http://www.nhri.cn/art/2020/4/27/art_23_41811.html' },
    { title: '《岩土工程学报》2020年第4期中文摘要', href: 'http://www.nhri.cn/art/2020/4/21/art_23_41613.html' },
    { title: '《岩土工程学报》2020年第3期中文摘要', href: 'http://www.nhri.cn/art/2020/4/21/art_23_41612.html' },
    { title: '《水科学进展》2020年第2期中文摘要', href: 'http://www.nhri.cn/art/2020/4/17/art_23_41532.html' },
    { title: '《水科学进展》2020年第1期中文摘要', href: 'http://www.nhri.cn/art/2020/3/17/art_23_41015.html' },
    { title: '《水利水运工程学报》2020年第1期中文摘要', href: 'http://www.nhri.cn/art/2020/3/17/art_23_41008.html' },
    { title: '《岩土工程学报》2020年第2期中文摘要', href: 'http://www.nhri.cn/art/2020/3/4/art_23_40973.html' },
    { title: '《岩土工程学报》2020年第1期中文摘要', href: 'http://www.nhri.cn/art/2020/1/17/art_23_40769.html' },
    { title: '《水利水运工程学报》2019年第6期中文摘要', href: 'http://www.nhri.cn/art/2020/1/3/art_23_40709.html' },
    { title: '《海洋工程》2019年第6期中文摘要', href: 'http://www.nhri.cn/art/2019/12/11/art_23_40637.html' },
    { title: '《水科学进展》2019年第6期（港珠澳大桥通车一周年专刊）中文摘要', href: 'http://www.nhri.cn/art/2019/11/29/art_23_40581.html' },
    { title: '《岩土工程学报》2019年第11期中文摘要', href: 'http://www.nhri.cn/art/2019/11/13/art_23_40525.html' },
    { title: '《水科学进展》2019年第5期中文摘要', href: 'http://www.nhri.cn/art/2019/11/11/art_23_40515.html' },
    { title: '《水利水运工程学报》2019年第5期中文摘要', href: 'http://www.nhri.cn/art/2019/11/4/art_23_40454.html' }
  ]

  notice: any = [
    { title: '我院编辑出版的2种科技期刊获得中国科技期刊卓越行动计划项目资助', href: 'http://www.nhri.cn/art/2019/12/5/art_23_40608.html' },
    { title: '南京信息工程大学姜彤教授应邀来我院做学术报告', href: 'http://www.nhri.cn/art/2019/12/2/art_23_40597.html' },
    { title: '长江科学院水力学研究所来我院交流座谈', href: 'http://www.nhri.cn/art/2019/11/15/art_23_40533.html' },
    { title: '加拿大工程院院士朱志伟教授来我院做学术报告', href: 'http://www.nhri.cn/art/2019/11/11/art_23_40514.html' },
    { title: '农电所赴奥地利、塞尔维亚开展国家重点研发计划项目执行与科技交流', href: 'http://www.nhri.cn/art/2019/11/6/art_23_40483.html' },
    { title: '农电所在塞尔维亚建立“小水电联合研究与培训中心”', href: 'http://www.nhri.cn/art/2019/11/6/art_23_40482.html' },
    { title: '瑞迪总公司聘任首批专家委员会专家并开展系列学术讲座', href: 'http://www.nhri.cn/art/2019/11/4/art_23_40476.html' },
    { title: '我院研究生在中国水利学会第二届青年科技论文（英文）竞赛中获奖', href: 'http://www.nhri.cn/art/2019/10/30/art_23_40431.html' },
    { title: '孟加拉国堤坝安全与疏浚工程培训考察团参观我院铁心桥试验基地', href: 'http://www.nhri.cn/art/2019/10/24/art_23_40402.html' },
    { title: '中国土木工程学会港口工程分会理事会换届暨水运工程创新技术交流大会在连云港召开', href: 'http://www.nhri.cn/art/2019/8/1/art_23_39593.html' },
    { title: '泰国科研创新基金会学术交流团访问我院', href: 'http://www.nhri.cn/art/2019/7/26/art_23_39497.html' },
  ]

  imgArr: any = [{ src: 'assets/image/tupian.png' }, { src: 'assets/image/tupian.png' }, { src: 'assets/image/tupian.png' }];
  ngOnInit() {
  };

  // 点击跳转详情
  linkBlank(href: string): void {
    window.open(href);
  };

}
