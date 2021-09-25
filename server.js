const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')

// 初始化
const app = express()

// 配置 body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//设置跨域请求
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
    res.header("X-Powered-By", ' 3.2.1')
    next()
})

// 解析 html
app.engine('html', require('express-art-template'))

// 开放 assets 文件夹
app.use('/assets', express.static('./assets'))
app.use('/%E7%89%B5%E5%BC%95%E8%AE%A1%E7%AE%97', express.static('./views/牵引计算'))
app.use('/%E6%97%A2%E6%9C%89%E7%BA%BF%E6%8B%A8%E8%B7%9D%E8%AE%A1%E7%AE%97', express.static('./views/既有线拨距计算'))

// web 页面
app.get('/', (req, res) => {
    res.render('index.html')
})
app.get('/%E7%89%B5%E5%BC%95%E8%AE%A1%E7%AE%97/', (req, res) => {
    res.render('牵引计算/index.html')
})
app.get('/%E6%97%A2%E6%9C%89%E7%BA%BF%E6%8B%A8%E8%B7%9D%E8%AE%A1%E7%AE%97/', (req, res) => {
    res.render('既有线拨距计算/index.html')
})


// 设置监听
app.listen(1778, () => {
    console.log('Serve is on...')
})