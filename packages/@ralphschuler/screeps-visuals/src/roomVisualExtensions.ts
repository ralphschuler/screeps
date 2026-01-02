/**
 * RoomVisual Extensions
 *
 * Enhanced RoomVisual prototype methods based on screepers/RoomVisual
 * https://github.com/screepers/RoomVisual
 *
 * Provides:
 * - Structure drawing (all structure types)
 * - Resource badges (minerals, compounds, energy)
 * - Speech bubbles
 * - Animated position markers
 */

/**
 * Visual color palette
 */
const colors = {
  gray: "#555555",
  light: "#AAAAAA",
  road: "#666",
  energy: "#FFE87B",
  power: "#F53547",
  dark: "#181818",
  outline: "#8FBB93",
  speechText: "#000000",
  speechBackground: "#2ccf3b"
};

/**
 * Speech bubble configuration
 */
const speechSize = 0.5;
const speechFont = "Times New Roman";

/**
 * Options for structure drawing
 */
interface StructureOpts {
  opacity?: number;
}

/**
 * Options for speech bubbles
 */
interface SpeechOpts {
  background?: string;
  textcolor?: string;
  textsize?: number;
  textfont?: string;
  opacity?: number;
}

/**
 * Options for animated positions
 */
interface AnimatedOpts {
  color?: string;
  opacity?: number;
  radius?: number;
  frames?: number;
}

/**
 * Declare extensions to RoomVisual prototype
 */
declare global {
  interface RoomVisual {
    structure(x: number, y: number, type: StructureConstant, opts?: StructureOpts): void;
    speech(text: string, x: number, y: number, opts?: SpeechOpts): void;
    animatedPosition(x: number, y: number, opts?: AnimatedOpts): void;
    resource(type: ResourceConstant, x: number, y: number, size?: number): void;
  }
}

/**
 * Track whether extensions have been initialized to prevent multiple assignments
 */
let extensionsInitialized = false;

/**
 * Initialize extensions only if RoomVisual exists (i.e., in game environment)
 */
if (typeof RoomVisual !== "undefined" && !extensionsInitialized) {
  extensionsInitialized = true;
  
  /**
   * Draw a structure at the specified position
   */
  RoomVisual.prototype.structure = function(
  x: number,
  y: number,
  type: StructureConstant,
  opts: StructureOpts = {}
): void {
  const finalOpts = { opacity: 1, ...opts };

  switch (type) {
    case STRUCTURE_EXTENSION:
      this.circle(x, y, {
        radius: 0.5,
        fill: colors.dark,
        stroke: colors.outline,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      this.circle(x, y, {
        radius: 0.35,
        fill: colors.gray,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_SPAWN:
      this.circle(x, y, {
        radius: 0.65,
        fill: colors.dark,
        stroke: "#CCCCCC",
        strokeWidth: 0.1,
        opacity: finalOpts.opacity
      });
      this.circle(x, y, {
        radius: 0.4,
        fill: colors.energy,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_POWER_SPAWN:
      this.circle(x, y, {
        radius: 0.65,
        fill: colors.dark,
        stroke: colors.power,
        strokeWidth: 0.1,
        opacity: finalOpts.opacity
      });
      this.circle(x, y, {
        radius: 0.4,
        fill: colors.energy,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_TOWER:
      this.circle(x, y, {
        radius: 0.6,
        fill: colors.dark,
        stroke: colors.outline,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      this.circle(x, y, {
        radius: 0.45,
        fill: colors.gray,
        opacity: finalOpts.opacity
      });
      this.rect(x - 0.2, y - 0.3, 0.4, 0.6, {
        fill: colors.light,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_STORAGE: {
      const storageOutline: [number, number][] = [
        [-0.45, -0.55],
        [0, -0.65],
        [0.45, -0.55],
        [0.55, 0],
        [0.45, 0.55],
        [0, 0.65],
        [-0.45, 0.55],
        [-0.55, 0]
      ];
      this.poly(
        storageOutline.map(p => [p[0] + x, p[1] + y]),
        {
          stroke: colors.outline,
          strokeWidth: 0.05,
          fill: colors.dark,
          opacity: finalOpts.opacity
        }
      );
      this.rect(x - 0.35, y - 0.45, 0.7, 0.9, {
        fill: colors.energy,
        opacity: finalOpts.opacity * 0.6
      });
      break;
    }

    case STRUCTURE_TERMINAL: {
      const terminalOutline: [number, number][] = [
        [-0.45, -0.55],
        [0, -0.65],
        [0.45, -0.55],
        [0.55, 0],
        [0.45, 0.55],
        [0, 0.65],
        [-0.45, 0.55],
        [-0.55, 0]
      ];
      this.poly(
        terminalOutline.map(p => [p[0] + x, p[1] + y]),
        {
          stroke: colors.outline,
          strokeWidth: 0.05,
          fill: colors.dark,
          opacity: finalOpts.opacity
        }
      );
      this.circle(x, y, {
        radius: 0.3,
        fill: colors.light,
        opacity: finalOpts.opacity
      });
      this.rect(x - 0.15, y - 0.15, 0.3, 0.3, {
        fill: colors.gray,
        opacity: finalOpts.opacity
      });
      break;
    }

    case STRUCTURE_LAB:
      this.circle(x, y, {
        radius: 0.55,
        fill: colors.dark,
        stroke: colors.outline,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      this.circle(x, y, {
        radius: 0.4,
        fill: colors.gray,
        opacity: finalOpts.opacity
      });
      this.rect(x - 0.15, y + 0.1, 0.3, 0.25, {
        fill: colors.light,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_LINK:
      this.circle(x, y, {
        radius: 0.5,
        fill: colors.dark,
        stroke: colors.outline,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      this.circle(x, y, {
        radius: 0.35,
        fill: colors.light,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_NUKER:
      this.circle(x, y, {
        radius: 0.65,
        fill: colors.dark,
        stroke: "#ff0000",
        strokeWidth: 0.1,
        opacity: finalOpts.opacity
      });
      this.circle(x, y, {
        radius: 0.4,
        fill: "#ff0000",
        opacity: finalOpts.opacity * 0.6
      });
      break;

    case STRUCTURE_OBSERVER:
      this.circle(x, y, {
        radius: 0.6,
        fill: colors.dark,
        stroke: colors.outline,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      this.circle(x, y, {
        radius: 0.4,
        fill: "#00ffff",
        opacity: finalOpts.opacity * 0.6
      });
      break;

    case STRUCTURE_CONTAINER:
      this.rect(x - 0.45, y - 0.45, 0.9, 0.9, {
        fill: colors.dark,
        stroke: colors.outline,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      this.rect(x - 0.35, y - 0.35, 0.7, 0.7, {
        fill: "transparent",
        stroke: colors.gray,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_ROAD:
      this.circle(x, y, {
        radius: 0.175,
        fill: colors.road,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_RAMPART:
      this.rect(x - 0.45, y - 0.45, 0.9, 0.9, {
        fill: "transparent",
        stroke: "#00ff00",
        strokeWidth: 0.1,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_WALL:
      this.rect(x - 0.45, y - 0.45, 0.9, 0.9, {
        fill: colors.dark,
        stroke: colors.light,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      break;

    case STRUCTURE_EXTRACTOR:
      this.circle(x, y, {
        radius: 0.6,
        fill: colors.dark,
        stroke: colors.outline,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      this.circle(x, y, {
        radius: 0.45,
        fill: colors.gray,
        opacity: finalOpts.opacity
      });
      break;

    default:
      // Default visualization for unknown structures
      this.circle(x, y, {
        radius: 0.5,
        fill: colors.gray,
        stroke: colors.outline,
        strokeWidth: 0.05,
        opacity: finalOpts.opacity
      });
      break;
  }
};

/**
 * Draw speech bubble at position
 */
RoomVisual.prototype.speech = function(
  text: string,
  x: number,
  y: number,
  opts: SpeechOpts = {}
): void {
  const background = opts.background ?? colors.speechBackground;
  const textcolor = opts.textcolor ?? colors.speechText;
  const textsize = opts.textsize ?? speechSize;
  const textfont = opts.textfont ?? speechFont;
  const finalOpacity = opts.opacity ?? 1;

  // Calculate bubble size
  const fontsize = textsize;
  const padding = 0.2;
  const textWidth = text.length * fontsize * 0.4;
  const boxWidth = textWidth + padding * 2;
  const boxHeight = fontsize + padding * 2;

  // Draw bubble
  this.rect(x - boxWidth / 2, y - 1 - boxHeight, boxWidth, boxHeight, {
    fill: background,
    opacity: finalOpacity * 0.9
  });

  // Draw pointer
  const pointer: [number, number][] = [
    [x - 0.1, y - 1],
    [x + 0.1, y - 1],
    [x, y - 0.6]
  ];
  this.poly(pointer, {
    fill: background,
    opacity: finalOpacity * 0.9,
    stroke: "transparent"
  });

  // Draw text
  this.text(text, x, y - 1 - boxHeight / 2 + 0.1, {
    color: textcolor,
    font: `${fontsize} ${textfont}`,
    opacity: finalOpacity
  });
};

/**
 * Draw animated marker at position
 */
RoomVisual.prototype.animatedPosition = function(
  x: number,
  y: number,
  opts: AnimatedOpts = {}
): void {
  const color = opts.color ?? "#ff0000";
  const finalOpacity = opts.opacity ?? 1;
  const radius = opts.radius ?? 0.75;
  const frames = opts.frames ?? 6;

  // Use game time for animation
  const frame = Game.time % frames;
  const animRadius = radius * (1 - frame / frames);
  const animOpacity = finalOpacity * (frame / frames);

  this.circle(x, y, {
    radius: animRadius,
    fill: "transparent",
    stroke: color,
    strokeWidth: 0.1,
    opacity: animOpacity
  });
};

/**
 * Draw resource badge
 */
RoomVisual.prototype.resource = function(
  type: ResourceConstant,
  x: number,
  y: number,
  size = 0.25
): void {
  // Resource colors mapping
  const resourceColors: Partial<Record<ResourceConstant, string>> = {
    [RESOURCE_ENERGY]: colors.energy,
    [RESOURCE_POWER]: colors.power,
    [RESOURCE_HYDROGEN]: "#FFFFFF",
    [RESOURCE_OXYGEN]: "#DDDDDD",
    [RESOURCE_UTRIUM]: "#48C5E5",
    [RESOURCE_LEMERGIUM]: "#24D490",
    [RESOURCE_KEANIUM]: "#9269EC",
    [RESOURCE_ZYNTHIUM]: "#D9B478",
    [RESOURCE_CATALYST]: "#F26D6F",
    [RESOURCE_GHODIUM]: "#FFFFFF"
  };

  const color = resourceColors[type] ?? "#CCCCCC";

  // Draw background circle
  this.circle(x, y, {
    radius: size,
    fill: colors.dark,
    opacity: 0.9
  });

  // Draw colored circle
  this.circle(x, y, {
    radius: size * 0.8,
    fill: color,
    opacity: 0.8
  });

  // Draw resource abbreviation
  const label = type.length <= 2 ? type : type.substring(0, 2).toUpperCase();
  this.text(label, x, y + 0.03, {
    color: colors.dark,
    font: `${size * 1.2} monospace`,
    align: "center",
    opacity: 0.9
  });
};

} // End of RoomVisual check

/**
 * Initialize the extensions
 */
export function initializeRoomVisualExtensions(): void {
  // Extensions are automatically loaded when this module is imported
  // This function serves as a confirmation that extensions are loaded
}
