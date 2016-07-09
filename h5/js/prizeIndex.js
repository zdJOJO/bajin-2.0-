$(function () {
    $("#prizeBut").click(function(){
        // var token= window.location.search.split('=')[1];
        $("#divShow").show();
        $("#phoneValidation").show();
        $("body").css("position","fixed");
        // clearCookie("token");
        $("#confirm").click(function() {
            var Phone=$("#phone").val();
            $.ajax({
                type:"GET",
                url:"http://www.winthen.com:9292/card/isPhoneCarded?phone="+Phone,
                contentType : "application/json",
                success:function(data){
                    console.log('data = '+data.isCarded);
                    if(data.isCarded){       //跳转到抽奖界面
                        /*console.log("token = "+data.token);
                        //设置cookie
                        setCookie("token",data.token,365);
                        location.href = "payIFrame.html?lottery=lottery";*/
                        window.location.href = "fareDraw.html?token="+data.token;
                    }else{//跳转到银行卡管理界面
                        //设置cookie
                        if(data.token==''){
                            alert("此用户不存在，请确认手机号");
                            return;
                        }
                        setCookie("token",data.token,365);
                        location.href = "payIFrame.html?lottery=lottery";
                    }
                }
            })

        })


    })
    $("#divShow,#cancel").click(function(){
        $("#phoneValidation").hide();
        $("#divShow").hide();
        $("body").css("position","static");

    })
    function setCookie(c_name,value,expiredays)
    {
        var exdate=new Date()
        exdate.setDate(exdate.getDate()+expiredays)
        document.cookie=c_name+ "=" +escape(value)+
            ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
    }
    //清除cookie
    function clearCookie(name) {
        setCookie(name, "", -1);
    }

})