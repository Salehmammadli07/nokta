import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, SafeAreaView,
} from 'react-native';
import { AuditWidget } from '../components/AuditWidget';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Audit widget entegre et', done: true },
    { id: '2', text: 'Forge döngüsü koştur', done: false },
    { id: '3', text: 'FORGE.md logla', done: false },
  ]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos((t) => [...t, { id: Date.now().toString(), text: input.trim(), done: false }]);
    setInput('');
  };

  const toggle = (id: string) =>
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>📋 Görev Listesi</Text>

        {/* BUG: Tamamlananlar filtre butonu görünüyor ama çalışmıyor */}
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterTxt}>Tamamlananları Gizle</Text>
        </TouchableOpacity>

        <FlatList
          data={todos}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => toggle(item.id)}>
              <Text style={styles.check}>{item.done ? '✅' : '⬜'}</Text>
              <Text style={[styles.itemTxt, item.done && styles.done]}>{item.text}</Text>
            </TouchableOpacity>
          )}
        />

        {/* BUG: Add butonu klavye açıkken layout bozuluyor */}
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Yeni görev..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTodo}>
            <Text style={styles.addTxt}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* drop-in widget */}
      <AuditWidget screenName="HomeScreen" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: '800', marginBottom: 16, color: '#1a1a2e' },
  filterBtn: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  filterTxt: { color: '#555', fontSize: 14 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, elevation: 1 },
  check: { fontSize: 20, marginRight: 10 },
  itemTxt: { fontSize: 15, color: '#222', flex: 1 },
  done: { textDecorationLine: 'line-through', color: '#999' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', fontSize: 14 },
  addBtn: { width: 48, height: 48, backgroundColor: '#1a1a2e', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addTxt: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
