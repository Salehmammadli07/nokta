import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, Alert,
} from 'react-native';
import { AuditWidget } from '../components/AuditWidget';

const LANGUAGES = ['Türkçe', 'English', 'Deutsch', 'Español'];

export default function SettingsScreen() {
  const [lang, setLang] = useState('Türkçe');
  const [fontSize, setFontSize] = useState(14);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>⚙️ Ayarlar</Text>

        {/* Dil Seçimi */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dil</Text>
          {LANGUAGES.map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.langRow, lang === l && styles.langActive]}
              onPress={() => setLang(l)}
            >
              <Text style={[styles.langTxt, lang === l && styles.langActiveTxt]}>{l}</Text>
              {lang === l && <Text>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Font Boyutu */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Yazı Boyutu</Text>
          {/* BUG: - butonu 0'ın altına düşürüyor, minimum kontrolü yok */}
          <View style={styles.sizeRow}>
            <TouchableOpacity
              style={styles.sizeBtn}
              onPress={() => setFontSize((f) => f - 2)}
            >
              <Text style={styles.sizeBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.sizePreview, { fontSize }]}>Aa ({fontSize}px)</Text>
            <TouchableOpacity
              style={styles.sizeBtn}
              onPress={() => setFontSize((f) => f + 2)}
            >
              <Text style={styles.sizeBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tehlikeli Alan */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { color: '#F44336' }]}>Tehlikeli Alan</Text>
          {/* BUG: "Tüm verileri sil" Alert'i gösteriyor ama iptal sonrası da siliyor */}
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() =>
              Alert.alert('Emin misin?', 'Tüm veriler silinecek!', [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => {} },
              ])
            }
          >
            <Text style={styles.dangerTxt}>🗑️ Tüm Verileri Sil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AuditWidget screenName="SettingsScreen" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: '800', marginBottom: 20, color: '#1a1a2e' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#333' },
  langRow: { padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  langActive: { backgroundColor: '#e8f0fe' },
  langTxt: { fontSize: 15, color: '#333' },
  langActiveTxt: { fontWeight: '700', color: '#1a1a2e' },
  sizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  sizeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  sizeBtnTxt: { fontSize: 24, color: '#333' },
  sizePreview: { color: '#333' },
  dangerBtn: { backgroundColor: '#fff0f0', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#F44336', alignItems: 'center' },
  dangerTxt: { color: '#F44336', fontWeight: '700', fontSize: 15 },
});
