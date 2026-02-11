import type { Dict } from './type';

import { requestClient } from '#/api/request';

export async function getDict(code: string) {
  return requestClient
    .get<Dict[]>(`/system/dict/data/type/${code}`)
    .then((res: any) =>
      res.map((item: any) => ({
        id: item.dictCode,
        label: item.dictLabel,
        value: item.dictValue,
      })),
    );
}
