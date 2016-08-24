/**
 * Created by Administrator on 2016/8/17.
 */

var ticketObjStr = window.location.search.split('=')[1];
var ticketObj = JSON.parse(ticketObjStr);
// ticketObj = {
//     token: 1,
//     staus: 0,
//     ticketId: 0,
//     aa: 0, //券码
//     bb: 0  //商家简介
// }


var token = ticketObj.token;
var ticketId = 44 ;

var his = window.location.pathname.split("/");
his = his[his.length-1];

token = 'bdee1ec7-3b72-4a1a-8bfb-cc4f2a746108';


function setCookie(c_name,value,expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie = c_name+ "=" +escape(value)+ ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
}
setCookie('token',token);



//获取电子券 详情
$.ajax({
    type: 'get',
    url: port + '/card/privilege/dticket/' + ticketId + '?token=' + token,
    dataType: 'json',
    success: function (result) {
        if(result.code == '211'){
            //品牌
            $.get( port + '/card/brand/' + result.data.brandId ,function (result) {
                $('#content >.img>img').attr('src',result.brandPic);
                $('#content >.img>.brand ,#content>li>.brand').html(result.brandName);
            });
            $('#content >.img>.benefit').html(result.data.title);
            $('#content >.img>.subTitle').html(result.data.subTitle);
            $('#content >.img>.time').html('有效期' + new Date(result.data.startTime*1000).Formate_short() + '至' + new Date(result.data.startTime*1000).Formate_short(result.data.endTime*1000));

            $('#content>li>.instructions').html(result.data.ticketDescription);
        }
        if(result.code == '666'){
            $.toast("帐号异常，请重新登录", "text");
        }
    },
    error: function (e) {

    }
});