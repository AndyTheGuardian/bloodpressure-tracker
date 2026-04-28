export type Reading = {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  comment: string;
  recorded_at: number;
};

export type Options = {
  showComments: Boolean;
  showGradient: Boolean;
  showFileSection: Boolean;
};