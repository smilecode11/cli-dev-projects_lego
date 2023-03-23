import { PageData, PageProps, ComponentProps } from "./modules/editor";
export interface RespData<T> {
  errno: number;
  data: T;
  message?: string;
}

export interface ListData<T> {
  list: T[];
  count: number;
}

export interface WorkData extends Omit<PageData, "props"> {
  content: {
    components: ComponentProps[];
    props?: PageProps;
  };
}

export type RespListData<T> = RespData<ListData<T>>;
export type RespWorkData = RespData<WorkData>;
