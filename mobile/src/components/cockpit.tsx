import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, Link, usePathname, useRouter } from 'expo-router';
import { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, TextStyle, useWindowDimensions, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Lumina, cockpitShadow } from '@/constants/lumina';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type TopAction = 'sync' | 'plus' | 'more' | 'save' | 'search' | 'copy' | 'edit' | 'none';

const icons = {
  back: 'chevron-left',
  menu: 'menu',
  plus: 'plus',
  sync: 'sync',
  more: 'dots-horizontal',
  save: 'content-save-outline',
  search: 'magnify',
  copy: 'content-copy',
  edit: 'pencil-outline',
  inbox: 'inbox-outline',
  pipeline: 'chart-timeline-variant',
  templates: 'file-document-outline',
  contacts: 'account-group-outline',
  settings: 'cog-outline',
} satisfies Record<string, IconName>;

export function Icon({
  name,
  color = Lumina.text,
  size = 22,
  style,
}: {
  name: IconName;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style as ComponentProps<typeof MaterialCommunityIcons>['style']} />;
}

export function CockpitScreen({ children, showNav = true }: PropsWithChildren<{ showNav?: boolean }>) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(320, Math.min(width - 32, 398));

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { width: contentWidth }]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic">
          {children}
        </ScrollView>
        {showNav && <BottomNav />}
      </SafeAreaView>
    </View>
  );
}

export function TopBar({
  title,
  left = 'menu',
  right,
}: {
  title: string;
  left?: 'menu' | 'back' | 'none';
  right?: TopAction;
}) {
  return (
    <View style={styles.topBar}>
      {left === 'none' ? (
        <View style={styles.topAction} />
      ) : (
        <Link href={left === 'back' ? '/' : '/settings'} asChild>
          <Pressable style={({ pressed }) => [styles.topAction, pressed && styles.pressed]}>
            <Icon name={left === 'back' ? icons.back : icons.menu} size={24} />
          </Pressable>
        </Link>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.topAction}>
        {right && right !== 'none' && <Icon name={icons[right]} size={23} />}
      </View>
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <Animated.View entering={FadeInDown.duration(260).springify().damping(18)} layout={LinearTransition.duration(180)} style={[styles.card, cockpitShadow, style]}>
      {children}
    </Animated.View>
  );
}

export function SectionLabel({ children }: PropsWithChildren) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Body({ children, muted = false, style }: PropsWithChildren<{ muted?: boolean; style?: TextStyle }>) {
  return <Text style={[styles.body, muted && styles.muted, style]}>{children}</Text>;
}

export function H2({ children, style }: PropsWithChildren<{ style?: TextStyle }>) {
  return <Text style={[styles.h2, style]}>{children}</Text>;
}

export function Pill({
  children,
  tone = 'neutral',
}: PropsWithChildren<{ tone?: 'neutral' | 'green' | 'amber' | 'red' | 'cyan' | 'purple' }>) {
  const toneStyle = {
    neutral: styles.neutralPill,
    green: styles.greenPill,
    amber: styles.amberPill,
    red: styles.redPill,
    cyan: styles.cyanPill,
    purple: styles.purplePill,
  }[tone];
  const textStyle = {
    neutral: styles.neutralText,
    green: styles.greenText,
    amber: styles.amberText,
    red: styles.redText,
    cyan: styles.cyanText,
    purple: styles.purpleText,
  }[tone];
  return (
    <View style={[styles.pill, toneStyle]}>
      <Text style={[styles.pillText, textStyle]}>{children}</Text>
    </View>
  );
}

export function PrimaryButton({ children }: PropsWithChildren) {
  return (
    <ScalePressable style={styles.primaryButton}>
      <Text numberOfLines={1} style={styles.primaryButtonText}>{children}</Text>
    </ScalePressable>
  );
}

export function GhostButton({ children }: PropsWithChildren) {
  return (
    <ScalePressable style={styles.ghostButton}>
      <Text numberOfLines={1} style={styles.ghostButtonText}>{children}</Text>
    </ScalePressable>
  );
}

export function RouteButton({ href, children }: PropsWithChildren<{ href: Href }>) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.primaryButton, styles.pressTransition, pressed && styles.pressedScale]}>
      <Text numberOfLines={1} style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function NavSpacer() {
  return <View style={{ height: 88 }} />;
}

function BottomNav() {
  const pathname = usePathname();
  const items: [Href, string, IconName][] = [
    ['/', 'Inbox', icons.inbox],
    ['/pipeline', 'Pipeline', icons.pipeline],
    ['/templates', 'Templates', icons.templates],
    ['/contacts', 'Contacts', icons.contacts],
    ['/settings', 'Settings', icons.settings],
  ];

  return (
    <View style={styles.navWrap}>
      <View style={styles.navBar}>
        {items.map(([href, label, icon]) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(String(href)));
          return (
            <Link key={label} href={href} asChild>
              <Pressable style={StyleSheet.flatten([styles.navItem, active && styles.navItemActive])}>
                <Icon name={icon} size={18} color={active ? Lumina.primary : Lumina.muted} />
                <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

function ScalePressable({
  children,
  style,
  ...pressableProps
}: PropsWithChildren<ComponentProps<typeof Pressable>>) {
  return (
    <AnimatedPressable
      {...pressableProps}
      style={({ pressed }) => [
        style,
        styles.pressTransition,
        pressed && styles.pressedScale,
      ]}>
      {children}
    </AnimatedPressable>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Lumina.bg,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
    maxWidth: '100%',
  },
  content: {
    alignItems: 'stretch',
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 20,
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  topAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: Lumina.primary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  card: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    backgroundColor: Lumina.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Lumina.line,
    padding: 16,
    overflow: 'hidden',
  },
  section: {
    color: Lumina.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  h2: {
    flexShrink: 1,
    color: Lumina.text,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
  },
  body: {
    flexShrink: 1,
    color: Lumina.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  muted: {
    color: Lumina.muted,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  neutralPill: { backgroundColor: Lumina.panelHigh },
  greenPill: { backgroundColor: 'rgba(112,221,117,0.17)' },
  amberPill: { backgroundColor: 'rgba(245,185,91,0.17)' },
  redPill: { backgroundColor: 'rgba(255,157,150,0.16)' },
  cyanPill: { backgroundColor: 'rgba(99,216,255,0.15)' },
  purplePill: { backgroundColor: 'rgba(181,156,255,0.17)' },
  neutralText: { color: Lumina.text },
  greenText: { color: Lumina.primary },
  amberText: { color: Lumina.amber },
  redText: { color: Lumina.danger },
  cyanText: { color: Lumina.cyan },
  purpleText: { color: Lumina.purple },
  primaryButton: {
    minHeight: 54,
    flex: 1,
    borderRadius: 999,
    backgroundColor: Lumina.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  primaryButtonText: {
    color: Lumina.onPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  ghostButton: {
    minHeight: 54,
    flex: 1,
    borderRadius: 999,
    backgroundColor: Lumina.panelHigh,
    borderWidth: 1,
    borderColor: Lumina.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  ghostButtonText: {
    color: Lumina.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
  },
  pressTransition: {
    transitionProperty: 'transform, opacity',
    transitionDuration: 140,
  },
  pressedScale: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: 'rgba(17,20,21,0.94)',
  },
  navBar: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: Lumina.panelLow,
    borderWidth: 1,
    borderColor: Lumina.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 4,
  },
  navItem: {
    flex: 1,
    minHeight: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navItemActive: {
    backgroundColor: Lumina.panelHigh,
  },
  navText: {
    color: Lumina.text,
    fontSize: 12,
    fontWeight: '800',
  },
  navTextActive: {
    color: Lumina.primary,
  },
});

