/* content.js — Kurs-Inhalte, Rhythmus-Bibliothek und Ableitungs-Daten.
   Definiert das globale Objekt `CONTENT`. */
(function (global) {
  'use strict';

  /* ======================================================================
     LERNPFAD
     ====================================================================== */

  const UNITS = [

  /* ------------------------------------------------ Einheit 1: Grundlagen */
  {
    id: 'u1', title: 'EKG-Grundlagen', icon: '💡',
    sub: 'Was das Gerät misst — und was nicht',
    color: '#12b3a6', dark: '#0a8d83', light: '#e2f7f5',
    lessons: [

    { id: 'l1_1', title: 'Was ist ein EKG?', icon: '📈', steps: [
      { t: 'teach',
        h: 'Das EKG misst Spannung — keine Pumpleistung',
        lead: 'Ein Elektrokardiogramm zeichnet die elektrischen Ströme auf, die bei jeder Herzaktion durch den Körper laufen. Die Elektroden auf der Haut messen winzige Spannungsunterschiede im Bereich von Millivolt.',
        media: { k: 'scope', rhythm: 'sinus', h: 'md', label: 'Sinusrhythmus, 70/min' },
        bullets: [
          { i: '⚡', x: '<b>Elektrik, nicht Mechanik:</b> Das EKG zeigt die Erregung des Herzmuskels — nicht, ob das Herz tatsächlich Blut auswirft.' },
          { i: '🩺', x: '<b>Deshalb gilt:</b> Immer den Patienten untersuchen, nicht nur den Monitor. Ein scheinbar normales EKG ohne Puls ist eine <b>pulslose elektrische Aktivität</b> — ein Reanimationsgrund.' },
          { i: '📄', x: '<b>Standard:</b> 12 Ableitungen, aufgezeichnet auf Millimeterpapier mit 50 mm/s (in Deutschland üblich) oder 25 mm/s.' }
        ],
        key: { h: 'Merksatz', p: 'Das EKG ist ein Spannungsmessgerät. Es beantwortet die Frage „Wie wird das Herz erregt?" — nicht die Frage „Wie gut pumpt es?"' }
      },
      { t: 'mc',
        q: 'Was zeichnet ein EKG auf?',
        opts: [
          'Die Pumpleistung des Herzens',
          'Elektrische Spannungsänderungen bei der Herzerregung',
          'Den Blutdruck in den Herzkammern',
          'Die Sauerstoffsättigung des Blutes'
        ], a: 1,
        why: 'Das EKG misst ausschließlich elektrische Potenzialdifferenzen an der Körperoberfläche. Über die mechanische Auswurfleistung sagt es direkt nichts aus.'
      },
      { t: 'tf',
        q: 'Ein EKG mit normal aussehenden Komplexen beweist, dass das Herz Blut auswirft.',
        a: false,
        why: 'Nein. Bei der pulslosen elektrischen Aktivität (PEA) läuft die Erregung normal, die Pumpfunktion fehlt aber. Deshalb gehört zur Beurteilung immer die Pulskontrolle.'
      },
      { t: 'mc',
        q: 'Wofür wird ein EKG typischerweise eingesetzt?',
        opts: [
          'Nur zur Diagnose eines Herzinfarkts',
          'Ausschließlich zur Kontrolle von Schrittmachern',
          'Rhythmus, Erregungsausbreitung, Ischämie, Elektrolytstörungen und Medikamentenwirkung',
          'Zur Messung der Herzgröße'
        ], a: 2,
        why: 'Das EKG ist ein Vielzweck-Werkzeug: Es zeigt Rhythmusstörungen, Leitungsblockaden, Ischämiezeichen, Elektrolyteffekte und Medikamentenwirkungen wie die von Digitalis.'
      },
      { t: 'mc',
        q: 'Welche Papiergeschwindigkeit ist in Deutschland am gebräuchlichsten?',
        opts: ['10 mm/s', '25 mm/s', '50 mm/s', '100 mm/s'], a: 2,
        why: 'In Deutschland wird meist mit 50 mm/s geschrieben, international häufiger mit 25 mm/s. Prüfe deshalb immer zuerst den Aufdruck auf dem Streifen — sonst verrechnest du dich um den Faktor 2.'
      }
    ]},

    { id: 'l1_2', title: 'Erregungsleitung', icon: '🫀', steps: [
      { t: 'teach',
        h: 'Der Weg der Erregung durch das Herz',
        lead: 'Jeder Herzschlag beginnt im Sinusknoten und läuft über ein festes Leitungssystem bis in die Kammermuskulatur. Schau der Erregung einmal zu — jede Phase erzeugt einen eigenen Abschnitt im EKG.',
        media: { k: 'heart' },
        bullets: [
          { i: '1️⃣', x: '<b>Sinusknoten</b> im rechten Vorhof: primärer Schrittmacher, 60–100/min.' },
          { i: '2️⃣', x: '<b>Vorhöfe</b> werden erregt → das ergibt die <b>P-Welle</b>.' },
          { i: '3️⃣', x: '<b>AV-Knoten</b> bremst die Erregung absichtlich ab → <b>PQ-Strecke</b>. Diese Verzögerung lässt die Kammern sich füllen.' },
          { i: '4️⃣', x: '<b>His-Bündel</b> und die beiden <b>Tawara-Schenkel</b> leiten schnell weiter.' },
          { i: '5️⃣', x: '<b>Purkinje-Fasern</b> erregen die Kammermuskulatur → <b>QRS-Komplex</b>.' }
        ],
        key: { h: 'Ersatzschrittmacher', p: 'Fällt der Sinusknoten aus, springt der AV-Knoten mit 40–60/min ein. Fällt auch der aus, übernimmt ein Kammerzentrum mit nur 20–40/min — je tiefer der Ursprung, desto langsamer und unzuverlässiger.' }
      },
      { t: 'order',
        q: 'Bringe den Weg der Erregung in die richtige Reihenfolge.',
        items: ['Sinusknoten', 'Vorhofmuskulatur', 'AV-Knoten', 'His-Bündel', 'Tawara-Schenkel', 'Purkinje-Fasern'],
        why: 'Sinusknoten → Vorhöfe → AV-Knoten → His-Bündel → Tawara-Schenkel → Purkinje-Fasern. Nur über diesen Weg werden beide Kammern gleichzeitig und schnell erregt.'
      },
      { t: 'mc',
        q: 'Warum verzögert der AV-Knoten die Erregung um etwa 0,1 Sekunden?',
        opts: [
          'Damit sich die Vorhöfe entspannen können',
          'Damit die Kammern Zeit haben, sich mit Blut zu füllen',
          'Um Energie zu sparen',
          'Um die Herzfrequenz zu erhöhen'
        ], a: 1,
        why: 'Die Verzögerung sorgt dafür, dass die Vorhofkontraktion abgeschlossen ist, bevor sich die Kammern zusammenziehen. So werden die Kammern optimal gefüllt.'
      },
      { t: 'num',
        q: 'Mit welcher Frequenz feuert ein gesunder Sinusknoten mindestens? (untere Normgrenze)',
        a: 60, tol: 0, unit: '/min',
        why: 'Der normale Sinusrhythmus liegt bei 60–100/min. Darunter spricht man von Sinusbradykardie, darüber von Sinustachykardie.'
      },
      { t: 'match',
        q: 'Ordne die Strukturen ihrer Eigenfrequenz zu.',
        pairs: [
          ['Sinusknoten', '60–100/min'],
          ['AV-Knoten', '40–60/min'],
          ['Kammerzentrum', '20–40/min']
        ],
        why: 'Das ist die Hierarchie der Schrittmacher. Je weiter unten das Zentrum sitzt, desto langsamer schlägt es — deshalb ist ein Kammerersatzrhythmus immer kritisch.'
      },
      { t: 'tf',
        q: 'Der AV-Knoten ist beim gesunden Herzen der Taktgeber.',
        a: false,
        why: 'Beim Gesunden gibt der Sinusknoten den Takt vor, weil er am schnellsten feuert. Der AV-Knoten ist nur der Ersatzschrittmacher.'
      }
    ]},

    { id: 'l1_3', title: 'Elektroden & Ableitungen', icon: '🔌', steps: [
      { t: 'teach',
        h: '12 Ableitungen, 12 Blickwinkel',
        lead: 'Ein Standard-EKG hat 12 Ableitungen. Jede schaut aus einer anderen Richtung auf das Herz — wie 12 Kameras rund um ein Objekt. Nur so lässt sich später sagen, <em>wo</em> ein Problem sitzt.',
        bullets: [
          { i: '📐', x: '<b>Einthoven (bipolar):</b> I, II, III — messen zwischen zwei Extremitäten.' },
          { i: '📏', x: '<b>Goldberger (unipolar):</b> aVR, aVL, aVF — messen gegen einen gemittelten Bezugspunkt.' },
          { i: '🎯', x: '<b>Wilson (Brustwand):</b> V1–V6 — schauen in der horizontalen Ebene auf das Herz.' },
          { i: '🚦', x: '<b>Elektrodenfarben:</b> rot = rechter Arm, gelb = linker Arm, grün = linker Fuß, schwarz = rechter Fuß. Merksatz: „<b>Ampel im Uhrzeigersinn</b>", schwarz bleibt übrig.' }
        ],
        key: { h: 'Extremitäten vs. Brustwand', p: 'Die 6 Extremitätenableitungen (I, II, III, aVR, aVL, aVF) zeigen die <b>Frontalebene</b> — von oben/unten und links/rechts. Die 6 Brustwandableitungen (V1–V6) zeigen die <b>Horizontalebene</b> — von vorne/hinten.' }
      },
      { t: 'match',
        q: 'Ordne die Elektrodenfarbe der richtigen Position zu.',
        pairs: [
          ['Rot', 'Rechter Arm'],
          ['Gelb', 'Linker Arm'],
          ['Grün', 'Linker Fuß'],
          ['Schwarz', 'Rechter Fuß']
        ],
        why: 'Merksatz „Ampel im Uhrzeigersinn": Beginne rechts oben mit Rot, dann im Uhrzeigersinn Gelb und Grün. Schwarz ist die neutrale Erdungselektrode am rechten Fuß.'
      },
      { t: 'multi',
        q: 'Welche Ableitungen gehören zu den Extremitätenableitungen? (mehrere richtig)',
        opts: ['I, II, III', 'V1–V6', 'aVR, aVL, aVF', 'V7–V9'],
        a: [0, 2],
        why: 'Die Extremitätenableitungen sind Einthoven (I, II, III) und Goldberger (aVR, aVL, aVF) — zusammen 6 Stück. V1–V6 sind Brustwandableitungen, V7–V9 sind Zusatzableitungen für die Hinterwand.'
      },
      { t: 'mc',
        q: 'Wo wird die Elektrode V4 geklebt?',
        opts: [
          '4. ICR rechts parasternal',
          '5. ICR linke Medioklavikularlinie',
          '5. ICR vordere Axillarlinie',
          '4. ICR links parasternal'
        ], a: 1,
        why: 'V1 = 4. ICR rechts parasternal, V2 = 4. ICR links parasternal, V3 = zwischen V2 und V4, V4 = 5. ICR Medioklavikularlinie, V5 = vordere Axillarlinie in Höhe V4, V6 = mittlere Axillarlinie in Höhe V4.'
      },
      { t: 'mc',
        q: 'Welche Ebene bilden die Brustwandableitungen V1–V6 ab?',
        opts: ['Frontalebene', 'Horizontalebene', 'Sagittalebene', 'Keine — sie sind reine Kontrollableitungen'], a: 1,
        why: 'V1–V6 liegen in einer waagerechten Ebene um den Brustkorb und zeigen das Herz von vorn nach hinten. Die Extremitätenableitungen bilden dagegen die Frontalebene ab.'
      },
      { t: 'tf',
        q: 'In aVR ist beim gesunden Herzen der QRS-Komplex normalerweise negativ.',
        a: true,
        why: 'aVR schaut von rechts oben auf das Herz — genau entgegen der normalen Erregungsrichtung. Ein positiver QRS in aVR ist ein klassischer Hinweis auf vertauschte Elektroden.'
      }
    ]}
    ]
  },

  /* ------------------------------------------- Einheit 2: Die EKG-Kurve */
  {
    id: 'u2', title: 'Die Kurve lesen', icon: '📊',
    sub: 'P, QRS, T — und alles dazwischen',
    color: '#7c5cff', dark: '#5c3fd4', light: '#eee9ff',
    lessons: [

    { id: 'l2_1', title: 'P, QRS und T', icon: '🔤', steps: [
      { t: 'teach',
        h: 'Die drei Bausteine jedes Herzschlags',
        lead: 'Jeder normale Herzschlag hinterlässt dieselben drei Ausschläge. Wenn du sie sicher erkennst, kannst du fast jedes EKG systematisch aufdröseln.',
        media: { k: 'beat', tpl: {}, pq: 0.16 },
        bullets: [
          { i: '🌊', x: '<b>P-Welle:</b> Erregung der Vorhöfe. Klein und rund, unter 0,11 s breit und unter 0,25 mV hoch.' },
          { i: '⛰️', x: '<b>QRS-Komplex:</b> Erregung der Kammern. Schmal und hoch, normal unter 0,10 s.' },
          { i: '🏔️', x: '<b>T-Welle:</b> Erregungs<em>rück</em>bildung der Kammern. Breiter und flacher als der QRS, meist in dieselbe Richtung wie er.' }
        ],
        key: { h: 'Und die Vorhöfe?', p: 'Die Erregungsrückbildung der Vorhöfe fällt zeitlich in den QRS-Komplex — sie wird von dessen viel größerem Ausschlag komplett verdeckt. Deshalb siehst du im EKG keine eigene „Vorhof-T-Welle".' }
      },
      { t: 'label', q: 'Tippe auf die <b>P-Welle</b>.', target: 'p',
        why: 'Die P-Welle ist der erste kleine, runde Ausschlag vor dem QRS-Komplex. Sie zeigt die Erregung der Vorhöfe.' },
      { t: 'label', q: 'Tippe auf den <b>QRS-Komplex</b>.', target: 'qrs',
        why: 'Der QRS-Komplex ist der schmale, hohe Ausschlag. Er entsteht durch die Erregung der Kammermuskulatur.' },
      { t: 'label', q: 'Tippe auf die <b>T-Welle</b>.', target: 't',
        why: 'Die T-Welle folgt nach der ST-Strecke. Sie ist breiter und flacher als der QRS-Komplex und zeigt die Erregungsrückbildung der Kammern.' },
      { t: 'mc',
        q: 'Welcher Vorgang erzeugt den QRS-Komplex?',
        opts: [
          'Erregung der Vorhöfe',
          'Erregung der Kammern',
          'Rückbildung der Kammererregung',
          'Die Verzögerung im AV-Knoten'
        ], a: 1,
        why: 'Der QRS-Komplex entsteht durch die Depolarisation (Erregung) der Kammermuskulatur. Die Rückbildung ist die T-Welle.'
      },
      { t: 'mc',
        q: 'Warum sieht man im EKG keine eigene Welle für die Erregungsrückbildung der Vorhöfe?',
        opts: [
          'Weil die Vorhöfe sich nicht zurückbilden',
          'Weil sie zeitgleich mit dem viel größeren QRS-Komplex auftritt',
          'Weil sie zu schnell abläuft',
          'Weil das EKG dafür nicht empfindlich genug ist'
        ], a: 1,
        why: 'Sie fällt in den QRS-Komplex hinein und geht in dessen Amplitude unter. Man nennt sie Ta-Welle — sichtbar wird sie nur in Ausnahmefällen, etwa bei einem AV-Block III°.'
      },
      { t: 'tf',
        q: 'Die T-Welle zeigt normalerweise in dieselbe Richtung wie der QRS-Komplex.',
        a: true,
        why: 'Das nennt man konkordant. Zeigt die T-Welle entgegengesetzt (diskordant), kann das auf einen Schenkelblock, eine Ischämie oder eine Kammererregung hinweisen.'
      }
    ]},

    { id: 'l2_1b', title: 'Zacken benennen', icon: '🔠', steps: [
      { t: 'teach',
        h: 'Q, R, S — die Namen folgen einer Regel',
        lead: 'Der QRS-Komplex sieht nicht in jeder Ableitung gleich aus. Damit trotzdem alle dasselbe meinen, gibt es eine feste Benennung. Sie richtet sich allein danach, <em>ob</em> ein Ausschlag nach oben oder unten geht — und <em>wann</em> er kommt.',
        media: { k: 'leads', set: 'nomenklatur' },
        bullets: [
          { i: '⬆️', x: '<b>R-Zacke:</b> jeder Ausschlag <b>nach oben</b> (positiv).' },
          { i: '⬇️', x: '<b>Q-Zacke:</b> ein Ausschlag <b>nach unten vor</b> der ersten R-Zacke.' },
          { i: '⬇️', x: '<b>S-Zacke:</b> ein Ausschlag <b>nach unten nach</b> einer R-Zacke.' },
          { i: '🔡', x: '<b>Groß oder klein:</b> Großbuchstaben für kräftige Ausschläge (ab etwa 5 mm), Kleinbuchstaben für kleine. Aus „kleines q, großes R, kleines s" wird <b>qRs</b>.' },
          { i: '➖', x: '<b>QS-Komplex:</b> ein einziger, komplett negativer Ausschlag ohne jede positive Zacke.' },
          { i: '2️⃣', x: '<b>R\' (R-Strich):</b> eine <b>zweite</b> positive Zacke. Das <b>rSR\'</b> in V1 ist das Erkennungszeichen des Rechtsschenkelblocks.' }
        ],
        key: { h: 'Warum das zählt', p: 'Befunde werden in dieser Sprache geschrieben. „rSR\' in V1" oder „QS in V1–V3" ist keine Geheimschrift, sondern eine exakte Formbeschreibung — wer sie liest, sieht die Kurve vor sich.' }
      },
      { t: 'mc',
        q: 'Wie heißt ein Ausschlag nach unten, der <b>vor</b> der ersten positiven Zacke liegt?',
        opts: ['S-Zacke', 'Q-Zacke', 'R-Zacke', 'T-Welle'], a: 1,
        why: 'Eine negative Zacke vor der ersten positiven ist per Definition die Q-Zacke. Kommt sie erst nach einer R-Zacke, heißt sie S-Zacke.'
      },
      { t: 'mc',
        q: 'Der QRS-Komplex besteht aus einem einzigen tiefen Ausschlag nach unten. Wie heißt diese Form?',
        opts: ['rS-Komplex', 'QS-Komplex', 'qR-Komplex', 'rSR\'-Komplex'], a: 1,
        why: 'Fehlt jede positive Zacke, spricht man von einem QS-Komplex. In V1 kann er noch eine Normvariante sein — in V2 bis V4 ist er verdächtig auf einen abgelaufenen Vorderwandinfarkt.'
      },
      { t: 'match',
        q: 'Ordne die Schreibweise ihrer Bedeutung zu.',
        pairs: [
          ['qRs', 'Kleines Q, großes R, kleines S'],
          ['rS', 'Kleines R, tiefes S'],
          ['QS', 'Nur ein negativer Ausschlag'],
          ['rSR\'', 'Zweite positive Zacke — M-Form']
        ],
        why: 'Groß- und Kleinschreibung geben die Größe wieder, die Buchstabenfolge die Reihenfolge. Damit lässt sich jede QRS-Form in drei bis vier Zeichen beschreiben.'
      },
      { t: 'tf',
        q: 'Die Buchstaben Q, R und S sagen etwas über die Richtung des Ausschlags aus, nicht über seine Ursache.',
        a: true,
        why: 'Richtig. Die Benennung ist rein beschreibend. Ob eine Q-Zacke harmlos oder Infarktzeichen ist, entscheidet erst ihre Breite und Tiefe — nicht ihr Name.'
      },
      { t: 'mc',
        q: 'In V1 findest du eine kleine positive Zacke, dann eine negative, dann eine große positive. Wie schreibt man das?',
        opts: ['qRs', 'rSR\'', 'QS', 'Rs'], a: 1,
        why: 'Klein positiv (r), negativ (S), groß positiv (R\') ergibt rSR\' — die klassische M-Form des Rechtsschenkelblocks in V1.'
      }
    ]},

    { id: 'l2_2', title: 'Strecken & Intervalle', icon: '📐', steps: [
      { t: 'teach',
        h: 'Zwischen den Wellen wird gemessen',
        lead: 'Eine <b>Strecke</b> liegt zwischen zwei Wellen. Ein <b>Intervall</b> schließt eine Welle mit ein. Diese Unterscheidung ist keine Wortklauberei — sie bestimmt, wo du das Lineal ansetzt.',
        media: { k: 'beat', tpl: {}, pq: 0.16 },
        bullets: [
          { i: '📏', x: '<b>PQ-Intervall (PQ-Zeit):</b> Vom Beginn der P-Welle bis zum Beginn des QRS. Normal <b>0,12–0,20 s</b>. Zu lang = AV-Block.' },
          { i: '➖', x: '<b>PQ-Strecke:</b> Vom Ende der P-Welle bis zum QRS-Beginn — die „Wartezeit" im AV-Knoten.' },
          { i: '〰️', x: '<b>ST-Strecke:</b> Vom Ende des QRS (J-Punkt) bis zum Beginn der T-Welle. Sollte auf Höhe der Nulllinie liegen. Hebung oder Senkung = Alarmzeichen.' },
          { i: '⏱️', x: '<b>QT-Intervall:</b> Vom QRS-Beginn bis zum Ende der T-Welle. Es ist frequenzabhängig und wird deshalb als QTc korrigiert.' }
        ],
        table: [
          ['P-Welle', '< 0,11 s', '< 0,25 mV'],
          ['PQ-Zeit', '0,12–0,20 s', '—'],
          ['QRS-Komplex', '< 0,10 s', '—'],
          ['QTc', '< 0,44 s (♂) / 0,46 s (♀)', '—']
        ]
      },
      { t: 'label', q: 'Tippe auf die <b>ST-Strecke</b>.', target: 'st',
        why: 'Die ST-Strecke liegt zwischen dem Ende des QRS-Komplexes (J-Punkt) und dem Beginn der T-Welle. Sie ist die wichtigste Stelle für die Infarktdiagnostik.' },
      { t: 'label', q: 'Tippe auf die <b>PQ-Strecke</b>.', target: 'pq',
        why: 'Die PQ-Strecke liegt zwischen dem Ende der P-Welle und dem Beginn des QRS. Sie entspricht der Verzögerung im AV-Knoten.' },
      { t: 'mc',
        q: 'Wie lang ist eine normale PQ-Zeit?',
        opts: ['0,04–0,10 s', '0,12–0,20 s', '0,20–0,32 s', '0,30–0,45 s'], a: 1,
        why: 'Normal sind 0,12–0,20 s. Über 0,20 s spricht man von einem AV-Block I°, unter 0,12 s besteht der Verdacht auf eine Präexzitation (z. B. WPW-Syndrom).'
      },
      { t: 'num',
        q: 'Ab welcher Breite (in Sekunden) gilt ein QRS-Komplex sicher als verbreitert?',
        a: 0.12, tol: 0.005, unit: 's', dec: true,
        why: 'Ab 0,12 s ist der QRS eindeutig verbreitert. Das spricht für einen Schenkelblock, einen ventrikulären Ursprung oder eine Schrittmacherstimulation. Der Graubereich liegt zwischen 0,10 und 0,12 s.'
      },
      { t: 'mc',
        q: 'Was misst das QT-Intervall?',
        opts: [
          'Nur die Dauer der Kammererregung',
          'Die gesamte Kammeraktion von Erregung bis Rückbildung',
          'Die Zeit zwischen zwei Herzschlägen',
          'Die Überleitungszeit im AV-Knoten'
        ], a: 1,
        why: 'Das QT-Intervall umfasst Depolarisation und Repolarisation der Kammern — vom QRS-Beginn bis zum Ende der T-Welle. Da es frequenzabhängig ist, wird es zur QTc korrigiert.'
      },
      { t: 'tf',
        q: 'Der Punkt, an dem der QRS-Komplex in die ST-Strecke übergeht, heißt J-Punkt.',
        a: true,
        why: 'Genau. Der J-Punkt ist der Referenzpunkt für die Beurteilung von ST-Hebungen und -Senkungen. Gemessen wird typischerweise 60–80 ms danach.'
      }
    ]},

    { id: 'l2_3', title: 'Kästchen & Zeit', icon: '🔲', steps: [
      { t: 'teach',
        h: 'Das Millimeterpapier ist dein Lineal',
        lead: 'Jede Zeitmessung im EKG läuft über die Kästchen. Aber Achtung: Ein Kästchen bedeutet je nach Papiergeschwindigkeit etwas anderes. Prüfe deshalb immer zuerst den Aufdruck auf dem Streifen.',
        media: { k: 'beat', tpl: {}, pq: 0.16 },
        table: [
          ['Bei 25 mm/s', '1 mm = 0,04 s', '5 mm = 0,20 s'],
          ['Bei 50 mm/s', '1 mm = 0,02 s', '5 mm = 0,10 s'],
          ['Amplitude', '1 mm = 0,1 mV', '10 mm = 1,0 mV']
        ],
        bullets: [
          { i: '📌', x: '<b>Senkrecht ist immer gleich:</b> 10 mm entsprechen 1 mV — unabhängig von der Papiergeschwindigkeit.' },
          { i: '⚠️', x: '<b>Häufiger Fehler:</b> Bei 50 mm/s sieht alles doppelt so breit aus. Ein normaler QRS wirkt dann schnell „verbreitert", wenn man mit den 25-mm/s-Regeln rechnet.' },
          { i: '🔍', x: '<b>Eichzacke:</b> Der rechteckige Ausschlag am Anfang des Streifens ist 10 mm hoch und bestätigt die Verstärkung von 10 mm/mV.' }
        ]
      },
      { t: 'mc',
        q: 'Bei 25 mm/s: Wie viel Zeit entspricht einem kleinen Kästchen (1 mm)?',
        opts: ['0,01 s', '0,02 s', '0,04 s', '0,10 s'], a: 2,
        why: 'Bei 25 mm/s legt das Papier in einer Sekunde 25 mm zurück. 1 mm entspricht damit 1/25 s = 0,04 s. Ein großes Kästchen (5 mm) sind 0,20 s.'
      },
      { t: 'mc',
        q: 'Bei 50 mm/s: Wie viel Zeit entspricht einem großen Kästchen (5 mm)?',
        opts: ['0,04 s', '0,10 s', '0,20 s', '0,50 s'], a: 1,
        why: 'Bei 50 mm/s ist 1 mm = 0,02 s, also 5 mm = 0,10 s. Alles erscheint doppelt so breit wie bei 25 mm/s.'
      },
      { t: 'num',
        q: 'Ein QRS-Komplex ist bei 25 mm/s genau 2 mm breit. Wie viele Sekunden sind das?',
        a: 0.08, tol: 0.005, unit: 's', dec: true,
        why: '2 mm × 0,04 s = 0,08 s. Das liegt unter 0,10 s und ist damit ein normal schmaler QRS-Komplex.'
      },
      { t: 'num',
        q: 'Eine R-Zacke ist 12 mm hoch. Wie viel mV sind das?',
        a: 1.2, tol: 0.05, unit: 'mV', dec: true,
        why: '10 mm entsprechen 1 mV, also sind 12 mm = 1,2 mV. Die Amplitudenskala ist unabhängig von der Papiergeschwindigkeit.'
      },
      { t: 'tf',
        q: 'Bei doppelter Papiergeschwindigkeit werden auch die Amplituden doppelt so hoch dargestellt.',
        a: false,
        why: 'Nein. Die Papiergeschwindigkeit dehnt nur die Zeitachse (waagerecht). Die Amplitude (senkrecht) hängt allein von der Verstärkung ab, standardmäßig 10 mm/mV.'
      }
    ]},

    { id: 'l2_4', title: 'Herzfrequenz bestimmen', icon: '🧮', steps: [
      { t: 'teach',
        h: 'Die 300er-Regel',
        lead: 'Du zählst die großen Kästchen zwischen zwei R-Zacken und teilst. Das geht im Kopf und reicht für die allermeisten Situationen.',
        media: { k: 'scope', rhythm: 'sinus', h: 'md', speed: 25, label: '25 mm/s' },
        bullets: [
          { i: '🔢', x: '<b>Bei 25 mm/s:</b> Herzfrequenz = <b>300 ÷ große Kästchen</b> zwischen zwei R-Zacken.' },
          { i: '🔢', x: '<b>Bei 50 mm/s:</b> Herzfrequenz = <b>600 ÷ große Kästchen</b> — die Kästchen sind hier ja nur halb so viel Zeit wert.' },
          { i: '🧠', x: '<b>Zum Auswendiglernen (25 mm/s):</b> 1 Kästchen = 300, 2 = 150, 3 = 100, 4 = 75, 5 = 60, 6 = 50.' },
          { i: '📉', x: '<b>Bei unregelmäßigem Rhythmus:</b> Die 300er-Regel versagt. Zähle dann die QRS-Komplexe auf einem 6-Sekunden-Streifen und multipliziere mit 10.' }
        ],
        key: { h: 'Normwert', p: 'Ein normaler Sinusrhythmus liegt bei <b>60–100/min</b>. Darunter: Bradykardie. Darüber: Tachykardie.' }
      },
      { t: 'num',
        q: 'Bei 25 mm/s liegen genau 4 große Kästchen zwischen zwei R-Zacken. Wie hoch ist die Herzfrequenz?',
        a: 75, tol: 2, unit: '/min',
        why: '300 ÷ 4 = 75/min. Das ist ein völlig normaler Wert.'
      },
      { t: 'num',
        q: 'Bei 25 mm/s liegen 5 große Kästchen zwischen zwei R-Zacken. Herzfrequenz?',
        a: 60, tol: 2, unit: '/min',
        why: '300 ÷ 5 = 60/min — die untere Grenze des Normbereichs.'
      },
      { t: 'num',
        q: 'Achtung, jetzt <b>50 mm/s</b>: 4 große Kästchen zwischen zwei R-Zacken. Herzfrequenz?',
        a: 150, tol: 5, unit: '/min',
        why: '600 ÷ 4 = 150/min. Hättest du hier mit 300 gerechnet, wärst du bei 75/min gelandet und hättest eine Tachykardie übersehen — deshalb immer zuerst die Papiergeschwindigkeit prüfen.'
      },
      { t: 'mc',
        q: 'Auf einem 6-Sekunden-Streifen zählst du 8 QRS-Komplexe. Wie hoch ist die Frequenz ungefähr?',
        opts: ['48/min', '60/min', '80/min', '120/min'], a: 2,
        why: '8 Komplexe × 10 = 80/min. Diese Methode ist besonders bei unregelmäßigen Rhythmen wie Vorhofflimmern zu bevorzugen.'
      },
      { t: 'mc',
        q: 'Warum ist die 300er-Regel bei Vorhofflimmern ungeeignet?',
        opts: [
          'Weil die R-Zacken zu klein sind',
          'Weil die Abstände zwischen den R-Zacken ständig wechseln',
          'Weil Vorhofflimmern immer zu schnell ist',
          'Weil man dabei keine großen Kästchen sieht'
        ], a: 1,
        why: 'Bei Vorhofflimmern besteht eine absolute Arrhythmie — jeder RR-Abstand ist anders. Ein einzelner Abstand ist dann nicht repräsentativ, also über 6 Sekunden auszählen.'
      },
      { t: 'rhythm',
        q: 'Wie würdest du diese Frequenz einordnen?',
        media: { k: 'scope', rhythm: 'sinusbradykardie', h: 'md', label: '?' },
        opts: ['Bradykardie (unter 60/min)', 'Normofrequent (60–100/min)', 'Tachykardie (über 100/min)'],
        a: 0,
        why: 'Die Abstände zwischen den R-Zacken sind auffällig lang — hier liegt die Frequenz bei etwa 44/min. Bei erhaltener P-Welle vor jedem QRS ist das eine Sinusbradykardie.'
      }
    ]}
    ]
  },

  /* ------------------------------------------ Einheit 3: Systematik */
  {
    id: 'u3', title: 'Systematisch befunden', icon: '🧭',
    sub: 'Nie wieder etwas übersehen',
    color: '#2f8fff', dark: '#1c6fd4', light: '#e6f1ff',
    lessons: [

    { id: 'l3_1', title: 'Der 7-Punkte-Check', icon: '✅', steps: [
      { t: 'teach',
        h: 'Immer dieselbe Reihenfolge',
        lead: 'Der häufigste Befundungsfehler ist nicht mangelndes Wissen, sondern fehlende Systematik: Man sieht die auffällige ST-Hebung und übersieht darüber den AV-Block. Arbeite deshalb immer dieselbe Liste ab.',
        bullets: [
          { i: '1️⃣', x: '<b>Rhythmus:</b> Regelmäßig oder unregelmäßig?' },
          { i: '2️⃣', x: '<b>Frequenz:</b> Wie schnell? (300er-Regel)' },
          { i: '3️⃣', x: '<b>P-Wellen:</b> Vorhanden? Vor jedem QRS? Immer gleich geformt?' },
          { i: '4️⃣', x: '<b>PQ-Zeit:</b> 0,12–0,20 s? Konstant?' },
          { i: '5️⃣', x: '<b>QRS:</b> Schmal (< 0,10 s) oder breit?' },
          { i: '6️⃣', x: '<b>ST-Strecke & T-Welle:</b> Hebung, Senkung, Negativierung?' },
          { i: '7️⃣', x: '<b>Lagetyp und QT-Zeit</b> zum Schluss.' }
        ],
        key: { h: 'Die zwei entscheidenden Fragen im Notfall', p: '<b>Schnell oder langsam?</b> und <b>schmal oder breit?</b> Diese beiden Achsen führen dich durch fast jeden Rhythmus-Notfall — breite Tachykardien sind bis zum Beweis des Gegenteils ventrikulär.' }
      },
      { t: 'order',
        q: 'Bringe den systematischen Befundungs-Ablauf in die richtige Reihenfolge.',
        items: ['Rhythmus', 'Frequenz', 'P-Wellen', 'PQ-Zeit', 'QRS-Breite', 'ST-Strecke & T-Welle'],
        why: 'Von grob nach fein: erst Rhythmus und Frequenz, dann die einzelnen Abschnitte in der Reihenfolge, in der sie im EKG auftreten.'
      },
      { t: 'mc',
        q: 'Eine Tachykardie mit breiten QRS-Komplexen ist bis zum Beweis des Gegenteils …',
        opts: [
          'eine harmlose Sinustachykardie',
          'eine ventrikuläre Tachykardie',
          'ein Artefakt',
          'ein Vorhofflimmern'
        ], a: 1,
        why: 'Diese Regel rettet Leben. Eine Breitkomplextachykardie wird als ventrikuläre Tachykardie behandelt, bis das Gegenteil bewiesen ist — besonders bei bekannter Herzerkrankung.'
      },
      { t: 'multi',
        q: 'Was prüfst du an der P-Welle? (mehrere richtig)',
        opts: [
          'Ist überhaupt eine P-Welle vorhanden?',
          'Folgt auf jede P-Welle ein QRS-Komplex?',
          'Sind alle P-Wellen gleich geformt?',
          'Ist die P-Welle höher als die T-Welle?'
        ],
        a: [0, 1, 2],
        why: 'Vorhandensein, Beziehung zum QRS und Morphologie sind die drei entscheidenden Fragen. Ob die P-Welle höher als die T-Welle ist, spielt keine Rolle — die P-Welle ist normalerweise ohnehin die kleinste Welle.'
      },
      { t: 'tf',
        q: 'Es ist sinnvoll, mit der auffälligsten Veränderung zu beginnen und den Rest danach zu prüfen.',
        a: false,
        why: 'Gerade nicht. Wer bei der Auffälligkeit einsteigt, überliest die anderen Punkte. Die feste Reihenfolge schützt davor — die auffällige Veränderung läuft dir ohnehin nicht weg.'
      }
    ]},

    { id: 'l3_2', title: 'Der Lagetyp', icon: '🧲', steps: [
      { t: 'teach',
        h: 'In welche Richtung läuft die Erregung?',
        lead: 'Der Lagetyp beschreibt die elektrische Hauptrichtung der Kammererregung in der Frontalebene. Du bestimmst ihn aus den Extremitätenableitungen — am schnellsten über I, II und III.',
        bullets: [
          { i: '↔️', x: '<b>Indifferenztyp (+30° bis +60°):</b> Der Normalfall bei Erwachsenen.' },
          { i: '↘️', x: '<b>Steiltyp (+60° bis +90°):</b> Normal bei jungen, schlanken Menschen.' },
          { i: '↖️', x: '<b>Linkstyp (−30° bis +30°):</b> Häufig im Alter, bei Adipositas oder Linksherzhypertrophie.' },
          { i: '↗️', x: '<b>Rechtstyp (+90° bis +120°):</b> Normal bei Kindern; beim Erwachsenen Hinweis auf Rechtsherzbelastung.' },
          { i: '⚠️', x: '<b>Überdrehte Typen</b> (über −30° bzw. +120°) sind immer krankhaft.' }
        ],
        key: { h: 'Schnelltrick', p: 'Schau, in welcher Ableitung der QRS am <b>höchsten positiv</b> ist — dorthin zeigt die elektrische Achse ungefähr. Ist der QRS in I und II positiv, liegt der Lagetyp im Normbereich.' }
      },
      { t: 'match',
        q: 'Ordne den Lagetyp dem Winkelbereich zu.',
        pairs: [
          ['Linkstyp', '−30° bis +30°'],
          ['Indifferenztyp', '+30° bis +60°'],
          ['Steiltyp', '+60° bis +90°'],
          ['Rechtstyp', '+90° bis +120°']
        ],
        why: 'Die Reihenfolge von links nach rechts: überdrehter Linkstyp → Linkstyp → Indifferenztyp → Steiltyp → Rechtstyp → überdrehter Rechtstyp.'
      },
      { t: 'teach',
        h: 'So liest du den Lagetyp aus I, II und III ab',
        lead: 'Dafür brauchst du keinen Winkelmesser. Es genügt zu schauen, ob der QRS-Komplex in den drei Einthoven-Ableitungen überwiegend nach <em>oben</em> oder nach <em>unten</em> zeigt — und in welcher er am größten ist.',
        media: { k: 'leads', axis: 45, ids: ['I', 'II', 'III'], mvTop: 1.95, mvBot: -1.95 },
        bullets: [
          { i: '🎯', x: '<b>Grundregel:</b> Die Achse zeigt ungefähr dorthin, wo der QRS-Komplex <b>am größten und positiv</b> ist.' },
          { i: '✅', x: '<b>I und II beide positiv?</b> Dann liegt der Lagetyp im Normbereich — Links-, Indifferenz- oder Steiltyp.' },
          { i: '↗️', x: '<b>I negativ?</b> Dann ist die Achse nach rechts gewandert: Rechtstyp oder überdrehter Rechtstyp.' },
          { i: '↖️', x: '<b>II und III beide negativ?</b> Dann liegt ein überdrehter Linkstyp vor.' },
          { i: '⚖️', x: '<b>Gleichschenklig?</b> Ist ein Komplex etwa gleich hoch wie tief, steht der Hauptvektor <b>senkrecht</b> auf dieser Ableitung.' }
        ],
        thead: ['Lagetyp', 'I', 'II', 'III'],
        table: [
          ['Überdrehter Linkstyp', 'positiv', 'negativ', 'negativ'],
          ['Linkstyp', 'positiv (groß)', 'positiv', 'negativ'],
          ['Indifferenztyp', 'positiv', 'positiv (am größten)', 'positiv (klein)'],
          ['Steiltyp', 'positiv (klein)', 'positiv', 'positiv (groß)'],
          ['Rechtstyp', 'negativ', 'positiv', 'positiv (am größten)'],
          ['Überdrehter Rechtstyp', 'negativ (groß)', 'negativ', 'positiv']
        ],
        key: { h: 'Die Abbildung oben', p: 'Hier ist II am größten, I und III sind beide positiv — das ist der <b>Indifferenztyp</b>, der Normalfall beim Erwachsenen.' }
      },
      { t: 'rhythm',
        q: 'Welcher Lagetyp liegt hier vor?',
        sub: 'II ist am größten, I und III sind beide positiv.',
        media: { k: 'leads', axis: 48, ids: ['I', 'II', 'III'], mvTop: 1.95, mvBot: -1.95 },
        opts: ['Linkstyp', 'Indifferenztyp', 'Steiltyp', 'Rechtstyp'],
        a: 1,
        why: 'Alle drei Ableitungen sind positiv, II ist am größten — die Achse zeigt also ungefähr in Richtung von Ableitung II (+60°). Das ist der Indifferenztyp (+30° bis +60°), der Normalfall beim Erwachsenen.'
      },
      { t: 'rhythm',
        q: 'Und dieser hier?',
        sub: 'Achte darauf, wie flach der Komplex in Ableitung I ist.',
        media: { k: 'leads', axis: 78, ids: ['I', 'II', 'III'], mvTop: 1.95, mvBot: -1.95 },
        opts: ['Linkstyp', 'Indifferenztyp', 'Steiltyp', 'Überdrehter Rechtstyp'],
        a: 2,
        why: 'II und III sind beide kräftig positiv, I dagegen nur klein — die Achse ist nach unten gekippt. Das ist der Steiltyp (+60° bis +90°). Bei jungen, schlanken Menschen ist er völlig normal.'
      },
      { t: 'rhythm',
        q: 'Hier ist Ableitung I am größten und III negativ. Welcher Lagetyp?',
        media: { k: 'leads', axis: 0, ids: ['I', 'II', 'III'], mvTop: 1.95, mvBot: -1.95 },
        opts: ['Steiltyp', 'Rechtstyp', 'Linkstyp', 'Indifferenztyp'],
        a: 2,
        why: 'I ist stark positiv, II noch positiv, III bereits negativ — die Achse liegt bei etwa 0°. Das ist der Linkstyp (−30° bis +30°), beim Erwachsenen meist physiologisch.'
      },
      { t: 'rhythm',
        q: 'Jetzt ist Ableitung I negativ. Welcher Lagetyp?',
        media: { k: 'leads', axis: 108, ids: ['I', 'II', 'III'], mvTop: 1.95, mvBot: -1.95 },
        opts: ['Linkstyp', 'Indifferenztyp', 'Rechtstyp', 'Überdrehter Linkstyp'],
        a: 2,
        why: 'Sobald Ableitung I negativ wird, ist die Achse nach rechts gewandert. III ist hier am größten — das ergibt den Rechtstyp (+90° bis +120°). Beim Erwachsenen ist er ein Hinweis auf eine Rechtsherzbelastung, bei Kindern dagegen normal.'
      },
      { t: 'rhythm',
        q: 'Letzte: I ist positiv, II und III sind beide negativ.',
        media: { k: 'leads', axis: -55, ids: ['I', 'II', 'III'], mvTop: 1.95, mvBot: -1.95 },
        opts: ['Linkstyp', 'Überdrehter Linkstyp', 'Steiltyp', 'Überdrehter Rechtstyp'],
        a: 1,
        why: 'Ein positives I bei gleichzeitig negativem II <em>und</em> III bedeutet, dass die Achse über −30° hinaus nach links gedreht ist: überdrehter Linkstyp. Der ist immer krankhaft — etwa beim linksanterioren Hemiblock oder bei ausgeprägter Linksherzhypertrophie.'
      },
      { t: 'mc',
        q: 'Bei einem 8-jährigen Kind findest du einen Rechtstyp. Wie bewertest du das?',
        opts: [
          'Sofortiger Notfall',
          'Altersentsprechend normal',
          'Sicherer Hinweis auf eine Lungenembolie',
          'Zeichen eines Herzinfarkts'
        ], a: 1,
        why: 'Bei Kindern ist der Rechtstyp physiologisch, weil die rechte Kammer relativ kräftiger ist. Mit dem Wachstum verschiebt sich der Lagetyp nach links.'
      },
      { t: 'mc',
        q: 'Welcher Lagetyp ist bei einem Erwachsenen immer als krankhaft einzustufen?',
        opts: ['Indifferenztyp', 'Steiltyp', 'Überdrehter Linkstyp', 'Linkstyp'], a: 2,
        why: 'Ein überdrehter Linkstyp (jenseits −30°) ist pathologisch und findet sich z. B. beim linksanterioren Hemiblock oder bei ausgeprägter Linksherzhypertrophie.'
      },
      { t: 'tf',
        q: 'Der Lagetyp wird aus den Brustwandableitungen V1–V6 bestimmt.',
        a: false,
        why: 'Der Lagetyp beschreibt die Frontalebene und wird deshalb aus den Extremitätenableitungen (I, II, III, aVR, aVL, aVF) bestimmt. V1–V6 zeigen die Horizontalebene.'
      }
    ]}
    ]
  },

  /* ------------------------------------- Einheit 4: Rhythmusstörungen */
  {
    id: 'u4', title: 'Rhythmusstörungen', icon: '💓',
    sub: 'Von harmlos bis lebensbedrohlich',
    color: '#ff4d6d', dark: '#d92e50', light: '#ffe8ec',
    lessons: [

    { id: 'l4_1', title: 'Sinusrhythmus & Varianten', icon: '🎵', steps: [
      { t: 'teach',
        h: 'Was macht einen Sinusrhythmus aus?',
        lead: 'Drei Kriterien müssen erfüllt sein — dann stammt der Takt sicher aus dem Sinusknoten.',
        media: { k: 'scope', rhythm: 'sinus', h: 'md', label: 'Sinusrhythmus, 70/min' },
        bullets: [
          { i: '✅', x: '<b>Vor jedem QRS eine P-Welle</b> — und zwar immer die gleiche.' },
          { i: '✅', x: '<b>Nach jeder P-Welle ein QRS</b> — es fällt keiner aus.' },
          { i: '✅', x: '<b>Konstante PQ-Zeit</b> zwischen 0,12 und 0,20 s.' },
          { i: '📊', x: '<b>Frequenz 60–100/min:</b> normofrequenter Sinusrhythmus. Darunter Sinusbradykardie, darüber Sinustachykardie.' }
        ],
        key: { h: 'Respiratorische Sinusarrhythmie', p: 'Bei jungen Menschen schwankt die Frequenz mit der Atmung — beim Einatmen schneller, beim Ausatmen langsamer. Das ist ein <b>Zeichen von Gesundheit</b>, kein Befund.' }
      },
      { t: 'rhythm',
        q: 'Welcher Rhythmus liegt hier vor?',
        media: { k: 'scope', rhythm: 'sinustachykardie', h: 'md' },
        opts: ['Sinusbradykardie', 'Normofrequenter Sinusrhythmus', 'Sinustachykardie', 'Vorhofflimmern'],
        a: 2,
        why: 'Regelmäßig, vor jedem QRS eine P-Welle, aber deutlich über 100/min — das ist eine Sinustachykardie. Sie ist meist eine Reaktion auf Fieber, Schmerz, Angst, Blutverlust oder Sauerstoffmangel.'
      },
      { t: 'mc',
        q: 'Eine Sinustachykardie ist meistens …',
        opts: [
          'eine eigenständige Herzerkrankung',
          'eine sinnvolle Reaktion des Körpers auf eine andere Ursache',
          'immer ein Notfall',
          'ein Zeichen für einen Herzinfarkt'
        ], a: 1,
        why: 'Die Sinustachykardie ist fast immer eine Antwort auf etwas anderes — Fieber, Schmerz, Volumenmangel, Angst, Hyperthyreose. Man behandelt daher die Ursache, nicht die Frequenz.'
      },
      { t: 'rhythm',
        q: 'Was siehst du hier?',
        media: { k: 'scope', rhythm: 'sinusarrhythmie', h: 'md' },
        opts: ['Vorhofflimmern', 'Respiratorische Sinusarrhythmie', 'AV-Block II°', 'Kammertachykardie'],
        a: 1,
        why: 'Die Abstände schwanken langsam und gleichmäßig — und vor jedem QRS steht eine normale P-Welle. Beim Vorhofflimmern wären die Abstände völlig unregelmäßig und die P-Wellen fehlten.'
      },
      { t: 'multi',
        q: 'Welche Kriterien muss ein Sinusrhythmus erfüllen? (mehrere richtig)',
        opts: [
          'Vor jedem QRS-Komplex steht eine P-Welle',
          'Die PQ-Zeit ist konstant',
          'Der QRS-Komplex ist immer breiter als 0,12 s',
          'Auf jede P-Welle folgt ein QRS-Komplex'
        ],
        a: [0, 1, 3],
        why: 'Ein Sinusrhythmus kann durchaus mit einem breiten QRS einhergehen — etwa bei zusätzlichem Schenkelblock. Die QRS-Breite gehört nicht zu den Kriterien für den Rhythmusursprung.'
      },
      { t: 'tf',
        q: 'Eine Sinusbradykardie ist bei Leistungssportlern häufig und harmlos.',
        a: true,
        why: 'Durch das Training steigt der Vagotonus und das Schlagvolumen — Ruhefrequenzen um 40/min sind bei Ausdauersportlern normal. Entscheidend ist, ob Beschwerden bestehen.'
      }
    ]},

    { id: 'l4_2', title: 'Vorhofflimmern & -flattern', icon: '🌀', steps: [
      { t: 'teach',
        h: 'Wenn die Vorhöfe den Takt verlieren',
        lead: 'Vorhofflimmern ist die häufigste anhaltende Herzrhythmusstörung überhaupt. Im EKG erkennst du es an zwei Dingen: keine P-Wellen und eine absolut unregelmäßige Kammerfrequenz.',
        media: { k: 'scope', rhythm: 'vorhofflimmern', h: 'md', label: 'Vorhofflimmern' },
        bullets: [
          { i: '🚫', x: '<b>Keine P-Wellen</b> — stattdessen feine, unregelmäßige Flimmerwellen auf der Grundlinie.' },
          { i: '🎲', x: '<b>Absolute Arrhythmie:</b> Kein RR-Abstand gleicht dem anderen.' },
          { i: '📏', x: '<b>QRS bleibt schmal</b>, weil die Erregung ab dem AV-Knoten normal weiterläuft.' },
          { i: '🩸', x: '<b>Die eigentliche Gefahr:</b> In den nicht mehr richtig kontrahierenden Vorhöfen bilden sich Gerinnsel → Schlaganfallrisiko. Deshalb ist die Antikoagulation zentral.' }
        ]
      },
      { t: 'teach',
        h: 'Vorhofflattern: der Sägezahn',
        lead: 'Beim Vorhofflattern kreist die Erregung geordnet im Vorhof — mit rund 250–350 Impulsen pro Minute. Der AV-Knoten leitet nur jeden zweiten oder dritten weiter.',
        media: { k: 'scope', rhythm: 'vorhofflattern', h: 'md', label: 'Vorhofflattern, 2:1' },
        bullets: [
          { i: '🪚', x: '<b>Sägezahnmuster</b> statt P-Wellen — am besten in II, III und aVF zu sehen.' },
          { i: '📐', x: '<b>Meist regelmäßig</b> — im Gegensatz zum Flimmern. Bei wechselnder Überleitung kann es aber auch unregelmäßig sein.' },
          { i: '🔢', x: '<b>Typischer Befund:</b> Flatterfrequenz 300/min mit 2:1-Überleitung ergibt exakt 150/min Kammerfrequenz.' }
        ],
        key: { h: 'Faustregel', p: 'Eine <b>auffällig konstante Frequenz um 150/min</b> sollte dich immer an Vorhofflattern mit 2:1-Überleitung denken lassen — die Flatterwellen verstecken sich dann gern in der T-Welle.' }
      },
      { t: 'rhythm',
        q: 'Welcher Rhythmus ist das?',
        media: { k: 'scope', rhythm: 'vorhofflimmern', h: 'md' },
        opts: ['Sinusrhythmus', 'Vorhofflimmern', 'Vorhofflattern', 'AV-Block III°'],
        a: 1,
        why: 'Keine erkennbaren P-Wellen, unruhige Grundlinie und völlig unregelmäßige RR-Abstände — das ist die klassische Trias des Vorhofflimmerns.'
      },
      { t: 'rhythm',
        q: 'Und hier?',
        media: { k: 'scope', rhythm: 'vorhofflattern', h: 'md' },
        opts: ['Vorhofflimmern', 'Vorhofflattern', 'Sinustachykardie', 'Kammerflimmern'],
        a: 1,
        why: 'Die regelmäßigen sägezahnartigen Wellen zwischen den QRS-Komplexen sind typisch für Vorhofflattern. Anders als beim Flimmern ist der Rhythmus hier regelmäßig.'
      },
      { t: 'mc',
        q: 'Warum ist Vorhofflimmern gefährlich, obwohl viele Betroffene es kaum spüren?',
        opts: [
          'Weil es immer in Kammerflimmern übergeht',
          'Weil sich in den Vorhöfen Blutgerinnsel bilden können, die Schlaganfälle auslösen',
          'Weil es den Blutdruck dauerhaft senkt',
          'Weil es den Sinusknoten zerstört'
        ], a: 1,
        why: 'Der stehende Blutfluss in den flimmernden Vorhöfen — besonders im linken Vorhofohr — begünstigt Thromben. Lösen sich diese, drohen embolische Schlaganfälle.'
      },
      { t: 'mc',
        q: 'Ein Patient hat eine sehr regelmäßige Kammerfrequenz von exakt 150/min. Woran solltest du zuerst denken?',
        opts: [
          'Vorhofflimmern',
          'Vorhofflattern mit 2:1-Überleitung',
          'Kammerflimmern',
          'AV-Block I°'
        ], a: 1,
        why: 'Bei einer typischen Flatterfrequenz von 300/min und 2:1-Überleitung ergibt sich rechnerisch genau 150/min. Diese Konstellation ist so häufig, dass sie ein eigener Merksatz geworden ist.'
      },
      { t: 'multi',
        q: 'Welche Aussagen zum Vorhofflimmern treffen zu? (mehrere richtig)',
        opts: [
          'Die P-Wellen fehlen',
          'Der QRS-Komplex ist typischerweise schmal',
          'Die RR-Abstände sind absolut unregelmäßig',
          'Es tritt nur bei jungen Menschen auf'
        ],
        a: [0, 1, 2],
        why: 'Vorhofflimmern wird mit dem Alter deutlich häufiger — über 80 Jahre ist etwa jede zehnte Person betroffen. Die anderen drei Aussagen sind die diagnostischen Kernmerkmale.'
      }
    ]},

    { id: 'l4_3', title: 'Extrasystolen', icon: '⏭️', steps: [
      { t: 'teach',
        h: 'Schläge, die zu früh kommen',
        lead: 'Eine Extrasystole ist ein Herzschlag außer der Reihe. Entscheidend ist, wo er entsteht — denn davon hängt ab, wie der QRS-Komplex aussieht und wie ernst der Befund ist.',
        media: { k: 'scope', rhythm: 'ves', h: 'md', label: 'Ventrikuläre Extrasystolen' },
        bullets: [
          { i: '🔷', x: '<b>Supraventrikuläre Extrasystole (SVES):</b> Ursprung oberhalb der Kammern. Der QRS bleibt <b>schmal</b>, weil die normale Leitungsbahn genutzt wird. Meist harmlos.' },
          { i: '🔶', x: '<b>Ventrikuläre Extrasystole (VES):</b> Ursprung in der Kammer. Der QRS ist <b>breit und verformt</b>, die T-Welle zeigt oft in die Gegenrichtung.' },
          { i: '⏸️', x: '<b>Kompensatorische Pause:</b> Nach einer VES folgt meist eine längere Pause, bevor der normale Rhythmus wieder einsetzt.' }
        ],
        key: { h: 'Wann wird es relevant?', p: 'Einzelne VES sind auch bei Herzgesunden häufig. Aufmerksam wirst du bei <b>gehäuften</b> VES, bei <b>Salven</b> (mehrere hintereinander) und bei VES aus <b>verschiedenen Ursprüngen</b> (unterschiedliche Formen) — besonders bei vorbestehender Herzerkrankung.' }
      },
      { t: 'mc',
        q: 'Woran erkennst du eine ventrikuläre Extrasystole?',
        opts: [
          'Am schmalen QRS-Komplex mit vorangehender P-Welle',
          'Am breiten, verformten QRS-Komplex ohne vorangehende P-Welle',
          'An der fehlenden T-Welle',
          'An der verlängerten PQ-Zeit'
        ], a: 1,
        why: 'Weil die Erregung in der Kammer startet, umgeht sie das schnelle Leitungssystem und breitet sich langsam von Muskelzelle zu Muskelzelle aus — daher der breite, bizarr geformte Komplex.'
      },
      { t: 'rhythm',
        q: 'Was fällt in diesem Streifen auf?',
        media: { k: 'scope', rhythm: 'ves', h: 'md' },
        opts: [
          'Regelmäßiger Sinusrhythmus ohne Besonderheiten',
          'Vereinzelte breite Komplexe, die vorzeitig einfallen',
          'Vorhofflimmern',
          'Kompletter AV-Block'
        ], a: 1,
        why: 'Zwischen den normalen Schlägen fallen immer wieder breite, andersförmige Komplexe vorzeitig ein — gefolgt von einer Pause. Das sind ventrikuläre Extrasystolen.'
      },
      { t: 'match',
        q: 'Ordne zu.',
        pairs: [
          ['SVES', 'Schmaler QRS-Komplex'],
          ['VES', 'Breiter, verformter QRS-Komplex'],
          ['Bigeminus', 'Auf jeden Normalschlag folgt eine Extrasystole'],
          ['Salve', 'Drei oder mehr Extrasystolen hintereinander']
        ],
        why: 'Die Begriffe beschreiben Ursprung (SVES/VES) und Muster (Bigeminus, Couplet, Salve). Ab drei VES in Folge mit über 100/min spricht man von einer ventrikulären Tachykardie.'
      },
      { t: 'tf',
        q: 'Einzelne ventrikuläre Extrasystolen kommen auch bei völlig herzgesunden Menschen vor.',
        a: true,
        why: 'Ja, sie sind sehr häufig und meist harmlos — oft werden sie als „Stolpern" oder „Aussetzer" wahrgenommen. Relevant werden sie bei Häufung, Salven oder vorbestehender Herzerkrankung.'
      },
      { t: 'mc',
        q: 'Was bezeichnet man als Bigeminus?',
        opts: [
          'Zwei Extrasystolen direkt hintereinander',
          'Regelmäßiger Wechsel aus Normalschlag und Extrasystole',
          'Zwei verschiedene Ursprungsorte der Extrasystolen',
          'Zwei P-Wellen vor einem QRS'
        ], a: 1,
        why: 'Beim Bigeminus folgt auf jeden Normalschlag eine Extrasystole. Zwei Extrasystolen hintereinander nennt man Couplet, ab drei spricht man von einer Salve.'
      }
    ]},

    { id: 'l4_4', title: 'Tachykardien', icon: '🔥', steps: [
      { t: 'teach',
        h: 'Schmal oder breit — das ist die Frage',
        lead: 'Bei jeder Tachykardie über 100/min entscheidet die QRS-Breite über das weitere Vorgehen. Sie sagt dir, ob die Erregung den normalen Weg genommen hat oder nicht.',
        media: { k: 'scope', rhythm: 'kammertachykardie', h: 'md', label: 'Kammertachykardie' },
        bullets: [
          { i: '📏', x: '<b>Schmalkomplextachykardie (< 0,12 s):</b> Ursprung oberhalb der Kammern — z. B. Sinustachykardie, AV-Knoten-Reentrytachykardie, Vorhofflattern.' },
          { i: '📐', x: '<b>Breitkomplextachykardie (≥ 0,12 s):</b> Bis zum Beweis des Gegenteils eine <b>ventrikuläre Tachykardie</b>.' },
          { i: '🚨', x: '<b>Die VT ist ein Notfall:</b> Sie kann in Kammerflimmern übergehen. Instabile Patienten werden kardiovertiert.' },
          { i: '🌀', x: '<b>Torsade de pointes:</b> Sonderform mit spindelförmig um die Grundlinie tanzender Achse — typisch bei verlängerter QT-Zeit.' }
        ],
        key: { h: 'Warum die Regel so streng ist', p: 'Eine VT als supraventrikuläre Tachykardie zu verkennen und falsch zu behandeln, kann tödlich enden. Umgekehrt schadet die Behandlung als VT einer SVT kaum. Deshalb: <b>Im Zweifel immer VT annehmen.</b>' }
      },
      { t: 'rhythm',
        q: 'Schnelle, breite, regelmäßige Komplexe. Was ist deine Arbeitsdiagnose?',
        media: { k: 'scope', rhythm: 'kammertachykardie', h: 'md' },
        opts: ['Sinustachykardie', 'Ventrikuläre Tachykardie', 'Vorhofflimmern', 'AV-Block II°'],
        a: 1,
        why: 'Breite Komplexe bei hoher Frequenz ohne erkennbare P-Wellen: ventrikuläre Tachykardie bis zum Beweis des Gegenteils. Das ist ein Notfall.'
      },
      { t: 'rhythm',
        q: 'Und dieser Rhythmus?',
        media: { k: 'scope', rhythm: 'avnrt', h: 'md' },
        opts: [
          'Ventrikuläre Tachykardie',
          'Schmalkomplextachykardie (supraventrikulär)',
          'Kammerflimmern',
          'Sinusbradykardie'
        ], a: 1,
        why: 'Sehr schnell und sehr regelmäßig, aber die QRS-Komplexe sind schmal — die Erregung nimmt also den normalen Weg über das Reizleitungssystem. P-Wellen sind nicht abgrenzbar, sie verstecken sich im QRS.'
      },
      { t: 'mc',
        q: 'Ab wann spricht man definitionsgemäß von einer ventrikulären Tachykardie?',
        opts: [
          'Ab 2 ventrikulären Extrasystolen hintereinander',
          'Ab 3 ventrikulären Extrasystolen hintereinander mit über 100/min',
          'Ab 10 Extrasystolen pro Minute',
          'Ab einer Frequenz von 200/min'
        ], a: 1,
        why: 'Drei oder mehr aufeinanderfolgende ventrikuläre Komplexe mit einer Frequenz über 100/min definieren eine VT. Unter 30 Sekunden Dauer heißt sie nicht-anhaltend, darüber anhaltend.'
      },
      { t: 'rhythm',
        q: 'Welche Sonderform siehst du hier?',
        media: { k: 'scope', rhythm: 'torsade', h: 'md' },
        opts: ['Vorhofflattern', 'Torsade de pointes', 'Schrittmacherrhythmus', 'Sinusrhythmus'],
        a: 1,
        why: 'Die Amplitude schwillt an und ab, die Achse „tanzt" um die Grundlinie — das ist Torsade de pointes. Auslöser ist typischerweise eine verlängerte QT-Zeit, behandelt wird unter anderem mit Magnesium.'
      },
      { t: 'tf',
        q: 'Bei einer Breitkomplextachykardie ist es sicher, zunächst von einer harmlosen supraventrikulären Ursache auszugehen.',
        a: false,
        why: 'Genau umgekehrt. Die Standardregel lautet: Breitkomplextachykardie = ventrikuläre Tachykardie, bis das Gegenteil bewiesen ist. Ein Irrtum in diese Richtung ist ungefährlich, andersherum kann er tödlich sein.'
      }
    ]},

    { id: 'l4_5', title: 'Reanimationsrhythmen', icon: '⚡', steps: [
      { t: 'teach',
        h: 'Defibrillierbar — oder nicht?',
        lead: 'Im Herz-Kreislauf-Stillstand teilt eine einzige Frage die Therapie: Lässt sich der Rhythmus mit einem Schock beenden? Vier Rhythmen musst du sicher auseinanderhalten.',
        media: { k: 'scope', rhythm: 'kammerflimmern', h: 'md', label: 'Kammerflimmern' },
        bullets: [
          { i: '⚡', x: '<b>Defibrillierbar:</b> Kammerflimmern und pulslose ventrikuläre Tachykardie. → Sofort schocken.' },
          { i: '🚫', x: '<b>Nicht defibrillierbar:</b> Asystolie und pulslose elektrische Aktivität (PEA). → Herzdruckmassage und Adrenalin.' },
          { i: '💥', x: '<b>Kammerflimmern:</b> Völlig chaotische Kurve ohne abgrenzbare Komplexe. Das Herz zittert nur noch, es pumpt nicht.' },
          { i: '➖', x: '<b>Asystolie:</b> Nulllinie. Ein Schock bringt hier nichts — es gibt keine Erregung, die man ordnen könnte.' }
        ],
        key: { h: 'Der häufigste Denkfehler', p: 'Eine Asystolie wird <b>nicht</b> defibrilliert. Die Defibrillation setzt alle Herzzellen gleichzeitig zurück, damit der Sinusknoten wieder übernehmen kann — bei einer Nulllinie gibt es dafür keine Grundlage.' }
      },
      { t: 'rhythm',
        q: 'Der Patient ist bewusstlos und hat keinen Puls. Welcher Rhythmus liegt vor?',
        media: { k: 'scope', rhythm: 'kammerflimmern', h: 'md' },
        opts: ['Asystolie', 'Kammerflimmern', 'Vorhofflimmern', 'Sinusrhythmus'],
        a: 1,
        why: 'Völlig chaotische Ausschläge unterschiedlicher Amplitude ohne erkennbare QRS-Komplexe: Kammerflimmern. Das ist ein defibrillierbarer Rhythmus — sofort schocken.'
      },
      { t: 'rhythm',
        q: 'Und dieser Rhythmus bei pulslosem Patienten?',
        media: { k: 'scope', rhythm: 'asystolie', h: 'md' },
        opts: ['Kammerflimmern', 'Asystolie', 'Feines Vorhofflimmern', 'Sinusbradykardie'],
        a: 1,
        why: 'Eine praktisch gerade Nulllinie ohne jede elektrische Aktivität: Asystolie. Nicht defibrillierbar — Herzdruckmassage und Adrenalin sind hier die Therapie.'
      },
      { t: 'multi',
        q: 'Welche Rhythmen sind defibrillierbar? (mehrere richtig)',
        opts: [
          'Kammerflimmern',
          'Asystolie',
          'Pulslose ventrikuläre Tachykardie',
          'Pulslose elektrische Aktivität (PEA)'
        ],
        a: [0, 2],
        why: 'Nur Kammerflimmern und pulslose VT werden defibrilliert. Bei Asystolie und PEA besteht die Therapie aus hochwertiger Herzdruckmassage und Adrenalin.'
      },
      { t: 'mc',
        q: 'Was verbirgt sich hinter dem Begriff „pulslose elektrische Aktivität"?',
        opts: [
          'Ein Kammerflimmern mit sehr feinen Ausschlägen',
          'Ein EKG-Bild mit organisierten Komplexen, aber ohne tastbaren Puls',
          'Eine Nulllinie mit vereinzelten Ausschlägen',
          'Ein Artefakt durch schlechte Elektroden'
        ], a: 1,
        why: 'Bei der PEA sieht das EKG geordnet aus, es fehlt aber die mechanische Auswurfleistung. Genau deshalb gilt: immer Puls tasten, nie allein dem Monitor vertrauen. Behandelt werden die reversiblen Ursachen (4 H und HITS).'
      },
      { t: 'tf',
        q: 'Bei einer Asystolie sollte man einmal probeweise defibrillieren.',
        a: false,
        why: 'Nein. Die Defibrillation kann keinen Rhythmus erzeugen, sondern nur einen chaotischen ordnen. Bei Asystolie unterbricht der Schockversuch nur die lebensrettende Herzdruckmassage.'
      }
    ]}
    ]
  },

  /* ------------------------------------------- Einheit 5: Blockbilder */
  {
    id: 'u5', title: 'Blockbilder', icon: '🚧',
    sub: 'Wenn die Leitung stockt',
    color: '#ffb703', dark: '#d99400', light: '#fff4d9',
    lessons: [

    { id: 'l5_0', title: 'SA-Blöcke', icon: '🚪', steps: [
      { t: 'teach',
        h: 'Wenn der Impuls den Vorhof gar nicht erst erreicht',
        lead: 'Beim sinuatrialen Block stockt die Überleitung schon zwischen Sinusknoten und Vorhofmuskulatur. Der Sinusknoten selbst ist im EKG nicht sichtbar — du erkennst den Block nur <em>indirekt</em>, nämlich daran, dass eine ganze Aktion fehlt.',
        media: { k: 'scope', rhythm: 'sa_block_mobitz', h: 'md', label: 'SA-Block II° Typ 2' },
        bullets: [
          { i: '👻', x: '<b>Der entscheidende Unterschied zum AV-Block:</b> Hier fällt die <b>P-Welle mit aus</b> — es fehlt die komplette Aktion aus P-Welle und QRS-Komplex.' },
          { i: '1️⃣', x: '<b>Grad I:</b> Die Überleitung ist nur verzögert. Im Oberflächen-EKG <b>nicht erkennbar</b>.' },
          { i: '2️⃣', x: '<b>Grad II Typ 1 (Wenckebach):</b> Die PP-Abstände werden vor der Pause <b>kürzer</b>, dann fällt eine Aktion aus.' },
          { i: '2️⃣', x: '<b>Grad II Typ 2 (Mobitz):</b> PP-Abstände völlig regelmäßig, dann fällt plötzlich eine Aktion aus. Die Pause ist <b>genau doppelt so lang</b> wie ein normaler PP-Abstand.' },
          { i: '3️⃣', x: '<b>Grad III:</b> Kompletter Sinusarrest — ein Ersatzzentrum muss übernehmen.' }
        ],
        key: { h: 'Der Merksatz', p: '<b>SA-Block = Problem <em>vor</em> der P-Welle</b> → die P-Welle fehlt mit.<br><b>AV-Block = Problem <em>nach</em> der P-Welle</b> → die P-Welle ist da, aber der QRS-Komplex fehlt.' }
      },
      { t: 'teach',
        h: 'Wenckebach: die Abstände werden kürzer',
        lead: 'Das klingt zunächst verkehrt herum — bei einer zunehmenden Blockierung müssten die Abstände doch länger werden? Der Trick liegt darin, dass zwar die Verzögerung wächst, ihr <em>Zuwachs</em> aber von Schlag zu Schlag kleiner wird. Unterm Strich rücken die sichtbaren P-Wellen deshalb enger zusammen, bis eine ganz ausfällt.',
        media: { k: 'scope', rhythm: 'sa_block_wenckebach', h: 'md', speed: 25, label: 'SA-Block II° Typ 1' },
        bullets: [
          { i: '📉', x: '<b>Typisch:</b> PP-Abstände werden vor der Pause zunehmend kürzer.' },
          { i: '⛔', x: '<b>Dann:</b> Eine P-Welle fällt aus — meist samt zugehörigem QRS-Komplex.' },
          { i: '🔁', x: '<b>Danach:</b> Die Periodik beginnt von vorn.' },
          { i: '🩺', x: '<b>Klinisch:</b> Der SA-Block II° Typ 1 ist meist gutartig und oft vagal bedingt. Typ 2 und der Sinusarrest können symptomatisch werden — bis hin zur Synkope.' }
        ]
      },
      { t: 'rhythm',
        q: 'Hier fehlt eine komplette Aktion, die übrigen Abstände sind völlig regelmäßig. Was ist das?',
        media: { k: 'scope', rhythm: 'sa_block_mobitz', h: 'md' },
        opts: ['SA-Block II° Typ 1 (Wenckebach)', 'SA-Block II° Typ 2 (Mobitz)', 'AV-Block II° Mobitz II', 'Sinusarrhythmie'],
        a: 1,
        why: 'Regelmäßige PP-Abstände und dann der Ausfall einer kompletten Aktion — P-Welle und QRS-Komplex zusammen. Die Pause misst genau zwei PP-Abstände. Wäre nur der QRS-Komplex ausgefallen und die P-Welle sichtbar geblieben, läge ein AV-Block vor.'
      },
      { t: 'mc',
        q: 'Im EKG fehlt ein QRS-Komplex, die zugehörige P-Welle ist aber deutlich zu sehen. Welcher Block?',
        opts: ['SA-Block', 'AV-Block', 'Schenkelblock', 'Kein Block — ein Artefakt'], a: 1,
        why: 'Die P-Welle beweist, dass der Vorhof erregt wurde. Das Problem liegt also <em>hinter</em> der P-Welle, in der AV-Überleitung. Beim SA-Block wäre die P-Welle mit ausgefallen.'
      },
      { t: 'mc',
        q: 'Warum ist ein SA-Block I° im normalen EKG nicht zu erkennen?',
        opts: [
          'Weil er zu selten vorkommt',
          'Weil die Aktivität des Sinusknotens im Oberflächen-EKG nicht sichtbar ist',
          'Weil die P-Welle dabei negativ wird',
          'Weil er nur bei schneller Papiergeschwindigkeit auffällt'
        ], a: 1,
        why: 'Das EKG zeigt erst die Vorhoferregung als P-Welle — die Impulsbildung im Sinusknoten selbst bleibt unsichtbar. Eine reine Verzögerung ohne Ausfall hinterlässt deshalb keine Spur.'
      },
      { t: 'match',
        q: 'Ordne jedem Befund sein Kennzeichen zu.',
        pairs: [
          ['SA-Block II° Typ 1', 'PP-Abstände werden vor der Pause kürzer'],
          ['SA-Block II° Typ 2', 'Pause misst genau zwei PP-Abstände'],
          ['SA-Block III°', 'Sinusarrest — Ersatzrhythmus übernimmt'],
          ['AV-Block II°', 'P-Welle bleibt sichtbar, QRS fällt aus']
        ],
        why: 'Der gemeinsame Nenner: Beim SA-Block verschwindet die ganze Aktion, beim AV-Block bleibt die P-Welle stehen. Das ist der schnellste Weg, beide auseinanderzuhalten.'
      },
      { t: 'tf',
        q: 'Beim SA-Block II° Typ 2 ist die Pause exakt doppelt so lang wie ein normaler PP-Abstand.',
        a: true,
        why: 'Genau — weil der Sinusknoten unbeirrt weiterarbeitet und nur eine einzige Überleitung ausfällt. Der nächste Impuls kommt zum planmäßigen Zeitpunkt, die Lücke entspricht daher exakt zwei Zyklen.'
      }
    ]},

    { id: 'l5_1', title: 'AV-Blöcke', icon: '🛑', steps: [
      { t: 'teach',
        h: 'Drei Grade — eine Logik',
        lead: 'Beim AV-Block ist die Überleitung zwischen Vorhof und Kammer gestört. Die Einteilung folgt einer einfachen Frage: Kommt die Erregung an — verspätet, manchmal oder gar nicht?',
        media: { k: 'scope', rhythm: 'avblock1', h: 'md', label: 'AV-Block I°' },
        bullets: [
          { i: '1️⃣', x: '<b>AV-Block I°:</b> PQ-Zeit über 0,20 s, aber <b>jede</b> P-Welle wird übergeleitet. Nur verspätet, nie ausgefallen.' },
          { i: '2️⃣', x: '<b>AV-Block II° Typ Wenckebach (Mobitz I):</b> Die PQ-Zeit wird von Schlag zu Schlag länger, bis ein QRS <b>ausfällt</b>. Danach beginnt das Spiel von vorn.' },
          { i: '2️⃣', x: '<b>AV-Block II° Typ Mobitz II:</b> PQ-Zeit <b>konstant</b>, aber plötzlich fällt ein QRS aus — ohne Vorwarnung. Deutlich gefährlicher.' },
          { i: '3️⃣', x: '<b>AV-Block III°:</b> <b>Keine</b> Überleitung. Vorhöfe und Kammern schlagen völlig unabhängig voneinander.' },
          { i: '🆘', x: '<b>Wie schnell die Kammern dann schlagen, hängt davon ab, wo der Ersatzrhythmus entsteht:</b> aus dem AV-Knoten oder His-Bündel mit <b>40–60/min und schmalem QRS</b> — oder tiefer aus der Kammer mit nur <b>20–40/min und breitem QRS</b>. Der zweite Fall ist deutlich instabiler.' }
        ],
        key: { h: 'Merkhilfe', p: '<b>Wenckebach</b> = „wird länger und länger, bis er weg ist". <b>Mobitz II</b> = „aus heiterem Himmel". Mobitz II und AV-Block III° sind Schrittmacher-Indikationen.' }
      },
      { t: 'rhythm',
        q: 'Die PQ-Zeit ist verlängert, aber auf jede P-Welle folgt ein QRS. Welcher Block?',
        media: { k: 'scope', rhythm: 'avblock1', h: 'md' },
        opts: ['AV-Block I°', 'AV-Block II° Wenckebach', 'AV-Block II° Mobitz II', 'AV-Block III°'],
        a: 0,
        why: 'Verlängerte, aber konstante PQ-Zeit ohne einen einzigen Ausfall: AV-Block I°. Meist harmlos und ohne Therapiebedarf.'
      },
      { t: 'rhythm',
        q: 'Beobachte die PQ-Zeit über mehrere Schläge. Welcher Block liegt vor?',
        media: { k: 'scope', rhythm: 'avblock2_wenckebach', h: 'md', speed: 25 },
        opts: ['AV-Block I°', 'AV-Block II° Typ Wenckebach', 'AV-Block II° Typ Mobitz II', 'AV-Block III°'],
        a: 1,
        why: 'Der Abstand zwischen P-Welle und QRS wächst von Schlag zu Schlag, dann fällt ein QRS ganz aus und der Zyklus beginnt neu — das ist die Wenckebach-Periodik.'
      },
      { t: 'rhythm',
        q: 'Hier schlagen Vorhöfe und Kammern jeweils regelmäßig — aber unabhängig voneinander. Welcher Block?',
        media: { k: 'scope', rhythm: 'avblock3', h: 'md', speed: 25 },
        opts: ['AV-Block I°', 'AV-Block II° Wenckebach', 'AV-Block III° (totaler Block)', 'Vorhofflimmern'],
        a: 2,
        why: 'Beim totalen AV-Block besteht eine AV-Dissoziation: Die P-Wellen laufen in ihrem eigenen Takt, die Kammern werden von einem langsamen Ersatzrhythmus getragen. Die QRS-Komplexe sind meist breit und die Frequenz niedrig — Schrittmacherindikation.'
      },
      { t: 'match',
        q: 'Ordne jedem AV-Block sein Kennzeichen zu.',
        pairs: [
          ['AV-Block I°', 'PQ > 0,20 s, kein Ausfall'],
          ['Wenckebach', 'PQ wird länger, dann Ausfall'],
          ['Mobitz II', 'PQ konstant, plötzlicher Ausfall'],
          ['AV-Block III°', 'Keine Überleitung, Dissoziation']
        ],
        why: 'Diese vier Muster decken die AV-Blöcke vollständig ab. Der entscheidende Blick gilt immer der Beziehung zwischen P-Welle und QRS-Komplex.'
      },
      { t: 'mc',
        q: 'Welcher AV-Block ist am gefährlichsten und macht in der Regel einen Schrittmacher nötig?',
        opts: ['AV-Block I°', 'AV-Block II° Wenckebach', 'AV-Block III°', 'Alle sind gleich gefährlich'],
        a: 2,
        why: 'Beim AV-Block III° hängt der Kreislauf an einem langsamen, unzuverlässigen Ersatzrhythmus. Es droht ein Adams-Stokes-Anfall. Auch der Mobitz II° gilt als Schrittmacherindikation, weil er in einen totalen Block übergehen kann.'
      },
      { t: 'tf',
        q: 'Beim AV-Block I° fällt gelegentlich ein QRS-Komplex aus.',
        a: false,
        why: 'Nein — genau das unterscheidet ihn vom II°. Beim AV-Block I° wird jede P-Welle übergeleitet, nur eben verzögert.'
      }
    ]},

    { id: 'l5_2', title: 'Schenkelblöcke', icon: '🌿', steps: [
      { t: 'teach',
        h: 'Wenn ein Tawara-Schenkel ausfällt',
        lead: 'Fällt einer der beiden Tawara-Schenkel aus, wird die betroffene Kammer nur über Umwege erregt — von der anderen Seite her, langsam von Zelle zu Zelle. Der QRS-Komplex wird dadurch breit.',
        media: { k: 'scope', rhythm: 'rechtsschenkelblock', h: 'md', label: 'Rechtsschenkelblock' },
        bullets: [
          { i: '📐', x: '<b>Gemeinsames Merkmal:</b> QRS ≥ 0,12 s (kompletter Block). Zwischen 0,10 und 0,12 s spricht man von einem inkompletten Block.' },
          { i: '🅼', x: '<b>Rechtsschenkelblock (RSB):</b> „M-förmiger" Komplex (rSR\') in V1/V2, dazu breites S in I, V5 und V6.' },
          { i: '🅼', x: '<b>Linksschenkelblock (LSB):</b> Breites, plumpes R in I, aVL, V5/V6; tiefes S oder QS in V1.' },
          { i: '⚠️', x: '<b>Klinische Wertung:</b> Ein RSB kann auch bei Gesunden vorkommen. Ein LSB ist fast immer Ausdruck einer strukturellen Herzerkrankung — und ein <b>neu aufgetretener</b> LSB gilt bei passender Klinik als Infarktäquivalent.' }
        ],
        key: { h: 'Eselsbrücke', p: 'Schau auf <b>V1</b>: Zeigt der Komplex dort nach <b>oben</b> (M-Form), ist es ein <b>Rechts</b>schenkelblock. Zeigt er nach <b>unten</b> (tiefes S), ist es ein <b>Links</b>schenkelblock.' }
      },
      { t: 'teach',
        h: 'Rechtsschenkelblock über alle Brustwandableitungen',
        lead: 'Der rechte Schenkel fällt aus, die rechte Kammer wird verspätet über Umwege erregt. Diese späte Erregung zeigt sich in V1 als zweiter Gipfel (R\') — und auf der Gegenseite, in V5/V6, als breite, plumpe S-Zacke.',
        media: { k: 'leads', set: 'rsb' },
        bullets: [
          { i: '🅼', x: '<b>V1/V2:</b> <b>rSR\'</b> — die typische M-Form.' },
          { i: '〰️', x: '<b>I, V5, V6:</b> breite, plumpe <b>S-Zacke</b>.' },
          { i: '📐', x: '<b>QRS ≥ 0,12 s.</b> Zwischen 0,10 und 0,12 s: inkompletter Rechtsschenkelblock — häufiger Normalbefund bei jungen Menschen.' }
        ]
      },
      { t: 'teach',
        h: 'Linksschenkelblock — das Spiegelbild',
        lead: 'Beim Linksschenkelblock läuft alles andersherum: In V1 fehlt jede nennenswerte positive Zacke, dafür steht in V5/V6 ein breites, plumpes R.',
        media: { k: 'leads', set: 'lsb' },
        bullets: [
          { i: '⬇️', x: '<b>V1–V3:</b> tiefes S oder <b>QS-Komplex</b>.' },
          { i: '⬆️', x: '<b>I, aVL, V5, V6:</b> breites, plumpes, oft geknotetes <b>R</b> — <em>keine</em> S-Zacke.' },
          { i: '↕️', x: '<b>Diskordante T-Welle:</b> Sie zeigt der Hauptrichtung des QRS entgegen. Beim Linksschenkelblock ist das <b>normal</b> und darf nicht als Ischämie gewertet werden.' }
        ],
        key: { h: 'Aufgepasst — häufige Verwechslung', p: 'Die breite, plumpe <b>S-Zacke in I und V6</b> gehört zum <b>Rechts</b>schenkelblock. Beim <b>Links</b>schenkelblock steht dort umgekehrt ein breites <b>R</b>. Wer das vertauscht, benennt jeden Block falsch herum.' }
      },
      { t: 'mc',
        q: 'In welcher Ableitung findest du beim <b>Rechts</b>schenkelblock eine breite, plumpe S-Zacke?',
        opts: ['In V1 und V2', 'In I, V5 und V6', 'In aVR', 'In keiner — dort steht immer ein R'], a: 1,
        why: 'Die verspätete Erregung der rechten Kammer zeigt nach rechts und damit von den linkslateralen Ableitungen weg. In I, V5 und V6 entsteht deshalb eine breite S-Zacke, in V1 der zweite Gipfel R\'.'
      },
      { t: 'mc',
        q: 'Und beim <b>Links</b>schenkelblock — was steht in Ableitung I und V6?',
        opts: [
          'Eine breite, plumpe S-Zacke',
          'Ein breites, plumpes R ohne S-Zacke',
          'Ein QS-Komplex',
          'Eine normale, schmale Zacke'
        ], a: 1,
        why: 'Genau umgekehrt zum Rechtsschenkelblock: Die verspätete Erregung der linken Kammer läuft auf I und V6 zu und erzeugt dort ein breites, plumpes R. Der QS-Komplex steht beim Linksschenkelblock in V1 bis V3.'
      },
      { t: 'rhythm',
        q: 'Breiter QRS mit zweigipfliger Form. Was passt in V1 dazu?',
        media: { k: 'scope', rhythm: 'rechtsschenkelblock', h: 'md' },
        opts: ['Rechtsschenkelblock', 'Linksschenkelblock', 'AV-Block I°', 'Vorhofflattern'],
        a: 0,
        why: 'Der zweite, höhere Ausschlag (R\') nach dem ersten kleinen R ergibt die typische M-Form in V1 — das Kennzeichen des Rechtsschenkelblocks.'
      },
      { t: 'rhythm',
        q: 'Hier ist der QRS breit und plump, die T-Welle zeigt in die Gegenrichtung. Welcher Block?',
        media: { k: 'scope', rhythm: 'linksschenkelblock', h: 'md' },
        opts: ['Rechtsschenkelblock', 'Linksschenkelblock', 'AV-Block III°', 'Kammertachykardie'],
        a: 1,
        why: 'Der breite, plumpe Komplex mit diskordanter (gegenläufiger) T-Welle ist typisch für den Linksschenkelblock. Diese Diskordanz ist beim LSB normal und darf nicht als Ischämie fehlgedeutet werden.'
      },
      { t: 'num',
        q: 'Ab welcher QRS-Breite (in Sekunden) spricht man von einem kompletten Schenkelblock?',
        a: 0.12, tol: 0.005, unit: 's', dec: true,
        why: 'Ab 0,12 s ist der Block komplett. Zwischen 0,10 und 0,12 s liegt ein inkompletter Schenkelblock vor.'
      },
      { t: 'mc',
        q: 'Warum ist ein neu aufgetretener Linksschenkelblock klinisch bedeutsam?',
        opts: [
          'Weil er immer harmlos ist',
          'Weil er bei passenden Beschwerden als Infarktäquivalent gewertet wird',
          'Weil er die Herzfrequenz senkt',
          'Weil er nur bei Kindern vorkommt'
        ], a: 1,
        why: 'Ein neuer LSB überdeckt die typischen Infarktzeichen und kann selbst Ausdruck eines Verschlusses sein. Bei entsprechender Klinik wird er wie ein STEMI behandelt.'
      },
      { t: 'tf',
        q: 'Ein Rechtsschenkelblock kann auch bei herzgesunden Menschen als Zufallsbefund vorkommen.',
        a: true,
        why: 'Ja, besonders der inkomplette RSB ist ein häufiger Normalbefund bei jungen Menschen. Der Linksschenkelblock dagegen weist fast immer auf eine strukturelle Herzerkrankung hin.'
      }
    ]}
    ]
  },

  /* ---------------------------------------- Einheit 6: Ischämie */
  {
    id: 'u6', title: 'Ischämie & Infarkt', icon: '🚑',
    sub: 'Die ST-Strecke entscheidet',
    color: '#ff6b35', dark: '#d64d1a', light: '#ffeee6',
    lessons: [

    { id: 'l6_1', title: 'ST-Hebung erkennen', icon: '📈', steps: [
      { t: 'teach',
        h: 'Der STEMI — Zeit ist Muskel',
        lead: 'Verschließt sich ein Herzkranzgefäß komplett, stirbt das dahinterliegende Muskelgewebe binnen Stunden ab. Im EKG zeigt sich das als Hebung der ST-Strecke über die Nulllinie.',
        media: { k: 'scope', rhythm: 'stemi', h: 'md', theme: 'paper', label: 'ST-Hebung' },
        bullets: [
          { i: '📏', x: '<b>Signifikanzgrenze:</b> ST-Hebung ≥ 0,1 mV (1 mm) in den Extremitätenableitungen, ≥ 0,2 mV (2 mm) in V2/V3.' },
          { i: '🔗', x: '<b>In zwei benachbarten Ableitungen</b> muss die Hebung nachweisbar sein — eine einzelne Ableitung reicht nicht.' },
          { i: '🪞', x: '<b>Spiegelbildliche ST-Senkung</b> in den gegenüberliegenden Ableitungen stützt die Diagnose zusätzlich.' },
          { i: '⏱️', x: '<b>Konsequenz:</b> Der STEMI ist ein Notfall. Ziel ist die schnellstmögliche Wiedereröffnung des Gefäßes im Herzkatheter.' }
        ],
        key: { h: 'Wo wird gemessen?', p: 'Die Hebung wird am <b>J-Punkt</b> beurteilt — dort, wo der QRS-Komplex endet und die ST-Strecke beginnt. Als Bezugslinie dient die PQ-Strecke.' }
      },
      { t: 'teach',
        h: 'Woraus die Hebung hervorgeht, verrät die Ursache',
        lead: 'Nicht jede ST-Hebung ist ein Infarkt. Der schnellste Unterscheider ist die Form: Es kommt darauf an, aus welchem Teil des QRS-Komplexes die Hebung <em>herauswächst</em>.',
        media: { k: 'scope', rhythm: 'perikarditis', h: 'md', theme: 'paper', label: 'Hebung aus aufsteigendem S' },
        bullets: [
          { i: '🫀', x: '<b>Hebung aus dem absteigenden R-Schenkel:</b> Die Kurve erreicht die Nulllinie gar nicht erst, eine S-Zacke fehlt. Das spricht für einen <b>Infarkt (STEMI)</b>.' },
          { i: '🩹', x: '<b>Hebung aus dem aufsteigenden S-Schenkel:</b> Die S-Zacke ist voll ausgebildet, erst danach steigt die Strecke konkav an — wie eine Hängematte. Das spricht für eine <b>Perikarditis</b>.' },
          { i: '🗺️', x: '<b>Zweites Unterscheidungsmerkmal:</b> Der Infarkt hebt in den Ableitungen <b>eines Gefäßgebiets</b>. Die Perikarditis hebt in <b>vielen Ableitungen gleichzeitig</b>, ohne sich an ein Versorgungsgebiet zu halten — oft zusätzlich mit einer PQ-Senkung.' }
        ],
        key: { h: 'Im Zweifel', p: 'Die Form ist ein Hinweis, kein Beweis. Bei typischen Beschwerden entscheidet die Klinik — im Zweifel wird wie beim STEMI verfahren, nicht abgewartet.' }
      },
      { t: 'rhythm',
        q: 'Aus welchem Teil des QRS-Komplexes wächst diese Hebung heraus?',
        media: { k: 'scope', rhythm: 'stemi', h: 'md', theme: 'paper' },
        opts: [
          'Aus dem aufsteigenden S-Schenkel — Perikarditis',
          'Aus dem absteigenden R-Schenkel — Infarkt',
          'Aus der P-Welle',
          'Es liegt gar keine Hebung vor'
        ], a: 1,
        why: 'Die Kurve fällt vom R-Gipfel ab und geht direkt in die angehobene ST-Strecke über — eine S-Zacke fehlt praktisch. Diese Form spricht für einen ST-Hebungsinfarkt.'
      },
      { t: 'rhythm',
        q: 'Und hier — wie beurteilst du diese Hebung?',
        media: { k: 'scope', rhythm: 'perikarditis', h: 'md', theme: 'paper' },
        opts: [
          'Aus dem absteigenden R-Schenkel — Infarkt',
          'Aus dem aufsteigenden S-Schenkel — eher Perikarditis',
          'Eine ST-Senkung',
          'Ein Schenkelblock'
        ], a: 1,
        why: 'Hier ist die S-Zacke deutlich ausgebildet und erreicht die Nulllinie. Erst aus ihrem aufsteigenden Schenkel hebt sich die ST-Strecke konkav an — typisch für eine Perikarditis, die zudem meist in vielen Ableitungen gleichzeitig hebt.'
      },
      { t: 'mc',
        q: 'Ab welcher Höhe gilt eine ST-Hebung in den Extremitätenableitungen als signifikant?',
        opts: ['≥ 0,05 mV', '≥ 0,1 mV', '≥ 0,3 mV', '≥ 1,0 mV'], a: 1,
        why: 'In den Extremitätenableitungen gilt die Grenze von 0,1 mV (= 1 mm), in V2/V3 gelten wegen der höheren Amplituden strengere Werte von mindestens 0,2 mV.'
      },
      { t: 'mc',
        q: 'Warum genügt eine ST-Hebung in nur einer einzigen Ableitung nicht?',
        opts: [
          'Weil das Gerät dort oft ungenau misst',
          'Weil ein Infarktareal immer von mehreren benachbarten Ableitungen erfasst wird',
          'Weil eine Ableitung nie aussagekräftig ist',
          'Weil man mindestens 12 Ableitungen braucht'
        ], a: 1,
        why: 'Ein durchbluteter Bezirk ist groß genug, dass ihn mehrere benachbarte Ableitungen „sehen". Eine isolierte Hebung in nur einer Ableitung spricht eher für ein Artefakt oder eine Normvariante.'
      },
      { t: 'rhythm',
        q: 'Was fällt an der ST-Strecke auf?',
        media: { k: 'scope', rhythm: 'stemi', h: 'md', theme: 'paper' },
        opts: [
          'Sie liegt auf der Nulllinie',
          'Sie ist deutlich über die Nulllinie angehoben',
          'Sie ist muldenförmig gesenkt',
          'Sie fehlt vollständig'
        ], a: 1,
        why: 'Die ST-Strecke steigt direkt aus dem absteigenden Schenkel der R-Zacke an und verläuft deutlich oberhalb der Grundlinie — das klassische Bild der Hebung beim STEMI.'
      },
      { t: 'mc',
        q: 'Welcher Punkt dient als Referenz für die Beurteilung der ST-Hebung?',
        opts: ['Die Spitze der R-Zacke', 'Der J-Punkt', 'Der Gipfel der T-Welle', 'Der Beginn der P-Welle'], a: 1,
        why: 'Der J-Punkt markiert den Übergang von QRS zu ST-Strecke. Er ist der vereinbarte Messpunkt, als Bezugsniveau dient die PQ-Strecke.'
      },
      { t: 'tf',
        q: 'Eine ST-Hebung kann auch nicht-ischämische Ursachen haben.',
        a: true,
        why: 'Ja. Perikarditis, Linksschenkelblock, Linksherzhypertrophie und die harmlose frühe Repolarisation erzeugen ebenfalls Hebungen. Entscheidend ist immer die Zusammenschau mit Beschwerden und Verlauf.'
      }
    ]},

    { id: 'l6_2', title: 'Infarkt lokalisieren', icon: '🗺️', steps: [
      { t: 'teach',
        h: 'Welche Ableitung zeigt welche Wand?',
        lead: 'Weil jede Ableitung aus einer anderen Richtung schaut, verrät dir das Muster der ST-Hebungen, welches Gefäß verschlossen ist. Das ist im Herzkatheterlabor bares Geld wert.',
        bullets: [
          { i: '🔻', x: '<b>Inferior (Hinterwand):</b> II, III, aVF → meist rechte Koronararterie (RCA).' },
          { i: '🔺', x: '<b>Anteroseptal (Vorderwand):</b> V1–V4 → Ramus interventricularis anterior (RIVA/LAD).' },
          { i: '◀️', x: '<b>Lateral (Seitenwand):</b> I, aVL, V5, V6 → Ramus circumflexus (RCX).' },
          { i: '🔄', x: '<b>Streng posterior:</b> Spiegelbildliche ST-Senkung in V1–V3, Nachweis über die Zusatzableitungen V7–V9.' }
        ],
        key: { h: 'Bei inferiorem Infarkt immer mitdenken', p: 'Schreibe zusätzlich die rechtspräkordialen Ableitungen <b>V3r/V4r</b>. Ein begleitender <b>Rechtsherzinfarkt</b> verändert die Therapie erheblich — Nitrate sind dann gefährlich, weil der rechte Ventrikel auf ausreichende Vorlast angewiesen ist.' }
      },
      { t: 'match',
        q: 'Ordne die Infarktlokalisation den passenden Ableitungen zu.',
        pairs: [
          ['Inferior', 'II, III, aVF'],
          ['Anteroseptal', 'V1–V4'],
          ['Lateral', 'I, aVL, V5, V6'],
          ['Posterior', 'Spiegelbild in V1–V3']
        ],
        why: 'Diese Zuordnung ist eine der lohnendsten Auswendiglern-Aufgaben im EKG: Sie führt direkt vom EKG-Bild zum verschlossenen Gefäß.'
      },
      { t: 'mc',
        q: 'ST-Hebungen in II, III und aVF. Welche Wand ist betroffen?',
        opts: ['Vorderwand', 'Seitenwand', 'Hinterwand (inferior)', 'Keine — das ist ein Normalbefund'], a: 2,
        why: 'II, III und aVF schauen von unten auf das Herz. Hebungen dort bedeuten einen inferioren Infarkt, meist durch einen Verschluss der rechten Koronararterie.'
      },
      { t: 'mc',
        q: 'ST-Hebungen in V1 bis V4. Welches Gefäß ist am wahrscheinlichsten verschlossen?',
        opts: ['Rechte Koronararterie (RCA)', 'Ramus interventricularis anterior (RIVA)', 'Ramus circumflexus (RCX)', 'Arteria pulmonalis'], a: 1,
        why: 'V1–V4 bilden die Vorderwand und das Septum ab. Deren Versorgung übernimmt der RIVA (LAD) — ein Verschluss dort betrifft viel Muskelmasse und wird deshalb gefürchtet.'
      },
      { t: 'mc',
        q: 'Warum sollte man bei einem inferioren Infarkt zusätzlich V3r und V4r ableiten?',
        opts: [
          'Um die Herzfrequenz genauer zu bestimmen',
          'Um einen begleitenden Rechtsherzinfarkt zu erkennen',
          'Um den Lagetyp zu bestimmen',
          'Um Artefakte auszuschließen'
        ], a: 1,
        why: 'Ein Rechtsherzinfarkt begleitet den inferioren Infarkt häufig. Er ändert die Therapie: Nitrate sind kontraindiziert, stattdessen wird Volumen gegeben.'
      },
      { t: 'tf',
        q: 'Der streng posteriore Infarkt zeigt sich im Standard-EKG oft nur als spiegelbildliche ST-Senkung in V1–V3.',
        a: true,
        why: 'Richtig. Weil keine Standardableitung direkt auf die Hinterwand schaut, sieht man dort das Spiegelbild. Bestätigt wird der Verdacht mit den Zusatzableitungen V7–V9.'
      }
    ]},

    { id: 'l6_2b', title: 'R-Aufbau & R-Verlust', icon: '📶', steps: [
      { t: 'teach',
        h: 'Der R-Aufbau von V1 nach V6',
        lead: 'Wandert man mit den Elektroden von V1 nach V6 um den Brustkorb, dreht sich der Blickwinkel allmählich zur linken Kammer hin. Deshalb wächst die R-Zacke stetig an, während die S-Zacke flacher wird. Diesen regelmäßigen Verlauf nennt man R-Aufbau oder R-Progression.',
        media: { k: 'leads', set: 'normal' },
        bullets: [
          { i: '📈', x: '<b>R wächst</b> von V1 bis etwa V5 kontinuierlich an.' },
          { i: '📉', x: '<b>S wird flacher</b> — am tiefsten ist sie in V1/V2.' },
          { i: '🔀', x: '<b>Umschlagzone:</b> Dort, wo R und S gleich groß sind, kippt der Komplex von überwiegend negativ nach überwiegend positiv. Normal liegt sie in <b>V3 oder V4</b>.' }
        ],
        key: { h: 'Warum V6 wieder kleiner ist', p: 'In V5 ist die R-Zacke meist am höchsten; in V6 nimmt sie oft wieder etwas ab, weil die Elektrode weiter von der Herzmuskelmasse entfernt sitzt. Das ist normal und kein Befund.' }
      },
      { t: 'teach',
        h: 'Fehlender R-Aufbau — und was er bedeutet',
        lead: 'Bleibt die R-Zacke über V1 bis V4 winzig oder fehlt ganz, spricht man von gestörter R-Progression oder R-Verlust. Kommen breite Q-Zacken dazu, wird ein abgelaufener Vorderwandinfarkt wahrscheinlich — der abgestorbene Muskel ist elektrisch stumm.',
        media: { k: 'leads', set: 'r_verlust' },
        bullets: [
          { i: '🚩', x: '<b>Pathologische Q-Zacke:</b> mindestens <b>0,04 s breit</b> oder tiefer als <b>ein Viertel</b> der nachfolgenden R-Zacke.' },
          { i: '🫀', x: '<b>In V1–V3</b> ist praktisch jede Q-Zacke verdächtig. Ein reiner QS-Komplex in V1 allein kann dagegen noch eine Normvariante sein.' },
          { i: '✅', x: '<b>Normal dagegen:</b> kleine, schmale q-Zacken in I, aVL, V5 und V6 — die septalen q. Sie gehören dazu.' },
          { i: '⚠️', x: '<b>Nicht überinterpretieren:</b> Ein fehlender R-Aufbau hat auch andere Ursachen — Linksherzhypertrophie, Lungenüberblähung bei COPD, eine Kardiomyopathie oder schlicht zu hoch geklebte Brustwandelektroden.' }
        ],
        key: { h: 'Verdacht, kein Beweis', p: 'Gestörte R-Progression plus pathologische Q-Zacken machen einen abgelaufenen Vorderwandinfarkt <b>wahrscheinlich</b> — beweisend sind sie nicht. Erst die Zusammenschau mit Vorgeschichte, Klinik und Bildgebung sichert die Diagnose. Und vor allem: <b>Erst die Elektrodenlage prüfen.</b>' }
      },
      { t: 'mc',
        q: 'Wo liegt die Umschlagzone (R = S) normalerweise?',
        opts: ['In V1 oder V2', 'In V3 oder V4', 'In V5 oder V6', 'Sie ist nicht bestimmbar'], a: 1,
        why: 'Normal kippt der QRS-Komplex in V3/V4 von überwiegend negativ nach überwiegend positiv. Verschiebt sich das nach rechts oder links, spricht man von einer Rechts- bzw. Linksdrehung der Umschlagzone.'
      },
      { t: 'mc',
        q: 'Ab wann gilt eine Q-Zacke als pathologisch?',
        opts: [
          'Sobald sie überhaupt sichtbar ist',
          'Ab 0,04 s Breite oder tiefer als ein Viertel der folgenden R-Zacke',
          'Erst ab 0,12 s Breite',
          'Wenn sie in V5 und V6 auftritt'
        ], a: 1,
        why: 'Diese beiden Maße sind die klassischen Kriterien. Kleine, schmale q-Zacken in I, aVL, V5 und V6 sind dagegen die normalen Septum-q und völlig unauffällig.'
      },
      { t: 'rhythm',
        q: 'Vergleiche V1 bis V6: Wie beurteilst du den R-Aufbau?',
        media: { k: 'leads', set: 'r_verlust' },
        opts: [
          'Regelrechter R-Aufbau',
          'Gestörter R-Aufbau mit Q-Zacken — Verdacht auf abgelaufenen Vorderwandinfarkt',
          'Typischer Rechtsschenkelblock',
          'Normalbefund bei einem Kind'
        ], a: 1,
        why: 'Über V1 bis V4 bleibt die R-Zacke winzig, stattdessen stehen dort breite Q-Zacken und negative T-Wellen. Das passt zu einem abgelaufenen Vorderwandinfarkt — nach Ausschluss falsch geklebter Elektroden.'
      },
      { t: 'multi',
        q: 'Welche Ursachen kommen für einen gestörten R-Aufbau infrage? (mehrere richtig)',
        opts: [
          'Abgelaufener Vorderwandinfarkt',
          'Falsch platzierte Brustwandelektroden',
          'Lungenüberblähung bei COPD',
          'Eine verlängerte PQ-Zeit'
        ],
        a: [0, 1, 2],
        why: 'Die PQ-Zeit betrifft die Überleitung zwischen Vorhof und Kammer und hat mit dem R-Aufbau nichts zu tun. Infarkt, Elektrodenlage und Lungenüberblähung sind dagegen die häufigsten Erklärungen.'
      },
      { t: 'tf',
        q: 'Kleine, schmale q-Zacken in V5 und V6 sind ein Alarmzeichen.',
        a: false,
        why: 'Im Gegenteil — das sind die normalen septalen q-Zacken. Sie entstehen durch die Erregung der Kammerscheidewand von links nach rechts und gehören zum gesunden EKG.'
      }
    ]},

    { id: 'l6_2c', title: 'Pathologische Q-Zacken', icon: '📉', steps: [
      { t: 'teach',
        h: 'Woher die Q-Zacke überhaupt kommt',
        lead: 'Die Erregung der Kammern beginnt nicht an der Herzspitze, sondern in der <b>Kammerscheidewand</b> — und zwar von links nach rechts. Dieser erste kleine Vektor läuft von den linkslateralen Ableitungen <em>weg</em> und erzeugt dort eine kleine negative Zacke: die septale q-Zacke.',
        media: { k: 'beat', tpl: { q: { a: -0.14, w: 0.009 } }, pq: 0.16 },
        bullets: [
          { i: '📖', x: '<b>Definition:</b> Die Q-Zacke ist die negative Zacke <b>vor</b> der ersten R-Zacke. Kommt sie erst nach einer R-Zacke, heißt sie S-Zacke.' },
          { i: '✅', x: '<b>Normal — die septalen q:</b> klein und schmal in <b>I, aVL, V5 und V6</b>. Sie gehören zum gesunden EKG.' },
          { i: '🚫', x: '<b>In V1 bis V3</b> ist praktisch jede Q-Zacke verdächtig. Ein reiner QS-Komplex allein in V1 kann noch eine Normvariante sein.' }
        ],
        key: { h: 'Warum ein Infarkt eine Q-Zacke macht', p: 'Abgestorbenes Muskelgewebe ist <b>elektrisch stumm</b>. Die Elektrode über der Narbe sieht deshalb kein Signal mehr von dort — sondern nur noch die Erregung, die sich von ihr <em>wegbewegt</em>. Das ergibt einen negativen Ausschlag: ein „Fenster" auf die gegenüberliegende Wand.' }
      },
      { t: 'teach',
        h: 'Wann ist eine Q-Zacke pathologisch?',
        lead: 'Zwei Maße entscheiden — und es genügt, wenn <em>eines</em> davon zutrifft.',
        media: { k: 'leads', leads: [
          { id: 'q normal', tpl: { q: { c: 0.010, w: 0.008, a: -0.09 }, r: { a: 1.35 }, s: { a: -0.18 }, t: { a: 0.30 } } },
          { id: 'Q pathologisch', tpl: { q: { c: 0.018, w: 0.018, a: -0.48 }, r: { c: 0.052, w: 0.013, a: 0.90 }, s: { a: -0.10 }, t: { a: 0.22 } } },
          { id: 'QS', tpl: { q: { c: 0.048, w: 0.032, a: -1.30 }, r: { a: 0 }, s: { a: 0 }, t: { a: -0.20 } } }
        ], mvTop: 1.7, mvBot: -1.7 },
        bullets: [
          { i: '📏', x: '<b>Breite ab 0,04 s.</b> Das ist bei 25 mm/s <b>ein</b> kleines Kästchen, bei 50 mm/s <b>zwei</b>.' },
          { i: '📐', x: '<b>Tiefe über ein Viertel der nachfolgenden R-Zacke.</b>' },
          { i: '🕳️', x: '<b>QS-Komplex:</b> gar keine R-Zacke mehr — nur noch ein einziger negativer Ausschlag. Das größtmögliche Ausmaß.' },
          { i: '🪧', x: '<b>Pardee-Q</b> heißt das pathologische Q nach einem Infarkt. Es dokumentiert die Narbe und bleibt oft <b>lebenslang</b> bestehen.' }
        ],
        key: { h: 'Zwei Kästchen zählen genügt', p: 'Du brauchst kein Lineal. Ist die Q-Zacke breiter als ein kleines Kästchen (bei 25 mm/s) <b>oder</b> tiefer als ein Viertel des folgenden R, ist sie auffällig.' }
      },
      { t: 'teach',
        h: 'Nicht jedes Q ist ein Infarkt',
        lead: 'Bevor du eine Narbe befundest, geh die Alternativen durch. Die häufigste Ursache für ein „neues" Q in der Vorderwand ist banal — und in zwei Minuten behoben.',
        media: { k: 'scope', rhythm: 'alter_infarkt', h: 'md', theme: 'paper', label: 'Abgelaufener Infarkt' },
        bullets: [
          { i: '🔌', x: '<b>Falsch geklebte Elektroden.</b> Zu hoch angebrachte Brustwandelektroden erzeugen Q-Zacken und fehlenden R-Aufbau. Immer zuerst prüfen.' },
          { i: '🌿', x: '<b>Linksschenkelblock.</b> Der QS-Komplex in V1 bis V3 gehört zum Blockbild und darf nicht als Infarkt gewertet werden.' },
          { i: '⚡', x: '<b>WPW-Syndrom.</b> Eine negative Delta-Welle kann eine Q-Zacke täuschend echt imitieren.' },
          { i: '💪', x: '<b>Hypertrophe Kardiomyopathie.</b> Das verdickte Septum erzeugt tiefe, aber typischerweise <em>schmale</em> Q-Zacken.' },
          { i: '🫁', x: '<b>Lungenembolie.</b> Das SI-QIII-TIII-Muster bringt eine Q-Zacke in Ableitung III mit sich.' },
          { i: '🔄', x: '<b>Lagebedingt.</b> Eine isolierte Q-Zacke nur in Ableitung III verschwindet oft bei tiefer Einatmung — dann ist sie harmlos.' }
        ]
      },
      { t: 'num',
        q: 'Ab welcher Breite (in Sekunden) gilt eine Q-Zacke als pathologisch?',
        a: 0.04, tol: 0.002, unit: 's', dec: true,
        why: '0,04 s ist die Grenze — bei 25 mm/s genau ein kleines Kästchen, bei 50 mm/s zwei. Zusammen mit dem Tiefenkriterium ist das der schnellste Test am Streifen.'
      },
      { t: 'mc',
        q: 'Wie tief darf eine Q-Zacke höchstens sein, um noch als normal zu gelten?',
        opts: [
          'Bis zur Hälfte der nachfolgenden R-Zacke',
          'Bis zu einem Viertel der nachfolgenden R-Zacke',
          'Bis zur gleichen Höhe wie die R-Zacke',
          'Die Tiefe spielt keine Rolle'
        ], a: 1,
        why: 'Über einem Viertel der nachfolgenden R-Zacke gilt die Q-Zacke als pathologisch. Beide Kriterien — Breite und Tiefe — werden unabhängig geprüft; eines genügt.'
      },
      { t: 'multi',
        q: 'Wo sind kleine, schmale q-Zacken ein Normalbefund? (mehrere richtig)',
        opts: ['I und aVL', 'V5 und V6', 'V1 bis V3', 'In jeder Ableitung gleichermaßen'],
        a: [0, 1],
        why: 'Die septalen q-Zacken finden sich in den linkslateralen Ableitungen I, aVL, V5 und V6 — dort läuft der Septumvektor von der Elektrode weg. In V1 bis V3 ist dagegen praktisch jede Q-Zacke verdächtig.'
      },
      { t: 'rhythm',
        q: 'Welcher der drei Komplexe ist pathologisch?',
        sub: 'Vergleiche Breite und Tiefe der negativen Zacke jeweils mit der folgenden R-Zacke.',
        media: { k: 'leads', leads: [
          { id: 'A', tpl: { q: { c: 0.010, w: 0.008, a: -0.09 }, r: { a: 1.35 }, s: { a: -0.18 }, t: { a: 0.30 } } },
          { id: 'B', tpl: { q: { c: 0.018, w: 0.018, a: -0.48 }, r: { c: 0.052, w: 0.013, a: 0.90 }, s: { a: -0.10 }, t: { a: 0.22 } } },
          { id: 'C', tpl: { q: { c: 0.010, w: 0.008, a: -0.12 }, r: { a: 1.10 }, s: { a: -0.22 }, t: { a: 0.28 } } }
        ], mvTop: 1.7, mvBot: -1.7 },
        opts: ['A', 'B', 'C', 'Alle drei sind normal'],
        a: 1,
        why: 'In B ist die Q-Zacke deutlich breiter und erreicht mehr als ein Viertel der folgenden R-Zacke. A und C zeigen dagegen die kleinen, schmalen septalen q-Zacken, wie sie in I, aVL, V5 und V6 dazugehören.'
      },
      { t: 'mc',
        q: 'Was bedeutet ein Pardee-Q?',
        opts: [
          'Einen frischen Gefäßverschluss, der sofort behandelt werden muss',
          'Eine Narbe nach abgelaufenem Infarkt, die oft lebenslang sichtbar bleibt',
          'Eine harmlose Normvariante',
          'Ein Zeichen für einen Schenkelblock'
        ], a: 1,
        why: 'Das Pardee-Q entsteht durch elektrisch stummes Narbengewebe. Es dokumentiert einen abgelaufenen Infarkt — oft noch Jahre später — sagt aber nichts über ein akutes Geschehen aus.'
      },
      { t: 'match',
        q: 'Ordne jeder Q-Zacke ihre Ursache zu.',
        pairs: [
          ['Breites Q mit R-Verlust in V1–V4', 'Abgelaufener Vorderwandinfarkt'],
          ['QS in V1–V3 bei breitem QRS', 'Linksschenkelblock'],
          ['Q verschwindet nach Umkleben', 'Falsch platzierte Elektroden'],
          ['Negative Delta-Welle', 'WPW-Syndrom']
        ],
        why: 'Genau diese Differenzialdiagnosen trennen den echten Infarkt vom Fehlalarm. Die Elektrodenlage steht dabei ganz oben auf der Liste — sie ist die häufigste und die am schnellsten zu klärende Ursache.'
      },
      { t: 'tf',
        q: 'Ein pathologisches Q nach einem Infarkt bildet sich in der Regel innerhalb weniger Wochen zurück.',
        a: false,
        why: 'Nein. Das Narbengewebe bleibt elektrisch stumm, deshalb bleibt auch das Pardee-Q meist dauerhaft bestehen. Genau darum lässt sich ein alter Infarkt oft noch Jahre später im EKG ablesen.'
      },
      { t: 'tf',
        q: 'Eine isolierte Q-Zacke nur in Ableitung III kann bei tiefer Einatmung verschwinden und ist dann harmlos.',
        a: true,
        why: 'Richtig. Diese Q-Zacke ist lagebedingt: Bei tiefer Inspiration senkt sich das Zwerchfell, das Herz dreht sich, und die Zacke verschwindet. Isoliert in III ist eine Q-Zacke deshalb kein Infarktbeweis.'
      }
    ]},

    { id: 'l6_3', title: 'NSTEMI & Infarktstadien', icon: '⏳', steps: [
      { t: 'teach',
        h: 'Nicht jeder Infarkt hebt die ST-Strecke',
        lead: 'Beim NSTEMI ist das Gefäß nicht komplett verschlossen. Das EKG kann ST-Senkungen und T-Negativierungen zeigen — oder sogar völlig unauffällig sein. Die Diagnose stellt dann das Troponin.',
        media: { k: 'scope', rhythm: 'nstemi', h: 'md', theme: 'paper', label: 'ST-Senkung mit T-Negativierung' },
        bullets: [
          { i: '📉', x: '<b>ST-Senkung</b> (horizontal oder deszendierend) und <b>T-Negativierung</b> sind typische, aber unspezifische Ischämiezeichen.' },
          { i: '🧪', x: '<b>Entscheidend ist das Troponin:</b> Steigt es an, liegt ein Infarkt (NSTEMI) vor. Bleibt es normal, spricht man von instabiler Angina pectoris.' },
          { i: '🩻', x: '<b>Ein unauffälliges EKG schließt einen Infarkt nicht aus.</b> Bei anhaltenden Beschwerden werden EKG und Labor seriell wiederholt.' }
        ],
        key: { h: 'Der zeitliche Ablauf beim STEMI', p: '<b>Erstickungs-T</b> (hohes, spitzes T in den ersten Minuten) → <b>ST-Hebung</b> → <b>R-Verlust und pathologisches Q</b> → <b>terminale T-Negativierung</b> → als Narbe bleibt oft ein <b>Pardee-Q</b> lebenslang bestehen.' }
      },
      { t: 'order',
        q: 'Bringe die Infarktstadien im EKG in ihre zeitliche Reihenfolge.',
        items: ['Erstickungs-T', 'ST-Hebung', 'Pathologisches Q mit R-Verlust', 'Terminale T-Negativierung'],
        why: 'Das Erstickungs-T erscheint innerhalb von Minuten, die ST-Hebung in den ersten Stunden. Q-Zacke und T-Negativierung entwickeln sich über Tage. Anhand des Musters lässt sich das Infarktalter abschätzen.'
      },
      { t: 'rhythm',
        q: 'Wie beurteilst du diese ST-Strecke und T-Welle?',
        media: { k: 'scope', rhythm: 'nstemi', h: 'md', theme: 'paper' },
        opts: [
          'ST-Hebung mit positivem T',
          'ST-Senkung mit negativem T',
          'Völlig normaler Befund',
          'Sägezahnmuster'
        ], a: 1,
        why: 'Die ST-Strecke verläuft unterhalb der Nulllinie und die T-Welle ist negativ — ein typisches, aber unspezifisches Ischämiezeichen. Die Einordnung als NSTEMI oder instabile Angina gelingt erst mit dem Troponin.'
      },
      { t: 'mc',
        q: 'Was unterscheidet einen NSTEMI von einer instabilen Angina pectoris?',
        opts: [
          'Die Höhe der ST-Hebung',
          'Der Anstieg des Troponins',
          'Die Herzfrequenz',
          'Die Dauer der Beschwerden'
        ], a: 1,
        why: 'Beide zeigen dasselbe klinische und oft dasselbe EKG-Bild. Nur beim NSTEMI ist Herzmuskelgewebe untergegangen — nachweisbar am Troponinanstieg.'
      },
      { t: 'mc',
        q: 'Ein Patient hat typische Brustschmerzen, das EKG ist unauffällig. Was folgt?',
        opts: [
          'Entwarnung, ein Infarkt ist ausgeschlossen',
          'Serielle EKG-Kontrollen und Troponinbestimmung',
          'Sofortige Entlassung',
          'Nur ein Belastungs-EKG in vier Wochen'
        ], a: 1,
        why: 'Ein normales EKG schließt ein akutes Koronarsyndrom nie aus — besonders früh im Verlauf. Bei typischer Klinik gehören wiederholte EKGs und Troponinverläufe dazu.'
      },
      { t: 'tf',
        q: 'Ein pathologisches Q (Pardee-Q) kann als Narbenzeichen lebenslang bestehen bleiben.',
        a: true,
        why: 'Ja. Das breite, tiefe Q entsteht durch abgestorbenes, elektrisch stummes Gewebe. Es dokumentiert einen abgelaufenen Infarkt oft noch Jahre später.'
      }
    ]}
    ]
  },

  /* --------------------------------------- Einheit 7: Spezialfälle */
  {
    id: 'u7', title: 'Spezialfälle', icon: '🔬',
    sub: 'Elektrolyte, Schrittmacher, Synkopen',
    color: '#12b3a6', dark: '#0a8d83', light: '#e2f7f5',
    lessons: [

    { id: 'l7_1', title: 'Elektrolytstörungen', icon: '🧂', steps: [
      { t: 'teach',
        h: 'Kalium schreibt im EKG mit',
        lead: 'Kaliumstörungen verändern das EKG so charakteristisch, dass sich der Verdacht oft schon vor dem Laborwert stellen lässt — was im Notfall Zeit spart.',
        media: { k: 'scope', rhythm: 'hyperkaliaemie', h: 'md', theme: 'paper', label: 'Hyperkaliämie' },
        bullets: [
          { i: '⬆️', x: '<b>Hyperkaliämie:</b> hohe, spitze, „zeltförmige" T-Wellen → flache oder fehlende P-Welle → Verbreiterung des QRS → im Extremfall Sinuswellen-Bild und Herzstillstand.' },
          { i: '⬇️', x: '<b>Hypokaliämie:</b> flache T-Welle → auffällige <b>U-Welle</b> nach dem T → ST-Senkung → Verlängerung der QT(U)-Zeit.' },
          { i: '⚠️', x: '<b>Beide Richtungen sind gefährlich:</b> Sie begünstigen bösartige Rhythmusstörungen — die Hypokaliämie besonders Torsade de pointes.' }
        ],
        key: { h: 'Merksatz', p: '<b>Hyper</b> = <b>hohe, spitze T</b> („Zelt-T"). <b>Hypo</b> = <b>flaches T mit U-Welle</b>. Die U-Welle ist der kleine Nachzügler direkt hinter der T-Welle.' }
      },
      { t: 'rhythm',
        q: 'Auffällig hohe, spitze T-Wellen bei kaum erkennbarer P-Welle. Welche Störung?',
        media: { k: 'scope', rhythm: 'hyperkaliaemie', h: 'md', theme: 'paper' },
        opts: ['Hypokaliämie', 'Hyperkaliämie', 'Hyperkalzämie', 'Normalbefund'],
        a: 1,
        why: 'Zeltförmige T-Wellen mit abgeflachter P-Welle sind das klassische Bild der Hyperkaliämie. Sie ist ein Notfall — bei Dialysepatienten besonders häufig.'
      },
      { t: 'rhythm',
        q: 'Flaches T, dahinter ein zusätzlicher kleiner Ausschlag. Welche Störung?',
        media: { k: 'scope', rhythm: 'hypokaliaemie', h: 'md', theme: 'paper' },
        opts: ['Hyperkaliämie', 'Hypokaliämie', 'Hypernatriämie', 'Normalbefund'],
        a: 1,
        why: 'Das abgeflachte T mit nachfolgender U-Welle und leichter ST-Senkung ist typisch für die Hypokaliämie — sie begünstigt Torsade de pointes.'
      },
      { t: 'match',
        q: 'Ordne die EKG-Veränderung der Ursache zu.',
        pairs: [
          ['Hohe, spitze T-Wellen', 'Hyperkaliämie'],
          ['U-Welle nach dem T', 'Hypokaliämie'],
          ['Muldenförmige ST-Senkung', 'Digitalis'],
          ['Verlängerte QT-Zeit', 'Risiko für Torsade de pointes']
        ],
        why: 'Diese vier Muster gehören zum Standardrepertoire. Die muldenförmige ST-Senkung unter Digitalis zeigt lediglich die Medikamentenwirkung an — sie ist kein Vergiftungszeichen.'
      },
      { t: 'mc',
        q: 'Welche EKG-Veränderung ist bei fortschreitender Hyperkaliämie besonders bedrohlich?',
        opts: [
          'Eine leicht verlängerte PQ-Zeit',
          'Zunehmende QRS-Verbreiterung bis zum Sinuswellenbild',
          'Eine kleine U-Welle',
          'Ein Rechtstyp'
        ], a: 1,
        why: 'Verschmelzen der verbreiterte QRS und die T-Welle zu einer sinusförmigen Kurve, steht der Herzstillstand unmittelbar bevor. Das erfordert sofortige Therapie mit Kalzium, Insulin/Glukose und Dialyse.'
      },
      { t: 'tf',
        q: 'Eine muldenförmige ST-Senkung unter Digitalis beweist eine Überdosierung.',
        a: false,
        why: 'Nein. Die „Muldenform" ist ein reines Wirkungszeichen und tritt auch im therapeutischen Bereich auf. Eine Intoxikation zeigt sich eher durch Rhythmusstörungen und passende Symptome.'
      }
    ]},

    { id: 'l7_1b', title: 'Präexzitation: WPW & LGL', icon: '⚡', steps: [
      { t: 'teach',
        h: 'Wenn die Erregung eine Abkürzung nimmt',
        lead: 'Normalerweise ist der AV-Knoten der einzige Weg vom Vorhof zur Kammer — und er bremst absichtlich. Manche Menschen haben eine zusätzliche Leitungsbahn, die diese Bremse umgeht. Die Kammer wird dadurch <em>vorzeitig</em> erregt: eine Präexzitation.',
        media: { k: 'scope', rhythm: 'wpw', h: 'md', theme: 'paper', label: 'WPW — Delta-Welle' },
        bullets: [
          { i: '⏱️', x: '<b>Erstes Zeichen:</b> Die PQ-Zeit ist <b>kürzer als 0,12 s</b>. Die Erregung war schneller da, als der AV-Knoten erlaubt hätte.' },
          { i: '📐', x: '<b>WPW-Syndrom (Kent-Bündel):</b> kurze PQ-Zeit <b>plus Delta-Welle</b> — ein träger, schräger Anstieg am Beginn des QRS. Der QRS wird dadurch verbreitert.' },
          { i: '➖', x: '<b>LGL-Syndrom (James-Bündel):</b> kurze PQ-Zeit, aber <b>keine</b> Delta-Welle und ein <b>schmaler</b> QRS. Die Bahn umgeht den AV-Knoten und mündet erst hinter ihm.' }
        ],
        key: { h: 'Was die Delta-Welle eigentlich ist', p: 'Die zusätzliche Bahn erregt die Kammermuskulatur direkt — also langsam, von Zelle zu Zelle. Das ergibt den trägen Anstieg. Kurz darauf trifft die reguläre Erregung über das schnelle Leitungssystem ein und vollendet den QRS-Komplex. Der Komplex ist deshalb eine <b>Mischung</b> aus beiden Wegen.' }
      },
      { t: 'teach',
        h: 'Warum das gefährlich werden kann',
        lead: 'Eine zusätzliche Bahn schafft einen <em>Kreis</em>: Die Erregung kann über den AV-Knoten hinunter- und über die Bahn wieder hinauflaufen — immer im Ring herum.',
        bullets: [
          { i: '🔄', x: '<b>Kreisende Erregung (AVRT):</b> löst anfallsartige Schmalkomplextachykardien aus, oft mit 150–250/min.' },
          { i: '🚨', x: '<b>Die eigentliche Gefahr:</b> Bekommt jemand mit WPW zusätzlich <b>Vorhofflimmern</b>, fehlt die bremsende Wirkung des AV-Knotens. Die schnelle Bahn kann sehr viele Impulse durchlassen — bis hin zum Kammerflimmern.' },
          { i: '💊', x: '<b>Praktische Folge:</b> Medikamente, die nur den AV-Knoten bremsen, können in dieser Situation schaden, weil sie die Erregung erst recht über die schnelle Bahn zwingen.' },
          { i: '🩺', x: '<b>Gut zu wissen:</b> Viele Menschen mit Präexzitation im EKG bekommen nie Beschwerden. Von einem <b>Syndrom</b> spricht man erst, wenn Rhythmusstörungen dazukommen.' }
        ]
      },
      { t: 'mc',
        q: 'Welche PQ-Zeit spricht für eine Präexzitation?',
        opts: ['Über 0,20 s', 'Unter 0,12 s', 'Genau 0,16 s', 'Die PQ-Zeit spielt keine Rolle'], a: 1,
        why: 'Unter 0,12 s war die Erregung schneller in der Kammer, als der AV-Knoten es zulässt — sie muss also einen anderen Weg genommen haben. Über 0,20 s liegt umgekehrt ein AV-Block I° vor.'
      },
      { t: 'match',
        q: 'Ordne die Merkmale zu.',
        pairs: [
          ['WPW-Syndrom', 'Kurze PQ-Zeit + Delta-Welle, breiter QRS'],
          ['LGL-Syndrom', 'Kurze PQ-Zeit, kein Delta, schmaler QRS'],
          ['AV-Block I°', 'PQ-Zeit über 0,20 s'],
          ['Kent-Bündel', 'Akzessorische Bahn direkt zur Kammermuskulatur']
        ],
        why: 'Der Unterschied liegt darin, <em>wo</em> die Bahn mündet: Das Kent-Bündel erreicht die Kammermuskulatur direkt und erzeugt deshalb die Delta-Welle. Das James-Bündel mündet hinter dem AV-Knoten ins normale Leitungssystem — der QRS bleibt schmal.'
      },
      { t: 'rhythm',
        q: 'Kurze PQ-Zeit und ein träger Anstieg am QRS-Beginn. Was ist das?',
        media: { k: 'scope', rhythm: 'wpw', h: 'md', theme: 'paper' },
        opts: ['AV-Block I°', 'WPW-Syndrom mit Delta-Welle', 'Linksschenkelblock', 'Hyperkaliämie'],
        a: 1,
        why: 'Der QRS-Komplex beginnt nicht steil, sondern mit einem schrägen Vorlauf — das ist die Delta-Welle. Zusammen mit der verkürzten PQ-Zeit ergibt das die typische WPW-Konstellation.'
      },
      { t: 'tf',
        q: 'Bei WPW-Syndrom ist der QRS-Komplex verbreitert, weil ein Schenkelblock vorliegt.',
        a: false,
        why: 'Nein. Die Verbreiterung entsteht durch die Delta-Welle: Ein Teil der Kammer wird über die akzessorische Bahn langsam von Zelle zu Zelle erregt. Die Leitungsschenkel selbst sind dabei intakt.'
      },
      { t: 'mc',
        q: 'Warum ist Vorhofflimmern bei bestehendem WPW-Syndrom besonders gefährlich?',
        opts: [
          'Weil die Vorhöfe dabei stillstehen',
          'Weil die akzessorische Bahn nicht bremst und sehr viele Impulse auf die Kammer überleiten kann',
          'Weil die Delta-Welle dann verschwindet',
          'Weil die PQ-Zeit dabei zu lang wird'
        ], a: 1,
        why: 'Der AV-Knoten schützt die Kammern normalerweise, indem er die schnellen Flimmerimpulse ausfiltert. Die akzessorische Bahn kennt diese Schutzfunktion nicht — es drohen extrem hohe Kammerfrequenzen bis hin zum Kammerflimmern.'
      }
    ]},

    { id: 'l7_2', title: 'QT-Zeit & Schrittmacher', icon: '⏱️', steps: [
      { t: 'teach',
        h: 'Die QT-Zeit — unterschätzt und gefährlich',
        lead: 'Eine verlängerte QT-Zeit ist der Nährboden für Torsade de pointes. Weil sie stark von der Herzfrequenz abhängt, wird sie zur QTc korrigiert.',
        media: { k: 'scope', rhythm: 'langes_qt', h: 'md', theme: 'paper', label: 'Verlängerte QT-Zeit' },
        bullets: [
          { i: '📐', x: '<b>Normwert QTc:</b> unter 0,44 s bei Männern, unter 0,46 s bei Frauen.' },
          { i: '⚠️', x: '<b>Eine absolute QT-Zeit allein sagt nichts.</b> Ein Wert von 0,50 s ist bei 45/min völlig normal und bei 100/min hochpathologisch. Deshalb immer die Frequenz mitdenken — oder gleich die QTc bestimmen.' },
          { i: '💊', x: '<b>Häufige Auslöser:</b> Medikamente (bestimmte Antiarrhythmika, Antibiotika, Antipsychotika), Hypokaliämie, Hypomagnesiämie und angeborene Long-QT-Syndrome.' },
          { i: '🌀', x: '<b>Gefahr:</b> Je länger die QT-Zeit, desto größer das Risiko für Torsade de pointes.' },
          { i: '👀', x: '<b>Faustregel am Streifen:</b> Reicht die QT-Zeit über die Hälfte des RR-Abstands hinaus, ist sie bei normaler Frequenz verdächtig lang.' }
        ]
      },
      { t: 'teach',
        h: 'Schrittmacher im EKG erkennen',
        lead: 'Ein Herzschrittmacher hinterlässt eine unverkennbare Signatur: einen sehr schmalen, senkrechten Ausschlag direkt vor dem Komplex, den er auslöst.',
        media: { k: 'scope', rhythm: 'schrittmacher', h: 'md', label: 'Kammerstimulation' },
        bullets: [
          { i: '📍', x: '<b>Spike:</b> Der schmale senkrechte Strich ist der Stimulationsimpuls.' },
          { i: '📐', x: '<b>Danach ein breiter QRS-Komplex</b>, weil die Erregung nicht über das normale Leitungssystem läuft, sondern von der Elektrodenspitze aus.' },
          { i: '🔍', x: '<b>Spike vor der P-Welle</b> = Vorhofstimulation, <b>Spike vor dem QRS</b> = Kammerstimulation, beides = Zweikammersystem.' }
        ],
        key: { h: 'Fehlfunktion erkennen', p: '<b>Exit-Block:</b> Es folgt kein Komplex auf den Spike. <b>Oversensing:</b> Der Schrittmacher stimuliert nicht, obwohl er müsste. <b>Undersensing:</b> Er stimuliert in den Eigenrhythmus hinein.' }
      },
      { t: 'rhythm',
        q: 'Was verrät dir der schmale senkrechte Strich vor jedem Komplex?',
        media: { k: 'scope', rhythm: 'schrittmacher', h: 'md' },
        opts: [
          'Ein Artefakt durch Muskelzittern',
          'Einen Schrittmacher-Spike',
          'Eine besonders hohe P-Welle',
          'Kammerflimmern'
        ], a: 1,
        why: 'Der scharfe, sehr schmale Ausschlag ist der Stimulationsimpuls des Schrittmachers. Der folgende breite QRS-Komplex zeigt, dass die Kammer stimuliert wird.'
      },
      { t: 'mc',
        q: 'Warum wird die QT-Zeit frequenzkorrigiert (QTc) angegeben?',
        opts: [
          'Weil das EKG-Gerät ungenau misst',
          'Weil die QT-Zeit mit steigender Herzfrequenz kürzer wird',
          'Weil sie sonst zu klein wäre',
          'Weil sie vom Lagetyp abhängt'
        ], a: 1,
        why: 'Bei schnellem Herzschlag verkürzt sich die QT-Zeit physiologisch. Ohne Korrektur (z. B. nach Bazett) ließen sich Werte bei unterschiedlichen Frequenzen nicht vergleichen.'
      },
      { t: 'rhythm',
        q: 'Beurteile die Dauer vom QRS-Beginn bis zum Ende der T-Welle.',
        media: { k: 'scope', rhythm: 'langes_qt', h: 'md', theme: 'paper' },
        opts: ['Auffällig kurz', 'Normal', 'Auffällig lang', 'Nicht beurteilbar'],
        a: 2,
        why: 'Die T-Welle liegt weit vom QRS entfernt — das QT-Intervall nimmt einen großen Teil des RR-Abstands ein. Diese Konstellation birgt das Risiko für Torsade de pointes.'
      },
      { t: 'multi',
        q: 'Was kann die QT-Zeit verlängern? (mehrere richtig)',
        opts: [
          'Hypokaliämie',
          'Bestimmte Medikamente',
          'Angeborenes Long-QT-Syndrom',
          'Körperliche Anstrengung'
        ],
        a: [0, 1, 2],
        why: 'Anstrengung erhöht die Herzfrequenz und verkürzt die QT-Zeit dadurch. Elektrolytstörungen, QT-verlängernde Medikamente und genetische Syndrome verlängern sie dagegen.'
      },
      { t: 'tf',
        q: 'Ein breiter QRS-Komplex nach einem Schrittmacher-Spike ist ein Zeichen für eine Fehlfunktion.',
        a: false,
        why: 'Nein, das ist völlig erwartbar. Die Erregung startet an der Elektrodenspitze und breitet sich langsam über die Muskulatur aus — genau wie bei einer ventrikulären Extrasystole.'
      }
    ]},

    { id: 'l7_3', title: 'EKG bei Synkopen', icon: '💫', steps: [
      { t: 'teach',
        h: 'Kurz weg — und dann? ',
        lead: 'Eine Synkope ist eine kurze Bewusstlosigkeit durch eine vorübergehende Minderdurchblutung des Gehirns: plötzlicher Beginn, kurze Dauer, vollständige Erholung von allein. Die allermeisten sind harmlos. Genau darin liegt die Schwierigkeit — die wenigen kardialen Synkopen musst du aus der großen Masse herausfischen.',
        bullets: [
          { i: '🧠', x: '<b>Reflexsynkope (vasovagal):</b> die häufigste Form. Auslöser wie Schmerz, langes Stehen, Hitze oder Blutsehen; typische Vorboten (Übelkeit, Schwitzen, Ohrensausen, Schwarzwerden vor den Augen).' },
          { i: '🧍', x: '<b>Orthostatische Synkope:</b> beim Aufstehen, oft bei Volumenmangel oder unter blutdrucksenkenden Medikamenten.' },
          { i: '🫀', x: '<b>Kardiale Synkope:</b> Rhythmusstörung oder strukturelle Herzerkrankung. Die seltenste Gruppe — aber die einzige, die tödlich enden kann.' }
        ],
        key: { h: 'Warum das EKG so zentral ist', p: 'Bei der kardialen Synkope ist das EKG oft der <b>einzige</b> Hinweis, den du in der Akutsituation überhaupt bekommst. Deshalb gehört zu jeder Synkope ein 12-Kanal-EKG — auch wenn der Patient längst wieder wach und beschwerdefrei ist.' }
      },
      { t: 'teach',
        h: 'Die roten Flaggen',
        lead: 'Drei Fragen trennen die harmlose von der gefährlichen Synkope schneller als alles andere: <em>Wie lange war der Patient weg? Was war unmittelbar davor? Und was zeigt das EKG?</em>',
        bullets: [
          { i: '⏱️', x: '<b>Dauer:</b> Eine vasovagale Synkope dauert meist <b>höchstens eine Minute</b>. Wer länger weg war, gehört genauer angesehen.' },
          { i: '💓', x: '<b>Palpitationen unmittelbar davor:</b> Hat der Patient vor dem Umkippen sein Herz rasen oder stolpern gespürt, ist die Synkope <b>kardial</b>, bis das Gegenteil bewiesen ist.' },
          { i: '🏃', x: '<b>Unter Belastung:</b> Eine Synkope <em>während</em> der Anstrengung ist kardial. (Kurz <em>danach</em> ist meist vasovagal.)' },
          { i: '🛏️', x: '<b>Im Liegen oder Sitzen:</b> Ohne Orthostase fehlt der vasovagale Mechanismus — verdächtig.' },
          { i: '⚡', x: '<b>Ohne jede Vorwarnung:</b> Der „Sturz wie ein Brett" ohne Prodromi, oft mit Verletzung, spricht gegen eine Reflexsynkope.' },
          { i: '👪', x: '<b>Plötzlicher Herztod in der Familie</b> vor dem 40. Lebensjahr oder eine bekannte strukturelle Herzerkrankung.' }
        ],
        key: { h: 'Der Kernsatz', p: 'Vorboten und Auslöser sprechen <b>für</b> eine harmlose Reflexsynkope. Palpitationen, Belastung, Liegen und fehlende Vorwarnung sprechen <b>dagegen</b>.' }
      },
      { t: 'teach',
        h: 'Die Fahndungsliste im EKG',
        lead: 'Nach diesen Befunden suchst du gezielt, wenn ein Patient wegen einer Synkope vor dir liegt. Fast alle kennst du aus den vorherigen Lektionen — hier stehen sie unter einer gemeinsamen Fragestellung.',
        media: { k: 'scope', rhythm: 'langes_qt', h: 'md', theme: 'paper', label: 'Verlängerte QT-Zeit' },
        bullets: [
          { i: '⏳', x: '<b>QT-Zeit:</b> Eine QTc über <b>500 ms</b> gilt als kardial auffällig und bringt ein deutliches Risiko für Torsade de pointes mit sich. Auch eine auffällig <em>kurze</em> QT-Zeit ist verdächtig.' },
          { i: '⚡', x: '<b>Delta-Welle mit kurzer PQ-Zeit:</b> Präexzitation (WPW).' },
          { i: '🪧', x: '<b>Brugada-Muster:</b> gewölbte ST-Hebung mit negativem T in V1/V2.' },
          { i: '🚧', x: '<b>Leitungsstörungen:</b> AV-Block II° oder III°, bifaszikulärer Block, ausgeprägte Bradykardie oder lange Pausen.' },
          { i: '🫀', x: '<b>Strukturelle Hinweise:</b> pathologische Q-Zacken nach altem Infarkt, Zeichen einer Linksherzhypertrophie.' },
          { i: '💫', x: '<b>Ventrikuläre Extrasystolen in Salven</b> oder eine dokumentierte Kammertachykardie.' }
        ],
        key: { h: 'Wichtig zur QT-Zeit', p: 'Das ist kein Widerspruch zur Normwert-Lektion: <b>über 440 ms (♂) bzw. 460 ms (♀)</b> ist die QTc verlängert. Die <b>500 ms</b> sind die Schwelle, ab der es bei einer Synkope klar alarmierend wird.' }
      },
      { t: 'num',
        q: 'Ab welcher QTc (in Millisekunden) gilt eine Synkope als kardial auffällig?',
        a: 500, tol: 0, unit: 'ms',
        why: 'Ab einer QTc über 500 ms steigt das Risiko für Torsade de pointes deutlich. Bei einer Synkope ist das ein klares Alarmzeichen — auch wenn der Patient inzwischen wieder völlig unauffällig wirkt.'
      },
      { t: 'mc',
        q: 'Wie lange dauert eine vasovagale Synkope typischerweise?',
        opts: [
          'Höchstens etwa eine Minute',
          'Ungefähr fünf Minuten',
          'Zehn bis fünfzehn Minuten',
          'Das ist völlig unvorhersehbar'
        ], a: 0,
        why: 'Die vasovagale Synkope ist kurz — meist unter einer Minute. Sobald der Patient liegt, normalisiert sich die Hirndurchblutung von allein. Eine deutlich längere Bewusstlosigkeit passt nicht zur Reflexsynkope und muss weiter abgeklärt werden.'
      },
      { t: 'mc',
        q: 'Ein Patient berichtet, er habe unmittelbar vor dem Umkippen sein Herz rasen gespürt. Wie ordnest du das ein?',
        opts: [
          'Typisch vasovagal — das Herzrasen kommt von der Aufregung',
          'Kardiale Synkope, bis das Gegenteil bewiesen ist',
          'Orthostatische Synkope',
          'Ein Hinweis auf einen Krampfanfall'
        ], a: 1,
        why: 'Palpitationen unmittelbar vor der Synkope sprechen dafür, dass eine Rhythmusstörung die Ursache war. Das ist eine der stärksten roten Flaggen überhaupt — der Patient gehört ans Monitoring.'
      },
      { t: 'multi',
        q: 'Welche Angaben sind rote Flaggen für eine kardiale Synkope? (mehrere richtig)',
        opts: [
          'Palpitationen unmittelbar vor dem Ereignis',
          'Synkope während körperlicher Anstrengung',
          'Übelkeit, Schwitzen und Schwarzwerden vor den Augen als Vorboten',
          'Plötzlicher Herztod bei einem Verwandten unter 40 Jahren'
        ],
        a: [0, 1, 3],
        why: 'Vorboten wie Übelkeit, Schwitzen und Augenflimmern sind gerade das Kennzeichen der <em>harmlosen</em> Reflexsynkope. Palpitationen, Belastung und eine familiäre Vorbelastung sprechen dagegen für eine kardiale Ursache.'
      },
      { t: 'rhythm',
        q: 'Synkope ohne Vorwarnung. Was fällt an diesem EKG auf?',
        media: { k: 'scope', rhythm: 'langes_qt', h: 'md', theme: 'paper' },
        opts: [
          'Eine ST-Hebung',
          'Eine deutlich verlängerte QT-Zeit',
          'Ein Rechtsschenkelblock',
          'Ein völlig unauffälliger Befund'
        ], a: 1,
        why: 'Die T-Welle liegt weit vom QRS-Komplex entfernt — die QT-Zeit nimmt einen großen Teil des RR-Abstands ein. Bei einer Synkope ist das ein Alarmbefund: Es droht eine Torsade de pointes.'
      },
      { t: 'rhythm',
        q: 'Junger Patient, Synkope aus dem Schlaf heraus. Welches Muster siehst du?',
        sub: 'Achte auf V1 und V2 — und darauf, dass V3 unauffällig ist.',
        media: { k: 'leads', set: 'brugada', seconds: 1.7 },
        opts: [
          'Perikarditis',
          'Brugada-Muster',
          'Vorderwandinfarkt',
          'Linksschenkelblock'
        ], a: 1,
        why: 'In V1 und V2 steigt die ST-Strecke nach dem QRS-Komplex hoch an, wölbt sich nach oben und fällt in ein negatives T ab — das gewölbte („coved") Brugada-Muster. In V3 ist davon nichts mehr zu sehen. Es ist mit dem plötzlichen Herztod assoziiert und gehört immer kardiologisch abgeklärt.'
      },
      { t: 'match',
        q: 'Ordne den EKG-Befund der Gefahr zu, für die er steht.',
        pairs: [
          ['QTc über 500 ms', 'Torsade de pointes'],
          ['Delta-Welle, kurze PQ-Zeit', 'WPW mit schneller Überleitung'],
          ['Gewölbte ST-Hebung in V1/V2', 'Brugada-Syndrom'],
          ['AV-Block III°', 'Asystolie / Adams-Stokes-Anfall']
        ],
        why: 'Diese vier Muster sind die wichtigsten EKG-Befunde, nach denen du bei einer Synkope gezielt suchst. Jeder von ihnen kann eine erneute, dann möglicherweise tödliche Episode ankündigen.'
      },
      { t: 'tf',
        q: 'Ein unauffälliges EKG schließt eine kardiale Ursache der Synkope sicher aus.',
        a: false,
        why: 'Nein. Rhythmusstörungen treten anfallsweise auf — zwischen den Episoden kann das EKG völlig normal sein. Ein unauffälliges EKG senkt das Risiko, beweist aber nichts. Entscheidend bleibt die Zusammenschau mit der Vorgeschichte.'
      },
      { t: 'mc',
        q: 'Welche Konstellation spricht am ehesten für eine harmlose Reflexsynkope?',
        opts: [
          'Synkope beim Gewichtheben, ohne Vorboten',
          'Langes Stehen in der Hitze, Übelkeit und Schwitzen vorher, nach 30 Sekunden wieder wach',
          'Synkope im Sitzen mit vorangehendem Herzrasen',
          'Synkope mit Kopfplatzwunde und ohne Erinnerung an Vorboten'
        ], a: 1,
        why: 'Typischer Auslöser, typische Vorboten, kurze Dauer, rasche vollständige Erholung — das ist das Lehrbuchbild der vasovagalen Synkope. Die drei anderen Konstellationen enthalten jeweils mindestens eine rote Flagge.'
      }
    ]}
    ]
  }
  ];

  /* ======================================================================
     BIBLIOTHEK — Nachschlagewerk
     ====================================================================== */

  const LIBRARY = [
    { id: 'sinus', cat: 'Normalbefund', name: 'Sinusrhythmus',
      desc: 'Vor jedem QRS eine P-Welle, konstante PQ-Zeit, Frequenz 60–100/min. Der Referenzbefund, mit dem du alles andere vergleichst.',
      tags: [['Normal', 'ok'], ['60–100/min', '']] },
    { id: 'sinusbradykardie', cat: 'Frequenz', name: 'Sinusbradykardie',
      desc: 'Regelrechter Sinusrhythmus unter 60/min. Bei Sportlern und im Schlaf normal; sonst an Medikamente, Hypothyreose oder erhöhten Hirndruck denken.',
      tags: [['< 60/min', 'warn']] },
    { id: 'sinustachykardie', cat: 'Frequenz', name: 'Sinustachykardie',
      desc: 'Sinusrhythmus über 100/min. Fast immer Folge einer anderen Ursache: Fieber, Schmerz, Volumenmangel, Angst, Hyperthyreose.',
      tags: [['> 100/min', 'warn']] },
    { id: 'sinusarrhythmie', cat: 'Normalbefund', name: 'Respiratorische Sinusarrhythmie',
      desc: 'Die Frequenz schwankt mit der Atmung — beim Einatmen schneller. Bei jungen Menschen ein Zeichen von Gesundheit.',
      tags: [['Harmlos', 'ok']] },
    { id: 'vorhofflimmern', cat: 'Vorhof', name: 'Vorhofflimmern',
      desc: 'Keine P-Wellen, unruhige Grundlinie, absolut unregelmäßige RR-Abstände bei schmalem QRS. Häufigste anhaltende Rhythmusstörung.',
      tags: [['Absolute Arrhythmie', 'warn'], ['Schlaganfallrisiko', 'crit']] },
    { id: 'vorhofflattern', cat: 'Vorhof', name: 'Vorhofflattern',
      desc: 'Sägezahnförmige Flatterwellen mit etwa 300/min, meist mit 2:1-Überleitung — daraus resultiert eine auffällig konstante Kammerfrequenz um 150/min.',
      tags: [['Sägezahn', ''], ['oft 150/min', 'warn']] },
    { id: 'avnrt', cat: 'Tachykardie', name: 'Supraventrikuläre Tachykardie',
      desc: 'Schmalkomplextachykardie, sehr regelmäßig, meist 150–220/min. P-Wellen sind nicht abgrenzbar. Vagusmanöver und Adenosin sind die ersten Schritte.',
      tags: [['Schmal', ''], ['Regelmäßig', '']] },
    { id: 'ves', cat: 'Extrasystolen', name: 'Ventrikuläre Extrasystolen',
      desc: 'Vorzeitig einfallende breite, verformte Komplexe ohne vorangehende P-Welle, gefolgt von einer kompensatorischen Pause.',
      tags: [['Breit', ''], ['Meist harmlos', 'ok']] },
    { id: 'sves', cat: 'Extrasystolen', name: 'Supraventrikuläre Extrasystolen',
      desc: 'Vorzeitiger Schlag mit schmalem QRS und abweichend geformter P-Welle. In der Regel ohne Krankheitswert.',
      tags: [['Schmal', ''], ['Harmlos', 'ok']] },
    { id: 'kammertachykardie', cat: 'Tachykardie', name: 'Ventrikuläre Tachykardie',
      desc: 'Breite Komplexe über 100/min ohne erkennbare P-Wellen. Jede Breitkomplextachykardie gilt bis zum Beweis des Gegenteils als VT.',
      tags: [['Breit', 'crit'], ['Notfall', 'crit']] },
    { id: 'torsade', cat: 'Tachykardie', name: 'Torsade de pointes',
      desc: 'Spindelförmig um die Grundlinie tanzende Kammertachykardie bei verlängerter QT-Zeit. Therapie unter anderem mit Magnesium.',
      tags: [['Long QT', 'crit'], ['Magnesium', '']] },
    { id: 'kammerflimmern', cat: 'Reanimation', name: 'Kammerflimmern',
      desc: 'Völlig chaotische Aktivität ohne abgrenzbare Komplexe. Das Herz zittert, ohne auszuwerfen. Defibrillierbar — sofort schocken.',
      tags: [['Defibrillieren', 'crit'], ['Kreislaufstillstand', 'crit']] },
    { id: 'asystolie', cat: 'Reanimation', name: 'Asystolie',
      desc: 'Nulllinie ohne elektrische Aktivität. Nicht defibrillierbar — Herzdruckmassage und Adrenalin sind die Therapie.',
      tags: [['Nicht schocken', 'crit'], ['CPR', 'crit']] },
    { id: 'sa_block_wenckebach', cat: 'SA-Block', name: 'SA-Block II° Typ 1 (Wenckebach)',
      desc: 'Die PP-Abstände werden vor der Pause kürzer, dann fällt eine komplette Aktion aus — P-Welle samt QRS-Komplex. Meist gutartig und oft vagal bedingt.',
      tags: [['PP wird kürzer', ''], ['Meist gutartig', 'ok']] },
    { id: 'sa_block_mobitz', cat: 'SA-Block', name: 'SA-Block II° Typ 2 (Mobitz)',
      desc: 'Regelmäßige PP-Abstände, dann fällt eine komplette Aktion aus. Die Pause misst genau zwei PP-Abstände. Kann symptomatisch werden.',
      tags: [['Pause = 2× PP', 'warn'], ['Ganze Aktion fehlt', '']] },
    { id: 'wpw', cat: 'Präexzitation', name: 'WPW-Syndrom',
      desc: 'Kurze PQ-Zeit unter 0,12 s mit Delta-Welle — ein träger Anstieg am QRS-Beginn. Die Kammer wird über eine akzessorische Bahn vorzeitig erregt.',
      tags: [['Delta-Welle', 'warn'], ['PQ < 0,12 s', '']] },
    { id: 'lgl', cat: 'Präexzitation', name: 'LGL-Syndrom',
      desc: 'Kurze PQ-Zeit, aber ohne Delta-Welle und mit schmalem QRS. Die Bahn umgeht den AV-Knoten und mündet erst hinter ihm.',
      tags: [['PQ < 0,12 s', ''], ['QRS schmal', '']] },
    { id: 'avblock1', cat: 'AV-Block', name: 'AV-Block I°',
      desc: 'PQ-Zeit über 0,20 s, aber jede P-Welle wird übergeleitet. Meist ein harmloser Zufallsbefund ohne Therapiebedarf.',
      tags: [['PQ > 0,20 s', ''], ['Harmlos', 'ok']] },
    { id: 'avblock2_wenckebach', cat: 'AV-Block', name: 'AV-Block II° Wenckebach',
      desc: 'Die PQ-Zeit nimmt von Schlag zu Schlag zu, bis ein QRS ausfällt. Danach beginnt der Zyklus von vorn. Meist gutartig.',
      tags: [['Periodik', ''], ['Meist gutartig', 'ok']] },
    { id: 'avblock2_mobitz', cat: 'AV-Block', name: 'AV-Block II° Mobitz II',
      desc: 'Konstante PQ-Zeit, aber plötzlich fällt ein QRS aus. Kann in einen totalen Block übergehen — Schrittmacherindikation.',
      tags: [['Plötzlicher Ausfall', 'warn'], ['Schrittmacher', 'warn']] },
    { id: 'avblock3', cat: 'AV-Block', name: 'AV-Block III° (totaler Block)',
      desc: 'Vorhöfe und Kammern schlagen völlig unabhängig. Der Kreislauf hängt an einem langsamen Ersatzrhythmus. Schrittmacherindikation.',
      tags: [['AV-Dissoziation', 'crit'], ['Schrittmacher', 'crit']] },
    { id: 'rechtsschenkelblock', cat: 'Schenkelblock', name: 'Rechtsschenkelblock',
      desc: 'QRS ≥ 0,12 s mit M-förmigem rSR\' in V1/V2 und breitem S in I, V5, V6. Kann auch bei Herzgesunden vorkommen.',
      tags: [['M in V1', ''], ['Oft harmlos', 'ok']] },
    { id: 'linksschenkelblock', cat: 'Schenkelblock', name: 'Linksschenkelblock',
      desc: 'QRS ≥ 0,12 s mit breitem, plumpem R in I, aVL, V5/V6 und diskordanter T-Welle. Neu aufgetreten gilt er als Infarktäquivalent.',
      tags: [['Strukturelle Erkrankung', 'warn'], ['Neu = Alarm', 'crit']] },
    { id: 'stemi', cat: 'Ischämie', name: 'STEMI — ST-Hebung',
      desc: 'ST-Hebung ≥ 0,1 mV in mindestens zwei benachbarten Ableitungen. Kompletter Gefäßverschluss — sofortige Katheterindikation.',
      tags: [['Notfall', 'crit'], ['Herzkatheter', 'crit']] },
    { id: 'stemi_spaet', cat: 'Ischämie', name: 'Infarkt im Verlauf',
      desc: 'Die ST-Hebung bildet sich zurück, das R wird kleiner und ein pathologisches Q entsteht — Zeichen des fortgeschrittenen Infarkts.',
      tags: [['Pardee-Q', 'warn'], ['R-Verlust', '']] },
    { id: 'alter_infarkt', cat: 'Ischämie', name: 'Abgelaufener Infarkt (Pardee-Q)',
      desc: 'Breite, tiefe Q-Zacke mit kleinem Rest-R und negativem T, ohne ST-Hebung. Zeichen einer alten Narbe — bleibt oft lebenslang bestehen.',
      tags: [['Pardee-Q', 'warn'], ['Nicht akut', 'ok']] },
    { id: 'nstemi', cat: 'Ischämie', name: 'ST-Senkung / NSTEMI',
      desc: 'Horizontale oder deszendierende ST-Senkung mit T-Negativierung. Die Abgrenzung zur instabilen Angina gelingt nur über das Troponin.',
      tags: [['Troponin', 'warn'], ['Ischämie', 'warn']] },
    { id: 'perikarditis', cat: 'Ischämie', name: 'Perikarditis',
      desc: 'Konkave ST-Hebungen in vielen Ableitungen zugleich, dazu PQ-Senkung. Anders als beim Infarkt fehlt die Zuordnung zu einem Gefäßgebiet.',
      tags: [['Konkav', ''], ['Viele Ableitungen', '']] },
    { id: 'hyperkaliaemie', cat: 'Elektrolyte', name: 'Hyperkaliämie',
      desc: 'Hohe, spitze „zeltförmige" T-Wellen, flache P-Welle, zunehmend breiter QRS. Im Extremfall Sinuswellenbild und Herzstillstand.',
      tags: [['Zelt-T', 'crit'], ['Notfall', 'crit']] },
    { id: 'hypokaliaemie', cat: 'Elektrolyte', name: 'Hypokaliämie',
      desc: 'Flache T-Welle mit deutlicher U-Welle, ST-Senkung und verlängerte QT(U)-Zeit. Begünstigt Torsade de pointes.',
      tags: [['U-Welle', 'warn'], ['Torsade-Risiko', 'warn']] },
    { id: 'langes_qt', cat: 'Synkope', name: 'Verlängerte QT-Zeit',
      desc: 'QTc über 0,44 s (♂) bzw. 0,46 s (♀). Ab 500 ms bei einer Synkope klar alarmierend. Ursachen: Medikamente, Elektrolytstörungen, angeborene Syndrome.',
      tags: [['Torsade-Risiko', 'crit'], ['ab 500 ms Alarm', 'warn']] },
    { id: 'brugada', cat: 'Synkope', name: 'Brugada-Muster (Typ 1)',
      desc: 'Gewölbte („coved") ST-Hebung in V1/V2, die in ein negatives T abfällt. Assoziiert mit dem plötzlichen Herztod — bei Synkope immer kardiologisch abklären.',
      tags: [['Plötzlicher Herztod', 'crit'], ['nur V1/V2', '']] },
    { id: 'digitalis', cat: 'Sonstiges', name: 'Digitaliswirkung',
      desc: 'Muldenförmige ST-Senkung („Lyszeichen") mit verkürzter QT-Zeit. Ein Wirkungszeichen, kein Beweis für eine Überdosierung.',
      tags: [['Muldenform', '']] },
    { id: 'schrittmacher', cat: 'Sonstiges', name: 'Schrittmacherrhythmus',
      desc: 'Schmaler senkrechter Spike vor jedem stimulierten Komplex, danach ein breiter QRS. Position des Spikes verrät die Stimulationskammer.',
      tags: [['Spike', ''], ['Breiter QRS', '']] }
  ];

  /* --------------------------------------------- Trainer: Kurzformen etc. */

  // Gebräuchliche Abkürzungen und Schreibweisen, damit im Diagnose-Trainer
  // auch „VHF" oder „VT" gefunden wird.
  const ALIASES = {
    sinus:                ['SR', 'Sinusrhythmus', 'normal'],
    // Generische Begriffe wie „Tachykardie" oder „Infarkt" sind bewusst
    // *keine* Kurzformen — sie könnten mehrere Befunde meinen und würden
    // sonst stillschweigend auf einen davon aufgelöst.
    sinusbradykardie:     ['Sinusbradykardie'],
    sinustachykardie:     ['Sinustachykardie'],
    sinusarrhythmie:      ['respiratorische Arrhythmie'],
    vorhofflimmern:       ['VHF', 'AF', 'Afib', 'absolute Arrhythmie', 'Tachyarrhythmia absoluta'],
    vorhofflattern:       ['Flattern', 'AFL', 'Sägezahn'],
    avnrt:                ['SVT', 'supraventrikuläre Tachykardie', 'AVNRT', 'Schmalkomplextachykardie'],
    ves:                  ['VES', 'ventrikuläre Extrasystolen'],
    sves:                 ['SVES', 'supraventrikuläre Extrasystolen'],
    kammertachykardie:    ['VT', 'ventrikuläre Tachykardie', 'Breitkomplextachykardie'],
    torsade:              ['TdP', 'Torsade', 'Spitzenumkehrtachykardie'],
    kammerflimmern:       ['VF', 'Kammerflimmern', 'defibrillierbar'],
    asystolie:            ['Nulllinie', 'Herzstillstand'],
    sa_block_wenckebach:  ['SA-Block II Typ 1', 'SA Wenckebach', 'SAB II Typ 1'],
    sa_block_mobitz:      ['SA-Block II Typ 2', 'SA Mobitz', 'SAB II Typ 2'],
    wpw:                  ['WPW', 'Präexzitation', 'Delta-Welle', 'Kent'],
    lgl:                  ['LGL', 'James', 'Lown-Ganong-Levine'],
    avblock1:             ['AV-Block 1', 'AVB I', 'AV-Block ersten Grades'],
    // Bewusst *nicht* nur „Wenckebach": den gibt es auch als SA-Block.
    // So bleibt die Eingabe mehrdeutig und muss aus der Liste gewählt werden.
    avblock2_wenckebach:  ['AV-Block 2 Typ 1', 'AV Wenckebach', 'Mobitz I', 'AVB II'],
    avblock2_mobitz:      ['AV-Block 2 Typ 2', 'Mobitz II', 'AVB II Typ 2'],
    avblock3:             ['AV-Block 3', 'AVB III', 'totaler Block', 'AV-Dissoziation'],
    rechtsschenkelblock:  ['RSB', 'RBBB', 'Rechtsschenkelblock'],
    linksschenkelblock:   ['LSB', 'LBBB', 'Linksschenkelblock'],
    stemi:                ['STEMI', 'ST-Hebung', 'Hebungsinfarkt'],
    stemi_spaet:          ['Infarkt im Verlauf', 'STEMI Stadium'],
    alter_infarkt:        ['Pardee-Q', 'alter Infarkt', 'Narbe', 'abgelaufener Infarkt'],
    nstemi:               ['NSTEMI', 'ST-Senkung', 'Ischämie'],
    perikarditis:         ['Perikarditis'],
    hyperkaliaemie:       ['Hyperkaliämie', 'Zelt-T', 'Kalium hoch'],
    hypokaliaemie:        ['Hypokaliämie', 'U-Welle', 'Kalium niedrig'],
    langes_qt:            ['Long QT', 'LQTS', 'QT-Verlängerung'],
    brugada:              ['Brugada', 'coved'],
    digitalis:            ['Digitalis', 'Muldenform', 'Lyszeichen'],
    schrittmacher:        ['Pacer', 'Spike', 'Pacemaker', 'PM']
  };

  // Befunde, zu denen es einen passenden Brustwand-Ableitungssatz gibt.
  const LEAD_FOR = {
    rechtsschenkelblock: 'rsb',
    linksschenkelblock:  'lsb',
    brugada:             'brugada',
    alter_infarkt:       'r_verlust'
  };

  // Gruppen für den Trainer — die 14 Einzelkategorien wären als Filter zu viel.
  // Eine Gruppe nennt entweder Kategorien (`cats`) oder einzelne Befunde (`ids`).
  const TRAINER_GROUPS = [
    { id: 'alle',     name: 'Alle',     cats: null },
    { id: 'rhythmus', name: 'Rhythmus', cats: ['Normalbefund', 'Frequenz', 'Vorhof', 'Tachykardie', 'Extrasystolen'] },
    { id: 'bloecke',  name: 'Blöcke',   cats: ['SA-Block', 'AV-Block', 'Schenkelblock', 'Präexzitation'] },
    { id: 'ischaemie',name: 'Ischämie', cats: ['Ischämie'] },
    // Quer durch die Kategorien: was im Einsatz sofort erkannt werden muss.
    { id: 'notfall',  name: 'Notfall',  ids: [
        'kammerflimmern', 'asystolie', 'kammertachykardie', 'torsade',
        'stemi', 'avblock3', 'avblock2_mobitz', 'hyperkaliaemie',
        'brugada', 'wpw', 'vorhofflattern', 'langes_qt'] },
    { id: 'sonstige', name: 'Sonstige', cats: ['Elektrolyte', 'Synkope', 'Sonstiges'] }
  ];

  const LIB_CATS = ['Alle', 'Normalbefund', 'Frequenz', 'Vorhof', 'Tachykardie',
                    'Extrasystolen', 'SA-Block', 'AV-Block', 'Schenkelblock',
                    'Präexzitation', 'Ischämie', 'Elektrolyte', 'Synkope',
                    'Reanimation', 'Sonstiges'];

  /* ======================================================================
     ABLEITUNGEN — Cabrera-Kreis
     ====================================================================== */

  const LEADS = [
    { id: 'I',   angle: 0,    grp: 'Einthoven',  wall: 'Lateral (Seitenwand)',
      desc: 'Misst zwischen rechtem und linkem Arm. Blickt von links seitlich auf das Herz.', color: '#2f8fff' },
    { id: 'II',  angle: 60,   grp: 'Einthoven',  wall: 'Inferior (Hinterwand)',
      desc: 'Misst zwischen rechtem Arm und linkem Fuß. Meist die Ableitung mit den schönsten P-Wellen — deshalb die Standard-Monitorableitung.', color: '#2f8fff' },
    { id: 'III', angle: 120,  grp: 'Einthoven',  wall: 'Inferior (Hinterwand)',
      desc: 'Misst zwischen linkem Arm und linkem Fuß. Blickt von unten rechts auf das Herz.', color: '#2f8fff' },
    { id: 'aVR', angle: -150, grp: 'Goldberger', wall: 'Rechter Vorhof / Ausflusstrakt',
      desc: 'Schaut von rechts oben — also entgegen der normalen Erregungsrichtung. Der QRS ist hier normalerweise negativ. Ist er positiv, prüfe die Elektroden.', color: '#7c5cff' },
    { id: 'aVL', angle: -30,  grp: 'Goldberger', wall: 'Lateral (Seitenwand)',
      desc: 'Blickt von links oben auf das Herz. Zusammen mit I bildet sie die hohe Seitenwand ab.', color: '#7c5cff' },
    { id: 'aVF', angle: 90,   grp: 'Goldberger', wall: 'Inferior (Hinterwand)',
      desc: 'Blickt von unten («F» wie Fuß). Gemeinsam mit II und III das inferiore Trio.', color: '#7c5cff' }
  ];

  const CHEST_LEADS = [
    { id: 'V1', pos: '4. ICR rechts parasternal', wall: 'Septum',
      desc: 'Die wichtigste Ableitung zur Rhythmusanalyse: Hier sind P-Wellen und die QRS-Morphologie beim Schenkelblock am besten zu beurteilen.' },
    { id: 'V2', pos: '4. ICR links parasternal', wall: 'Septum',
      desc: 'Zusammen mit V1 bildet sie das Kammerseptum ab.' },
    { id: 'V3', pos: 'Zwischen V2 und V4', wall: 'Vorderwand',
      desc: 'Übergangszone: Hier wechselt der QRS häufig von überwiegend negativ zu überwiegend positiv.' },
    { id: 'V4', pos: '5. ICR Medioklavikularlinie', wall: 'Vorderwand / Herzspitze',
      desc: 'Liegt etwa über der Herzspitze.' },
    { id: 'V5', pos: 'Vordere Axillarlinie, Höhe V4', wall: 'Laterale Vorderwand',
      desc: 'Bildet gemeinsam mit V6 die Seitenwand ab.' },
    { id: 'V6', pos: 'Mittlere Axillarlinie, Höhe V4', wall: 'Seitenwand',
      desc: 'Die am weitesten links gelegene Standardableitung.' }
  ];

  const REGIONS = [
    { name: 'Inferior (Hinterwand)', leads: 'II, III, aVF', vessel: 'RCA — rechte Koronararterie', color: '#ff6b35' },
    { name: 'Anteroseptal (Vorderwand)', leads: 'V1–V4', vessel: 'RIVA / LAD', color: '#ff4d6d' },
    { name: 'Lateral (Seitenwand)', leads: 'I, aVL, V5, V6', vessel: 'RCX — Ramus circumflexus', color: '#7c5cff' },
    { name: 'Posterior (streng hinten)', leads: 'Spiegelbild V1–V3, direkt V7–V9', vessel: 'RCX oder RCA', color: '#12b3a6' }
  ];

  /* ---------------------------------------------------------------- Export */

  const ALL_LESSONS = [];
  for (const u of UNITS) {
    for (const l of u.lessons) {
      l.unitId = u.id; l.unit = u;
      ALL_LESSONS.push(l);
    }
  }

  // Kurzformen und Ableitungssätze an die Bibliothekseinträge hängen.
  for (const item of LIBRARY) {
    item.alias = (ALIASES[item.id] || []).concat([item.name]);
    if (LEAD_FOR[item.id]) item.leadSet = LEAD_FOR[item.id];
  }

  global.CONTENT = {
    UNITS: UNITS,
    ALL_LESSONS: ALL_LESSONS,
    LIBRARY: LIBRARY,
    LIB_CATS: LIB_CATS,
    TRAINER_GROUPS: TRAINER_GROUPS,
    LEADS: LEADS,
    CHEST_LEADS: CHEST_LEADS,
    REGIONS: REGIONS,
    lessonById: function (id) { return ALL_LESSONS.find(function (l) { return l.id === id; }); },
    lessonIndex: function (id) { return ALL_LESSONS.findIndex(function (l) { return l.id === id; }); }
  };

})(window);
