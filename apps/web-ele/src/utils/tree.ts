/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function listToTree(
  data: any[],
  id?: string,
  parentId?: string,
  children?: string,
) {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children',
  };

  const childrenListMap: Record<string, any> = {};
  const tree = [];
  for (const d of data) {
    const id = d[config.id];
    childrenListMap[id] = d;
    if (!d[config.childrenList]) {
      d[config.childrenList] = [];
    }
  }

  for (const d of data) {
    const parentId = d[config.parentId];
    const parentObj = childrenListMap[parentId];
    if (parentObj) {
      parentObj[config.childrenList].push(d);
    } else {
      tree.push(d);
    }
  }
  return tree;
}
