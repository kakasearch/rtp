var xlsx = require('xlsx')
var xlsx_style = require('xlsx-style')
// import LAY_EXCEL from 'lay-excel';
// LAY_EXCEL.exportExcel([[1, 2, 3]], '表格导出.xlsx', 'xlsx')

// let workbook = xlsx.readFile('../test.xlsx')
let workbook = xlsx_style.readFile('../test.xlsx', { type: 'binary', cellStyles: true, cellHTML: true })
function log(...argument) {
    // body...
    console.log(argument.join(" "))
}
const worksheet = workbook.Sheets["Sheet1"];
workbook.SheetNames = ["Sheet1"]
const data = xlsx.utils.sheet_to_json(worksheet)
const maxrow = parseInt(/:.+?(\d+)/.exec(worksheet["!ref"])[1])
//worksheet["A1"].s = { font: { sz: 14, bold: true, color: { rgb: "FFFFAA00" } }, fill: { bgColor: { indexed: 64 }, fgColor: { rgb: "FFFF00" } } }
// console.log(worksheet)
//F1:T3
data_style = {
  numFmt: 'General',
  font: {
    sz: '11',
    color: { rgb: 'FFFFFF' },
  },
  border: {
    left: { style: 'thin', color: {} },
    right: { style: 'thin', color: {} },
    top: { style: 'thin', color: {} },
    bottom: { style: 'thin', color: {} }
  },
  alignment: { vertical: 'center', horizontal: 'center' }
}

for(var c of "FGHIJKLMNOPQRST") {
  for(var r=1; r<= 3; ++r) {
    worksheet[c+r].s = worksheet["C2"].s
  }
}



/////////////把数据处理成一行一行的【】
//第一行不算，最后一行不算
let licheng_str
let global_LC_a
let tmp_LC_b
let LC_c
let re = /(.*?)(\d*?)\+(\d+)/.exec(data[2][""])
    if(re){
        licheng_str = re[0]
        global_LC_a = re[1]
        LC_c = parseInt(re[3])
        tmp_LC_b= re[2]
    }else{
        console.log("error")
    }
// [licheng_str,global_LC_a,tmp_LC_b,LC_c] = /(.*?)(\d*?)\+(\d+)/.exec(data[2][""])
tmp_LC_b = parseInt(tmp_LC_b)

start_point = {
    "row":2,
    "isZJD": true,
    "licheng": {
            "str":licheng_str,
            "a": global_LC_a,
            "b": tmp_LC_b,
            "c": parseInt(LC_c),
            "total": parseInt(LC_c)+parseInt(tmp_LC_b)*1000
        },
}
result = [start_point]
for (var i = 3; i < data.length; i++) {
    let d = data[i]
    //log(JSON.toString(d))
    //K9+100 a:K b:9 c:100
    let licheng_str
    let LC_c
    let LC_b
    let re = /(.*?)(\d*?)\+(\d+)/.exec(d[""])
    if(re){
        licheng_str = re[0]
        LC_c = parseInt(re[3])
        if (re[2]) {
            LC_b = parseInt(re[2])
            tmp_LC_b = LC_b
        } else {
            LC_b = tmp_LC_b
        }
    }else{
        licheng_str = d[""]
        LC_b = null
        LC_c = null
    }


    let tmp = {
        "row":i,
        "isZJD": d["既有曲线测量资料"]?true:false,
        "licheng": {
            "str":licheng_str,
            "a": global_LC_a,
            "b": LC_b,
            "c": LC_c,
            "total": LC_c +LC_b*1000
        },
        "fai": d["_1"]*3600 + d["_2"]*60 +d["_3"],//单位 秒
        "main_point": null

    }
    result.push(tmp)

}

////////////计算β
global_beita = 0
global_total = result[0]["licheng"]["total"]
global_EJ = 0
for (var i = 1; i < result.length; i++) {
    d = result[i]
    d["beita_d"]= d["fai"] + global_beita
    d["beita"] = 3.14159/180* d["beita_d"]/3600
    d["J_l"] = d["licheng"]["total"] - global_total
    d["l_beita"] = d["J_l"]* d["beita"]
    d["EJ"]= d["l_beita"] + global_EJ
    if(d["isZJD"]){
        global_beita = d["beita_d"]
        global_total = d["licheng"]["total"]
        global_EJ = d["EJ"]
    }
}
function licheng_to_str(argument) {
    LC_b = parseInt(argument/1000)
    LC_c = (argument%1000).toFixed(3)
    return global_LC_a+LC_b+"+"+LC_c
}
//计算主点里程
const R_S = 500 // input
const l_0 = 100 // inpput
const alpha = parseFloat((result[result.length-1]["beita"]).toFixed(7))
const X = result[result.length-2]["EJ"]/alpha
var QZ_point = { "data": result[result.length-2]["licheng"]["total"]-X,"type":"QZ"}
var ZY_point = { "data": QZ_point["data"] - R_S*alpha/2,"type":"ZY"}
var ZH_point = { "data": ZY_point["data"] - l_0/2,"type":"ZH"}
var HY_point = { "data": ZY_point["data"] + l_0/2,"type":"HY"}
var YZ_point = { "data": 2*QZ_point["data"] - ZY_point["data"],"type":"YZ"}
var HZ_point = { "data": 2*QZ_point["data"] - ZH_point["data"],"type":"HZ"}
var YH_point = { "data": 2*QZ_point["data"] - HY_point["data"],"type":"YH"}

for(i of [QZ_point,ZY_point,ZH_point,HY_point,YZ_point,HZ_point,YH_point ]){
    i["str"] = licheng_to_str(i["data"])
    for (var j = 1; j < result.length-1; j++) {
        if(result[j]["licheng"]["total"]+10 > i["data"] && i["data"]>result[j]["licheng"]["total"]-10){
            result[j]["main_point"]=i;
            i["loc"] = result[j]["row"]-2 //result[loc]定位主点位置
            break;
        }
    }
}
////////计算设计曲线渐伸线
for (var i = 1; i < result.length-1; i++) {
    if(HY_point["loc"]<=i && i<HZ_point["loc"]){
        result[i]["L_or_X"] = result[i]["licheng"]["total"]- ZY_point["data"]
        result[i]["X_alpha"] = result[i]["L_or_X"]*result[i]["L_or_X"]/2/R_S
        result[i]["p"] = l_0*l_0/24/R_S
    }else if(HZ_point["loc"]<=i){
        result[i]["L_or_X"] = result[i]["licheng"]["total"]- QZ_point["data"]
        result[i]["X_alpha"] = result[i]["L_or_X"]*alpha
        result[i]["p"] = null
    }else{
        result[i]["L_or_X"] = null
        result[i]["X_alpha"] = null
        result[i]["p"] = null
    }

    if(ZH_point["loc"]<=i && i<HY_point["loc"]){
        result[i]["S_l"] = result[i]["licheng"]["total"]- ZH_point["data"]
        result[i]["l_3"] = result[i]["S_l"]*result[i]["S_l"]*result[i]["S_l"]/6/R_S/l_0
    }else if(YH_point["loc"]<=i && i<HZ_point["loc"]){
        result[i]["S_l"] = result[i]["licheng"]["total"]- YH_point["data"]
        result[i]["l_3"] = result[i]["S_l"]*result[i]["S_l"]*result[i]["S_l"]/6/R_S/l_0
    }else{
        result[i]["S_l"] = null
        result[i]["l_3"] = null
    }
    if(i<ZH_point["loc"]){
        result[i]["E_S"] = 0
    }else if(ZH_point["loc"]<=i && i<HY_point["loc"]){
        result[i]["E_S"] = result[i]["l_3"]
    }else if(HY_point["loc"]<=i && i<YH_point["loc"]){
        result[i]["E_S"] = result[i]["X_alpha"]+result[i]["p"]
    }else if(YH_point["loc"]<=i && i<HZ_point["loc"]){
        result[i]["E_S"] = result[i]["X_alpha"]+result[i]["p"]-result[i]["l_3"]
    }else{
        result[i]["E_S"] = result[i]["X_alpha"]
    }
    result[i]["delt"] =result[i]["E_S"]-result[i]["EJ"]
}
result[result.length-1]["J_l"]  =null
result[result.length-1]["l_beita"]  =null
result[result.length-1]["EJ"]   =null
var beizhu = `α=${alpha} rad, R_S = ${R_S},L_S = ${(R_S*alpha).toFixed(4)}, 
测量终点到QZ的距离X=${X.toFixed(3)} ,QZ=${QZ_point["str"]} ,l_0=${l_0} ,p=${ (l_0*l_0/24/R_S).toFixed(3)}`

//修改数据 F5:T27

let mdata= []
for (var i = 0; i < result.length; i++) {
    let d = result[i]
    if (d["beita_d"]) {
        let m = d["beita_d"] ? parseInt((d["beita_d"]%60)) :null
        let f = d["beita_d"] ? parseInt((d["beita_d"]/60)%60) :null
        let dd = d["beita_d"] ? parseInt((d["beita_d"]/3600)%3600) :null
        let beita = d["beita"] ? parseFloat(d["beita"].toFixed(7)) :null
        let J_L = d["J_l"] ? d["J_l"] :null
        let l_beita= d["l_beita"] ? parseFloat(d["l_beita"].toFixed(3)) :null
        let E_J = d["EJ"] ? parseFloat(d["EJ"].toFixed(3)) :null
        let point = d["main_point"]?d["main_point"]["type"]+"="+licheng_to_str(d["main_point"]["data"]):null
        let L_or_X = d["L_or_X"] ? parseFloat(d["L_or_X"].toFixed(3)) :null
        let X_alpha = d["X_alpha"] ? parseFloat(d["X_alpha"].toFixed(3)) :null
        let p = d["p"] ? parseFloat(d["p"].toFixed(3)) :null
        let S_l = d["S_l"] ? parseFloat(d["S_l"].toFixed(2)) :null
        let l_3 = d["l_3"] ? parseFloat(d["l_3"].toFixed(3)) :null
        let E_S = d["E_S"] ? parseFloat(d["E_S"].toFixed(3)) :null
        let delt = d["delt"] ? parseFloat(d["delt"].toFixed(3)) :null
        mdata.push([m, f, dd, beita, J_L, l_beita, E_J, point, L_or_X, X_alpha, p, S_l, l_3, E_S, delt])
    }
}
xlsx.utils.sheet_add_aoa(worksheet,mdata , {origin: "F5"});
 
// /* save to file */
xlsx_style.writeFile(workbook, './处理结果.xlsx', {
        bookType: 'xlsx',
        bookSST: true,
        type: 'binary',
      })
// xlsx_style.writeFile(workbook, '../QQQQQQ.xlsx',{cellStyles: true});
 //xlsx.writeFile(workbook, '../QQQQQQ.xlsx',{cellStyles: true});
