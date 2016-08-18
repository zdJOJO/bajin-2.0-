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




	token = window.location.search.split('=')[1];
	function getCouponList() {
		$.get( port + '/card/ticket/list?token=' + token,function (result) {
			var str = '';
			for(var i=0;i<result.data.length;i++){
				str += '<div class="singleCoupon" data-ticketId="'+ result.data[i].ticketId +'"><div class="mask"></div>' +
					'<div class="detail"><div class="reduce"><span>￥</span><span class="num">'+ result.data[i].ticketPrice +'</span></div>' +
					'<div class="explain"><p class="tips"><img src="imgs/scope_b.png"/>满'+ result.data[i].overPrice + '元可用</p>'+
					'<p class="time"><img src="imgs/time_cb.png"/>' + new Date(result.data[i].startTime*1000).Formate() + ' 至 '
					+ new Date(result.data[i].endTime*1000).Formate() + ' 可用 </p></div></div></div>';
			}
			$('.wrapper').append(str);
			
			//领取
			$('.singleCoupon').click(function () {
				var ticketId = $(this).attr('data-ticketId');
				$.ajax({
					type: 'put',
					url: port + '/card/ticket/get/' + ticketId + '?token=' + token,
					success: function (result) {
						if(result.code = '202'){
							alert('领取成功');
						}
					},
					error: function () {
						//todo
					}
				});
			});
		});
	}

	getCouponList();




//通用函数，也是可以写到zepto.js里面的   时间戳转换成 固定格式
	Date.prototype.Formate = function(){
		var y=this.getFullYear();
		var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
		var d=this.getDate()>9?this.getDate():'0'+this.getDate();
		return (y+'-'+m+'-'+d);
	}

	
});