
//页面的逻辑是根据给定的一个数值来旋转图片到指定位置，然后判断在哪个区域给出提示
//图片还有奖品、概率都需要从后台获取,每次的指向问题已经调好，
//如何控制抽奖概率,通过控制给的数组来控制是否中奖
//旋转事件似乎也是可以控制的
//需要后台传递的数据有： 图片 对应的文字，对应的中奖概率
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
    token = window.location.search.split("=")[1];
    // token = window.location.search.split("=")[1];
    // token = "acb2c835-e1c2-4f4b-8422-9987504a789f";
    // token = window.location.search.split("&")[1].split("=")[1];
    // 用于设置抽奖的地方
    // var sectionId = window.location.search.split('=')[1];
    // if(typeof(sectionId)!="number"){
        // sectionId = window.location.search.split('=')[1].split("&")[0];
    // }
    var sectionId = 7;//本次确定的期数
    var his = window.location.pathname.split("/");
    his = his[his.length-1];
    //使用正式环境的数据
    var port = "http://www.winthen.com";
    // var sectionId =1;
    var objArr = [];  
    if(token != undefined){
        $.ajax({
            url:port+"/card/prize/section/"+ sectionId +"?token=" + token,
            success:function(data){
            if(typeof(data) == "string"){   
                // window.location.href = "login.html?his="+his;
            }else{
            console.log(data);
            $("#rotate").css("background","rgba(0, 0, 0, 0) url("+data.prizeSectionModel.sectionPic+") no-repeat scroll 0% 0% / 100% 100% padding-box border-box");
            $("#rotate").css('-webkit-transform','rotate(0deg)');
            $("#tip_img").attr("src",data.prizeSectionModel.sectionBackpic);       

            var list = data.prizeModelList;
            console.log(list);
            nullObj={id:-2,prizeName:"无中生有"};
            var objList = [list[3],list[1],nullObj,list[2],nullObj,nullObj,list[0]]; 
            console.log(objList);

            var len = objList.length;
            // var len = 6;
            var len_ = 7;
            var arr_ = [];
            for(var j=1;j<len_+1;j++){
                arr_.push((2*j-1)/(2*len_));
            }
            console.log(arr_);
            for (var i = 0;i<len;i++){
                objArr[i] = {prizeId:objList[i].id,message:objList[i].prizeName,angle:arr_[i]};
            }
            console.log(objArr);

            //http://121.196.232.233:9292/card/prize?token=token&sectionId=1            
            var startBtn=$('.start').eq(0);
            var rotateBox=$('#rotate');
            //标志位和转的圈数
            var isClick=true;
            var circle = 2;
            startBtn.click(function(){  
            $("#rotate").css('transition','3s');              
                console.log(circle);
                if(isClick){
                    isClick=false;
                    $.ajax({
                        type:"POST",
                        url:port+"/card/prizecard?token="+token+"&sectionId="+sectionId,
                        dataType:"json",
                        contentType : "application/json;charset=UTF-8",  
                        // data:,
                        success:function(data_){
                            // alert("抽奖一次");
                            // var data_={
                            //     code:"206",
                            //     data:{
                            //         createdTime:1466040145,
                            //         id:45,
                            //         isProvide:0,
                            //         prizeId:28,
                            //         userId:"e914504b-fc4e-48e5-b679-f4e77e0ab41d"
                            //     },
                            //     message:"恭喜已中奖!"
                            // };
                            // var data_={
                            //     code:"208",
                            //     message:"谢谢参与"//这里直接返回奖品对象最后一个
                            // }
                            // var data_={
                            //     code:"207", 
                            //     message:"抽奖次数已用完!"
                            // }
                            console.log(data_);
                            var prizeId;                            
                            if(data_.code == 207){
                                alert(data_.message); 
                                // window.location.href="https://baidu.com";  
                                window.location.href = "http://www.winthen.com/test/index.html";
                                isClick = true;
                            }else if(data_.code == 208){  
                                prizeId = objArr[objArr.length-1].prizeId;
                            }
                            else{                             
                                prizeId = data_.data.prizeId;                                  
                            }
                            for(var k=0,len=objArr.length;k<len;k++){
                                if(objArr[k].prizeId == prizeId){
                                    // console.log(objArr[k]);
                                    var circle_do = (circle + objArr[k].angle)*360;
                                    rotateBox.css('-webkit-transform','rotateZ('+circle_do+'deg)');
                                    //这里使用k的时候，objArr是一直存在内存中的，k值在循环结束的时候就不存在了，所以要用m来保存当前的k值
                                    var m = k;
                                    setTimeout(function(){ 
                                        alert(objArr[m].message);
                                        // alert("这里是测试环境");
                                        // window.location.href="https://baidu.com";
                                        window.location.href = "http://www.winthen.com/test/index.html";
                                    },3000);
                                }
                            }                                                          
                            circle+=2;
                            isClick=true;
                        },
                        error:function(data_){
                            // window.location.href = "login.html";
                        }
                    });
                }
            });
        } },
        error:function(data){
            // window.location.href = "login.html";
        }});
    }else{
        // window.location.href = "login.html";
    }
});