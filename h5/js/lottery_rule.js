
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
	$("footer p").bind("click",function(e){
		$.ajax({
		 	type:"get",
		 	url:port+"/card/card?token="+token,
		 	success:function(data){
		 		console.log(data);
		    	if(typeof(data) == "string"){
					window.location.href = "login.html?his="+his;
				}else{			 		
			 		if(data.list.length == 0){//没绑卡的时候，调到绑卡页面，并且给定一个标识，绑定成功后是要跳到抽奖页面的
				    	location.href = "payIFrame.html?lottery=lottery";
						
				    }else{//已经绑定银行卡的时候，直接跳到抽奖页面
				    	window.location.href = "fareDraw.html?token="+token;
				    }
			 	}
			}
		});
		e.preventDefault();
		e.stopPropagation();
	});
});