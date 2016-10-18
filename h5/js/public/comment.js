var token = "";
//获取存在于cookie中的token值
function getCookie(c_name)
{
    if (document.cookie.length>0)
    {
        c_start=document.cookie.indexOf(c_name + "=")
        if (c_start!=-1)
        {
            c_start=c_start + c_name.length+1
            c_end=document.cookie.indexOf(";",c_start)
            if (c_end==-1) c_end=document.cookie.length
            return unescape(document.cookie.substring(c_start,c_end))
        }
    }
    return undefined;
}
token = getCookie("token");

//获取页面的名称
var his = window.location.href.split("/");
his = his[his.length-1];

// 判断 是否  安卓  IOS
var u = navigator.userAgent;
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;  //android终端
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);     //ios终端


$.toast.prototype.defaults.duration = 500;


var array = window.location.search.split('&');
var type = array[0].split("=")[1];
var itemId = array[1].split("=")[1];

var pageNum = 1;
var str = '';
var isPublishCtm = false;





//TYPE: 1活动  2白金人生 3商品 4抽奖 5乐享 6url 7咨询 8工会服务 9热点 10反馈
// 身份TYPE: 用户 0 ,总管理员 1, 运营人员 2, 内容管理 3, 财务主管 4, 数据分析 5, 客户服务 6, 商户 7

//分页获取 评论
var getCommentList = function (page) {

    $('#loading').show();
    $('#loading span').show();
    $('#moreComts').hide();

    var url =  port + '/card/comment/list?currentPage=' + page + '&type=' + type + '&itemId=' + itemId;

    if(isPublishCtm){
        $('section>.commentList').html('');
        isPublishCtm = false;
    }

    str = '';
    $.get(url , function (data) {
        $("article>.comments>.totalNum").html('共' + data.rowCount + '条评论');
        if(data.list.length != 0){
            var headPicStr = '';
            var nameStr = '';
            var customerServiceStr = '';
            for(var i=0 ;i<data.list.length;i++){
                if(data.list[i].user){
                    headPicStr = data.list[i].user.headPic || portStr + '/imgs/headPic_default.png' ;
                    nameStr = data.list[i].user.userName || '';
                }else {
                    headPicStr = portStr + '/imgs/headPic_default.png';
                    nameStr = '';
                }
                if(data.list[i].commentModelList.length > 0){
                    customerServiceStr = '<div class="customerService">' +
                        '<h3>客服回复</h3><span class="cmt">'+ data.list[i].commentModelList[0].commentContent +'</span>' +
                        '<span class="time">'+ timeAgo((new Date().getTime()/1000)-data.list[i].commentModelList[0].createTime) +'</span></div>';
                }
                str += '<div class="singleCmt">' +
                    '<div class="imgBox"><img data-original="'+ headPicStr +'"></div>' +
                    '<div class="cmtContent">' +
                    '<li class="userName">' + nameStr + '</li>' +
                    '<li class="commentContent">'+ data.list[i].commentContent +'</li>' +
                    '<li class="creatTime">'+ timeAgo((new Date().getTime()/1000)-data.list[i].createTime) +'</li></div>'+customerServiceStr+'</div>';
            }
            $("article>.comments>.commentList").append(str);
            $('#loading').hide();
            $('#moreComts').show();

            //图片预加载
            $(".commentList img").lazyload({
                placeholder : portStr + '/imgs/headPic_default.png', //用图片提前占位
                effect: "fadeIn", // 载入使用何种效果
                effectspeed: 250,
                threshold: 800,
                event: 'scroll'
            });
        }else {
            setTimeout('$("#loading").hide()',700);
        }
    })
};

getCommentList(1);



//发表评论
var publishComment = function () {
    if(!token){
        $.modal({
            title: "提示",
            text: "请登录后再评论",
            buttons: [
                { text: "点击登录", onClick: function(){ window.location.href = "login.html?his=" + escape(his);} },
                { text: "确定", className: "default", onClick: function(){} },
            ]
        });
        return;
    }
    if(!$("#commentContent").val()){
        $.alert("请填写后再评论", "评论失败", function() {
        });
        return;
    }
    if($("#commentContent").val().length > 200){
        $.alert("评论内容过长，请重新填写", "评论失败", function() {
        });
        return;
    }else {

        $.ajax({
            type: 'post',
            dataType: "json",
            contentType : "application/json",
            url: port + '/card/comment?token=' + token ,
            data: JSON.stringify({
                itemType: type,
                itemId: itemId,
                commentContent: $("#commentContent").val()
            }),
            success: function (result) {
                if(result.code == 201){
                    $.toast("发表评论成功", function() {
                        $('footer').css('height','7%');
                        $("#commentContent").val('');
                        isPublishCtm = true;
                        getCommentList(1);
                    });
                }
            },
            error: function () {
                $.toast("发表评论失败", "cancel");
            }
        });
    }
};


$("#publishCmt").click(function () {
    publishComment();
})




//点击加载更多
//点击查看更多评论
$('#moreComts').click(function () {
    isPublishCtm = false;
    if(pageNum >= 1){
        pageNum++;
    }
    getCommentList(pageNum);
});



var timeAgo = function (preTime) {
    if(preTime<60){
        return parseInt(preTime)+"秒前";
    }else if((preTime/60)<60){
        return parseInt(preTime/60)+"分钟前";
    }else if((preTime/3600)<24){
        return parseInt(preTime/3600)+"小时前";
    }else if((preTime/3600/24)<30){
        return parseInt(preTime/3600/24)+"天前";
    }else if((preTime/3600/24/30)<12){
        return parseInt(preTime/3600/24/30)+"月前";
    }else{
        return parseInt(preTime/3600/24/365)+"年前";
    }
};







// 评论时候 IOS 安卓 不同, 在这里做判断
$("#commentContent").focus(function () {
    if(isAndroid > -1 ){
        $('footer').css('height','20%');
    }
}).blur(function () {
    $("#publishCmt").css('color','#ccc');
});

if(isAndroid > -1 ){
    $('footer.nav').css('height','8%');
}

