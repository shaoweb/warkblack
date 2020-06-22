import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'namePip'
})
export class NamePipPipe implements PipeTransform {

  transform(args: any[], key: any): any {
    var newArr = [];
    if(key == undefined || key == null){
      return args
    }else{
      for(var i = 0; i < args.length; i++){
        for(var e = 0; e < args[i]['pros'].length; e++){
          if(args[i]['pros'][e]['name'].indexOf(key) != -1){
            let arr = {index: args[i]['index'],pros: []};
            arr.pros.push(args[i]['pros'][e])
            newArr.push(arr)
          }
        }
      }
      return newArr
    }
  }

}
