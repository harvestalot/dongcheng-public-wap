//外部css、js库
// document.write('<link rel="stylesheet" type="text/css" href="./lib/animate.css">');
document.write('<link rel="stylesheet" href="https://cache.amap.com/lbs/static/main1119.css"/>');
// document.write('<script type="text/javascript" src="./lib/jquery-3.3.1.min.js"></script>');
// document.write('<script type="text/javascript" src="./lib/template.js"></script>');
document.write('<script type="text/javascript" src="./assets/mapdata/lib/echarts.min.js"></script>');
document.write('<script type="text/javascript" src= "./assets/mapdata/lib/encryption/aes.js"></script>');
document.write('<script type="text/javascript" src= "./assets/mapdata/lib/encryption/pad-zeropadding.js"></script>');
document.write('<script type="text/javascript" src= "./assets/mapdata/lib/encryption/security.js"></script>');
document.write('<script type="text/javascript" src="//webapi.amap.com/maps?v=1.4.15&key=ecde469412ea3b8c4b8a640687c68c2b&'+
        'plugin=AMap.PlaceSearch,AMap.Walking,AMap.Riding,AMap.Transfer,AMap.Driving"></script>');
document.write('<script type="text/javascript" src="//webapi.amap.com/loca?v=1.3.0&key=ecde469412ea3b8c4b8a640687c68c2b"></script>');
document.write('<script type="text/javascript" src="https://cache.amap.com/lbs/static/PlaceSearchRender.js"></script>');
// document.write('<script type="text/javascript" src="https://cache.amap.com/lbs/static/addToolbar.js"></script>');

/**
 *ajax请求通用方法
 *
 * @param type           请求类型
 * @param url            请求服务的地址
 * @param params_arguments      传递的参数对象
 * @param callBack       请求成功的回调函数
 */
function serveRequest(type,url,params_arguments,callBack){
    $.ajax({
        type:type,
        url:url,
        // data: Encrypt(JSON.stringify(params_arguments)),
        data: params_arguments,
        success: function (result) {
            if(result.resultCode === "10000"){
                callBack(result);
            }else{
                alert(result.resultMessage);
            }
        },
    });
};
//服务接口配置
var service_config = {
    // data_server_url : "http://121.41.72.180:8901/",
    data_server_url : "http://114.64.228.104:8902/",
    file_server_url : "http://peking.caupdcloud.com/dongcheng/assets/mapdata/json/",
    // file_server_url : "http://127.0.0.1:5500/assets/mapdata/json/",
    icon_url: "http://peking.caupdcloud.com/dongcheng/assets/mapdata/images/",
    // icon_url: "http://127.0.0.1:5500/assets/mapdata/images/",
    server_img_url: "http://114.64.228.104:8089/",
}
//颜色配置
var echarts_colors = ["#85ccc8",'#a7add7',"#d8a79b",'#85b6db',"#b4d89c","#ceb1a8",
    "#89cbe8", "#d6a2c7",'#dfb27e',"#00FFFF",'#E0F319',"#00FF59", "#DE61FA",
    "#3A8281","#F51B04","#630B7C","#C2B6F2","#05534F","#055317","#51C46C",
    "#BFDC3F","#C88A78","#F702A4"];//浅色系
var map_colors = ["#5abfba", "#5e61aa", "#c6826f", "#70a8da", "#8ec76c", "#b59284",
    "#4287c0", "#b84b8e", "#dba561"];//深色系
//图表title
var echart_title = {
    left:10,
    // top:10,
    textStyle:{
        color: '#222',
        fontSize: 14
    }
}
var facilities_bar_config ={
    legend: {
        show: true,
        icon:"circle",
        left:10,
        top:25,
        textStyle: {
            fontSize: 12,
            color: "#222"
        },
    },
    grid: {
        containLabel:false,
        left: 30,
        top: 90,
        bottom:50,
    },
}
// 时间轴
var timeLine = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
            "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
            "16:00", "17:00", "18:00", "19:00", "20:00", "11:00", "22:00", "23:00"];
//东城街道
var street_names = ["安定门", "北新桥", "朝阳门", "崇外", "东花市", 
    "东华门", "东四", "东直门", "和平里", "建国门", "交道口", 
    "景山", "龙潭", "前门", "体育馆", "天坛", "永定门"];
//折线、柱状x、y轴样式配置
var coordinate_axis_style = {
    axisLine: {
        show: true,
        lineStyle: {
            color: "#666",
        }
    },
    axisLabel: {
        show: true,
        textStyle: {
            color: "#666",
        },
    },
    splitLine: {
        lineStyle: {
            type: 'dashed',
            color: '#ddd'
        }
    },
}

var infoWindow;//信息窗体标示

//信息窗体
function openInfo(facility_type, address, center) {
    var info = [];
    info.push('<div class="info_window">'+facility_type+'</div>');
    // info.push('<div class="info_window">地址：'+address+'</div>');
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(map, center);
}
// 对象合并
function get_object_assign(obj1, obj2){
    var obj3 = {};
    for(var attr in obj1){
        obj3[attr] = obj1[attr];
    }
    for(var attr in obj2){
        obj3[attr] = obj2[attr];
    }
    return obj3;
}
// 启动轮播
function startBanner(){
    var swiper = new Swiper('#banner .swiper-container', {
        pagination: {
            el: '.swiper-pagination',
        },
    });
    // var certifySwiper = new Swiper('#banner .swiper-container', {
    //     watchSlidesProgress: true,
    //     slidesPerView: 'auto',
    //     centeredSlides: true,
    //     loop: true, 
    //     loopedSlides: 5,
    //     autoplay: true,
    //     navigation: {
    //         nextEl: '.swiper-button-next',
    //         prevEl: '.swiper-button-prev',
    //     },
    //     pagination: {
    //         el: '.swiper-pagination',
    //         //clickable :true,
    //     },
    //     on: {
    //         progress: function (progress) {
    //             for (i = 0; i < this.slides.length; i++) {
    //                 var slide = this.slides.eq(i);
    //                 var slideProgress = this.slides[i].progress;
    //                 modify = 1;
    //                 if (Math.abs(slideProgress) > 1) {
    //                     modify = (Math.abs(slideProgress) - 1) * 0.3 + 1;
    //                 }
    //                 translate = slideProgress * modify * 200 + 'px';
    //                 scale = 1 - Math.abs(slideProgress) / 8;
    //                 zIndex = 999 - Math.abs(Math.round(10 * slideProgress));
    //                 slide.transform('translateX(' + translate + ') scale(' + scale + ')');
    //                 slide.css('zIndex', zIndex);
    //                 slide.css('opacity', 1);
    //                 if (Math.abs(slideProgress) > 3) {
    //                     slide.css('opacity', 0);
    //                 }
    //             }
    //         },
    //         setTransition: function (transition) {
    //             for (var i = 0; i < this.slides.length; i++) {
    //                 var slide = this.slides.eq(i)
    //                 slide.transition(transition);
    //             }

    //         }
    //     }
    // })
}
//获取url？后面以“&”分割的字符串内容
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++){
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
