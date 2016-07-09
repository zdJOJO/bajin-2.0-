


function loadwx(callback) {
    if (!IS_WX_LOADED){
     // if(true){
        $.ajax({
           type:"GET",
          //url:"http://121.196.232.233:9292/card/weixin/signature?url=" + encodeURIComponent(location.href.split('#')[0]),
          //url:"http://dev.jatyl.com/api/v0/weixin/signature?url=000",
           url:port+"/card/weixin/signature?url=000",
           timeout:5000,
           success:function(data){
               var key = JSON.parse(data).data;
               wx.config({
                   debug     : false,
                   appId     : "wxae4ded78513c20ca",
                   timestamp : key.timestamp,
                   nonceStr  : key.noncestr,
                   signature : key.signature,
                   jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo','onMenuShareQZone']
               });

               wx.error(function(res) {
                   // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                   console.log(res);
               });

               wx.ready(function() {
                   IS_WX_LOADED = 1;
                   //wx.hideOptionMenu();
                   //wx.hideAllNonBaseMenuItem();
                   callback(wx);
               });
           },
            error:function(status,statusText){
                alert('获取数据错误！错误代号：' + status + '，错误信息：' + statusText);
            }
        });
    }else{
        callback(wx);
    }
}