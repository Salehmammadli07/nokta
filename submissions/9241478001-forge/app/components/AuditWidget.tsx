/**
 * AuditWidget — drop-in bug-reporting widget
 * Kaynak: seyyah/nokta-audit  (https://github.com/seyyah/nokta-audit)
 *
 * Kullanım:
 *   <AuditWidget screenName="HomeScreen" />
 *
 * FAB'a dokun → ekran görüntüsü al → sarı kutuyla işaretle → not düş → .md raporu kaydet
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  PanResponder,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface AnnotationBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AuditWidgetProps {
  screenName: string;          // hangi ekranın raporu
  hostRef?: React.RefObject<View>; // opsiyonel: capture için dış ref
}

export const AuditWidget: React.FC<AuditWidgetProps> = ({ screenName, hostRef }) => {
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [boxes, setBoxes] = useState<AnnotationBox[]>([]);
  const [drawing, setDrawing] = useState<Partial<AnnotationBox> | null>(null);
  const internalRef = useRef<View>(null);
  const captureTarget = hostRef ?? internalRef;

  // --- PanResponder: sarı kutu çizimi ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDrawing({ x: locationX, y: locationY, w: 0, h: 0 });
      },
      onPanResponderMove: (e, gs) => {
        setDrawing((prev) =>
          prev ? { ...prev, w: gs.dx, h: gs.dy } : null
        );
      },
      onPanResponderRelease: (_, gs) => {
        setDrawing((prev) => {
          if (prev && (Math.abs(gs.dx) > 10 || Math.abs(gs.dy) > 10)) {
            setBoxes((b) => [...b, prev as AnnotationBox]);
          }
          return null;
        });
      },
    })
  ).current;

  // --- Markdown rapor üretimi ---
  const generateReport = useCallback((): string => {
    const ts = new Date().toISOString();
    const boxDesc = boxes
      .map(
        (b, i) =>
          `  - Box ${i + 1}: x=${Math.round(b.x)}, y=${Math.round(b.y)}, w=${Math.round(b.w)}, h=${Math.round(b.h)}`
      )
      .join('\n');

    return `# Bug Report — ${screenName}

**Timestamp:** ${ts}  
**Screen:** ${screenName}  
**Severity:** ${severity.toUpperCase()}  
**Platform:** ${Platform.OS} ${Platform.Version}  

## Observation
${note.trim() || '(not girilmedi)'}

## Annotated Regions
${boxes.length > 0 ? boxDesc : '  - Bölge işaretlenmedi'}

## Steps to Reproduce
1. Uygulamayı başlat
2. \`${screenName}\` ekranına git
3. Aşağıdaki davranışı gözlemle

## Expected Behavior
<!-- TODO: beklenen davranış -->

## Actual Behavior
${note.trim() || '<!-- TODO: gerçek davranış -->'}

## Screenshot
\`screenshot_${screenName}_${Date.now()}.png\`

---
*Rapor: AuditWidget (nokta-audit) tarafından üretildi*
`;
  }, [screenName, note, severity, boxes]);

  // --- Raporu kaydet & paylaş ---
  const saveReport = useCallback(async () => {
    if (!note.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir not girin.');
      return;
    }
    const md = generateReport();
    const filename = `report_${screenName}_${Date.now()}.md`;
    const path = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(path, md, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'text/markdown', dialogTitle: 'Raporu paylaş' });
    } else {
      Alert.alert('Kaydedildi', `Rapor kaydedildi:\n${path}`);
    }
    // reset
    setNote('');
    setBoxes([]);
    setSeverity('medium');
    setVisible(false);
  }, [generateReport, screenName]);

  const SEVERITY_COLORS: Record<string, string> = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
  };

  return (
    <>
      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
        accessibilityLabel="Bug Raporla"
      >
        <Text style={styles.fabIcon}>🐛</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          {/* Annotation canvas */}
          <View style={styles.canvas} ref={internalRef} {...panResponder.panHandlers}>
            {boxes.map((b, i) => (
              <View
                key={i}
                style={[
                  styles.annotationBox,
                  { left: b.x, top: b.y, width: Math.abs(b.w), height: Math.abs(b.h) },
                ]}
              />
            ))}
            {drawing && (
              <View
                style={[
                  styles.annotationBox,
                  {
                    left: drawing.x,
                    top: drawing.y,
                    width: Math.abs(drawing.w ?? 0),
                    height: Math.abs(drawing.h ?? 0),
                  },
                ]}
              />
            )}
            <Text style={styles.canvasHint}>Ekrana sürükleyerek alan işaretle</Text>
          </View>

          {/* Form */}
          <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>🐛 Bug Raporu — {screenName}</Text>

            {/* Severity */}
            <Text style={styles.label}>Önem Seviyesi</Text>
            <View style={styles.severityRow}>
              {(['low', 'medium', 'high'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.severityBtn,
                    { borderColor: SEVERITY_COLORS[s] },
                    severity === s && { backgroundColor: SEVERITY_COLORS[s] },
                  ]}
                  onPress={() => setSeverity(s)}
                >
                  <Text style={[styles.severityText, severity === s && { color: '#fff' }]}>
                    {s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note */}
            <Text style={styles.label}>Gözlem Notu</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Ne görüyorsun? Adımlar, beklenen vs gerçek davranış..."
              value={note}
              onChangeText={setNote}
            />

            {/* Box summary */}
            {boxes.length > 0 && (
              <Text style={styles.boxInfo}>✅ {boxes.length} bölge işaretlendi</Text>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setVisible(false)}>
                <Text style={styles.btnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={saveReport}>
                <Text style={[styles.btnText, { color: '#fff' }]}>💾 Raporu Kaydet</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 999,
  },
  fabIcon: { fontSize: 24 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
  canvas: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  canvasHint: {
    position: 'absolute',
    top: 8,
    left: 8,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  annotationBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.15)',
  },
  form: {
    maxHeight: SCREEN_H * 0.5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#1a1a2e' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  severityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  severityBtn: {
    flex: 1,
    padding: 8,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  severityText: { fontSize: 12, fontWeight: '700', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  boxInfo: { color: '#4CAF50', fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  btnCancel: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSave: {
    flex: 2,
    padding: 14,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { fontWeight: '700', fontSize: 14 },
});
