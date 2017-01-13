// JavaScript Document
$(function(){
	// var zc_content=$("#zc_content").eq(0);
	// var zc_content2=$("#zc_content2").eq(0);
	// zc_content.hide(),
	// zc_content2.show();
	var captcha;
	var his = window.location.search.split("=")[1]?window.location.search.split("=")[1]:"index.html";
	$("#gb_but").click(function(){
		window.location.href="login.html?his="+his;
	});
	$('#getCaptcha').click(function(){
		var phone=$('#phoneNum').val();
		var checked=checkMobile(phone);
		if(checked){
			$.ajax({
				type:"GET",
				url:port+"/card/isPhoneRegistered?phone="+phone,
				success:function(data){
					if(data.status){
						$("#getCaptcha").attr('disabled',"true");
						var getCaptcha=$('#getCaptcha');
						var i=60;
						var timer=setInterval(function(){
							if(i!=0){
								i--;
								getCaptcha.html(i+'s后重新获取');
							}else{
								clearInterval(timer);
								$('#getCaptcha').html('重新获取');
								$('#getCaptcha').removeAttr('disabled');
							}
						},1000);

						$.ajax({
							type:"POST",
							url:port+"/card/tcaptcha?phone="+phone+"&version=v2",
							success:function(data){
								console.log("进入获取验证码阶段");
								$("#next").click(function(){
									var zc_content=$("#zc_content").eq(0);
									var zc_content2=$("#zc_content2").eq(0);
									var captcha = $("#captcha").val();

									//提交 验证码信息 让后台验证是否正确
									$.get(port+'/card/user/validate?captcha=' + captcha + '&phone='+phone ,function (result) {
										if(result.status){
											zc_content.hide();
											zc_content2.show();
											var changpass = $("#changpass");
											changpass.click(function(){
												var Newpass=hex_md5($("#newpass").val());
												var Affirmpass=hex_md5($("#affirmpass").val());
												if(Newpass!=""&&Affirmpass!=""){
													if(Newpass == Affirmpass){
														$.ajax({
															type:"POST",
															dataType:"json",
															contentType : "application/json;charset=UTF-8",
															url:port+"/card/user/updatePassword",
															data:JSON.stringify({
																phone:phone,
																password:Newpass
															}),
															success:function(data){
																console.log(data);
																alert("修改成功");
																$.ajax({
																	type:"POST",
																	url:port+"/card/login",
																	dataType:"json",
																	contentType : "application/json;charset=UTF-8",
																	data:JSON.stringify({
																		phone:phone,
																		password:Newpass
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
																		window.location.href=unescape(his);
																		//微信保存cookie函数
																	}
																});

															},
															error:function(data){
																alert("修改失败，请重试");
															}
														});
													}else{
														alert("新密码和确认密码不一致");
													}
												}else{
													alert("新密码和确认密码不能为空");
												}
											});
										}else {
											alert("验证码错误，请重新输入");
										}
									})
								});
							}
						});
					}else{
						alert("该手机号不存在")
					}
				}
			})
		}else{
			alert("请填写正确的手机号码");
		}
	});

});

function checkMobile(str) {
	var re = /^[1][35847][0-9]{9}$/;
	if (re.test(str)) {
		return true;
	} else {
		return false;
	}
}
