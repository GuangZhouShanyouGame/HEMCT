const AV = require('../../libs/av-weapp-min.js');
function expandTheme(theme_name){
    var Theme = AV.Object.extend('TodoTheme');
    // 新建对象
    var theme = new Theme();
    // 设置名称
    theme.set('theme_name',theme_name);
    theme.set('theme_count',0);
    return theme.save().then(function (todo) {
        // console.log('objectId is ' + todo.id);
        return todo.id;
    }, function (error) {
        console.error(error);
    });

}
function expandItem(item_name,theme_id){
    var Item = AV.Object.extend('TodoItem');
    // 新建对象
    var item = new Item();
    // 设置名称
    item.set('item_name',item_name||"");
    item.set('theme_id',theme_id||"");
    item.set('item_count',0);
    return item.save().then(function (todo) {
        // console.log('objectId is ' + todo.id);
        return todo.id;
    }, function (error) {
        console.error(error);
    });
}

 module.exports = {
     expandTheme:expandTheme,
     expandItem:expandItem,
 }