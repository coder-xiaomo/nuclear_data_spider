# npm i -g pm2
# npm install pm2-windows-startup -g

# 启动服务 并设置开机启动
pm2 start index.js --name nuclear-data-spider
pm2 save
pm2-startup install

# # 查看当前运行列表
# pm2 list
# pm2 status

# # 停止
# pm2 stop nuclear-data-spider

# # 重启
# pm2 restart nuclear-data-spider