import { GARMENT_COLOR, GARMENT_SIZE, PROJECT_GENDER } from '../../const';

export interface CreateProjectRequest {
    title: string;
    userId: string;
    garmentColor: GARMENT_COLOR;
    garmentGender: PROJECT_GENDER;
    garmentSize: GARMENT_SIZE;
}
