// http://192.168.1.130:8080/wcp http://58.246.211.154:14200/wcp/
const API = 'http://58.246.211.154:14200/wcp/';

// 接口配置
export const APIROUTER = {
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
}