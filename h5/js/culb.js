
$(function(){
    var page = 1;  
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
    // alert(token);
    //http://121.196.232.233:9292/card/club?currentPage={pagenum}&size={size}   
	console.log(token);
    $(".indexPage").click(function(){
        window.location.href = "index.html";
    });
	$(".readPage").click(function(){
        window.location.href = "read.html";
    });
    $(".pierrePage").click(function(){
        window.location.href = "pierre.html";
    });
    var actWrap=$('.infoList').eq(0);
    function getActData(){
        var str="";
        function getPage(page){        
            $.get(port+"/card/activity?currentPage="+page+"&size=10",function(data){
                console.log(data);
                if(data.list.length != 0){//如果加载的是非空页面            
                    for(var i=0;i<data.list.length;i++){
                        if(i%2==0){
                                str=$('<div class="infoItem" data-i="'+data.list[i].activityId+'"style="background: url('+data.list[i].maxPic+') no-repeat;background-size:cover;"> <div class="mask"></div> <div class="tit-content"> <h1>'+data.list[i].activityTitle+'</h1> <p style="font-size:13px;">'+new Date(data.list[i].createTime*1000).Formate()+'-'+new Date(data.list[i].endTime*1000).Formate()+'</p></div> </div>');
                        }else if(i%4==1){
                                str=$('<div class="infoItem rightItem" data-i="'+data.list[i].activityId+'" style="background: url('+data.list[i].activityPic+') no-repeat; background-size:50%;"><div class="tit-wrap"><div class="tit-content"> <h1>'+data.list[i].activityTitle+'</h1><div class="detile"><p >'+data.list[i].activityBrief+'</p></div><p style="font-size:13px;">'+new Date(data.list[i].createTime*1000).Formate()+'-'+new Date(data.list[i].endTime*1000).Formate()+'</p></div></div></div>');
                            }else if(i%4 == 3){                                        
                                str=$('<div class="infoItem leftItem" data-i="'+data.list[i].activityId+'" style="background: url('+data.list[i].activityPic+') no-repeat;"><div class="tit-wrap"><div class="tit-content"> <h1>'+data.list[i].activityTitle+'</h1><div class="detile"> <p>'+data.list[i].activityBrief+'</p></div> <p style="font-size:13px;">'+new Date(data.list[i].createTime*1000).Formate()+'-'+new Date(data.list[i].endTime*1000).Formate()+'</p> </div> </div><img src="'+data.list[i].activityPic+'"/></div>');
                            }        
                        actWrap.append(str);
                    }
                    //整个div点击跳转
                    $('.infoItem').click(function(){
                        toActivity($(this).attr('data-i'));
                    });
                    //点击箭头跳转
                    $('.jump-img').click(function(){
                        toActivity($(this).attr('data-id'));
                    });
                    less_q();
                }else{
                    return ;
                }
            });
        }
        getPage(1);
        //拉加载处理
        var touchEvents = {
                touchstart: "touchstart",
                touchmove: "touchmove",
                touchend: "touchend",
                /**
                 * @desc:判断是否pc设备，若是pc，需要更改touch事件为鼠标事件，否则默认触摸事件
                 */
                initTouchEvents: function () {
                    if (isPC()) {
                        this.touchstart = "mousedown";
                        this.touchmove = "mousemove";
                        this.touchend = "mouseup";
                    }
                }
            };
            //touchEvents.touchend
            $(document).bind(touchEvents.touchend, function (event) {
                //event.preventDefault();                   
                //这里触发事件
                //判断加载的条件
                // console.log("屏幕的高度：");
                // alert($(document).height());
                // console.log("滚动的的高度：");
                // alert($(window).scrollTop());

                if($(document).height() >= $(window).height() + $(window).scrollTop()){
                    page++;
                    getPage(page);
                }                    
            });//下拉加载函数结束
    }
    //跳转函数
    function toActivity(id){
        window.location.href="enrol.html?id="+id;
    }
    getActData();
});
//通用函数，也是可以写到zepto.js里面的
Date.prototype.Formate=function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
    return (y+'.'+m+'.'+d);
}

//两行加省略
function less_q(){
    var text = $('.tit-wrap .detile p');
    var textLen = 20;
    for(var k=0,len=text.length;k<len;k++){
        console.log($(text[k]).html());
        if($(text[k]).html().length>textLen){
            var str = $(text[k]).html().substring(0,textLen)+"..."
            $(text[k]).html(str);
        }
    }
}
