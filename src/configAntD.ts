import { App } from "vue";
import {
  Avatar,
  Button,
  Spin,
  Modal,
  Drawer,
  Card,
  Tag,
  Layout,
  Tabs,
  Menu,
  Row,
  Col,
  Form,
  Dropdown,
  Input,
  InputNumber,
  Slider,
  Radio,
  Select,
  Collapse,
} from "ant-design-vue";

const components = [
  Avatar,
  Button,
  Spin,
  Modal,
  Drawer,
  Card,
  Card.Meta,
  Tag,
  Layout,
  Layout.Header,
  Layout.Footer,
  Layout.Sider,
  Layout.Content,
  Tabs,
  Tabs.TabPane,
  Menu,
  Menu.Item,
  Row,
  Col,
  Collapse,
  Collapse.Panel,
  Form,
  Form.Item,
  Dropdown,
  Dropdown.Button,
  Input,
  Input.TextArea,
  InputNumber,
  Slider,
  Radio,
  Radio.Group,
  Radio.Button,
  Select,
  Select.Option,
];

const install = (app: App) => {
  components.forEach((component) => {
    app.component(component.name, component);
  });
};

export default {
  install,
};
