
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


    // var gpsObj = {};
    // var gpsObjStr = getCookie("gpsObj");
    // if(gpsObjStr.length > 0){
    //     gpsObj = JSON.parse(gpsObjStr);
    // }


    $(".indexPage").click(function(){
        window.location.href = "index.html";
    });

	$(".readPage").click(function(){
        window.location.href = "read.html?hot";
    });

    $(".pierrePage").click(function(){
        window.location.href = "pierre.html?good";
    });

    var actWrap = $('.infoList>.lists').eq(0);



    //判断是 活动 还是  热门
    var isHotDoor = false;
    if(window.location.pathname.indexOf('hotDoor') > 0){
        isHotDoor = true;
    }
    if(!isHotDoor &&　window.location.pathname.indexOf('icbcServe') < 0){
        $("body").prepend('<header> <div class="joinAct active">报名<hr class="active"></div> <div class="consultation">资讯<hr></div></header>');
        $(".infoList").css('margin-top' ,'0.143rem');

        var thisJO = $('header>.' + window.location.href.split("?")[1])
        thisJO.children('hr').addClass('active');
        thisJO.addClass('active').siblings().removeClass('active');
        thisJO.siblings().children('hr').removeClass('active');


        //隐藏 兄弟 section
        if( window.location.href.indexOf('joinAct') > 0){
            $('#actList').show().siblings('section').hide();
        }
        if( window.location.href.indexOf('consultation') > 0){
            $('#consultationList').show().siblings('section').hide();
        }


        //如果是活动页,tab切换(报名/咨询)
        $('header>div').click(function () {
            //初始化一下
            if($(this).hasClass('active')){
                return;
            }

            if($(this).hasClass('consultation')){
                window.location.href = 'culb.html?consultation';
            }else {
                window.location.href = 'culb.html?joinAct';
            }
        });
    }




    //使用 滑动ajax插件 进行加载  (先声明 dropload )
    var pageNum = 0;   //第一页
    var actStr = '' ;
    var pageNum_consultation = 0 ;
    var consultationStr = '';


    //咨询列表获取
    function getPage_consultation(page) {
        var url = port + '/card/consult?currentPage=' + page + '&token=' + token + '&type=7';

        //工行服务
        if(window.location.href.indexOf('icbcServe') > 0){
            url =  port + '/card/consult?currentPage=' + page + '&token=' + token + '&type=8';
        }

        $.get(url,function(data){
            if(data.list.length != 0){
                for(var i=0;i<data.list.length;i++){
                    consultationStr += '<div class="singleHot" data-id="'+data.list[i].id+'" style="background: url('+data.list[i].maxPic+') no-repeat 50%;background-size: 1rem 0.5rem">' +
                        '<h4 class="title">'+data.list[i].title+'</h4>' +
                        '<span class="creatTime">'+ new Date(data.list[i].createTime*1000).Formate()+'</span>' +
                        '<span class="lookNum">'+data.list[i].viewNum+' 已阅</span></div>';
                }

                $('#consultationList>.lists').append(consultationStr);

                // 每次数据加载完，必须重置
                consultationStr = '';
                dropload_consultation.resetload();

                $('.singleHot').click(function(){
                    window.location.href = "consultation.html?id=" + $(this).attr('data-id');
                });
            }else {
                // 锁定
                dropload_consultation.lock();
                // 无数据
                dropload_consultation.noData();
                setTimeout('$("#consultationList .dropload-down").css("height","0")',1000);
            }
        });
    }




    //报名列表 获取
    function getPage(page,gps){

        // var url = !isHotDoor ? port+"/card/activity?currentPage="+page+"&size=10&type=1&lat=" + gps.latitude +'&log=' + gps.longitude :
        // port+"/card/mpage/hotpage?currentPage="+page+"&size=10" ;
        if(!gpsObj.latitude){
            var url = !isHotDoor ? port+"/card/activity?currentPage="+page+"&size=10" : port+"/card/mpage/hotpage?currentPage="+page+"&size=10" ;
        }

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
                           '<p style="font-size:13px;  position: absolute;top: 82%;left: 13px;">'+ new Date(data.list[i].startTime*1000).Formate()+'-'+new Date(data.list[i].endTime*1000).Formate()+
                           '</p></div></div></div>';
                   }else {
                       var chineseStr = data.list[i].detail.replace(/<[^>]+>/g,"").replace(/[^\u4e00-\u9fa5]/gi,"");
                       actStr += '<div class="infoItem hotItem" data-type="'+data.list[i].type+'" data-i="'+ data.list[i].itemId+'" style="background: url('+data.list[i].minPic+') no-repeat #f7f7f7; background-size:39% 100%;">' +
                           '<div class="tit-wrap"><div class="tit-content"><h1>'+data.list[i].title+'</h1>' +
                           '<div class="detile">' +
                           '<div>'+ showThreeLine(chineseStr,55) +'</div></div>' +
                           '<p>'+ new Date(data.list[i].createTime*1000).Formate()+ '</p>' +
                           '<span class="type">' + typeJudge(data.list[i].type) + '</span>' + '</div></div></div>';
                   }
                }

                if(!isHotDoor){
                    $('#actList>.lists').append(actStr);
                    $('.infoList').css('margin-bottom','0.123rem');
                }else {
                    $('.lists').append(actStr);
                }

                // 每次数据加载完，必须重置
                actStr = '';
                dropload.resetload();

                // function reload() {
                //     if($('#actList>.lists').children().length == 0){
                //         location.reload();
                //     }else {
                //         clearInterval(loop);
                //     }
                // }
                // if(window.location.search == 'joinAct'){
                //     var loop = setInterval(reload,1000);
                // }

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
                setTimeout('$("#actList .dropload-down ,#moreHot .dropload-down").css("height","0")',1000);
            }
        });
    }





    //判断
    if(window.location.href.indexOf('joinAct') > 0 || isHotDoor){

        //JS-SDK接口   获取gps
        // lat--纬度 , log--经度 . type判断是否按距离排序，1--是
        var dropload = $('#actList,#moreHot').dropload({
            scrollArea : window,
            domDown : {
                domClass   : 'dropload-down',
                domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
                domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                domNoData  : '<div class="dropload-noData">已无数据</div>'
            },
            loadDownFn : function(me){
                pageNum++;
                getPage(pageNum,gpsObj);
                // if($('#actList>.lists').children().length == 0){
                //     location.reload();
                // }else {
                //
                // }
            }
        });
    }else {
        var dropload_consultation = $('#consultationList').dropload({
            scrollArea : window,
            domDown : {
                domClass   : 'dropload-down',
                domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
                domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                domNoData  : '<div class="dropload-noData">已无数据</div>'
            },
            loadDownFn : function(me){
                pageNum_consultation++;
                getPage_consultation(pageNum_consultation);
            }
        });
    }


    if(window.location.href.indexOf('icbcServe') > 0){
        $('section').css({
            'margin' : '0'
        })
    }






    // 更多热门单个元素 的跳转  函数
    function toActivity(id,_type){
          if(!isHotDoor){
              window.location.href = "enrol.html?id=" + id;
          }else {
             window.location.href = jumpPage(_type).htmlStr + '?id=' + id ;
          }
        }

    // var loop = self.setInterval("reload()",500);
    // function reload() {
    //     if($('#actList>.lists').children().length == 0){
    //         location.reload();
    //     }else {
    //         clearInterval(loop);
    //     }
    // }

});




    //页面判断  跳转到哪里
    function jumpPage(type) {
        var obj = {
            htmlStr: ''
        }
        switch(type) {
            case "1":
                obj.htmlStr = 'enrol.html';
                break;
            case "2":
                obj.htmlStr = 'life.html';
                break;
            case "3":
                obj.htmlStr = 'brandDetail.html';
                break;
            case "4":
                obj.htmlStr = '';
                break;
            case "5":
                obj.htmlStr = 'mall.html';
                break;
            case "6":
                obj.htmlStr = '';
                break;
            case "7":
                obj.htmlStr = 'consulation.html';
                break;
            case "8":
                obj.htmlStr = 'consulation.html';
                break;
            case "9":
                obj.htmlStr = 'consulation.html';
                break;
        }
        return obj;
    };





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
    };




