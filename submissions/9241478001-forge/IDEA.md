# IDEA.md — Feature Pitch: AuditWidget → AI-Triage Pipeline

**Track:** B — Yaratıcılık  
**Öğrenci:** 9241478001  

---

## Problem

Mevcut `AuditWidget` akışı şöyle:

```
Kullanıcı bug görür → FAB'a basar → not yazar → .md raporu kaydeder → geliştirici okur → öncelik verir → agent'a verir
```

Bu zincirde darboğaz **"geliştirici okur → öncelik verir"** adımıdır. 10 rapor geldiğinde hangisini önce düzelteceksin?

---

## Fikir: `AuditWidget` + Anlık AI-Triage

Rapor kaydedilir kaydedilmez, widget raporu Claude API'ye gönderir ve:

1. **Önem skoru** üretir (1–10, açıklamalı)
2. **Etkilenen bileşeni** tahmin eder (`HomeScreen.tsx > line ~38`)
3. **Fix karmaşıklığı** tahmin eder (`trivial / moderate / complex`)
4. **Bağlı raporlarla** eşleştirir ("Bu bug, Rapor #2 ile aynı kök nedene sahip görünüyor")

### Kullanıcı Akışı

```
[Kullanıcı] FAB'a bas → ekranı işaretle → not yaz
[Widget]    Raporu oluştur → Claude API'ye gönder (arka planda)
[Widget]    5 saniye içinde: "🔴 Kritik — HomeScreen.tsx ~38. satır (trivial fix)"
[Geliştirici] Sıralı öncelik listesiyle forge'a başla
```

### Mockup

```
┌─────────────────────────────────────┐
│  🐛 Bug Raporu — HomeScreen         │
│  ─────────────────────────────────  │
│  AI Triage Sonucu:                  │
│  🔴 Önem: 8/10                      │
│  📍 HomeScreen.tsx ~38              │
│  ⚡ Fix: trivial (< 5 satır)        │
│  🔗 Benzer: report-02 ile bağlantılı│
│                                     │
│  [Forge'a Gönder]  [Daha Sonra]     │
└─────────────────────────────────────┘
```

### Teknik Uygulama

```typescript
// AuditWidget.tsx'e eklenecek
const triageReport = async (md: string): Promise<TriageResult> => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: 'Sen bir mobile bug triage asistanısın. JSON formatında yanıt ver.',
      messages: [{
        role: 'user',
        content: `Bu bug raporunu analiz et ve JSON döndür:
          { score: 1-10, file: string, line: number, complexity: "trivial"|"moderate"|"complex" }
          
          Rapor:\n${md}`
      }]
    })
  });
  return JSON.parse(res.json().content[0].text);
};
```

### Müşteri Değeri

| Metrik | Mevcut | Önerilen |
|--------|--------|----------|
| Öncelik kararı | Elle, ~5 dk/rapor | Otomatik, ~5 sn |
| Yanlış önceliklendirme riski | Yüksek (sübjektif) | Düşük (AI + pattern) |
| Geliştirici forge başlatma süresi | Raporu okuma + anlama | Hazır sıralı liste |

### Neden Bu Track İçin Uygun?

Mevcut `nokta-audit` widget'ı drop-in olarak kalıyor — ek bir `triage.ts` modülü ekleniyor. Hiçbir ekran değişmiyor. Widget bağımsızlığı korunuyor.

---

*"Müşteri yakalar, AI önceliklendirir, agent onarır, sen sadece onayla."*
