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
        this.tourist_attractions_params.type === "东城景点" ? $(".no_cultural_travel").show() : $(".no_cultural_travel").hide();
        this.get_play_details();
    }else if(this.tourist_attractions_params.type){
        $("#bread_crumb_title, #heat_type_title").html(this.tourist_attractions_params.type);
        this.loadScenicSpot();
    }
    this.mapInit();
    this.loadBoundaryLayer();
    this.linePathPlanning();//出行方式
    var _this = this;
    $("#play_type_select").on("change",function(){
        _this.tourist_attractions_params.type = $(this).val();
        $("#bread_crumb_title, #heat_type_title").html(_this.tourist_attractions_params.type);
        _this.mainMap.clearMap();
        _this.loadScenicSpot();
    })
}
//加载游玩类型数据列表
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
//地图初始化
ScenicSpot.prototype.mapInit = function(){
    this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
        resizeEnable:true,
        center: [116.412255,39.918886],
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
            _this.scenicSpotMarkers.push(marker);
    }
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
        _this.mainMap.setFitView();
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
//清除图层
ScenicSpot.prototype.initClear = function(){
    this.walkingPathLayer.clear();
    this.ridingPathLayer.clear();
    this.transferPathLayer.clear();
    this.drivingPathLayer.clear();
}

var start_parking_difficult = new ScenicSpot();
start_parking_difficult.init();