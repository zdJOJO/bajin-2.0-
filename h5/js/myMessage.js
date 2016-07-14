$(document).ready(function(){	
	//获取token
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
	token = getCookie("token");//便于本地测试
	//获取页面的名称
	var his = window.location.pathname.split("/");
	his = his[his.length-1];
	//我的消息接口
	//http://121.196.232.233/card/message/{messageType}?currentPage={pagenum}&size={size}&token=e7120d7a-456b-4471-8f86-ac638b348a53
	//不传size 默认5条
 	//消息类型(messageType)1：系统消息，2物流消息3：优惠信息4：客服消息.项目类型(itemType):1活动 2白金人生 3商品 4其他    当itemtype为4的时候，那么就要启用message_url字段
	function getMessage(messageType,pagenum,size){
		if(token!=undefined){
			$.ajax({
				type:"get",
				url:port+"/card/message/"+messageType+"?currentPage="+pagenum+"&size="+size+"&token="+token,
				dataType:"json",
				async:true,
				success:function(data){
					console.log(data);
					$(".wrapper").html("");
					if(messageType==1){//系统消息点击不跳转，展开与关闭。
						for(var i=0,len=data.list.length;i<len;i++){
							var tips="";
							if(data.list[i].isRead==0){
								tips='<img src="imgs/redPoint.png"/>';
							}
							var str=$('<div class="singleMsg" data-isread="'+data.list[i].isRead+'" data-message="'+data.list[i].messageDetail+'" data-messageid="'+data.list[i].messageId+'"><p class="date">'+new Date(data.list[i].pushTime*1000).Formate()+'</p><div class="detail"><div class="title">'+tips+'<h3>'+data.list[i].messageTitle+'</h3></div><div class="read"><section class="word">'+data.list[i].messageDetail+'</section><section class="imgList"><img src ="'+data.list[i].messagePic+'"/></section></div></div><div class="more"><span>展开</span><img src="imgs/deploy.png"/></div></div>');
							$(".wrapper").append(str);
						}
						$(".singleMsg").bind("click",function(){
							if($(this).data("isread")==0){
								turnState($(this).data("messageid"));
							}							
						});			
					}else if(messageType==3){
						for(var i=0,len=data.list.length;i<len;i++){
							var tip="";
							var itemid="";
							var url="";
							if(data.list[i].isRead==0){
								tip='<img src="imgs/redPoint.png"/>';
							}
							//类型 1：活动 2白金人生 3商品 4服务 5其他 6消息推送
							if(data.list[i].itemType!=6){
								itemid=data.list[i].itemId;
								if(data.list[i].itemType==1){
									url="enrol.html?id="+data.list[i].itemId;
								}else if(data.list[i].itemType==2){
									url="life.html?id="+data.list[i].itemId;
								}if(data.list[i].itemType==3){
									url="brandDetail.html?id="+data.list[i].itemId;
								}if(data.list[i].itemType==4){
									url="mall.html?id="+data.list[i].itemId;
								}if(data.list[i].itemType==5){
									url=data.list[i].url;
								}
							}

							var str = '';
							if(data.list[i].messageDetail){
								str = data.list[i].messageDetail;
							}

							var str=$('<div class="singleMsg" data-url="'+url+'" data-isread="'+data.list[i].isRead+'" data-itemtype="'+data.list[i].itemType+'" data-itemid="'+itemid+'" data-messageid="'+data.list[i].messageId+'">' +
								'<p class="date">'+new Date(data.list[i].pushTime*1000).Formate()+'</p>' +
								'<div class="detail"><div class="title">'+tip+'<h3>'+data.list[i].messageTitle+'</h3>' +
								'</div><div class="imgAndWord"><img src="'+data.list[i].messagePic+'"/><section>' + str + '</section></div>' +
								'<p class="toDetail">查看详情>></p></div></div>');

							$(".wrapper").append(str);
						}
						$(".singleMsg").bind("click",function(){
							if($(this).data("isread")==0){
								turnState($(this).data("messageid"));
							}
							if(!!$(this).data("url")){
								window.location.href=$(this).data("url");
							}							
						});								
					}
					//这个地方肯定是要放在加载完成后的地方
					lessAll($(".read section.word"),45);
					lessAll($(".imgAndWord section"),45);
					//点击展开
					$(".more").click(function(){
						var str = $(this).parent().data("message");
						if($(this).find("img").attr("src") == "imgs/deploy.png"){
							$(this).siblings(".detail").find(".read").find(".word").text(str);
							$(this).find("img").attr("src","imgs/packUp.png");
						}else{
							lessAll($(this).siblings(".detail").find(".read").find(".word"),45);
							$(this).find("img").attr("src","imgs/deploy.png");
						}		
					});
				},
				error:function(data){
					console.log(data);
					window.location.href = "login.html?his="+his;
				}
			});
		}else{
			window.location.href = "login.html?his="+his;
		}
	}

	//函数标记为已读
	function turnState(messageId){
		//http://121.196.232.233/card/message/isRead/{id}?&token=e7120d7a-456b-4471-8f86-ac638b348a53
		$.ajax({
			type:"get",
			url:port+"/card/message/isRead/"+messageId+"?token="+token,
			success:function(data){
				console.log(data);
			},
			error:function(data){
				console.log(data);
			}
		});
	}//标记函数结束



	// 切换选项卡
	$(".systemMsg").click(function(){
		getMessage(1,1,100);
		doCss(this);
	});
	// $(".logisticsMsg").click(function(){
	// 	getMessage(2);
	// 	doCss(this);
	// });


	$(".preferentialMsg").click(function(){
		getMessage(3,1,100);
		doCss(this);
	});

	$(".preferentialMsg").click();

	// $(".customerServiceMsg").click(function(){
	// 	getMessage(3);
	// 	doCss(this);
	// });
    //处理选项卡公共的事件
    function doCss(self){
		$(self).css("border-bottom","2px solid #6b6b6b;").css("color","#6b6b6b");
		$(self).siblings().css("border-bottom","none").css("color","#b2b2b2");
    }
});
//格式化时间，在date原形上边添加方法
Date.prototype.Formate=function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
	var h=this.getHours()>9?this.getHours():'0'+this.getHours();
	var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
    return (y+'-'+m+'-'+d+' '+h+':'+f);
}