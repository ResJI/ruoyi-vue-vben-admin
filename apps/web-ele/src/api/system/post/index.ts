import { requestClient } from '#/api/request';

export async function getListPostApi(data?: any) {
  return requestClient.get('/system/post/list', {
    params: data,
    responseReturn: 'body',
  });
}

export async function addPostApi(data?: any) {
  return requestClient.post('/system/post', data);
}

export async function updatePostApi(data?: any) {
  return requestClient.put('/system/post', data);
}

export async function deletePostApi(postIds: number[]) {
  return requestClient.delete(`/system/post/${postIds}`);
}
