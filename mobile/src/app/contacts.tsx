import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Card, CockpitScreen, NavSpacer, Pill, SectionLabel, TopBar } from '@/components/cockpit';
import { chats } from '@/constants/cockpit-data';
import { Lumina } from '@/constants/lumina';

export default function Contacts() {
  return (
    <CockpitScreen>
      <TopBar title="Contacts" right="plus" />

      <Card style={styles.summary}>
        <SectionLabel>CRM</SectionLabel>
        <Text style={styles.title}>Alle WhatsApp contacten</Text>
        <Body muted>Contacten gebruiken dezelfde bron als de inbox, zodat naam, foto, telefoonnummer en pipeline-fase overal gelijk zijn.</Body>
      </Card>

      <View>
        <SectionLabel>Recent actief</SectionLabel>
        <View style={styles.list}>
          {chats.map((chat) => (
            <Link key={chat.id} href={{ pathname: '/contact-profile', params: { chat: chat.id } }} asChild>
              <Pressable>
                <Card style={styles.contactCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{chat.initials}</Text>
                  </View>
                  <View style={styles.content}>
                    <Text style={styles.name}>{chat.name}</Text>
                    <Body muted>{chat.phone}</Body>
                    <View style={styles.tags}>
                      <Pill>{chat.stage}</Pill>
                      <Pill tone="green">{chat.owner}</Pill>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
      <NavSpacer />
    </CockpitScreen>
  );
}

const styles = StyleSheet.create({
  summary: { gap: 10 },
  title: { color: Lumina.text, fontSize: 24, fontWeight: '900' },
  list: { gap: 12, marginTop: 12 },
  contactCard: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(112,221,117,0.15)' },
  avatarText: { color: Lumina.primary, fontWeight: '900' },
  content: { flex: 1, gap: 7 },
  name: { color: Lumina.text, fontWeight: '900', fontSize: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
