import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Card, CockpitScreen, H2, NavSpacer, Pill, RouteButton, SectionLabel, TopBar } from '@/components/cockpit';
import { chats } from '@/constants/cockpit-data';
import { Lumina } from '@/constants/lumina';

export default function InboxHome() {
  return (
    <CockpitScreen>
      <TopBar title="Inbox" right="sync" />

      <Card style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTitle}>
            <Text style={styles.kicker}>WhatsApp v1</Text>
            <H2>Team inbox</H2>
          </View>
          <Pill tone="green">Connected</Pill>
        </View>
        <Body muted>Chats, pipeline status en sync horen samen te vallen, zonder per contact handmatig geschiedenis op te halen.</Body>
        <View style={styles.metrics}>
          <Metric value="49" label="Open chats" />
          <Metric value="7" label="Hot leads" />
          <Metric value="91%" label="Synced" />
        </View>
      </Card>

      <View style={styles.actions}>
        <RouteButton href="/pipeline">Open pipeline</RouteButton>
        <RouteButton href="/new-lead">Nieuwe lead</RouteButton>
      </View>

      <SectionLabel>Gesprekken</SectionLabel>
      {chats.map((chat) => (
        <Link key={chat.id} href={{ pathname: '/chat-detail', params: { chat: chat.id } }} asChild>
          <Pressable>
            <Card style={styles.chatCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{chat.initials}</Text>
              </View>
              <View style={styles.chatBody}>
                <View style={styles.rowBetween}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Body muted>{chat.time}</Body>
                </View>
                <Body muted>{chat.lastMessage}</Body>
                <View style={styles.tagRow}>
                  <Pill tone={chat.kind === 'Lead' ? 'purple' : 'neutral'}>{chat.kind}</Pill>
                  <Pill tone={chat.temperature === 'Hot' ? 'amber' : 'green'}>{chat.stage}</Pill>
                  {chat.unread > 0 ? <Pill tone="green">{chat.unread}</Pill> : null}
                </View>
              </View>
            </Card>
          </Pressable>
        </Link>
      ))}
      <NavSpacer />
    </CockpitScreen>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Body muted>{label}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 18 },
  heroHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 },
  heroTitle: { flex: 1 },
  kicker: { color: Lumina.primary, fontSize: 13, lineHeight: 18, fontWeight: '800', marginBottom: 6 },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { flex: 1, borderRadius: 22, backgroundColor: Lumina.panelHigh, padding: 14 },
  metricValue: { color: Lumina.text, fontSize: 25, lineHeight: 32, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 12 },
  chatCard: { flexDirection: 'row', gap: 14, borderRadius: 22 },
  avatar: { width: 46, height: 46, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(112,221,117,0.15)', borderWidth: 1, borderColor: 'rgba(112,221,117,0.25)' },
  avatarText: { color: Lumina.primary, fontSize: 15, fontWeight: '900' },
  chatBody: { flex: 1, gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  chatName: { flex: 1, color: Lumina.text, fontSize: 16, lineHeight: 22, fontWeight: '800' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
