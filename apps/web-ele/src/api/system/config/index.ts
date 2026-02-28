import { requestClient } from '#/api/request';

export async function getConfigListApi(data?: any) {
  return requestClient.get('/system/config/list', {
    params: data,
    responseReturn: 'body',
  });
}

export async function addConfigApi(data?: any) {
  return requestClient.post('/system/config', data);
}

export async function updateConfigApi(data?: any) {
  return requestClient.put('/system/config', data);
}

export async function deleteConfigApi(configIds: number[]) {
  return requestClient.delete(`/system/config/${configIds}`);
}

export async function refreshConfigCacheApi() {
  return requestClient.delete('/system/config/refreshCache');
}
