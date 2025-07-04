export interface ProjectResponse {
    id: string;
    title: string;
    userId: string;
    previewUrl: string | null;
    status: string;
    garmentColor: string;
    garmentSize: string;
    garmentGender: string;
    layers: LayerResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface LayerResponse {
    id: string;
    x: number;
    y: number;
    z_index: number;
    opacity: number;
    visible: boolean;
    type: string; // 'image' | 'text'
    image_url?: string;
    text_content?: string;
    font_size?: number;
    font_color?: string;
    font_family?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
}
