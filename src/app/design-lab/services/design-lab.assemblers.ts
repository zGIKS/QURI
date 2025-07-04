import { Injectable } from '@angular/core';
import { Project } from '../model/project.entity';
import { TextLayer, ImageLayer, Layer } from '../model/layer.entity';
import { LayerType } from '../../const';

// Imports from project.response.ts
import {
  CreateProjectResponse,
  CreateTextLayerRequest,
  CreateTextLayerResponse,
  CreateImageLayerRequest,
  CreateImageLayerResponse,
  DeleteLayerResponse,
  DeleteProjectResponse,
  UpdateLayerCoordinatesRequest,
  UpdateLayerCoordinatesResponse,
  UpdateTextLayerDetailsRequest,
  UpdateTextLayerDetailsResponse,
  UpdateImageLayerDetailsRequest,
  UpdateImageLayerDetailsResponse,
  GetAllUserProjectsResponse,
  ProjectResponse,
  Layer as LayerResponse
} from './project.response';

@Injectable({
  providedIn: 'root',
})
export class DesignLabAssembler {

  // ==================== PROJECT ASSEMBLERS ====================

  /**
   * Convertir ProjectResponse del backend a entidad Project del dominio
   */
  toProjectEntity(response: ProjectResponse): Project {
    return new Project(
      response.id,
      response.title,
      response.userId,
      response.previewUrl,
      response.status as any, // Cast temporal para evitar error de tipo
      response.garmentColor as any,
      response.garmentSize as any,
      response.garmentGender as any,
      response.layers?.map(layer => this.toLayerEntity(layer)) || [],
      new Date(response.createdAt),
      new Date(response.updatedAt)
    );
  }

  /**
   * Convertir múltiples ProjectResponse a entidades Project
   */
  toProjectEntities(responses: GetAllUserProjectsResponse): Project[] {
    return responses.map(response => this.toProjectEntity(response));
  }

  /**
   * Convertir CreateProjectResponse a resultado simple
   */
  toCreateProjectResult(response: CreateProjectResponse): { success: boolean; projectId?: string; error?: string } {
    return {
      success: true,
      projectId: response.id,
      error: undefined
    };
  }

  /**
   * Convertir DeleteProjectResponse a resultado simple
   */
  toDeleteProjectResult(_response: DeleteProjectResponse): { success: boolean; error?: string } {
    return {
      success: true,
      error: undefined
    };
  }

  // ==================== LAYER ASSEMBLERS ====================

  /**
   * Convertir LayerResponse del backend a entidad Layer del dominio
   */
  toLayerEntity(response: LayerResponse): Layer {
    if (response.type === LayerType.TEXT || response.type === 'TEXT') {
      return new TextLayer(
        response.id,
        response.x,
        response.y,
        response.z,
        response.opacity,
        response.isVisible,
        new Date(response.createdAt),
        new Date(response.updatedAt),
        {
          text: response.details?.text || '',
          fontFamily: response.details?.fontFamily || 'Arial',
          fontSize: response.details?.fontSize || 16,
          fontColor: response.details?.fontColor || '#000000',
          isBold: response.details?.isBold || false,
          isItalic: response.details?.isItalic || false,
          isUnderlined: response.details?.isUnderlined || false
        }
      );
    }

    if (response.type === LayerType.IMAGE || response.type === 'IMAGE') {
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
      {
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

  /**
   * Convertir CreateTextLayerResponse a resultado simple
   */
  toCreateTextLayerResult(response: CreateTextLayerResponse): { success: boolean; layerId?: string; error?: string } {
    return {
      success: true,
      layerId: response.id,
      error: undefined
    };
  }

  /**
   * Convertir CreateImageLayerResponse a resultado simple
   */
  toCreateImageLayerResult(response: CreateImageLayerResponse): { success: boolean; layerId?: string; error?: string } {
    return {
      success: true,
      layerId: response.id,
      error: undefined
    };
  }

  /**
   * Convertir UpdateLayerCoordinatesResponse a resultado simple
   */
  toUpdateLayerCoordinatesResult(response: UpdateLayerCoordinatesResponse): { success: boolean; layerId?: string; error?: string } {
    return {
      success: true,
      layerId: response.id,
      error: undefined
    };
  }

  /**
   * Convertir UpdateTextLayerDetailsResponse a resultado simple
   */
  toUpdateTextLayerResult(response: UpdateTextLayerDetailsResponse): { success: boolean; layerId?: string; error?: string } {
    return {
      success: true,
      layerId: response.id,
      error: undefined
    };
  }

  /**
   * Convertir UpdateImageLayerDetailsResponse a resultado simple
   */
  toUpdateImageLayerResult(response: UpdateImageLayerDetailsResponse): { success: boolean; layerId?: string; error?: string } {
    return {
      success: true,
      layerId: response.id,
      error: undefined
    };
  }

  /**
   * Convertir DeleteLayerResponse a resultado simple
   */
  toDeleteLayerResult(_response: DeleteLayerResponse): { success: boolean; error?: string } {
    return {
      success: true,
      error: undefined
    };
  }

  // ==================== REQUEST ASSEMBLERS ====================

  /**
   * Crear CreateTextLayerRequest sin projectId (va en la URL)
   */
  toCreateTextLayerRequest(data: {
    text: string;
    fontColor: string;
    fontFamily: string;
    fontSize: number;
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
  }): Omit<CreateTextLayerRequest, 'projectId'> {
    return {
      text: data.text,
      fontColor: data.fontColor,
      fontFamily: data.fontFamily,
      fontSize: data.fontSize,
      isBold: data.isBold,
      isItalic: data.isItalic,
      isUnderlined: data.isUnderlined
    };
  }

  /**
   * Crear CreateImageLayerRequest sin projectId (va en la URL)
   */
  toCreateImageLayerRequest(data: {
    imageUrl: string;
    width: string;
    height: string;
  }): Omit<CreateImageLayerRequest, 'projectId'> {
    return {
      imageUrl: data.imageUrl,
      width: data.width,
      height: data.height
    };
  }

  /**
   * Crear UpdateLayerCoordinatesRequest sin projectId y layerId (van en la URL)
   */
  toUpdateLayerCoordinatesRequest(data: {
    x: number;
    y: number;
    z: number;
  }): Omit<UpdateLayerCoordinatesRequest, 'projectId' | 'layerId'> {
    return {
      x: data.x,
      y: data.y,
      z: data.z
    };
  }

  /**
   * Crear UpdateTextLayerDetailsRequest sin projectId y layerId (van en la URL)
   */
  toUpdateTextLayerDetailsRequest(data: {
    text: string;
    fontColor: string;
    fontFamily: string;
    fontSize: number;
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
  }): Omit<UpdateTextLayerDetailsRequest, 'projectId' | 'layerId'> {
    return {
      text: data.text,
      fontColor: data.fontColor,
      fontFamily: data.fontFamily,
      fontSize: data.fontSize,
      isBold: data.isBold,
      isItalic: data.isItalic,
      isUnderlined: data.isUnderlined
    };
  }

  /**
   * Crear UpdateImageLayerDetailsRequest sin projectId y layerId (van en la URL)
   */
  toUpdateImageLayerDetailsRequest(data: {
    imageUrl: string;
    width: number;
    height: number;
  }): Omit<UpdateImageLayerDetailsRequest, 'projectId' | 'layerId'> {
    return {
      imageUrl: data.imageUrl,
      width: data.width,
      height: data.height
    };
  }
}
