export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  image: string;
  content: string;
  author?: string;
}

export const mockNews: NewsArticle[] = [
  {
    id: "n1",
    title: "Nieuw seizoen van start met spectaculaire opening",
    date: "5 september 2025",
    category: "ALGEMEEN",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop",
    content: "Het nieuwe voetbalseizoen is vandaag officieel van start gegaan met een spectaculaire openingsceremonie in het hoofdstadion. Duizenden fans waren aanwezig om getuige te zijn van dit historische moment.\n\nDe ceremonie begon met een indrukwekkende vuurwerkshow, gevolgd door optredens van verschillende artiesten. De teamcaptains van alle clubs presenteerden zich aan het publiek, wat leidde tot luid gejuich van de supporters.\n\nDe voorzitter van de voetbalbond sprak zijn vertrouwen uit in een spannend en sportief seizoen. Hij benadrukte het belang van fair play en respect tussen de clubs. Ook kondigde hij nieuwe initiatieven aan om het jeugdvoetbal verder te ontwikkelen.\n\nDe eerste wedstrijden van het seizoen staan gepland voor komend weekend. De verwachtingen zijn hooggespannen, vooral na de vele transfers tijdens de zomerstop.",
    author: "Jan de Vries"
  },
  {
    id: "n2",
    title: "Jeugdteam wint nationaal kampioenschap",
    date: "4 september 2025",
    category: "JEUGD",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop",
    content: "Ons onder-17 team heeft gisteren het nationale kampioenschap gewonnen na een spannende finale tegen de regerend kampioen. De wedstrijd eindigde in 2-1 na verlenging.\n\nDe eerste helft was een tactisch steekspel waarbij beide teams voorzichtig speelden. Onze jongens namen het initiatief in de tweede helft en creëerden verschillende kansen. De openingstreffer viel in de 65e minuut via een prachtige vrije trap.\n\nDe tegenstander kwam tien minuten voor tijd op gelijke hoogte, waardoor verlenging noodzakelijk was. In de 105e minuut scoorde onze spits de winnende treffer na een perfecte counter.\n\nTrainer Peter Jansen was na afloop zeer tevreden: 'Deze jongens hebben laten zien dat ze mentaal sterk zijn. Ze bleven geloven in de overwinning, zelfs toen het moeilijk werd. Dit is een fantastische prestatie voor de hele club.'\n\nHet team wordt morgen gehuldigd op het stadhuis en zal daarna een rondrit maken door de stad.",
    author: "Lisa Bakker"
  },
  {
    id: "n3",
    title: "Nieuwe sponsordeal voor komende 3 jaar",
    date: "3 september 2025",
    category: "BUSINESS",
    image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=400&fit=crop",
    content: "De club heeft vandaag een nieuwe hoofdsponsorovereenkomst getekend voor de komende drie seizoenen. De deal met TechCorp Nederland is de grootste in de clubgeschiedenis.\n\nDe overeenkomst heeft een geschatte waarde van 15 miljoen euro over drie jaar. Dit bedrag zal worden geïnvesteerd in nieuwe faciliteiten, jeugdopleiding en het aantrekken van talentvolle spelers.\n\nCEO van TechCorp, Mark Johnson, verklaarde: 'We zijn trots om partner te worden van deze ambitieuze club. Hun visie op innovatie en gemeenschapsbetrokkenheid sluit perfect aan bij onze bedrijfswaarden.'\n\nNaast de financiële steun zal TechCorp ook technologische expertise leveren. Er worden plannen ontwikkeld voor een state-of-the-art trainingscentrum met de nieuwste sportanalyse technologie.\n\nDe clubvoorzitter bedankte de fans voor hun loyaliteit en beloofde dat deze investering zal leiden tot betere prestaties op het veld.",
    author: "Tom Hendriks"
  },
  {
    id: "n4",
    title: "Trainingsschema aangepast voor winterperiode",
    date: "2 september 2025",
    category: "TRAINING",
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&h=400&fit=crop",
    content: "Het technische team heeft het trainingsschema aangepast in aanloop naar de wintermaanden. De nieuwe aanpak focust op fysieke conditie en tactische verfijning.\n\nHoofdtrainer Roberto Martinez legt uit: 'We moeten ons voorbereiden op de zware winterperiode. Dit betekent meer aandacht voor kracht en uithoudingsvermogen, zonder de technische aspecten te verwaarlozen.'\n\nDe trainingen zullen voortaan beginnen met een uitgebreide warming-up van 30 minuten, gevolgd door specifieke oefeningen afhankelijk van de dag. Maandag en woensdag staan in het teken van tactiek, terwijl dinsdag en donderdag fysieke training centraal staat.\n\nEr is ook meer aandacht voor herstel. Spelers krijgen toegang tot nieuwe faciliteiten zoals cryotherapie en een vernieuwd zwembad voor aquatraining.\n\nDe medische staf heeft een individueel voedingsplan opgesteld voor elke speler om optimale prestaties te garanderen tijdens de koude maanden.",
    author: "Sophie van der Berg"
  },
  {
    id: "n5",
    title: "Talentvolle middenvelder tekent eerste profcontract",
    date: "1 september 2025",
    category: "TRANSFERS",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop",
    content: "De 18-jarige middenvelder Lucas van Dijk heeft zijn eerste professionele contract getekend bij de club. Het talent uit de eigen jeugdopleiding tekende voor drie seizoenen.\n\nVan Dijk doorliep alle jeugdelftallen en maakte afgelopen seizoen al enkele keren zijn opwachting bij het eerste elftal. Zijn prestaties bleven niet onopgemerkt, met interesse van verschillende binnen- en buitenlandse clubs.\n\n'Ik ben ontzettend blij en trots om mijn eerste profcontract te tekenen bij de club waar ik ben opgegroeid,' aldus Van Dijk. 'Dit is een droom die uitkomt, maar het harde werk begint nu pas echt.'\n\nDe technische staf ziet veel potentie in de jonge speler. Hij wordt geprezen om zijn techniek, spelinzicht en werkethiek. Komend seizoen zal hij deel uitmaken van de A-selectie.",
    author: "Peter de Jong"
  },
  {
    id: "n6",
    title: "Nieuwe tribune vergroot stadioncapaciteit",
    date: "31 augustus 2025",
    category: "INFRASTRUCTUUR",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=400&fit=crop",
    content: "De bouw van de nieuwe oosttribune is officieel van start gegaan. Het project zal de stadioncapaciteit vergroten van 25.000 naar 32.000 plaatsen.\n\nDe nieuwe tribune wordt uitgerust met moderne faciliteiten, waaronder verbeterde catering, ruimere stoelen en betere zichtlijnen. Ook komt er een speciale familiesectie met 2.000 plaatsen.\n\nDe bouwwerkzaamheden zullen ongeveer 18 maanden duren. Tijdens de bouw blijft het stadion gewoon in gebruik, al zal de capaciteit tijdelijk beperkt zijn.\n\nHet project kost naar schatting 45 miljoen euro en wordt gefinancierd door een combinatie van clubmiddelen, sponsoring en een obligatielening onder supporters.\n\nDe clubdirectie verwacht dat de uitbreiding zal leiden tot hogere inkomsten uit kaartverkoop en een betere sfeer tijdens thuiswedstrijden.",
    author: "Maria Visser"
  }
];