// import store from '@/store'
import { get,debounce } from 'lodash-es'

export default {
  data() {
    return {
      tableMaxH: 200
    }
  },
  mounted() {
    const myDiv = this.$refs.tableParentBox;
    this.handleResize = debounce(this.handleResize, 150); // 创建防抖函数
    window.addEventListener('resize', this.handleResize);
    this.observeWidth(myDiv);

    this.handleResize();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    observeWidth(el) {
      const resizeObserver = new ResizeObserver(this.handleResize);
      resizeObserver.observe(el);
    },
    initTableMaxH(){
      this.$nextTick(() => {
        let tableMaxH = get(this.$refs, 'tableParentBox.clientHeight', 260)
        this.tableMaxH = tableMaxH - 38
      })
    },
    handleResize() {
      this.initTableMaxH()
    }
  }
}
