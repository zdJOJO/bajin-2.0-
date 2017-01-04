

$(document).ready(function() {

	//每次dom加载完成的时候就先把token设为"";
	var token = "";
	console.log(document.cookie);
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
    console.log(token);
	var activityid= window.location.search.split('=')[2];
	var his = window.location.pathname.split("/");
	his = his[his.length-1];
	
	$("#feedback_But").click(function(){
		window.location.href =  "feedback.html";
	});
	$("#index_But").click(function(){
		window.location.href = "index.html";
	});  

	if(token != undefined){
		$("#djdl_But").html("已登录");		
	}else{
		$("#djdl_But").html("点击登录");
	}
	$("#favorite").click(function(){
		if(token == undefined){
			window.location.href="login.html?his="+ his;
		}else{
			window.location.href="favorite.html";
		}
	})
	$("#appointment").click(function(){
		if(token == undefined){
			window.location.href="login.html?his="+ his;
		}else{
			window.location.href="appointment.html";
		}
	})
	$("#bank").click(function(){
		if(token == undefined){
			window.location.href="login.html?his="+ his;
		}else{
			window.location.href="bank.html";
		}
	})
	
	$("#personal_dl").click(function(){
		if(token != undefined){			
			$(".pe_benner_djdl img").attr("src","images/personal_dl.png");
			window.location.href="set.html";
		}else{				
			window.location.href="login.html?his="+his;				
		}
	})
	$(".gd_content h2:last-child").click(function(){
		// window.name = "";
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
	});
		
});

