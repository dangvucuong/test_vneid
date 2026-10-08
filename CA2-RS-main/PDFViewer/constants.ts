export enum InsertTypes {
  TEXT = 'text',
  IMAGE = 'image',
  DEFAULT = 'default',
}

// export const DEFAULT_IMG_URL =
//   'https://previews.123rf.com/images/aquir/aquir1311/aquir131100316/23569861-sample-grunge-red-round-stamp.jpg';

  // export const DEFAULT_IMG_URL =  'https://signvitranet.nacencomm.vn/img/cbimage.jpeg';
export const DEFAULT_IMG_URL = 'https://lh3.googleusercontent.com/d/1__WwT_KDYJC6FCfNS68IQ6vqER6xpViu'
export interface InsertCompleteProps {
  page: number;
  pos: {x: number; y: number};
  dims: {width: number; height: number};
}
