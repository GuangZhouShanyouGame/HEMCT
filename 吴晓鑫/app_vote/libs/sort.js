var obj = {
  search_result:[], 
  sort_result:[], 
  // 需要写一个排序
  /*
  * 功能：为我们的model数组排序，
  * param：arr: model数组，property：属性，我们进行排序的属性根据。
  * return：排好序的model数组
  */
  quickSort : function(arr,property) {
      var that = this;
  　　if (arr.length <= 1) { return arr; }
  　　var pivotIndex = Math.floor(arr.length / 2);
  　　var pivot_item = arr.splice(pivotIndex, 1)[0];
  　　var pivot = pivot_item[property];
  　　var left = [];
  　　var right = [];
  　　for (var i = 0; i < arr.length; i++){
        //  console.log(pivot,i,arr[i][property])
  　　　　if (arr[i][property] > pivot) {
  　　　　　　left.push(arr[i]);
  　　　　} else {
  　　　　　　right.push(arr[i]);
  　　　　}
  　　}
      
  　　return that.quickSort(left,property).concat([pivot_item], that.quickSort(right,property));
  },
  rankSork: function(arr){
    this.sort_result = this.quickSort(arr,"theme_count");
    for(let i=0; i<this.sort_result.length ; i++){
      this.sort_result[i].rank = i+1;
    }
    return this.sort_result;
  }
}

module.exports = obj;