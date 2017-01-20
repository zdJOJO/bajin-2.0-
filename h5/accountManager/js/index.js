/**
 * Created by Administrator on 2016/12/27 0027.
 */
$(function(){
    var isApp = false;
//Android
    try {
        javascript: window.handler.isNativeApp();    //Android
        javascript: window.handler.getNativeAppToken();    //Android
        if(window.handler.getNativeAppToken() &&  window.handler.isNativeApp()){
            var token = window.handler.getNativeAppToken();
            isApp = true;
        }else {
            //todo
        }
    }catch (e){
        //todo
    }
//IOS
    try {
        if(getNativeAppToken() && isNativeApp()){
            var token = getNativeAppToken();
        }else {
            //todo
        }
    }catch (e){
        //todo
    }

    if(!token && isApp){
       window.location.href = '../../login.html';
    }
    //查询单个客户经理  http://121.196.232.233/card/icbcManger/check?token={token}
    $.ajax({
        type: 'get',
        url: port + '/card/icbcManger/check?token=' + token ,
        success: function (res) {
            var sharePic = '../img/share.png';
            var headPicPath = res.data.userModel.headPic || '../imgs/headPic_default.png';
            //邀请名额
            $.get(port+'/card/icbcManger/invite/result?userId='+res.data.userModel.userId+'&currentPage=1&size=10',function (data) {
                var str = '<div class="headPicBox"><img src="'+headPicPath+'"></div>' +
                    '<h2>'+res.data.userModel.userName+'</h2><ul class="info">' +
                    '<li><span>'+res.data.inviteCode+'号员工</span></li><li><span>'+res.data.bankInfo+'</span></li></ul>' +
                    '<ul class="num"><li class="list"><span>'+data.data.rowCount+'</span><span>邀请</span></li>' +
                    '<li class="rank"><span>未开放</span><span>排行榜</span></li></ul>' +
                    '<a id="showBox" href="javascript:;" class="open-popup" data-target="#codeBox">邀请客户</a>';
                $('#main').html(str);
                var height =  $('#main').find('.info').outerHeight();
                $('#main').find('.info li').css('height',height);

                $('#main').find('.list').click(function () {
                    window.location.href = 'inviteRecord.html?userId='+res.data.userId;
                });
                $('#main').find('.rank').click(function () {
                    $.alert('暂未开放，敬请期待')
                    //window.location.href = 'ranking.html';
                });

                $('#codeBox').find('.info').children('span:first-child').html(res.data.userModel.userName);
                $('#codeBox').find('.info').children('span:last-child').html(res.data.bankInfo);
            });

            //获取二维码
            $.ajax({
                type: 'post',
                dataType: "json",
                contentType : "application/json",
                url: port + '/card/qrcode/encode',
                data: JSON.stringify({ converted:  portStr+'/accountManager/download.html?userId='+res.data.userModel.userId }),
                success: function (data) {
                    $('#code').attr('src',data.data.url)
                },
                error: function (e) {
                    //todo
                }
            })

            $('#invite').click(function () {
                //调用android ios 借口
                // showShareBoard(title,subTitle,imgPath,url)
                try {
                    javascript: window.handler.showShareBoard(
                        '白金尊享',
                        '工银客户经理' + res.data.userModel.userName+'邀请您加入白金尊享',
                        sharePic,
                        portStr+'/accountManager/download.html?userId='+res.data.userModel.userId
                    );    //Android
                }catch (e){
                    //todo
                }
                try {
                    showShareBoard(
                        '白金尊享',
                        '工银客户经理' + res.data.userModel.userName+'邀请您加入白金尊享',
                        sharePic,
                        portStr+'/accountManager/download.html?userId='+res.data.userModel.userId
                    );   //IOS
                }catch (e){
                    //todo
                }
            });
        },
        error: function (e) {
            //todo
        }
    })
});