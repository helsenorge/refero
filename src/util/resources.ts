export interface Resources {
  /**
   * Slett rad
   */
  confirmDeleteButtonText: string;
  /**
   * Avbryt
   */
  confirmDeleteCancelButtonText: string;
  /**
   * Det finnes endringer som ikke er lagret
   */
  confirmDeleteHeading: string;
  /**
   * Hvis du sletter raden, vil du miste endringene du har gjort.
   */
  confirmDeleteDescription: string;
  /**
   * er ikke tillatt
   */
  validationNotAllowed: string;
  /**
   * Avbryt
   */
  formCancel: string;
  /**
   * Send inn
   */
  formSend: string;

  /**
   * Legg til
   */
  repeatButtonText: string;
  /**
   * Dato kan ikke være etter maksimum dato
   */
  errorAfterMaxDate: string;
  /**
   * Dato kan ikke være før minimums dato
   */
  errorBeforeMinDate: string;

  /**
   * Velg ett av alternativene
   */
  oppgiVerdi: string;
  /**
   * Oppgi en gyldig verdi
   */
  oppgiGyldigVerdi: string;
  /**
   * Slett
   */
  deleteButtonText: string;
  /**
   * Sjekk at følgende er riktig utfylt:
   */
  validationSummaryHeader: string;
  /**
   * Velg ett av alternativene
   */
  selectDefaultPlaceholder: string;

  /**
   * Gyldige filformater er jpeg, png og pdf
   */
  supportedFileFormats: string;
  /**
   * Ikke besvart
   */
  ikkeBesvart: string;

  /**
   * Du må fylle ut dette feltet
   */
  formRequiredErrorMessage: string;
  /**
   * Slett
   */
  deleteAttachmentText: string;
  /**
   * Last opp fil
   */
  uploadButtonText: string;
  /**
   * Teknisk feil
   */
  autoSuggestLoadError: string;
  /**
   * Du har skrevet for mange tegn. Gjør teksten kortere.
   */
  stringOverMaxLengthError: string;
  /**
   * Velg filer
   */
  chooseFilesText: string;

  /**
   * Ingen treff på "{0}". Prøv med et annet ord eller sjekk for skrivefeil.
   */
  autosuggestNoSuggestions: string;
  /**
   * Hopp til navigator
   */
  skipLinkText: string;

  /**
   * Lagre
   */
  formSave: string;

  /**
   * Annet
   */
  openChoiceOption: string;
  /**
   * Du må skrive inn et gyldig årstall
   */
  year_field_invalid: string;
  /**
   * Årstall er påkrevd
   */
  year_field_required: string;
  /**
   * Det tidligste året du kan velge er
   */
  year_field_mindate: string;
  /**
   * Det seneste året du kan velge er
   */
  year_field_maxdate: string;
  /**
   * Velg måned
   */
  yearmonth_field_month_placeholder: string;
  /**
   * Årstall og måned er påkrevd
   */
  yearmonth_field_required: string;
  /**
   * Hvem er mottaker av skjemaet?
   */
  adresseKomponent_header: string;
  /**
   * Du må velge mottaker før du sender skjemaet.
   */
  adresseKomponent_sublabel: string;
  /**
   * Velg helseregion
   */
  adresseKomponent_velgHelseregion: string;
  /**
   * Velg helseforetak
   */
  adresseKomponent_velgHelseforetak: string;
  /**
   * Velg sykehus
   */
  adresseKomponent_velgSykehus: string;
  /**
   * Velg avdeling
   */
  adresseKomponent_velgAvdeling: string;
  /**
   * Skjemaet sendes til:
   */
  adresseKomponent_skjemaSendesTil: string;
  /**
   * Du må velge en mottaker
   */
  adresseKomponent_feilmelding: string;
  /**
   * Teknisk feil. Kunne ikke laste mottakere.
   */
  adresseKomponent_loadError: string;
  /**
   * Velg klinikk
   */
  adresseKomponent_velgKlinikk: string;
  /**
   * Velg seksjon
   */
  adresseKomponent_velgSeksjon: string;
  /**
   * Velg sengepost
   */
  adresseKomponent_velgSengepost: string;
  /**
   * Velg poliklinikk
   */
  adresseKomponent_velgPoliklinikk: string;
  /**
   * Velg behandlingssted
   */
  adresseKomponent_velgTjeneste: string;

  /**
   * Åpnes i ny fane
   */
  linkOpensInNewTab: string;
  /**
   * Neste
   */
  nextStep: string;
  /**
   * Forrige
   */
  previousStep: string;

  /**
   * tegn
   */
  maxCharactersText: string;

  /**
   * Legg til minst {0} fil(er)
   */
  attachmentError_minFiles: string;
  /**
   * Maks {0} fil(er) er tillatt
   */
  attachmentError_maxFiles: string;
  /**
   * Filstørrelse må være mindre enn {0}MB
   */
  attachmentError_fileSize: string;
  /**
   * Tillatte filtyper er:
   */
  attachmentError_fileType: string;
  /**
   * Ugyldig dato
   */
  dateError_invalid: string;
  /**
   * Ugyldig klokkeslett
   */
  dateError_time_invalid: string;
  /**
   * Januar
   */
  dateLabel_january: string;
  /**
   * Februar
   */
  dateLabel_february: string;
  /**
   * Mars
   */
  dateLabel_march: string;
  /**
   * April
   */
  dateLabel_april: string;
  /**
   * Mai
   */
  dateLabel_may: string;
  /**
   * Juni
   */
  dateLabel_june: string;
  /**
   * Juli
   */
  dateLabel_july: string;
  /**
   * August
   */
  dateLabel_august: string;
  /**
   * September
   */
  dateLabel_september: string;
  /**
   * Oktober
   */
  dateLabel_october: string;
  /**
   * November
   */
  dateLabel_november: string;
  /**
   * Desember
   */
  dateLabel_december: string;
  /**
   * (dd.mm.åååå)
   */
  dateFormat_ddmmyyyy: string;
  /**
   * Felt for timer tillater kun 2 tegn
   */
  timeError_hours_digits: string;
  /**
   * Felt for minutter tillater kun 2 tegn
   */
  timeError_minutes_digits: string;
  /**
   * År
   */
  dateLabel_year: string;
  /**
   * Måned
   */
  dateLabel_month: string;

  /**
   * Minst {0} fil(er) og maks {1} fil(er) er tillatt
   */
  attachmentError_minFiles_and_maxFiles: string;
  /**
   * Oppgi i
   */
  quantity_unit_sublabel: string;

  /**
   * (valgfritt)
   */
  formOptional: string;
  /**
   * Velg ett eller flere alternativer
   *
   */
  formRequired: string;
  /**
   * Alle valgfrie
   */
  formAllOptional: string;
  /**
   * Alle påkrevde
   */
  formAllRequired: string;
  /**
   * Alle påkrevde inndatafelter
   */
  formRequiredInputs: string;
  /**
   * Alle påkrevde enkeltkryssbokser
   */
  formRequiredSingleCheckbox: string;
  /**
   * Alle påkrevde flerkryssbokser
   */
  formRequiredMultiCheckbox: string;
  /**
   * Alle påkrevde radioknapplister
   */
  formRequiredRadiobuttonList: string;
}
