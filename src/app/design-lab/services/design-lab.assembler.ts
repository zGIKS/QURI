import { Injectable } from '@angular/core';
import { Project } from '../model/project.entity';
import { TextLayer, ImageLayer, Layer } from '../model/layer.entity';
import {
  ProjectResponse,
  LayerResponse,
  CreateProjectResponse,
  LayerOperationResponse
} from './design-lab.response';
import {
  CreateProjectRequest,
  CreateTextLayerRequest,
  CreateImageLayerRequest,
  UpdateTextLayerRequest,
  UpdateImageLayerRequest,
  UpdateLayerCoordinatesRequest
} from './design-lab.request';
import {
  CreateProjectCommand,
  CreateTextLayerCommand,
  CreateImageLayerCommand,
  UpdateTextLayerCommand,
  UpdateImageLayerCommand,
  UpdateLayerCoordinatesCommand,
  ProjectCommandResult,
  LayerCommandResult
} from './design-lab.commands';
import {
  PROJECT_STATUS,
  LayerType
} from '../../const';

@Injectable({
  providedIn: 'root',
})
export class DesignLabAssembler {

  /**
   * Convertir ProjectResponse del backend a entidad Project del dominio
   */
  toProjectEntity(response: ProjectResponse): Project {
    return new Project(
      response.id,
      response.title,
      response.userId,
      response.previewUrl,
      response.status,
      response.garmentColor,
      response.garmentSize,
      response.garmentGender,
      response.layers?.map(layer => this.toLayerEntity(layer)) || [],
      new Date(response.createdAt),
      new Date(response.updatedAt)
    );
  }

  /**
   * Convertir múltiples ProjectResponse a entidades Project
   */
  toProjectEntities(responses: ProjectResponse[]): Project[] {
    return responses.map(response => this.toProjectEntity(response));
  }

  /**
   * Convertir LayerResponse del backend a entidad Layer del dominio
   */
  toLayerEntity(response: LayerResponse): Layer {
    if (response.type === LayerType.TEXT) {
      return new TextLayer(
        response.id,
        response.x,
        response.y,
        response.z,
        response.opacity,
        response.isVisible,
        new Date(response.createdAt),
        new Date(response.updatedAt),
        response.details || {
          text: '',
          fontFamily: 'Arial',
          fontSize: 16,
          fontColor: '#000000',
          isBold: false,
          isItalic: false,
          isUnderlined: false
        }
      );
    }

    if (response.type === LayerType.IMAGE) {
      return new ImageLayer(
        response.id,
        response.x,
        response.y,
        response.z,
        response.opacity,
        response.isVisible,
        response.details?.imageUrl || ''
      );
    }

    // Fallback para tipos no reconocidos
    return new TextLayer(
      response.id,
      response.x,
      response.y,
      response.z,
      response.opacity,
      response.isVisible,
      new Date(response.createdAt),
      new Date(response.updatedAt),
      { text: '', fontFamily: 'Arial', fontSize: 16, fontColor: '#000000', isBold: false, isItalic: false, isUnderlined: false }
    );
  }

  /**
   * Convertir CreateProjectCommand a CreateProjectRequest
   */
  toCreateProjectRequest(command: CreateProjectCommand): CreateProjectRequest {
    return {
      title: command.title,
      garmentColor: command.garmentColor,
      garmentSize: command.garmentSize,
      garmentGender: command.garmentGender,
      userId: command.userId
    };
  }

  /**
   * Convertir CreateTextLayerCommand a CreateTextLayerRequest
   */
  toCreateTextLayerRequest(command: CreateTextLayerCommand): CreateTextLayerRequest {
    return {
      projectId: command.projectId,
      x: command.x,
      y: command.y,
      z: command.z,
      text: command.text,
      fontColor: command.fontColor,
      fontFamily: command.fontFamily,
      fontSize: command.fontSize,
      isBold: command.isBold,
      isItalic: command.isItalic,
      isUnderlined: command.isUnderlined
    };
  }

  /**
   * Convertir CreateImageLayerCommand a CreateImageLayerRequest
   */
  toCreateImageLayerRequest(command: CreateImageLayerCommand): CreateImageLayerRequest {
    return {
      projectId: command.projectId,
      x: command.x,
      y: command.y,
      z: command.z,
      imageUrl: command.imageUrl,
      width: command.width,
      height: command.height
    };
  }

  /**
   * Convertir UpdateTextLayerCommand a UpdateTextLayerRequest
   */
  toUpdateTextLayerRequest(command: UpdateTextLayerCommand): UpdateTextLayerRequest {
    return {
      text: command.text,
      fontColor: command.fontColor,
      fontFamily: command.fontFamily,
      fontSize: command.fontSize,
      isBold: command.isBold,
      isItalic: command.isItalic,
      isUnderlined: command.isUnderlined
    };
  }

  /**
   * Convertir UpdateImageLayerCommand a UpdateImageLayerRequest
   */
  toUpdateImageLayerRequest(command: UpdateImageLayerCommand): UpdateImageLayerRequest {
    return {
      imageUrl: command.imageUrl,
      width: command.width,
      height: command.height
    };
  }

  /**
   * Convertir UpdateLayerCoordinatesCommand a UpdateLayerCoordinatesRequest
   */
  toUpdateLayerCoordinatesRequest(command: UpdateLayerCoordinatesCommand): UpdateLayerCoordinatesRequest {
    return {
      x: command.x,
      y: command.y,
      z: command.z
    };
  }

  /**
   * Convertir CreateProjectResponse a ProjectCommandResult
   */
  toProjectCommandResult(response: CreateProjectResponse): ProjectCommandResult {
    return {
      success: response.success,
      projectId: response.projectId,
      message: response.message,
      error: response.error
    };
  }

  /**
   * Convertir LayerOperationResponse a LayerCommandResult
   */
  toLayerCommandResult(response: LayerOperationResponse): LayerCommandResult {
    return {
      success: response.success,
      layerId: response.layerId,
      message: response.message,
      error: response.error
    };
  }

  /**
   * Mapear string de estado a enum PROJECT_STATUS
   */
  private mapProjectStatus(status: string): PROJECT_STATUS {
    switch (status.toUpperCase()) {
      case 'BLUEPRINT':
        return PROJECT_STATUS.BLUEPRINT;
      case 'GARMENT':
        return PROJECT_STATUS.GARMENT;
      case 'TEMPLATE':
        return PROJECT_STATUS.TEMPLATE;
      default:
        return PROJECT_STATUS.BLUEPRINT;
    }
  }

  /**
   * Mapear string de tipo de capa a enum LayerType
   */
  private mapLayerType(type: string): LayerType {
    switch (type.toUpperCase()) {
      case 'TEXT':
        return LayerType.TEXT;
      case 'IMAGE':
        return LayerType.IMAGE;
      default:
        return LayerType.TEXT;
    }
  }
}
