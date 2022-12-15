import 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

/*
- 使用者可以看到商品列表
- 使用者可以點擊『查看細節』，在旁邊看到此商品的細節
*/

const app = createApp({
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/v2',
      apiPath: 'i-fitness',
      tempProduct: {},
      products: [],
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
          window.location = 'login.html';
        });
    },
    getProducts() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products`;
      axios
        .get(url)
        .then((res) => {
          this.products = res.data.products;
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    editEnabled(product) {
      const putData = {
        data: {
          ...product,
        },
      };

      putData.data.is_enabled === 0 ? (putData.data.is_enabled = 1) : (putData.data.is_enabled = 0);

      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${product.id}`;
      axios
        .put(url, putData)
        .then(() => {
          this.getProducts();
          console.log(this.products);
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
  },
  mounted() {
    // 參考範例程式碼
    // 取出 cookies 裡的 token
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');

    // 設定 Authorization
    axios.defaults.headers.common.Authorization = token;

    this.checkLogin();
  },
});

app.mount('#app');
