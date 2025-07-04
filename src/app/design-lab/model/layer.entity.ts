import { LayerType, TEXT_LAYER_BOLD_VALUE, TEXT_LAYER_REGULAR_VALUE } from "../../const";


export abstract class Layer {
    id: string;
    x: number;
    y: number;
    z: number;
    opacity: number;
    isVisible: boolean;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    details?: any;

    constructor(
        id: string,
        x: number,
        y: number,
        z: number,
        opacity: number,
        isVisible: boolean,
        type: string,
        createdAt: Date,
        updatedAt: Date,
        details?: any
    ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
        this.opacity = opacity;
        this.isVisible = isVisible;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.details = details;
    }

    abstract getCssStyles(): string;
    abstract getContent(): string;
}

export class ImageLayer extends Layer {
    imageUrl: string;

    constructor(
        id: string,
        x: number,
        y: number,
        z: number,
        opacity: number,
        isVisible: boolean,
        imageUrl: string
    ) {
        super(id, x, y, z, opacity, isVisible, LayerType.IMAGE, new Date(), new Date());
        this.imageUrl = imageUrl;
    }

    getCssStyles(): string {
        return `position: absolute; left: ${this.x}px; top: ${
            this.y
        }px; z-index: ${this.z}; opacity: ${this.opacity}; visibility: ${
            this.isVisible ? 'visible' : 'hidden'
        };`;
    }

    getContent(): string {
        return this.imageUrl;
    }
}

export class TextLayer extends Layer {
    constructor(
        id: string,
        x: number,
        y: number,
        z: number,
        opacity: number,
        isVisible: boolean,
        createdAt: Date,
        updatedAt: Date,
        details: {
            isItalic: boolean,
            fontFamily: string,
            isUnderlined: boolean,
            fontSize: number,
            text: string,
            fontColor: string,
            isBold: boolean
        }
    ) {
        super(id, x, y, z, opacity, isVisible, 'TEXT', createdAt, updatedAt, details);
    }

    getCssStyles(): string {
        let fontWeight = this.details?.isBold ? TEXT_LAYER_BOLD_VALUE : TEXT_LAYER_REGULAR_VALUE;
        let fontStyle = this.details?.isItalic ? 'italic' : 'normal'; // As the values wont change over time, we can hardcode them
        let textDecoration = this.details?.isUnderlined ? 'underline' : 'none';
        return `position: absolute; left: ${this.x}px; top: ${
            this.y
        }px; z-index: ${this.z}; opacity: ${this.opacity}; visibility: ${
            this.isVisible ? 'visible' : 'hidden'
        }; font-size: ${this.details?.fontSize}px; color: ${
            this.details?.fontColor
        }; font-family: ${
            this.details?.fontFamily
        }; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration};`;
    }

    getContent(): string {
        return this.details?.text || '';
    }
}
