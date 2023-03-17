const jsonServer = require("json-server");
const server = jsonServer.create();
const bodyParse = require("body-parser");
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const jwt = require("jsonwebtoken");
const tokenSecret = "123456smiling";
const tokenExpiresIn = "1h";
const createToken = (payload) => {
  return jwt.sign(payload, tokenSecret, { expiresIn: tokenExpiresIn });
};
const verifyToken = (token) => {
  return jwt.verify(token, tokenSecret);
};
const rewriter = jsonServer.rewriter({
  "/api/*": "/$1",
});
server.use(bodyParse.json());
server.use(rewriter);
server.use(middlewares);

//  生成 token
server.post("/users/loginByPhoneNumber", (req, res) => {
  const { phoneNumber, veriCode } = req.body;
  const accessToken = createToken({ phoneNumber, veriCode });
  res.status(200).json({ data: { token: accessToken } });
});

server.use("/works", (req, res, next) => {
  const errorResp = {
    errno: 10001,
    message: "登录校验失败",
  };
  const authHeader = req.headers.authorization;
  if (authHeader === undefined) {
    res.json(errorResp);
    return;
  }
  try {
    //  验证 token
    verifyToken(authHeader.split(" ")[1]);
    next();
  } catch (error) {
    res.json(errorResp);
  }
});
// 重写返回值
router.render = (req, res) => {
  res.jsonp({
    errno: 0,
    data: {
      list: res.locals.data,
      count: res.locals.data.length,
    },
  });
};
server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running");
});
