const schedule = require('node-schedule')
const { run } = require('./spider/spider')
const { serve } = require('./backend/server')

// 每日 11:11 23:11 执行采集
schedule.scheduleJob('11 11 11,23 * * *', run)

// 启动后端服务
serve()

console.log('项目后端及定时采集已启动')