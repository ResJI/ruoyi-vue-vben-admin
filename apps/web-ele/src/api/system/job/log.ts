import { requestClient } from '#/api/request';

export async function getJobLogListApi(data?: any) {
  return requestClient.get('/monitor/jobLog/list', {
    params: data,
    responseReturn: 'body',
  });
}

export async function deleteJobLogApi(postIds: number[]) {
  return requestClient.delete(`/monitor/jobLog/${postIds}`);
}

export async function cleanJobLogApi() {
  return requestClient.delete('/monitor/jobLog/clean');
}
