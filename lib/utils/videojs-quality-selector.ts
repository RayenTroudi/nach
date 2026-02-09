/**
 * Video.js Quality Selector Plugin
 * 
 * Adds a quality selector button to the Video.js control bar
 * Allows users to manually switch between video quality levels
 * Supports "Auto" mode for automatic quality selection
 */

import videojs from "video.js";
import { QualityLevel } from "./video-quality";

const Plugin = videojs.getPlugin("plugin") as any;
const MenuButton = videojs.getComponent("MenuButton") as any;
const MenuItem = videojs.getComponent("MenuItem") as any;

/**
 * Quality Menu Item Component
 */
class QualityMenuItem extends MenuItem {
  public quality: QualityLevel | "auto";
  public label: string;

  constructor(player: any, options: any) {
    super(player, options);
    this.quality = options.quality;
    this.label = options.label;
    
    // Check if this is the selected quality
    const isSelected = options.selected || false;
    (this as any).selected(isSelected);
  }

  handleClick() {
    const player = (this as any).player();
    
    // Trigger quality change event
    player.trigger("qualityChange", { quality: this.quality });
    
    // Update selected state for all items
    const parent = (this as any).parentComponent_;
    if (parent && parent.items) {
      parent.items.forEach((item: any) => {
        (item as any).selected(item.quality === this.quality);
      });
    }
    
    (this as any).selected(true);
  }

  createEl() {
    const el = super.createEl("li", {
      className: "vjs-menu-item vjs-quality-menu-item",
      innerHTML: `
        <span class="vjs-menu-item-text">
          <span class="vjs-quality-label">${this.label}</span>
          ${this.quality !== "auto" ? `<span class="vjs-quality-badge">${this.quality}</span>` : ""}
        </span>
      `,
    });
    
    return el;
  }
}

/**
 * Quality Selector Button Component
 */
class QualityMenuButton extends MenuButton {
  private qualitySources: any[];

  constructor(player: any, options: any = {}) {
    super(player, options);
    this.qualitySources = player.qualitySources || [];
    (this as any).controlText("Quality");
    
    // Update button when quality changes
    player.on("qualityChange", () => {
      this.update();
    });
  }

  createEl() {
    const el = super.createEl("div", {
      className: "vjs-quality-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button",
    });
    
    return el;
  }

  buildCSSClass() {
    return `vjs-quality-selector ${super.buildCSSClass()}`;
  }

  createItems() {
    const items: any[] = [];
    const player = (this as any).player();
    
    // Add Auto option if enabled
    if ((player as any).enableAutoQuality) {
      items.push(
        new QualityMenuItem(player, {
          quality: "auto",
          label: "Auto",
          selected: (player as any).isAutoQuality,
        })
      );
    }
    
    // Add quality options
    this.qualitySources.forEach((source: any) => {
      items.push(
        new QualityMenuItem(player, {
          quality: source.quality,
          label: source.label,
          selected: source.selected,
        })
      );
    });
    
    return items;
  }

  update() {
    const menu = (this as any).menu;
    if (menu) {
      (menu as any).contentEl().innerHTML = "";
      const items = this.createItems();
      items.forEach(item => {
        (menu as any).addItem(item);
      });
    }
  }
}

/**
 * Quality Selector Plugin
 */
class QualitySelector extends Plugin {
  constructor(player: any, options: any) {
    super(player, options);
    
    player.ready(() => {
      this.initializePlugin();
    });
  }

  initializePlugin() {
    const player = (this as any).player;
    
    // Check if quality sources are available
    if (!(player as any).qualitySources || (player as any).qualitySources.length === 0) {
      return;
    }
    
    // Always add quality selector even with single source to show current quality
    const controlBar = player.getChild("ControlBar");
    if (controlBar) {
      const qualityButton = new QualityMenuButton(player, {});
      
      // Insert before fullscreen button
      const fullscreenToggle = controlBar.getChild("FullscreenToggle");
      if (fullscreenToggle) {
        const index = controlBar.children().indexOf(fullscreenToggle);
        controlBar.addChild(qualityButton, {}, index);
      } else {
        controlBar.addChild(qualityButton);
      }
    }
  }
}

// Register components and plugin
(videojs as any).registerComponent("QualityMenuItem", QualityMenuItem);
(videojs as any).registerComponent("QualityMenuButton", QualityMenuButton);
(videojs as any).registerPlugin("qualitySelector", QualitySelector);

export default QualitySelector;
