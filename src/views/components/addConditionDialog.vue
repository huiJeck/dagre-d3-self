<template>
  <!-- 添加条件 -->
  <el-dialog
    title="添加条件"
    :visible.sync="dialogVisible"
    @close="cancelAddNode"
    width="30%"
  >
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item label="分支条件" prop="conditionExpression">
        <el-input
          v-model="ruleForm.conditionExpression"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item label="分支描述" prop="describe">
        <el-input v-model="ruleForm.describe" placeholder="请输入"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancelAddNode">取 消</el-button>
      <el-button type="primary" @click="submit('ruleForm')">确 定</el-button>
    </span>
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
      ruleForm: {},
      rules: {
        conditionExpression: [
          { required: true, message: '输入不能为空', trigger: 'blur' }
        ],
        describe: [{ required: true, message: '输入不能为空', trigger: 'blur' }]
      }
    }
  },
  watch: {
    isStrand(val) {
      this.$emit('upIsStrand', val)
    }
  },
  methods: {
    submit() {
      console.log(this.ruleForm, 'this.ruleForm')
      this.$emit('sumbitAddNode', this.ruleForm)
      this.dialogVisible = false
    },
    cancelAddNode() {
      this.$emit('cancelAddNode')
      this.dialogVisible = false
    }
  },
  created() {},
  mounted() {}
}
</script>

<style lang="less" scoped></style>
