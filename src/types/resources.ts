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
  /**
   * “Ingen treff på "{0}". Prøv med et annet ord eller sjekk for skrivefeil.”
   */
  autosuggestNoSuggestions?: string;
  /**
   * Du har skrevet for mange tegn. Gjør teksten kortere.
   */
  stringOverMaxLengthError?: string;
  /**
   * Maksimum {0} tegn
   */
  maxLengthText?: string;
  /**
   * Velg filer
   */
  chooseFilesText?: string;
  /**
   * Hopp til navigator
   */
  skipLinkText?: string;
  /**
   * Fjern dato
   */
  clearDate?: string;
  /**
   * Kalender
   */
  calendarLabel?: string;
  /**
   * Lukk
   */
  closeDatePicker?: string;
  /**
   * Bruk kalenderen og velg dato.
   */
  focusStartDate: string;
  /**
   * Gå bakover til forrige måned
   */
  jumpToPrevMonth?: string;
  /**
   * Gå fremover til neste måned
   */
  jumpToNextMonth?: string;
  /**
   * Tastatursnarveier
   */
  keyboardShortcuts?: string;
  /**
   * Åpne panelet med tastatursnarveier
   */
  showKeyboardShortcutsPanel?: string;
  /**
   * Lukk panelet med tastatursnarveier
   */
  hideKeyboardShortcutsPanel?: string;
  /**
   * Enter tast
   */
  enterKey?: string;
  /**
   * Høyre og venstre piltast
   */
  leftArrowRightArrow?: string;
  /**
   * Opp og ned piltast
   */
  upArrowDownArrow?: string;
  /**
   * Side opp og Side ned tast
   */
  pageUpPageDown?: string;
  /**
   * Hjem og Slutt tast
   */
  homeEnd?: string;
  /**
   * Escape tast
   */
  escape?: string;
  /**
   * Spørsmålstegn
   */
  questionMark?: string;
  /**
   * Åpne dette panelet
   */
  openThisPanel?: string;
  /**
   * Velg datoen som har fokus
   */
  selectFocusedDate?: string;
  /**
   * Flytt en dag bakover (venstre) og fremover (høyre)
   */
  moveFocusByOneDay?: string;
  /**
   * Flytt en uke bakover (opp) og fremover (ned)
   */
  moveFocusByOneWeek?: string;
  /**
   * Skifte måned
   */
  moveFocusByOneMonth?: string;
  /**
   * Gå til første eller siste dag av uken
   */
  moveFocustoStartAndEndOfWeek?: string;
  /**
   * Gå tilbake til datoen i inputfeltet
   */
  returnFocusToInput?: string;
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
  openChoiceOption?: string
}
