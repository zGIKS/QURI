import { DEFAULT_LAYER_STYLES } from "../../const";
import { ImageLayer, Layer, TextLayer } from "../model/layer.entity";
import { LayerResponse } from "./project.response";

export class LayerAssembler {

    static toEntityFromResponse(response: LayerResponse) : Layer {
        if (response.type === 'IMAGE') {
            return new ImageLayer(
                response.id,
                response.x,
                response.y,
                response.z_index,
                response.opacity,
                response.visible,
                response.image_url || ''
            );
        } else if (response.type === 'TEXT') {
            return new TextLayer(
                response.id,
                response.x,
                response.y,
                response.z_index,
                response.opacity,
                response.visible,
                new Date(), // createdAt (no existe en response, usar fecha actual)
                new Date(), // updatedAt (no existe en response, usar fecha actual)
                {
                    isItalic: response.italic || false,
                    fontFamily: response.font_family || '',
                    isUnderlined: response.underline || false,
                    fontSize: response.font_size || 16,
                    text: response.text_content || '',
                    fontColor: response.font_color || '#000000',
                    isBold: response.bold || false
                }
            );
        } else {
            throw new Error(`Unknown layer type: ${response.type}`);
        }
    }

    static toEntitiesFromResponse(responses: LayerResponse[]) : Layer[] {
        return responses.map(response => LayerAssembler.toEntityFromResponse(response));
    }
}
