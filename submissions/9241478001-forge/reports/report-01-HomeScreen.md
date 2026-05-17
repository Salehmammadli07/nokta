# Bug Report — HomeScreen

**Timestamp:** 2026-05-17T08:14:33.000Z  
**Screen:** HomeScreen  
**Severity:** HIGH  
**Platform:** android 34  

## Observation
"Tamamlananları Gizle" butonu görünür ve tıklanabilir durumda, ancak herhangi bir filtreleme işlemi gerçekleşmiyor. Kullanıcı butona birden fazla kez bastıktan sonra ekrandan uzaklaşıp geri dönünce butonun yanlış label gösterdiğini fark etti.

## Annotated Regions
  - Box 1: x=16, y=142, w=358, h=44  ← filtre butonu
  - Box 2: x=16, y=200, w=358, h=180 ← todo listesi (değişmiyor)

## Steps to Reproduce
1. Uygulamayı başlat
2. `HomeScreen` ekranına git
3. En az 1 tamamlanmış görev olduğundan emin ol (✅ işareti olan)
4. "Tamamlananları Gizle" butonuna bas
5. Listenin değişmediğini gözlemle

## Expected Behavior
Tamamlanmış (`done: true`) görevler listeden gizlenmeli; buton label'ı "Tamamlananları Göster" olarak güncellenmeli.

## Actual Behavior
`onPress` handler tanımlı değil (`TouchableOpacity` handler'sız bırakılmış). Filtre state'i hiç oluşturulmamış. Tüm görevler her zaman görünüyor.

## Root Cause Hypothesis
`HomeScreen.tsx` satır ~38: `TouchableOpacity` üzerinde `onPress` prop'u eksik, `filteredTodos` state tanımlanmamış.

## Screenshot
`screenshot_HomeScreen_1747469673000.png`

---
*Rapor: AuditWidget (nokta-audit) tarafından üretildi*
