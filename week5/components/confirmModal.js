export default {
  template: /*html*/ `
  <div class="modal fade" ref="modal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="confirmModalLabel">提示</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      <p> {{ text }}</p>
  
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
        <button @click="confirm(status)" type="button" class="btn btn-primary">確定</button>
      </div>
    </div>
  </div>
</div>
  `,
  props: {
    status: String,
    default() {
      return {};
    },
  },
  data() {
    return {
      modal: "",
    };
  },
  computed: {
    text() {
      if (this.status === "clearCarts") return "確定要清空購物車嗎？";
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal, {
      keyboard: false,
    });
  },
  methods: {
    confirm(status) {
      if (status === "clearCarts") {
        this.$emit("clear-carts");
      }
    },
    openModal() {
      this.modal.show();
    },
    hideModal() {
      this.modal.hide();
    },
  },
};
