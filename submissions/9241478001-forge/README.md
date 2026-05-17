# submissions/9241478001-forge

**Öğrenci No:** 9241478001  
**Slug:** forge  
**Track:** B — Yaratıcılık  
**Tarih:** 2026-05-17  

---

## Yapı

```
submissions/9241478001-forge/
├── README.md              ← bu dosya
├── FORGE.md               ← forge döngüsü ledger'ı (3✅ + 1🔴)
├── IDEA.md                ← Track B feature pitch
├── reports/
│   ├── report-01-HomeScreen.md    ← filtre bug
│   ├── report-02-ProfileScreen.md ← email overflow + dark mode
│   └── report-03-SettingsScreen.md ← fontSize crash
└── app/
    ├── package.json
    ├── app.json
    ├── tsconfig.json
    ├── App.tsx            ← navigation root
    ├── components/
    │   └── AuditWidget.tsx  ← drop-in widget (nokta-audit)
    └── screens/
        ├── HomeScreen.tsx
        ├── ProfileScreen.tsx
        └── SettingsScreen.tsx
```

## Çalıştırma

```bash
cd app
npm install
npx expo start
```

## Phase A — Özet

3 ekran (Home, Profile, Settings), her birinde `<AuditWidget screenName="..." />` drop-in mount edildi.  
Her ekranda kasıtlı bırakılan bug'lar `🐛 FAB` ile tespit edilerek `.md` raporları üretildi.

| Ekran | Bug | Rapor |
|-------|-----|-------|
| HomeScreen | Filtre butonu no-op | report-01 |
| ProfileScreen | Email taşma + dark mode no-op | report-02 |
| SettingsScreen | fontSize negatife düşüp crash | report-03 |

## Phase B — Özet

`FORGE.md` ledger'ında 4 döngü loglandı:

- **#1** HomeScreen filtre fix → ✅ COMMIT
- **#2** ProfileScreen email + dark mode → ✅ COMMIT  
- **#3** SettingsScreen fontSize clamp → ✅ COMMIT
- **#4** Global ThemeContext (StatusBar) → 🔴 ROLLBACK (kapsam dışına taştı)

## Track B — IDEA.md

`AuditWidget` + anlık Claude API triage: rapor kaydedilirken önem skoru, etkilenen dosya/satır ve fix karmaşıklığı otomatik hesaplanıyor. Detay: `IDEA.md`.

## Self-Check

- [x] `app/` altında Expo + TS projesi açıldı
- [x] `<AuditWidget />` drop-in mount edildi (3 ekran)
- [x] ≥3 ekrandan `.md` raporu üretildi
- [x] FORGE.md'de ≥3 başarılı döngü loglandı
- [x] FORGE.md'de ≥1 rollback loglandı
- [x] Her döngü ≤15 dk
- [x] Track B için IDEA.md yazıldı
- [x] PR `submissions/9241478001-forge/` klasörüne açılacak
