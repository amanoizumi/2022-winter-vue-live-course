import 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

/*
- lv 2
- 商品列表：可打開 Modal 進行 新增 / 編輯 / 刪除。
- 商品啟用、關閉可以使用不同的顏色標示

- 使用 Vue 指令（v-for, v-if, $refs, 註冊 Vue/data/mounted/methods）
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
          console.log(this.products);
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
            alert('成功編輯啟用狀態！');
            // 如果回傳 200，就自行改變資料。不重新用 getProducts 發請求
            this.products.forEach((product, idx) => {
              if (product.id === productSend.id) {
                this.products[idx].is_enabled = !this.products[idx].is_enabled * 1;
              }
            });
          }
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

    // trailing: false
    // 觸發後，冷卻時間過後也不會再調用
    this.editEnabled = _.throttle(this.editEnabled, 2000, { trailing: false });
  },
});

app.mount('#app');
