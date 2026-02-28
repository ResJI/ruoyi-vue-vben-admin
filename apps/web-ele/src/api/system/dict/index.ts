import { requestClient } from '#/api/request';

export async function getListTypeApi(data: any) {
  return requestClient.get('/system/dict/type/list', {
    params: data,
    responseReturn: 'body',
  });
}

export async function getTypeApi(dictId: number) {
  return requestClient.get(`/system/dict/type/${dictId}`);
}

export async function addTypeApi(data: any) {
  return requestClient.post('/system/dict/type', data);
}

export async function updateTypeApi(data: any) {
  return requestClient.put('/system/dict/type', data);
}

export async function deleteTypeApi(postIds: number[]) {
  return requestClient.delete(`/system/dict/type/${postIds}`);
}

export async function getDictOptionSelectListApi() {
  return requestClient.get('/system/dict/type/optionselect');
}

export async function getDictDataListApi(data: any) {
  return requestClient.get('/system/dict/data/list', {
    params: data,
    responseReturn: 'body',
  });
}

export async function getDictDataApi(dictCode: any) {
  return requestClient.get(`/system/dict/data/${dictCode}`);
}

export async function addDictDataApi(data: any) {
  return requestClient.post('/system/dict/data', data);
}

export async function updateDictDataApi(data: any) {
  return requestClient.put('/system/dict/data', data);
}

export async function deleteDictDataApi(dictCodes: string[]) {
  return requestClient.delete(`/system/dict/data/${dictCodes}`);
}

export async function refreshCacheApi() {
  return requestClient.delete('/system/dict/type/refreshCache');
}
