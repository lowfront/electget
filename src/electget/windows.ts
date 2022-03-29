import { BrowserWindow } from 'electron';
import ref from 'ref-napi';
import { ElectgetModule } from '.';
import { SWP_NOZORDER, WINDOWPOS, WM_WINDOWPOSCHANGING } from '../constants';
import {
  getDesktopWindow,
  getSHELLDLL_DefViewHandle,
  preventFromAeroPeek,
  setOwnerWindow,
  Win,
  zOrderToBottom,
} from '../ffi/windows';

export class WindowsModule implements ElectgetModule {
  preventFromAeroPeek(win: Win) {
    return preventFromAeroPeek(win);
  }

  preventFromShowDesktop(win: Win) {
    return setOwnerWindow(win, getSHELLDLL_DefViewHandle());
  }

  cancelPreventFromShowDesktop(win: Win) {
    return setOwnerWindow(win, getDesktopWindow());
  }

  preventChangeZOrder(browserWindow: BrowserWindow) {
    browserWindow.hookWindowMessage(WM_WINDOWPOSCHANGING, (wParam, lParam) => {
      const buf = Buffer.alloc(8);
      buf.type = ref.refType(WINDOWPOS);
      lParam.copy(buf);
      const actualStructDataBuffer = buf.deref();
      const windowPos = actualStructDataBuffer.deref();

      const newFlags = windowPos.flags | SWP_NOZORDER;
      actualStructDataBuffer.writeUInt32LE(newFlags, 6);
    });

    return () => this.cancelPreventChangeZOrder(browserWindow);
  }

  cancelPreventChangeZOrder(browserWindow: BrowserWindow) {
    browserWindow.unhookWindowMessage(WM_WINDOWPOSCHANGING);
  }

  moveToBottom(win: Win) {
    return zOrderToBottom(win);
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
