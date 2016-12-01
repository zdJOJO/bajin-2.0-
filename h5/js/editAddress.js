$(function(){
	var token = "";
	//获取存在于cookie中的token值
	function getCookie(c_name) {
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
	
	//获取页面的名称
	var isPersonNalInfo = window.location.href.indexOf('fromePersonNalInfo') ;
	var isfromeGift = window.location.href.indexOf('fromeGift') ;

	var his = window.location.pathname.split("/");
	his = his[his.length-1];	
	//返回页面的操作，添加链接地址，返回过程中依然要传递参数token，如果合并js就不用如此操作
	
	var addressId = GetQueryString('id');
	var obj = JSON.parse(GetQueryString('obj'));
	$.ajax({
		type:"get",
		url:port+"/card/receiver/"+addressId+"?token="+token,
		async:true,
		success:function(data){
			console.log(data);
			//填写数据到页面中
			var address=data.province +","+data.city+","+data.district;
			$("#name").val(data.receiverName);
			$("#phone").val(data.receiverPhone);
			$("#demo1").val(address);
			$("#addressDetail").val(data.detilAddress);
			$("body").attr("data-isdefault",data.isDefault);
		},
		error:function(data){
			console.log(data);
		}
	});
	$(".add_save").bind("click",function(){
		var address = $("#demo1").val().split(",");
		if(checkMobile($("#phone").val())){
			$.ajax({
				type:"put",
				async:true,
				url:port+"/card/receiver/"+addressId+"?token="+token,
				dataType:"json",
				contentType:"application/json",
				data:JSON.stringify({
					receiveId:addressId,
					receiverName:$("#name").val(),
					receiverPhone:$("#phone").val(),
					isDefault:$("body").data("isdefault"),
					//addressId:,
					province:address[0],
					city:address[1],
					district:address[2],
					detilAddress:$("#addressDetail").val()
				}),
				success:function(data){
					// window.location.href = isPersonNalInfo > 0 ? "setAddress.html?fromePersonNalInfo" :
					// 	( isfromeGift > 0 ? "setAddress.html?fromeGift&obj="+escape(JSON.stringify({})) :
					// 		"setAddress.html?obj=" + escape(JSON.stringify(obj)) + '&&isShoppingCart=false') ;

					if(isPersonNalInfo > 0){
						window.location.href = "setAddress.html?fromePersonNalInfo";
					}else if(isfromeGift > 0){
						window.location.href = "setAddress.html?fromeGift&obj="+escape(JSON.stringify({}));
					}else if(window.location.search.indexOf("isShoppingCart=false") > 0){
						window.location.href = "setAddress.html?obj=" + escape(JSON.stringify(obj)) + '&&isShoppingCart=false' ;
					}else {
						window.location.href = "setAddress.html?obj=" + escape(JSON.stringify(obj));
					}


				},
				error:function(data){
					console.log(data);
				}
			});					
		}else{
			alert("请输入正确的手机号码！！");
		}
	});
})