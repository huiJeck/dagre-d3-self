<template>
  <div class="page">
    <flowchartSvg />
  </div>
</template>

<script>
import flowchartSvg from '@/views/components/flowchartSvg.vue'

export default {
  name: 'flowchart',
  components: {
    flowchartSvg
  }
}
</script>

<style lang="less" scoped>
.page {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
