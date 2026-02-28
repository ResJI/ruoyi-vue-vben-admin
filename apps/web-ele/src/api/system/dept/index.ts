import { requestClient } from '#/api/request';

export async function getListDeptApi(data?: any) {
  return requestClient.get('/system/dept/list', {
    params: data,
  });
}

export async function addDeptApi(data?: any) {
  return requestClient.post('/system/dept', data);
}

export async function updateDeptApi(data?: any) {
  return requestClient.put('/system/dept', data);
}

export async function deleteDeptApi(deptId: number) {
  return requestClient.delete(`/system/dept/${deptId}`);
}
