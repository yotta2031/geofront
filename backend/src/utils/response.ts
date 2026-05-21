/**
 * 统一响应格式
 */
export function successResponse<T>(data: T, msg = "操作成功") {
  return {
    code: 1,
    msg,
    data,
  };
}

export function errorResponse(msg = "操作失败", data: unknown = null) {
  return {
    code: 0,
    msg,
    data,
  };
}

/**
 * 分页响应格式
 */
export function paginatedResponse<T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return successResponse({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
