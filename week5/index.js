import userProductModal from "./components/userProductModal.js";
confirmModal;

import confirmModal from "./components/confirmModal.js";

// 引入套件
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

// 定義規則
// 必填
defineRule("required", required);

// 文字長短
defineRule("min", min);
defineRule("max", max);

// email 格式
defineRule("email", email);

// 語系
loadLocaleFromURL(
  "https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json"
);

configure({
  generateMessage: localize("zh_TW"),
});

const apiUrl = "https://vue3-course-api.hexschool.io/v2";
const apiPath = "i-fitness";

const app = Vue.createApp({
  components: {
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  data() {
    return {
      products: [],
      cartDetail: {},
      tempProduct: {},
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
      confirmStatus: "",
      isLoading: false,
    };
  },
  methods: {
    getProducts() {
      this.isLoading = true;

      const url = `${apiUrl}/api/${apiPath}/products`;
      axios
        .get(url)
        .then((res) => {
          this.products = res.data.products;
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    getCart() {
      this.isLoading = true;

      const url = `${apiUrl}/api/${apiPath}/cart`;
      axios
        .get(url)
        .then((res) => {
          this.cartDetail = res.data.data;
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    showProductDetail(product) {
      this.tempProduct = { ...product };
      this.$refs.userProductModal.openModal();
    },
    addToCart(id, qty = 1) {
      this.isLoading = true;

      const url = `${apiUrl}/api/${apiPath}/cart`;
      const cart = {
        product_id: id,
        qty,
      };
      axios
        .post(url, { data: cart })
        .then((res) => {
          alert(res.data.message);
          this.getCart();

          this.$refs.userProductModal.hideModal();
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    updateCartItemNum(cartItem) {
      this.isLoading = true;

      const { id, qty } = cartItem;
      if (qty < 1) {
        alert("商品數量至少要有一個");
        this.getCart();
        return;
      }

      const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
      axios
        .put(url, {
          data: {
            product_id: id,
            qty,
          },
        })
        .then(() => {
          this.getCart();
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    removeCartItem(id) {
      this.isLoading = true;

      const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
      axios
        .delete(url)
        .then((res) => {
          alert(res.data.message);
          this.getCart();
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    clearCarts() {
      this.isLoading = true;

      const url = `${apiUrl}/api/${apiPath}/carts`;
      axios
        .delete(url)
        .then((res) => {
          alert(res.data.message);
          this.getCart();
          this.$refs.confirmModal.hideModal();
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    createOrder() {
      this.isLoading = true;

      const url = `${apiUrl}/api/${apiPath}/order`;
      axios
        .post(url, { data: this.form })
        .then((res) => {
          alert(res.data.message);
          this.$refs.form.resetForm();
          this.getCart();
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    openConfirmModal(status) {
      this.confirmStatus = status;
      this.$refs.confirmModal.openModal();
    },
  },
  mounted() {
    this.getProducts();
    this.getCart();
  },
});

app.use(VueLoading.LoadingPlugin);

app.component("loading", VueLoading.Component);
app.component("userProductModal", userProductModal);
app.component("confirmModal", confirmModal);

app.mount("#app");
