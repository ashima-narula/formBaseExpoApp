export type RecordRow = {
    id: number;
    form_id: number;
    values: Record<string, any>;
    username: string;
  };
  
  export type FieldDef = {
    id: number;
    name: string;
    field_type: string;
    required: boolean;
    options?: string | string[] | null;
    is_num?: boolean;
  };

  export type FieldType = "text" | "multiline" | "dropdown" | "location" | "image" | "numeric" | "date" | "number";
  