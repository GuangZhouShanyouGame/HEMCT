/*
* 数据库插入操作
*/

const AV = require('../../libs/av-weapp-min.js');
/*
* 功能：新增一个主题，
* 参数：theme_name: 字符串，主题名称
*/
function expandTheme(theme_name){
    var Theme = AV.Object.extend('TodoTheme');
    // 新建对象
    var theme = new Theme();
    // 设置 theme_name ， theme_count
    theme.set('theme_name',theme_name);
    theme.set('theme_count',0);
    return theme.save().then(function (todo) {
        // console.log('objectId is ' + todo.id);
        return todo.id;
    }, function (error) {
        console.error(error);
    });

}
/*
* 功能：新增一个选项
* 参数：item_name：字符串——选项名称,theme_id：主题id，新增一个主题后其的唯一标识符。
*/
function expandItem(item_name,theme_id){
    var Item = AV.Object.extend('TodoItem');
    // 新建对象
    var item = new Item();
    // 设置 item_name，theme_id，item_count
    item.set('item_name',item_name||"");
    item.set('theme_id',theme_id||"");
    item.set('item_count',0);
    return item.save().then(function (todo) {
        // console.log('objectId is ' + todo.id);
        return todo;
    }, function (error) {
        console.error(error);
    });
}

/*
* 功能：新增一个投票对象，记录投票情况，才可以统计24H内投票的情况
* 参数：item_id,user_id,ischoose,theme_id
*       user_id:  当前这个用户的id，通过这个id我们才能确认用户的投票情况
*       ischoose：是否投票
*/
function expandUserItem(item_id,user_id,ischoose,theme_id){
    var Item = AV.Object.extend('UserItem');
    // 新建对象
    var item = new Item();
    // 设置属性
    item.set('item_id',item_id||"");
    item.set('user_id',user_id||"");
    item.set('theme_id',theme_id||"");
    item.set('ischoose',ischoose||false);
    return item.save().then(function (todo) {
        // console.log('objectId is ' + todo.id);
        return todo;
    }, function (error) {
        console.error(error);
    });
}

 module.exports = {
     expandTheme:expandTheme,
     expandItem:expandItem,
     expandUserItem:expandUserItem
 }