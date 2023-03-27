import { ComputedRef, computed, reactive, toRef } from "vue";
import { useStore } from "vuex";

interface LoadParams {
  pageIndex: number;
  pageSize: number;
  [key: string]: any;
}

const useLoadMore = (
  actionName: string,
  total: ComputedRef<number>,
  params: LoadParams = { pageIndex: 0, pageSize: 8 }
) => {
  const store = useStore();

  // 请求的参数: 根据变化的参数进行更新
  const requestParams = reactive(params);

  //  加载更多
  const loadMorePage = () => {
    requestParams.pageIndex++;
    store.dispatch(actionName, { searchParams: requestParams, loadMore: true }); //  加载更多, 添加 loadMore 参数
  };

  //  加载上一页
  const loadPrevPage = () => {
    requestParams.pageIndex--;
    store.dispatch(actionName, { searchParams: requestParams });
  };

  //  加载指定页面
  const goToPage = (index: number) => {
    requestParams.pageIndex = index;
    store.dispatch(actionName, { searchParams: requestParams });
  };

  const pageIndex = toRef(requestParams, "pageIndex");
  const isFirstPage = computed(() => requestParams.pageIndex === 0);
  const isLastPage = computed(
    () =>
      Math.ceil(total.value / params.pageSize) === requestParams.pageIndex + 1
  );
  const totalPage = computed(() =>
    Math.ceil(total.value / requestParams.pageSize)
  );

  return {
    goToPage,
    loadPrevPage,
    loadMorePage,
    isFirstPage,
    isLastPage,
    pageIndex,
    totalPage,
    requestParams,
  };
};

export default useLoadMore;
