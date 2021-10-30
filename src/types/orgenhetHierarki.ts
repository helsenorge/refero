export interface OrgenhetHierarki {
  OrgenhetId: number;
  Navn: string;
  EnhetType: EnhetType;
  EndepunktId: string | null;
  UnderOrgenheter: Array<OrgenhetHierarki> | null;
}

export enum EnhetType {
  Region = 1,
  Foretak = 2,
  Sykehus = 3,
  Klinikk = 4,
  Avdeling = 5,
  Seksjon = 6,
  Sengepost = 7,
  Poliklinikk = 8,
  Tjeneste = 9,
}
