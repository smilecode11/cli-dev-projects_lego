interface HelloProps {
  msg: string;
}

import { ref } from "vue";
const Hello = (props: HelloProps) => {
  const count = ref(0);

  const increment = () => {
    count.value++;
  };

  return (
    <>
      <h1>{props.msg}</h1>
      <p class={"count-wrap"}>{{ count }}</p>
      <button class={"count-btn"} onClick={increment}>
        increment count
      </button>
    </>
  );
};

Hello.props = ["msg"];

export default Hello;
