/**
 * Created by Administrator on 2016/7/22.
 */



function upLoadImg(obj){
    var file = obj.files[0];
    //这里用来限制图片的大小
    if(obj.files[0].size<8000*1024){
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e){
            // alert("图片读取到内存中成功！！");
            // 这里可以对图片的质量进行处理
            // 图片的质量取决于转化到的图片大小
            // size大约表示图片的字节数
            // width表示宽度
            // height表示高度
            // 宽高选择小的截取中间部分
            // 限制图片大于width的宽和高
            var imgBase = this.result;
            //result是上传图片的base64值，width表示的是要生成的正方形图片的像素值，要保证上传的图片的大于要生成的正方形图片，不然quality会大于1
            var baseData = (function littlePic(result,width){//这里的图片的长与宽需要在图片加载完成之后再执行，不然ios会出现获取图的宽度为0
                var img_ = new Image();//原图
                img_.src = result;
                img_.onload = function(){
                    // alert("图片加载完成");
                    var baseLen = img_.height>img_.width?img_.width:img_.height;//图片resize宽度
                    var scale = Math.floor((img_.height/img_.width)*10)/10;
                    var quality = Math.floor((width/baseLen)*10)/10;//图像质量 
                    // alert(width);
                    // alert(baseLen);
                    if(quality>1){
                        quality = 1 ;
                    }else if(quality==0){
                        quality = 0.1;
                    }
                    // console.log("比例：");
                    // console.log(scale);
                    // console.log("质量：");
                    // console.log(quality);
                    // alert(quality);
                    var img = new Image(), //裁剪的图
                        canvas = document.createElement("canvas"),//生成画布  
                        drawer = canvas.getContext("2d"),
                        sx = 0,
                        sy = 0;

                    img.src = result;
                    // 设置画布的长和宽
                    canvas.width = width;
                    canvas.height = width;
                    if(scale>=1){//高大于宽
                        sy = (img_.height-img_.width)/2;
                    }else{//高小于宽
                        sx = (img_.width - img_.height)/2;
                    }

                    // console.log("原图x方向偏移量：");
                    // console.log(sx);
                    // console.log("原图y方向偏移量：");
                    // console.log(sy);
                    // if(navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                    // }
                    // if(navigator.userAgent.indexOf('AppleWebKit')>-1){
                    //     alert("ios设备");
                    //     img.translate(width/2,width/2);
                    //     img.rotate(Math.PI/2);
                    // }
                    //这里截取原图img_的部分从(sx,sy)坐标开始的长和宽分别为baseLen和baseLen，放到canvas(长宽都是width)的(0,0)到(width,width)上。
                    drawer.drawImage(img,sx,sy,baseLen,baseLen,0,0,width,width);
                    img.src = canvas.toDataURL(drawer,quality);

                    //先把图片填到这个地方
                    // document.querySelector(".headPic").src = img.src;
                    // console.log("图片的长和宽：");
                    // console.log(img.height);
                    // console.log(img.width);
                    // alert("图片压缩处理成功");
                    // var image_base64 = img.src.replace("data:image/png;base64,","");
                    // alert(image_base64);


                    $.ajax({
                        type:"POST",
                        contentType: "application/json",
                        url: port+"/card/file/base64.method?fileName=" + Math.floor(Math.random()*1000000)+".png",
                        data:JSON.stringify(img.src),
                        success:function(data){
                            // alert("图片上传成功");
                            // alert("图片上传到服务器成功");

                            if($('#imgList').children('li').length < 8){
                                $('#imgList').prepend('<li class="weui_uploader_file"><img src="'+ data.url +'" style="height: 100%;width: 100%"></li>')

                                $('#picNum').html( $('#imgList').children('li').length + '/8');
                            }else {
                                $('#advicePic').attr('disabled','true');
                            }
                            $("input,select").blur();
                        }
                    });
                    return img.src;
                }
            })(imgBase,180);
        }
    }else{
        alert("上传图片不要大于80kb！");
    }
}