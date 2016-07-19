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
var his = window.location.pathname.split("/");
his = his[his.length-1];

var consultationId = window.location.href.split("=")[1];



var itemId = 0 ;
var pagenum = 1;


//获取内容
var getCommentDetail = function () {
    $.get( port + '/card/consult/' + consultationId + '?token=' + token,function (data) {
        itemId = data.id;
        $("h3").html(data.title);
        $("header>.abstr").html(data.abstr);
        $("header>.time").html(data.title);
        $("article>.content").html(data.content).append('<span class="readNum">阅读量：' + data.viewNum + '</span>');
        getCommentList();
    });
}


//每一页评论默认返回10条数据
var getCommentList = function () {
    var commentStr = '';
    $.get( port + '/card/comment/list?currentPage=' + pagenum + '&type=' + 7 + '&itemId=' + itemId,function (data) {
        $("article>.comments>.totalNum").html('共' + data.rowCount + '条评论');

        for(var i=0 ;i<data.list.length;i++){
            commentStr += '<li class="singleCmt">' +
                '<img src="'+ data.list[i].user.headPic +'">' + '<span class="userName">' + data.list[i].user.userName + '</span>' +
                '<p>'+ data.list[i].commentContent +'</p>' + '<span class="creatTime">'+ timeAgo((new Date().getTime()/1000)-data.list[i].createTime) +'</span></li>' ;

        }
        $("article>.comments").append('<ul class="commentList">'+ commentStr +'</ul>');
    });
}





getCommentDetail();




//发表评论
$("#search_cancel").click(function () {
    if($("#search_input").val().length > 140){
        $.alert("评论内容过长，请重新填写", "评论失败", function() {
            return
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
                    getCommentDetail();
                }
            },
            error: function () {
                $.toast("发表评论失败", "cancel");
            }
        });
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
}



























