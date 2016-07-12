
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
	var his = window.location.pathname.split("/");
	his = his[his.length-1];
	$.ajax({
		type:"GET",
		url:port+"/card/user?token="+token,
		contentType: "application/json",
		success:function(data){
			console.log(data);
	    	if(typeof(data) == "string"){
				window.location.href = "login.html?his="+his;
			}else{
				console.log(data);
				var headPic = data.headPic==""?"imgs/defaultPic.png":data.headPic;
				if(data.gender==1){
					data.gender="男"
				}else if(data.gender==2){
					data.gender="女"

				}else{
					data.gender="";
				}
				$(".headPic").attr("src",headPic);
				$("#setUserName").val(data.userName);
				$("#setPhoneNum").val(data.phone);
				$("#setAgx").val(data.gender);
				// $("#setGx").val(data.signature==undefined?"":data.signature);
				$("#setEmail").val(data.email==undefined?"":data.email);							
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
	$("input,select").blur(function(){		
		//更新设置函数	
		var regExp = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
		if(regExp.test($("#setEmail").val())||$("#setEmail").val()==""){
			if($("#setUserName").val().length>18){
				alert("用户名的字符不要超过18个字符");
			}else{
				var setAgx = $("#setAgx").val();
				if(setAgx=="男"){
					setAgx=1;
				}else{
					setAgx=2
				}

				var  info = {
				  "headPic":$(".headPic").attr("src"),
				  "gender": setAgx,
			      "userName": $("#setUserName").val(),      
			      "email":$("#setEmail").val()
			      // "signature": $("#setGx").val()
				};
				//更新信息
				if(setAgx){
					$.ajax({
						type:"PUT",
						url:port+"/card/user?token="+token,
						contentType: "application/json",
						data:JSON.stringify(info),
						success:function(data){
							console.log(data);
							// alert("save success");
						},
						error:function(data){
							// window.location.href = "login.html?his="+his;
						}
					});
				}
			}
		}else{
			alert("请输入正确格式的邮箱地址！！！");
		}			
	});
		


	$(".btn").bind("click",function(){
		window.location.href = "index.html";
	});
	//尼玛的，set竟然也要加载默认地址，我还要把所有的地址加载出来，然后筛选出来默认的地址
	$.ajax({
		type:"get",
		url:port+"/card/receiver?token="+token+"&currentPage=1",
		dataType:"json",
		async:true,
		contentType:"application/json;charset=UTF-8",
		success:function(data){
			console.log(data);
			if(data.list.length==0){
				return;
			}else{
				for(var i=0,len=data.list.length;i<len;i++){
					if(data.list[i].isDefault==1){
						if(data.list[i].province=="北京市"||data.list[i].province=="上海市"||data.list[i].province=="重庆市"||data.list[i].province=="天津市"){
							console.log("直辖市");
							var str = data.list[i].city+"-"+data.list[i].district;
						}else{
							str = data.list[i].province+"-"+data.list[i].city+"-"+data.list[i].district;								
						}
						$("#setAddress").val(str);
						return;
					}
				}	
			}
		},
		error:function(data){
			console.log(data);
		}
	});	
	//点击跳转
	$("#address").bind("click",function(){
		var obj={};
		window.location.href="setAddress.html?obj="+escape(JSON.stringify(obj));
	});
});
