import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Card, CockpitScreen, NavSpacer, Pill, PrimaryButton, SectionLabel, TopBar } from '@/components/cockpit';
import { chats } from '@/constants/cockpit-data';
import { Lumina } from '@/constants/lumina';

export default function ContactProfile() {
  const params = useLocalSearchParams<{ chat?: string }>();
  const chat = chats.find((item) => item.id === params.chat) ?? chats[0];

  return (
    <CockpitScreen showNav={false}>
      <TopBar title="Contact" left="back" right="edit" />

      <Card style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{chat.initials}</Text>
        </View>
        <Text style={styles.name}>{chat.name}</Text>
        <Body muted>{chat.phone}</Body>
        <View style={styles.tags}>
          <Pill tone="green">{chat.kind}</Pill>
          <Pill tone={chat.temperature === 'Hot' ? 'amber' : 'neutral'}>{chat.temperature}</Pill>
          <Pill>{chat.stage}</Pill>
        </View>
      </Card>

      <View>
        <SectionLabel>Acties</SectionLabel>
        <View style={styles.actionGrid}>
          <PrimaryButton>Open chat</PrimaryButton>
          <PrimaryButton>Bel via voice</PrimaryButton>
        </View>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>CRM context</Text>
        <ProfileRow label="Eigenaar" value={chat.owner} />
        <ProfileRow label="Status" value={chat.status} />
        <ProfileRow label="Laatste sync" value="Vandaag 16:58" />
        <ProfileRow label="Bron" value="WhatsApp v1 import" />
      </Card>

      <Card style={styles.note}>
        <SectionLabel>Notitie</SectionLabel>
        <Text style={styles.noteText}>Media en profielnaam moeten vanuit de bulk-sync meekomen, zodat dit profiel niet handmatig gevuld hoeft te worden.</Text>
      </Card>
      <NavSpacer />
    </CockpitScreen>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 10 },
  avatar: { width: 76, height: 76, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(112,221,117,0.15)', borderWidth: 1, borderColor: 'rgba(112,221,117,0.28)' },
  avatarText: { color: Lumina.primary, fontWeight: '900', fontSize: 22 },
  name: { color: Lumina.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  actionGrid: { gap: 10 },
  section: { gap: 14 },
  sectionTitle: { color: Lumina.text, fontSize: 18, fontWeight: '900' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Lumina.line },
  rowLabel: { color: Lumina.faint },
  rowValue: { color: Lumina.text, fontWeight: '800', flexShrink: 1, textAlign: 'right' },
  note: { gap: 10 },
  noteText: { color: Lumina.muted, lineHeight: 22 },
});
