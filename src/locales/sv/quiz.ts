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
