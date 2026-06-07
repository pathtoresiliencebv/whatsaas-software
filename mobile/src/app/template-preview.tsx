import { StyleSheet, Text, View } from 'react-native';

import { Body, Card, CockpitScreen, Icon, NavSpacer, Pill, PrimaryButton, SectionLabel } from '@/components/cockpit';
import { Lumina } from '@/constants/lumina';

export default function TemplatePreviewScreen() {
  return (
    <CockpitScreen showNav={false}>
      <View style={styles.previewTop}>
        <View style={styles.previewBack}>
          <Icon name="chevron-left" size={24} />
        </View>
        <Text style={styles.previewTitle}>Summer Sale Promo</Text>
        <Pill tone="green">Approved</Pill>
      </View>

      <Text style={styles.previewLabel}>Message Preview</Text>
      <View style={styles.phone}>
        <View style={styles.chatHeader}>
          <Icon name="chevron-left" size={22} color={Lumina.muted} />
          <View style={styles.logo}>
            <Text style={styles.logoText}>K</Text>
          </View>
          <Text style={styles.brand}>Kyrn Growth</Text>
        </View>
        <View style={styles.chatCanvas}>
          <View style={styles.today}>
            <Body muted>Today</Body>
          </View>
          <Card style={styles.messageCard}>
            <View style={styles.imageHero}>
              <Text style={styles.imageText}>SUMMER</Text>
            </View>
            <Text style={styles.messageTitle}>
              Hey <Text style={styles.variable}>{'{{1}}'}</Text> ! Sun
            </Text>
            <Body>
              Our biggest Summer Sale is finally here. Get up to <Text style={styles.variable}>{'{{2}}'}</Text>% off on all premium collections.
            </Body>
            <Body>Hurry, this exclusive offer ends in 48 hours!</Body>
            <View style={styles.rowBetween}>
              <Body muted>Reply STOP to opt out</Body>
              <Body muted>10:42 AM</Body>
            </View>
          </Card>
          <View style={styles.ctaBubble}>
            <Text style={styles.ctaText}>Shop the Sale</Text>
          </View>
          <View style={styles.ctaBubble}>
            <Text style={styles.ctaText}>Talk to an Agent</Text>
          </View>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <Card style={styles.metaCard}>
          <SectionLabel>Category</SectionLabel>
          <Text style={styles.metaValue}>Marketing</Text>
        </Card>
        <Card style={styles.metaCard}>
          <SectionLabel>Language</SectionLabel>
          <Text style={styles.metaValue}>English (US)</Text>
        </Card>
      </View>

      <Card style={styles.templateId}>
        <SectionLabel>Template ID</SectionLabel>
        <View style={styles.rowBetween}>
          <Text style={styles.idText}>sum_sale_24_v1</Text>
          <Icon name="content-copy" size={19} />
        </View>
      </Card>

      <Card style={styles.mapping}>
        <Text style={styles.mappingTitle}>Variable Mapping</Text>
        <MapRow token="{{1}}" label="Contact First Name" />
        <MapRow token="{{2}}" label="Discount Value (e.g., 50)" />
        <Body muted>Values will be dynamically replaced when sending the campaign.</Body>
      </Card>

      <Card style={styles.quality}>
        <View style={styles.qualityDot} />
        <View style={{ flex: 1 }}>
          <Text style={styles.metaValue}>High Quality</Text>
          <Body muted>This template has an excellent response rate historically.</Body>
        </View>
      </Card>

      <View style={styles.bottomActions}>
        <View style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Edit Template</Text>
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton>Use in Campaign</PrimaryButton>
        </View>
      </View>
      <NavSpacer />
    </CockpitScreen>
  );
}

function MapRow({ token, label }: { token: string; label: string }) {
  return (
    <View style={styles.mapRow}>
      <Text style={styles.token}>{token}</Text>
      <Body>{label}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  previewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  previewBack: {
    width: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    flex: 1,
    color: Lumina.primary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  previewLabel: {
    color: Lumina.text,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '800',
  },
  phone: {
    borderRadius: 38,
    overflow: 'hidden',
    borderWidth: 7,
    borderColor: Lumina.panelHigh,
    backgroundColor: '#0e171c',
  },
  chatHeader: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    backgroundColor: '#203039',
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#122418',
  },
  logoText: {
    color: Lumina.primary,
    fontWeight: '800',
  },
  brand: {
    color: Lumina.text,
    fontSize: 16,
  },
  chatCanvas: {
    padding: 18,
    gap: 10,
  },
  today: {
    alignSelf: 'center',
    borderRadius: 16,
    backgroundColor: Lumina.panelHigh,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  messageCard: {
    borderRadius: 12,
    gap: 12,
    backgroundColor: '#24343d',
  },
  imageHero: {
    height: 142,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#19b6ba',
  },
  imageText: {
    color: '#022629',
    fontSize: 32,
    fontWeight: '900',
  },
  messageTitle: {
    color: Lumina.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  variable: {
    color: Lumina.primary,
    fontWeight: '900',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  ctaBubble: {
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: '#24343d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: Lumina.cyan,
    fontSize: 15,
    fontWeight: '800',
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metaCard: {
    flex: 1,
    gap: 6,
  },
  metaValue: {
    color: Lumina.text,
    fontSize: 16,
    lineHeight: 22,
  },
  templateId: {
    gap: 10,
  },
  idText: {
    color: Lumina.primary,
    fontSize: 14,
  },
  mapping: {
    gap: 18,
  },
  mappingTitle: {
    color: Lumina.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  mapRow: {
    borderBottomWidth: 1,
    borderBottomColor: Lumina.line,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  token: {
    color: Lumina.primary,
    fontSize: 14,
    fontWeight: '800',
    borderRadius: 12,
    backgroundColor: 'rgba(112,221,117,0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  quality: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  qualityDot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(112,221,117,0.13)',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    width: 130,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: Lumina.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: Lumina.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
