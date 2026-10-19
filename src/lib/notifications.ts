import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { cartridgeCode, cartridgeName } from './cartridges';
import { addMonths } from './dates';
import { getStoredLang, translate } from './i18n';
import type { AppState } from './storage';

// iOS একসাথে সর্বোচ্চ ৬৪টি লোকাল নোটিফিকেশন রাখে। প্রতি কার্টিজে আগে + দিনে ২টি,
// বাকি জায়গা মেয়াদ-পরের দৈনিক রিমাইন্ডারে ভাগ হয় (৭টি কার্টিজে ৬ দিন, ৫টিতে ৭ দিন)।
// অ্যাপ খুললেই আবার শিডিউল হয়, তাই দৈনিক রিমাইন্ডার চলতেই থাকে।
const NOTIFICATION_BUDGET = 60;
const MAX_DAILY = 7;
const CHANNEL = 'filters';

type NotificationsModule = typeof import('expo-notifications');
let cached: NotificationsModule | null | undefined;

// expo-notifications লোড হলেই Android-এ একটা নেটিভ মডিউল খোঁজে, যেটা Expo Go-তে নেই —
// তাই ওপরে import না করে দরকার হলে লোড করি। Expo Go Android-এ রিমাইন্ডার বন্ধ থাকে,
// ডেভেলপমেন্ট বিল্ড বা আসল অ্যাপে সব কাজ করে।
function load(): NotificationsModule | null {
  if (cached !== undefined) return cached;
  const expoGoAndroid =
    Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (expoGoAndroid || Platform.OS === 'web') return (cached = null);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const N: NotificationsModule = require('expo-notifications');
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    cached = N;
  } catch {
    cached = null;
  }
  return cached;
}

// granted = চালু, blocked = আগে "না" বলা — ফোনের সেটিংস থেকে চালু করতে হবে,
// unavailable = এই পরিবেশে নোটিফিকেশন নেই (Expo Go Android)
export type PermissionResult = 'granted' | 'denied' | 'blocked' | 'unavailable';

export async function requestPermission(channelName: string): Promise<PermissionResult> {
  const Notifications = load();
  if (!Notifications) return 'unavailable';
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: channelName,
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return 'granted';
  if (!cur.canAskAgain) return 'blocked';
  const req = await Notifications.requestPermissionsAsync();
  if (req.granted) return 'granted';
  return req.canAskAgain ? 'denied' : 'blocked';
}

export const ensurePermission = async (channelName: string) => (await requestPermission(channelName)) === 'granted';

// সেটিংসের টেস্ট বাটনের জন্য — কয়েক সেকেন্ড পর একটি নোটিফিকেশন
export async function sendTestReminder(title: string, body: string, seconds = 5) {
  const Notifications = load();
  if (!Notifications) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL },
  });
}

export const cancelAllReminders = async () => {
  await load()?.cancelAllScheduledNotificationsAsync();
};

// সকাল ৯টায়
function at9am(d: Date) {
  const x = new Date(d);
  x.setHours(9, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

async function schedule(title: string, body: string, when: Date) {
  const Notifications = load();
  if (!Notifications || when.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL },
  });
}

export async function rescheduleAll(state: AppState) {
  await cancelAllReminders();
  if (!state.setupDone || !state.remindersOn) return;

  const lang = await getStoredLang();
  const t = (k: Parameters<typeof translate>[1], p?: Record<string, string | number>) => translate(lang, k, p);
  if (!(await ensurePermission(t('nChannel')))) return;

  const now = new Date();
  const count = state.cartridges.length;
  const daily = count ? Math.min(MAX_DAILY, Math.floor((NOTIFICATION_BUDGET - 2 * count) / count)) : 0;

  for (const [i, c] of state.cartridges.entries()) {
    const due = addMonths(new Date(c.installedAt), c.months);
    const name = `${cartridgeCode(c, i)} ${cartridgeName(c, lang)}`;
    const n = state.remindDaysBefore;

    await schedule(t('nSoonTitle'), t('nSoonBody', { name, n }), at9am(addDays(due, -n)));
    await schedule(t('nDueTitle'), t('nDueBody', { name }), at9am(due));

    if (state.dailyAfterExpiry) {
      // মেয়াদ আগেই শেষ হলে আজ থেকে পরের কয়েক দিন
      const first = Math.max(1, Math.floor((now.getTime() - due.getTime()) / 86400000));
      for (let d = first; d < first + daily; d++) {
        await schedule(t('nOverTitle'), t('nOverBody', { name, n: d }), at9am(addDays(due, d)));
      }
    }
  }
}
