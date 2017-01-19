const obj = {};
// 主题model，
obj.themeModel = function(theme_id,theme_name,theme_count){
    this.theme_id = theme_id;
    this.theme_count = theme_count;
    this.theme_name = theme_name;
}
// 选项model
obj.itemModel = function(item_name,ischoose,item_count,item_id,obj_id,theme_id){
    this.item_name = item_name;
    this.ischoose = ischoose;
    this.item_count = item_count;
    this.item_id = item_id;
    this.obj_id = obj_id;
    this.theme_id = theme_id;
}
// 投票情况model
obj.userItem = function(item_id,user_id,ischoose,theme_id){
    this.item_id = item_id;
    this.user_id = user_id;
    this.ischoose = ischoose;
    this.theme_id = theme_id;
}

module.exports = obj;