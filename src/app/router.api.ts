// http://192.168.1.130:8080/wcp/ http://58.246.211.154:14200/wcp/
const API = 'http://58.246.211.154:14200/wcp/';
// const API = 'http://192.168.1.117:8088/wcp/';

// 接口配置
export const APIROUTER = {
    getProjects: API + 'pro/getProjects', // 分析报告-查询所有工程
    getProjectInformation: API + 'pro/getProject', // 分析报告-查询某个项目的详细信息
    getAreaInfoTree: API + 'area/getAreaInfoTree', // 分析报告-省市区三级联动
    exportProDetail: API + 'excel/exportProDetail', // 分析报告-导出
    getSurvey: API + 'data/getSurvey',// 现状调查
    getProject: API + 'data/getProject', //查询工程信息
    getSurveyValues: API + 'data/getSurveyValues', //查询现状逐次分析，安全复核
    getExamine: API + 'data/getExamine', //根据条件查询安全检测
    getExamineByid: API + 'data/getExamineByid', //安全检测条件查询
    getAssesss: API + 'data/getAssesss', //获取历史评价
    getDangers: API + 'data/getDangers', //获取历史险情
    getProjectsByArea: API + 'pro/getProjectsByArea', //根据省市区的ID查询到具体的项目
    getTypeCount: API + 'data/getTypeCount', //获取水闸工程信息
    getCountByProvince: API + 'data/getCountByProvince', //获取水闸历年(历省)的数据
    getCount: API + 'data/getCount', //获取水闸地图分布的数据
    getArea: API + 'area/getArea', //获取全国数据
    getYearCountByCode: API + 'data/getYearCountByCode', //根据省份获取历年行政区水闸数据
    getCountBySize: API + 'data/getCountBySize', //获取水闸不同规模的数据
    getConCountByValue: API + 'data/getConCountByValue', //获取水闸的综合安全复核
    getProTypeCount: API + 'data/getProTypeCount', //获取全国水闸的类别分布信息
    getCountWater: API + 'water/getCount', //获取全国水闸的类别分布信息--流域分布
    getCountByWater: API + 'water/getCountByWater', //获取全国水闸的类别分布信息--流域分布
    getOrderProByArea: API + 'pro/getOrderProByArea', // 根据地图ID，获取水闸信息
    getOrderProByArea1: API + 'pro/getOrderProByArea1', // 根据地图ID，获取到期未检
    getProjectCall: API + 'pro/getProjectCall', // 提醒服务根据地图ID，获取到期未检
    getRecords: API + 'record/getRecords', // 获取工程档案
    echartsIcon: 'image://data:image/png;base64,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',
}