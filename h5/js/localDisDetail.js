/**
 * Created by Administrator on 2016/10/9.
 */
$(document).ready(function(){
    token = getCookie("token");//便于本地测试
    //获取页面的名称
    var his = window.location.pathname.split("/");
    his = his[his.length-1];
    var productId = window.location.search.split('=')[1];

    //获取单个产品的详细信息
    $.ajax({
        type: 'get',
        url: port + '/card/product/' + productId ,
        success: function (result) {
            console.log(result)
        },
        error: function (e) {
            //todo
        }
    });

});