
$(function(){	
	var captcha;
	var his = window.location.search.split("=")[1]?window.location.search.split("=")[1]:"index.html";
	$("#gb_but a img").click(function(){
			window.location.href = "login.html?his="+his;
		});
	$("#getCaptcha").click(function(){	
		var phoneNum=$("#phoneNum").val();
		var regBtn=$("#regist-btn");
		var checked=checkMobile(phoneNum);		
			if(checked){
				$.ajax({
					type:"GET",
					url:port+"/card/isPhoneRegistered?phone="+phoneNum,
					success: function(data){
						if(data.status){
							alert("该手机号已被注册,请更换手机号注册")
						}else{

				$.ajax({
					type:"POST",
					url:port+"/card/tcaptcha?phone="+phoneNum+"",
					success:function(data){
						console.log(data);
						var getCaptcha=$("#getCaptcha");
						var i=60;
						var timer=setInterval(function(){
							if(i!=0){
								i--;
								getCaptcha.html(i+'s后重新获取');
								getCaptcha.attr('disabled',"true");
							}else{
								clearInterval(timer);
								getCaptcha.html('重新获取');
								getCaptcha.removeAttr('disabled');
							}
						},1000);
						//保存的是验证码
						captcha=data.captcha;
							regBtn.click(function(){
								var phoneNum=$("#phoneNum").val();
								var pass=hex_md5($("#passWord").val());
								
								var captchabox=$("#captcha").val();
								// var repass=hex_md5($("#rePass").val());
								if(captchabox==captcha){//验证码正确
									// if(pass==repass){//两次的密码一致								
										if($("#ty").attr("checked")){
											$.ajax({
												type:"POST",
												dataType:"json",
												contentType : "application/json;charset=UTF-8", 
												url:port+"/card/user?captcha="+captcha,
												data:JSON.stringify({
													userName:"",
													password:pass,
													phone:phoneNum,
													userRole:0,
													headPic:"",
													gender:01,
													signature:"",
													openId:"",
													clientId:""
												
												}),
												success:function(data){
										            if(data.code==201){
														alert("注册成功");
														//逻辑就是这样，我要修改完密码的时候，顺便直接登陆再获取token，不懂为何要这样，反正现在只能这样
														$.ajax({    
															type:"POST",
															url:port+"/card/login",
															dataType:"json",
															contentType : "application/json;charset=UTF-8",  
															data:JSON.stringify({
																phone:phoneNum,
																password:pass
																}),
																success:function(data){
																console.log(data);
																function setCookie(c_name,value,expiredays)
																{
																	var exdate=new Date()
																	exdate.setDate(exdate.getDate()+expiredays)
																	document.cookie=c_name+ "=" +escape(value)+
																	((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
																}
																//设置cookie
																setCookie("token",data.message,365);
																// window.name = data.message;
																// window.location.href="index.html";
																window.location.href=unescape(his);
																}
														});														
													}else{
														alert("验证码已过期，请重新获取");
														}
												},
												error:function(error){
													console.log(error)
												}
											});
										}else{
											alert("是否同意用户协议");
										}		
																				
									// }else{
									// 	alert("两次输入的密码不一致");
									// }								
								 }else{
									alert("验证码错误");
								}						
						});
					}
				});
				}
					}
				});
				}else{
					alert("请填写正确的手机号码");
				}
	});
	//注册
})

function checkMobile(str) {
    var re = /^[1][35847][0-9]{9}$/;
    if (re.test(str)) {
        return true;
    } else {
        return false;
    }
}
