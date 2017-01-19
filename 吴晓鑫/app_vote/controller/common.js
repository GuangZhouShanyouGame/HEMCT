var obj = {};
/**
 * 功能：查看符合搜索情况的内容
 * param：val,arr,porper
 */
obj.searchTheme = function(val,arr,porper){
  var result = [];
  // console.log(val);
  var re = new RegExp(val);
  // 进行遍历赋值
  for(let i = 0; i<arr.length ; i++){
    if( re.test(arr[i][porper]) ){
      result.push( arr[i] );
    }
  }
  return result ;
}

/*
* 功能：判断val是否和数组的某个属性符合
*/
obj.isrepeat = function(val,arr,porper){
  var result = [];
  // console.log(val);
  var re = new RegExp(val);
  // 进行遍历赋值
  for(let i = 0; i<arr.length ; i++){
    if( val == arr[i][porper] ){
      return false;
    }
  }
  return true ;
}

/*
* 功能：截取选择数组的前10个元素
*/
obj.limitten = function(arr){
  if(arr.length <=10){
    return arr;
  }else{
    return arr.slice(0,10);
  }
}

/*
* 功能：显示主题内容
* 参数：调用page()中的this对象
*/
obj.showContent= function(that){
  that.setData({
    show_content:true,
    show_addtheme:false,
    isdisabled:false,
  })
}
/*
* 功能：显示新增界面
* 参数：调用page()中的this对象
*/
obj.showAdd= function(that){
  that.setData({
    show_content:false,
    show_addtheme:true,
    isdisabled:true,
  })
}

/*
* 功能：搜索某个对象在数组中的索引。
* 参数：搜索数组，搜索对象
*/
obj.search = function(arr,obj){
  for(var i= 0; i<arr.length ; i++){
    var falg = true;
    for(var item in arr[i]){
      if(arr[i][item] != obj[item]){
        falg = false;
        break;
      }
    }
    if(falg){
      return i;
    }
  }
  return -1;
}


module.exports = obj;