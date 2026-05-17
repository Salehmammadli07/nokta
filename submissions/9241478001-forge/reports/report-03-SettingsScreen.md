# Bug Report — SettingsScreen

**Timestamp:** 2026-05-17T08:49:52.000Z  
**Screen:** SettingsScreen  
**Severity:** HIGH  
**Platform:** android 34  

## Observation
Yazı boyutu ayarındaki "−" (azalt) butonu sınır kontrolü yapmıyor. fontSize değeri 0'ın altına (negatif değerlere) düşebiliyor. `fontSize: -10` gibi değerler React Native'de çöküme (crash) yol açıyor.

## Annotated Regions
  - Box 1: x=16, y=230, w=60, h=44  ← "−" butonu
  - Box 2: x=150, y=230, w=120, h=44  ← boyut önizleme metni

## Steps to Reproduce
1. SettingsScreen'e git
2. "Yazı Boyutu" bölümündeki "−" butonuna art arda 10 kez bas
3. `fontSize` değerinin 14 → 12 → 10 → ... → -6 → -8 şeklinde negatife düştüğünü gözlemle
4. React Native'in negatif fontSize ile crash verdiğini gözlemle

## Expected Behavior
Minimum fontSize 10, maksimum 30 ile sınırlandırılmalı. Sınıra ulaşıldığında buton disabled görünmeli.

## Actual Behavior
`setFontSize((f) => f - 2)` satırında alt sınır kontrolü yok. Değer sonsuza kadar küçülebiliyor.

## Root Cause Hypothesis
`SettingsScreen.tsx` satır ~43:
```ts
// MEVCUT (hatalı)
onPress={() => setFontSize((f) => f - 2)}

// DÜZELTİLMİŞ
onPress={() => setFontSize((f) => Math.max(10, f - 2))}
```
Aynı şekilde üst sınır için `Math.min(30, f + 2)`.

## Screenshot
`screenshot_SettingsScreen_1747471792000.png`

---
*Rapor: AuditWidget (nokta-audit) tarafından üretildi*
