import { Project } from "../model/project.entity";
import { ProjectResponse } from "./project.response";
import { PROJECT_STATUS, PROJECT_GENDER, GARMENT_COLOR, GARMENT_SIZE } from "../../const";
import { LayerAssembler } from "./layer.assembler";

export class ProjectAssembler {
    static toEntityFromResponse(response: ProjectResponse): Project {
        const layers = response.layers ? LayerAssembler.toEntitiesFromResponse(response.layers) : [];
        return new Project(
            response.id,
            response.title,
            response.userId,
            response.previewUrl,
            response.status as PROJECT_STATUS,
            response.garmentColor as GARMENT_COLOR,
            response.garmentSize as GARMENT_SIZE,
            response.garmentGender as PROJECT_GENDER,
            layers,
            new Date(response.createdAt),
            new Date(response.updatedAt)
        );
    }
    
    static toEntitiesFromResponse(responses: ProjectResponse[]): Project[] {
        return responses.map(response => this.toEntityFromResponse(response));
    }
}
