var obj = {};
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
obj.showContent= function(that){
  that.setData({
    show_content:true,
    show_addtheme:false,
  })
}
obj.showAdd= function(that){
  that.setData({
    show_content:false,
    show_addtheme:true,
  })
}

module.exports = obj;