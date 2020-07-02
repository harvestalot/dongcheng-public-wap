//景点(咱在东城玩点啥)
function ScenicSpot(){
    this.mainMap = "";
    this.current_line_path_type  = "walking";
    this.walkingPathLayer = "";//步行
    this.ridingPathLayer = "";//骑行
    this.transferPathLayer = "";//公交
    this.drivingPathLayer = "";//驾车
    this.scenicSpotMarkers = [];
    this.startLocation = [];//起点经纬度
    this.arriveLocation = [];//终点经纬度
    this.tourist_attractions_params = {//旅游景点分类搜索条件
        type: getUrlVars().type ? window.decodeURI(getUrlVars().type) : "",
        name: getUrlVars().name ? window.decodeURI(getUrlVars().name) : "",
    }
    this.tourist_attractions_list_data = [];
    this.current_marker = "";
}
ScenicSpot.prototype.init = function(){
    if(this.tourist_attractions_params.type && this.tourist_attractions_params.name){
        $("#bread_crumb_title").html(this.tourist_attractions_params.type+"&nbsp;/&nbsp;"+this.tourist_attractions_params.name);
        this.mapInit();
        this.loadBoundaryLayer();
        this.loadScenicSpot();
        this.get_play_details();
    }else if(this.tourist_attractions_params.type){
        $("#bread_crumb_title").html(this.tourist_attractions_params.type);
        this.mapInit();
        this.loadBoundaryLayer();
        this.loadScenicSpot();
    }
    this.linePathPlanning();//出行方式
    var _this = this;
    $("#play_type_select").on("change",function(){
        _this.tourist_attractions_params.type = $(this).val();
        _this.mainMap.clearMap();
        _this.loadScenicSpot();
    })
    // this.handleDomElement();
    // this.mapInit();
    // this.layerInit();
}
//加载景点数据
ScenicSpot.prototype.loadScenicSpot = function(){
    var _this = this, service_url = this.tourist_attractions_params.type === "东城景点" ? "scenicSpot/getScenicSpotList" : "culturalSpace/getculturalSpaceList";
    serveRequest("get", service_config.data_server_url + service_url, { type : this.tourist_attractions_params.type, name : "" }, function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        _this.tourist_attractions_list_data = data;
        var scenic_spot_art_space_list_str = "";
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            var img_url = "images/play/scenicspot/";
            if(_this.tourist_attractions_params.type !== "东城景点"){
                img_url = "images/play/culturalspace/";
            }
            // scenic_spot_art_space_list_str += "<li>"+ item.name +"</li>";
            scenic_spot_art_space_list_str += "<a href='tour-detail.html?type="+_this.tourist_attractions_params.type+"&name="+ item.name +"' class='item block squard-shadow'>"+
                "<h3 class='s-color tcenter'>"+ item.name +"</h3>"+
                "<div>"+
                    "<img src="+service_config.server_img_url+ img_url +((item.name).replace(/\s*/g,''))+'.jpg'+" class='w100 block' />"+
                "</div>"+
            "</a>";
        }
        $("#scenic_spot_list").html(scenic_spot_art_space_list_str);
        _this.loadScenicSpotLayer();//加载景点图层
    })
}
// 获取某一个景点和娱乐场所详情数据
ScenicSpot.prototype.get_play_details = function(){
    var _this = this, service_url = this.tourist_attractions_params.type === "东城景点" ? "scenicSpot/getScenicSpotList" : "culturalSpace/getculturalSpaceList";
    serveRequest("get", service_config.data_server_url+ service_url,this.tourist_attractions_params,function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey))[0];
        _this.arriveLocation = wgs84togcj02(data.x, data.y);
        $("#play_detail_name").html(data.name);
        $("#introduction p").html(data.description);
        $("#strategy p").html(data.guide);
        $("#ticket_rates p").html(data.ticket);
        $("#arrival_pattern p").html(data.howgo);
        var icon_type = "jingdian_1";
        data.type === "博物馆"? icon_type= "bowuguan_1":( data.type === "咖啡馆"?
            icon_type= "kafeiguan_1":( data.type === "茶/酒馆"? icon_type= "cha_1": icon_type= "jingdian_1" ) );
        _this.current_marker = new AMap.Marker({
            map: _this.mainMap,
            icon:new AMap.Icon({
                size: new AMap.Size(32, 32),
                image: service_config.icon_url + 'scenic_spot/'+icon_type+'.png',
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-32, -32),
            }),
            position: wgs84togcj02(data.x, data.y),
            offset: new AMap.Pixel(-16, -16),
            zIndex:900,
            extData:data
        });
        $('.may-collapse').readmore({
            speed: 200,
            lessLink: '<a class="collapsebtn morebtn" href="#">收起内容<i class="iconfont icon-xiejiantou-up"></i></a>',
            moreLink: '<a class="collapsebtn lessbtn" href="#" >展开更多<i class="iconfont icon-xiejiantou-down"></i></a>',
            afterToggle: function (trigger, element, expanded) {
                expanded ? element.removeClass("closed") : element.addClass("closed");
            },
            blockProcessed: function (element, collapse) {
                collapse ? element.addClass("closed") : element.removeClass("closed");
            }
        });
    })
}
//加载除景点外的所有分类数据
ScenicSpot.prototype.loadTouristAttractions = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+"culturalSpace/getculturalSpaceList",this.tourist_attractions_params,function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        _this.tourist_attractions_list_data = data;
        var scenic_spot_art_space_list_str = "";
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            scenic_spot_art_space_list_str += "<li>"+ item.name +"</li>";
        }
        _this.loadTouristAttractionsList(scenic_spot_art_space_list_str);
        _this.loadScenicSpotLayer();//加载处景点外的各类型图层
    })
}
//加载左侧搜索景点列表并操作点击事件
ScenicSpot.prototype.loadTouristAttractionsList = function(){
    var _this = this;
    // $("#scenic_spot_art_space_list").html(list_dom_str);
    // $("#scenic_spot_art_space_list li").on("click", function(){
    //     $(this).addClass("active").siblings("li").removeClass("active");
    //     $("#line_path_type li").eq(0).addClass("active").siblings("li").removeClass("active");
    //     $(".show-more").find("span").html("展开更多&nbsp;&nbsp;");
    //     $(".show-more").children("img").attr("src", "assets/img/dc/icon-arrow-down.png");
        // _this.initClear();
        // _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
        // _this.mainMap.setFitView();
        var data_row = {};
        for(var i = 0; i < _this.tourist_attractions_list_data.length; i++){
            var item = _this.tourist_attractions_list_data[i];
            if(item.name === this.tourist_attractions_params.name){
                item.lnglat  = wgs84togcj02(item.x, item.y);
                _this.arriveLocation = item.lnglat;
                data_row = item;
                $("#strategy p").html(data_row.guide);
                $("#ticket_rates p").html(data_row.ticket);
                $("#arrival_pattern p").html(data_row.howgo);
                if(_this.tourist_attractions_params.type === "东城景点"){
                    $("#linePath").removeClass("eatLinePath");
                    $(".brief-content").removeClass("less with-btn");
                    $(".method-content .text-wrap").addClass("mxh_120");
                }else{
                    $("#linePath").addClass("eatLinePath");
                    $(".brief-content").addClass("less with-btn");
                    $(".method-content .text-wrap").removeClass("mxh_120");
                }
                if ($(".brief-content .text-wrap .text").height() > 90) {
                    //内容高度超过150，截取内容, 显示『显示更多』 按钮
                    $(".brief-content").addClass("less with-btn");
                }
                break;
            }
        }
        var icon_type = "jingdian_1";
        data_row.type === "博物馆"? icon_type= "bowuguan_1":( data_row.type === "咖啡馆"?
            icon_type= "kafeiguan_1":( data_row.type === "茶/酒馆"? icon_type= "cha_1": icon_type= "jingdian_1" ) );
        _this.current_marker = new AMap.Marker({
            map: _this.mainMap,
            icon:new AMap.Icon({
                size: new AMap.Size(32, 32),
                image: service_config.icon_url + 'scenic_spot/'+icon_type+'.png',
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-16, -16)
            }),
            position: data_row.lnglat,
            offset: new AMap.Pixel(-16, -16),
            extData:data_row
        });
        _this.current_marker.on('click', function (ev) {
            var properties = ev.target.getExtData();
            var img_url = "images/play/scenicspot/";
            if(_this.tourist_attractions_params.type !== "东城景点"){
                img_url = "images/play/culturalspace/";
            }
            $("#scenic_spot_info .name").html(properties.name);
            $("#scenic_spot_info .info").html(properties.description);
            $("#scenic_spot_info .pointer-cover").html('<img src='+service_config.server_img_url+ img_url +((properties.name).replace(/\s*/g,""))+".jpg"+' />');
            $("#scenic_spot_info").removeClass("hide");
            _this.arriveLocation = ev.lnglat;
            _this.loadWalkingPathLayer();//规划步行线路
        });
    // })
}
//左侧筛选操作DOM
ScenicSpot.prototype.handleDomElement = function(){
    var _this = this;
    //搜索输入框enter触发
    $("#search_text").on("keydown",function(event){
        if(event.keyCode==13){
            $("#search_btn").trigger("click");
        }
    })
    //搜索触发
    $("#search_btn").on("click", function () {
        _this.initClear();
        _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
        _this.tourist_attractions_params.name = $("#search_text").val();
        if(_this.tourist_attractions_params.type === "东城景点"){
            _this.loadScenicSpot();
            $(".intro-content, .price-content, .line-content").show();
        }else{
            _this.loadTouristAttractions();
            $(".intro-content, .price-content, .line-content").hide();
        }
    });
    //点击分类类型筛选对应数据
    $("#scenic_spot_type li").on("click", function () {
        if ($(this).hasClass("active")) return;
        _this.initClear();
        _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
        $(this).addClass("active").siblings("li").removeClass("active");
        _this.tourist_attractions_params.type= $(this).attr("data-cat");
        if(_this.tourist_attractions_params.type === "东城景点"){
            _this.loadScenicSpot();
            $(".intro-content, .price-content, .line-content").show();
        }else{
            _this.loadTouristAttractions();
            $(".intro-content, .price-content, .line-content").hide();
        }
    });
}
//地图初始化
ScenicSpot.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
        resizeEnable:true,
	    center: [116.412255,39.908886],
	    zoom: 11,
    });
    var _this = this;
    
    // var start_location_marker = ""
    //点击地图区域
    this.mainMap.on('click', function(event){
        _this.startLocation = [event.lnglat.lng, event.lnglat.lat];
        _this.loadLinePath();
    });
    
let demo = document.getElementById("main_map");
 
demo.oncontextmenu = function(e) {
    e.preventDefault();
    // 执行代码块
    console.log(e)
}
    //定位当前位置
    this.mainMap.plugin('AMap.Geolocation', function() {
        _this.mainMap.addControl(new AMap.Geolocation());
        var geolocation = new AMap.Geolocation({
            // timeout: 10000,
            GeoLocationFirst:true,
            // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
            buttonOffset: new AMap.Pixel(10, 20),
            showButton : false,
            // zoomToAccuracy: true,  
        });
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
ScenicSpot.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    // this.loadScenicSpotLayer(); 
}
//选择不同类型出行方式规划相对应线路
ScenicSpot.prototype.linePathPlanning = function(){
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
ScenicSpot.prototype.loadLinePath = function(){
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
ScenicSpot.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
    });
    $.get(service_config.file_server_url+'boundary_data.json', function (data) {
        var boundary_data = data;
        boundaryLayer.setData(boundary_data,{lnglat: 'lnglat'})
        // boundaryLayer.setData(JSON.parse(Decrypt(data)), {
        //     lnglat: 'coordinates'
        // });
        var idx = 0;
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
//加载所有旅游点标识图层
ScenicSpot.prototype.loadScenicSpotLayer = function(){
    var _this = this;
    // _this.markers = [];
    // $.get(service_config.file_server_url+'scenic_spot_data.json', function (result) {
        var data = _this.tourist_attractions_list_data;
		for(var i = 0; i < data.length; i++){
            var item = data[i];
            var marker = new AMap.Marker({
                    map: _this.mainMap,
                    icon: _this.getMarkerIcon(item.type),
                    position: wgs84togcj02(item.x, item.y),
                    offset: new AMap.Pixel(-10, -10),
                    extData:item
                });
                marker.on('click', function (ev) {
                    _this.tourist_attractions_params.name = properties.name;
                    _this.get_play_details();
                    _this.loadWalkingPathLayer();//规划步行线路
                });
                _this.scenicSpotMarkers.push(marker);
                // _this.mainMap.setFitView();
		}
	// })
}
//步行线路
ScenicSpot.prototype.loadWalkingPathLayer = function(){
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
ScenicSpot.prototype.loadRidingPathLayer = function(){
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
ScenicSpot.prototype.loadTransferPathLayer = function(){
    //根据起终点坐标规划步行路线
    this.transferPathLayer.search(this.startLocation, this.arriveLocation, 
        function(status, result) {
            if (status === 'complete') {
                $("#scenic_spot_type").show()
                // console.log(result)
            } else {
            } 
    });
}
//驾车线路
ScenicSpot.prototype.loadDrivingPathLayer = function(){
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
ScenicSpot.prototype.getMarkerIcon = function(type){
    var icon_type = "jingdian";
    switch (type){
        case "博物馆":
            icon_type = "bowuguan";
        break;
        case "咖啡馆":
            icon_type = "kafeiguan";
        break;
        case "茶/酒馆":
            icon_type = "cha";
        break;
    }
    var icon = new AMap.Icon({
        size: new AMap.Size(16, 16),
        image: service_config.icon_url + 'scenic_spot/'+icon_type+'.png',
        imageOffset: new AMap.Pixel(0, 0), 
        imageSize: new AMap.Size(-8, -8)
    });
    return icon;
}
//加载信息窗体
ScenicSpot.prototype.loadInfo = function(name, introduction_text, center){
    var info = [];
    info.push('<div class="info_window">'+name+'</div>');
    info.push(introduction_text?'<div class="info_window text_indent">'+introduction_text+'</div>':"");
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
//清除图层
ScenicSpot.prototype.initClear = function(){
    this.walkingPathLayer.clear();
    this.ridingPathLayer.clear();
    this.transferPathLayer.clear();
    this.drivingPathLayer.clear();
    $("#scenic_spot_info").addClass("hide");
} 
var start_parking_difficult = new ScenicSpot();
start_parking_difficult.init();