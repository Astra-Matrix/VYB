import { UIRuntime } from '../../ui-runtime/UIRuntime';
import type { RuntimeSystem, RuntimeSystemContext } from '../RuntimeSystem';

export class UISystem implements RuntimeSystem {
  readonly id = 'ui';
  readonly runtime = new UIRuntime();
  widgetCount = 0;

  async onStart(ctx: RuntimeSystemContext): Promise<void> {
    this.widgetCount = this.runtime.rebuildFromScene(ctx.scene);
  }

  async onTick(ctx: RuntimeSystemContext): Promise<void> {
    this.widgetCount = this.runtime.rebuildFromScene(ctx.scene);
  }
}
