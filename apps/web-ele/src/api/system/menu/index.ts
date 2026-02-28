import { requestClient } from '#/api/request';

export async function getMenuTreeApi() {
  return requestClient.get('/system/menu/treeselect');
}
