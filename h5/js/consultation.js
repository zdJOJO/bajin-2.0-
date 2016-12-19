/**
 * Created by Administrator on 2016/7/19.
 */


// 判断 是否安卓  IOS
var u = navigator.userAgent;
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;  //android终端
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);     //ios终端



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

//设置为1s
$.toast.prototype.defaults.duration = 1000;

//分享时候 传当前页面的url 和 对象obj
get_url(window.location.href);
var shareObj = {
    title: '',
    desc: '',
    link: '',
    imgUrl: ''
}




//  咨询/工行服务/热点    id是唯一的,根据type区别 三个模块判断
var itemId = window.location.href.split("=")[1];
//分享时候，为新手机打开会在URL后面多一串字符串，
//比如： test.winthen.com/bcard/consultation.html?id=18&from=groupmessage&isappinstalled=0
if(itemId.indexOf("&") > 0){
    itemId = itemId.split("&")[0];
}

//跳转预览界面
if(window.location.search.indexOf('cms') > 0 ){
    window.location.href = 'consultation_preview.html?id=' +  itemId;
}

var typeNum = -1;
var commentStr = '';
// 分享的id  唯一
var collectId = 0;


//获取内容
var getDetail = function () {
    $.get(port + '/card/consult/' + itemId + '?token=' + token,function (data) {

        shareObj.title = data.title || '';
        shareObj.desc = data.subtitle || '';
        shareObj.link = window.location.href;
        shareObj.imgUrl = data.pic;

        //调用分享借口
        jsSdkApi('share',shareObj);

        typeNum = data.type;

        $('title').html(data.title);
        $("header h3").html(data.title);
        $("header>.abstr").html(data.abstr);
        $("header>.time").html( new Date(data.createTime*1000).Formate());
        $("article>.content").html(data.content).append('<span class="readNum">阅读量：' + data.viewNum + '</span>');
        isCollected(typeNum);
        // getCommentList(1);
        getComment(itemId)
    });
}

getDetail();


//判断是否已被收藏
var isCollected = function (type) {
    var url =  port + '/card/collect/item?token=' + token + '&itemId=' + itemId + '&itemType=' + type;
    $.get( url,function (result) {
        if(result.code == 204){
            collectId = result.data.collectId;
            $('#collectionShare>.love').attr('src','imgs/iconfont-love_save.png');
        }else {
            collectId = 0;
            $('#collectionShare>.love').attr('src','imgs/iconfont-love.png');
        }
    });
};


//每一页评论默认返回10条数据
var isPublishCtm = false;


//获取评论
function  getComment(itemId) {
    $.ajax({
        type:"get",
        url: port + '/card/comment/list?currentPage=' + 1 + '&type=' + typeNum + '&itemId=' + itemId,
        success: function (result) {
            if(result.list.length > 0) {
                $("#comment").find('.cmtNUm').html('评论 ' + result.rowCount + '条');
                var headPicStr = result.list[0].user.headPic || portStr + '/imgs/headPic_default.png';
                $('#comment').find('.list').show().html('<img src="'+ headPicStr +'">' +
                    '<div class="customerCmt"><span>'+ result.list[0].user.userName +'</span>' +
                    '<p>' + result.list[0].commentContent + '</p></div>');
            }else {
                $('#comment>.box').css({'margin-top': '0.02rem'});
            }
            //查看更多评论
            $('#moreComts').show();
            $('#moreComts').click(function () {
                window.location.href = 'comment.html?type=' + typeNum + '&itemId=' + itemId;
            });
        },
        error: function (e) {
            //todo
        }
    });
};


// //点击查看更多评论
// $('#moreComts').click(function () {
//     isPublishCtm = false;
//     if(pageNum >= 1){
//         pageNum++;
//     }
//     getCommentList(pageNum);
// });



// //发表评论
// $("#publishCmt").click(function () {
//     if(!token){
//         $.modal({
//             title: "评论失败",
//             text: "登录之后才能评论",
//             buttons: [
//                 {text: "点击登录", onClick: function(){
//                     window.location.href = "login.html?his=" + escape(his);
//                 }},
//                 { text: "取消", className: "default", onClick: function(){return;} },
//             ]
//         });
//     }else {
//         if(!$("#commentContent").val()){
//             $.alert("请填写后再评论", "评论失败", function() {
//             });
//             return;
//         }
//
//         if($("#commentContent").val().length > 140){
//             $.alert("评论内容过长，请重新填写", "评论失败", function() {
//             });
//             return;
//         }else {
//             $.ajax({
//                 type: 'post',
//                 dataType: "json",
//                 contentType : "application/json",
//                 url: port + '/card/comment?token=' + token ,
//                 data: JSON.stringify({
//                     itemType: typeNum,
//                     itemId: itemId,
//                     commentContent: $("#commentContent").val()
//                 }),
//                 success: function (result) {
//                     if(result.code == 201){
//                         $.toast("发表评论成功", function() {
//                             $('footer').css('height','7%');
//                             $("#commentContent").val('');
//                             isPublishCtm = true;
//                             // getCommentList(1);
//                             getComment(itemId)
//                         });
//                     }
//                     if(result.code == 666){
//                         $.modal({
//                             title: "评论失败",
//                             text: "当前用户错误，请重新登录",
//                             buttons: [
//                                 {text: "点击登录", onClick: function(){
//                                     window.location.href = "login.html?his=" + escape(his);
//                                 }},
//                                 { text: "取消", className: "default", onClick: function(){return;} },
//                             ]
//                         });
//                     }
//                 },
//                 error: function () {
//                     $.toast("发表评论失败", "cancel");
//                 }
//             });
//         }
//     }
// });



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
        var ajaxTypeStr = collectId>0 ? 'delete' : 'post' ;
        var url = collectId>0 ? port + '/card/collect/' +  collectId + '?token=' + token : port + '/card/collect?token=' + token  ;
        var data = collectId>0 ? '' : JSON.stringify({
            itemType: typeNum,
            itemId: itemId
        });

        $.ajax({
            type: ajaxTypeStr,
            dataType: "json",
            contentType : "application/json",
            url:  url,
            data: data,
            success: function (result) {
                if(result.code == 201){
                    $('#collectionShare>.love').attr('src','imgs/iconfont-love_save.png');
                    $.toast("收藏成功",function () {
                        isCollected();
                    });
                }else if(result.code == 203){
                    $('#collectionShare>.love').attr('src','imgs/iconfont-love.png');
                    $.toast("取消收藏成功",function () {
                        isCollected();
                    });
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




// // time ago
// var timeAgo = function (preTime) {
//     if(preTime<60){
//         return parseInt(preTime)+"秒前";
//     }else if((preTime/60)<60){
//         return parseInt(preTime/60)+"分钟前";
//     }else if((preTime/3600)<24){
//         return parseInt(preTime/3600)+"小时前";
//     }else if((preTime/3600/24)<30){
//         return parseInt(preTime/3600/24)+"天前";
//     }else if((preTime/3600/24/30)<12){
//         return parseInt(preTime/3600/24/30)+"月前";
//     }else{
//         return parseInt(preTime/3600/24/365)+"年前";
//     }
// };




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




