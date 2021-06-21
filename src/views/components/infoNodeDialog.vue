<template>
  <!-- 节点属性配置 -->
  <el-dialog
    title="设置节点属性"
    :visible.sync="dialogVisible"
    @close="cancelInfoNode"
    width="700px"
  >
    <el-form
      :model="ruleForm"
      ref="ruleForm"
      label-width="110px"
      class="demo-ruleForm"
    >
      <div class="title-area">属性设置</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="自定义节点名称">
            <el-input v-model="ruleForm.name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="节点名称">
            <el-input v-model="curNodeInfo.name" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="设置节点权限">
            <!-- <el-input v-model="ruleForm.id"></el-input> -->
            <el-select v-model="ruleForm.typeLabel" placeholder="请选择">
              <el-option
                v-for="item in powerOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 节点期限 -->
      <div class="title-area">节点期限</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="处理期限">
            <el-select v-model="ruleForm.time" placeholder="请选择">
              <el-option
                v-for="item in timeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理期限到">
            <el-select v-model="ruleForm.endType" placeholder="请选择">
              <el-option
                v-for="item in endTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 节点期限 -->
      <div class="title-area">执行模式</div>
      <el-radio-group v-model="implementType">
        <el-radio :label="1">单人执行</el-radio>
        <el-radio :label="2">多人执行</el-radio>
        <el-radio :label="3">全体执行</el-radio>
        <el-radio :label="4">竞争执行</el-radio>
      </el-radio-group>
      <div class="allow-checked-user">
        <el-checkbox v-model="allowCheckedUser">允许选择组织中人员</el-checkbox>
      </div>

      <!-- 合并处理设置 -->
      <div class="title-area">合并处理设置</div>
      <el-form-item label="合并处理策略：">
        <el-radio-group v-model="mergePolicy">
          <el-radio :label="1">以流程设置为准</el-radio>
          <el-radio :label="2">以节点设置为准</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 处理说明 -->
      <el-form-item label="处理说明：">
        <el-input
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
          placeholder="请输入"
          v-model="ruleForm.explain"
        >
        </el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancelInfoNode">取 消</el-button>
      <el-button type="primary" @click="submit()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import dagreD3 from 'dagre-d3'
import * as d3 from 'd3'

export default {
  name: 'infoNodeDialog',
  data() {
    return {
      dialogVisible: true,
      ruleForm: JSON.parse(JSON.stringify(this.curNodeInfo)),
      powerOptions: [
        {
          value: '审批',
          label: '审批'
        },
        {
          value: '审核',
          label: '审核'
        },
        {
          value: '复核',
          label: '复核'
        }
      ],
      timeOptions: [
        {
          value: '1',
          label: '1小时'
        },
        {
          value: '2',
          label: '2小时'
        },
        {
          value: '3',
          label: '3小时'
        }
      ],
      endTypeOptions: [
        {
          value: '1',
          label: '仅消息提醒'
        },
        {
          value: '2',
          label: '转给指定人'
        },
        {
          value: '3',
          label: '自动跳过'
        }
      ],
      implementType: 1,
      allowCheckedUser: false,
      mergePolicy: 1
    }
  },
  props: ['curNodeInfo'],
  watch: {},
  methods: {
    cancelInfoNode() {
      this.$emit('cancelInfoNode')
      this.dialogVisible = false
    },
    submit() {
      console.log(this.ruleForm, 'this.ruleForm')
      this.$emit('sumbitNodeInfo', this.ruleForm)
      this.dialogVisible = false
    }
  },
  created() {},
  mounted() {}
}
</script>

<style lang="less" scoped>
::v-deep .el-dialog__body {
  padding: 0 20px 20px 20px;
}
.title-area {
  font-size: 14px;
  padding: 10px 0px;
  color: #66b1ff;
  border-bottom: solid 1px #f5f5f5;
  margin-bottom: 14px;
}
.allow-checked-user {
  margin-top: 12px;
  margin-bottom: 10px;
}
</style>
