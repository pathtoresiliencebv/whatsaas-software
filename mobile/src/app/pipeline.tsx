import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Card, CockpitScreen, H2, NavSpacer, Pill, RouteButton, SectionLabel, TopBar } from '@/components/cockpit';
import { chats, pipelineStages } from '@/constants/cockpit-data';
import { Lumina } from '@/constants/lumina';

export default function Pipeline() {
  return (
    <CockpitScreen>
      <TopBar title="Pipeline" right="plus" />

      <Card style={styles.summary}>
        <SectionLabel>Verkooppipeline</SectionLabel>
        <H2>WhatsApp leads per fase</H2>
        <Body muted>Elke kaart kan direct door naar chat of contactprofiel. De app mag dus nooit meer een los wit detailpaneel tonen.</Body>
        <View style={styles.actions}>
          <RouteButton href="/new-lead">Nieuwe lead</RouteButton>
        </View>
      </Card>

      {pipelineStages.map((stage) => (
        <Card key={stage.title} style={styles.stageCard}>
          <View style={styles.stageHeader}>
            <View style={styles.stageCopy}>
              <Text style={styles.stageTitle}>{stage.title}</Text>
              <Body muted>{stage.value}</Body>
            </View>
            <Pill tone={stage.title === 'Won' ? 'green' : stage.title === 'Negotiation' ? 'amber' : 'neutral'}>{stage.count}</Pill>
          </View>
          <View style={styles.leadList}>
            {stage.chats.map((leadName, index) => {
              const chat = chats.find((item) => item.name === leadName) ?? chats[index % chats.length];
              return (
                <Link key={leadName} href={{ pathname: '/chat-detail', params: { chat: chat.id } }} asChild>
                  <Pressable style={styles.leadCard}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{chat.initials}</Text>
                    </View>
                    <View style={styles.leadBody}>
                      <Text style={styles.leadName}>{leadName}</Text>
                      <Body muted>{chat.lastMessage}</Body>
                      <View style={styles.tags}>
                        <Pill>{chat.owner}</Pill>
                        <Pill tone={chat.temperature === 'Hot' ? 'amber' : 'green'}>{chat.temperature}</Pill>
                      </View>
                    </View>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        </Card>
      ))}
      <NavSpacer />
    </CockpitScreen>
  );
}

const styles = StyleSheet.create({
  summary: { gap: 14 },
  actions: { marginTop: 2 },
  stageCard: { gap: 16 },
  stageHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  stageCopy: { flex: 1, minWidth: 0 },
  stageTitle: { color: Lumina.text, fontSize: 19, fontWeight: '900', marginBottom: 4 },
  leadList: { gap: 10 },
  leadCard: { flexDirection: 'row', gap: 12, borderRadius: 22, backgroundColor: Lumina.panelHigh, padding: 12, borderWidth: 1, borderColor: Lumina.line },
  avatar: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(112,221,117,0.15)' },
  avatarText: { color: Lumina.primary, fontWeight: '900' },
  leadBody: { flex: 1, minWidth: 0, gap: 7 },
  leadName: { color: Lumina.text, fontSize: 15, fontWeight: '900', flexShrink: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
