



$(function(){    
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
	//没有绑定银行卡的时候提示添加银行卡
   	var his = window.location.pathname.split("/");
	his = his[his.length-1];



	if(his=="changePassword.html"){
		his="index.html";
	}

	//意见反馈
	$("#feedBack").click(function(){
		window.location.href="feedback.html";
	});

	//用户协议
	$('#userAgreement').click(function () {
		window.location.href = 'http://www.winthen.com/test/agreement.html';
	});




	//修改密码需要跳转页面与处理忘记密码的思路是一样的
	$("#changePassword").bind("click",function(){
		window.location.href = "password.html?his="+ his;
	});





	//处理注销的逻辑
	$("#logOut").click(function(){



		$.confirm("确认退出该帐号", function() {
			//点击确认后的回调函数
			//登出的时候告诉后台信息
			$.ajax({
				type:"post",
				url:port+"/card/login/drop?token="+token,
				dataType:"json",
				contentType : "application/json;charset=UTF-8",
				data:JSON.stringify({
				}),
				success:function(data){
					console.log(data);
				},
				error:function(data){
					console.log(data);
				}
			});
			//清除cookie
			function deleteCookie(c_name){
				var exp = new Date();
				exp.setDate(exp.getDate() - 1);
				document.cookie = c_name+ "=" + ";expires=" + exp.toUTCString();
			}
			deleteCookie("token");
			// alert(document.cookie);
			window.location.href="login.html?his="+his;
		}, function() {
			//点击取消后的回调函数
		});
	});



    (function() {
        history.replaceState(null, "首页", "index.html");
	    window.onpopstate = function(e) {
	    };
	})();



});