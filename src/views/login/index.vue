<template>
  <div class="login-page">
    <a-row>
      <a-col :span="12" class="aside">
        <div class="aside-inner">
          <router-link to="/">
            <img src="@/assets/logo2.png" alt="慕课乐高" class="logo-image" />
          </router-link>
          <h2>这是我用过最好的建站工具</h2>
          <span class="text-white-70"> Smiling</span>
        </div>
      </a-col>
      <a-col :span="12" class="login-area">
        <a-form
          layout="vertical"
          :model="form"
          :rules="rules"
          ref="loginFormRef"
        >
          <h2>欢迎回来</h2>
          <p class="subTitle">使用手机号码和验证码登录到慕课乐高</p>
          <a-form-item label="手机号码" required name="cellphone">
            <a-input placeholder="手机号码" v-model:value="form.cellphone"
              ><template #prefix
                ><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template
            ></a-input>
          </a-form-item>
          <a-form-item label="验证码" required name="verifyCode">
            <a-input placeholder="四位验证码" v-model:value="form.verifyCode">
              <template v-slot:prefix
                ><LockOutlined style="color: rgba(0, 0, 0, 0.25)"
              /></template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              size="large"
              @click="login"
              :loading="isLoginLoading"
            >
              登录
            </a-button>
            <a-button
              size="large"
              :style="{ marginLeft: '20px' }"
              :disabled="codeButtonDisable"
              @click="getCode"
            >
              {{ counter === 60 ? "获取验证码" : `${counter}秒后重发` }}
            </a-button>
          </a-form-item>
          <!-- <div class="auth-wrap">
            <a-button @click="handleOAthLogin">gitee 授权登录</a-button>
            <a-button @click="handleTest">测试 OPTION</a-button>
          </div> -->
        </a-form>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  computed,
  onMounted,
  onUnmounted,
  Ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { Rule } from "ant-design-vue/lib/form/interface";
import { GlobalDataProps } from "@/store";
import { message, Form } from "ant-design-vue";
import UsersService from "@/axios/users";
const useForm = Form.useForm;

export interface RuleFormInstance {
  validate: () => Promise<any>;
}

export default defineComponent({
  name: "LoginPage",
  setup() {
    const loginFormRef = ref() as Ref<RuleFormInstance>;
    const router = useRouter();
    const store = useStore<GlobalDataProps>();
    const counter = ref(60);
    const isLoginLoading = computed(() => store.getters.isLoading);
    const form = reactive({
      cellphone: "",
      verifyCode: "",
    });
    let counterTimer;

    const cellnumberValidator = (rule: Rule, value: string) => {
      return new Promise((resolve, reject) => {
        const passed = /^1[3-9]\d{9}$/.test(value.trim());
        setTimeout(() => {
          if (passed) {
            resolve("");
          } else {
            reject("手机号码格式不正确");
          }
        }, 500);
      });
    };
    const rules = reactive({
      cellphone: [
        { required: true, message: "手机号码不能为空", trigger: "blur" },
        { asyncValidator: cellnumberValidator, trigger: "blur" },
      ],
      verifyCode: [
        { required: true, message: "验证码不能为空", trigger: "blur" },
      ],
    });

    const codeButtonDisable = computed(() => {
      return !/^1[3-9]\d{9}$/.test(form.cellphone.trim()) || counter.value < 60;
    });

    /** 验证码倒计时*/
    const startCounter = () => {
      counter.value--;
      clearInterval(counterTimer);
      counterTimer = setInterval(() => {
        counter.value--;
      }, 1000);
    };
    watch(counter, (newValue) => {
      if (newValue <= 0) {
        clearInterval(counterTimer);
        counter.value = 60;
      }
    });
    const getCode = async () => {
      try {
        const result = await UsersService.getVeriCode({
          phoneNumber: form.cellphone,
        });
        console.log("_getCode", result);
        if (result.errno === 0) {
          message.success(
            `验证码已发送, 请注意查收 ${result.data.veriCode}`,
            5
          );
          startCounter();
        }
      } catch (error) {
        console.error("短信验证码获取失败", error);
      }
    };

    const login = async () => {
      // 触发表单验证
      // 1. 使用 useForm 完成表单验证
      // const { validate } = useForm(form, rules);
      // validate()
      //   .then(() => console.log("validate pass"))
      //   .catch(() => console.log("验证不通过"));

      //  2. 使用元素节点的方法验证表单
      loginFormRef.value.validate().then(async () => {
        const payload = {
          phoneNumber: form.cellphone,
          veriCode: form.verifyCode,
        };
        store.dispatch("loginAndFetchUserInfo", payload).then(() => {
          message.success(`登录成功 2秒后跳转首页!`);
          setTimeout(() => {
            router.push("/");
          }, 2000);
        });
      });
    };

    // onMounted(() => {
    //   window.addEventListener("message", (m) => {
    //     const { type, token } = m.data;
    //     if (type === "oauth-token") {
    //       axios
    //         .get("http://127.0.0.1:7001/api/users/getUserInfo", {
    //           headers: {
    //             Authorization: `Bearer ${token}`,
    //           },
    //         })
    //         .then((resp) => {
    //           const data = resp.data.data;
    //           store.dispatch("login", {
    //             nickName: data.nickName,
    //             avatar: data.picture,
    //           });
    //           message.success(
    //             `欢迎${store.state.user.data?.nickName}, 登录成功!`
    //           );
    //           setTimeout(() => {
    //             router.push("/");
    //           }, 2000);
    //         });
    //     }
    //   });
    // });

    // const handleTest = () => {
    //   axios
    //     .post(
    //       `http://127.0.0.1:7001/api/users/loginByEmail`,
    //       {
    //         username: "18958849752@163.com",
    //         password: "woaiwo1234",
    //       },
    //       {
    //         headers: {
    //           "Custom-Param": "test",
    //           "Content-Type": "application/x-www-form-urlencoded",
    //         },
    //       }
    //     )
    //     .then((resp) => {
    //       console.log("resp", resp);
    //     });
    // };

    // const handleOAthLogin = () => {
    //   window.open(
    //     `http://127.0.0.1:7001/api/users/passport/gitee`,
    //     "_blank",
    //     "height=500,width=500,left=0;top=0"
    //   );
    // };

    onUnmounted(() => {
      clearInterval(counterTimer);
      counter.value = 60;
    });

    return {
      form,
      rules,
      isLoginLoading,
      login,
      codeButtonDisable,
      getCode,
      counter,
      loginFormRef,
      // handleOAthLogin,
      // handleTest,
    };
  },
  components: {
    UserOutlined,
    LockOutlined,
  },
});
</script>

<style scoped>
.logo-area {
  position: absolute;
  top: 30px;
  width: 150px;
}
.aside {
  height: 100vh;
  background-color: #1a1919;
  background-size: cover;
  background-repeat: no-repeat;
}
.aside .logo-img {
  width: 200px;
  margin-bottom: 20px;
}
.aside h2 {
  color: #cccccc;
  font-size: 29px;
}
.aside-inner {
  width: 60%;
  text-align: center;
}
.login-area {
  height: 100vh;
}
.login-area .ant-form {
  width: 350px;
}
.text-white-70 {
  color: #999;
  display: block;
  font-size: 19px;
}
.aside,
.login-area {
  display: flex !important;
  align-items: center;
  justify-content: center;
}
.login-area h2 {
  color: #333333;
  font-size: 29px;
}
.login-area .subTitle {
  color: #666666;
  font-size: 19px;
}
.login-area .ant-form-item-label {
  display: none;
}
.login-area .ant-input-prefix {
  left: auto;
  right: 30px;
  font-size: 19px;
}
.login-area .ant-input {
  font-size: 17px;
  padding: 20px 45px 20px 30px;
}
</style>
