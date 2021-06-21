<template>
  <!-- 添加节点 -->
  <!-- :modal="false"
    top="0%" -->
  <el-dialog
    title="条件配置详情"
    :visible.sync="dialogVisible"
    @close="cancelAddNode"
    width="30%"
  >
    <div>
      <p class="line-condition-title">分支条件</p>
      <p>{{ info.conditionExpression }}</p>
      <p class="line-condition-title">分支描述</p>
      <p>{{ info.describe }}</p>
    </div>
  </el-dialog>
</template>

<script>
import dagreD3 from 'dagre-d3'
import * as d3 from 'd3'

export default {
  name: 'addNodeDialog',
  data() {
    return {
      dialogVisible: true,
      isStrand: 1 // 1为串行  2位并行 3为会签
    }
  },
  props: ['info'],
  watch: {},
  methods: {
    cancelAddNode() {
      this.$emit('cancelDialog')
      this.dialogVisible = false
    }
  },
  created() {},
  mounted() {}
}
</script>

<style lang="less" scoped>
.line-condition-title {
  color: #4b90de;
  margin: 20px auto 10px auto;
}
::v-deep .el-dialog__body {
  padding-top: 0px;
}
</style>
