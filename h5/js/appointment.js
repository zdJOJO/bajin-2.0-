

$(function(){
	var token = "";
	//获取存在于cookie中的token值
    token = (function getCookie(c_name)
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
	})("token");
	// token = getCookie("token");
    // console.log(token);
	var activityid= window.location.search.split('=')[2];
	var tocken_0 = "personal.html";

	$("#personal_But").attr("href",tocken_0);
	var fav_add=$(".fav_add")

	var his = window.location.pathname.split("/");
	his = his[his.length-1];

	function appoData(){
		$.ajax({
			type:"get",
			url:port+"/card/apply?currentPage=0&size=100&token="+token,
			success:function(data){
				console.log(data);
	    	if(typeof(data) == "string"){
				window.location.href = "login.html?his="+his;
			}else{
				for(var i=0; i<data.list.length; i++){
					var item=$('<div class="fav_content clearfix"><div class="appo_content_cen"><img src="'+data.list[i].activity.activityPic+'"></div><div class="appo_content_ri"><h2>'+data.list[i].activity.activityTitle+'</h2><p>'+data.list[i].activity.activityBrief+'</p><div class="appo_ri_zf">'+ new Date(data.list[i].createTime*1000).Formate()+'</div><div class="appo_ri_sc" data-applyid = "'+data.list[i].applyId+'" data-caid="'+data.list[i].activityId+'">查看详情</div> </div></div>')
					fav_add.append(item);	
					
				}
				less_q($(".fav_content p"));
				if(!data.list.length){
					// alert("暂无收藏");
					fav_add.append("<h2 class='alert_fq'>暂无预约!!</h2>");
				}

				$(".appo_ri_sc").click(function(){
					// var activityid = $(this).data("caid");
					// window.location.href="enrol.html?id="+activityid;
					var applyid = $(this).data("applyid");
					window.location.href = "enrollMsg.html?applyid="+applyid;
				})
			}},
			error:function(data){
				window.location.href = "login.html?his="+his;
			}
		})
	}

	if(token != undefined){
		appoData();
	}else{
        window.location.href="login.html?his="+his;
	}	
})

//两行加省略
function less_q(text){
    // var text = $('.tit-wrap .detile p');
    var textLen = 26;
    for(var k=0,len=text.length;k<len;k++){
        console.log($(text[k]).html());
        if($(text[k]).html().length>textLen){
            var str = $(text[k]).html().substring(0,textLen)+"..."
            $(text[k]).html(str);
        }
    }
}

Date.prototype.Formate=function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
	var h=this.getHours()>9?this.getHours():'0'+this.getHours();
	var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
    return (y+'-'+m+'-'+d+' '+h+':'+f);
}