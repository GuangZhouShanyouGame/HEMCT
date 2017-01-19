const selectData =  require("../../controller/database/selectData.js");
const Model = require("../../model/model.js");
const timeHandle = require("../../controller/timeUtil/timeHandle.js");
const common = require("../../controller/common.js");


var app = getApp();

var obj = {
  themeArray:[],
  inputVal:""
}
/*
data字段说明：
初始值：
{
    search_Imgclass:"focus_search_image",  // 搜索框class属性
    isfocus:false,                         // 输入主题、选项框的聚焦情况
    isdisabled:false,                      // 确认添加主题、选项按钮是否可用情况
    themeArray:[],                         // 主题数组
    show_content:true,                     // 是否显示主题内容
    show_addtheme:false,                   // 是否显示添加框
    isNull:false,                          // 是否显示跳刀添加内容页面
    isNocontent:false,                     // 预留字段，如果没有就会显示，暂时无用
    inputVal:"",                           // 绑定搜索框内容
    addinputVal:"",                        // 绑定输入框内容
    inputdisabled:true,                    // 搜索框是否可用
}
*/

Page({
  data:{
    search_Imgclass:"focus_search_image", 
    isfocus:false,
    isdisabled:false,
    themeArray:[],
    show_content:true,
    show_addtheme:false,
    isNull:false,
    isNocontent:false,
    inputVal:"",
    addinputVal:"",
    inputdisabled:true,
  },
  // 进入详情：
  to_themeDetail:function(e){
    var id = e.currentTarget.dataset.id,
        name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '../detail/detail?id='+id+"&theme_name="+name,
    })
  },
  // 输入框事件
  tofocus:function(){
    this.setData({isfocus:true});
  },
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
  search_theme_handler:function(e){
    var val = e.detail.value;
    if(val==""){
      this.setData({
        themeArray:obj.themeArray,
        isNull:false,
        inputVal:""
      });
    }else{
      // 搜索内容
      var searchRes = common.searchTheme(val,obj.themeArray,"theme_name");
      
      if(searchRes.length == 0){
        this.setData({
          themeArray:searchRes,
          isNull:true,
          inputVal:val,
        });
      }else{
        this.setData({
          themeArray:searchRes,
          isNull:false,
          inputVal:val,
        });
      }
    }
    common.showContent(this);
  },
  // 显示添加主题
  show_addtheme:function(){
    var theme_name = this.data.inputVal;
    if(theme_name!=""){
      this.setData({inputdisabled:false});
    }else{
      this.setData({inputdisabled:true});
    }
    common.showAdd(this);
    this.setData({addinputVal:theme_name})
  },
  inputTheme:function(e){
    var val = e.detail.value;
    this.setData({addinputVal:val});
    if(val!=""){
      this.setData({inputdisabled:false});
    }else{
      this.setData({inputdisabled:true});
    }
  },
  // 操作按钮
  confirm:function(){
    var theme_name = this.data.addinputVal;
    if( !common.isrepeat(theme_name,obj.themeArray,"theme_name") ){
      wx.showToast({
        title: '该主题已经存在',
        icon: 'warn',
        duration: 500
      })
      return false;
    }
    if(theme_name.replace(/ /g,"") == ""){
      wx.showToast({
        title: '主题不能为空',
        icon: 'warn',
        duration: 500
      })
    }else if(theme_name.length >15){
      
    }else{
      wx.navigateTo({
        url: "../addtheme/addtheme?theme_name="+theme_name
      })
    }
  },
  cancle:function(){
    common.showContent(this);
    this.setData({
      themeArray:obj.themeArray,
      isNull:false,
      inputVal:""
    });
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000,
      mask:true
    })
    var that = this;
    // 更新24H内投票情况，并获取所有的主题内容。
    selectData.updateThemeCount().then(function(){
      selectData.querytheme().then(function(todo){
        // console.log(todo)
        // todo=[];
        if(todo.length ==0){
          that.setData({
            themeArray:[],
            isNocontent:true
          });
          return false;
        }
        var result = [],
            yesterday = timeHandle.getDateStr(-1),
            i = 0;    
            // console.log(timeHandle.getDateStr(-1))
            // console.log(i < todo.length)
        for (; i < todo.length; i++) {
            var time = todo[i].createdAt;
            // console.log(timeHandle.compareTime(time,yesterday))
            if( timeHandle.compareTime(time,yesterday) ){
                var id = todo[i].id,
                    theme_name = todo[i].get("theme_name"),
                    theme_count = todo[i].get("theme_count");
                result.push(new Model.themeModel(id,theme_name,theme_count));
            }
            if(result.length == 10){
                break;
            }
        }
        obj.themeArray =result;
        wx.hideToast();
        wx.stopPullDownRefresh();
        that.setData({
          themeArray:result,
          inputVal:"",
        });
      });
    })     
  },
  onReady:function(){
    // 页面渲染完成
    // 获取用户信息
    var app = getApp();
    app.getuserMsg().then(function(id){
      // app.globalData.user.user_id = id;
      wx.setStorageSync("user_id",id)
      // console.log( wx.getStorageSync('user_id'))
    })
  },

  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  // 下拉刷新，与onload一样。
  onPullDownRefresh:function(){
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000,
      mask:true
    })
    var that = this;
    selectData.updateThemeCount().then(function(){
      selectData.querytheme().then(function(todo){
        // console.log(todo)
        // todo=[];
        if(todo.length ==0){
          that.setData({
            themeArray:[],
            isNocontent:true
          });
          return false;
        }
        var result = [],
            yesterday = timeHandle.getDateStr(-1),
            i = 0;    
            // console.log(timeHandle.getDateStr(-1))
            // console.log(i < todo.length)
        for (; i < todo.length; i++) {
            var time = todo[i].createdAt;
            // console.log(timeHandle.compareTime(time,yesterday))
            if( timeHandle.compareTime(time,yesterday) ){
                var id = todo[i].id,
                    theme_name = todo[i].get("theme_name"),
                    theme_count = todo[i].get("theme_count");
                result.push(new Model.themeModel(id,theme_name,theme_count));
            }
            if(result.length == 10){
                break;
            }
        }
        obj.themeArray =result;
        wx.hideToast();
        wx.stopPullDownRefresh();
        that.setData({
          themeArray:result,
          inputVal:"",
        });
      });
    })

  },
  // 分享
  onShareAppMessage: function () {
    return {
      title: '十大热门',
      desc: '参与投票，选出自己心中的十大热门。',
      path: '../index/index'
    }
  }
})



