/**
 * Created by Administrator on 2016/7/19.
 */
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
var his = window.location.href.split("/");
his = his[his.length-1];

var consultationId = window.location.href.split("=")[1];



var itemId = window.location.href.split("=")[1];
var pageNum = 1;
var collectId = 0;
var commentStr = '';


//获取内容
var getHotDetail = function () {
    $.get( port + '/card/consult/' + consultationId + '?token=' + token,function (data) {
        $('title').html(data.title)
        $("h3").html(data.title);
        $("header>.abstr").html(data.abstr);
        $("header>.time").html(data.title);
        $("article>.content").html(data.content).append('<span class="readNum">阅读量：' + data.viewNum + '</span>');
        isCollected();
    });
}


getHotDetail();





//判断是否已被收藏
var isCollected = function () {
    $.get(port + '/card/collect/item?token=' + token + '&itemId=' + itemId + '&itemType=7',function (result) {
        if(result.code == 204){
            collectId = result.data.collectId;
            $('#collectionShare>.love').attr('src','imgs/iconfont-love_save.png');
        }else {
            collectId = '';
            $('#collectionShare>.love').attr('src','imgs/iconfont-love.png');
        }
    });
};



//每一页评论默认返回10条数据
var isPublishCtm = false;
var getCommentList = function (page) {

    $('#loading').show();
    $('#loading span').show();
    $('#moreComts').hide();

    if(isPublishCtm){
        $("article>.comments>.commentList").html('');
        commentStr = '' ;
    }

    $.get( port + '/card/comment/list?currentPage=' + page + '&type=' + 7 + '&itemId=' + itemId,function (data) {
        $("article>.comments>.totalNum").html('共' + data.rowCount + '条评论');
        if(data.list.length !=0){
            for(var i=0 ;i<data.list.length;i++){
                commentStr += '<li class="singleCmt">' +
                    '<img src="'+ data.list[i].user.headPic +'">' + '<span class="userName">' + data.list[i].user.userName + '</span>' +
                    '<p>'+ data.list[i].commentContent +'</p>' + '<span class="creatTime">'+ timeAgo((new Date().getTime()/1000)-data.list[i].createTime) +'</span></li>';
            }
            $("article>.comments>.commentList").append(commentStr);
            $('#loading').hide();
            $('#moreComts').show();
        }else {
            setTimeout('$("#loading").hide()',1000);
        }
    });
};

getCommentList(1);



//点击查看更多评论
$('#moreComts').click(function () {
    isPublishCtm = false;
    if(pageNum >= 1){
        pageNum++;
    }
    getCommentList(pageNum);
});



//发表评论
$("#search_cancel").click(function () {
    if(!token){
        $.modal({
            title: "评论失败",
            text: "登陆之后才能评论",
            buttons: [
                {text: "点击登录", onClick: function(){
                    window.location.href = "login.html?his=" + escape(his);
                }},
                { text: "取消", className: "default", onClick: function(){return;} },
            ]
        });
    }
    if($("#search_input").val().length > 140){
        $.alert("评论内容过长，请重新填写", "评论失败", function() {
            return;
        });
    }else {
        $.ajax({
            type: 'post',
            dataType: "json",
            contentType : "application/json",
            url: port + '/card/comment?token=' + token ,
            data: JSON.stringify({
                itemType: 7,
                itemId: itemId,
                commentContent: $("#search_input").val()
            }),
            success: function (result) {
                if(result.code == 201){
                    $.toast("发表评论成功");
                    $("#search_input").val('');
                    isPublishCtm = true;
                    getCommentList(1);
                }
            },
            error: function () {
                $.toast("发表评论失败", "cancel");
            }
        });
    }
});



//分享
$('#collectionShare>.share').click(function () {
    $("#shareMask").show();
});
$("#shareMask").click(function () {
    $("#shareMask").hide();
});




//收藏(添加/删除)   //   card/collect/{collectId}?token=e7120d7a-456b-4471-8f86-ac638b348a53
$('#collectionShare>.love').click(function () {
    if(token){
        var ajaxTypeStr = collectId ? 'delete' : 'post' ;
        var url = collectId ? port + '/card/collect/' +  collectId + '?token=' + token : port + '/card/collect?token=' + token  ;
        var data = collectId  ? '' : JSON.stringify({
            itemType: 7,
            itemId: itemId
        }) ;
        $.ajax({
            type: ajaxTypeStr,
            dataType: "json",
            contentType : "application/json",
            url:  url,
            data: data,
            success: function (result) {
                if(result.code == 201){
                    $('#collectionShare>.love').attr('src','imgs/iconfont-love_save.png');
                    $.toast("收藏成功");
                    isCollected();
                }else if(result.code == 203){
                    $.toast("取消收藏成功");
                    isCollected();
                }else {
                    $.toast("操作失败", "cancel");
                }
            },
            error: function () {
                $.toast("收藏失败", "cancel");
            }
        });
    }else {
        window.location.href = "login.html?his=" + escape(his);
    }
});




// time ago
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




// PC 、 安卓  、 ios  评论时候 判断


$('#search_input').focus(function () {
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;  //android终端
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);     //ios终端

    if(isAndroid > -1){
        $('footer').css({
            'bottom' : '8%',
        });
        $('footer form').css('z-index','100');
        $('footer a').css('z-index','100');
    }
});


$('#search_input').blur(function () {
    $('footer').css({
        'bottom' : '0',
    })
});





















