//东城简介
function Introduction(){

}
Introduction.prototype.init = function(){
    this.loadLandAreaChart();
    this.loadPopulationChart();
    this.loadPopulationDensityChart();
    this.loadLegalEntityChart();
}
//东城区各街道土地面积
Introduction.prototype.loadLandAreaChart = function(){
    var data = [
        {"name":"东华门街道","area":"5.35","density":"12673"},
        {"name":"景山街道","area":"1.64","density":"24555"},
        {"name":"交道口街道","area":"1.45","density":"37250"},
        {"name":"安定门街道","area":"1.76","density":"30145"},
        {"name":"北新桥街道","area":"2.62","density":"30669"},
        {"name":"东四街道","area":"1.53","density":"29724"},
        {"name":"朝阳门街道","area":"1.24","density":"34919"},
        {"name":"建国门街道","area":"2.7","density":"21015"},
        {"name":"东直门街道","area":"2.07","density":"25288"},
        {"name":"和平里街道","area":"5.02","density":"25019"},
        {"name":"前门街道","area":"1.1","density":"18193"},
        {"name":"崇文门外街道","area":"1.1","density":"36185"},
        {"name":"东花市街道","area":"2","density":"22730"},
        {"name":"龙潭街道","area":"3.06","density":"20936"},
        {"name":"体育馆路街道","area":"1.84","density":"24049"},
        {"name":"天坛街道","area":"4.03","density":"12682"},
        {"name":"永定门外街道","area":"3.33","density":"25035"}
    ]
    var chartInstance = echarts.init(document.getElementById("land_area_content"));
    var option = {
        title:{
            text:"各街道土地面积统计图",
            left:20,
            top:20,
            textStyle:{
                color: '#222',
                fontSize: 16
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            top: '20%',
            right: '3%',
            left: '9%',
            bottom: '12%'
        },
        xAxis: {
            type: 'category',
            data: [],
            axisLine: coordinate_axis_style.axisLine,
            axisLabel: { ...coordinate_axis_style.axisLabel, ...{
                formatter:function(val){
                    return val.split("").join("\n");
                }
            }},
            splitLine: coordinate_axis_style.splitLine,
        },
        yAxis: {
            name:"平方公里",
            axisLabel: {
                formatter: '{value}',
                color: '#666',
            },
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        series: {
            type: 'bar',
            data: [],
            // barWidth: '15px',
            barCategoryGap: 8,
            itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(0,244,255,1)' // 0% 处的颜色
                    }, {
                        offset: 1,
                        color: 'rgba(0,77,167,1)' // 100% 处的颜色
                    }], false),
                    barBorderRadius: [30, 30, 30, 30],
                    // shadowColor: 'rgba(0,160,221,1)',
                    shadowBlur: 5,
                }
            },
            // label: {
            //     normal: {
            //         show: true,
            //         width: 70,
            //         height: 26,
            //         lineHeight: 26,
            //         backgroundColor: 'rgba(0,0,0,0.3)',
            //         borderRadius: 200,
            //         position: ['-8', '-60'],
            //         distance: 1,
            //         formatter: [
            //             '    {d|●}',
            //             ' {a|{c}}     \n',
            //             '    {b|}'
            //         ].join(','),
            //         rich: {
            //             d: {
            //                 color: '#3CDDCF',
            //             },
            //             a: {
            //                 color: '#fff',
            //                 align: 'center',
            //             },
            //             b: {
            //                 width: 1,
            //                 height: 30,
            //                 borderWidth: 1,
            //                 borderColor: '#234e6c',
            //                 align: 'left'
            //             },
            //         }
            //     }
            // }
        }
    };
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        option.xAxis.data.push(item.name.replace("街道",""));
        option.series.data.push(item.area);
    }
    chartInstance.setOption(option, true);
    window.onresize = function(){
        chartInstance.resize();
    }
}
//东城区各街道人口数量
Introduction.prototype.loadPopulationChart = function(){
    var data = [
        {"name":"东华门街道","value":"67803"},
        {"name":"景山街道","value":"40271"},
        {"name":"交道口街道","value":"54012"},
        {"name":"安定门街道","value":"53056"},
        {"name":"北新桥街道","value":"80354"},
        {"name":"东四街道","value":"45477"},
        {"name":"朝阳门街道","value":"43300"},
        {"name":"建国门街道","value":"56741"},
        {"name":"东直门街道","value":"52346"},
        {"name":"和平里街道","value":"125597"},
        {"name":"前门街道","value":"20012"},
        {"name":"崇文门外街道","value":"39804"},
        {"name":"东花市街道","value":"45460"},
        {"name":"龙潭街道","value":"64063"},
        {"name":"体育馆路街道","value":"44251"},
        {"name":"天坛街道","value":"51108"},
        {"name":"永定门外街道","value":"83367"}
    ]
    var chartInstance = echarts.init(document.getElementById("population_content"));
    var spirit = 'data:image/png;base64,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';
    var spirit2 = 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAADYElEQVR4nO2dz0sUYRjHP7tIdAmxQ1LdlhCKMohAIsgiyEuHjkUEFQTlpejS/xCCBB06RBGBBKIG4cGyH0qHBKE9eKyFqBQPRQeNCt06vGNY7bq7szPfeZLnAwuzM+/zgw/DDvMu70wOIVveLscJOwycA44A24CfwAfgKXAbeFVvovlC/o/vuVwuTj+x0FWiYdGbgXvA8RrjHgAXgIVaCbMU3SKr1BhtwEtgZx1jTwI7gG7ga5pNNUO+9pBMuEN9klfYD9xMqZdEsCj6AHAiRtxZYFeyrSSHRdGnYsblCD8jJrEoek8TsbsT6yJhLIrelFFsqlgUPZtRbKpYFP2kidjxxLpIGIuiB4AvMeLmgJGEe0kMi6I/AVdjxPVSx91hVlgUDXAXuEaY16jFMnAJeJhqR01iVTTAdeAYUFxjzBRwCLgl6agJrM51rDAO7AP2EmbxthPO8vfAc2Ams84axLpoCGKLrH1mm8eC6KPAGaAL2Fpj7AZgY7T9DfhRY/wc4eflPmH+OjOynI8uEGbpukXlJ4Dz84V8aWWHcj46q4thFzCNTjJRren2UrlLWPM3WYjuAMYIk/tq2oCx9lK5Q11YLboFGARaxXVX0woMtpfK0uuTWvRFoFNcsxKdhF5kqEX3iuuthbQXtehG/gdMG2kvlm/B1xUuWoSLFmFF9CRwg2TnM4pRzskEc8bGiugR4ArhNjkpJqKcJv51sSJ63eOiRbhoES5ahIsW4aJFuGgRLlqEixbhokW4aBEuWoSLFuGiRbhoES5ahIsW4aJFuGgRLlqEWvTHKvs/p1izWu5qvaSCWvTlCvtmgeEUaw5TeUVtpV5SQy16COgBRoHXhMWb3aS7PnAhqjEQ1RwFeuYL+aEUa/5DFmtYHkefOEwQVmcBvKD+FQNvgNN/P+pHiV8MRbhoES5ahIsW4aJFuGgRLlqEixbhokW4aBEuWoSLFuGiRbhoES5ahIsW4aJFuGgRLlqEixbhokVYEx3nudGKXE1jTfS6xUWLcNEiXLQIFy3CRYtw0SJctAgXLcJFi3DRIv430eUq2+axJvp7jePPqmzHySXFmuhHwFKVYzNA/6rv/VR/s9BSlMsM1kTPEN4DPkU4I8vAO6APOAgsrhq7GO3ri8aUo5ipKIep1zv9AtipgOACGIrLAAAAAElFTkSuQmCC';

    var option = {
        "title": {
            text:"各街道人口数量统计图",
            left:20,
            top:0,
            textStyle:{
                color: '#222',
                fontSize: 16
            }
        },
        "grid": {
            "left": 70,
            "top": "10%",
            "bottom": 10
        },
        "tooltip": {
            "trigger": "item",
            "textStyle": {
                "fontSize": 12
            },
            "formatter": "{b0}:{c0}"
        },
        "xAxis": {
            "splitLine": {
                "show": false
            },
            "axisLine": {
                "show": false
            },
            "axisLabel": {
                "show": false
            },
            "axisTick": {
                "show": false
            }
        },
        "yAxis":{
            "type": "category",
            "inverse": false,
            "data": [],
            "axisLine": {
                "show": false
            },
            "axisTick": {
                "show": false
            },
            "axisLabel": {
                "textStyle": {
                    "color": "#666",
                    "fontSize": 14
                }
            }
        },
        "series": {
            "type": "pictorialBar",
            "symbol": 'image://http://peking.caupdcloud.com/dongcheng/assets/mapdata/images/population.png',
            "symbolRepeat": "fixed",
            "symbolMargin": "5%",
            "symbolClip": true,
            "symbolSize": 22.5,
            "symbolPosition": "start",
            "symbolOffset": [
                20,
                0
            ],
            "symbolBoundingData": 100000,
            "data": [],
        },
    };
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        option.yAxis.data.push(item.name.replace("街道",""));
        option.series.data.push(item.value);
    }
    chartInstance.setOption(option, true);
    window.onresize = function(){
        chartInstance.resize();
    }
}
//东城区各街道人口密度比较
Introduction.prototype.loadPopulationDensityChart = function(){
    var data = [
        {"name":"东华门街道","area":"5.35","density":"12673"},
        {"name":"景山街道","area":"1.64","density":"24555"},
        {"name":"交道口街道","area":"1.45","density":"37250"},
        {"name":"安定门街道","area":"1.76","density":"30145"},
        {"name":"北新桥街道","area":"2.62","density":"30669"},
        {"name":"东四街道","area":"1.53","density":"29724"},
        {"name":"朝阳门街道","area":"1.24","density":"34919"},
        {"name":"建国门街道","area":"2.7","density":"21015"},
        {"name":"东直门街道","area":"2.07","density":"25288"},
        {"name":"和平里街道","area":"5.02","density":"25019"},
        {"name":"前门街道","area":"1.1","density":"18193"},
        {"name":"崇文门外街道","area":"1.1","density":"36185"},
        {"name":"东花市街道","area":"2","density":"22730"},
        {"name":"龙潭街道","area":"3.06","density":"20936"},
        {"name":"体育馆路街道","area":"1.84","density":"24049"},
        {"name":"天坛街道","area":"4.03","density":"12682"},
        {"name":"永定门外街道","area":"3.33","density":"25035"}
    ]
    var chartInstance = echarts.init(document.getElementById("population_density_content"));
    var spirit = 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAADYElEQVR4nO2dz0sUYRjHP7tIdAmxQ1LdlhCKMohAIsgiyEuHjkUEFQTlpejS/xCCBB06RBGBBKIG4cGyH0qHBKE9eKyFqBQPRQeNCt06vGNY7bq7szPfeZLnAwuzM+/zgw/DDvMu70wOIVveLscJOwycA44A24CfwAfgKXAbeFVvovlC/o/vuVwuTj+x0FWiYdGbgXvA8RrjHgAXgIVaCbMU3SKr1BhtwEtgZx1jTwI7gG7ga5pNNUO+9pBMuEN9klfYD9xMqZdEsCj6AHAiRtxZYFeyrSSHRdGnYsblCD8jJrEoek8TsbsT6yJhLIrelFFsqlgUPZtRbKpYFP2kidjxxLpIGIuiB4AvMeLmgJGEe0kMi6I/AVdjxPVSx91hVlgUDXAXuEaY16jFMnAJeJhqR01iVTTAdeAYUFxjzBRwCLgl6agJrM51rDAO7AP2EmbxthPO8vfAc2Ams84axLpoCGKLrH1mm8eC6KPAGaAL2Fpj7AZgY7T9DfhRY/wc4eflPmH+OjOynI8uEGbpukXlJ4Dz84V8aWWHcj46q4thFzCNTjJRren2UrlLWPM3WYjuAMYIk/tq2oCx9lK5Q11YLboFGARaxXVX0woMtpfK0uuTWvRFoFNcsxKdhF5kqEX3iuuthbQXtehG/gdMG2kvlm/B1xUuWoSLFmFF9CRwg2TnM4pRzskEc8bGiugR4ArhNjkpJqKcJv51sSJ63eOiRbhoES5ahIsW4aJFuGgRLlqEixbhokW4aBEuWoSLFuGiRbhoES5ahIsW4aJFuGgRLlqEWvTHKvs/p1izWu5qvaSCWvTlCvtmgeEUaw5TeUVtpV5SQy16COgBRoHXhMWb3aS7PnAhqjEQ1RwFeuYL+aEUa/5DFmtYHkefOEwQVmcBvKD+FQNvgNN/P+pHiV8MRbhoES5ahIsW4aJFuGgRLlqEixbhokW4aBEuWoSLFuGiRbhoES5ahIsW4aJFuGgRLlqEixbhokVYEx3nudGKXE1jTfS6xUWLcNEiXLQIFy3CRYtw0SJctAgXLcJFi3DRIv430eUq2+axJvp7jePPqmzHySXFmuhHwFKVYzNA/6rv/VR/s9BSlMsM1kTPEN4DPkU4I8vAO6APOAgsrhq7GO3ri8aUo5ipKIep1zv9AtipgOACGIrLAAAAAElFTkSuQmCC';

    var option = {
        "title": {
            text:"各街道户籍人口密度（人/平方公里）统计图",
            left:20,
            top:0,
            textStyle:{
                color: '#222',
                fontSize: 16
            }
        },
        "grid": {
            "left": 70,
            "top": "10%",
            "bottom": 10
        },
        "tooltip": {
            "trigger": "item",
            "textStyle": {
                "fontSize": 12
            },
            "formatter": "{b0}:{c0}"
        },
        "xAxis": {
            "splitLine": {
                "show": false
            },
            "axisLine": {
                "show": false
            },
            "axisLabel": {
                "show": false
            },
            "axisTick": {
                "show": false
            }
        },
        "yAxis": {
            "type": "category",
            "inverse": false,
            "data": [],
            "axisLine": {
                "show": false
            },
            "axisTick": {
                "show": false
            },
            "axisLabel": {
                "textStyle": {
                    "color": "#666",
                    "fontSize": 14
                }
            }
        },
        "series": {
            "type": "pictorialBar",
            "symbol": spirit,
            "symbolRepeat": "fixed",
            "symbolMargin": "5%",
            "symbolClip": true,
            "symbolSize": 22.5,
            "symbolPosition": "start",
            "symbolOffset": [
                20,
                0
            ],
            "symbolBoundingData": 100000,
            "data": [],
        },
    };
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        option.yAxis.data.push(item.name.replace("街道",""));
        option.series.data.push(item.density);
    }
    chartInstance.setOption(option, true);
    window.onresize = function(){
        chartInstance.resize();
    }
}
//东城区各街道（限额）以上法人单位基本情况比较
Introduction.prototype.loadLegalEntityChart = function(){
    var data = [
        {"name":"东华门街道","2017":"505","2016":"503"},
        {"name":"景山街道","2017":"78","2016":"73"},
        {"name":"交道口街道","2017":"70","2016":"69"},
        {"name":"安定门街道","2017":"78","2016":"74"},
        {"name":"北新桥街道","2017":"276","2016":"277"},
        {"name":"东四街道","2017":"171","2016":"154"},
        {"name":"朝阳门街道","2017":"164","2016":"154"},
        {"name":"建国门街道","2017":"373","2016":"361"},
        {"name":"东直门街道","2017":"331","2016":"313"},
        {"name":"和平里街道","2017":"440","2016":"423"},
        {"name":"前门街道","2017":"33","2016":"30"},
        {"name":"崇文门外街道","2017":"150","2016":"149"},
        {"name":"东花市街道","2017":"98","2016":"99"},
        {"name":"龙潭街道","2017":"178","2016":"186"},
        {"name":"体育馆路街道","2017":"112","2016":"115"},
        {"name":"天坛街道","2017":"83","2016":"80"},
        {"name":"永定门外街道","2017":"81","2016":"81"}
    ]
    var chartInstance = echarts.init(document.getElementById("legal_entity_content"));
    var option = {
        color: ["#85ccc8"],
        title:{
            text:"各街道（限额）以上法人单位统计图",
            left:20,
            top:20,
            textStyle:{
                color: '#222',
                fontSize: 16
            }
        },
        tooltip: {},
        grid: {
            top: '20%',
            right: '3%',
            left: '5%',
            bottom: '12%'
        },
        xAxis: {
            type: "category",
            data: [],
            axisLine: coordinate_axis_style.axisLine,
            axisLabel: { ...coordinate_axis_style.axisLabel, ...{
                formatter:function(val){
                    return val.split("").join("\n");
                }
            }},
            splitLine: coordinate_axis_style.splitLine,
        },
        "yAxis": [{
            name:"数量",
            axisLabel: {
                formatter: '{value}',
                color: '#666',
            },
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        }],
        "series": [{
            "name": "",
            "type": "pictorialBar",
            "symbolSize": [10, 5],
            "symbolOffset": [0, -2],
            "symbolPosition": "end",
            "z": 12,
            "label": {
                "normal": {
                    "show": true,
                    "position": "top",
                    "formatter": "{c}"
                }
            },
            "data": []
        }, {
            "name": "",
            "type": "pictorialBar",
            "symbolSize": [10, 5],
            "symbolOffset": [0, 2],
            "z": 12,
            "data": []
        }, {
            "type": "bar",
            "itemStyle": {
                "normal": {
                    "opacity": 0.7
                }
            },
            "barWidth": 10,
            barCategoryGap: 8,
            "data": [],
            // "markLine": {
            //     "silent": true,
            //     "symbol": "none",
            //     "label": {
            //         "position": "middle",
            //         "formatter": "{b}"
            //     },
            //     "data": [{
            //         "name": "目标值",
            //         "yAxis": 80,
            //         "lineStyle": {
            //             "color": "#ffc832"
            //         },
            //         "label": {
            //             "position": "end",
            //             "formatter": "{b}\n {c}%"
            //         }
            //     }]
            // }
        }]
    }
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        option.xAxis.data.push(item.name.replace("街道",""));
        option.series[0].data.push(item["2017"]);
        option.series[1].data.push(item["2017"]);
        option.series[2].data.push(item["2017"]);
    }
    chartInstance.setOption(option, true);
    window.onresize = function(){
        chartInstance.resize();
    }
}
var start_introduction = new Introduction();
start_introduction.init(); 