import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image,
  TouchableOpacity, Switch, ScrollView, SafeAreaView,
} from 'react-native';
import { AuditWidget } from '../components/AuditWidget';

export default function ProfileScreen() {
  const [notif, setNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>👤 Profil</Text>

        {/* BUG: Avatar yüklenmeden önce fallback yok, boş alan görünüyor */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>AK</Text>
          </View>
          <View>
            <Text style={styles.name}>Ahmet Kaya</Text>
            {/* BUG: E-posta çok uzunsa taşıyor, overflow yok */}
            <Text style={styles.email}>ahmet.kaya.9241478001@universitesi.edu.tr.tr</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>🔔 Bildirimler</Text>
            <Switch value={notif} onValueChange={setNotif} />
          </View>

          {/* BUG: Dark mode switch'i state'i değiştiriyor ama UI değişmiyor */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>🌙 Karanlık Mod</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
        </View>

        {/* BUG: Çıkış butonu onPress handler'ı yok, sessizce başarısız oluyor */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutTxt}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      <AuditWidget screenName="ProfileScreen" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: '800', marginBottom: 20, color: '#1a1a2e' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },
  email: { fontSize: 13, color: '#888', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowLabel: { fontSize: 15, color: '#333' },
  logoutBtn: { backgroundColor: '#F44336', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  logoutTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
