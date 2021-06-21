<template>
  <div class="page">
    <div class="flowchart-area">
      <div class="tree-area">
        <div class="menu-list">
          <i class="el-icon-plus pointer" @click="addFlowchart"></i>
          <i class="el-icon-edit pointer" @click="renameFlowchart"></i>
          <i class="el-icon-delete pointer" @click="deleteFlowchart"></i>
        </div>
        <el-tree
          ref="tree"
          node-key="id"
          highlight-current
          class="user-tree"
          :data="groupLists"
          @node-click="getTreeNode"
        >
          <div slot-scope="{ data }" class="custom-tree-node flex-row">
            <div>
              <span class="line-limit">{{ data.label }}</span>
            </div>
          </div>
        </el-tree>
      </div>
      <div class="flowchart-area">
        <flowchartSvg />
      </div>
    </div>
    <!-- 添加模板 -->
    <el-dialog
      :title="dialogText"
      :visible.sync="addDialogVisible"
      width="500px"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="80px"
        class="demo-ruleForm"
      >
        <el-form-item label="模板名称" prop="templateName">
          <el-input
            v-model="ruleForm.templateName"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addTemplateSubmit()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import flowchartSvg from '@/views/components/flowchartSvg.vue'

export default {
  name: 'flowchart',
  components: {
    flowchartSvg
  },
  data() {
    return {
      curNode: {},
      defaultkey: [1],
      groupLists: [
        {
          id: 1,
          label: '测试模板'
        },
        {
          id: 2,
          label: '测试模板2'
        }
      ],
      rules: {
        templateName: [
          { required: true, message: '输入不能为空', trigger: 'blur' }
        ]
      },
      addDialogVisible: false,
      ruleForm: {},
      dialogText: '添加模板'
    }
  },
  methods: {
    getTreeNode(val) {
      console.log(val)
      this.curNode = val
    },
    addFlowchart() {
      this.dialogText = '添加模板'
      this.addDialogVisible = true
    },
    renameFlowchart() {
      this.dialogText = '重命名'
      this.addDialogVisible = true
    },
    deleteFlowchart() {
      this.$confirm('此操作将永久删除该模板, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(this.curNode, '当前节点')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
    },
    addTemplateSubmit() {
      this.addDialogVisible = false
      if (this.dialogText === '添加模板') {
        console.log(this.ruleForm, '模板名称')
      } else {
        console.log(this.ruleForm, '重命名')
      }
    }
  },
  mounted() {
    this.$refs['tree'].setCurrentKey(1)
    this.curNode = this.groupLists[0]
  }
}
</script>

<style lang="less" scoped>
.pointer {
  cursor: pointer;
}
.page {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.flowchart-area {
  display: flex;
}
.tree-area {
  width: 200px;
  border-right: solid 1px #dcdcdc;

  .menu-list {
    margin: 10px;
    border-bottom: solid 1px #dcdcdc;
    i {
      padding: 8px;
    }
  }
}
.flowchart-area {
  width: calc(100%);
  height: 100%;
}
::v-deep .el-tree-node__content {
  font-size: 14px;
  height: 30px;
  line-height: 30px;
  padding-left: 2px;
}
::v-deep .el-tree-node__content > .el-tree-node__expand-icon {
  padding: 0;
}
::v-deep .el-dialog__body {
  padding-bottom: 0px;
}
</style>
