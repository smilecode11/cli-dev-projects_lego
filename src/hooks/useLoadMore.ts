import { ComputedRef, computed, reactive, toRef } from "vue";
import { useStore } from "vuex";

interface LoadParams {
  pageIndex: number;
  pageSize: number;
  [key: string]: any;
  loadMore?: boolean;
}

const useLoadMore = (
  actionName: string,
  total: ComputedRef<number>,
  params: LoadParams = { pageIndex: 0, pageSize: 8 }
) => {
  const store = useStore();

  // 请求的参数: 根据变化的参数进行更新
  const requestParams = reactive(params);

  const loadMorePage = () => {
    requestParams.pageIndex++;
    store.dispatch(actionName, { searchParams: requestParams, loadMore: true });
  };

  const loadPrevPage = () => {
    requestParams.pageIndex--;
    store.dispatch(actionName, { searchParams: requestParams });
  };

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
  };
};

export default useLoadMore;
