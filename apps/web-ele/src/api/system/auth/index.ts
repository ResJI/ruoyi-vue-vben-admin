import { requestClient } from '#/api/request';

export async function getAuthListApi(data?: any) {
  return requestClient.get('/system/menu/list', {
    params: data,
  });
}

export async function addAuthApi(data?: any) {
  return requestClient.post('/system/menu', data);
}

export async function updateAuthApi(data?: any) {
  return requestClient.put('/system/menu', data);
}

export async function deleteAuthApi(configIds: number[]) {
  return requestClient.delete(`/system/menu/${configIds}`);
}
