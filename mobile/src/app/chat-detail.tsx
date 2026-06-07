import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, Card, CockpitScreen, GhostButton, NavSpacer, Pill, PrimaryButton, SectionLabel, TopBar } from '@/components/cockpit';
import { chats, messages } from '@/constants/cockpit-data';
import { Lumina } from '@/constants/lumina';

export default function ChatDetail() {
  const params = useLocalSearchParams<{ chat?: string }>();
  const chat = chats.find((item) => item.id === params.chat) ?? chats[0];

  return (
    <CockpitScreen showNav={false}>
      <TopBar title="Chat" left="back" right="more" />

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{chat.initials}</Text>
        </View>
        <View style={styles.profileContent}>
          <Text style={styles.name}>{chat.name}</Text>
          <Body muted>{chat.phone} - {chat.status}</Body>
          <View style={styles.tagRow}>
            <Pill>{chat.kind}</Pill>
            <Pill tone="green">{chat.stage}</Pill>
            <Pill>Owner {chat.owner}</Pill>
          </View>
        </View>
      </Card>

      <View style={styles.quickActions}>
        <PrimaryButton>AI hervatten</PrimaryButton>
        <Link href={{ pathname: '/contact-profile', params: { chat: chat.id } }} asChild>
          <Pressable style={styles.profileButton}>
            <Text style={styles.profileButtonText}>Profiel</Text>
          </Pressable>
        </Link>
      </View>

      <View>
        <SectionLabel>Gesprekshistorie</SectionLabel>
        <View style={styles.messageList}>
          {messages.map((message) => {
            const mine = message.from === 'me';
            return (
              <View key={message.id} style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleThem]}>
                <Text style={[styles.bubbleText, mine ? styles.bubbleTextMine : null]}>{message.body}</Text>
                <Text style={[styles.bubbleTime, mine ? styles.bubbleTimeMine : null]}>{message.time}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Card style={styles.composer}>
        <TextInput placeholder="Typ een bericht..." placeholderTextColor={Lumina.faint} style={styles.input} />
        <GhostButton>Bijlage</GhostButton>
      </Card>
      <NavSpacer />
    </CockpitScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(112,221,117,0.15)', borderWidth: 1, borderColor: 'rgba(112,221,117,0.28)' },
  avatarText: { color: Lumina.primary, fontWeight: '900' },
  profileContent: { flex: 1, gap: 8 },
  name: { color: Lumina.text, fontSize: 21, fontWeight: '900' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickActions: { flexDirection: 'row', gap: 10 },
  profileButton: { height: 58, borderRadius: 999, borderWidth: 1, borderColor: Lumina.line, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, backgroundColor: Lumina.panelHigh },
  profileButtonText: { color: Lumina.text, fontWeight: '800' },
  messageList: { gap: 10, marginTop: 12 },
  bubble: { maxWidth: '84%', borderRadius: 20, padding: 14, gap: 6 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: Lumina.panelHigh, borderTopLeftRadius: 6 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: Lumina.primaryStrong, borderTopRightRadius: 6 },
  bubbleText: { color: Lumina.text, fontSize: 16, lineHeight: 22 },
  bubbleTextMine: { color: '#f3fff0' },
  bubbleTime: { color: Lumina.faint, fontSize: 11 },
  bubbleTimeMine: { color: '#d9ffd7' },
  composer: { gap: 12 },
  input: { minHeight: 48, borderRadius: 16, backgroundColor: Lumina.panelHigh, borderWidth: 1, borderColor: Lumina.line, color: Lumina.text, paddingHorizontal: 14 },
});
