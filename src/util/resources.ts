export interface Resources {
  /**
   * Slett
   */
  deleteButtonText: string;
  /**
   * Sjekk at følgende er riktig utfylt:
   */
  validationSummaryHeader: string;
  /**
   * Filstørrelsen må være mindre enn 25MB
   */
  validationFileMax: string;
  /**
   * Filtypen må være jpeg, png, eller pdf
   */
  validationFileType: string;
  /**
   * Gyldige filformater er jpeg, png og pdf
   */
  supportedFileFormats: string;
  /**
   * Velg...
   */
  selectDefaultPlaceholder: string;
  /**
   * Nullstill tidspunkt
   */
  resetTime: string;
  /**
   * Dato kan ikke være etter maksimum dato
   */
  errorAfterMaxDate: string;
  /**
   * Dato kan ikke være før minimums dato
   */
  errorBeforeMinDate: string;
  /**
   * Oppgi en dato
   */
  dateRequired: string;
  /**
   * Oppgi tid
   */
  oppgiTid: string;
  /**
   * Ugyldig tid
   */
  ugyldigTid: string;
  /**
   * oppgi dato og tid
   */
  oppgiDatoTid: string;
  /**
   * Ugyldig dato og tid
   */
  ugyldigDatoTid: string;
  /**
   * Oppgi en verdi
   */
  oppgiVerdi: string;
  /**
   * Oppgi en gyldig verdi
   */
  oppgiGyldigVerdi: string;
  /**
   * Avbryt
   */
  formCancel: string;
  /**
   * Send inn
   */
  formSend: string;
  /**
   * Lagre
   */
  formSave: string;
  /**
   * Sjekk at alt er riktig utfylt.
   */
  formError: string;
  /**
   * (valgfritt)
   */
  formOptional: string;
  /**
   * (må fylles ut)
   */
  formRequired: string;
  /**
   * Legg til
   */
  repeatButtonText: string;
  /**
   * Avslutt skjema
   */
  avsluttSkjema: string;
  /**
   * Fortsett
   */
  fortsett: string;
  /**
   * Forkast endringer
   */
  confirmDeleteButtonText: string;
  /**
   * Avbryt
   */
  confirmDeleteCancelButtonText: string;
  /**
   * Det finnes endringer
   */
  confirmDeleteHeading: string;
  /**
   * Hvis du sletter, vil du miste endringene.
   */
  confirmDeleteDescription: string;
  /**
   * mm
   */
  minutePlaceholder: string;
  /**
   * tt
   */
  hourPlaceholder: string;
  /**
   * Ikke besvart
   */
  ikkeBesvart: string;
  /**
   * Last opp fil
   */
  uploadButtonText: string;
  /**
   * Velg dato
   */
  filterDateCalendarButton: string;
  /**
   * Tilbake
   */
  filterDateNavigateBackward: string;
  /**
   * Fram
   */
  filterDateNavigateForward: string;
  /**
   * Datoen er oppgitt på feil format
   */
  filterDateErrorDateFormat: string;
  /**
   * Fra-dato kan ikke være senere enn til-dato
   */
  filterDateErrorBeforeMinDate: string;
  /**
   * Fra-dato kan ikke være senere enn til-dato
   */
  filterDateErrorAfterMaxDate: string;
  /**
   * er ikke tillatt
   */
  validationNotAllowed: string;
  /**
   * Du må fylle ut dette feltet
   */
  formRequiredErrorMessage?: string;
  /**
   * Slett
   */
  deleteAttachmentText?: string;
  /**
   * Teknisk feil
   */
  autoSuggestLoadError?: string;
}
