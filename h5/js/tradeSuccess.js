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
	


	
	//格式化两行换行
	function less_q(text,length){
	    // var text = $('.tit-wrap .detile p');
	    var textLen = length;
	    for(var k=0,len=text.length;k<len;k++){
	        // console.log($(text[k]).html());
	        if($(text[k]).html().length>textLen){
	            var str = $(text[k]).html().substring(0,textLen)+"..."
	            $(text[k]).html(str);
	        }
	    }
	}
	//格式化时间，在date原形上边添加方法
	Date.prototype.Formate=function(){
	    var y=this.getFullYear();
	    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
	    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
		var h=this.getHours()>9?this.getHours():'0'+this.getHours();
		var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
	    return (y+'-'+m+'-'+d+' '+h+':'+f);
	}
});