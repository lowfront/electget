import ffi from 'ffi-napi';
import ref from 'ref-napi';
import {
  DWMWA_EXCLUDED_FROM_PEEK,
  GWLP_HWNDPARENT,
  HWND_BOTTOM,
  SWP_NOMOVE,
  SWP_NOSIZE,
  SWP_NOZORDER,
  WINDOWPOS,
} from '../constants';
import { BrowserWindow } from 'electron';
import { getHWnd } from '../helper';

export type Win = BrowserWindow | Buffer | number;

export const isWindows = process.platform === 'win32';

export const user32 = isWindows
  ? new ffi.Library('user32', {
      FindWindowExA: ['ulong', ['ulong', 'ulong', 'string', 'ulong']],
      GetDesktopWindow: ['ulong', []],
      SetWindowLongPtrA: ['ulong', ['int', 'int', 'int']],
      SetWindowPos: [
        'bool',
        ['ulong', 'ulong', 'int', 'int', 'int', 'int', 'uint'],
      ],
      SetParent: ['ulong', ['ulong', 'ulong']],
    })
  : null;

export const dwmapi = isWindows
  ? new ffi.Library('dwmapi.dll', {
      DwmSetWindowAttribute: ['ulong', ['long', 'ulong', 'bool*', 'ulong']],
    })
  : null;

export const kernel32 = isWindows
  ? new ffi.Library('kernel32.dll', {
      GetLastError: ['ulong', []],
    })
  : null;

export function getDesktopWindow() {
  return user32?.GetDesktopWindow() as number;
}

export function getSHELLDLL_DefViewHandle() {
  const progman = user32?.FindWindowExA(
    ref.NULL as any,
    ref.NULL as any,
    'Progman',
    ref.NULL as any
  ) as number;
  let defView = user32?.FindWindowExA(
    progman,
    ref.NULL as any,
    'SHELLDLL_DefView',
    ref.NULL as any
  );

  if (!defView) {
    // find again
    const desktopHWnd = user32?.GetDesktopWindow() as number;
    let workerW = 0;
    do {
      workerW = user32?.FindWindowExA(
        desktopHWnd,
        workerW,
        'WorkerW',
        ref.NULL as any
      ) as any;
      defView = user32?.FindWindowExA(
        workerW,
        ref.NULL as any,
        'SHELLDLL_DefView',
        ref.NULL as any
      );
    } while (!defView && workerW);
  }

  if (!defView) throw new Error('Not found SHELLDLL_DefView window handle.');

  return defView as number;
}

export function setOwnerWindow(win: Win, target: Win) {
  if (!user32) return false;
  const hWnd = getHWnd(win);
  const targetWnd = getHWnd(target);
  user32.SetWindowLongPtrA(hWnd, GWLP_HWNDPARENT, targetWnd);

  return true;
}

export function setParentWindow(win: Win, target: Win) {
  const hWnd = getHWnd(win);
  const targetWnd = getHWnd(target);
  user32?.SetParent(hWnd, targetWnd);
}

export function ignoreChangeZOrder(wParam: Buffer, lParam: Buffer) {
  const buf = Buffer.alloc(8);
  buf.type = ref.refType(WINDOWPOS);
  lParam.copy(buf);
  const actualStructDataBuffer = buf.deref();
  const windowPos = actualStructDataBuffer.deref();

  const newFlags = windowPos.flags | SWP_NOZORDER;
  actualStructDataBuffer.writeUInt32LE(newFlags, 6);
}

export function preventFromAeroPeek(win: Win) {
  if (!dwmapi) return false;
  const hWnd = getHWnd(win);
  const bool = ref.alloc('bool', true);
  dwmapi.DwmSetWindowAttribute(
    hWnd,
    DWMWA_EXCLUDED_FROM_PEEK,
    bool.ref(),
    ref.sizeof.int32
  );
  return true;
}

export function zOrderToBottom(win: Win) {
  if (!user32) return false;
  const hWnd = getHWnd(win);
  user32.SetWindowPos(hWnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);

  return true;
}
