
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
    // alert(token);
    //http://121.196.232.233:9292/card/club?currentPage={pagenum}&size={size}

    $(".indexPage").click(function(){
        window.location.href = "index.html";
    });

	$(".readPage").click(function(){
        window.location.href = "read.html";
    });

    $(".pierrePage").click(function(){
        window.location.href = "pierre.html";
    });

    var actWrap = $('.infoList>.lists').eq(0);


    var pageNum = 0;   //第一页
    // var numSize = 5 ;  //每一页展示 numSize 个
    // var pageStart = 0, pageEnd = 0;
    var actStr = '' ;


    //使用 滑动ajax插件 进行加载
    var dropload = $('.infoList').dropload({
        scrollArea : window,
        domDown : {
            domClass   : 'dropload-down',
            domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
            domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
            domNoData  : '<div class="dropload-noData">已无数据</div>'
        },
        loadDownFn : function(me){
            pageNum++;
            getPage(pageNum);
        }
    });

    function getPage(page){
        $.get(port+"/card/activity?currentPage="+page+"&size=10",function(data){
            if(data.list.length != 0){          //如果加载的是非空页面
                for(var i=0;i<data.list.length;i++){
                    var activityTypeStr = '';
                    if(data.list[i].activityType){
                        activityTypeStr = '<span class="type">' + data.list[i].activityType + '</span>';
                    }
                    actStr += '<div class="infoItem" data-i="'+data.list[i].activityId+'" style="background: url('+data.list[i].activityPic+') no-repeat; background-size:39% 100%;">' +
                        '<div class="tit-wrap"><div class="tit-content"> ' + activityTypeStr +
                        '<h1>'+data.list[i].activityTitle+'</h1>' +
                        '<div class="detile">' +
                        '<p >'+data.list[i].activitySubtitle+'</p></div>' +
                        '<p style="font-size:13px;  position: absolute;top: 82%;left: 13px;">'+new Date(data.list[i].createTime*1000).Formate()+'-'+new Date(data.list[i].endTime*1000).Formate()+
                        '</p></div></div></div>';
                }
                $('.lists').append(actStr);
                // 每次数据加载完，必须重置
                actStr = '';
                dropload.resetload();


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
                // 锁定
                dropload.lock();
                // 无数据
                dropload.noData();
                setTimeout('$(".dropload-down").css("height","0")',1000)

            }
        });
    }






    //跳转函数
    function toActivity(id){
        window.location.href="enrol.html?id="+id;
    }

    // getActData();


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
