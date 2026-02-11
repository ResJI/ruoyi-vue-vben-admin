import { requestClient } from '#/api/request';

export async function createUserApi(data: any) {
  return requestClient.post('/system/user', data);
}

export async function getUserListApi(data: any) {
  return requestClient.get('/system/user/list', {
    params: data,
    responseReturn: 'body',
  });
}

export async function getPositionsAndRolesApi() {
  return requestClient.get('system/user/', {
    responseReturn: 'body',
  });
}

export async function getUserByIdApi(userId: number) {
  return requestClient.get(`system/user/${userId}`, {
    responseReturn: 'body',
  });
}

export async function updateUserApi(data: any) {
  return requestClient.put('/system/user', data);
}

export async function deleteUserApi(userIds: number[]) {
  return requestClient.delete(`/system/user/${userIds.join(',')}`);
}

export async function resetUserPasswordApi(data: any) {
  return requestClient.put('/system/user/resetPwd', data);
}

export async function changeUserStatusApi(data: any) {
  return requestClient.put('/system/user/changeStatus', data);
}

export async function getDepartmentTree() {
  return requestClient.get('/system/user/deptTree');
}
