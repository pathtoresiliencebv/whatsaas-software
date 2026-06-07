import { StyleSheet, Text, View } from 'react-native';

import { Body, Card, CockpitScreen, Icon, NavSpacer, SectionLabel, TopBar } from '@/components/cockpit';
import { Lumina } from '@/constants/lumina';

const groups = [
  ['ACCOUNT', [['Personal Info', ''], ['Security & Password', ''], ['Delete Account', 'danger']]],
  ['MANAGEMENT', [['Team Members', ''], ['Connections', 'WABA sync active']]],
  ['PREFERENCES', [['Theme', 'Dark'], ['Language', 'Nederlands'], ['Notifications', '']]],
] as const;

export default function SettingsScreen() {
  return (
    <CockpitScreen>
      <TopBar title="Instellingen" left="back" />
      <Card style={styles.profile}>
        <View style={styles.photo}>
          <Text style={styles.photoText}>SJ</Text>
          <View style={styles.editDot}>
            <Icon name="pencil-outline" size={15} color={Lumina.onPrimary} />
          </View>
        </View>
        <Text style={styles.name}>Sarah Jenkins</Text>
        <View style={styles.ownerPill}>
          <Body muted>Owner</Body>
        </View>
      </Card>

      {groups.map(([label, rows]) => (
        <View key={label} style={styles.group}>
          <SectionLabel>{label}</SectionLabel>
          <Card style={styles.list}>
            {rows.map(([title, value], index) => (
              <View key={title} style={[styles.listRow, index > 0 && styles.withBorder]}>
                <View style={[styles.icon, title === 'Delete Account' && styles.dangerIcon]}>
                  <Text style={[styles.iconText, title === 'Delete Account' && styles.dangerText]}>
                    {title.slice(0, 1)}
                  </Text>
                </View>
                <View style={styles.rowCopy}>
                  <Text style={[styles.rowTitle, title === 'Delete Account' && styles.dangerText]}>{title}</Text>
                  {value === 'WABA sync active' && <Body muted>{value}</Body>}
                </View>
                {value && value !== 'WABA sync active' && value !== 'danger' ? (
                  <Body muted>{value}</Body>
                ) : (
                  <Icon name="chevron-right" size={17} />
                )}
              </View>
            ))}
          </Card>
        </View>
      ))}

      <View style={styles.logout}>
        <Icon name="logout" size={19} />
        <Text style={styles.logoutText}>Log Out</Text>
      </View>
      <Body muted style={styles.version}>Kyrn Growth v2.4.1{'\n'}Terms of Service - Privacy Policy</Body>
      <NavSpacer />
    </CockpitScreen>
  );
}

const styles = StyleSheet.create({
  profile: {
    alignItems: 'center',
    paddingVertical: 26,
    gap: 12,
  },
  photo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 4,
    borderColor: Lumina.primaryStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Lumina.panelHigh,
  },
  photoText: {
    color: Lumina.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  editDot: {
    position: 'absolute',
    right: -4,
    bottom: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Lumina.primaryStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: Lumina.text,
    fontSize: 22,
    fontWeight: '800',
  },
  ownerPill: {
    borderRadius: 999,
    backgroundColor: Lumina.panelHigh,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  group: {
    gap: 12,
  },
  list: {
    padding: 0,
    overflow: 'hidden',
  },
  listRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
  },
  withBorder: {
    borderTopWidth: 1,
    borderTopColor: Lumina.line,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Lumina.panelHigh,
  },
  iconText: {
    color: Lumina.text,
    fontSize: 16,
    fontWeight: '800',
  },
  dangerIcon: {
    backgroundColor: 'rgba(255,157,150,0.13)',
  },
  dangerText: {
    color: Lumina.danger,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    color: Lumina.text,
    fontSize: 16,
    lineHeight: 22,
  },
  logout: {
    height: 60,
    borderRadius: 30,
    backgroundColor: Lumina.panelHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logoutText: {
    color: Lumina.text,
    fontSize: 18,
    fontWeight: '800',
  },
  version: {
    textAlign: 'center',
  },
});
