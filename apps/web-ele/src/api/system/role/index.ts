import { requestClient } from '#/api/request';

export async function createRoleApi(data: any) {
  return requestClient.post('/system/role', data);
}

export async function updateRoleApi(data: any) {
  return requestClient.put('/system/role', data);
}

export async function getRoleListApi(data: any) {
  return requestClient.get('/system/role/list', {
    params: data,
    responseReturn: 'body',
  });
}

export async function getRoleByIdApi(roleId: number) {
  return requestClient.get(`/system/role/${roleId}`);
}

export async function getRoleMenuSelectedApi(roleId: number) {
  return requestClient.get(`/system/menu/roleMenuTreeselect/${roleId}`, {
    responseReturn: 'body',
  });
}

export async function deleteRolesApi(ids: number[] | string[]) {
  return requestClient.delete(`/system/role/${ids.join(',')}`);
}

export async function changeRoleStatusApi(data: any) {
  return requestClient.put('/system/role/changeStatus', data);
}

export async function getDeptTreeApi(roleId: number) {
  return requestClient.get(`/system/role/deptTree/${roleId}`, {
    responseReturn: 'body',
  });
}

export async function updateDataScopeApi(data: any) {
  return requestClient.put('/system/role/dataScope', data);
}

export async function getAllocatedUserListApi(data: any) {
  return requestClient.get('/system/role/authUser/allocatedList', {
    params: data,
    responseReturn: 'body',
  });
}

// 查询角色未授权用户列表
export async function getUnallocatedUserListApi(data: any) {
  return requestClient.get('/system/role/authUser/unallocatedList', {
    params: data,
    responseReturn: 'body',
  });
}

// 授权用户选择
export async function setRoleUserApi(data: any) {
  return requestClient.put('/system/role/authUser/selectAll', null, {
    params: data,
  });
}

// 取消用户授权角色
export async function removeRoleUserApi(data: any) {
  return requestClient.put('/system/role/authUser/cancelAll', null, {
    params: data,
  });
}
