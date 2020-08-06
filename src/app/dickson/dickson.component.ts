import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d31 from 'd3';

//import * as moment from 'moment';

@Component({
  selector: 'app-dickson',
  templateUrl: './dickson.component.html',
  styleUrls: ['./dickson.component.css']
})

export class DicksonComponent implements OnInit {

  private innerLabelColor: any = "#3A3AFF";
  private nestedCirlceColor: any = "#0F86FF";
  private axisLineColor: any = "#3333FF";
  private tickCircleColor: any = "#1B8CFF";
  private innerRadius: any = 90;
  private outerRadius: any = 490;
  private gapBetweenOuterRadiusAndAxisTickCircles: any = 40;
  private gapBetweenEachInnerCircle: any = (this.outerRadius - this.innerRadius - this.gapBetweenOuterRadiusAndAxisTickCircles) / 75;
  private innerCiclesLastTickRadius: any = 0;
  private chartData: any;
  private plotLineColor:any = "red";

  constructor() { }

  ngOnInit() {
    this.fetchDataFromExternalFiles();
  }

  fetchDataFromExternalFiles() {
    d31.csv('assets/MilkTankTemp-7days.csv')
      .then((data) => {
        this.chartData = this.formatData(data);
        this.drawChart(this.chartData);
      })
      .catch((error) => {
        console.log("error while formating data");
      });
  }

  formatData(rawData: any) {
    let newData = [];

    let dicksonChartData = [];

    for (let i = 0; i < rawData.length; i++) {
      // iterate all properties of object
      let tempDetailObj = {
        "Timestamp": rawData[i]["Timestamp"],
        "TimestampDate": new Date(rawData[i]["Timestamp"]),
        "TimestampDateParsed": Date.parse(rawData[i]["Timestamp"]),
        "subCategory": [],
        "CircuitName": rawData[i]["Circuit Name"],
        "MilkTank": rawData[i]["Milk Tank 1"],
        "Temp": rawData[i]["Milk Tank 1"]
      };

      if (tempDetailObj.CircuitName == '1') {
        dicksonChartData.push(tempDetailObj);
      }
    }
    return dicksonChartData;
  }

  private drawChart(chartData: any) {
    if (chartData != null && chartData != undefined && chartData.length > 0) {
      console.log(JSON.stringify(chartData));
      //chartData = chartData[0];
    }

    // size of the diagram
    var viewerWidth = 1000;
    var viewerHeight = 1000;

    var baseSvg = d3.select("#divChartContainer").append("svg")
      .attr("width", viewerWidth)
      .attr("height", viewerHeight)
      .attr("class", "overlay");

    // center out svg group
    var svgGroup = baseSvg.append("g")
      .attr("transform", "translate(" + viewerWidth / 2 + "," + viewerHeight / 2 + ")");;

    var circleScale = d31.scaleLinear().domain([10, 130]).range([0, 960]);

    var chartDataTemp = [{ 'Timestamp': 100, 'temp': 150 }, { 'Timestamp': 150, 'temp': 150 }
      , { 'Timestamp': 200, 'temp': 150 }, { 'Timestamp': 250, 'temp': 150 }, { 'Timestamp': 300, 'temp': 150 }
      , { 'Timestamp': 350, 'temp': 150 }, { 'Timestamp': 400, 'temp': 150 }];

    var cx = viewerWidth / 2, cy = viewerHeight / 2;
    var outerCircleRadius = 0;

    // draw inner circles
    // total inner circles are 75 + 14 [free space] + 1 outer border circle
    for (var i = 0; i < 75; i++) {
      svgGroup.append("circle")

        .attr("class", "innerCircles")
        .attr("stroke-opacity", 1)
        .style("stroke-width", function (d) {
          if (i % 10 == 0 || i == 74) {
            return "1.5px";
          }
          else {
            return "1px";
          }
        })
        .style("fill", "transparent").style("stroke", (d) => {
          if (i % 10 == 0 || i == 74) {
            return this.tickCircleColor;
          }
          else {
            return this.innerLabelColor;
          }
        })
        .style("opacity", function (d) {
          if (i > 75 && i != 89) {
            return 0;
          }
          else {
            return 1;
          }
        })
        .attr("r", this.innerRadius + (i * this.gapBetweenEachInnerCircle));
      this.innerCiclesLastTickRadius = this.innerRadius + (i * this.gapBetweenEachInnerCircle);
    }

    svgGroup.append("circle")
      .attr("class", "outerCircles")
      .attr("stroke-opacity", 1)
      .style("stroke", this.tickCircleColor)
      .style("stroke-width", "1.5px")
      .style("fill", "transparent")
      .attr("r", this.outerRadius - 2);

    this.generateShadedCircles(svgGroup, cx, cy);
    // generate curved axis lines
    this.generateInnerAxis(svgGroup, cx, cy);

    // generate white line to give effect of disconnected lines
    this.generateWhiteBorderCircleInOuterRadius(svgGroup, cx, cy);

    // add inner labels
    this.drawCenterLabels(svgGroup, 0, 0, []);

    this.drawWeekDayLabels(svgGroup, cx, cy);
    this.generateTimeLabels(svgGroup, cx, cy);
    this.generateTimeHoursTicks(svgGroup, cx, cy);

    this.generateCurvedAxis(svgGroup, cx, cy);

    this.plotTemperatureLine(svgGroup, cx, cy);
  }

  private reArrangeDataToStartFromSunday(chartActualData:any){
     var reArrangedData = [];
     var sundayData = [];
     var mondayData = [];
     var tuesdayData = [];
     var wednesdayData = [];
     var thursdayData = [];
     var fridayData = [];
     var saturdayData = [];

     for(var i=0;i<chartActualData.length;i++){
       // get day from date
       var weekDay = chartActualData[i].TimestampDate.getDay();
       if(weekDay==0){ // sunday
        sundayData.push(chartActualData[i]);        
       }
       else if(weekDay==1){ // monday
        mondayData.push(chartActualData[i]);        
       }
       else if(weekDay==2){ // tuesdayData
        tuesdayData.push(chartActualData[i]);        
       }
       else if(weekDay==3){ // wednesdayData
        wednesdayData.push(chartActualData[i]);        
       }
       else if(weekDay==4){ // thursdayData
        thursdayData.push(chartActualData[i]);        
       }
       else if(weekDay==5){ // fridayData
        fridayData.push(chartActualData[i]);        
       }
       else if(weekDay==6){ // saturdayData
        saturdayData.push(chartActualData[i]);        
       }
     }

     var reArrangedData = sundayData.concat(mondayData,tuesdayData,wednesdayData,thursdayData,fridayData,saturdayData); 
     return reArrangedData;
  }

  private plotTemperatureLine(svg: any, cx: any, cy: any) {

    this.chartData = this.reArrangeDataToStartFromSunday(this.chartData);

    //var angleSlice = Math.PI * 2 / this.chartData.length, offset = 0; // 360
    var angleSlice = Math.PI * 2 / 10080, offset = 0; // 24(hr)*60(min)*7(days) = 10080

    //Scale for the radius
    var rScale = d31.scaleLinear()
      .range([this.innerRadius, this.outerRadius-this.gapBetweenOuterRadiusAndAxisTickCircles-3]) // -3 slight scale reduced due to stroke width
      .domain([180, 30]);

    //The radial line function
    var radarLine = d31.radialLine()
      .curve(d31.curveLinearClosed)
      .radius(function (d: any) { 
        return rScale(+d.Temp); 
      })
      .angle(function (d: any, i:any) { 
        return i * angleSlice - offset; 
      });

    svg
      .append("path").datum(this.chartData)
      .attr("class", "radarArea")
      .attr("d", function (d, i) { 
        return radarLine(d); 
      })
      .style("fill", function (d: any, i) {
        return "transparent"; 
      })
      .style("stroke-width","1.5px").style("stroke",this.plotLineColor)
      .style("fill-opacity", 0.8);
  }

  private generateCurvedAxis(svg: any, cx: any, cy: any) {
    var ticksText = ["30", "40", "50", "60", "70"];

    var newDataKeys = [];
    for (var i = 0; i < 168; i++) {
      newDataKeys.push(i);
    }

    for (var i = 0; i < newDataKeys.length; i++) {
      if (i % 24 == 0) {
        var axisTicksGroup = svg.append("g").attr("transform", function (d) {
          return "rotate(" + (i * 360 / newDataKeys.length) + ")";
        });

        axisTicksGroup.append("rect").attr("class", "axisTickLabel").style("fill", "white")
          .attr("x", -11).attr("y", -102).style("width", "24px").style("height", "13px")
          .attr("transform", "rotate(180)");

        axisTicksGroup.append("text").attr("class", "axisTickLabel").attr("x", 0)
          .style("fill", "#3A3AFF")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("text-anchor", "middle")
          .attr("transform", "rotate(180)").attr("y", -90).text("180");

        axisTicksGroup.append("rect").attr("class", "axisTickLabel").style("fill", "white")
          .attr("x", -30).attr("y", -143).style("width", "24px").style("height", "13px")
          .attr("transform", "rotate(180)");
        axisTicksGroup.append("text").attr("class", "axisTickLabel")
          .style("fill", "#3A3AFF")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("text-anchor", "middle").attr("x", -20).attr("transform", "rotate(180)").attr("y", -133).text("160");

        axisTicksGroup.append("rect").attr("class", "axisTickLabel").style("fill", "white")
          .attr("x", -48).attr("y", -190).style("width", "24px").style("height", "13px")
          .attr("transform", "rotate(180)");
        axisTicksGroup.append("text").attr("class", "axisTickLabel")
          .style("fill", "#3A3AFF")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("text-anchor", "middle").attr("x", -38).attr("transform", "rotate(180)").attr("y", -180).text("140");


        axisTicksGroup.append("rect").attr("class", "axisTickLabel").style("fill", "white")
          .attr("x", -62).attr("y", -235).style("width", "24px").style("height", "13px")
          .attr("transform", "rotate(180)");
        axisTicksGroup.append("text").attr("class", "axisTickLabel").attr("x", -52)
          .style("fill", "#3A3AFF")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("text-anchor", "middle").attr("transform", "rotate(180)").attr("y", -225).text("120");


        axisTicksGroup.append("rect").attr("class", "axisTickLabel").style("fill", "white")
          .attr("x", -70).attr("y", -285).style("width", "24px").style("height", "13px")
          .attr("transform", "rotate(180)");
        axisTicksGroup.append("text").attr("class", "axisTickLabel").attr("x", -60)
          .style("fill", "#3A3AFF")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("text-anchor", "middle").attr("transform", "rotate(180)").attr("y", -275).text("100");


        axisTicksGroup.append("rect").attr("class", "axisTickLabel").style("fill", "white")
          .attr("x", -77).attr("y", -330).style("width", "24px").style("height", "13px")
          .attr("transform", "rotate(180)");
        axisTicksGroup.append("text").attr("class", "axisTickLabel").attr("x", -67)
          .style("fill", "#3A3AFF")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("text-anchor", "middle").attr("transform", "rotate(180)").attr("y", -320).text("80");

        axisTicksGroup.append("rect").attr("class", "axisTickLabel").style("fill", "white")
          .attr("x", -80).attr("y", -380).style("width", "24px").style("height", "13px")
          .attr("transform", "rotate(180)");
        axisTicksGroup.append("text").attr("class", "axisTickLabel").attr("x", -70)
          .style("fill", "#3A3AFF")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("text-anchor", "middle").attr("transform", "rotate(180)").attr("y", -370).text("60");


        axisTicksGroup.append("rect").attr("class", "axisTickLabel").style("fill", "white")
          .attr("x", -78).attr("y", -425).style("width", "24px").style("height", "13px")
          .attr("transform", "rotate(180)");
        axisTicksGroup.append("text").attr("class", "axisTickLabel")
          .style("fill", "#3A3AFF")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("text-anchor", "middle").attr("x", -68).attr("transform", "rotate(180)").attr("y", -415).text("40");

        axisTicksGroup.append("rect").attr("class", "axisTickLabel").style("fill", "white")
          .attr("x", -74).attr("y", -447).style("width", "24px").style("height", "13px")
          .attr("transform", "rotate(180)");
        axisTicksGroup.append("text").attr("class", "axisTickLabel")
          .style("fill", "#3A3AFF")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("text-anchor", "middle").attr("x", -64).attr("transform", "rotate(180)").attr("y", -437).text("30");

      }
    }
  }

  private generateShadedCircles(svgGroup: any, cx: any, cy: any) {
    // draw inner circles

    svgGroup.append("circle")
      .attr("class", "innerCircles")
      .attr("stroke-opacity", 0.5)
      //.attr("cx", cx)
      .style("stroke-width", 10)
      .style("fill", "transparent")
      .style("stroke", this.innerLabelColor)
      .attr("r", this.innerCiclesLastTickRadius - 13);
  }

  private generateWhiteBorderCircleInOuterRadius(svgGroup: any, cx: any, cy: any) {
    // draw inner circles
    svgGroup.append("circle")
      .attr("class", "innerCircles")
      .attr("stroke-opacity", 1)
      .style("stroke-width", 28)
      .style("fill", "transparent")
      .style("stroke", "white")
      .attr("r", this.outerRadius - 30);
  }

  private generateInnerAxis(svg: any, cx: any, cy: any) {
    var numBars = 14;
    var barHeight = 150;
    var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

    var lines = svg.selectAll("line")
      .data(keys)
      .enter().append("line")
      .attr("y2", cy - 15)//.attr("x2",cx)
      //.attr("x1",cx).attr("y1",cy)
      .style("stroke", this.innerLabelColor)
      .style("stroke-width", "1.5px")
      .style("opacity", 0)
      .attr("transform", function (d, i) {
        return "rotate(" + (i * 360 / numBars) + ")";
      });


    // draw other 1px lines
    // 14 * 12 = 168
    var newDataKeys = [];
    for (var i = 0; i < 168; i++) {
      newDataKeys.push(i);
    }

    var subInnerLines = svg.selectAll(".subLines")
      .data(newDataKeys)
      .enter().append("line")
      .attr("y2", cy - 55)//.attr("x2",cx)
      //.attr("x1",cx).attr("y1",cy)
      .attr("class", "subLines")
      .style("stroke", this.innerLabelColor)
      .style("stroke-width", "1px")
      .style("opacity", 0)
      .attr("transform", function (d, i) {
        return "rotate(" + (i * 360 / newDataKeys.length) + ")";
        //return "rotate(" + (i * 360 / newDataKeys.length) + ")";  // actual
      });

    svg.selectAll("line").style("opacity", function (d) {
      console.log("x1= " + d3.select(this).attr("x1") + "  x2= " + d3.select(this).attr("x2") + " y1=" + d3.select(this).attr("y1") + " y2= " + d3.select(this).attr("y2"));
      return 0;
    });

    // curved circle
    // <path d="M 100 250 q 150 -100 300 0" stroke="blue" stroke-width="5" fill="none" transform="rotate(5.285714)"></path>

    svg.selectAll(".curvedPath")
      .data(newDataKeys)
      .enter().append("path")
      .attr("class", "curvedPath")
      .style("stroke", this.innerLabelColor)
      .style("stroke-width", function (d, i) {
        if (i % 12 == 0) {
          return "2px";
        }
        else {
          return "1px";
        }
      })
      .style("fill", "transparent")
      .style("opacity", 0.5)
      .attr("d", "M 0 50 q 250 -100 484 0")
      .attr("transform", function (d, i) {
        return "rotate(" + (i * 360 / newDataKeys.length) + ")";
        //return "rotate(" + (i * 360 / newDataKeys.length) + ")";  // actual
      });
  }

  private drawWeekDayLabels(svg: any, cx: any, cy: any) {

    var chartData = ["Sunday", "", "Monday", "", "Tuesday", "", "Wednesday", "", "Thursday", "", "Friday", "", "Saturday", ""];
    // Labels
    var barHeight = this.outerRadius, numBars = chartData.length;
    var labelRadius = barHeight * 0.95;//1.025;

    var labels = svg.append("g")
      .classed("labels", true);

    labels.append("def")
      .append("path")
      .attr("id", "label-path")
      .attr("d", "m0 " + -labelRadius + " a" + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0");

    var factorsToSetPositionOfLabelsOnAxisLine = 70; // adjust left/right movement of the outer axis labels, reducing value move to left side while on +, to right

    labels.selectAll("text")
      .data(chartData)
      .enter().append("text")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("fill", function (d, i) { return "#3e3e3e"; })
      .append("textPath")
      .attr("xlink:href", "#label-path")
      .attr("startOffset", function (d, i) { return i * 100 / numBars + factorsToSetPositionOfLabelsOnAxisLine / numBars + '%'; })
      .text(function (d) { return d.toUpperCase(); });
  }

  private generateTimeLabels(svg: any, cx: any, cy: any) {
    var chartData = ["Noon", "", "Noon", "", "Noon", "", "Noon", "", "Noon", "", "Noon", "", "Noon", ""];
    // Labels
    var barHeight = this.outerRadius, numBars = chartData.length;
    var labelRadius = barHeight * 0.925;//1.025; + val, move value away from center while - val, close to the circle

    var labels = svg.append("g")
      .classed("labels", true);

    labels.append("def")
      .append("path")
      .attr("id", "label-path-noon")
      .attr("d", "m0 " + -labelRadius + " a" + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0");

    var factorsToSetPositionOfLabelsOnAxisLine = 70; // adjust left/right movement of the outer axis labels, reducing value move to left side while on +, to right

    labels.selectAll("text")
      .data(chartData)
      .enter().append("text")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("fill", function (d, i) {
        return "#3e3e3e";
      })
      .append("textPath")
      .attr("xlink:href", "#label-path-noon")
      .attr("startOffset", function (d, i) {
        return i * 100 / numBars + factorsToSetPositionOfLabelsOnAxisLine / numBars + '%';
      })
      .style("font-size", "14px")
      .text(function (d) {
        return d.toUpperCase();
      });
  }

  private generateTimeHoursTicks(svg: any, cx: any, cy: any) {
    var chartData = ["0", "3", "6", "9", "0", "3", "6", "9", "0",
      "3", "6", "9", "0", "3", "6", "9", "0",
      "3", "6", "9", "0", "3", "6", "9", "0",
      "3", "6", "9", "0", "3", "6", "9", "0",
      "3", "6", "9", "0", "3", "6", "9", "0",
      "3", "6", "9", "0", "3", "6", "9", "0",
      "3", "6", "9", "0", "3", "6", "9"];
    // Labels
    var barHeight = this.outerRadius, numBars = chartData.length;
    var labelRadius = barHeight * 0.915;//1.025; + val, move value away from center while - val, close to the circle

    var labels = svg.append("g")
      .classed("labels", true);

    labels.append("def")
      .append("path")
      .attr("id", "label-path-hours")
      .attr("d", "m0 " + -labelRadius + " a" + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0");

    var factorsToSetPositionOfLabelsOnAxisLine = -128; // adjust left/right movement of the outer axis labels, reducing value move to left side while on +, to right

    labels.selectAll("text")
      .data(chartData)
      .enter().append("text")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("fill", function (d, i) {
        return "#3e3e3e";
      })
      .append("textPath")
      .attr("xlink:href", "#label-path-hours")
      .attr("startOffset", function (d, i) {
        return i * 100 / numBars + factorsToSetPositionOfLabelsOnAxisLine / numBars + '%';
      })
      .style("font-size", "14px")
      .text(function (d) {
        return d.toUpperCase();
      });
  }

  private drawCenterLabels(svgGroup: any, cx: any, cy: any, data: any) {
    // inner circle with white background to hide inner lines


    svgGroup.append("circle")
      .attr("class", "innerCircles")
      .attr("stroke-opacity", 1)

      .style("fill", "white").style("stroke", this.innerLabelColor)
      .attr("r", this.innerRadius);


    svgGroup.append("text")
      .attr("x", cx)
      .attr("y", cy - 60).attr("class", "labelColor")
      .attr("text-anchor", "middle").style("font-size", "20px")
      .text("PRO");

    svgGroup.append("text")
      .attr("x", cx)
      .attr("y", cy - 30).attr("class", "labelColor")
      .attr("text-anchor", "middle").style("font-size", "20px")
      .text("ELLIOT");

    svgGroup.append("text")
      .attr("x", cx - 50)
      .attr("y", cy + 10).attr("class", "labelColor")
      .attr("text-anchor", "middle").style("font-size", "20px")
      .text("DATE");

    svgGroup.append("text")
      .attr("x", cx)
      .attr("y", cy + 10).attr("class", "labelColor")
      .attr("text-anchor", "middle").style("font-size", "20px")
      .text("+");

    svgGroup.append("text")
      .attr("x", cx + 50)
      .attr("y", cy + 10).attr("class", "labelColor")
      .attr("text-anchor", "middle").style("font-size", "20px")
      .text("NO.");
  }
}
