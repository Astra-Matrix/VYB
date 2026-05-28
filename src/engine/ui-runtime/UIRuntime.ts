import type { VybScene } from '../scene';

export interface UIWidgetSnapshot {
  entityId: string;
  elementType: string;
  visible: boolean;
  screenX: number;
  screenY: number;
}

/**
 * Scene UI runtime scaffold for editor preview of UIElement components.
 */
export class UIRuntime {
  private widgets: UIWidgetSnapshot[] = [];

  rebuildFromScene(scene: VybScene): number {
    this.widgets = [];
    for (const entityId of scene.world.getEntitiesWithComponent('uiElement')) {
      const ui = scene.world.getComponent(entityId, 'uiElement');
      if (!ui?.visible) continue;
      this.widgets.push({
        entityId,
        elementType: ui.elementType,
        visible: ui.visible,
        screenX: ui.layout.position.x,
        screenY: ui.layout.position.y,
      });
    }
    return this.widgets.length;
  }

  getWidgets(): UIWidgetSnapshot[] {
    return this.widgets;
  }
}
