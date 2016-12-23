
$(function(){
	var token = getCookie("token");
	var his = window.location.pathname.split("/");
	his = his[his.length-1];
	$.toast.prototype.defaults.duration = 1000;
	$.ajax({
		type:"GET",
		url:port+"/card/user?token="+token,
		contentType: "application/json",
		success:function(data){
			if(typeof(data) == "string"){
				window.location.href = "login.html?his="+his;
			}else{
				var headPic = data.headPic==""?"imgs/headPic_default.png":data.headPic;
				if(data.gender==1){
					data.gender="男"
				}else if(data.gender==2){
					data.gender="女"

				}else{
					data.gender="";
				}
				$(".headPic").attr("src",headPic);
				$("#userName").html(data.userName);
				$("#setUserName").val(data.userName);
				$("#setPhoneNum").val(data.phone);
				$("#setAgx").val(data.gender);
				// $("#setGx").val(data.signature==undefined?"":data.signature);
				//$("#setEmail").val(data.email==undefined?"":data.email);

				//将用户的手机号存入cookie
				setCookie('phone',data.phone,365);
			}
		},
		error:function(data){
			window.location.href = "login.html?his="+his;
		}
	});



	$('input,select').bind('input propertychange', function() {//输入字符检测
		if($("#setUserName").val().length==18){
			$("#setUserName").val($("#setUserName").val().substring(0,17));
		};
	});



	//  #setPic  #setUserName #setEmail #setAddress
	var info = {};
	$("#myImage,#setUserName,#setAddress,select").blur(function(){
		if($("#setUserName").val().length>18){
			$.alert("用户名的字符不要超过18个字符");
		}else{
			var setAgx = $("#setAgx").val();
			if(setAgx=="男"){
				setAgx=1;
			}else{
				setAgx=2
			}

			info = {
				"headPic":$("#myImage").attr("src"),
				"gender": setAgx,
				"userName": $("#setUserName").val(),
			};


			//更新信息
			if(setAgx && info.userName){
				$.ajax({
					type:"PUT",
					url:port+"/card/user?token="+token,
					contentType: "application/json",
					data:JSON.stringify(info),
					success:function(data){
						if(data.code == '202'){
							if($(this).attr('id') != 'myImage'){
								$.toast('更新成功');
								$("#userName").html(info.userName);
							}
						}else {
							$.toast('更新失败');
						}
					},
					error:function(data){
						// window.location.href = "login.html?his="+his;
					}
				});
			}else {
				$.toast('请正确填姓名');
			}
		}
	});



	var str = '';
	$.ajax({
		type:"get",
		url: port+"/card/receiver?token=" + token + "&currentPage=1",
		dataType:"json",
		async:true,
		contentType:"application/json;charset=UTF-8",
		success:function(data){
			if(data.list.length==0){
				return;
			}else{
				for(var i=0,len = data.list.length;i<len;i++){
					if(data.list[i].isDefault == 1){
						if(data.list[i].province=="北京市"||data.list[i].province=="上海市"||data.list[i].province=="重庆市"||data.list[i].province=="天津市"){
							str = data.list[i].province + "-" + data.list[i].city+'-'+data.list[i].detilAddress;
						}else{
							str = data.list[i].province+"-"+data.list[i].city+"-"+data.list[i].district+'-'+data.list[i].detilAddress;
						}
						$("#setAddress").val(str);
					}
				}

			}
		},
		error:function(data){
		}
	});


	//点击跳转
	$("#address").bind("click",function(){
		var obj={};
		window.location.href = "setAddress.html?fromePersonNalInfo&&obj=" + escape(JSON.stringify(obj));
	});


});
