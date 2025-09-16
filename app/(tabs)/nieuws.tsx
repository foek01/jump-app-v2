import React, { useCallback, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { mockNews, NewsArticle } from "@/mocks/news";
import { useSettings } from "@/providers/SettingsProvider";

export default function NieuwsScreen() {
  const { settings } = useSettings();
  
  const handleArticlePress = useCallback((articleId: string) => {
    console.log("Opening news article:", articleId);
    router.push(`/news-article?id=${articleId}`);
  }, []);

  useEffect(() => {
    if (!settings.showNews) {
      console.log("📰 News is disabled, redirecting to home");
      router.replace("/home");
    }
  }, [settings.showNews]);

  if (!settings.showNews) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Text style={styles.disabledText}>Nieuws is uitgeschakeld</Text>
          <Text style={styles.disabledSubtext}>Ga naar instellingen om nieuws weer in te schakelen</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {mockNews.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.newsCard}
            onPress={() => handleArticlePress(item.id)}
          >
            <Image source={{ uri: item.image }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <Text style={styles.newsCategory}>{item.category}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDate}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  newsCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#333",
  },
  newsContent: {
    padding: 15,
  },
  newsCategory: {
    fontSize: 10,
    color: "#C4FF00",
    fontWeight: "bold",
    marginBottom: 5,
  },
  newsTitle: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
    marginBottom: 5,
  },
  newsDate: {
    fontSize: 12,
    color: "#999",
  },
  disabledContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  disabledText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  disabledSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});