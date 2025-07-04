export const DEFAULT_LAYER_STYLES = {
    IMAGE_URL : '', // TODO: Add default image url
    TEXT_CONTENT : '', // TODO: Add default text content
    FONT_SIZE : 16,
    FONT_COLOR : '#000000',
    FONT_FAMILY : 'Arial',
    BOLD : false,
    ITALIC : false,
    UNDERLINE : false,
}

export const TEXT_LAYER_BOLD_VALUE = '700';
export const TEXT_LAYER_REGULAR_VALUE = '400';

export enum PROJECT_STATUS {
    BLUEPRINT = 'BLUEPRINT',
    GARMENT = 'GARMENT',
    TEMPLATE = 'TEMPLATE',
}

export enum PROJECT_GENDER {
    MEN = 'MEN',
    WOMEN = 'WOMEN',
    UNISEX = 'UNISEX',
    KIDS = 'KIDS',
}

export enum GARMENT_COLOR {
    BLACK = 'BLACK',
    GRAY = 'GRAY',
    LIGHT_GRAY = 'LIGHT_GRAY',
    WHITE = 'WHITE',
    RED = 'RED',
    PINK = 'PINK',
    LIGHT_PURPLE = 'LIGHT_PURPLE',
    PURPLE = 'PURPLE',
    LIGHT_BLUE = 'LIGHT_BLUE',
    CYAN = 'CYAN',
    SKY_BLUE = 'SKY_BLUE',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    LIGHT_GREEN = 'LIGHT_GREEN',
    YELLOW = 'YELLOW',
    DARK_YELLOW = 'DARK_YELLOW',
}

export enum GARMENT_SIZE {
    XS = 'XS',
    S = 'S',
    M = 'M',
    L = 'L',
    XL = 'XL',
    XXL = 'XXL',
}

export enum LayerType {
    IMAGE = 'IMAGE',
    TEXT = 'TEXT',
}
