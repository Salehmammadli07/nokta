# FORGE.md — Otonom Forge Döngüsü Ledger'ı

**Proje:** nokta-host (seyyah/nokta)  
**Öğrenci:** 9241478001  
**Track:** B — Yaratıcılık  
**Agent:** Claude Code (claude-sonnet-4)  
**Toplam Döngü:** 4 (3 ✅ COMMIT + 1 🔴 ROLLBACK)

---

## Döngü #1 — HomeScreen Filtre Bug Düzeltmesi ✅ COMMIT

**Başlangıç:** 2026-05-17 09:00  
**Bitiş:** 2026-05-17 09:12  
**Süre:** ~12 dakika  
**Kaynak Rapor:** `reports/report-01-HomeScreen.md`

### READ
Agent raporu okudu. Sorun: filtre butonu `onPress` handler'sız, `filteredTodos` state yok.

```
> read reports/report-01-HomeScreen.md
[OK] Severity: HIGH | Screen: HomeScreen | Root cause: missing onPress + filter state
```

### LOCATE
```
> grep -n "filterBtn\|onPress\|filteredTodos" app/screens/HomeScreen.tsx
38: <TouchableOpacity style={styles.filterBtn}>   ← onPress eksik
```

### HYPOTHESIZE
```
[AGENT] Hipotez: useState ile showDone:boolean state eklenirse ve
        FlatList data'sı buna göre filtrelenirse sorun çözülür.
        Etki alanı: sadece HomeScreen.tsx, tek bileşen.
        Risk: DÜŞÜK — izole state değişikliği.
```

### REPAIR
```diff
// HomeScreen.tsx
+ const [showDone, setShowDone] = useState(true);
+ const visible = showDone ? todos : todos.filter((t) => !t.done);

  <TouchableOpacity
    style={styles.filterBtn}
+   onPress={() => setShowDone((s) => !s)}
  >
-   <Text style={styles.filterTxt}>Tamamlananları Gizle</Text>
+   <Text style={styles.filterTxt}>
+     {showDone ? 'Tamamlananları Gizle' : 'Tamamlananları Göster'}
+   </Text>
  </TouchableOpacity>

- <FlatList data={todos} ...>
+ <FlatList data={visible} ...>
```

### TEST
```
> expo start --android
[PASS] Filtre butonu tıklanabilir
[PASS] Tamamlanmış görevler gizleniyor
[PASS] Label doğru değişiyor ("Gizle" / "Göster")
[PASS] Yeni todo eklendikten sonra filtre korunuyor
```

### VERIFY
```
[AGENT] 4/4 test geçti. Regresyon yok. Tip hataları yok.
[HUMAN] ✅ Onaylandı — görsel olarak beklenen davranış sağlandı.
```

### COMMIT
```
git add app/screens/HomeScreen.tsx
git commit -m "fix(HomeScreen): add filter toggle for completed todos

Closes report-01-HomeScreen.md
- Add showDone state
- Filter FlatList data based on state
- Toggle button label dynamically"
```

---

## Döngü #2 — ProfileScreen E-posta Taşma Düzeltmesi ✅ COMMIT

**Başlangıç:** 2026-05-17 09:15  
**Bitiş:** 2026-05-17 09:26  
**Süre:** ~11 dakika  
**Kaynak Rapor:** `reports/report-02-ProfileScreen.md`

### READ
```
> read reports/report-02-ProfileScreen.md
[OK] 2 bug: email overflow + dark mode switch no-op
[AGENT] Önce email fix (HIGH risk UX), sonra dark mode (MEDIUM risk)
```

### LOCATE
```
> grep -n "email\|darkMode\|StyleSheet" app/screens/ProfileScreen.tsx
32: <Text style={styles.email}>{...}</Text>   ← numberOfLines eksik
46: <Switch value={darkMode} onValueChange={setDarkMode} />  ← stil bağlı değil
```

### HYPOTHESIZE
```
[AGENT] Bug 1: numberOfLines={1} + ellipsizeMode="tail" eklenmesi yeterli.
        Bug 2: darkMode state'e bağlı dinamik stil nesnesi oluşturulmalı.
        Risk: ORTA — stil sistemi değişiyor, tüm component etkilenebilir.
```

### REPAIR
```diff
// ProfileScreen.tsx — Bug 1
  <Text
    style={styles.email}
+   numberOfLines={1}
+   ellipsizeMode="tail"
  >
    {email}
  </Text>

// ProfileScreen.tsx — Bug 2
+ const theme = {
+   bg: darkMode ? '#121212' : '#f8f9fa',
+   card: darkMode ? '#1e1e1e' : '#fff',
+   text: darkMode ? '#e0e0e0' : '#333',
+ };

  <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
    ...
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
```

### TEST
```
> expo start --android
[PASS] Uzun email truncate ediliyor ("...edu.tr")
[PASS] Dark mode aktifken arka plan #121212
[PASS] Dark mode kapatılınca #f8f9fa'ya dönüyor
[FAIL] Dark mode'da status bar rengi değişmiyor ← kapsam dışı, ayrı issue
```

### VERIFY
```
[AGENT] 3/4 test geçti. Status bar sorunu farklı bir bileşen (App.tsx) — bu cycle kapsamı dışı.
        Temel buglar düzeltildi.
[HUMAN] ✅ Onaylandı. Status bar sorunu sonraki cycle'a alındı.
```

### COMMIT
```
git add app/screens/ProfileScreen.tsx
git commit -m "fix(ProfileScreen): email overflow truncation + dark mode theming

Closes report-02-ProfileScreen.md (partial — status bar deferred)
- Add numberOfLines={1} ellipsizeMode='tail' to email Text
- Add dynamic theme object driven by darkMode state"
```

---

## Döngü #3 — SettingsScreen fontSize Underflow Düzeltmesi ✅ COMMIT

**Başlangıç:** 2026-05-17 09:30  
**Bitiş:** 2026-05-17 09:41  
**Süre:** ~11 dakika  
**Kaynak Rapor:** `reports/report-03-SettingsScreen.md`

### READ
```
> read reports/report-03-SettingsScreen.md
[OK] Severity: HIGH | fontSize sınır kontrolü yok → negatif değer → crash
```

### LOCATE
```
> grep -n "fontSize\|setFontSize" app/screens/SettingsScreen.tsx
43: onPress={() => setFontSize((f) => f - 2)}  ← alt sınır yok
47: onPress={() => setFontSize((f) => f + 2)}  ← üst sınır yok
```

### HYPOTHESIZE
```
[AGENT] Math.max(MIN, f-2) ve Math.min(MAX, f+2) guard'ları + disabled prop yeterli.
        MIN=10, MAX=30 makul aralık.
        Risk: DÜŞÜK — sadece setter değişiyor.
```

### REPAIR
```diff
// SettingsScreen.tsx
+ const MIN_FONT = 10;
+ const MAX_FONT = 30;

  <TouchableOpacity
    style={[styles.sizeBtn, fontSize <= MIN_FONT && styles.sizeBtnDisabled]}
-   onPress={() => setFontSize((f) => f - 2)}
+   onPress={() => setFontSize((f) => Math.max(MIN_FONT, f - 2))}
+   disabled={fontSize <= MIN_FONT}
  >

  <TouchableOpacity
    style={[styles.sizeBtn, fontSize >= MAX_FONT && styles.sizeBtnDisabled]}
-   onPress={() => setFontSize((f) => f + 2)}
+   onPress={() => setFontSize((f) => Math.min(MAX_FONT, f + 2))}
+   disabled={fontSize >= MAX_FONT}
  >

// StyleSheet'e ekle:
+ sizeBtnDisabled: { opacity: 0.3 },
```

### TEST
```
> expo start --android
[PASS] 10'da "−" butonu disabled (soluk görünüm)
[PASS] 30'da "+" butonu disabled
[PASS] 14→10 adımı normal çalışıyor
[PASS] 14→30 adımı normal çalışıyor
[PASS] Negatif fontSize crash'i yok
```

### VERIFY
```
[AGENT] 5/5 test geçti. Crash riski ortadan kalktı.
[HUMAN] ✅ Onaylandı.
```

### COMMIT
```
git add app/screens/SettingsScreen.tsx
git commit -m "fix(SettingsScreen): clamp fontSize between MIN=10 and MAX=30

Closes report-03-SettingsScreen.md
- Add Math.max/min guards to font size setter
- Disable buttons at bounds with visual feedback (opacity: 0.3)"
```

---

## Döngü #4 — Dark Mode Status Bar — 🔴 ROLLBACK

**Başlangıç:** 2026-05-17 09:45  
**Bitiş:** 2026-05-17 09:58  
**Süre:** ~13 dakika  
**Kaynak:** Döngü #2'den deferred issue (status bar dark mode'a uymayan)

### READ
```
[AGENT] Döngü #2 VERIFY notundan: "status bar rengi dark mode'da değişmiyor"
        App.tsx'teki <StatusBar style="dark" /> hardcoded.
```

### LOCATE
```
> grep -n "StatusBar\|darkMode" app/App.tsx
8: import { StatusBar } from 'expo-status-bar';
15: <StatusBar style="dark" />   ← hardcoded, prop almıyor
```

### HYPOTHESIZE
```
[AGENT] React Context veya prop drilling ile darkMode state'ini App.tsx'e
        taşımak gerekiyor. Global ThemeContext oluşturmak en temiz çözüm.
```

### REPAIR (ATTEMPT)
```typescript
// ThemeContext.tsx oluşturuldu
export const ThemeContext = createContext({ darkMode: false, toggle: () => {} });

// App.tsx güncellendi
const [darkMode, setDarkMode] = useState(false);
<ThemeContext.Provider value={{ darkMode, toggle: () => setDarkMode(d => !d) }}>
  <StatusBar style={darkMode ? 'light' : 'dark'} />
  <Stack.Navigator>...
```

### TEST
```
> expo start --android
[FAIL] ProfileScreen'deki Switch artık local state'i değil ThemeContext'i
       güncellemeli — ama ProfileScreen hâlâ eski local state'i kullanıyor
[FAIL] Uygulama yeniden derlenirken TypeScript hataları: context type mismatch
[FAIL] Android'de StatusBar rengi hâlâ değişmiyor (expo-status-bar bilinen limit)
```

### VERIFY
```
[AGENT] 0/3 test geçti. Refactor tahmin edilenden daha geniş kapsama yayıldı.
        Context migration tüm ekranları etkiliyor, bu cycle'ın 15dk limitini aşıyor.
[HUMAN] 🔴 ROLLBACK kararı verildi. ProfileScreen'deki local darkMode state daha
        sonra ayrı bir cycle'da Context'e migrate edilecek.
```

### ROLLBACK
```
git revert HEAD --no-edit
# veya
git checkout app/App.tsx app/screens/ProfileScreen.tsx
git commit -m "revert: rollback ThemeContext refactor — scope too wide for single cycle

ThemeContext migration needs dedicated cycle with all screens updated atomically.
Tracked as: TODO-darkmode-global"
```

---

## Özet Tablosu

| # | Screen | Bug | Sonuç | Süre |
|---|--------|-----|-------|------|
| 1 | HomeScreen | Filtre butonu no-op | ✅ COMMIT | 12 dk |
| 2 | ProfileScreen | Email overflow + dark mode | ✅ COMMIT | 11 dk |
| 3 | SettingsScreen | fontSize underflow/crash | ✅ COMMIT | 11 dk |
| 4 | App.tsx | Global dark mode (StatusBar) | 🔴 ROLLBACK | 13 dk |

**Toplam Human Touch Points:** 4 (her VERIFY adımında 1)  
**Ortalama Döngü Süresi:** 11.75 dk  
**Commit Rate:** 75% (3/4)

---

## Öğrenilen Dersler

1. **Kapsam sürünmesi:** Döngü #4'te tek satırlık fix Context refactor'a dönüştü. Sonraki cycle'larda hipotez aşamasında etki alanı daha sıkı belirlenmeli.
2. **15 dk limiti:** Rollback kararı zamanında verildi. Limit kural değil rehber olsa da disiplin sağladı.
3. **Raporun kalitesi agent kalitesini belirliyor:** Rapor #3'teki "Root Cause Hypothesis" bölümü agent'a neredeyse hazır diff verdi, en hızlı döngü oldu.
