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
   * Dette skjemaet er ikke tilgjengelig
   */
  skjemaAccessDeniedErrorTitle: string;
  /**
   * Skjemaet må fylles ut personlig av den det gjelder
   */
  skjemaAccessDeniedDiscretionSubjectOnlyErrorBody: string;
  /**
   * er ikke tillatt
   */
  validationNotAllowed: string;
  /**
   * Helsenorge
   */
  helsenorge: string;
  /**
   * Avbryt
   */
  formCancel: string;
  /**
   * Send inn
   */
  formSend: string;
  /**
   * (valgfritt)
   */
  formOptional: string;
  /**
   * Legg til
   */
  repeatButtonText: string;
  /**
   * Ok
   */
  confirmationActionButton: string;
  /**
   * Svaret er sendt inn
   */
  sendtConfirmation: string;
  /**
   * Du finner en kopi av meldingen i innboksen din på Helsenorge. Du kan slette meldinger når du vil.
En kopi av svaret er også lagret i Dokumenter på Helsenorge. Dette dokumentet kan du slette, eller skjule for den du eventuelt har gitt fullmakt.
   */
  sendtConfirmationText: string;
  /**
   * Feil
   */
  sendInnSkjemaErrorTitle: string;
  /**
   * Det skjedde en feil under innsending av skjema. Prøv igjen senere.
   */
  sendInnSkjemaErrorBody: string;
  /**
   * Dato kan ikke være etter maksimum dato
   */
  errorAfterMaxDate: string;
  /**
   * Dato kan ikke være før minimums dato
   */
  errorBeforeMinDate: string;
  /**
   * Ugyldig tid
   */
  ugyldigTid: string;
  /**
   * Ugyldig dato og tid
   */
  ugyldigDatoTid: string;
  /**
   * Velg ett av alternativene
   */
  oppgiVerdi: string;
  /**
   * Oppgi en gyldig verdi
   */
  oppgiGyldigVerdi: string;
  /**
   * Skjema sendt inn til {0} via Helsenorge.
   */
  innsendtSkjema: string;
  /**
   * Din kopi av utfylt skjema vedlagt.
   */
  skjemaKopi: string;
  /**
   * Skjemaet eller oppgaven finnes ikke.
   */
  oppgavenFinsIkke: string;
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
   * Filstørrelsen må være mindre enn {0} MB
   */
  validationFileMax: string;
  /**
   * Gyldige filformater er jpeg, png og pdf
   */
  supportedFileFormats: string;
  /**
   * Ikke besvart
   */
  ikkeBesvart: string;
  /**
   * Det har skjedd en teknisk feil
   */
  loadSkjemaErrorTitle: string;
  /**
   * Prøv igjen senere.
   */
  loadSkjemaErrorBody: string;
  /**
   * Ok
   */
  loadSkjemaButtonOk: string;
  /**
   * Det er ikke mulig å sende inn skjemaet akkurat nå grunnet en teknisk feil. Du kan fortsatt fylle ut og lagre skjemaet, men må sende inn skjemaet senere.
   */
  berikingFailedOnRetrievalBody: string;
  /**
   * Et problem har oppstått
   */
  berikingFailedOnRetrievalTitle: string;
  /**
   * Send uten å lagre
   */
  confirmDiscretionSendButtonText: string;
  /**
   * Send og lagre
   */
  confirmDiscretionlagreAndSendButtonText: string;
  /**
   * Det finnes ingen kopi av skjemaet på Helsenorge.
   */
  sendtConfirmationDiscretion: string;
  /**
   * Opplasting av vedlegg feilet
   */
  anonymousUploadTitle: string;
  /**
   * Du må logge inn for å kunne laste opp vedlegg.
   */
  anonymousUploadDescription: string;
  /**
   * Logg inn for å sende inn
   */
  skjemaLoginButton: string;
  /**
   * Du bør logge inn for å fylle ut og sende inn dette skjemaet, slik at du får lagre en kopi. Det er også mulig å sende inn dette skjemaet uten å logge inn. Du vil da ikke få noen kopi av skjemaet.
   */
  skjemaLoginMessageAuthenticationRequirementOptional: string;
  /**
   * Du må logge inn for å fylle ut og sende dette skjemaet.
   */
  skjemaLoginMessageAuthenticationRequirementRequired: string;
  /**
   * Vil du sende og lagre?
   */
  confirmDiscretionTitle: string;
  /**
   * En kopi av skjemaet vil normalt bli lagret på Helsenorge. Du kan unngå denne lagringen hvis du vil.
   */
  confirmDiscretionText: string;
  /**
   * <p>Du har forsøkt å bruke en tjeneste som ikke er tilgjengelig for deg eller den du representerer.<br/>
Dette kan skyldes at du ikke har gitt nødvendig samtykke, fullmakten ikke tillater at du bruker denne tjenesten eller at du som forelder ikke har lov til å bruke tjenesten for barnet ditt.</p>

<p>Dersom du ønsker, kan du <a href="https://tjenester.helsenorge.no/personverninnstillinger">forandre på samtykket ditt</a>.</p>
   */
  skjemaAccessDeniedNoAccessToTjenesteErrorBody: string;
  /**
   * Fortsett senere
   */
  lagreSkjemaButtonFortsettSenere: string;
  /**
   * Fortsett å fylle ut
   */
  lagreSkjemaButtonFortsettUtfylling: string;
  /**
   * Skjemaet er lagret i Dokumenter
   */
  lagreSkjemaTittel: string;
  /**
   * Vis hjelp
   */
  helpButtonTooltip: string;
  /**
   * Opplysningene du fyller ut lagres ikke.
   */
  sidebarSectionText_Veileder_Opplysninger_KontaktHelsenorge: string;
  /**
   * Utskriftsversjon
   */
  sidebar_printLink: string;
  /**
   * Velg fortsett senere dersom du ønsker å gå ut av skjemaet.
   */
  lagreSkjemaDokumenterBody: string;
  /**
   * Fullfør
   */
  formFinish: string;
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
   * Du må {loginLink} for å kunne sende skjema. Alternativt kan du fylle ut på papir, klikk på {omSkjemaLink} for å få vite mer.
   */
  skjemaLoginMessageAuthenticationRequirementRequiredPrint: string;
  /**
   * logge inn
   */
  loggeInnLinkText: string;
  /**
   * Du bør {loginLink} for å fylle ut og sende inn dette skjemaet, slik at du får lagre en kopi. Det er også mulig å sende inn dette skjemaet uten å logge inn. Du vil da ikke få noen kopi av skjemaet.
   */
  skjemaLoginMessageAuthenticationRequirementOptionalPrint: string;
  /**
   * Du må {loginLink} for å fylle ut og sende dette skjemaet.
   */
  skjemaLoginMessageAuthenticationRequirementRequiredNoPrint: string;
  /**
   * Ingen treff på "{0}". Prøv med et annet ord eller sjekk for skrivefeil.
   */
  autosuggestNoSuggestions: string;
  /**
   * Hopp til navigator
   */
  skipLinkText: string;
  /**
   * Om skjema
   */
  sidebar_titleSkjema: string;
  /**
   * Vis informasjon om skjema
   */
  sidebar_openlabel: string;
  /**
   * Lukk informasjon om skjema
   */
  sidebar_closelabel: string;
  /**
   * Hjelp om
   */
  sidebar_titlearia: string;
  /**
   * personverninnstillinger
   */
  personverninnstillingerLink: string;
  /**
   * Lagre
   */
  formSave: string;
  /**
   * Alternativer for utfylling
   */
  sidebarSectionHeader_Alternativer: string;
  /**
   * Veiledning og ansvarlig
   */
  sidebarSectionHeader_Veiledning: string;
  /**
   * Behandling hos mottaker
   */
  sidebarSectionHeader_BehandlingMottaker: string;
  /**
   * Hvis du ikke vil logge inn på Helsenorge, kan du skrive ut denne versjonen i stedet: {0}.
   */
  sidebarSectionText_Alternativer_LoggInn: string;
  /**
   * Hvis du vil fylle ut skjemaet på vegne av andre, må du først velge hvem du vil representere
   */
  sidebarSectionText_Alternativer_Representasjon: string;
  /**
   * Ta kontakt med Veiledning Helsenorge på telefon 23 32 70 00 hvis du har spørsmål om hvordan du bruker Helsenorge.
   */
  sidebarSectionText_Veiledning_KontaktHelsenorge: string;
  /**
   * Når du har sendt inn skjemaet, finner du en kopi av den sendte meldingen i innboksen din. Dette er din egen kopi, som du kan slette når du vil. I tillegg lagrer Helsenorge normalt en kopi av skjemaet også i Dokumenter. Dette dokumentet kan du slette, eller skjule for den du eventuelt har gitt fullmakt.
   */
  sidebarSectionText_Veiledning_LagringInnboks: string;
  /**
   * Når du fullfører skjemautfyllingen, lagres det utfylte skjemaet i Dokumenter. Dette dokumentet kan du slette, eller skjule for den du eventuelt har gitt fullmakt.
   */
  sidebarSectionText_Veiledning_LagringDokument: string;
  /**
   * Alternativt kan du fylle ut på papir, klikk på {omSkjemaLink} for å få vite mer.
   */
  message_printVersionAvailable: string;
  /**
   * Klikk på {omSkjemaLink} hvis du har spørsmål eller ønsker å fylle ut på vegne av andre enn deg selv. Her finner du informasjon om hvor du kan henvende deg og hvordan opplysningene du oppgir vil bli behandlet.
   */
  message_canRepresentOthers: string;
  /**
   * Klikk på {omSkjemaLink} hvis du har spørsmål. Her finner du informasjon om hvor du kan henvende deg og hvordan opplysningene du oppgir vil bli behandlet.
   */
  message_canNotRepresentOthers: string;
  /**
   * Du har ikke tilgang til å fylle ut dette skjemaet. Hvis det skyldes at du ikke har rett samtykke, kan du gå til {personverninnstillingerLink} på Helsenorge.
   */
  message_noAccessToTjeneste: string;
  /**
   * Teknisk feil
   */
  uploadFileError: string;
  /**
   * mer informasjon om skjema
   */
  hjelpeknapp_ariaLabel: string;
  /**
   * Innsendt skjema
   */
  skjemaTittelVedDiscretion: string;
  /**
   * Gå videre
   */
  formProceed: string;
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
   * Kan ikke lagre skjema
   */
  kanIkkeLagreErrorTitle: string;
  /**
   * Valgene du har tatt i skjema tilsier ikke at skjema trenger å lagres.
   */
  kanIkkeLagreErrorBody: string;
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
   * Vedlegg fra en tidligere lagret versjon blir ikke automatisk lagt til dette skjemaet. Ønsker du å bruke et vedlegg fra et tidligere skjema, må du legge det inn på nytt.
   */
  message_skjemaHaddeVedlegg: string;
  /**
   * Flervalg
   */
  flervalg_tekst: string;
  /**
   * Du har blitt logget ut
   */
  loggetut_feil_tittel: string;
  /**
   * Du kan ikke fylle ut dette skjemaet fordi du har adressesperre.
   */
  harIkkeTilgang_sperretadresse: string;
  /**
   * Du må utvide din bruk av Helsenorge for å kunne fylle ut dette skjemaet.
Gå til {personverninnstillingerLink} på Helsenorge for å endre samtykkenivå.
   */
  harIkkeTilgang_scop_segselv: string;
  /**
   * Fullmakten din gir ikke tilgang til å fylle ut dette skjemaet.
   */
  harIkkeTilgang_scop_fullmakt: string;
  /**
   * Dette skjemaet kan kun fylles ut av den du representerer.
   */
  harIkkeTilgang_skjema_kunInnbygger: string;
  /**
   * Du har ikke tilgang til å fylle ut skjema på vegne av barnet ditt.
   */
  harIkkeTilgang_skjema_paVegnAvBarn: string;
  /**
   * Du har ikke tilgang til å fylle ut skjema på vegne av barnet ditt.
   */
  harIkkeTilgang_skjema_paVegnAvBarnUnder12: string;
  /**
   * Du har ikke tilgang til å fylle ut skjema på vegne av barnet ditt.
   */
  harIkkeTilgang_skjema_paVegnAvBarnMellom12Og16: string;
  /**
   * Fullmakten din gir ikke tilgang til å fylle ut dette skjemaet.
   */
  harIkkeTilgang_skjema_kanIkkeFullmakt: string;
  /**
   * Du har ikke tilgang til å fylle ut disse opplysningene.
   */
  harIkkeTilgang_default: string;
  /**
   * Spørsmålene i dette skjemaet har blitt endret etter at du startet på det, du må derfor fylle ut skjemaet på nytt.
   */
  kan_ikke_autofylle_skjema: string;
  /**
   * tegn
   */
  maxCharactersText: string;
  /**
   * Du kan ikke fylle ut dette skjemaet fordi du er under 16 år.
   */
  harikkeTilgang_skjema_ungdom: string;
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
   * Tilbake
   */
  microwebstep_navigasjon_tilbake_button: string;
  /**
   * Neste
   */
  microwebstep_navigasjon_neste_button: string;
  /**
   * Avbryt
   */
  microwebstep_navigasjon_avbryt_button: string;
  /**
   * Send svar
   */
  formSend_skjema_i_oppgave: string;
  /**
   * Minst {0} fil(er) og maks {1} fil(er) er tillatt
   */
  attachmentError_minFiles_and_maxFiles: string;
  /**
   * Oppgi i
   */
  quantity_unit_sublabel: string;
  /**
   * Du kan ikke laste opp flere enn {0} vedlegg til dette skjema
   */
  attachment_max_occurrences: string;
  /**
   * Du kan kun laste opp filer av typen {0} til dette skjema
   */
  attachmentError_wrong_file_type: string;
  /**
   * Total filstørrelse må være mindre enn {0}MB
   */
  attachmentError_fileSize_total: string;
  /**
   * Du kan ikke laste opp flere enn {0} vedlegg på dette feltet {1}
   */
  attachment_max_occurrences_single_file: string;
  /**
   * Du må minst laste opp {0} vedlegg på dette feltet {1}
   */
  attachment_min_occurrences_single_file: string;
  /**
   * Du kan fortsette å fylle ut skjemaet eller slette det fra Dokumenter
   */
  autolagering_tekst: string;
  /**
   * Du ble automatisk logget ut idet du fylte ut et skjema
   */
  autolagering_emne: string;
  /**
   * Valgt
   */
  valgt_tekst: string;
  /**
   * Alternativer
   */
  alternativer_tekst: string;
}
