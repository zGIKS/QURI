import {
    PROJECT_STATUS,
    PROJECT_GENDER,
    GARMENT_COLOR,
    GARMENT_SIZE,
} from '../../const';
import { Layer } from './layer.entity';

export class Project {
    id: string;
    title: string;
    userId: string;
    previewUrl: string | null;
    status: PROJECT_STATUS;
    garmentColor: GARMENT_COLOR;
    garmentSize: GARMENT_SIZE;
    garmentGender: PROJECT_GENDER;
    layers: Layer[];
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        title: string,
        userId: string,
        previewUrl: string | null,
        status: PROJECT_STATUS,
        garmentColor: GARMENT_COLOR,
        garmentSize: GARMENT_SIZE,
        garmentGender: PROJECT_GENDER,
        layers: Layer[],
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.title = title;
        this.userId = userId;
        this.previewUrl = previewUrl;
        this.status = status;
        this.garmentColor = garmentColor;
        this.garmentSize = garmentSize;
        this.garmentGender = garmentGender;
        this.layers = layers;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
