
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


    //判断是 活动 还是  热门
    var isHotDoor = false;
    if(window.location.pathname.indexOf('hotDoor') > 0){
        isHotDoor = true;
    }

    if(!isHotDoor){
        $("body").prepend('<header> <div class="jionAct active">报名<hr class="active"></div> <div class="consultation">咨询<hr></div></header>');
        $(".infoList").css('margin-top' ,'0.143rem');
    }




    var pageNum = 0;   //第一页
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

        var url = !isHotDoor ? port+"/card/activity?currentPage="+page+"&size=10" :  port+"/card/mpage/hotpage?currentPage="+page+"&size=10" ;

        $.get(url,function(data){
            if(data.list.length != 0){          //如果加载的是非空页面
                for(var i=0;i<data.list.length;i++){
                    var activityTypeStr = '';
                    if(data.list[i].activityType){
                        activityTypeStr = '<span class="type">' + data.list[i].activityType + '</span>';
                    }
                   if(!isHotDoor){
                       actStr += '<div class="infoItem" data-i="'+data.list[i].activityId+'" style="background: url('+data.list[i].activityPic+') no-repeat; background-size:39% 100%;">' +
                           '<div class="tit-wrap"><div class="tit-content"> ' + activityTypeStr +
                           '<h1>'+data.list[i].activityTitle+'</h1>' +
                           '<div class="detile">' +
                           '<p >'+data.list[i].activitySubtitle+'</p></div>' +
                           '<p style="font-size:13px;  position: absolute;top: 82%;left: 13px;">'+ new Date(data.list[i].createTime*1000).Formate()+'-'+new Date(data.list[i].endTime*1000).Formate()+
                           '</p></div></div></div>';
                   }else {
                       actStr += '<div class="infoItem hotItem" data-type="'+data.list[i].type+'" data-i="'+ data.list[i].id+'" style="background: url('+data.list[i].minPic+') no-repeat #f7f7f7; background-size:39% 100%;">' +
                           '<div class="tit-wrap"><div class="tit-content"><h1>'+data.list[i].title+'</h1>' +
                           '<div class="detile">' +
                           '<p >'+data.list[i].subtitle+'</p></div>' +
                           '<p>'+ new Date(data.list[i].createTime*1000).Formate()+ '</p>' +
                           '<span class="type">' + typeJudge(data.list[i].type) + '</span>' + '</div></div></div>';
                   }
                }
                $('.lists').append(actStr);
                // 每次数据加载完，必须重置
                actStr = '';
                dropload.resetload();


                //整个div点击跳转
                $('.infoItem').click(function(){
                    if(!isHotDoor){
                        toActivity($(this).attr('data-i'));
                    }else {
                        toActivity($(this).attr('data-i'),$(this).attr('data-type'));
                    }

                });
                    // //点击箭头跳转
                    // $('.jump-img').click(function(){
                    //     toActivity($(this).attr('data-id'));
                    // });
                less_q();
            }else{
                // 锁定
                dropload.lock();
                // 无数据
                dropload.noData();
                setTimeout('$(".dropload-down").css("height","0")',1000);
            }
        });
    }




    //跳转函数
function toActivity(id,_type){
      if(!isHotDoor){
          window.location.href = "enrol.html?id=" + id;
      }else {
          window.location.href = jumpPage(_type) + '?id=' + id;
      }
    }});



//页面判断  跳转到哪里
function jumpPage(type) {
    var htmlStr = '';
    switch(type) {
        case "1":
            htmlStr = 'enrol.html';
            break;
        case "2":
            htmlStr = 'life.html';
            break;
        case "3":
            htmlStr = 'bradDetail.html';
            break;
        case "4":
            htmlStr = '';
            break;
        case "5":
            htmlStr = 'mall.html';
            break;
        case "6":
            htmlStr = '';
            break;
        case "7":
            htmlStr = 'consulation.html';
            break;
        case "8":
            htmlStr = '';
            break;
        case "9":
            htmlStr = 'consulation.html';
            break;
    }
    return htmlStr;
};





//如果 是活动页
// var chooseType = function () {
//
// };
$('header>div').click(function () {
    if($(this).hasClass('active')){
        return;
    }else {
        $(this).children('hr').addClass('active');
        $(this).addClass('active').siblings().removeClass('active');
        $(this).siblings().children('hr').removeClass('active');
    }
});





//两行加省略
function less_q(){
    var text = $('.tit-wrap .detile p');
    var textLen = 20;
    for(var k=0,len=text.length;k<len;k++){
        if($(text[k]).html().length>textLen){
            var str = $(text[k]).html().substring(0,textLen)+"..."
            $(text[k]).html(str);
        }
    }
}
