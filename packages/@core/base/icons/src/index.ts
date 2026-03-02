import { icons } from '@iconify-json/ep';
import { addIcon } from '@iconify/vue';

export * from './create-icon';

export * from './lucide';

export type { IconifyIcon as IconifyIconStructure } from '@iconify/vue';
export {
  addCollection,
  addIcon,
  Icon as IconifyIcon,
  listIcons,
} from '@iconify/vue';

addIcon('ep:fold', {
  body: icons.icons.fold?.body ?? '',
  width: 1024,
  height: 1024,
});
addIcon('ep:expand', {
  body: icons.icons.expand?.body ?? '',
  width: 1024,
  height: 1024,
});
