# Bug Report — ProfileScreen

**Timestamp:** 2026-05-17T08:31:07.000Z  
**Screen:** ProfileScreen  
**Severity:** MEDIUM  
**Platform:** android 34  

## Observation
İki ayrı sorun tespit edildi:
1. Uzun e-posta adresi ekranın sağına taşıyor, kırpılmıyor.
2. "Karanlık Mod" switch'i açılıp kapatılabiliyor ancak UI hiç değişmiyor — kullanıcı için anlamsız bir kontrol.

## Annotated Regions
  - Box 1: x=88, y=110, w=280, h=24  ← e-posta taşma bölgesi
  - Box 2: x=16, y=310, w=358, h=52  ← dark mode switch satırı

## Steps to Reproduce
**Bug 1:**
1. ProfileScreen'e git
2. Avatar'ın sağındaki e-posta metnine bak
3. Metnin sağa taştığını ve kırpılmadığını gözlemle

**Bug 2:**
1. "Karanlık Mod" switch'ini aç
2. Arka plan renginin, metin renginin ve card renklerinin değişmediğini gözlemle

## Expected Behavior
- E-posta: `numberOfLines={1}` + `ellipsizeMode="tail"` ile truncate edilmeli
- Dark mode: `darkMode` state'ine bağlı olarak tüm renk değerleri güncellenmeli

## Actual Behavior
- `Text` bileşeninde `numberOfLines` prop'u yok, uzun metin taşıyor
- `darkMode` state tanımlı ve değişiyor ama `StyleSheet` buna bağlı değil; koşullu stil uygulanmıyor

## Root Cause Hypothesis
`ProfileScreen.tsx`:  
- satır ~32: `<Text style={styles.email}>` → `numberOfLines={1}` eksik  
- satır ~46–50: dark mode switch var ama conditional styling yok

## Screenshot
`screenshot_ProfileScreen_1747470667000.png`

---
*Rapor: AuditWidget (nokta-audit) tarafından üretildi*
