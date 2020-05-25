// Angular Core
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// rxjs
import { Observable, throwError } from 'rxjs';
import { map, timeout, catchError } from "rxjs/operators"

@Injectable()
export class RequestService {
    private setTimeout: number = 5000;  // 默认的超时时间

    constructor(private http: HttpClient, private router: Router) {
    }

    /** 添加Authorization的属性 */
    private addAuthorization(options: any): void {
        options['withCredentials'] = true;
    }

    /** get 请求
     * 获取数据
     * param:  url    string      必填,请求的url
     *         params   any      可不填,请求的参数
     * return:        Observable  HttpClient的get请求，请求完成后返回的值类型是any
     **/
    public getData(url: string, params?: any): Observable<any> {
        let thiUrl = url;  // 用到的url
        let options = { params: params };  // 请求的设置
        this.addAuthorization(options);  // 请求头里添加Authorization参数
        return this.http.get(thiUrl, options).pipe(
            timeout(this.setTimeout),
            catchError(this.httpErrorFun),// 处理错误信息(必须放在timeout和map之间)
            map((res: any) => this.resFun(res))
        )
    }

    /** post 请求
     * 获取数据
     * data:  url    string     必填,请求的url
     *        data   Obj        请求参数
     * return:        Observable  HttpClient的post请求，请求完成后返回的值类型是any
     */
    public postData(url: string, data: any): Observable<any> {
        let thiUrl = url;  // 用到的url
        let options = {};  // 请求的设置
        this.addAuthorization(options);  // 请求头里添加Authorization参数
        return this.http.post(thiUrl, data, options).pipe(
            timeout(this.setTimeout),
            catchError(this.httpErrorFun), // 处理错误信息(必须放在timeout和map之间)
            map((res: any) => this.resFun(res))
        );
    }

    /** 返回数据的处理
     *  param:    data     any     必填,需要处理的数据
     *  return:   res      any     返回处理后的值
     **/
    private resFun(data: any): any {
        let thisData: any = data;  // 需要处理的值
        let res: any;  // 最终值
        // 当code为0时
        if (thisData['code'] == 0 || thisData['UTF8Encoding'] == true || thisData['type'] == 'FeatureCollection') {
            res = thisData; // 给最终值赋值
        } else {
            // 当status不为200时
            let err = thisData['message'];  // 错误信息
            throw new Error(err);  // 抛出错误
        }
        return res;  // 返回最终值
    }

    /** 对请求错误信息的处理
   *  param:    err                 any                 必填,需要处理的错误信息
   *  return:   Observable.throw    Observable<string>  string:处理后显示的错误文字
   **/
    public httpErrorFun(err: any): Observable<string> {
        let res: string = '';  // 处理后的结果
        let data: any = err;  // 需要处理的值
        console.log(data)

        /** 后台有返回错误信息时 */
        if (data.hasOwnProperty('error') && data.hasOwnProperty('message')) {
            res = data.message;

            /** 后台没有返回错误信息只有错误名时 */
        } else if (data.hasOwnProperty('name')) {
            let errName = data.name;

            /** 请求超时 */
            if (errName == 'TimeoutError') {
                res = '对不起，请求超时了';
            }

            /** 后台返回未授权时 */
        } else if (data == "Unauthorization") {
            res = '您没有权限，请重新登录';
        } else {
            res = "系统错误，请联系管理员";
        }

        return throwError(res);
    }
}