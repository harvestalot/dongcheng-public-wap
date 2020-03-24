//东城活力
function Vitality(){
    this.lenged_data = ["音乐", "戏剧", "展览", "电影",
        "公益", "讲座", "聚会", "课程", "其他"];
    this.radar_chart_indicator_data = [];
    this.radar_chart_data = {};
    this.mainMap = "";
    this.populationVitalityLayer = "";//人口活力人力图层
    this.cultureVitalityLayer = "";//文化活力图层
    this.vitalityPointBorderLayer = "";//活力点边界图层
    this.currentVitalityPointBorderLayer = "";//当前活力点高亮图层
    this.currentTime = "00:00";
    this.mainVitalityPointName = getUrlVars().name ? window.decodeURI(getUrlVars().name) : "";//重要活力点
    this.vitality_type = "";//活力图层类型
    this.isCheckedVitality = false;//是佛选中图层类型
    this.current_type = getUrlVars().type ? window.decodeURI(getUrlVars().type) : "";
}

Vitality.prototype.init = function(){
    $("#bread_crumb_title").html( this.mainVitalityPointName ? this.current_type+"&nbsp;/&nbsp;"+this.mainVitalityPointName : this.current_type);
    $("#heat_type_title").html(this.current_type);
    var _this = this;
    $("#vitality_type li").on("tap", function(i){
        if($(this).hasClass("active")){
            $(this).toggleClass("active");
            // $("#timeline").fadeOut(300);
            _this.populationVitalityLayer.hide();
            _this.cultureVitalityLayer.hide();
            return;
        }else{
            $(this).addClass("active").siblings("li").removeClass("active");
            _this.isCheckedVitality = true;
            _this.vitality_type = $(this).attr("data_type");
            _this.layerInit();
        }
    });
    $("#heat_type_select").on("change",function(){
        _this.current_type = $(this).val();
        $("#bread_crumb_title").html(_this.current_type);
        $("#heat_type_title").html(_this.current_type);
        _this.loadCurrentVitalityTypeList();
    })
    this.mainVitalityPointName ? this.get_view_chart_data() : this.loadCurrentVitalityTypeList();
    this.mapInit();
}
//地图初始化
Vitality.prototype.mapInit = function(){
    //加载主地图
    this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
        center: [116.412255,39.918886],
        zoom: 11,
    });
    //加载东城边界
    this.loadBoundaryLayer();
    //默认加载所有重要区域边界
    this.loadVitalityPointBorderLayer();
    //获取当前活力点详情
    this.mainVitalityPointName ? this.loadCurrentVitalityPointBorderLayer() : "";
    //加载人口热力图图层
    this.populationVitalityLayer = new Loca.HeatmapLayer({
        map: this.mainMap,
    });
    //加载文化热力图图层
    this.cultureVitalityLayer = new Loca.HeatmapLayer({
        map: this.mainMap,
    });
    //活力点边界图层
    this.vitalityPointBorderLayer = new Loca.LineLayer({
        map: this.mainMap,
        eventSupport:true,
        // fitView: true,
    });
    //点击左侧活力点触发当前活力点高亮
    this.currentVitalityPointBorderLayer = new Loca.LineLayer({
        map: this.mainMap,
    });
}
//图层初始化
Vitality.prototype.layerInit = function(){
    if(this.vitality_type === "population"){
        this.cultureVitalityLayer.hide();
        this.loadPopulationVitalityLayer()
        this.timeline();
        // $("#timeline").fadeIn(300);
    }else{
        // $("#timeline").fadeOut(300);
        this.populationVitalityLayer.hide();
        this.loadCultureVitalityLayer();
    }
}

//各个社区边界范围图层
Vitality.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
        zIndex: 13,
    });
    $.get(service_config.file_server_url+'dongcheng_boundary_data.json', function (result) {
        var data = result;
        boundaryLayer.setData(data,{lnglat: 'lnglat'})
        boundaryLayer.setOptions({
            style: {
                borderWidth: 2,
                color:"#222",
            },
        });
        boundaryLayer.render();
    }); 
}
//重要活力点范围边界
Vitality.prototype.loadVitalityPointBorderLayer= function(){
    var _this = this;
    $.get(service_config.file_server_url+'important_culture_area_border_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        _this.vitalityPointBorderLayer.setData(data, {
            lnglat: 'lnglat',
        });
        _this.vitalityPointBorderLayer.setOptions({
            style: {
                borderWidth: 2,
                opacity: 1,
                // color: '#86100F',
                color: function(res){
                    var type = res.value.properties.type;
                    var color ="#1afa29";
                    switch (type){
                        case "公园":
                            color = "#1afa29";
                        break;
                        case "文化遗产":
                            color = "#e2762d";
                        break;
                        case "商圈":
                            color = "#f71035";
                        break;
                        case "历史街区":
                            color = '#0a88f5';
                        break;
                    }
                    return color;
                },
            }
        });
        _this.vitalityPointBorderLayer.render();
    })
}
//加载人口活力图层
Vitality.prototype.loadPopulationVitalityLayer = function(){
    var _this = this;
    $.get(service_config.file_server_url+'culture_vitality_1.csv', function (result) {
        var data = result;
        _this.populationVitalityLayer.setData(data, {
            value: function (params) {
                if (params) {
                     var value = params[_this.currentTime];
                     return value;
                }
            },
            // 或者使用回调函数构造经纬度坐标
             lnglat: function (obj) {
                if (obj.value) {
                     var value = obj.value;
                     var lnglat = wgs84togcj02(value['LON'], value['LAT']);
                     return lnglat;
                }
             },
            // 指定数据类型
            type: 'csv'
        });
        _this.populationVitalityLayer.setOptions({
            style: {
                radius: 11,
                color: {
                    0.1:"#2892C6",
                    0.2:"#81B3AA",
                    0.3: '#BFD38B',
                    0.4: '#FAFA64',
                    0.5: '#FCB344',
                    0.7: '#FD0100',
                    1:"#A80000",
                },
                // opacity:[0.3,0.7]
            }
        });
        _this.populationVitalityLayer.render();
        _this.populationVitalityLayer.show();
    })
}
//文化热力图层
Vitality.prototype.loadCultureVitalityLayer = function(){
    var _this = this;
    $.get(service_config.file_server_url+'culture_vitality_data.json', function (result) {
        var data = result;
        _this.cultureVitalityLayer.setData(data, {
            lnglat: "lnglat",
        });
        _this.cultureVitalityLayer.setOptions({
            style: {
                radius: 8,
                color: {
                    0.5: '#2c7bb6',
                    0.65: '#abd9e9',
                    0.7: '#ffffbf',
                    0.9: '#fde468',
                    1.0: '#d7191c'
                },
                opacity:[0.3,0.7]
            }
        });
        _this.cultureVitalityLayer.render();
        _this.cultureVitalityLayer.show();
    })
}
//时间轴
Vitality.prototype.timeline = function(){
    var option = {
        timeline: {
            left:10,
            right:10,
            bottom:10,
            axisType: 'category',
            // realtime: false,
            // loop: false,
            autoPlay: true,
            // currentIndex: 0,
            playInterval: 3000,
            controlStyle: {
                // show: false,
                showNextBtn: false,
                showPrevBtn: false,
            },
            data: timeLine,
            checkpointStyle:{
                symbolSize:12,
                color:"#86100F",
            },
            label: {
                color:"#fff",
                lineHeight: 30,
            }
        }
    };
    var timelineChart = echarts.init(document.getElementById("timeline"));
    timelineChart.setOption(option, true);
    var _this = this;
    timelineChart.on("timelinechanged",function(params) {
        _this.currentTime = timeLine[params.currentIndex];
        _this.vitality_type === "population" && _this.isCheckedVitality
            ?_this.loadPopulationVitalityLayer():"";
    })
}
//根据活力类型加载当前类型的列表
Vitality.prototype.loadCurrentVitalityTypeList= function(){
    var _this = this;
    var img_url = "images/culturalheritage/";//文化遗产
    if(_this.current_type === "历史街区"){
        img_url = "images/street/";
    }else if(_this.current_type === "公园"){
        img_url = "images/park/";
    }else if(_this.current_type === "商圈"){
        img_url = "images/business/";
    }
    $.get(service_config.file_server_url+'important_culture_area_border_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        var new_data = "";
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            if(item.properties.type === _this.current_type){
                new_data += '<a href="heat-detail.html?type='+_this.current_type+'&name='+ item.properties.name +'" class="item block squard-shadow"> '+
                    '<h3 class="s-color tcenter">'+ item.properties.name +'</h3> '+
                    '<div> '+
                        '<img src='+service_config.server_img_url+ img_url +((item.properties.name).replace(/\s*/g,""))+".jpg"+' class="w100 block" /> '+
                    '</div> '+
                '</a>';
            }
        }
        $("#vitality_type_list").html(new_data);
    })
}
//根据具体活力点加载当前范围边界
Vitality.prototype.loadCurrentVitalityPointBorderLayer= function(){
    var _this = this;
    $.get(service_config.file_server_url+'important_culture_area_border_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            if(item.properties.name === _this.mainVitalityPointName){
                _this.currentVitalityPointBorderLayer.setData([item], {
                    lnglat: 'lnglat',
                });
                var img_url = "images/culturalheritage/";//文化遗产
                if(_this.current_type === "历史街区"){
                    img_url = "images/street/";
                }else if(_this.current_type === "公园"){
                    img_url = "images/park/";
                }else if(_this.current_type === "商圈"){
                    img_url = "images/business/";
                }
                $("#detail_name").html(item.properties.name);
                $("#detail_name_img").attr("src", service_config.server_img_url+ img_url +((item.properties.name).replace(/\s*/g,""))+".jpg");
                $("#introduction p").html(item.properties.introduce_text);
            }
        }
        _this.currentVitalityPointBorderLayer.setOptions({
            style: {
                borderWidth: 3,
                opacity: 1,
                color: '#f8ef06',
            }
        });
        _this.currentVitalityPointBorderLayer.render();
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
//分类拆分数据
Vitality.prototype.get_view_chart_data = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+"vigour/getVigourList",{},function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            _this.radar_chart_indicator_data.push({
                name: item.streetName.replace("街道",""),
                // max:100,
                color:'#222',
                rotate:90
            })
        }
        var lenged_english_data = ["music", "theatre", "display", "film", "publicWelfare", "lecture", "party", "curriculun", "others"];
        for(var i = 0; i < lenged_english_data.length; i++){
            var itemData = [];
            for(var j = 0; j < data.length; j++){
                var item = data[j];
                itemData.push(item[lenged_english_data[i]]);
            }
            _this.radar_chart_data[_this.lenged_data[i]] = itemData;
        }
        _this.load_radar_chart();
    })
}
//文化活力项目覆盖率雷达图图表数据
Vitality.prototype.load_radar_chart = function(){
    var radarChart = echarts.init(document.getElementById("culture_coverage_content"));
    var radar_option = {
        color: echarts_colors,
        // title:get_object_assign({
        //     text:"各类型文化活动数量统计图",
        // },echart_title),
        legend: {
            show: true,
            left:20,
            top: 20,
            textStyle: {
                "fontSize": 12,
                "color": "#222"
            },
            "data": this.lenged_data,
            selected: {
                '音乐': true,
                '戏剧': false,
                '展览': false,
                '电影': false,
                '公益': false,
                '讲座': false,
                '聚会': false,
                '课程': false,
                '其他': false,
            }
        },
        tooltip: {
            show: true,
            trigger: "item"
        },
        radar: {
            center: ["50%", "58%"],
            radius: "60%",
            startAngle: 90,
            splitNumber: 4,
            shape: "circle",
            splitArea: {
                "areaStyle": {
                    "color": ["transparent"]
                }
            },
            // axisLabel: {
            //     "show": false,
            //     "fontSize": 18,
            //     "color": "#666",
            //     "fontStyle": "normal",
            //     "fontWeight": "normal",
            //     rotate:90,
            // },
            axisLine: {
                "show": true,
                "lineStyle": {
                    "color": "grey"//
                }
            },
            splitLine: {
                "show": true,
                "lineStyle": {
                    "color": "grey"//
                }
            },
            indicator: this.radar_chart_indicator_data
        },
        "series": []
    };
    for(var i = 0; i < this.lenged_data.length; i++){
        radar_option.series.push(
            {
                "name": this.lenged_data[i],
                "type": "radar",
                "symbol": "circle",
                "symbolSize": 5,
                "areaStyle": {
                    "normal": {
                        "color": echarts_colors[i],
                        opacity:0.5,
                    }
                },
                itemStyle:{
                    color:echarts_colors[i],
                    borderColor:echarts_colors[i],
                    borderWidth:5,
                    opacity:0.5,
                },
                "lineStyle": {
                    "normal": {
                        "type": "dashed",
                        "color": echarts_colors[i],
                        "width": 2,
                        opacity:0.3,
                    }
                },
                "data": [
                    this.radar_chart_data[this.lenged_data[i]]
                ]
            }); 
    }
    radarChart.setOption(radar_option, true);
    window.onresize = function(){
        radarChart.resize();
    }
}

var start_parking_difficult = new Vitality();
start_parking_difficult.init(); 