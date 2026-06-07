interface window {
  showSaveFilePicker(options?: {
    suggestedName?: string;
    types?: {
      description?: string;
      accept: Record<string, string[]>;
    }[];
  }): Promise<any>;
}
