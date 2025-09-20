export const quizResult = {
  loading: 'Laddar resultat...',
  noResult: {
    title: 'Inga resultat hittades',
    description: 'Det gick inte att hitta resultat för detta quiz.'
  },
  header: {
    title: 'Quiz slutfört!',
    subtitle: 'Tack för ditt deltagande. Dina svar har sparats.'
  },
  summary: {
    title: 'Sammanfattning',
    answered: 'Besvarade frågor',
    totalTime: 'Total tid',
    completedAt: 'Slutförd'
  },
  feedback: {
    title: 'Vad händer nu?',
    description:
      'Din lärare kommer att granska dina svar och ge feedback. Resultat och bedömning kommer att delas med dig senare.'
  },
  gdpr: {
    shortTermNote:
      'Dina svar sparas tillfälligt enligt GDPR-regler. Långtidslagring kräver samtycke från skolan.',
    notice:
      'Dina personuppgifter hanteras enligt GDPR. Kontakta din lärare för frågor om datahantering.'
  },
  actions: {
    joinNewQuiz: 'Gå med i nytt quiz'
  }
}

export const liveSession = {
  create: {
    title: 'Starta live-session',
    description: 'Skapa en realtidssession där elever svarar samtidigt',
    selectClass: 'Välj klass',
    selectQuiz: 'Välj quiz',
    mode: {
      label: 'Sessiontyp',
      sync: 'Live (Realtid)',
      syncDescription: 'Du styr quizet fråga för fråga. Alla elever följer samma takt.',
      async: 'Självgående',
      asyncDescription: 'Elever svarar i egen takt. Du kan följa upp resultat efteråt.'
    },
    gdpr: {
      title: 'Datahantering',
      korttid: 'Korttidsläge',
      korttidDescription: 'Data raderas automatiskt efter sessionen. Kräver inget samtycke.',
      langtid: 'Långtidsläge', 
      langtidDescription: 'Data sparas permanent för analys. Kräver elevernas samtycke.',
      note: 'Kontrollera att elevernas vårdnadshavare har lämnat samtycke innan du väljer Långtidsläge.'
    }
  },
  lobby: {
    title: 'Väntar på deltagare',
    code: 'Sessionskod',
    qrCode: 'QR-kod',
    shareLink: 'Dela länk',
    participants: 'Deltagare online',
    instructions: {
      title: 'Så här fungerar det:',
      items: [
        'Du får en unik 6-teckens kod och QR-kod',
        'Elever kan gå med via kod eller genom att skanna QR-koden',
        'Du ser alla som går med i realtid',
        'Du kontrollerar när varje fråga startar och avslutas'
      ]
    },
    actions: {
      start: 'Starta session',
      cancel: 'Avbryt'
    }
  },
  teacher: {
    title: 'Lärarpanel - Live Quiz',
    status: {
      live: 'Live',
      ended: 'Avslutad',
      paused: 'Pausad'
    },
    controls: {
      pause: 'Pausa',
      resume: 'Fortsätt',
      next: 'Nästa fråga',
      previous: 'Föregående fråga',
      lock: 'Lås svar',
      unlock: 'Öppna för svar',
      reveal: 'Visa rätt svar',
      end: 'Avsluta session'
    },
    participants: {
      title: 'Deltagare online',
      count: '{count} deltagare',
      answered: '{answered} har svarat',
      waiting: 'Väntar på svar...'
    },
    question: {
      title: 'Aktiv fråga',
      progress: 'Fråga {current} av {total}',
      responses: 'Svar mottagna: {count}'
    },
    results: {
      title: 'Svarfördelning',
      correct: 'Rätt: {count}',
      incorrect: 'Fel: {count}',
      percentage: '{percentage}% rätt'
    },
    confirm: {
      end: {
        title: 'Avsluta session?',
        message: 'Detta kommer att avsluta sessionen för alla deltagare. Är du säker?',
        confirm: 'Ja, avsluta',
        cancel: 'Avbryt'
      }
    }
  },
  student: {
    join: {
      title: 'Gå med i quiz',
      codeLabel: 'Sessionskod',
      codePlaceholder: 'Ange 6-teckens kod',
      nameLabel: 'Ditt namn',
      namePlaceholder: 'Vad vill du kallas?',
      gdprNotice: {
        korttid: 'Dina svar sparas tillfälligt och raderas efter sessionen.',
        langtid: 'Dina svar sparas permanent. Kontakta din lärare för mer information om datahantering.'
      },
      submit: 'Gå med'
    },
    play: {
      waiting: 'Väntar på att frågan ska startas...',
      timeLeft: 'Tid kvar: {time}',
      locked: 'Svar är låsta',
      submitted: 'Svar skickat!',
      nextQuestion: 'Väntar på nästa fråga...',
      ended: 'Sessionen är avslutad'
    },
    answer: {
      submit: 'Skicka svar',
      change: 'Ändra svar',
      confirm: 'Bekräfta svar',
      submitted: 'Ditt svar har skickats'
    }
  },
  errors: {
    sessionNotFound: 'Session hittades inte. Kontrollera att koden är korrekt.',
    sessionEnded: 'Denna session har avslutats.',
    sessionFull: 'Sessionen är full.',
    alreadyJoined: 'Du har redan gått med i denna session.',
    invalidCode: 'Ogiltig sessionskod.',
    rateLimited: 'Du svarar för snabbt. Vänta ett ögonblick.',
    alreadyAnswered: 'Du har redan svarat på denna fråga.',
    answerWhileLocked: 'Svar är för närvarande låsta.',
    sessionNotActive: 'Sessionen är inte aktiv.',
    noPermission: 'Du har inte behörighet att utföra denna åtgärd.'
  },
  status: {
    participantJoined: '{name} gick med',
    participantLeft: '{name} lämnade',
    questionChanged: 'Ny fråga: {title}',
    responsesLocked: 'Svar är nu låsta',
    responsesUnlocked: 'Svar är nu öppna',
    sessionEnded: 'Sessionen avslutades',
    answersRevealed: 'Rätta svar visas nu'
  }
}

export const aiAssistant = {
  modal: {
    title: 'AI Quiz-assistent',
    description: 'Generera frågor automatiskt baserat på dina inställningar',
    closeLabel: 'Stäng AI-assistent'
  },
  disclaimer: {
    title: 'Dubbelkolla alltid innehållet. AI kan ha fel.',
    description: 'Granska frågorna noga innan du lägger till dem i ditt quiz. Se till att de passar din undervisning och elevernas nivå.'
  },
  hints: {
    titleSuggestions: {
      button: 'Föreslå titel & lärandemål',
      ariaLabel: 'Få AI-förslag på quiz-titel och lärandemål',
      tooltip: 'AI föreslår titel och lärandemål baserat på ämne och årskurs',
      loading: 'Föreslår titel och lärandemål...',
      error: 'Kunde inte generera förslag',
      diffTitle: 'Titel och lärandemål - förslag',
      diffDescription: 'Granska AI-förslagen och välj vad du vill använda'
    },
    simplifyText: {
      button: 'Förenkla svenska',
      ariaLabel: 'Förenkla text med AI',
      tooltip: 'Gör texten enklare att förstå för eleverna',
      loading: 'Förenklar texten...',
      error: 'Kunde inte förenkla texten'
    },
    varyDifficulty: {
      button: 'Variera svårighetsgrad',
      ariaLabel: 'Skapa varianter med olika svårighetsgrad',
      tooltip: 'Få förslag på samma fråga i olika svårighetsgrader',
      loading: 'Skapar svårighetsvariationer...',
      error: 'Kunde inte skapa variationer'
    },
    improveClarity: {
      button: 'Förbättra tydlighet',
      ariaLabel: 'Förbättra frågans tydlighet med AI',
      tooltip: 'Gör frågan tydligare och lättare att förstå',
      loading: 'Förbättrar frågan...',
      error: 'Kunde inte förbättra frågan'
    },
    generateAnswers: {
      button: 'Generera svarsalternativ',
      ariaLabel: 'Låt AI generera svarsalternativ',
      tooltip: 'Skapa svarsalternativ automatiskt för flervalsfrågor',
      loading: 'Genererar svarsalternativ...',
      error: 'Kunde inte generera svarsalternativ'
    },
    diff: {
      beforeLabel: 'Innan',
      afterLabel: 'Efter',
      improvementsLabel: 'Förbättringar',
      actionsTitle: 'Vad vill du göra?',
      insertButton: 'Infoga',
      replaceButton: 'Ersätt',
      cancelButton: 'Avbryt',
      insertTooltip: 'Lägg till som ny text',
      replaceTooltip: 'Ersätt befintlig text',
      cancelTooltip: 'Kassera förslaget'
    },
    featureDisabled: {
      message: 'AI ej aktiverad',
      tooltip: 'AI-funktioner är inte tillgängliga. Kontakta administratör.',
      upgradeMessage: 'AI-funktioner kräver en aktiv prenumeration.'
    }
  },
  form: {
    subject: {
      label: 'Ämne',
      placeholder: 'Välj ämne',
      help: 'Välj det ämne som frågorna ska handla om'
    },
    grade: {
      label: 'Årskurs',
      placeholder: 'Välj årskurs',
      help: 'Välj målgrupp för att anpassa frågors svårighetsgrad'
    },
    count: {
      label: 'Antal frågor',
      help: 'Mellan 1-10 frågor (standard: 5)'
    },
    type: {
      label: 'Frågetyp',
      help: 'Välj typ av frågor som ska genereras'
    },
    difficulty: {
      label: 'Svårighetsgrad',
      help: 'Anpassa svårighetsgraden till din grupp'
    },
    topics: {
      label: 'Specifika områden (valfritt)',
      placeholder: 't.ex. multiplikationstabeller, fraktioner, geometri',
      help: 'Separera med kommatecken för att specificera vad frågorna ska fokusera på'
    },
    context: {
      label: 'Extra kontext (valfritt)',
      placeholder: 'Beskriv eventuella speciella krav eller fokus för frågorna...',
      help: 'Lägg till extra information för att förbättra AI-genereringen'
    }
  },
  actions: {
    generate: 'Generera',
    tryAgain: 'Försök igen',
    generateNew: 'Generera nya',
    addSelected: 'Lägg till valda',
    selectAll: 'Välj alla',
    selectNone: 'Välj ingen',
    edit: 'Redigera',
    delete: 'Ta bort',
    copyError: 'Kopiera felinfo'
  },
  states: {
    generating: 'Genererar {count} frågor...',
    generatingDescription: 'AI:n skapar frågor baserat på {subject} för {grade}',
    errorTitle: 'Något gick fel',
    errorTechnical: 'Teknisk information:',
    previewTitle: 'AI-genererade frågor ({count})',
    previewDescription: 'Välj vilka frågor du vill lägga till',
    selectedCount: '{selected} av {total} frågor valda',
    copied: 'Kopierat'
  },
  subjects: [
    'Matematik', 'Svenska', 'Engelska', 'Naturkunskap', 'Biologi', 'Fysik', 'Kemi',
    'Historia', 'Geografi', 'Samhällskunskap', 'Teknik', 'Slöjd', 'Bild', 'Musik', 'Idrott och hälsa'
  ]
}
