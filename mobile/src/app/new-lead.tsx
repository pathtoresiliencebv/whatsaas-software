import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, CockpitScreen, NavSpacer, PrimaryButton, SectionLabel, TopBar } from '@/components/cockpit';
import { Lumina } from '@/constants/lumina';

export default function NewLead() {
  return (
    <CockpitScreen showNav={false}>
      <TopBar title="Nieuwe lead" left="back" right="save" />

      <Card style={styles.card}>
        <SectionLabel>Lead details</SectionLabel>
        <Field label="Naam" placeholder="Bijv. Pure Skin Studio" />
        <Field label="WhatsApp nummer" placeholder="+31 6 ..." />
        <Field label="Pipeline fase" placeholder="Niet toegewezen" />
        <Field label="Eigenaar" placeholder="Nina" />
        <Field label="Notitie" placeholder="Waar wil deze lead hulp bij?" multiline />
        <PrimaryButton>Lead aanmaken</PrimaryButton>
      </Card>
      <NavSpacer />
    </CockpitScreen>
  );
}

function Field({ label, placeholder, multiline }: { label: string; placeholder: string; multiline?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholder={placeholder} placeholderTextColor={Lumina.faint} multiline={multiline} style={[styles.input, multiline ? styles.multiline : null]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  field: { gap: 8 },
  label: { color: Lumina.muted, fontWeight: '800' },
  input: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: Lumina.line, backgroundColor: Lumina.panelHigh, color: Lumina.text, paddingHorizontal: 14 },
  multiline: { minHeight: 110, paddingTop: 14, textAlignVertical: 'top' },
});
