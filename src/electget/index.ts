import { BrowserWindow } from 'electron';
import { Win } from '../ffi/windows';
import { WindowsModule } from './windows';
import { MacModule } from './mac';

export interface ElectgetModule {
  preventFromAeroPeek(win: Win): boolean;

  preventFromShowDesktop(win: Win): boolean;

  cancelPreventFromShowDesktop(win: Win): boolean;

  preventChangeZOrder(browserWindow: BrowserWindow): () => void;

  cancelPreventChangeZOrder(browserWindow: BrowserWindow): void;

  moveToBottom(win: Win): boolean;

  alwaysOnBottom(browserWindow: BrowserWindow): void;

  cancelAlwaysOnBottom(browserWindow: BrowserWindow): void;
}

export class Electget {
  platform: NodeJS.Platform;
  module: ElectgetModule;

  constructor() {
    this.platform = process.platform;

    switch (this.platform) {
      case 'win32':
        this.module = new WindowsModule();
        break;
      case 'darwin':
        this.module = new MacModule();
        break;
      default:
        throw new Error(
          `This module is not currently supported by OS: ${this.platform}`
        );
    }
  }

  preventFromAeroPeek(win: Win) {
    return this.module?.preventFromAeroPeek(win);
  }

  preventFromShowDesktop(win: Win) {
    return this.module?.preventFromShowDesktop(win);
  }

  cancelPreventFromShowDesktop(win: Win) {
    return this.module?.cancelPreventFromShowDesktop(win);
  }

  preventChangeZOrder(browserWindow: BrowserWindow) {
    return this.module?.preventChangeZOrder(browserWindow);
  }

  cancelPreventChangeZOrder(browserWindow: BrowserWindow) {
    return this.module?.cancelPreventChangeZOrder(browserWindow);
  }

  moveToBottom(win: Win) {
    return this.module?.moveToBottom(win);
  }

  alwaysOnBottom(browserWindow: BrowserWindow) {
    return this.module?.alwaysOnBottom(browserWindow);
  }

  cancelAlwaysOnBottom(browserWindow: BrowserWindow) {
    return this.module?.cancelAlwaysOnBottom(browserWindow);
  }
}
