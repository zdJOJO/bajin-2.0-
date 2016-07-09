	$(document).ready(function(){
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
	//var token= window.location.search.split('=')[1];
	var activityid= window.location.search.split('=')[2];
	//console.log(token);
	//传递token到下一个页面
	//var appointment_ ="appointment.html?token="+token+"="+activityid;
	
    $("#appointment_But").click(function(){
        // window.location.href = "appointment.html?id="+activityid;
        window.location.href = "myOrders.html";
    });

    //$("#appointment_But").attr("href",appointment_);

	//var index_ ="index.html?token="+token;
    $("#index_But").click(function(){
        window.location.href = "index.html";
    });
	//$("#index_But").attr("href",index_);
	// var doenrol_ ="doenrol.html?token="+token;
    $("#doenrol_But").click(function(){
        window.location.href = "doenrol.html";
    });
	// $("#doenrol_But").attr("href",doenrol_);
	});