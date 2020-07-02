//吃(咱在东城吃点啥)
function Eat(){
    this.mainMap = "";
    this.current_line_path_type  = "walking";
    this.walkingPathLayer = "";//步行
    this.ridingPathLayer = "";//骑行
    this.transferPathLayer = "";//公交
    this.drivingPathLayer = "";//驾车
    this.scenicSpotMarkers = [];
    this.startLocation = [];
    this.arriveLocation = [];
    this.restaurant_params = {//旅游景点分类搜索条件
        type: getUrlVars().type ? window.decodeURI(getUrlVars().type) : "京城老字号",
        name: getUrlVars().name ? window.decodeURI(getUrlVars().name) : "",
    }
    this.restaurant_list_data = [];
    this.current_marker = "";//当前的marker
}
Eat.prototype.init = function(){
    this.mapInit();
    this.layerInit();
    this.handleDomElement();
    this.linePathPlanning();
    if(this.restaurant_params.name){
        $("#bread_crumb_title").html(this.restaurant_params.name);
        this.loadEatDetails();
    }else{
        this.loadBanner();
        this.loadTimeHonoredRestaurants();
    }
}
//加载banner
Eat.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"EAT" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/eat/banner_"
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            banner_str += '<div class="swiper-slide"><a href="'+toUrl+(i+1)+".html"+'"><img src='+ service_config.server_img_url + item.url +' width="100%" data-href='+ toUrl+(i+1)+".html" +' ></div>'
        }
        $("#banner .swiper-wrapper").html(banner_str);
        startBanner();//启动banner
    })
}
//加载京城老字号数据
Eat.prototype.loadTimeHonoredRestaurants = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+"honored/getHonoredList",this.restaurant_params,function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        _this.restaurant_list_data = data;
        var restaurant_list_str = "";
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            // restaurant_list_str += "<li>"+ item.name +"</li>";
            restaurant_list_str += 
                '<div class="single-place"> '+
                    '<h4>'+item.name+'</h4> '+
                    '<div class="intro"> '+
                        '<p class="init_css">菜系：'+item.cookingStyle+'</p> '+
                        '<p class="init_css">'+item.address+'</p>'+
                        '<div> '+
                            '<a href="javascript:void(0)" class="link-btn" data-cat-name='+item.name+'>查看详情&nbsp;&gt;</a> '+
                        '</div> '+
                    '</div> '+
                '</div>';
        }
        _this.loadRestaurantList(restaurant_list_str);
        _this.loadScenicSpotLayer();
    })
}
//加载人气前100餐馆数据
Eat.prototype.loadRankingListRestaurants = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+"honored/getTopList",this.restaurant_params,function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        _this.restaurant_list_data = data;
        var restaurant_list_str = "";
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            restaurant_list_str += 
                '<div class="single-place"> '+
                    '<h4>'+item.name+'</h4> '+
                    '<div class="intro"> '+
                        '<p class="init_css">菜系：'+item.cookingStyle+'</p> '+
                        '<p class="init_css">'+item.address+'</p>'+
                        '<div> '+
                            '<a href="javascript:void(0)" class="link-btn" data-cat-name='+item.name+'>查看详情&nbsp;&gt;</a> '+
                        '</div> '+
                    '</div> '+
                '</div>';
        }
        _this.loadRestaurantList(restaurant_list_str);
        _this.loadScenicSpotLayer();
    })
}
//加载左侧搜索景点列表并操作点击事件
Eat.prototype.loadRestaurantList = function(list_dom_str){
    var _this = this;
    $("#restaurant_list").html(list_dom_str);
    /**列表项展开控制**/
    $("#restaurant_list .single-place").on("tap", function () {
        $(this).toggleClass("open");
    });
    /**允许列表项查看详情**/
    $(".place-list .link-btn").on("tap", function (e) {
        e.stopPropagation();
        _this.restaurant_params.name = $(this).attr("data-cat-name");
        window.location.href = "./eat-detail.html?type="+_this.restaurant_params.type + "&name="+_this.restaurant_params.name;
    });
    // _this.mainMap.setFitView();
    // var marker = "";
    // $("#restaurant_list li").on("click", function(){
    //     $(this).addClass("active").siblings("li").removeClass("active");
    //     $("#line_path_type li").eq(0).addClass("active").siblings("li").removeClass("active");
    //     _this.initClear();
    //     _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
    //     _this.mainMap.setFitView();
    //     var data_row = {};
    //     for(var i = 0; i < _this.restaurant_list_data.length; i++){
    //         var item = _this.restaurant_list_data[i];
    //         if(item.name === $(this).html()){
    //             $("#presentation p").html(item.description);
    //             item.lnglat  = wgs84togcj02(item.lng, item.lat)
    //             _this.arriveLocation = item.lnglat;
    //             data_row = item;
    //             $(".brief-content").removeClass("less with-btn");
    //             if ($(".point-brief-box .text-wrap .text").height() > 50) {
    //                 //内容高度超过150，截取内容, 显示『显示更多』 按钮
    //                 $(".brief-content").addClass("less with-btn");
    //             }
    //             break;
    //         }
    //     }
    //     _this.current_marker = new AMap.Marker({
    //         map: _this.mainMap,
    //         icon:new AMap.Icon({
    //             size: new AMap.Size(32, 32),
    //             image: service_config.icon_url + 'eat_1.png',
    //             imageOffset: new AMap.Pixel(0, 0), 
    //             imageSize: new AMap.Size(-16, -16)
    //         }),
    //         position: data_row.lnglat,
    //         offset: new AMap.Pixel(-16, -16),
    //         extData:data_row
    //     });
    //     _this.current_marker.on('click', function (ev) {
    //         var properties = ev.target.Qe.extData;
    //         $("#scenic_spot_info .name").html(properties.name);
    //         $("#scenic_spot_info .type").html("菜系："+properties.cookingStyle);
    //         $("#scenic_spot_info .info").html("餐馆地址："+properties.address);
    //         $("#scenic_spot_info").removeClass("hide");
    //         _this.arriveLocation = ev.lnglat;
    //         _this.loadWalkingPathLayer();//规划步行线路
    //     });
    // })
}
//左侧筛选操作DOM
Eat.prototype.handleDomElement = function(){
    var _this = this;
    // //搜索输入框enter触发
    // $("#search_text").on("keydown",function(event){
    //     if(event.keyCode==13){
    //         $("#search_btn").trigger("click");
    //     }
    // })
    // //搜索触发
    // $("#search_btn").on("click", function () {
    //     _this.initClear();
    //     _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
    //     _this.restaurant_params.name = $("#search_text").val();
    //     if(_this.restaurant_params.type === "京城老字号"){
    //         _this.loadTimeHonoredRestaurants();
    //         // $(".intro-content, .price-content, .line-content").show();
    //     }else{
    //         _this.loadRankingListRestaurants();
    //         // $(".intro-content, .price-content, .line-content").hide();
    //     }
    // });
    //点击分类类型筛选对应数据
    $("#scenic_spot_type div").on("click", function () {
        // if ($(this).hasClass("active")) return;
        _this.initClear();
        _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
        $(this).addClass("active").siblings("div").removeClass("active");
        _this.restaurant_params.type= $(this).attr("data-cat");
        if(_this.restaurant_params.type === "京城老字号"){
            _this.loadTimeHonoredRestaurants();
        }else{
            _this.loadRankingListRestaurants();
        }
    });
}
//地图初始化
Eat.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
        resizeEnable:true,
	    center: [116.412255,39.919886],
	    zoom: 11,
    });
    var _this = this;
    //点击地图区域
    this.mainMap.on('click', function(event){
        _this.startLocation = [event.lnglat.lng, event.lnglat.lat];
        _this.loadLinePath();
    });
    //定位当前位置
    this.mainMap.plugin('AMap.Geolocation', function() {
        var geolocation = new AMap.Geolocation({
            // timeout: 10000,
            // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
            buttonOffset: new AMap.Pixel(10, 20),
            showButton: false, 
            panToLocation : false,
        });
        _this.mainMap.addControl(geolocation);
        geolocation.isSupported();
        geolocation.getCurrentPosition();
        AMap.event.addListener(geolocation, 'complete', function(results){
            _this.startLocation = [results.position.lng, results.position.lat];
        })
        AMap.event.addListener(geolocation, 'error', function(data) {
            if (data.info == 'FAILED') {
                // alert('获取您当前位置失败！')
            }
        });
    })
}
//图层初始化
Eat.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    // this.loadScenicSpotLayer();
}
//加载详情页面
Eat.prototype.loadEatDetails = function(){
    var _this = this;
    _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
    serveRequest("get", service_config.data_server_url+ ( this.restaurant_params.type === "京城老字号" ? "honored/getHonoredList" : "honored/getTopList" ), 
            this.restaurant_params, function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey))[0];
        data.lnglat  = wgs84togcj02(data.lng, data.lat)
        _this.arriveLocation = data.lnglat;
        $("#detail_name").html(data.name);
        $("#introduction p").html(data.description);
        _this.current_marker = new AMap.Marker({
            map: _this.mainMap,
            icon:new AMap.Icon({
                size: new AMap.Size(32, 32),
                image: service_config.icon_url + 'eat_1.png',
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-16, -16)
            }),
            position: data.lnglat,
            offset: new AMap.Pixel(-16, -16),
            extData:data
        });
        _this.mainMap.setFitView();
        // _this.current_marker.on('click', function (ev) {
        //     var properties = ev.target.Qe.extData;
        //     $("#scenic_spot_info .name").html(properties.name);
        //     $("#scenic_spot_info .type").html("菜系："+properties.cookingStyle);
        //     $("#scenic_spot_info .info").html("餐馆地址："+properties.address);
        //     $("#scenic_spot_info").removeClass("hide");
        //     _this.arriveLocation = ev.lnglat;
        //     _this.loadWalkingPathLayer();//规划步行线路
        // });
    })
}

//选择不同类型出行方式规划相对应线路
Eat.prototype.linePathPlanning = function(){
    //步行导航
    this.walkingPathLayer = new AMap.Walking({
        map: this.mainMap,
        panel: "trip_line_path"
    });
    //骑行导航
    this.ridingPathLayer = new AMap.Riding({
        map: this.mainMap,
        panel: "trip_line_path"
    });
    //公交导航
    this.transferPathLayer = new AMap.Transfer({
        map: this.mainMap,
        panel: "trip_line_path",
        city: '北京市',
        // policy: AMap.TransferPolicy.LEAST_TIME
    });
    //驾车导航
    this.drivingPathLayer = new AMap.Driving({
        map: this.mainMap,
        panel: "trip_line_path"
    });
    var _this = this;
    $("#line_path_type li").on("click",function(){
        $(this).addClass("active").siblings("li").removeClass("active");
        _this.current_line_path_type = $(this).attr("data_type");
        _this.loadLinePath();
    })
}
//根据出行方式获取线路数据
Eat.prototype.loadLinePath = function(){
    this.initClear();
    switch (this.current_line_path_type){
        case "walking":
            this.loadWalkingPathLayer();
        break;
        case "rading":
            this.loadRidingPathLayer();
        break;
        case "transfer":
            this.loadTransferPathLayer();
        break;
        case "driving":
            this.loadDrivingPathLayer();
        break;
    }
}
//各个社区边界范围图层
Eat.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
    });
    $.get(service_config.file_server_url+'boundary_data.json', function (data) {
        var boundary_data = data;
        boundaryLayer.setData(boundary_data,{lnglat: 'lnglat'})
        // boundaryLayer.setData(JSON.parse(Decrypt(data)), {
        //     lnglat: 'coordinates'
        // });
        boundaryLayer.setOptions({
            style: {
                height: function () {
                    return Math.random() * 20000;
                },
                opacity: 1,
                color:"#d66349",
            },
        });
        boundaryLayer.render();
    }); 
}
//加载所有餐馆点标识图层
Eat.prototype.loadScenicSpotLayer = function(){
    var _this = this;
    _this.mainMap.clearMap();
    var data = _this.restaurant_list_data;
	for(var i = 0; i < data.length; i++){
        var item = data[i];
        var marker = new AMap.Marker({
                map: _this.mainMap,
                icon: _this.getMarkerIcon(),
                position: wgs84togcj02(item.lng, item.lat),
                offset: new AMap.Pixel(-10, -10),
                extData:item
            });
            marker.on('click', function (ev) {
                var properties = ev.target.getExtData();
                $("#scenic_spot_info .name").html(properties.name);
                $("#scenic_spot_info .info").html("菜系："+ properties.cookingStyle);
                $("#scenic_spot_info .info").html("餐馆地址："+ properties.address);
                $("#scenic_spot_info").removeClass("hide");
                _this.arriveLocation =  wgs84togcj02(properties.lng, properties.lat);
                _this.loadWalkingPathLayer();//规划步行线路
            });
            _this.scenicSpotMarkers.push(marker);
            // _this.mainMap.setFitView();
	}
}
//步行线路
Eat.prototype.loadWalkingPathLayer = function(){
    //根据起终点坐标规划步行路线
    this.walkingPathLayer.search(this.startLocation, this.arriveLocation, 
        function(status, result) {
            if (status === 'complete') {
                // console.log(result)
            } else {
            } 
    });
}
//骑行线路
Eat.prototype.loadRidingPathLayer = function(){
    //根据起终点坐标规划步行路线
    this.ridingPathLayer.search(this.startLocation, this.arriveLocation, 
        function(status, result) {
            if (status === 'complete') {
                // console.log(result)
            } else {
            } 
    });
}
//公交线路
Eat.prototype.loadTransferPathLayer = function(){
    //根据起终点坐标规划步行路线
    this.transferPathLayer.search(this.startLocation, this.arriveLocation, 
        function(status, result) {
            if (status === 'complete') {
                // console.log(result)
            } else {
            } 
    });
}
//驾车线路
Eat.prototype.loadDrivingPathLayer = function(){
    //根据起终点坐标规划步行路线
    this.drivingPathLayer.search(this.startLocation, this.arriveLocation, 
        function(status, result) {
            if (status === 'complete') {
                // console.log(result)
            } else {
            } 
    });
}
//获取Marker对应图标
Eat.prototype.getMarkerIcon = function(){
    var icon = new AMap.Icon({
        size: new AMap.Size(16, 16),
        image: service_config.icon_url + 'eat.png',
        imageOffset: new AMap.Pixel(0, 0), 
        imageSize: new AMap.Size(-8, -8)
    });
    return icon;
}
//加载信息窗体
Eat.prototype.loadInfo = function(name, introduction_text, center){
    var info = [];
    info.push('<div class="info_window">'+name+'</div>');
    info.push(introduction_text?'<div class="info_window text_indent">'+introduction_text+'</div>':"");
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
//清除图层
Eat.prototype.initClear = function(){
    this.walkingPathLayer.clear();
    this.ridingPathLayer.clear();
    this.transferPathLayer.clear();
    this.drivingPathLayer.clear();
    $("#scenic_spot_info").addClass("hide");
} 
var start_eat = new Eat();
start_eat.init();