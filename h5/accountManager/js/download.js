/**
 * Created by Administrator on 2016/12/29 0029.
 */
$(function(){
    var userId = GetQueryString('userId');
    var itemType = GetQueryString('itemType') || 26;
    var itemId = itemType==26 ? 0 : GetQueryString('itemId');

    var isWX = browserFn('wx'); //判断是否为微信内置浏览器
    var isIOS = terminalFn('IOS');  // 判断 是否是IOS终端
    var isAndroid = terminalFn('Android');
    if(isIOS&&isWX&&userId){
        $('#mask').show()
        if(isAndroid){
            $('#mask').css({
                'background' : 'url("../img/mask_Android.png") no-repeat;'
            });
        }
    }


    //创建客户经理邀请信息
    function creatManagerInviteInfoFn(userId,itemType,itemId,phone) {
        var data = {
            userId: userId,
            itemType: itemType,
            itemId: itemId,
            phone: phone
        };
        $.ajax({
            type: 'post',
            url: port + '/card/icbcManger/invite/info/create',
            contentType : 'application/json',
            data: JSON.stringify(data),
            success: function (res) {
                if(res.code=='201'){
                    console.log('success');
                }
            },
            error: function (e) {
                //todo
            }

        })
    };
    
    $('input').focus(function () {
        var height = $('#content').outerHeight();
        $('#content').scrollTop(height);
    });


    $('#getCode').click(function () {
        var phoneNum = $('#phone').val();
        var sec = 60;
        if(!phoneNum){
            $.alert("手机号不能为空");
            return ;
        }
        if(!(/^1(3|4|5|7|8)\d{9}$/.test(phoneNum))){
            $.alert("手机号码有误，请重填");
            return
        }

        //首先 判断手机号码是否已经注册
        $.ajax({
            type:"GET",
            url:port+"/card/isPhoneRegistered?phone="+phoneNum,
            success: function(data){
                if(data.status){
                    $.showLoading("app加载中");
                    //已被注册
                    window.location.href = 'bjzx://data?itemType=26&itemId=0&userId=' + userId;
                    //无app的情况
                    setTimeout(function () {
                        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.kting.baijinka';
                    },3000)
                    setTimeout(function () {
                        $.hideLoading();
                    },4000)
                }else {
                    var time = setInterval(timer, 1000);
                    function timer() {
                        if(sec > 0){
                            sec--;
                            $('#getCode').attr('disabled','true').html(sec + '秒后重新获取');
                        }else if(sec == 0){
                            clearInterval(time);
                            $('#getCode').removeAttr('disabled').html('获取验证码');
                        }
                    }
                    //获取验证码
                    $.ajax({
                        type: 'post',
                        dataType: "json",
                        url: port + '/card/tcaptcha/invite?phone='+ phoneNum ,
                        success: function (res) {
                            //todo
                        },
                        error: function (e) {
                            //todo
                        }
                    })
                }
            },
            error: function (e) {
                //todo
            }
        })
    });

    $('#download').click(function () {
        var phoneNum = $('#phone').val();
        var captcha =  $('#code').val();
        if(!phoneNum || !captcha){
            $.alert("手机号、验证码不能够为空");
            return
        }
        if(!(/^1(3|4|5|7|8)\d{9}$/.test(phoneNum))){
            $.alert("手机号码有误，请重新填写");
            return;
        }
        //验证码是否正确
        $.ajax({
            type: 'get',
            url: port + '/card/user/validate?captcha=' + captcha + '&phone=' + phoneNum,
            success: function (res) {
                if(res.status){
                    creatManagerInviteInfoFn(userId,26,0,phoneNum);
                    creatManagerInviteInfoFn(userId,itemType,itemId,phoneNum);
                    $.showLoading("app加载中");
                    //已被注册
                    window.location.href = 'bjzx://data?itemType=26&itemId=0&userId=' + userId;
                    //无app的情况
                    setTimeout(function () {
                        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.kting.baijinka';
                    },4000)
                }else {
                    $.alert("验证码有误，请重新填写");
                    return;
                }
            },
            error: function (e) {
                //todo
            }
        })
    })
});