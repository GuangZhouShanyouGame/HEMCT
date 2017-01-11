const obj = {};
obj.themeModel = function(theme_id,theme_name,theme_count){
    this.theme_id = theme_id;
    this.theme_count = theme_count;
    this.theme_name = theme_name;
}

module.exports = obj;