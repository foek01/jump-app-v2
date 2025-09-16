import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Linking } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ChevronDown, ChevronUp, Mail } from "lucide-react-native";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "Hoe kan ik een club toevoegen?",
    answer: "Ga naar 'Meer' > 'Clubs beheren' en selecteer de clubs die je wilt volgen. Je kunt meerdere clubs toevoegen.",
  },
  {
    id: "2",
    question: "Hoe kan ik livestreams bekijken?",
    answer: "Ga naar het 'Matches' tabblad. Live wedstrijden worden gemarkeerd met een 'LIVE' badge. Klik op de wedstrijd om de stream te starten.",
  },
  {
    id: "3",
    question: "Kan ik notificaties uitschakelen?",
    answer: "Ja, ga naar 'Meer' > 'Instellingen' > 'Notificaties' en schakel de gewenste notificaties uit.",
  },
  {
    id: "4",
    question: "Hoe werken favorieten?",
    answer: "Klik op het hartje bij video's, nieuws of wedstrijden om ze toe te voegen aan je favorieten. Je vindt al je favorieten in het 'Favorieten' tabblad.",
  },
  {
    id: "5",
    question: "Is de app gratis?",
    answer: "Ja, de app is volledig gratis te gebruiken. Sommige premium functies kunnen in de toekomst worden toegevoegd.",
  },
  {
    id: "6",
    question: "Hoe kan ik mijn profiel aanpassen?",
    answer: "Ga naar 'Meer' > 'Profiel' en klik op 'Bewerken' om je naam en e-mailadres aan te passen.",
  },
];

export default function HelpSupportScreen() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleEmailSupport = () => {
    const email = "support@voetbalapp.nl";
    const subject = "Help & Support - Voetbal App";
    const body = "Beste support team,\n\n";
    
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veelgestelde Vragen</Text>
          
          {faqData.map((item) => {
            const isExpanded = expandedItems.includes(item.id);
            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqHeader}
                  onPress={() => toggleExpanded(item.id)}
                >
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  {isExpanded ? (
                    <ChevronUp color="#999" size={20} />
                  ) : (
                    <ChevronDown color="#999" size={20} />
                  )}
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Nog vragen?</Text>
          <Text style={styles.contactDescription}>
            Neem contact op met ons support team voor verdere hulp.
          </Text>
          
          <TouchableOpacity style={styles.emailButton} onPress={handleEmailSupport}>
            <Mail color="#000" size={20} />
            <Text style={styles.emailButtonText}>Email Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#000",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C4FF00",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C4FF00",
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 15,
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  faqQuestion: {
    fontSize: 15,
    color: "#FFF",
    flex: 1,
    marginRight: 10,
    fontWeight: "500",
  },
  faqAnswerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 0,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  contactSection: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginTop: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  contactDescription: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C4FF00",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  emailButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});