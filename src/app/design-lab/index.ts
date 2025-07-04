// Export all project-related types and enums for easier imports
export { Project } from './model/project.entity';
export { Layer, ImageLayer, TextLayer } from './model/layer.entity';
export type { ProjectResponse, LayerResponse } from './services/project.response';
export type { CreateProjectRequest } from './services/project.request';
export { ProjectService } from './services/project.service';
export { ProjectAssembler } from './services/project.assembler';
export { LayerAssembler } from './services/layer.assembler';

// Re-export enums from const.ts
export { 
    PROJECT_STATUS, 
    PROJECT_GENDER, 
    GARMENT_COLOR, 
    GARMENT_SIZE, 
    LayerType 
} from '../const';
