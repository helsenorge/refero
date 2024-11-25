export interface OrgenhetHierarki {
  OrgenhetId: number;
  Navn: string;
  EnhetType: EnhetType;
  EndepunktId: string | null;
  UnderOrgenheter: OrgenhetHierarki[] | null;
  VisningType: VisningsType;
  ForelderId: number | null;
  ExpectedChildCount: number;
  StatusType: StatusType;
}

export enum VisningsType {
  Standard = 1,
  VisesKunVedFlereValg = 2,
  VisesKunHvisAngitt = 3,
}

export enum StatusType {
  UnderArbeid = 1,
  Aktiv = 2,
  Deaktivert = 3,
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
