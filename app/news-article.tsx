import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Platform,
  Dimensions,
  FlatList,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Heart, Share2, ChevronLeft } from "lucide-react-native";
import { mockNews, NewsArticle } from "@/mocks/news";
import { useFavorites } from "@/providers/FavoritesProvider";

const { width } = Dimensions.get("window");

export default function NewsArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleNewsLike, isNewsLiked } = useFavorites();

  const article = useMemo(() => {
    return mockNews.find((item) => item.id === id);
  }, [id]);

  const otherArticles = useMemo(() => {
    return mockNews.filter((item) => item.id !== id);
  }, [id]);

  const isLiked = useMemo(() => {
    return id ? isNewsLiked(id) : false;
  }, [id, isNewsLiked]);

  const handleLike = useCallback(() => {
    if (id) {
      toggleNewsLike(id);
    }
  }, [id, toggleNewsLike]);

  const handleShare = useCallback(async () => {
    if (!article) return;
    
    try {
      await Share.share({
        message: `${article.title}\n\n${article.content.substring(0, 200)}...`,
        title: article.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, [article]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const renderOtherArticle = useCallback(({ item }: { item: NewsArticle }) => {
    return (
      <TouchableOpacity
        style={styles.otherArticleCard}
        onPress={() => router.push(`/news-article?id=${item.id}`)}
      >
        <Image source={{ uri: item.image }} style={styles.otherArticleImage} />
        <View style={styles.otherArticleContent}>
          <Text style={styles.otherArticleCategory}>{item.category}</Text>
          <Text style={styles.otherArticleTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.otherArticleDate}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  if (!article) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Artikel niet gevonden</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Terug</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NIEUWS</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: article.image }} style={styles.heroImage} />
        
        <View style={styles.articleContent}>
          <Text style={styles.category}>{article.category}</Text>
          <Text style={styles.title}>{article.title}</Text>
          
          <View style={styles.meta}>
            <Text style={styles.date}>{article.date}</Text>
            {article.author && (
              <>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.author}>{article.author}</Text>
              </>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Heart
                size={24}
                color={isLiked ? "#FF0000" : "#999"}
                fill={isLiked ? "#FF0000" : "transparent"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share2 size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.content}>{article.content}</Text>
        </View>

        <View style={styles.moreArticlesSection}>
          <Text style={styles.moreArticlesTitle}>Meer nieuws</Text>
          <FlatList
            data={otherArticles}
            renderItem={renderOtherArticle}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.otherArticlesList}
          />
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: "#000",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C4FF00",
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: width,
    height: width * 0.6,
    backgroundColor: "#333",
  },
  articleContent: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    color: "#C4FF00",
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 10,
    lineHeight: 32,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    color: "#999",
  },
  metaSeparator: {
    fontSize: 14,
    color: "#999",
    marginHorizontal: 8,
  },
  author: {
    fontSize: 14,
    color: "#999",
  },
  actions: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    fontSize: 16,
    color: "#DDD",
    lineHeight: 24,
  },
  moreArticlesSection: {
    marginTop: 40,
    paddingBottom: 40,
  },
  moreArticlesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  otherArticlesList: {
    paddingHorizontal: 20,
  },
  otherArticleCard: {
    width: width * 0.7,
    marginRight: 15,
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    overflow: "hidden",
  },
  otherArticleImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#333",
  },
  otherArticleContent: {
    padding: 15,
  },
  otherArticleCategory: {
    fontSize: 10,
    color: "#C4FF00",
    fontWeight: "bold",
    marginBottom: 5,
  },
  otherArticleTitle: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
    marginBottom: 5,
  },
  otherArticleDate: {
    fontSize: 12,
    color: "#999",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#FFF",
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#C4FF00",
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },
});