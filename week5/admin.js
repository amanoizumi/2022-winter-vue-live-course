import "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

let productModal = null;
let delProductModal = null;

/*
- lv 2
- 商品列表：可打開 Modal 進行 新增 / 編輯 / 刪除。
- 商品啟用、關閉可以使用不同的顏色標示

- 使用 Vue 指令（v-for, v-if, $refs, 註冊 Vue/data/mounted/methods）
*/

const app = createApp({
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2",
      apiPath: "i-fitness",
      isEdit: false,
      products: [],
      tempProduct: {},
      pagination: {},
    };
  },
  methods: {
    checkLogin() {
      const url = `${this.apiUrl}/api/user/check`;
      axios
        .post(url)
        .then(() => {
          // 成功登入就取得產品資料
          this.getProducts();
        })
        .catch((err) => {
          alert(err.response.data.message);
          // 出錯則跳回首頁
          window.location = "login.html";
        });
    },

    // 預設取第一頁的產品資料
    getProducts(page = 1) {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products?page=${page}`;
      axios
        .get(url)
        .then((res) => {
          const { products, pagination } = res.data;
          this.products = products;
          this.pagination = pagination;
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },

    editEnabled(product) {
      const productSend = { ...product };
      productSend.is_enabled = !productSend.is_enabled * 1;

      const putData = {
        data: {
          ...productSend,
        },
      };
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${productSend.id}`;

      axios
        .put(url, putData)
        .then((res) => {
          if (res.status === 200) {
            alert("成功編輯啟用狀態！");
            // 如果回傳 200，就自行改變資料。不重新用 getProducts 發請求
            this.products.forEach((product, idx) => {
              if (product.id === productSend.id) {
                this.products[idx].is_enabled =
                  !this.products[idx].is_enabled * 1;
              }
            });
          }
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },

    openModal(doSomething, product) {
      if (doSomething === "add") {
        this.isEdit = false;
        this.tempProduct = {};
        productModal.show();
      } else if (doSomething === "edit") {
        this.isEdit = true;
        this.tempProduct = { ...product };
        productModal.show();
      }
    },

    openDeleteProductModal(product) {
      this.tempProduct = product;
      delProductModal.show();
    },

    confirmDeleteProduct() {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.deleteProduct.id}`;

      axios
        .delete(url)
        .then((res) => {
          this.getProducts();
          alert("成功刪除商品！");
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          this.deleteProduct.title = "";
          this.deleteProduct.id = "";
        });
    },
  },

  mounted() {
    // 取出 cookies 裡的 token
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    // 設定 Authorization
    axios.defaults.headers.common.Authorization = token;

    this.checkLogin();

    // throttle 避免連續發送請求
    // trailing: false
    // 觸發後，冷卻時間過後也不會再調用
    this.editEnabled = _.throttle(this.editEnabled, 2000, { trailing: false });
  },
});

// 分頁元件
app.component("pagination", {
  props: ["pages"],
  methods: {
    emitPages(item) {
      this.$emit("emit-pages", item);
    },
  },
  template: "#pagination",
});
// 刪除產品視窗元件
app.component("delProductModal", {
  props: {
    product: Object,
  },
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2",
      apiPath: "i-fitness",
    };
  },
  methods: {
    confirmDeleteProduct() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.product.id}`;
      axios
        .delete(url)
        .then((res) => {
          this.$emit("update-products");
          alert("已成功刪除商品！");
          this.hideModal();
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    openModal() {
      delProductModal.show();
    },
    hideModal() {
      delProductModal.hide();
    },
  },
  mounted() {
    delProductModal = new bootstrap.Modal(
      document.getElementById("delProductModal"),
      {
        keyboard: false,
        backdrop: "static",
      }
    );
  },
  template: "#delProductModal",
});

// 新增/編輯產品視窗元件
app.component("productModal", {
  props: {
    isEdit: Boolean,
    product: Object,
  },
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2",
      apiPath: "i-fitness",
      uploadedImageUrl: "",
      addImagesBtnIsDisabled: false,
    };
  },
  mounted() {
    productModal = new bootstrap.Modal(
      document.getElementById("productModal"),
      {
        keyboard: false,
        backdrop: "static",
      }
    );
  },
  methods: {
    // 上傳圖片
    upload() {
      const file = this.$refs.uploadImage.files[0];

      const formData = new FormData();
      formData.append("file-to-upload", file);

      const url = `${this.apiUrl}/api/${this.apiPath}/admin/upload`;

      axios
        .post(url, formData)
        .then((res) => {
          this.uploadedImageUrl = res.data.imageUrl;
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    openModal() {
      productModal.show();
    },
    hideModal() {
      productModal.hide();
    },

    // 新增、替換主要圖片
    addMainImage() {
      if (this.uploadedImageUrl === "") {
        alert("請輸入欲加入「主要圖片」的連結！");
        return;
      }
      this.product.imageUrl = this.uploadedImageUrl;
      this.uploadedImageUrl = "";
    },

    // 新增到其他圖片
    addImages() {
      if (this.uploadedImageUrl === "") {
        alert("請輸入欲加入「其他圖片」的連結！");
        return;
      }

      if (!this.product.hasOwnProperty("imagesUrl")) {
        this.product.imagesUrl = [];
      }

      this.product.imagesUrl.push(this.uploadedImageUrl);
      this.uploadedImageUrl = "";
    },

    // 刪除圖片
    deleteImage(idx) {
      this.product.imagesUrl.splice(idx, 1);
    },
    // 確認新增 or 確認編輯
    confirmAddOrEdit() {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
      let handlerStr = "post";

      if (this.isEdit) {
        handlerStr = "put";
        url = `${url}/${this.product.id}`;
      }
      axios[handlerStr](url, { data: this.product })
        .then((res) => {
          this.$emit("update-products");
          alert(`已成功${handlerStr === "put" ? "編輯" : "新增"}產品！`);
          this.hideModal();
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
  },
  template: "#productModal",
});

app.mount("#app");
