// JavaScript Document
// 登录页面，登录成功，保存token到window.name中
// 结合使用window.name和window.location
$(function(){
    var his = window.location.search.split("=")[1];
    if(his=="changePassword.html"){
    	his = "index.html";
    }

	$('#user').focus(function () {
		$(this).addClass('active');
	});

	$('#pass').focus(function () {
		$(this).addClass('active');
	});

	$('#content').find('.cancel').click(function () {
		$(this).prev('input').val('');
	});


	// 登录绑定enter按键
	$('body').keydown(function (e) {
		if(e.keyCode == 13){
			$('#login').click();
		}
	});


	var Butlog = $("#login");
	//点击叉号的时候直接导向到index页面
	$("#index_But").click(function(){
		window.location.href = unescape(his);
	})
	Butlog.click(function(){
		window.name = "";
		var User=$("#user").val();
		var Pass=hex_md5($("#pass").val());
		if(User!=""&&Pass!=""){
			$.ajax({
				type:"POST",
				url: port + "/card/login?isWx=true",
				dataType:"json",
				contentType : "application/json;charset=UTF-8",  
				data:JSON.stringify({
					phone:User,
					password:Pass
					}),
				success:function(data){
					if(data.code==101){
						alert("用户名未注册或密码错误");
					}else{					
						console.log(data.message);
						// window.name=data.message;
						//微信保存cookie函数
						function setCookie(c_name,value,expiredays)
						{
							var exdate=new Date()
							exdate.setDate(exdate.getDate()+expiredays)
							document.cookie=c_name+ "=" +escape(value)+
							((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
						}
						//设置cookie
						setCookie("token",data.message,365);
						setCookie("phone",$("#user").val(),365);
						// setCookie("isgfhghg",data.message,365);
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
						return ""
						}
	                    if(window.history.length > 1){
							//测试  环境
							window.location.href = unescape(his);


                            // //正式环境  微信授权
                            // var token = getCookie("token");
                            // window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx886a1d1acb7084a5&redirect_uri=http%3a%2f%2fwww.winthen.com%2fcard%2fweixin%2fauthorize&response_type=code&scope=snsapi_base&state=" + token + "bjzx" + unescape(his) + "#wechat_redirect";

						}else{
							//测试  环境
	                    	window.location.href = "index.html";

							
                            // //正式环境  微信授权
                            // var token = getCookie("token");
                            // window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx886a1d1acb7084a5&redirect_uri=http%3a%2f%2fwww.winthen.com%2fcard%2fweixin%2fauthorize&response_type=code&scope=snsapi_base&state=" + token + "bjzx" + "index.html#wechat_redirect";

						}
					}
				}
	        });
		}	
	});

	$(".register").click(function(){
    	window.location.href="registered.html?his="+ his;
    });
    $(".forget_password").click(function(){
    	window.location.href="password.html?his="+ his;
    });

    (function() {
		history.replaceState(null, "首页", "index.html");
	    window.onpopstate = function(e) {
	      	//todo
	    };
	})();
});