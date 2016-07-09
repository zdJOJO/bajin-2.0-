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
	// token = getCookie("token") ||"19cdc036-c98e-4958-8d89-1b55f0e09695";//便于本地测试
	token = getCookie("token");
	//获取页面的名称
	console.log(token);
	var his = window.location.pathname.split("/");
	his = his[his.length-1];

	var obj;
	if(window.location.search!=""){
		var  JSONstr = window.location.search.split("=")[1];
		console.log(JSON.parse(unescape(JSONstr)));
		obj = JSON.parse(unescape(JSONstr));	
	}
	
	
	//返回页面的操作，添加链接地址，返回过程中依然要传递参数token，如果合并js就不用如此操作
	$(".add_save").click(function(){
		var str = $("#demo1").val();
		var fg=str.split(",");
		var receiverPhone=$(".receiverPhone").val();
		var checked=checkMobile(receiverPhone);
		if($(".receiverName").val()!=""&&$(".detilAddress").val()!==""&&fg[0]!=""&&fg[1]!=""&&fg[2]!=""&&receiverPhone!=""){
			if(checked){
				$.ajax({
					type:"POST",
					url:port+"/card/receiver?token="+token,
					contentType : "application/json",
					data:JSON.stringify({
						receiverName:$(".receiverName").val(),
						receiverPhone:receiverPhone,
						province:fg[0],
						city:fg[1],
						district:fg[2],
						detilAddress:$(".detilAddress").val()
					}),
					success:function(data){
						if(data.code==201){
							alert("创建成功!");
							$("#demo1").val("");
							$(".receiverPhone").val("");
							$(".detilAddress").val("");
							$(".receiverName").val("");
							// 延迟跳转
							window.location.href = "setAddress.html?obj="+escape(JSON.stringify(obj));
						}else{	
							alert("创建失败!");
						}				
					},
				})
			}else{
				alert("请输入正确的电话号码!");
			}
		}else{
			alert("以上内容不能为空!");
		}
	});	
});