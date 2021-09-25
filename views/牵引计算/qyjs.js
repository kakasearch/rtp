/*
 * @Descripttion: 牵引计算
 * @version: 
 * @Author: kaka
 * @Date: 2021-8-26
 */

 //////////////////
 //data
const qyxn_parms =  {
    //牵引性能参数 p61
"ss_1":{
    "V_jmin":43.0,
    "F_jmax":301.2,
    "F_q":487.3,
    "P":138,
    "P_mu":138,
    "V_g":95,
    "L_J":20.4
    },
"ss_3":{
    "V_jmin":48,
    "F_jmax":317.8,
    "F_q":470,
    "P":138,
    "P_mu":138,
    "V_g":100,
    "L_J":21.7
    },
"ss_4":{
        "V_jmin":51.5,
        "F_jmax":431.6,
        "F_q":649.8,
        "P":184,
        "P_mu":184,
        "V_g":100,
        "L_J":32.8
        },
"ss_7":{
        "V_jmin":48,
        "F_jmax":353.3,
        "F_q":487.3,
        "P":138,
        "P_mu":138,
        "V_g":100,
        "L_J":22
        },   
"ss_8":{
        "V_jmin":99.7,
        "F_jmax":127,
        "F_q":230,
        "P":88,
        "P_mu":88,
        "V_g":177,
        "L_J":17.5
        },   
"ss_9":{
        "V_jmin":99,
        "F_jmax":169.0,
        "F_q":286.0,
        "P":126,
        "P_mu":126,
        "V_g":170,
        "L_J":21.0
        },
"DF_4B_goods":{
            "V_jmin":21.8,
            "F_jmax":313,
            "F_q":442.2,
            "P":138,
            "P_mu":138,
            "V_g":100,
            "L_J":21.1,
            },
"DF_4B_passengers":{
            "V_jmin":29,
            "F_jmax":235.2,
            "F_q":325.3,
            "P":138,
            "P_mu":138,
            "V_g":120,
            "L_J":21.1,
            },
"DF_4C":{
            "V_jmin":24.5,
            "F_jmax":301.5,
            "F_q":442.2,
            "P":138,
            "P_mu":138,
            "V_g":100,
            "L_J":21.1,
            },
"DF_8":{
            "V_jmin":31.2,
            "F_jmax":307.3,
            "F_q":432.6,
            "P":135,
            "P_mu":135,
            "V_g":100,
            "L_J":22,
            },                                                                   
       }
const parms_w_0_p =  {
    //机车单位基本阻力参数表 p65 [0 1 2 次项系数]
    "ss_1":[2.25,0.019,0.00032],
    "ss_3":[2.25,0.019,0.00032],
    "ss_4":[2.25,0.019,0.00032],
    "ss_7":[1.40,0.038,0.000348],
    "ss_8":[1.02,0.035,0.000426],
    "DF_4B_goods":[2.28,0.0293,0.000178],
    "DF_4B_passengers":[2.28,0.0293,0.000178],
    "DF_4C":[2.28,0.0293,0.000178],
    "DF_8":[2.40,0.0022,0.000391],
}

const parms_w_0_pp =  {
    //车辆单位基本阻力参数表 p66 [0 1 2 次项]
    "goods_heavy_roll":[0.92,0.0048,0.000125],//货物列车 重车 滚动轴承
    "goods_heavy_slide":[1.07,0.0011,0.000236],//货物列车 重车 滑动轴承
    "goods_empty":[2.23,0.0053,0.000675],

}

//////////////////
// tools
function log(...argument) {
    // body...
    console.log(argument.join(" "))
}
function sum(arr) {
  var s = 0;
  arr.forEach(function(val, idx, arr) {
    s += val;
  }, 0);
  
  return s;
}
function is_biger(a,b,info){
    a>=b  ? log(info,'通过!'):log(info,'不通过!!!')
    return  a>b 
}
function is_smaller(a,b,info){
    a<=b  ? log(info,'通过!'):log(info,'不通过!!!')
    return  a<b 
}
//////////////////////
//code
//牵引质量计算
function cal_w_0(parms,v){
    /*
    计算w_0_p or w_0_pp
    parms为 [0 1 2 次项系数]
    v 速度
    */
    return (parms[0] + parms[1]*v + parms[2]*v*v)
}
function cal_qyzl(qyxn_parms_object,P,w_0_p,w_0_pp,i_xORi_JL,lambdas){
    /*
    牵引质量计算 p83
    ！！ 按限制坡度计算
    @parms  qyxn_parms_object qyxn_parms的具体数据
    @parms  P 机车计算质量之和 t
    @parms  i_xORi_JL i_x or i_JL
    @parms  lambdas 多机牵引利用系数 arr[]
    @return G 10t的倍数
    */
    let F_j = qyxn_parms_object.F_jmax *1000 //转单位为N
    const g = 9.81
    const lambda_y = 0.9

    i_x = i_xORi_JL
    lambdas = lambdas?1+ sum(lambdas):1
    G = (lambdas*lambda_y*F_j - P * (w_0_p + i_x) * g) / ((w_0_pp+i_x)*g)
    G = parseInt(G/10)*10//舍取为10t的倍数
    return G
}

//牵引质量 检算
function check_qi_dong(qyxn_parms_object, P , i_q , G){
    /*
    启动检算 p84
    @parms  P  前面已计算出
    @parms  F_j 前面已计算出
    @parms  i_q 启动地段加算坡度
    @parms  G  前面已计算出
    @return true：通过，false:检算不通过
    */
    const g = 9.81
    const lambda_y = 0.9
    const w_q_p = 5
    const w_q_pp = 3.5
    let F_q = qyxn_parms_object.F_q *1000 //转单位为N
    let G_q = (lambda_y*F_q - P * (w_q_p + i_q) * g) / ((w_q_pp+i_q)*g);
    G_q = parseInt(G_q/10)*10//舍取为10t的倍数
    results.push("<p>启动条件下最大牵引质量(t):"+G_q+"</p>")
    return is_biger(G_q,G,'启动检算');
}
function check_dfxyxc(qyxn_parms_object,L_yx,L_a_input,N_J_input){
    /*
    到发线有效长检算p84
    @parms  L_yx  到发线有效长
    @parms  L_a 默认为30
    @parms  N_J 默认为1
    @return true：通过，false:检算不通过
    */
    let L_a = L_a_input||30
    let N_J = N_J_input || 1
    let L_J =  qyxn_parms_object.L_J
    const q = 5.677
    let G_yx = (L_yx - L_a -N_J*L_J)*q
    G_yx = parseInt(G_yx/10)*10//舍取为10t的倍数  
    results.push("<p>到发线条件下最大牵引质量(t):"+G_yx+"</p>")
    return is_biger(G_yx,G,'到发线有效长检算');
}

function check_cgqd(F_c,i_JL,w_0_pp){
    /*
    车钩强度检算 p85
    @return true：通过，false:检算不通过
    */
    const g = 9.81
    let G_c = F_c / (g*(i_JL + w_0_pp))
    G_c = parseInt(G_c/10)*10
    log("车钩强度限制条件下最大牵引质量(t):",G_c)
    return is_biger(G_c,G,'车钩强度检算');
}

///////////////////////////////////////////////算例 ///////////////////////////////////////////////////////////////////////

//牵引质量算例 作为程序正确性验证和算例参考
//标有input 的需要用户输入
//结果全部向下取到10t
log("tips:结果全部向下取到10t\n")
//牵引质量计算 例2-2 p84
var jiche_type
var cheliang_type
var i_xORi_JL
var lambdas
var qyxn_parms_object
var v
var P
var w_0_p
var w_0_pp
var G
var results = []
function get_G(){
    jiche_type = document.querySelector("#jiche_type").value                                //input
    cheliang_type = document.querySelector(".cheliang_type:checked").value                 //input
    i_xORi_JL = parseFloat(document.querySelector("#i_x").value)                                      //input
    if(jiche_type && cheliang_type &&i_xORi_JL){
        lambdas = null //多机牵引时的lambdas[]                //input
        qyxn_parms_object = qyxn_parms[jiche_type]
        v = qyxn_parms_object.V_jmin
        P = qyxn_parms_object.P //p 还是p_mu   p_mu需要用户给 //input
        w_0_p = cal_w_0(parms_w_0_p[jiche_type],v)
        w_0_pp = cal_w_0(parms_w_0_pp[cheliang_type],v)
        G = cal_qyzl(qyxn_parms_object,P,w_0_p,w_0_pp,i_xORi_JL,lambdas)
        log('牵引质量为(t)：',G)
        document.querySelector("#G").value = String(G)
    }else{
        alert("数据输入不完整！")
    }

    
}


function check_G(){
    results = []
    if(!G){
        alert("请先计算最大牵引质量")
        return
    }
//启动验算 例2-4 p84
let i_q = parseFloat(document.querySelector("#i_q").value)                                  //input
if (i_q) {
    if (check_qi_dong(qyxn_parms_object, P , i_q , G)) {
        results.push("<p style='color: green;' >启动检算通过！</p>")
    } else {
        results.push("<p  style='color: red;' >启动检算未通过！</p>")
    }
}

//例2-5 p85
let L_yx  = parseFloat(document.querySelector("#L_yx").value)                                        //input
if (L_yx) {
    if (check_dfxyxc(qyxn_parms_object,L_yx)) {
        results.push("<p  style='color: green;' >到发线有效长检算通过！</p>")
    } else {
        results.push("<p  style='color: red;' >到发线有效长检算未通过！</p>")
    }
}

// //例2-6 p85
// var F_c  = 562500    //需要由车钩型号转化得到                   //input
// var i_JL = 18.4                                             //input
// check_cgqd(F_c,i_JL,w_0_pp)
    if((!L_yx) && (!i_q)){
        alert("未输入检算条件！")
        return
    }else{
        results.push("<p>计算结果仅供参考</p>")
    }
document.querySelector("#jsjg").innerHTML = results.join("\n")

}
