const selectData =  require("../../controller/database/selectData.js");
const insert =  require("../../controller/database/insert.js");
const Model = require("../../model/model.js");

function searchTheme(){
  
}


Page({
  data:{
    search_Imgclass:"blur_search_image",
    themeArray:[],
    isNull:false,
  },
  
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数

  },
  // 输入框事件
  sfocus:function(){
    this.setData({search_Imgclass:"focus_search_image"})
  },
  sblur:function(e){
    if(e.detail.value != ""){
      this.setData({search_Imgclass:"focus_search_image"})
    }else{
      this.setData({search_Imgclass:"blur_search_image"})
    }
  },
  search_theme_handler:function(){
    searchTheme.apply(this);
    

  },
  onReady:function(){
    // 页面渲染完成
    // var that = this;
    // selectData.querytheme().then(function(result){
    //   that.setData({themeArray:result});
    // });
    var that = this;
    selectData.querytheme().then(function(todo){
      console.log(todo)
      var result = [],
          yesterday = getDateStr(-1),
          i = 0;    
          console.log(getDateStr(-1))
          // console.log(i < todo.length)
      for (; i < todo.length; i++) {
          var time = todo[i].createdAt;
          // console.log(compareTime(time,yesterday))
          if( compareTime(time,yesterday) ){
              var id = todo[i].id,
                  theme_name = todo[i].get("theme_name"),
                  theme_count = todo[i].get("theme_count");
              // console.log(theme_name,id)
              result.push(new Model.themeModel(id,theme_name,theme_count));

          }
          if(result.length == 10){
              break;
          }
      }
      that.setData({themeArray:result});
    });    
    
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})



function compareTime(time1,time2){
    var oneday = 86400000;
    var day = (time1.getTime() - time2.getTime()) / oneday;
    // console.log(time1.getTime(), time2);
    // console.log(day);
    return (0<=day && day<=2);
}
function getDateStr(count)
{
    var date = new Date();
    date.setDate(date.getDate() + count);
    var year = date.getFullYear();
    var month = date.getMonth() ;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes= date.getMinutes();
    return new Date(year,month,day,hours,minutes)
}
