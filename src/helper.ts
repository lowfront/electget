import os from 'os';
import { BrowserWindow } from 'electron';
import { Win } from './ffi/windows';

export function getHWnd(win: Win) {
  if (win instanceof BrowserWindow)
    return readBufferByOS(win.getNativeWindowHandle());
  else if (win instanceof Buffer) return readBufferByOS(win);
  else if (typeof win === 'number' && !Number.isNaN(win)) return win;
  else throw new Error(`Type that doesn't support: ${win}`);
}

export function readBufferByOS(buf: Buffer) {
  return os.endianness() == 'LE' ? buf.readInt32LE() : buf.readInt32BE();
}
