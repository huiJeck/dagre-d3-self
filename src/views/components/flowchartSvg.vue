<template>
  <!-- 增加分支功能 -->
  <div class="flow-chart">
    <div class="btns-area">
      <el-button class="revoke-btn" type="primary" @click="saveSubmit"
        >保存</el-button
      >
      <el-button @click="svgToPng">导出</el-button>

      <el-button
        class="revoke-btn"
        :disabled="revokeDisabled"
        @click="revokeFun"
        >撤销</el-button
      >
      <!-- <div class="scale-box">
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
      </div> -->
    </div>
    <!-- svg -->
    <div class="flowchart">
      <svg class="svg-box">
        <g class="g-box" />
        <rect />
      </svg>
    </div>

    <!-- 节点编辑列表 -->
    <!-- <el-dialog
      :title="nodeEditTitle"
      width="300px"
      :visible.sync="showEditDialog"
      class="edit-list-dialog"
    >
      <ul class="edit-list">
        <li
          v-for="item in curNodeObj[0] && curNodeObj[0].data.type == 'start'
            ? filterArr(editListArr)
            : editListArr"
          :key="item.id"
          @click="nodeClickEvent(item.id)"
        >
          <div>{{ item.label }}</div>
          <div>{{ item.code }}</div>
        </li>
      </ul>
    </el-dialog> -->

    <!-- 链接线条件编辑列表 -->
    <!-- <el-dialog
      title="操作 (条件配置)"
      width="300px"
      :visible.sync="showEditLineDialog"
      class="edit-list-dialog"
      :modal="false"
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
    </el-dialog> -->

    <!-- 添加节点 -->
    <AddNodeDialog
      v-if="showAddNodeDialog"
      :addNodeType="addNodeType"
      :nodeInfos="list.nodeInfos"
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

    <!-- 添加连接线条件 -->
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

    <!-- 点击连接线鼠标右侧菜单列表 -->
    <div v-show="showEditLineDialog">
      <div class="dialog-mask" @click="showEditLineDialog = false"></div>
      <div class="edit-list-position edge-edit-list" id="edgeMenuDialog">
        <ul class="edit-list">
          <li
            v-for="item in editLineListArr"
            :key="item.id"
            @click="edgesClickEvent(item.id)"
          >
            <div>{{ item.label }}</div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 点击节点鼠标右侧菜单列表 -->
    <div v-show="showEditDialog">
      <div class="dialog-mask" @click="showEditDialog = false"></div>
      <div class="edit-list-position node-edit-list" id="nodeMenuDialog">
        <ul class="edit-list">
          <li
            v-for="item in editListArrFilter(editListArr)"
            :key="item.id"
            @click="nodeClickEvent(item.id)"
          >
            <div>{{ item.label }}（{{ item.code }}）</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import dagreD3 from 'dagre-d3'
import * as d3 from 'd3'
import AddNodeDialog from './addNodeDialog.vue'
import InfoNodeDialog from './infoNodeDialog.vue'
import EdgesCondtionDialog from './addConditionDialog.vue'
import EdgeInfoDialog from './edgeInfoDialog.vue'
import mockList from './mockJson.js'

const userIconInit = require('@/assets/img/user.png')
const departIconInit = require('@/assets/img/depart.png')
const stationIconInit = require('@/assets/img/station.png')
const conditionIconInit = require('@/assets/img/condition.png')
const finishedIconInit = require('@/assets/img/finished.png')
const unreadableIconInit = require('@/assets/img/unreadable.png')

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
      revokeDisabled: true,
      isAddBranchState: false,
      branchStartNode: {},
      branchEndNode: {},
      // 节点类型
      addNodeType: '',
      // 节点不可查看icon
      unreadableIcon: unreadableIconInit,
      finishedIcon: finishedIconInit,
      // 初始化用户当前节点
      initCurId: 'node4',
      clientPosition: {},
      // icon显示
      stationIcon: stationIconInit,
      roleIcon: departIconInit,
      conditionIcon: conditionIconInit,
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
        },
        {
          id: 4,
          label: '增加分支',
          code: 'A'
        }
      ],
      showEditDialog: false,
      showAddNodeDialog: false,
      curNodeObj: {},
      isStrand: 1, // 1为串行  2位并行 3为会签 4为下节点并行
      list: {
        nodeInfos: [
          {
            id: 'startEvent_1', // id
            name: '发起者' // 节点名称
            // shape: 'circle', // 节点类型  rect,circle,ellipse,diamond,默认值为rect
            // class:'empty', // 空节点
          },
          {
            id: 'userTask_3',
            name: '节点第二个',
            finished: true,
            unreadable: false,
            type: 'node',
            typeLabel: '审批',
            role: 'role'
          },
          {
            id: 'userTask_4',
            name: '节点3',
            finished: false,
            unreadable: true,
            type: 'node',
            typeLabel: '审批'
          },
          {
            id: 'userTask_5',
            name: '节点4',
            type: 'node',
            typeLabel: '审批'
          },
          {
            id: 'userTask_6',
            name: '节点5',
            type: 'node',
            typeLabel: '审批'
          },
          {
            id: 'endEvent_2',
            name: 'END'
          }
        ],
        edges: [
          {
            sourceRef: 'startEvent_1', // 源头
            targetRef: 'userTask_3', // 末尾
            id: 'flow_1_3'
          },
          {
            sourceRef: 'userTask_3',
            targetRef: 'userTask_4',
            id: 'flow_3_4',
            conditionExpression:
              '[发起者][单位(所属单位)] != "某地综合交通枢纽建设投资有限公司"'
            // data: {
            //   condition:
            //     '[发起者][单位(所属单位)] != "某地综合交通枢纽建设投资有限公司"',
            //   describe: '这是描述'
            // }
          },
          {
            sourceRef: 'userTask_4',
            targetRef: 'userTask_5',
            id: 'flow_4_5'
          },
          {
            sourceRef: 'userTask_5',
            targetRef: 'userTask_6',
            id: 'flow_5_6'
          },
          {
            sourceRef: 'userTask_6',
            targetRef: 'endEvent_2',
            id: 'flow_6_2'
          }
        ]
      },
      nextNode: '',
      gGraph: new dagreD3.graphlib.Graph({})
        .setGraph({
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
    // 开始节点-菜单筛选
    filterArr(val) {
      const filterArr = val.filter(q => {
        return q.id != 2
      })
      return filterArr
    },

    filterArrEmptyNode(val) {
      const filterArr = val.filter(q => {
        return q.id == 1 || q.id == 4
      })
      return filterArr
    },

    // 节点菜单列表过滤
    editListArrFilter(arr) {
      const curNodeData = this.curNodeObj[0] || {}
      if (curNodeData.id === 'startEvent_1') {
        return this.filterArr(arr)
      } else if (curNodeData.type === 'node') {
        return arr
      } else {
        return this.filterArrEmptyNode(arr)
      }
    },

    upIsStrand(val) {
      this.isStrand = val
    },

    // 生成节点
    setNodeFun() {
      this.list.nodeInfos &&
        this.list.nodeInfos.forEach((item, index) => {
          this.gGraph.removeNode(item.id)
          // item.rx = item.ry = 5
          if (item.class === 'empty') {
            this.gGraph.setNode(item.id, {
              style: 'stroke: #fff;fill:#B7B7B7;stroke-width:1.6px;',
              width: -20,
              ...item,
              shape: 'circle',
              label: ''
            })
          } else {
            const typeLabelHtml = `[${item.typeLabel}]`
            const finishedIconHtml = `<img style="position: absolute;right: -11px;top: 13px;width: 18px;" src="${this.finishedIcon}">`
            const unreadableIconHtml = `<img style="position: absolute;right: -11px;top: 13px;width: 18px;" src="${this.unreadableIcon}">`
            const branchDisabledStyle = `opacity:0.6;${
              item.id == 'endEvent_2'
                ? 'fill: #b7b7b7;'
                : item.id == 'startEvent_1'
                ? 'fill: #62b200;'
                : 'fill: #4b90de;'
            }`
            const nodeStyle = `${
              this.initCurId === item.id ? 'stroke: #f6b74d;' : 'stroke: #fff;'
            }stroke-width:5px;${
              item.id == 'endEvent_2'
                ? 'fill: #b7b7b7;'
                : item.id == 'startEvent_1'
                ? 'fill: #62b200;'
                : 'fill: #4b90de;'
            }`
            this.gGraph.setNode(item.id, {
              ...item,
              class: `node-style`,
              shape: 'circle',
              style: item.branchDisabled ? branchDisabledStyle : nodeStyle,
              labelType: 'html', //可以设置文本以及 html 格式，默认为文本格式
              label:
                item.id == 'endEvent_2'
                  ? '<div style="color:#fff;font-size:12px;line-height:20px">END</div>'
                  : `<div class="node-label-html"><div class="node-label" style="width:24px;height:20px"> <img style="width:24px;" src="${
                      item.role == 'station'
                        ? this.stationIcon
                        : item.role == 'role'
                        ? this.roleIcon
                        : this.userIcon
                    }" alt="12" /></i></div>${
                      item.finished
                        ? finishedIconHtml
                        : item.unreadable
                        ? unreadableIconHtml
                        : ''
                    }<p class="node-label-text" style="position: absolute;left: -19px;top: 22px;width: 62px;text-align: center; display: block;" ><span>${
                      item.name
                    }</span><span class="process"style=" display: block;opacity: 0.5;font-size: 0.6rem;" >${
                      item.typeLabel ? typeLabelHtml : ''
                    }</span></p></div>`
              // label: `<span class="node-label">${item.label}</span>`
            })
          }
        })
    },

    // 生成连接线
    setEdgeFun() {
      this.list.edges = this.list.edges.filter(q => {
        return q.sourceRef != q.targetRef
      })
      this.list.edges.forEach(item => {
        if (item.empty) {
          // 空节点单独画线
          this.gGraph.setEdge(item.sourceRef, item.targetRef, {
            style: 'stroke: #B7B7B7; fill: none;stroke-width:1.5px', //线条颜色
            // arrowheadStyle: 'fill:#B7B7B7;stroke: #B7B7B7', //箭头颜色
            arrowhead: 'undirected' // normal,vee,undirected 三种样式
          })
        } else {
          this.gGraph.setEdge(item.sourceRef, item.targetRef, {
            style: 'stroke: #B7B7B7; fill: none;stroke-width:4px', //线条颜色
            // arrowheadStyle: 'fill:#B7B7B7;stroke: #B7B7B7', //箭头颜色
            arrowhead: 'undirected', // normal,vee,undirected 三种样式
            labelType: 'html', //可以设置文本以及 html 格式，默认为文本格式
            label: item.conditionExpression
              ? // `<div class="line-box"><span class="line-style" style="display: block;width: 22px;height: 22px;background-color: #b7b7b7;border-radius: 50%;cursor: pointer;margin: auto;color: #fff;text-align: center;line-height: 22px;" ><i class="el-icon-connection"></i></span>`
                `<div class="line-box"><span class="line-style" style="display: block;width: 22px;height: 22px;background-color: #b7b7b7;border-radius: 50%;cursor: pointer;margin: auto;color: #fff;text-align: center;line-height: 22px;" ><img style="width:20px;margin-top:2px" src="${this.conditionIcon}" alt="12" /></span>`
              : '',
            class: 'edge-line'
          })
        }
      })
    },

    //绘制图形
    renderFun() {
      var svgAb = d3.select('svg')
      var innerAb = svgAb.select('g')
      var render = new dagreD3.render()
      render(innerAb, this.gGraph)
    },

    // 事件触发
    selectEvent() {
      var svg = d3.select('svg'),
        inner = svg.select('g')
      let code
      // 点击连接线条件图标
      inner.selectAll('.edgeLabel').on('click', (e, k, n) => {
        const conditionVal = this.list.edges.filter(q => {
          return q.sourceRef == e.v && q.targetRef == e.w
        })
        this.edgeInfo = conditionVal[0]
        if (this.edgeInfo.conditionExpression) {
          this.showEdgeInfoDialog = true
        }
      })

      // 点击连接线
      inner.selectAll('g.edgePath').on('click', (e, k, n) => {
        code = this.list.edges.filter(item => {
          return item.targetRef == e.w
        })
        this.curEdgeObj = code
        if (this.isAddBranchState) return
        this.showEditLineDialog = true
      })

      // 点击节点
      inner.selectAll('g.node').on('click', (e, k, n) => {
        this.showEditLineDialog = false
        const curNodeSourceArr = this.list.edges.filter(q => {
          return q.sourceRef == e
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
        // 增加分支点击节点
        if (code[0].branchDisabled === false) {
          this.branchEndNode = code[0]
          if (this.branchEndNode.id === this.branchStartNode.id) {
            this.initBranchDisabledFun(0)
          } else {
            this.addBranchSubmit()
          }
          return
        } else if (code[0].branchDisabled === true) {
          return
        }

        const codeData = code[0]
        if (
          (code[0] && code[0].disabled) ||
          (codeData && codeData.id === 'endEvent_2')
        ) {
          return
        }

        this.nodeEditTitle = `操作 (${code && code[0].label})`
        this.showEditDialog = true
        this.curNodeObj = code
        this.addNodeType = codeData && codeData.type
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
          // .translate(svgAb.attr('width'), 20)
          .translate(svgAb.attr('width'), 20)
          .scale(initialScale)
      )
      svgAb.attr('height', this.gGraph.graph().height * initialScale + 40)
    },

    // 添加串行节点
    addCxFun(arr, curNodeIndex) {
      let e = this.curNodeObj[0].id
      // 添加串行节点
      // this.list.nodeInfos = this.list.nodeInfos.concat({
      //   id: e + '11',
      //   label: '节点' + e + '11'
      // })
      // 反转数组整理节点顺序
      const reverseArr = arr.slice().reverse()
      reverseArr &&
        reverseArr.forEach(q => {
          this.list.nodeInfos.splice(curNodeIndex + 1, 0, q)
        })

      this.list.edges = this.list.edges.map(q => {
        if (q.sourceRef == e) {
          this.nextNode = q.targetRef
          q.targetRef = arr[0].id
        }
        return q
      })
      // 动态遍历多条节点
      const midItemArr =
        arr &&
        arr.map(q => {
          return q.id
        })
      let midItemObjArr =
        midItemArr &&
        midItemArr.map((q, index) => {
          let obj = ''
          if (midItemArr[index + 1]) {
            obj = {
              sourceRef: q,
              targetRef: midItemArr[index + 1]
            }
          }
          return obj
        })
      const midItemObjArrFilter =
        midItemObjArr &&
        midItemObjArr.filter(q => {
          return q.sourceRef
        })
      // 添加连接关系
      this.list.edges =
        this.list.edges &&
        this.list.edges.concat(...midItemObjArrFilter, {
          sourceRef: arr.pop().id,
          // sourceRef: arr[0].id,
          targetRef: this.nextNode
        })

      // 添加串行节点链接关系
      // this.list.edges = this.list.edges.map(q => {
      //   if (q.sourceRef == e) {
      //     this.nextNode = q.targetRef
      //     q.targetRef = e + '11'
      //   }
      //   return q
      // })
      // this.list.edges =
      //   this.list.edges &&
      //   this.list.edges.concat({
      //     sourceRef: e + '11',
      //     targetRef: this.nextNode
      //   })

      this.initBranchDisabledFun()
    },

    // 添加并行节点
    addBxFun(arr, curNodeIndex) {
      let e = this.curNodeObj[0].id
      if (arr && arr.length < 2) {
        this.$message.error('添加并行节点至少选择两条数据')
        return
      }

      // 添加空节点（创建空节点视觉优化链接线汇交点）
      const randomNum = Math.floor(Math.random() * 100) + ''
      // this.list.nodeInfos = this.list.nodeInfos.concat(
      //   {
      //     id: e + randomNum + '_empty01',
      //     label: '',
      //     shape: 'ellipse',
      //     class: 'empty'
      //   },
      //   {
      //     id: e + randomNum + '_empty01empty01',
      //     label: '',
      //     shape: 'ellipse',
      //     class: 'empty'
      //   }
      // )
      // this.list.nodeInfos = this.list.nodeInfos.concat(arr)
      this.list.nodeInfos.splice(curNodeIndex + 1, 0, {
        id: e + randomNum + '_empty01empty01',
        name: '',
        shape: 'ellipse',
        class: 'empty'
      })
      // 反转数组整理节点顺序
      const reverseArr = arr.slice().reverse()
      reverseArr &&
        reverseArr.forEach(q => {
          this.list.nodeInfos.splice(curNodeIndex + 1, 0, q)
        })

      this.list.nodeInfos.splice(curNodeIndex + 1, 0, {
        id: e + randomNum + '_empty01',
        name: '',
        shape: 'ellipse',
        class: 'empty'
      })

      this.list.edges = this.list.edges.map(q => {
        if (q.sourceRef == e) {
          this.nextNode = q.targetRef
          q = ''
        }
        return q
      })
      this.list.edges = this.list.edges.filter(q => {
        return q
      })
      // 添加空节点链接关系
      this.list.edges =
        this.list.edges &&
        this.list.edges.concat({
          sourceRef: e + randomNum + '_empty01empty01',
          targetRef: this.nextNode
        })
      // 动态遍历添加多条并行节点
      const midItemArr =
        arr &&
        arr.map(q => {
          return q.id
        })
      const midItemObjBx1 = midItemArr.map(q => {
        let obj = {
          sourceRef: e + randomNum + '_empty01',
          targetRef: q
        }
        return obj
      })
      const midItemObjBx2 = midItemArr.map(q => {
        let obj = {
          sourceRef: q,
          targetRef: e + randomNum + '_empty01empty01'
        }
        return obj
      })

      // 添加并行节点链接关系2
      this.list.edges =
        this.list.edges &&
        this.list.edges.concat(
          { sourceRef: e, targetRef: e + randomNum + '_empty01' },
          ...midItemObjBx1,
          ...midItemObjBx2
        )

      this.initBranchDisabledFun()
    },

    // 添加分支会签
    addBranchFun(arr, curNodeIndex) {
      const hqStartObj = this.list.edges.filter(q => {
        return q.targetRef == this.branchStartNode.id
      })
      const hqStartId = hqStartObj[0].sourceRef
      const hqEndObj = this.list.edges.filter(q => {
        return q.sourceRef == this.branchEndNode.id
      })
      const hqEndId = hqEndObj[0].targetRef

      const e = hqStartId

      // 若在无并行场景添加会签
      const isCxEnd = hqEndId.includes('empty01')
      const isCxStart = hqStartId.includes('empty01')
      const isCx = !(isCxEnd && isCxStart)
      if (isCx) {
        let e = this.branchEndNode.id
        // 获取点击节点在流程中的位置
        const flowchartArr = this.list.nodeInfos.map(q => {
          return q.id
        })
        const branchEndNodeIndex = flowchartArr.indexOf(e)
        this.list.nodeInfos.splice(branchEndNodeIndex + 1, 0, {
          id: e + '_empty01empty01',
          name: '',
          shape: 'ellipse',
          class: 'empty'
        })
      }
      // this.list.nodeInfos = this.list.nodeInfos.concat(arr)
      // 反转数组整理节点顺序
      const reverseArr = arr.slice().reverse()
      reverseArr &&
        reverseArr.forEach(q => {
          this.list.nodeInfos.splice(curNodeIndex, 0, q)
        })
      if (isCx) {
        // this.list.nodeInfos = this.list.nodeInfos.concat(
        this.list.nodeInfos.splice(curNodeIndex, 0, {
          id: e + '_empty01',
          name: '',
          shape: 'ellipse',
          class: 'empty'
        })
        if ((isCxEnd && !isCxStart) || (isCxStart && !isCxEnd)) {
          // 删除原来的对象重新生成
          this.list.edges = this.list.edges.filter(q => {
            return (
              q.sourceRef != this.branchEndNode.id &&
              q.targetRef != this.branchStartNode.id
            )
          })
        } else {
          // 删除原来的对象重新生成
          this.list.edges = this.list.edges.filter(q => {
            return q.sourceRef != e && q.targetRef != hqEndId
          })
        }
        this.list.edges = this.list.edges.filter(q => {
          return q
        })
      }
      // 动态遍历添加多条会签节点
      const midItemArr =
        arr &&
        arr.map(q => {
          return q.id
        })
      const midItemObjHq1 = midItemArr.map(q => {
        let obj = {
          sourceRef: isCx ? e + '_empty01' : hqStartId,
          targetRef: q
        }
        return obj
      })
      const midItemObjHq2 = midItemArr.map(q => {
        let obj = {
          sourceRef: q,
          // targetRef: hqEndId
          targetRef: isCx ? this.branchEndNode.id + '_empty01empty01' : hqEndId
        }
        return obj
      })
      // 添加会签链接关系
      this.list.edges =
        this.list.edges &&
        this.list.edges.concat(...midItemObjHq1, ...midItemObjHq2)
      // 串行添加会签特殊处理
      if (isCx) {
        this.list.edges =
          this.list.edges &&
          this.list.edges.concat(
            {
              sourceRef: e + '_empty01',
              targetRef: this.branchStartNode.id
            },
            {
              sourceRef: this.branchEndNode.id,
              targetRef: this.branchEndNode.id + '_empty01empty01'
            },
            {
              sourceRef: this.branchEndNode.id + '_empty01empty01',
              targetRef: hqEndId
            },
            {
              sourceRef: hqStartId,
              targetRef: e + '_empty01'
            }
          )
      }

      this.initBranchDisabledFun()
    },

    // 添加会签节点
    addHqFun(arr, curNodeIndex) {
      let e = this.curNodeObj[0].id
      const hqStartObj = this.list.edges.filter(q => {
        return q.targetRef == e
      })
      const hqStartId = hqStartObj[0].sourceRef
      const hqEndObj = this.list.edges.filter(q => {
        return q.sourceRef == e
      })
      const hqEndId = hqEndObj[0].targetRef
      // this.list.nodeInfos = this.list.nodeInfos.concat(arr)

      // 若在无并行场景添加会签
      const isCxEnd = hqEndId.includes('empty01')
      const isCxStart = hqStartId.includes('empty01')
      const isCx = !(isCxEnd && isCxStart)
      if (isCx) {
        // this.list.nodeInfos = this.list.nodeInfos.concat(
        this.list.nodeInfos.splice(curNodeIndex + 1, 0, {
          id: e + '_empty01empty01',
          name: '',
          shape: 'ellipse',
          class: 'empty'
        })
      }
      // 反转数组整理节点顺序
      const reverseArr = arr.slice().reverse()
      reverseArr &&
        reverseArr.forEach(q => {
          this.list.nodeInfos.splice(curNodeIndex + 1, 0, q)
        })
      if (isCx) {
        // this.list.nodeInfos = this.list.nodeInfos.concat(
        this.list.nodeInfos.splice(curNodeIndex, 0, {
          id: e + '_empty01',
          name: '',
          shape: 'ellipse',
          class: 'empty'
        })
        // 删除原来的对象重新生成
        this.list.edges = this.list.edges.filter(q => {
          return q.sourceRef != e && q.targetRef != e
        })
        this.list.edges = this.list.edges.filter(q => {
          return q
        })
      }
      // 动态遍历添加多条会签节点
      const midItemArr =
        arr &&
        arr.map(q => {
          return q.id
        })
      const midItemObjHq1 = midItemArr.map(q => {
        let obj = {
          sourceRef: isCx ? e + '_empty01' : hqStartId,
          targetRef: q
        }
        return obj
      })
      const midItemObjHq2 = midItemArr.map(q => {
        let obj = {
          sourceRef: q,
          // targetRef: hqEndId
          targetRef: isCx ? e + '_empty01empty01' : hqEndId
        }
        return obj
      })
      // 添加会签链接关系
      this.list.edges =
        this.list.edges &&
        this.list.edges.concat(...midItemObjHq1, ...midItemObjHq2)
      // 串行添加会签特殊处理
      if (isCx) {
        this.list.edges =
          this.list.edges &&
          this.list.edges.concat(
            {
              sourceRef: e + '_empty01',
              targetRef: e
            },
            {
              sourceRef: e,
              targetRef: e + '_empty01empty01'
            },
            {
              sourceRef: e + '_empty01empty01',
              targetRef: hqEndId
            },
            {
              sourceRef: hqStartId,
              targetRef: e + '_empty01'
            }
          )
      }
      this.initBranchDisabledFun()
    },

    // 添加下节点并行
    addNextBxFun(arr, curNodeIndex) {
      let e = this.curNodeObj[0].id
      const nextNodeArr = this.list.edges.filter(q => {
        return q.sourceRef == this.curNodeObj[0].id
      })
      this.curNodeObj = this.list.nodeInfos.filter(q => {
        return q.id == (nextNodeArr && nextNodeArr[0].targetRef)
      })
      if (
        (this.curNodeObj[0] && this.curNodeObj[0].id.includes('empty01')) ||
        this.curNodeObj[0].id === 'endEvent_2'
      ) {
        this.$message.error('下节点不可添加并行节点')
        return
      }
      this.addHqFun(arr, curNodeIndex + 1)
    },

    // 取出两个数组相同的元素
    getArrRepeatFun(arr1, arr2) {
      let newArr = []
      for (let i = 0; i < arr2.length; i++) {
        for (let j = 0; j < arr1.length; j++) {
          if (arr1[j] === arr2[i]) {
            newArr.push(arr1[j])
          }
        }
      }
      return newArr
    },

    // 撤销
    revokeFun() {
      // 先删除原来的所有节点然后重新渲染
      this.list.nodeInfos &&
        this.list.nodeInfos.forEach((item, index) => {
          this.gGraph.removeNode(item.id)
        })
      this.list = JSON.parse(localStorage.getItem('beforeData'))
      this.revokeDisabled = true
      this.initFlow()
    },

    // 提交添加节点信息
    sumbitAddNodeFun(arrData) {
      // 生成节点随机数id
      let arr = JSON.parse(JSON.stringify(arrData)).map(q => {
        q.id = `userTask_${this.randNum()}`
        if (q.label) {
          q.name = q.label
        }
        return q
      })
      // 判断流程中是否已有选中节点
      const selectedArr = arr.map(q => {
        return q.id
      })
      const flowchartArr = this.list.nodeInfos.map(q => {
        return q.id
      })
      // const repeatArr = this.getArrRepeatFun(flowchartArr, selectedArr)
      // if (repeatArr && repeatArr.length > 0) {
      //   this.$message.error('所选节点有与流程中节点重复，请重新选择其他节点')
      //   return
      // }

      // 存储之前数据撤回的时候用
      localStorage.setItem('beforeData', JSON.stringify(this.list))
      this.revokeDisabled = false
      let e = this.curNodeObj[0].id
      // 获取点击节点在流程中的位置
      const curNodeIndex = flowchartArr.indexOf(e)
      // isStrand 1为串行 2为并行 3为会签 4为下节点并行
      switch (this.isStrand) {
        case 1:
          this.addCxFun(arr, curNodeIndex)
          break
        case 2:
          this.addBxFun(arr, curNodeIndex)
          break
        case 3:
          this.addHqFun(arr, curNodeIndex)
          break
        case 4:
          this.addNextBxFun(arr, curNodeIndex)
          break
        case 5:
          this.addBranchFun(arr, curNodeIndex)
          break
      }
      // this.$message.success('添加节点成功')
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

    // 节点属性修改
    sumbitNodeInfo(val) {
      this.list.nodeInfos = this.list.nodeInfos.map(q => {
        if (q.id == val.id) {
          q.name = val.name
          q.typeLabel = `[${val.typeLabel}]`
        }
        return q
      })
      localStorage.setItem('list', JSON.stringify(this.list))
      this.initFlow()
    },

    // 删除连接条件
    deleteCondtion() {
      this.$confirm(`此操作将永久删除该条件, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.list.edges = this.list.edges.map(q => {
          if (
            this.curEdgeObj[0] &&
            this.curEdgeObj[0].targetRef == q.targetRef
          ) {
            q.data = {}
          }
          return q
        })
        this.showEditLineDialog = false
        localStorage.setItem('list', JSON.stringify(this.list))
        this.initFlow()
      })
    },

    // 添加连接条件
    sumbitAddCondition(obj) {
      console.log(obj, '条件信息')
      this.list.edges = this.list.edges.map(q => {
        if (this.curEdgeObj[0] && this.curEdgeObj[0].targetRef == q.targetRef) {
          q.conditionExpression = obj.conditionExpression
        }
        return q
      })
      localStorage.setItem('list', JSON.stringify(this.list))
      this.initFlow()
    },

    // 禁止节点事件
    initDisabled() {
      let hasArr = []
      console.log(this.list.nodeInfos, 'this.list.nodeInfos')
      this.list.edges = this.list.edges.map(q => {
        if (hasArr.includes(q.sourceRef)) {
          this.list.nodeInfos = this.list.nodeInfos.map(j => {
            if (j.id == q.sourceRef) {
              console.log(q, '打断了q')
              j.disabled = true
            }
            return j
          })
        }
        hasArr.push(q.sourceRef)
        return q
      })
    },

    // 点击节点操作列表
    nodeClickEvent(id) {
      this.showEditDialog = false
      switch (id) {
        case 1:
          console.log(id, '增加节点')
          this.showAddNodeDialog = true
          break
        case 2:
          console.log(id, '删除节点')
          this.deleteNode()
          break
        case 3:
          console.log(id, '节点属性')
          this.showInfoNodeDialog = true
          break
        case 4:
          console.log(id, '增加分支')
          this.addBranch()
          break
      }
    },

    // 空节点之间不可增加分支
    branchNodeDisabled() {
      const nextNodeArr = this.list.edges.filter(q => {
        return q.sourceRef == this.curNodeObj[0].id
      })
      const beforeNodeArr = this.list.edges.filter(q => {
        return q.targetRef == this.curNodeObj[0].id
      })
      const nextNodeInfo = this.list.nodeInfos.filter(q => {
        return q.id == (nextNodeArr && nextNodeArr[0].targetRef)
      })
      const beforNodeInfo = this.list.nodeInfos.filter(q => {
        return q.id == (beforeNodeArr && beforeNodeArr[0].sourceRef)
      })
      const beforeEmptyNode =
        beforNodeInfo[0] && beforNodeInfo[0].id.includes('empty01')
      const nextEmptyNode =
        nextNodeInfo[0] && nextNodeInfo[0].id.includes('empty01')

      const nextEndNode = nextNodeInfo[0] && nextNodeInfo[0].id === 'endEvent_2'
      if ((beforeEmptyNode && nextEmptyNode) || nextEndNode) {
        this.$message.error('该节点不支持增加分支')
        return true
      } else {
        return false
      }
    },

    // 增加分支
    async addBranch() {
      this.isAddBranchState = true
      let e = this.curNodeObj[0].id
      if (this.branchNodeDisabled()) return

      this.branchStartNode = this.curNodeObj[0]
      let isAfter = false
      this.list.nodeInfos.map(q => {
        if (q.id === e) {
          isAfter = true
        }
        if (q.id.split('empty01').length - 1 === 1) {
          isAfter = false
        } else if (q.id.includes('_empty01empty01')) {
          isAfter = true
        }
        if (!isAfter) {
          q.branchDisabled = true
          console.log(q.name)
        } else {
          if (q.id === 'endEvent_2') {
            q.branchDisabled = true
          } else {
            q.branchDisabled = false
          }
        }

        console.log(q.name + q.branchDisabled, 'isAfter---')
      })
      this.initFlow()
    },

    // 确认是否增加分支
    addBranchSubmit() {
      this.$confirm(
        `确定要在[${this.curNodeObj[0].name} - ${this.branchEndNode.name}]并行添加分支吗`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          // 添加并行分支
          this.addNodeType = 'branch'
          this.showAddNodeDialog = true
        })
        .catch(() => {
          this.isAddBranchState = false
          this.list.nodeInfos.forEach(q => {
            q.branchDisabled = ''
          })
          localStorage.setItem('list', JSON.stringify(this.list))
          this.initFlow()
        })
    },

    // 去掉添加分支增加的临时属性
    initBranchDisabledFun(type) {
      this.list.nodeInfos.forEach(q => {
        q.branchDisabled = ''
      })
      this.list.edges = this.list.edges.map(q => {
        q.id = `flow_${q.sourceRef.substring(
          q.sourceRef.lastIndexOf('_') + 1
        )}_${q.targetRef.substring(q.targetRef.lastIndexOf('_') + 1)}`
        return q
      })
      localStorage.setItem('list', JSON.stringify(this.list))
      if (type === 0) {
        this.initFlow()
      } else {
        this.initFlow(1)
      }
    },

    // 点击连接线操作列表
    edgesClickEvent(id) {
      this.showEditLineDialog = false
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
        case 4:
          console.log(id, '分支描述')
          break
        case 5:
          console.log(id, '删除条件')
          this.deleteCondtion()
          break
      }
    },

    // 删除节点
    deleteNode() {
      this.$confirm(
        `此操作将永久删除『${this.curNodeObj[0].name}』, 是否继续?`,
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
        this.showEditDialog = false
        this.list.nodeInfos = this.list.nodeInfos.filter(q => {
          return q.id != this.curNodeObj[0].id
        })
        const targetRefNode = this.list.edges.filter(q => {
          return q.targetRef == this.curNodeObj[0].id
        })
        const sourceRefNode = this.list.edges.filter(q => {
          return q.sourceRef == this.curNodeObj[0].id
        })
        this.list.edges = this.list.edges.filter(q => {
          return (
            q.targetRef != this.curNodeObj[0].id &&
            q.sourceRef != this.curNodeObj[0].id
          )
        })

        const tnSource = targetRefNode[0] && targetRefNode[0].sourceRef
        const snTarget = sourceRefNode[0] && sourceRefNode[0].targetRef
        const repeatNode = this.list.edges.filter(q => {
          return q.sourceRef == tnSource || q.targetRef == snTarget
        })
        if (repeatNode && repeatNode.length < 2) {
          this.list.edges = this.list.edges.concat({
            sourceRef: tnSource,
            targetRef: snTarget
          })
        } else {
          // 并行多节点上添加的串行对其删除做兼容处理
          const commonSourceArr =
            repeatNode &&
            repeatNode.filter(q => {
              return q.sourceRef == repeatNode[0].sourceRef
            })
          const commonTargetArr =
            repeatNode &&
            repeatNode.filter(q => {
              return q.targetRef == repeatNode[0].targetRef
            })
          const commonSourceArrLength =
            commonSourceArr && commonSourceArr.length
          const commonTargetArrLength =
            commonTargetArr && commonTargetArr.length
          const repeatNodeLength = repeatNode && repeatNode.length
          if (
            commonSourceArrLength === repeatNodeLength ||
            commonTargetArrLength === repeatNodeLength
          ) {
            this.list.edges = this.list.edges.concat({
              sourceRef: tnSource,
              targetRef: snTarget
            })
          }
        }
        this.filterEmptyNode()
        localStorage.setItem('list', JSON.stringify(this.list))
        this.initFlow()
      })
    },

    // 导出缩略图
    svgToPng() {
      const node = document.querySelector('svg')
      this.covertSVG2Image(
        node,
        '缩略图',
        window.innerWidth,
        window.document.querySelector('.svg-box').clientHeight
      )
    },

    // svg转png封装
    covertSVG2Image(node, name, width, height, type = 'png') {
      let serializer = new XMLSerializer()
      let sourceRef =
        '<?xml version="1.1" standalone="no"?>\r\n' +
        serializer.serializeToString(node)
      let image = new Image()
      image.src =
        'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sourceRef)
      let canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      let context = canvas.getContext('2d')
      context.fillStyle = '#fff'
      context.fillRect(
        0,
        0,
        window.innerWidth,
        window.document.querySelector('.svg-box').clientHeight
      )
      image.onload = function() {
        context.drawImage(image, 0, 0)
        let a = document.createElement('a')
        a.download = `${name}.${type}`
        a.href = canvas.toDataURL(`image/${type}`)
        a.click()
        localStorage.setItem('svgImgValue', canvas.toDataURL(`image/${type}`))
      }
    },

    // 合并连接线空节点之前不可触发事件
    initEdgesEvent() {
      this.list.nodeInfos = this.list.nodeInfos.map(q => {
        if (q.class == 'empty') {
          console.log(q, 'q-empty')
          this.list.edges = this.list.edges.map(j => {
            if (q.id == j.targetRef) {
              j.empty = true
              console.log(j, 'j')
            } else {
              // targetRef包含0则判断为空节点
              if (j.targetRef.indexOf('_empty01empty01') == -1) {
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
            if (q.id == j.targetRef) {
              emptybefore.push(j)
            }
            if (q.id == j.sourceRef) {
              emptyAfter.push(j)
            }
          })
          console.log(emptybefore, 'emptybefore')
          console.log(emptyAfter, 'emptyAfter')

          if (emptybefore && emptybefore.length < 2 && emptyAfter.length < 2) {
            this.list.edges = this.list.edges.filter(k => {
              return q.id != k.targetRef && q.id != k.sourceRef
            })
            this.list.edges = this.list.edges.concat({
              sourceRef: emptybefore[0] && emptybefore[0].sourceRef,
              targetRef: emptyAfter[0] && emptyAfter[0].targetRef
            })
            q = ''
          } else {
            // 处理并行2条以上的场景
          }
        }
        return q
      })
      this.list.nodeInfos = this.list.nodeInfos.filter(q => {
        return q != ''
      })
    },

    // 获取鼠标位置触发事件
    initEventMenu() {
      var edgeMenu = document.getElementById('edgeMenuDialog') //右键菜单
      var nodeMenu = document.getElementById('nodeMenuDialog') //右键菜单
      document.addEventListener('click', function(e) {
        console.log(e.clientX)
        console.log(e.clientY)
        this.clientPosition = {
          left: e.clientX,
          top: e.clientY
        }
        edgeMenu.style.top = e.clientY + 10 + 'px' //获取鼠标位置
        edgeMenu.style.left = e.clientX + 10 + 'px'
        nodeMenu.style.top = e.clientY + 10 + 'px' //获取鼠标位置
        nodeMenu.style.left = e.clientX + 10 + 'px'
        console.log(this.clientPosition)
      })
    },

    // 初始化流程图
    initFlow(num) {
      this.initDisabled()
      this.initEdgesEvent()
      this.setNodeFun()
      this.setEdgeFun()
      this.renderFun()
      this.selectEvent()
      this.scale()
      this.isAddBranchState = false
      if (num === 1) {
        this.$message.success('添加节点成功')
        this.isStrand = 1
      }
    },

    // 生成随机数
    randNum() {
      let rand = ''
      for (let i = 0; i < 19; i++) {
        rand += Math.floor(Math.random() * 10)
      }
      return rand
    },

    // 保存参数处理
    sumbitBefore() {
      this.list.nodeInfos = this.list.nodeInfos.map(q => {
        const incomingArr = this.list.edges
          .filter(j => {
            return j.targetRef === q.id
          })
          .map(n => {
            return n.id
          })
        const outgoingArr = this.list.edges
          .filter(j => {
            return j.sourceRef === q.id
          })
          .map(n => {
            return n.id
          })
        if (incomingArr && incomingArr.length > 0) {
          q.incoming = incomingArr
        }
        if (outgoingArr && outgoingArr.length > 0) {
          q.outgoing = outgoingArr
        }
        return q
      })

      // 开始节点&结束节点格式处理
      this.list.nodeInfos = this.list.nodeInfos.map(q => {
        if (q.id === 'startEvent_1' || q.id === 'endEvent_2') {
          q.incoming = (q.incoming && q.incoming.toString()) || ''
          q.outgoing = (q.outgoing && q.outgoing.toString()) || ''
        } else {
          q.extensionElements = null
          q.taskListeners = null
          q.assigneeUser = {
            assignee: '${assignee_userTask_68_4}',
            candidateUsers: null,
            candidateGroups: null
          }
        }
        return q
      })
    },

    // 保存
    saveSubmit() {
      console.log(this.list, '提交成功')
      this.sumbitBefore()
      const postData = {
        id: '',
        name: '模板一',
        documentation: '流程基本描述',
        startEvent: this.list.nodeInfos[0],
        endEvent: this.list.nodeInfos[this.list.nodeInfos.length - 1],
        userTasks: this.list.nodeInfos.slice(1, this.list.nodeInfos.length - 1),
        sequenceFlows: this.list.edges
      }
      console.dir(postData)
      localStorage.setItem('提交参数', JSON.stringify(postData))
      const svgImgValueItem = localStorage.getItem('svgImgValue')
      // console.log(svgImgValueItem, 'base64')
    }
  },

  created() {
    // this.list = JSON.parse(localStorage.getItem('list')) || this.list
    this.list.nodeInfos = mockList.userTasks
    this.list.nodeInfos.unshift(mockList.startEvent)
    this.list.nodeInfos.push(mockList.endEvent)
    this.list.edges = mockList.sequenceFlows
  },

  mounted() {
    this.initFlow()
    this.initEventMenu()
  }
}
</script>

<style lang="less" scoped>
ul {
  padding: 0;
  margin: 0;
  list-style: none;
}
.flow-chart {
  width: 100%;
  height: 100%;
}
.flowchart {
  // height: calc(100% - 80px);
  min-height: 100%;
  background: url('~@/assets/img/background.png') repeat 0 0;
  background-size: 16px 16px;
  .svg-box {
    width: 100%;
    // background-color: #f5f5f5;
    border-top: dashed 1px rgb(223, 223, 224);
    border-bottom: dashed 1px rgb(223, 223, 224);
    box-sizing: border-box;
    margin-top: 80px;
  }
}
svg {
  font-size: 14px;
}
.node text {
  color: #fff;
}
.node rect {
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

.line-condition-title {
  color: #4b90de;
}
.output {
  position: relative;
}
// .edgeLabel .label {
//   transform: translate(-14, -69.5) !important;
// }
// .node-label {
//   color: #fff;
//   font-size: 12px;
//   i {
//     font-size: 20px;
//     margin-top: 2px;
//   }
// }
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
}

::v-deep .edit-list-dialog {
  .el-dialog__body {
    padding: 0 20px 20px 20px !important;
  }
}
.edit-list {
  li {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
  }
  li :hover {
    color: #4b90de;
  }
}

::v-deep .line-box:hover {
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
::v-deep .edge-line path:hover {
  stroke: #f5a623 !important;
}

::v-deep .edge-line path:focus {
  stroke: red !important;
}
.line-box {
  max-width: 180px;
  position: relative;
}
.line-tips {
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
::v-deep .node-style {
  cursor: pointer;
  fill: #4b90de;
  foreignObject {
    text-align: center;
  }
}
::v-deep .node-style-disabled {
  fill: #dcdcdc;
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
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  flex-flow: row-reverse;
  padding: 20px;
  // background-color: #fff;
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
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
}
.edit-list-position {
  position: fixed;
  top: 0;
  left: 0;
  border: solid 1px #dcdcdc;
  border-radius: 6px;
  background: #fff;
  padding: 4px 16px;
}
.edge-edit-list {
  width: 80px;
}
.node-edit-list {
  width: 160px;
}
.revoke-btn {
  margin-left: 14px;
}
</style>
