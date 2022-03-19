import ref from 'ref-napi';
import ffi from 'ffi-napi';
import os from 'os';
import di from 'ref-struct-di';
import {BrowserWindow} from 'electron';

export const DWMWA_EXCLUDED_FROM_PEEK = 12;
export const GWLP_HWNDPARENT = -8;

const StructType = di(ref);

export const WINDOWPOS = StructType({
  hwnd: ref.types.int32,
  hwndInsertAfter: ref.types.int32,
  x: ref.types.int32,
  y: ref.types.int32,
  cx: ref.types.int32,
  cy: ref.types.int32,
  flags: ref.types.uint32,
});

export const SWP_NOZORDER = 4;
export const WM_WINDOWPOSCHANGING = 70;

export const HWND_BOTTOM = 1;
export const SWP_NOMOVE = 2;
export const SWP_NOSIZE = 1;

export type Win = BrowserWindow|Buffer;


export function readBufferByOS(buf: Buffer) {
  return os.endianness() == 'LE' ? buf.readInt32LE() : buf.readInt32BE();
};

export function getHWnd(win: Win) {
  if (win instanceof BrowserWindow) return readBufferByOS(win.getNativeWindowHandle());
  else if (win instanceof Buffer) return readBufferByOS(win);
  else throw new Error('Type that doesn\'t support.');
};

const electget = new class Electget {
  platform: NodeJS.Platform;
  user32?: {
    FindWindowExA: ffi.ForeignFunction<string | number, [string | number, string | number, string | null, string | number]>
    GetDesktopWindow: ffi.ForeignFunction<string | number, []>;
    SetWindowLongPtrA:  ffi.ForeignFunction<string | number, [number, number, number]>;
    SetWindowPos: ffi.ForeignFunction<boolean, [string | number, string | number, number, number, number, number, number]>;
  };
  dwmapi?: {
    DwmSetWindowAttribute: ffi.ForeignFunction<string | number, [string | number, string | number, ref.Pointer<boolean>, string | number]>;
  };
  kernel32?: {
    GetLastError: ffi.ForeignFunction<string | number, []>;
  };
  constructor() {
    this.platform = process.platform;

    if (this.platform !== 'win32') {
      console.warn('It does not support OS other than Windows.');
    } else {
      this.user32 = new ffi.Library('user32', {
        FindWindowExA: ['ulong', ['ulong', 'ulong', 'string', 'ulong']],
        GetDesktopWindow: ['ulong', []],
        SetWindowLongPtrA: ['ulong', ['int', 'int', 'int']],
        SetWindowPos: ['bool', ['ulong', 'ulong', 'int', 'int', 'int', 'int', 'uint']],
      });
      this.dwmapi = new ffi.Library('dwmapi.dll', {
        DwmSetWindowAttribute: ['ulong', ['long', 'ulong', 'bool*', 'ulong']],
      });
      this.kernel32 = new ffi.Library('kernel32.dll', {
        GetLastError: ['ulong', []],
      });
      
    }
  }

  preventFromAeroPeek(win: Win) {
    if (!this.dwmapi) return false;
    const hWnd = getHWnd(win);
    const bool = ref.alloc('bool', true);
    this.dwmapi.DwmSetWindowAttribute(hWnd, DWMWA_EXCLUDED_FROM_PEEK, bool.ref(), ref.sizeof.int32);
    return true;
  }

  preventFromShowDesktop(win: Win) {
    if (!this.user32) return false;
    const hWnd = getHWnd(win);
    const progman = this.user32?.FindWindowExA(ref.NULL as any, ref.NULL as any, 'Progman', ref.NULL as any);
    let defView = this.user32?.FindWindowExA(progman, ref.NULL as any, 'SHELLDLL_DefView', ref.NULL as any); 
    
    if (!defView) {// find again
      const desktopHWnd = this.user32?.GetDesktopWindow() ?? 0;
      let workerW = 0;
      do {
        workerW = this.user32?.FindWindowExA(desktopHWnd, workerW, 'WorkerW', ref.NULL as any) as any; 
        defView = this.user32?.FindWindowExA(workerW, ref.NULL as any, 'SHELLDLL_DefView', ref.NULL as any);
      } while (!defView && workerW);
    }
  
    if (!defView) return false;
  
    this.user32?.SetWindowLongPtrA(hWnd, GWLP_HWNDPARENT, defView as any);
  
    return true;
  }

  cancelPreventFromShowDesktop(win: Win) {
    if (!this.user32) return false;
    const hWnd = getHWnd(win);
    
    this.user32.SetWindowLongPtrA(hWnd, GWLP_HWNDPARENT, this.user32.GetDesktopWindow() as any);
  }

  preventChangeZOrder(browserWindow: BrowserWindow) {
    browserWindow.hookWindowMessage(WM_WINDOWPOSCHANGING, (wParam, lParam)=> {
      const buf = Buffer.alloc(8);
      buf.type = ref.refType(WINDOWPOS);
      lParam.copy(buf);
      const actualStructDataBuffer = buf.deref();
      const windowPos = actualStructDataBuffer.deref();
      
      const newFlags = windowPos.flags | SWP_NOZORDER;
      actualStructDataBuffer.writeUInt32LE(newFlags, 6);
    });
  
    return function cancelPreventChangeZOrder() {
      browserWindow.unhookWindowMessage(WM_WINDOWPOSCHANGING);
    };
  }

  moveToBottom(win: Win) {
    if (!this.user32) return false;
    const hWnd = getHWnd(win);
    this.user32.SetWindowPos(hWnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE|SWP_NOSIZE);
  }

  alwaysOnBottom(browserWindow: BrowserWindow) {
    const hWnd = browserWindow.getNativeWindowHandle();
    this.moveToBottom(hWnd);
    this.preventChangeZOrder(browserWindow);
    this.preventFromShowDesktop(hWnd);
  }

  cancelAlwaysOnBottom(browserWindow: BrowserWindow) {
    const hWnd = browserWindow.getNativeWindowHandle();
    browserWindow.unhookWindowMessage(WM_WINDOWPOSCHANGING);
    this.cancelPreventFromShowDesktop(hWnd);
  }
}

export default electget;