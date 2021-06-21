<template>
  <!-- 添加节点 -->
  <el-dialog
    title="添加节点"
    :visible.sync="dialogVisible"
    @close="cancelAddNode"
    width="624px"
  >
    <!-- <div class="selected-area">
      <el-transfer
        filter-placeholder="请输入关键词搜索"
        v-model="selectedValue"
        :data="dataList"
        :props="{ key: 'id', label: 'label' }"
        :titles="['请选择', '已选择']"
      >
      </el-transfer>
    </div> -->

    <div class="selected-area">
      <div class="selected-area-left">
        <el-radio-group v-model="userType" class="selected-condtion">
          <el-radio :label="1">人员</el-radio>
          <el-radio :label="2">岗位</el-radio>
          <el-radio :label="3">角色</el-radio>
        </el-radio-group>
        <ul class="selected-left-list">
          <li
            v-for="item in dataList"
            :key="item.id"
            :class="clickObj.id == item.id ? 'isActive' : ''"
            @click="itemClick(item)"
            @dblclick="itemDblclick(item)"
          >
            {{ item.label }}
          </li>
        </ul>
      </div>
      <div class="mid-btns">
        <el-button icon="el-icon-arrow-right" @click="selectedFun"></el-button>
        <el-button
          class="btn-right"
          icon="el-icon-arrow-left"
          @click="removeFun"
        ></el-button>
      </div>

      <div class="selected-area-right">
        <div class="title">
          已选择：
        </div>
        <ul class="selected-right-list">
          <li
            v-for="item in selectedValue"
            :key="item.id"
            :class="selectedObj.id == item.id ? 'isActive' : ''"
            @click="itemSelected(item)"
            @dblclick="removeDblclick(item)"
          >
            {{ item.label }}
          </li>
        </ul>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-radio-group
        v-if="addNodeType == 'branch'"
        v-model="isStrand"
        class="selected-condtion"
      >
        <el-radio :label="5">分支会签</el-radio>
      </el-radio-group>
      <el-radio-group v-else v-model="isStrand" class="selected-condtion">
        <el-radio :label="1">串行</el-radio>
        <el-radio :label="2">并行</el-radio>
        <el-radio :label="3" v-if="addNodeType == 'node'">会签</el-radio>
        <el-radio :label="4">下节点并行</el-radio>
      </el-radio-group>
      <div>
        <el-button @click="cancelAddNode">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </span>
  </el-dialog>
</template>

<script>
import { userArr, stationArr, roleArr } from './user'

export default {
  name: 'addNodeDialog',
  props: ['addNodeType', 'nodeInfos'],
  data() {
    return {
      dialogVisible: true,
      isStrand: 1, // 1为串行  2位并行 3为会签
      dataList: userArr,
      selectedValue: [],
      selectedObjArr: [],
      userType: 1,
      clickObj: {},
      selectedObj: {}
    }
  },
  watch: {
    isStrand(val) {
      this.$emit('upIsStrand', val)
    },
    userType(val) {
      switch (val) {
        case 1:
          this.dataList = userArr
          break
        case 2:
          this.dataList = stationArr
          break
        case 3:
          this.dataList = roleArr
          break
      }
    }
  },
  methods: {
    removeDblclick(item) {
      this.selectedValue = this.selectedValue.filter(q => {
        return q.id != item.id
      })
    },
    itemDblclick(item) {
      if (this.selectedValue.includes(this.clickObj)) {
        return
      }
      // if (this.nodeInfos.includes(item)) {
      //   this.$message.error('节点不能与流程中的重复')
      //   return
      // }
      this.selectedValue.push(item)
    },
    removeFun() {
      this.selectedValue = this.selectedValue.filter(q => {
        return q.id != this.selectedObj.id
      })
    },
    selectedFun() {
      if (this.selectedValue.includes(this.clickObj) || !this.clickObj.id) {
        return
      }
      if (this.nodeInfos.includes(this.clickObj)) {
        this.$message.error('节点不能与流程中的重复')
        return
      }
      alert()
      this.selectedValue.push(this.clickObj)
    },
    itemSelected(item) {
      this.selectedObj = item
    },
    itemClick(item) {
      this.clickObj = item
    },
    submit() {
      console.log(this.dataList, 'this.dataList')
      this.selectedObjArr = this.dataList.filter(q => {
        return this.selectedValue.includes(q.id)
      })
      this.$emit('sumbitAddNode', this.selectedValue)
      this.dialogVisible = false
    },
    cancelAddNode() {
      this.$emit('cancelAddNode')
      this.dialogVisible = false
    },
    transferfun(h, option) {
      console.log(h)
      console.log(option, 'option')
    }
  },
  created() {
    console.log(this.addNodeType, 'this.addNodeType')
    if (this.addNodeType == 'branch') {
      this.isStrand = 5
    }
  },
  mounted() {}
}
</script>

<style lang="less" scoped>
.selected-area {
  width: 100%;
}
.dialog-footer {
  display: flex;
  justify-content: space-between;
  .selected-condtion {
    margin-top: 14px;
  }
}
::v-deep .el-dialog__body {
  padding: 10px 14px 14px 14px;
}
.selected-area {
  display: flex;
  // padding: 14px;
  .selected-area-left {
    width: 44%;
    .selected-condtion {
      padding: 10px;
    }
    .selected-left-list {
      border: solid 1px #dcdcdc;
      list-style: none;
      padding: 0;
      margin: 0;
      height: 256px;
      overflow: auto;
      li {
        padding: 3px 12px;
        cursor: pointer;
      }
      li:hover {
        color: #409eff;
      }
    }
  }
  .mid-btns {
    width: 12%;
    text-align: center;
    margin-top: 120px;
    .btn-right {
      margin-left: 0;
      margin-top: 8px;
    }
  }
  .selected-area-right {
    width: 44%;
    li {
      padding: 3px 12px;
      cursor: pointer;
    }
    .title {
      padding: 8px;
    }
    .selected-right-list {
      border: solid 1px #dcdcdc;
      list-style: none;
      padding: 0;
      margin: 0;
      border-top: solid 1px #dcdcdc;
      height: 257px;
      overflow: auto;
    }
  }
}
.isActive {
  background-color: #dcdcdc;
}
</style>
