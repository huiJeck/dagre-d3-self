<template>
  <!-- 20210524动态增加节点之前的源码备份 -->
  <div class="flow-chart">
    <div class="btns-area">
      <el-button @click="svgToPng">下载</el-button>
      <div class="scale-box">
        <div class="scale-icon"><i class="el-icon-zoom-out"></i></div>

        <div class="slide">
          <el-slider
            v-model="scaleValue"
            :min="50"
            :max="200"
            :show-tooltip="false"
            @input="scale"
          ></el-slider>
        </div>
        <div class="scale-icon"><i class="el-icon-zoom-in"></i></div>
        <div class="value">{{ scaleValue }}%</div>
      </div>
    </div>
    <div class="flowchart">
      <svg class="svg-box">
        <g class="g-box" />
        <rect />
      </svg>
    </div>
    <!-- 节点编辑列表 -->
    <el-dialog
      :title="nodeEditTitle"
      width="300px"
      :visible.sync="showEditDialog"
      class="edit-list-dialog"
    >
      <ul class="edit-list">
        <li
          v-for="item in editListArr"
          :key="item.id"
          @click="nodeClickEvent(item.id)"
        >
          <div>{{ item.label }}</div>
          <div>{{ item.code }}</div>
        </li>
      </ul>
    </el-dialog>
    <!-- 链接线条件编辑列表 -->
    <el-dialog
      title="操作 (条件配置)"
      width="300px"
      :visible.sync="showEditLineDialog"
      class="edit-list-dialog"
    >
      <ul class="edit-list">
        <li
          v-for="item in editLineListArr"
          :key="item.id"
          @click="edgesClickEvent(item.id)"
        >
          <div>{{ item.label }}</div>
          <div>{{ item.code }}</div>
        </li>
      </ul>
    </el-dialog>
    <!-- 添加节点 -->
    <AddNodeDialog
      v-if="showAddNodeDialog"
      @upIsStrand="upIsStrand"
      @sumbitAddNode="sumbitAddNodeFun"
      @cancelAddNode="cancelAddNode"
    ></AddNodeDialog>
    <!-- 节点属性 -->
    <InfoNodeDialog
      v-if="showInfoNodeDialog"
      :curNodeInfo="curNodeObj[0]"
      @cancelInfoNode="cancelInfoNode"
      @sumbitNodeInfo="sumbitNodeInfo"
    >
    </InfoNodeDialog>
    <!-- 添加链接线条件 -->
    <EdgesCondtionDialog
      v-if="showAddCondtionDialog"
      @cancelAddNode="cancelAddCondition"
      @sumbitAddNode="sumbitAddCondition"
    ></EdgesCondtionDialog>
    <!-- 连接条件信息 -->
    <EdgeInfoDialog
      v-if="showEdgeInfoDialog"
      :info="edgeInfo"
      @cancelDialog="cancelDialog"
    ></EdgeInfoDialog>
  </div>
</template>

<script>
import dagreD3 from 'dagre-d3'
import * as d3 from 'd3'
import AddNodeDialog from './addNodeDialog.vue'
import InfoNodeDialog from './infoNodeDialog.vue'
import EdgesCondtionDialog from './addConditionDialog.vue'
import EdgeInfoDialog from './edgeInfoDialog.vue'
const userIconInit = require('@/assets/img/user.png')

export default {
  name: 'flowchartSvg',
  components: {
    AddNodeDialog,
    InfoNodeDialog,
    EdgesCondtionDialog,
    EdgeInfoDialog
  },
  data() {
    return {
      userIcon: userIconInit,
      showEdgeInfoDialog: false,
      edgeInfo: {},
      scaleValue: 100,
      curEdgeObj: {},
      showAddCondtionDialog: false,
      editLineListArr: [
        {
          id: 1,
          label: '自动条件',
          code: ''
        },
        {
          id: 2,
          label: '手动选择',
          code: ''
        },
        {
          id: 3,
          label: '排它分支',
          code: ''
        },
        {
          id: 4,
          label: '分支描述',
          code: ''
        },
        {
          id: 5,
          label: '删除条件',
          code: ''
        }
      ],
      showEditLineDialog: false,
      showInfoNodeDialog: false,
      nodeEditTitle: '节点操作',
      editListArr: [
        {
          id: 1,
          label: '增加节点',
          code: 'N'
        },
        {
          id: 2,
          label: '删除节点',
          code: 'DELETE'
        },
        {
          id: 3,
          label: '节点属性',
          code: 'A'
        }
      ],
      showEditDialog: false,
      showAddNodeDialog: false,
      curNodeObj: {},
      isStrand: 1, // 1为串行  2位并行 3为会签
      list: {
        nodeInfos: [
          // 节点数组
          {
            id: 'node1', // id
            label: '发起者', // 节点名称
            shape: 'circle', // 节点类型  rect,circle,ellipse,diamond,默认值为rect
            // class:'empty', // 空节点
            data: {
              type: 'start'
            }
          },
          {
            id: 'node2',
            label: '节点第二个',
            data: {
              typeLabel: '[审批]'
            }
          },
          {
            id: 'node3',
            label: '节点3122'
          },
          {
            id: 'node4',
            label: '节点4'
            // rank: 2,
            //  shape: "ellipse",
            //  class:'empty'
          },
          {
            id: 'node5',
            label: '节点5'
          },
          {
            id: 'node6',
            label: '节点6'
          },
          {
            id: 'node7',
            label: '节点7'
          },
          {
            id: 'node8',
            label: '节点8'
          },
          {
            id: 'node9',
            label: 'END',
            shape: 'circle',
            disabled: true,
            data: {
              type: 'end'
            }
          }
        ],
        edges: [
          //节点之间关系数组
          {
            source: 'node1', // 源头
            target: 'node2', // 末尾
            id: 6666 // id
          },
          {
            source: 'node2',
            target: 'node3',
            data: {
              condition:
                '[发起者][单位(所属单位)] != "长沙综合交通枢纽建设投资有限公司"',
              describe: '这是描述'
            }
          },
          {
            source: 'node3',
            target: 'node4'
          },
          {
            source: 'node4',
            target: 'node5'
          },
          {
            source: 'node5',
            target: 'node6'
          },
          {
            source: 'node6',
            target: 'node7'
          },
          {
            source: 'node7',
            target: 'node8'
          },
          {
            source: 'node8',
            target: 'node9'
          }
        ]
      },
      nextNode: '',
      gGraph: new dagreD3.graphlib.Graph({})
        .setGraph({
          // 初始画布板式
          rankdir: 'LR', //默认'TB'
          // align: 'DL',
          nodesep: 40,
          edgesep: 80,
          ranksep: 80,
          marginx: 80,
          marginy: 140
        })
        .setDefaultEdgeLabel(function() {
          return {}
        })
    }
  },
  methods: {
    upIsStrand(val) {
      this.isStrand = val
    },
    // 删除节点
    removeNode(item) {
      this.gGraph.removeNode(item.id)
    },
    // 生成节点
    setNodeFun() {
      console.log(this.list, 'this.list----8888')
      this.list.nodeInfos &&
        this.list.nodeInfos.forEach((item, index) => {
          this.gGraph.removeNode(item.id)
          console.log(item.label, 'label')
          // this.gGraph.removeEdge(item)
          item.rx = item.ry = 5 //圆角
          if (item.class === 'empty') {
            this.gGraph.setNode(item.id, {
              style: 'stroke: #B7B7B7;fill:#B7B7B7;stroke-width:0.2px',
              width: -19, //线条颜色
              ...item
            })
          } else {
            this.gGraph.setNode(item.id, {
              ...item,
              class: `node-style`,
              shape: 'circle',
              style: `stroke: #fff;stroke-width:5px;${
                item.data && item.data.type == 'end'
                  ? 'fill: #b7b7b7;'
                  : item.data && item.data.type == 'start'
                  ? 'fill: #62b200;'
                  : 'fill: #4b90de;'
              }`,
              labelType: 'html', //可以设置文本以及 html 格式，默认为文本格式
              label:
                item.data && item.data.type == 'end'
                  ? '<div style="color:#fff;font-size:12px">END</div>'
                  : `<div class="node-label-html"><span class="node-label"> <img style="width:18px;height:26px" src="${
                      this.userIcon
                    }" alt="" /></i></span><p class="node-label-text" style="  position: absolute;left: -18px;top: 36px;width: 52px;text-align: center; display: block;" ><span>${
                      item.label
                    }</span><span class="process"style=" display: block;opacity: 0.5;font-size: 0.6rem;" >${(item.data &&
                      item.data.typeLabel) ||
                      ''}</span></p></div>`
              // label: `<span class="node-label">${item.label}</span>`
            })
          }
        })
    },
    // 生成链接线
    setEdgeFun() {
      this.list.edges = this.list.edges.filter(q => {
        return q.source != q.target
      })
      this.list.edges.forEach(item => {
        if (item.empty) {
          // 空节点单独画线
          this.gGraph.setEdge(item.source, item.target, {
            style: 'stroke: #B7B7B7; fill: none;stroke-width:1.5px', //线条颜色
            // arrowheadStyle: 'fill:#B7B7B7;stroke: #B7B7B7', //箭头颜色
            arrowhead: 'undirected' // normal,vee,undirected 三种样式
          })
        } else {
          this.gGraph.setEdge(item.source, item.target, {
            style: 'stroke: #B7B7B7; fill: none;stroke-width:4px', //线条颜色
            // arrowheadStyle: 'fill:#B7B7B7;stroke: #B7B7B7', //箭头颜色
            arrowhead: 'undirected', // normal,vee,undirected 三种样式
            labelType: 'html', //可以设置文本以及 html 格式，默认为文本格式
            label:
              item.data && item.data.condition
                ? // ? `<div class="line-box"><span class="line-style"><i class="el-icon-connection"></i></span><div class="line-tips"><p class="line-condition-title">分支条件：</p><p>${item.data.condition}</p><p class="line-condition-title">分支描述：</p><p>${item.data.describe}</p></div></div>`
                  `<div class="line-box"><span class="line-style" style="  display: block;width: 22px;height: 22px;background-color: #b7b7b7;border-radius: 50%;cursor: pointer;margin: auto;color: #fff;text-align: center;line-height: 22px;" ><i class="el-icon-connection"></i></span>`
                : '',
            class: 'edge-line'
          })
        }
      })
    },
    //绘制图形
    renderFun() {
      var svgAb = d3.select('svg')
      // svgAb
      //   .select('g')
      //   .exit()
      //   .remove() //删除以前的节点
      var innerAb = svgAb.select('g')
      var render = new dagreD3.render()
      console.log(this.gGraph, 'this.gGraph')
      render(innerAb, this.gGraph)
    },
    selectEvent() {
      var svg = d3.select('svg'),
        inner = svg.select('g')
      let code
      // 鼠标右击
      // inner.selectAll('g.node').on('mousedown', e => {
      //  e.preventDefault();
      //   console.log(e, '鼠标右键点击了')
      // })
      // mouseover 鼠标经过
      inner.selectAll('.edgeLabel').on('click', (e, k, n) => {
        const conditionVal = this.list.edges.filter(q => {
          return q.source == e.v && q.target == e.w
        })
        this.edgeInfo = conditionVal[0]
        if (this.edgeInfo && this.edgeInfo.data) {
          this.showEdgeInfoDialog = true
        }
        console.log(conditionVal, 'conditionVal')
      })

      // 点击连接线
      inner.selectAll('g.edgePath').on('click', (e, k, n) => {
        code = this.list.edges.filter(item => {
          return item.target == e.w
        })
        console.log(code, '连接线对象数据')
        this.curEdgeObj = code
        this.showEditLineDialog = true
      })
      // 点击节点
      inner.selectAll('g.node').on('click', (e, k, n) => {
        const curNodeSourceArr = this.list.edges.filter(q => {
          return q.source == e
        })
        if (curNodeSourceArr && curNodeSourceArr.length == 1) {
          this.list.nodeInfos = this.list.nodeInfos.map(q => {
            if (q.id == e) {
              q.disabled = false
            }
            return q
          })
        }
        code = this.list.nodeInfos.filter(item => {
          return item.id == e
        })
        console.log(code, '点击事件')
        if (code && code[0].disabled) {
          return
        }

        this.nodeEditTitle = `操作 (${code && code[0].label})`
        this.showEditDialog = true
        this.curNodeObj = code
      })
    },
    // 缩放
    scale() {
      var initialScale = this.scaleValue / 100
      // if (initialScale == 1) return
      var svgAb = d3.select('svg'),
        innerAb = svgAb.select('g')
      var zoom = d3.zoom().on('zoom', function() {
        innerAb.attr('transform', d3.event.transform)
      })
      svgAb.call(zoom) // 去除方法缩小
      svgAb.call(
        zoom.transform,
        d3.zoomIdentity
          // .translate(
          //   (svgAb.attr('width') - this.gGraph.graph().width * initialScale) /
          //     26,
          //   20
          // )
          .translate(svgAb.attr('width'), 20)
          .scale(initialScale)
      )
      svgAb.attr('height', this.gGraph.graph().height * initialScale + 40)
    },
    // rightEvent() {
    //   var svgCanvas = document.getElementById('svg-canvas') //svg
    //   var myMenu = document.getElementById('myMenu') //右键菜单
    //   svgCanvas.addEventListener('mouseover', function(e) {
    //     //监听鼠标右键
    //     e.preventDefault()
    //     if (e.target.tagName === 'rect') {
    //       myMenu.style.top = event.clientY + 'px' //获取鼠标位置
    //       myMenu.style.left = event.clientX + 'px'
    //       myMenu.style.display = 'block' //显示相应右键内容
    //     }
    //   })
    //   document.addEventListener('click', event => {
    //     myMenu.style.display = 'none'
    //   })
    // },
    // 提交添加节点信息
    sumbitAddNodeFun(arr) {
      console.log(arr, 'arr')
      let e = this.curNodeObj[0].id
      console.log(this.curNodeObj, '节点对象数据')
      // 限制已有并行节点点击
      // let hasArr = []
      // let isReturn = true
      // this.list.edges.map(q => {
      //   console.log(q, '----q')
      //   if (hasArr.includes(this.curNodeObj[0].source)) {
      //     console.log(q, '打断了q')
      //     isReturn = false
      //   }
      //   hasArr.push(q.source)
      // })
      // if (!isReturn) {
      //   return
      // }
      // {
      //   hasArr = []
      // }
      // isStrand 1为串行 2为并行 3为会签（给当并行叠加并行）
      if (this.isStrand == 1) {
        //串行
        // 添加串行节点
        this.list.nodeInfos = this.list.nodeInfos.concat({
          id: e + '11',
          label: '节点' + e + '11'
        })
        // 添加串行节点链接关系
        this.list.edges = this.list.edges.map(q => {
          if (q.source == e) {
            this.nextNode = q.target
            q.target = e + '11'
          }
          return q
        })
        this.list.edges =
          this.list.edges &&
          this.list.edges.concat({
            source: e + '11',
            target: this.nextNode
          })

        // 存储并重新渲染
        localStorage.setItem('list', JSON.stringify(this.list))
        // window.location.reload()
        this.initFlow()
      } else if (this.isStrand == 2) {
        // 并行

        // 添加空节点（创建空节点视觉优化链接线汇交点）
        this.list.nodeInfos = this.list.nodeInfos.concat({
          id: e + 'empty01',
          label: '',
          shape: 'ellipse',
          class: 'empty'
        })
        // 添加并行节点
        this.list.nodeInfos = this.list.nodeInfos.concat(
          {
            id: e + '21',
            label: '节点' + e + '21'
          },
          {
            id: e + '22',
            label: '节点' + e + '22'
          }
        )

        //添加并行节点链接关系1
        this.list.edges = this.list.edges.map(q => {
          if (q.source == e) {
            this.nextNode = q.target
            q.target = e + '21'
          }
          return q
        })
        // 添加空节点链接关系
        this.list.edges =
          this.list.edges &&
          this.list.edges.concat({
            source: e + 'empty01',
            target: this.nextNode
          })
        // 添加并行节点链接关系2
        this.list.edges =
          this.list.edges &&
          this.list.edges.concat(
            {
              source: e,
              target: e + '22'
            },
            {
              source: e + '21',
              // target: this.nextNode,
              target: e + 'empty01'
            },
            {
              source: e + '22',
              // target: this.nextNode,
              target: e + 'empty01'
            }
          )

        // 存储并重新渲染
        localStorage.setItem('list', JSON.stringify(this.list))
        // window.location.reload()
        this.initFlow()
      } else {
        // 会签
        const hqStartObj = this.list.edges.filter(q => {
          return q.target == e
        })
        const hqStartId = hqStartObj[0].source
        const hqEndObj = this.list.edges.filter(q => {
          return q.source == e
        })
        const hqEndId = hqEndObj[0].target

        // 添加会签节点
        this.list.nodeInfos = this.list.nodeInfos.concat({
          id: e + '31',
          label: '节点' + e + '31'
        })

        // 添加会签链接关系
        this.list.edges =
          this.list.edges &&
          this.list.edges.concat(
            {
              source: hqStartId,
              target: e + '31'
            },
            {
              source: e + '31',
              target: hqEndId
            }
          )
        //  存储并重新渲染
        localStorage.setItem('list', JSON.stringify(this.list))
        // window.location.reload()
        this.initFlow()
      }
      this.$message.success('添加节点成功')
    },
    cancelAddNode() {
      this.showAddNodeDialog = false
    },
    cancelInfoNode() {
      this.showInfoNodeDialog = false
    },
    cancelAddCondition() {
      this.showAddCondtionDialog = false
    },
    cancelDialog() {
      this.showEdgeInfoDialog = false
    },
    // 节点属性配置更新
    sumbitNodeInfo(val) {
      this.list.nodeInfos = this.list.nodeInfos.map(q => {
        if (q.id == val.id) {
          q.label = val.label
        }
        return q
      })
      localStorage.setItem('list', JSON.stringify(this.list))
      this.initFlow()
    },
    sumbitAddCondition(obj) {
      console.log(obj, '条件信息')
      this.list.edges = this.list.edges.map(q => {
        if (this.curEdgeObj[0] && this.curEdgeObj[0].target == q.target) {
          q.data = obj
        }
        return q
      })
      // 存储并重新渲染
      localStorage.setItem('list', JSON.stringify(this.list))
      window.location.reload()
    },
    // 禁止节点事件
    initDisabled() {
      let hasArr = []
      console.log(this.list.nodeInfos, 'this.list.nodeInfos')
      this.list.edges = this.list.edges.map(q => {
        if (hasArr.includes(q.source)) {
          this.list.nodeInfos = this.list.nodeInfos.map(j => {
            if (j.id == q.source) {
              console.log(q, '打断了q')
              j.disabled = true
            }
            return j
          })
        }
        hasArr.push(q.source)
        return q
      })
    },
    // 点击操作列表
    nodeClickEvent(id) {
      switch (id) {
        case 1:
          console.log(id, '增加节点')
          this.showAddNodeDialog = true
          this.showEditDialog = false
          break
        case 2:
          console.log(id, '删除节点')
          this.deleteNode()
          break
        case 3:
          console.log(id, '节点属性')
          this.showInfoNodeDialog = true
          this.showEditDialog = false
          break
      }
    },
    // 点击链接线操作列表
    edgesClickEvent(id) {
      switch (id) {
        case 1:
          console.log(id, '自动条件')
          this.showAddCondtionDialog = true
          break
        case 2:
          console.log(id, '手动条件')
          break
        case 3:
          console.log(id, '排它条件')
          break
      }
    },
    // 删除节点
    deleteNode() {
      this.$confirm(
        `此操作将永久删除『${this.curNodeObj[0].label}』, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 先删除原来的所有节点然后重新渲染
        this.list.nodeInfos &&
          this.list.nodeInfos.forEach((item, index) => {
            this.gGraph.removeNode(item.id)
          })

        // this.gGraph.removeNode(this.curNodeObj[0].id)
        this.showEditDialog = false
        this.list.nodeInfos = this.list.nodeInfos.filter(q => {
          return q.id != this.curNodeObj[0].id
        })
        const targetNode = this.list.edges.filter(q => {
          return q.target == this.curNodeObj[0].id
        })
        const sourceNode = this.list.edges.filter(q => {
          return q.source == this.curNodeObj[0].id
        })
        this.list.edges = this.list.edges.filter(q => {
          return (
            q.target != this.curNodeObj[0].id &&
            q.source != this.curNodeObj[0].id
          )
        })
        const repeatNode = this.list.edges.filter(q => {
          return (
            q.source == targetNode[0].source || q.target == sourceNode[0].target
          )
        })
        if (repeatNode && repeatNode.length < 1) {
          this.list.edges = this.list.edges.concat({
            source: targetNode[0].source,
            target: sourceNode[0].target
          })
        }
        this.filterEmptyNode()
        // 存储并重新渲染
        localStorage.setItem('list', JSON.stringify(this.list))
        // window.location.reload()
        this.initFlow()
      })
    },
    svgToPng() {
      const node = document.querySelector('svg')
      // const node = d3.select('svg')
      this.covertSVG2Image(
        node,
        '缩略图',
        window.innerWidth,
        window.document.querySelector('.svg-box').clientHeight - 100
      )
    },
    // 导出svg为图片
    covertSVG2Image(node, name, width, height, type = 'png') {
      let serializer = new XMLSerializer()
      let source =
        '<?xml version="1.1" standalone="no"?>\r\n' +
        serializer.serializeToString(node)
      let image = new Image()
      image.src =
        'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
      let canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      let context = canvas.getContext('2d')
      context.fillStyle = '#fff'
      context.fillRect(0, 0, 10000, 10000)
      image.onload = function() {
        context.drawImage(image, 0, 0)
        let a = document.createElement('a')
        a.download = `${name}.${type}`
        a.href = canvas.toDataURL(`image/${type}`)
        a.click()
      }
    },
    // 合并连接线空节点之前不可触发事件
    initEdgesEvent() {
      this.list.nodeInfos = this.list.nodeInfos.map(q => {
        if (q.class == 'empty') {
          console.log(q, 'q-empty')
          this.list.edges = this.list.edges.map(j => {
            if (q.id == j.target) {
              j.empty = true
              console.log(j, 'j-==-=-=-==')
            } else {
              // target包含0则判断为空节点
              if (j.target.indexOf('empty01') == -1) {
                j.empty = false
              }
            }
            return j
          })
        }
        return q
      })
    },
    // 遍历去掉删除节点后串行中的空节点
    filterEmptyNode() {
      this.list.nodeInfos = this.list.nodeInfos.map(q => {
        if (q.class == 'empty') {
          let emptybefore = []
          let emptyAfter = []
          this.list.edges.forEach(j => {
            if (q.id == j.target) {
              emptybefore.push(j)
            }
            if (q.id == j.source) {
              emptyAfter.push(j)
            }
          })
          console.log(emptybefore, 'emptybefore')
          console.log(emptyAfter, 'emptyAfter')

          if (emptybefore && emptybefore.length < 2) {
            this.list.edges = this.list.edges.filter(k => {
              return q.id != k.target && q.id != k.source
            })
            this.list.edges = this.list.edges.concat({
              source: emptybefore[0].source,
              target: emptyAfter[0].target
            })
            q = ''
          }
        }
        return q
      })
      this.list.nodeInfos = this.list.nodeInfos.filter(q => {
        return q != ''
      })
    },
    // 多源头连接线合并
    sourceEdgesInit() {
      let hasArr = []
      let repSource = ''
      this.list.edges = this.list.edges.map(q => {
        if (hasArr.includes(q.source)) {
          repSource = q.source
          // this.list.nodeInfos = this.list.nodeInfos.map(j => {
          //   if (j.id == q.source) {
          //     console.log(q, '打断了q')
          //     j.disabled = true
          //   }
          //   return j
          // })
        }
        hasArr.push(q.source)
        return q
      })
    },
    // 渲染流程图
    initFlow() {
      this.initDisabled()
      this.initEdgesEvent()
      this.setNodeFun()
      this.setEdgeFun()
      console.log(this.list, 'list')
      this.renderFun()
      this.selectEvent()
    }
  },
  created() {
    this.list = JSON.parse(localStorage.getItem('list')) || this.list
    // this.initDisabled()
    // this.initEdgesEvent()
  },
  mounted() {
    this.initFlow()
    this.scale()
  }
}
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  list-style: none;
}
.flow-chart {
  width: 100%;
  height: 100%;
  // border: solid 1px #666;
}
.flowchart {
  height: calc(100% - 80px);
  padding-top: 80px;
  // overflow: auto;
  .svg-box {
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
  }
}
svg {
  font-size: 14px;
}
.node text {
  color: #fff;
}
.node rect {
  // stroke: #606266;
  // fill: #fff;
  // stroke: #4b90de
  stroke: #fff;
  fill: #4b90de;
  stroke-width: 2px;
}

.edgePath path {
  stroke: #b7b7b7;
  stroke-width: 6px;
}
.node circle {
  stroke: #fff;
  // fill: #4b90de;
  stroke-width: 2.5px;
}
.node ellipse {
  fill: #606266;
  opacity: 0.2;
  stroke-width: 1px;
}

// .line-style {
//   display: block;
//   width: 22px;
//   height: 22px;
//   background-color: #b7b7b7;
//   border-radius: 50%;
//   cursor: pointer;
//   margin: auto;
//   color: #fff;
//   text-align: center;
//   line-height: 22px;
// }
.line-condition-title {
  color: #4b90de;
}
.output {
  position: relative;
}
.edgeLabel .label {
  transform: translate(-14, -69.5) !important;
}
.node-label {
  color: #fff;
  font-size: 12px;
  i {
    font-size: 20px;
    margin-top: 2px;
  }
}
.node-label-text {
  position: absolute;
  left: -18px;
  top: 40px;
  width: 52px;
  text-align: center;
  span {
    display: block;
    font-size: 12px;
  }
  .process {
    opacity: 0.5;
    font-size: 0.6rem;
  }
  // display: contents;
  // color: #fff;
  // font-size: 12px;
}

.edit-list-dialog {
  .el-dialog__body {
    padding: 0 20px 20px 20px !important;
  }
  .el-dialog__title {
    // font-size: 0.8rem;
  }
}
.edit-list {
  li {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    height: 30px;
    line-height: 30px;
  }
  li :hover {
    opacity: 0.7;
  }
}
.line-box:hover {
  .line-style {
    background-color: #f5a623 !important;
  }
  .line-tips {
    visibility: inherit;
  }
}
.edgePath marker path {
  stroke-width: 0px !important;
}
.edge-line path:hover {
  stroke: #f5a623 !important;
}
.edge-line path:focus {
  // fill: #666;
  // stroke: red !important;
}
.line-box {
  max-width: 180px;
  position: relative;
}
.line-tips {
  // display: contents;
  visibility: hidden;
  white-space: normal;
  position: absolute;
  top: 26px;
  left: -38px;
  width: 84px;
  border: solid 1px #dcdcdc;
  border-radius: 8px;
  background-color: #f5f5f5;
  padding: 4px;
  p {
    font-size: 12px;
  }
}
.node-style {
  cursor: pointer;
  fill: #4b90de;
  foreignObject {
    text-align: center;
  }
}
.start {
  fill: #62b200;
}
.end {
  fill: #b7b7b7;
  color: #fff;
  font-size: 12px;
  line-height: 22px;
}

.node-label-html {
  position: relative;
}
.condtion-dialog {
  position: fixed;
  top: 0;
  left: 0;
  background-color: #dcdcdc;
}
.btns-area {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-flow: row-reverse;
  padding: 20px;
}
.scale-box {
  display: flex;
  margin-left: 30px;
  .slide {
    width: 100px;
    margin: 0 6px;
  }
  .value {
    margin-left: 12px;
    margin-top: 8px;
    margin-right: 20px;
  }
  .scale-icon {
    margin-top: 8px;
  }
}
</style>
