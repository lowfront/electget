import ref from 'ref-napi';
import di from 'ref-struct-di';

const StructType = di(ref);

export const SWP_NOZORDER = 4;
export const SWP_NOMOVE = 2;
export const SWP_NOSIZE = 1;

export const HWND_BOTTOM = 1;
export const WM_WINDOWPOSCHANGING = 70;

export const DWMWA_EXCLUDED_FROM_PEEK = 12;

export const GWLP_HWNDPARENT = -8;

export const WINDOWPOS = StructType({
  hwnd: ref.types.int32,
  hwndInsertAfter: ref.types.int32,
  x: ref.types.int32,
  y: ref.types.int32,
  cx: ref.types.int32,
  cy: ref.types.int32,
  flags: ref.types.uint32,
});
