import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Card, CockpitScreen, H2, Icon, NavSpacer, Pill, TopBar } from '@/components/cockpit';
import { Lumina } from '@/constants/lumina';

const templates = [
  ['Welcome Message', 'Hi {{1}}, welcome to Kyrn Growth! We are excited to have you on board. Reply STOP to opt out.', 'Approved', 'Marketing', 'Oct 24'],
  ['Appointment Reminder', 'Reminder: Your appointment is scheduled for {{1}} at {{2}}. Please let us know if you need to reschedule.', 'Pending', 'Utility', 'Oct 22'],
  ['Payment Failed', 'We encountered an issue processing your payment of {{1}}. Please update your billing method.', 'Rejected', 'Utility', 'Oct 20'],
  ['Holiday Promo', 'Special offer! Use code {{1}} for {{2}}% off your next purchase valid until {{3}}.', 'Approved', 'Marketing', 'Oct 18'],
];

export default function TemplatesScreen() {
  return (
    <CockpitScreen>
      <TopBar title="Templates" right="sync" />
      <View style={styles.search}>
        <Icon name="magnify" size={18} color={Lumina.muted} />
        <Text style={styles.searchText}>Search templates...</Text>
      </View>
      <View style={styles.segment}>
        <View style={styles.segmentActive}>
          <Text style={styles.segmentActiveText}>Active</Text>
        </View>
        <View style={styles.segmentIdle}>
          <Text style={styles.segmentIdleText}>Drafts</Text>
        </View>
      </View>

      {templates.map(([title, copy, status, category, date]) => (
        <Link key={title} href="/template-preview" asChild>
          <Pressable>
            <Card style={styles.templateCard}>
              <View style={styles.rowBetween}>
                <H2 style={styles.cardTitle}>{title}</H2>
                <Pill tone={status === 'Approved' ? 'green' : status === 'Pending' ? 'neutral' : 'red'}>
                  {status}
                </Pill>
              </View>
              <Body muted>{copy}</Body>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <Body muted>{category}</Body>
                <Body muted>Updated: {date}</Body>
              </View>
            </Card>
          </Pressable>
        </Link>
      ))}

      <View style={styles.fab}>
        <Icon name="plus" size={24} color={Lumina.onPrimary} />
      </View>
      <NavSpacer />
    </CockpitScreen>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 48,
    borderRadius: 24,
    backgroundColor: Lumina.panel,
    borderWidth: 1,
    borderColor: Lumina.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  searchText: {
    color: Lumina.text,
    fontSize: 14,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 22,
    backgroundColor: Lumina.panelLow,
    borderWidth: 1,
    borderColor: Lumina.line,
    padding: 2,
  },
  segmentActive: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: Lumina.panelHigh,
    alignItems: 'center',
    paddingVertical: 10,
  },
  segmentIdle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  segmentActiveText: {
    color: Lumina.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  segmentIdleText: {
    color: Lumina.text,
    fontSize: 12,
    fontWeight: '800',
  },
  templateCard: {
    borderRadius: 0,
    gap: 14,
  },
  cardTitle: {
    flex: 1,
    fontSize: 21,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Lumina.line,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Lumina.primary,
  },
});
