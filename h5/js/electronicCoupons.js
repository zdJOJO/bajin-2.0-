/**
 * Created by Administrator on 2016/8/17.
 */

var ticketArray = window.location.search.split('&');
var ticketObj = {
    staus: ticketArray[0].split('=')[1],
    ticketCode: ticketArray[1].split('=')[1],
    ticketId: ticketArray[2].split('=')[1],
    token: ticketArray[3].split('=')[1]
}
var token = ticketObj.token;
var ticketId = ticketObj.ticketId;

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
            $('#content >.img>.time').html('有效期' + new Date(result.data.startTime*1000).Formate_short() +
                '至' + new Date(result.data.endTime*1000).Formate_short());

            $('#content>li>.code').html(ticketObj.ticketCode);
            $('#content>li>.instructions').html(result.data.ticketDescription);
        }
        if(result.code == '666'){
            $.toast("帐号异常，请重新登录", "text");
        }
    },
    error: function (e) {

    }
});