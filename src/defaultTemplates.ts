import { textDefaultProps } from "lego-bricks";

const defaultTextTemplates = [
  {
    text: "大标题",
    fontSize: "30px",
    fontWeight: "bold",
    width: "100px",
    tag: "h2",
  },
  { text: "正文内容", tag: "p", width: "100px" },
  {
    text: "链接内容",
    color: "#1890ff",
    textDecoration: "underline",
    tag: "p",
    cursor: "pointer",
    width: "100px",
  },
  {
    text: "按钮内容",
    color: "#ffffff",
    backgroundColor: "#1890ff",
    tag: "button",
    paddingTop: "6px",
    paddingBottom: "6px",
    paddingLeft: "8px",
    paddingRight: "8px",
    width: "100px",
    textAlign: "center",
  },
];

//  混入合成完整的文本props
export default defaultTextTemplates.map((template) => ({
  ...textDefaultProps,
  ...template,
}));
