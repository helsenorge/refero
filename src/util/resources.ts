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
   * Dato kan ikke være etter maksimum dato
   */
  errorAfterMaxDate: string;
  /**
   * Dato kan ikke være før minimums dato
   */
  errorBeforeMinDate: string;
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
   * Ikke besvart
   */
  ikkeBesvart: string;
  /**
   * Last opp fil
   */
  uploadButtonText: string;
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
  /**
   * “Ingen treff på "{0}". Prøv med et annet ord eller sjekk for skrivefeil.”
   */
  autosuggestNoSuggestions?: string;
  /**
   * Du har skrevet for mange tegn. Gjør teksten kortere.
   */
  stringOverMaxLengthError?: string;

  /**
   * Velg filer
   */
  chooseFilesText?: string;
  /**
   * Hopp til navigator
   */
  skipLinkText?: string;

  /**
   * Du må skrive inn et gyldig årstall
   */
  year_field_invalid?: string;
  /**
   * Årstall er etter det eldste tillatte år
   */
  year_field_maxdate?: string;
  /**
   * Årstall er før det minste tillatte år
   */
  year_field_mindate?: string;
  /**
   * Årstall er påkrevd
   */
  year_field_required?: string;
  /**
   * Ugyldig verdi
   */
  yearmonth_field_invalid?: string;
  /**
   * Du må skrive inn et gyldig årstall
   */
  yearmonth_field_invalid_year?: string;
  /**
   * Tidspunkt er etter eldste tillatte tidspunkt
   */
  yearmonth_field_maxdate?: string;
  /**
   * Tidspunkt er før minste tillatte tidspunkt
   */
  yearmonth_field_mindate?: string;
  /**
   * Velg måned
   */
  yearmonth_field_month_placeholder?: string;
  /**
   * Årstall og måned er påkrevd
   */
  yearmonth_field_required?: string;
  /**
   * Velg år
   */
  yearmonth_field_year_placeholder?: string;
  /**
   * Hvem er mottaker av skjemaet?
   */
  adresseKomponent_header?: string;
  /**
   * Skjemaet sendes til:
   */
  adresseKomponent_skjemaSendesTil?: string;
  /**
   * Du må velge mottaker før du sender skjemaet.
   */
  adresseKomponent_sublabel?: string;
  /**
   * Velg avdeling
   */
  adresseKomponent_velgAvdeling?: string;
  /**
   * Velg helseforetak
   */
  adresseKomponent_velgHelseforetak?: string;
  /**
   * Velg helseregion
   */
  adresseKomponent_velgHelseregion?: string;
  /**
   * Velg sykehus/behandlingssted
   */
  adresseKomponent_velgSykehus?: string;
  /**
   * Velg klinikk
   */
  adresseKomponent_velgKlinikk?: string;
  /**
   * Velg seksjon
   */
  adresseKomponent_velgSeksjon?: string;
  /**
   * Velg sengepost
   */
  adresseKomponent_velgSengepost?: string;
  /**
   * Velg poliklinikk
   */
  adresseKomponent_velgPoliklinikk?: string;
  /**
   * Velg tjeneste
   */
  adresseKomponent_velgTjeneste?: string;
  /**
   * Du må velge en mottaker
   */
  adresseKomponent_feilmelding?: string;
  /**
   * Teknisk feil: kunne ikke laste liste over mottakere
   */
  adresseKomponent_loadError?: string;
  /**
   * Åpnes i ny fane
   */
  linkOpensInNewTab?: string;
  /**
   * Neste
   */
  nextStep?: string;
  /**
   * Forrige
   */
  previousStep?: string;
  /**
   * Annet
   */
  openChoiceOption?: string;
  /**
   * Last opp fil
   */
  attachmentError_required?: string;
  /**
   * Legg til minst {0} fil(er)
   */
  attachmentError_minFiles?: string;
  /**
   * Maks {0} fil(er) er tillatt
   */
  attachmentError_maxFiles?: string;
  /**
   * Filstørrelse må være mindre enn {0}MB
   */
  attachmentError_fileSize?: string;
  /**
   * Tillatte filtyper er:
   */
  attachmentError_fileType?: string;
  /**
   * Ugyldig dato
   */
  dateError_invalid?: string;
  /**
   * Felt for timer tillater kun 2 tegn
   */
  timeError_hours_digits?: string;
  /**
   * Felt for minutter tillater kun 2 tegn
   */
  timeError_minutes_digits?: string;
  /**
   * Ugyldig klokkeslett
   */
  dateError_time_invalid?: string;
  /**
   * (dd.mm.åååå)
   */
  dateFormat_ddmmyyyy?: string;
  /**
   * Januar
   */
  dateLabel_january?: string;
  /**
   * Februar
   */
  dateLabel_february?: string;
  /**
   * Mars
   */
  dateLabel_march?: string;
  /**
   * April
   */
  dateLabel_april?: string;
  /**
   * Mai
   */
  dateLabel_may?: string;
  /**
   * Juni
   */
  dateLabel_june?: string;
  /**
   * Juli
   */
  dateLabel_july?: string;
  /**
   * August
   */
  dateLabel_august?: string;
  /**
   * September
   */
  dateLabel_september?: string;
  /**
   * Oktober
   */
  dateLabel_october?: string;
  /**
   * November
   */
  dateLabel_november?: string;
  /**
   * Desember
   */
  dateLabel_december?: string;
  /**
   * År
   */
  dateLabel_year?: string;
  /**
   * Måned
   */
  dateLabel_month?: string;
  /**
   * tegn
   */
  maxCharactersText: string;
}
