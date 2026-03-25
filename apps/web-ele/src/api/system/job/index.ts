import { requestClient } from '#/api/request';

export * from './log';

export async function getJobListApi(data?: any) {
  return requestClient.get('/monitor/job/list', {
    params: data,
    responseReturn: 'body',
  });
}

export async function getJobById(id: number) {
  return requestClient.get(`/monitor/job/${id}`);
}

export async function addJobApi(data?: any) {
  return requestClient.post('/monitor/job', data);
}

export async function updateJobApi(data?: any) {
  return requestClient.put('/monitor/job', data);
}

export async function runJobApi(data?: any) {
  return requestClient.put('/monitor/job/run', data);
}

export async function deleteJobApi(postIds: number[]) {
  return requestClient.delete(`/monitor/job/${postIds}`);
}

export async function changeJobStatusApi(data: any) {
  return requestClient.put('/monitor/job/changeStatus', data);
}
