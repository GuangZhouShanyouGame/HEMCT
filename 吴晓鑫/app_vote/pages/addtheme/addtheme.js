const insert =  require("../../controller/database/insert.js");
const common = require("../../controller/common.js");
const updateData =  require("../../controller/database/update.js");
const selectData =  require("../../controller/database/selectData.js");
const model = require("../../model/model.js");
const sort = require("../../libs/sort.js");

// pages/addtheme/addtheme.js
var obj = {
  itemArray:[]
}
var app = getApp();
/*
data字段说明：
初始值：
{
    search_Imgclass:"focus_search_image",  // 搜索框class属性
    isfocus:false,                         // 输入主题、选项框的聚焦情况
    theme_id:"",                           // 存放theme_id
    isdisabled:false,                      // 确认添加主题、选项按钮是否可用情况
    itemArray:[],                          // 选项数组
    show_content:true,                     // 是否显示主题内容
    show_addtheme:false,                   // 是否显示添加框
    isNull:false,                          // 是否显示跳刀添加内容页面
    inputVal:"",                           // 绑定搜索框内容
    addinputVal:"",                        // 绑定输入框内容
    ischoose_src:"https://dn-ehldtiim.qbox.me/26fbe00ed987d4d8ea07.png",   //点赞投标的路径
    inputdisabled:true,                    // 搜索框是否可用
}
*/
Page({
  data:{
    search_Imgclass:"focus_search_image",
    isfocus:false,
    theme_id:"",
    show_content:true,
    show_addtheme:false,
    isdisabled:false,
    isNull:true,
    inputVal:"",
    addinputVal:"",
    itemArray:[],
    ischoose_src:"https://dn-ehldtiim.qbox.me/26fbe00ed987d4d8ea07.png",
    inputdisabled:true,
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
  search_item_handler:function(e){
    var val = e.detail.value;
    if(val==""){
      var limitten = common.limitten(obj.itemArray);
      this.setData({
        itemArray:limitten,
        inputVal:"",
      });
      if(obj.itemArray.length>=10){
        this.setData({isNull:false});
      }else{
        this.setData({isNull:true});
      }
    }else{
      var searchRes = common.searchTheme(val,obj.itemArray,"item_name");
      if(searchRes.length == 0){
        this.setData({
          itemArray:searchRes,
          isNull:true,
          inputVal:val,
        });
      }else{
        this.setData({
          itemArray:searchRes,
          isNull:false,
          inputVal:val,
        });
      }
    }

  },
  // 显示添加主题
  show_additem:function(){
    var item_name = this.data.inputVal;
    if(item_name!=""){
      this.setData({inputdisabled:false});
    }else{
      this.setData({inputdisabled:true});
    }
    common.showAdd(this);
    this.setData({addinputVal:item_name})
  },
  inputItem:function(e){
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
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000,
      mask:true
    })
    var that = this;
    var item_name = this.data.addinputVal,
        id = this.data.theme_id,
        that = this;
    if( !common.isrepeat(item_name,obj.itemArray,"item_name") ){
      wx.showToast({
        title: '该选项已经存在',
        icon: 'warn',
        duration: 500
      })
      return false;
    }
    if(item_name.replace(/ /g,"") == ""){
      wx.showToast({
        title: '选项不能为空',
        icon: 'warn',
        duration: 500
      })
    }else if(item_name.length >15){
      // wx.showToast({
      //   title: '选项名称太长，超过15个字符',
      //   icon: 'warn',
      //   duration: 500
      // })
    }else{
      insert.expandItem(item_name,id).then(function(item){
        // 插入选项
        var user_id = wx.getStorageSync('user_id'),
            theme_id = that.data.theme_id;
        console.log(user_id,theme_id)
        insert.expandUserItem(item.id,user_id,false,theme_id).then(function(u_item){
          var temp = new model.itemModel(item_name,false,0,item.id,u_item.id,id);
          // console.log(temp);
          obj.itemArray.push(temp);
          // 根据搜索内容
          if(that.data.inputVal == ""){
            //限制10个
            var limitten = common.limitten(obj.itemArray);
            that.setData({
              itemArray:limitten,
              inputdisabled:true,
              addinputVal:"",
            });
            if(obj.itemArray.length>=10){
              that.setData({isNull:false});
            }else{
              that.setData({isNull:true});
            }
          }else{
              that.setData({
                itemArray:[temp],
                isNull:false,
                addinputVal:"",
                inputdisabled:true,
              });
          }          
          // console.log(item,obj.itemArray);
          common.showContent(that);
          wx.hideToast();
        })
      });
    }

  },
  cancle:function(){
    common.showContent(this);
  },
  choose:function(e){
    var thisObj = e.currentTarget.dataset.obj,
        id = e.currentTarget.dataset.tid,
        index = e.currentTarget.dataset.index,
        objid = e.currentTarget.dataset.objid,
        arr = this.data.itemArray;
    var inObj_index = common.search(obj.itemArray,thisObj);
    console.log(thisObj)
    obj.itemArray[inObj_index].ischoose = false;
    obj.itemArray[inObj_index].item_count -= 1;
    // arr[index].ischoose = false;
    // arr[index].item_count -= 1;
    this.setData({itemArray: arr});
    updateData.updateIschoose(false,objid);
  },
  nochoose:function(e){
    var thisObj = e.currentTarget.dataset.obj,
        id = e.currentTarget.dataset.tid,
        index = e.currentTarget.dataset.index,
        objid = e.currentTarget.dataset.objid,
        arr = this.data.itemArray;
    var inObj_index = common.search(obj.itemArray,thisObj);
    console.log(thisObj)
    obj.itemArray[inObj_index].ischoose = true;
    obj.itemArray[inObj_index].item_count += 1;
    // arr[index].ischoose = true;
    // arr[index].item_count += 1;
    this.setData({itemArray: arr});
    updateData.updateIschoose(true,objid);
  },

  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that =this;
    wx.setNavigationBarTitle({
      title: options.theme_name,
    })
    // 添加主题
    insert.expandTheme(options.theme_name).then(function(theme_id){
      // console.log(theme_id)
      that.setData({theme_id:theme_id})
    })
  },
  onReady:function(){
    // 页面渲染完成
    
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
  onPullDownRefresh:function(){
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000,
      mask:true
    })
    var that =this;
    var user_id = wx.getStorageSync('user_id');

    selectData.queryitem(that.data.theme_id,user_id).then(function(result_array){
      result_array = sort.quickSort(result_array,"item_count");
      // console.log(result_array)
      obj.itemArray = result_array;
      //限制10个
      var limitten = common.limitten(obj.itemArray);
      that.setData({
        itemArray:limitten,
        inputVal:"",
      });
      if(obj.itemArray.length>=10){
        that.setData({isNull:false});
      }else{
        that.setData({isNull:true});
      }
      that.setData({itemArray:result_array});
      wx.hideToast();
      wx.stopPullDownRefresh();
    }).catch(function(err){
      console.error(err);
    })
  }
})