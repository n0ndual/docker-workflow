# A Sample Docker workflow leveraging machine, swarm, compose and NGiNX with GeoIP module  for CDS GPN Cloud!

## 团队介绍

团队名称：FullOfWater

团队人员：崔嵬(cuiwei13@pku.edu.cn)， 王虎(doyle@pku.edu.cn)

团队负责人： 王虎(doyle@pku.edu.cn)


## 动机： CDS GPN云需要一个更完整的软件栈
CDS GPN云将全球各地多个数据中心使用高速专用网络连接起来，每个用户都可以创建一个跨多地数据中心的私有网络。这为期望打开国际市场的中国IT公司提供了一个非常合适的公有云计算平台。

然而，同时在国内外数据中心部署服务是一件很复杂的工作。不仅仅是对企业，对公有云提供商也如此。目前CDS GPN尚未提供类似AWS的ELB和Root53，Kubernetes，Mesosphere这样的服务，使得GPN的优势难以体现出来。

目前GPN用户，如果想要在GPN上搭建一个支持全球访问的服务，需要手动搭建一个私有PaaS或者CaaS平台，还需要部署一个具备地理位置感知功能的内部负载均衡器，

## 解决方案

这个项目提供了一个搭建私有CaaS平台，并配合全球负载均衡器的样例，希望能够为更多用户使用GPN，充分发挥GPN的优势，简化服务平台搭建提供帮助。本项目流使用docker 原生技术栈（machine, swarm, compose)搭建私有CaaS，运行一个使用node.js和redis的服务作为示例。

例如，用户发出请求R1，通过具备地理位置感知的DNS进入GPN网络中的距离R1最近的机器A1, A1上的Nginx代理根据R1的IP地址查找其位置，并转发到距离其最近的提供服务的容器上。

使用上述部署方案，使得企业在部署服务时，不必关心主机的物理位置，无需额外工作即可轻松将企业的服务扩展至全球范围。同时，全球用户在访问服务时，也会被优先路由到当地数据中心的容器上，极大地降低延迟。

#### 使用 Docker Machine 和 Docker Swarm 部署集群

由于GPN具有独特的全球私有网络，目前尚未发布支持Docker Machine的Driver，因此用户需要先在控制台创建虚拟机，然后登陆虚拟机，手动将这些虚拟机逐一加入Docker Machine 集群。

然后再使用docker swarm创建swarm集群，即可使用Docker的多主机容器编排服务了。

目前Docker Swarm 和 Compose 的集成还不成熟，有很多bug，当compose使用links时，只能被调度到同一个docker machine上，因此本示例的演示效果不是很好。但这个问题可以等Docker社区解决，也可以自己修改overlay network解决，但是时间有限，还没有完成。后续我会继续完成这个工作。

#### 使用nginx with GeoIP Module 做全球负载均衡器

使用docker compose运行app， 编写docker-compose.yml文件，需要将前端服务link到全球负载均衡器上。目前需要手动设置每个前端服务容器对应哪一个地区，未来将修改成自动判断。时间有限，非常遗憾。

## 安装部署步骤：

#### 在 CDS GPN 上部署Docker Machine swarm 集群

step1： 使用CDS控制台创建三个云主机：
```
consul-master 10.11.12.1
swarm-master  10.11.12.2
swamr-agent   10.11.7.7
```
step2： 将三台机器的private ssh key 拷贝到swarm-master主机上

step3： ssh 登陆swarm-master云主机，创建consul-master节点
```
docker-machine create -d generic --generic-ssh-user root --generic-ssh-key /root/identity_files/consul-master --generic-ip-address 10.11.12.1 consul-master
```
 启动consul容器
 ```
docker $(docker-machine config consul-master) run -d -p "8500:8500" -h "consul" progrium/consul -server -advertise $(docker-machine ip consul-master) -bootstrap
```
step4: 使用docker-machine创建swarm-master
```
docker-machine create -d generic --generic-ssh-user root --generic-ssh-key /root/identity_files/swarm-master --generic-ip-address 10.11.12.2 --swarm --swarm-master --swarm-discovery "consul://$(docker-machine ip consul-master):8500" --engine-opt="cluster-store=consul://$(docker-machine ip consul-master):8500" --engine-opt="cluster-advertise=eth1:2376" swarm-master
```
step5: 使用docker-machine创建swarm-agent
```
docker-machine create -d generic --generic-ssh-user root --generic-ssh-key /root/identity_files/swarm-agent --generic-ip-address 10.11.7.7 --swarm --swarm-discovery "consul://$(docker-machine ip consul-master):8500" --engine-opt="cluster-store=consul://$(docker-machine ip consul-master):8500" --engine-opt="cluster-advertise=eth1:2376" swarm-agent
```

#### 使用Docker Compose 启动 这个示例App

step1： 下载这个示例项目
```
git clone https://github.com/scorpionis/docker-workflow.git
```
step2:  运行

切换到docker swarm-master machine 上
```
eval $(docker-machine env swamr-master)
```

运行docker-compose
```
docker-compose up
```
#### 打开浏览器查看结果

输入网址： http://38.83.111.198/

负载均衡的测试暂时未完成。
