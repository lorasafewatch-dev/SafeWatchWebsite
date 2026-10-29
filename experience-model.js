// Pure state helpers for the showcase. No backend, watch, or patient connection.
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const sampleReadings = [
  { pulse: 72, oxygen: 98 }, { pulse: 76, oxygen: 97 },
  { pulse: 71, oxygen: 99 }, { pulse: 74, oxygen: 98 },
];

export function locationContext(x, y, source = 'current') {
  const inside = Math.hypot(x - 245, y - 210) <= 125;
  if (source === 'last') return {
    inside, title: 'Last known sample point',
    description: `Previously ${inside ? 'inside' : 'outside'} the zone. No current GPS fix.`,
    label: `Previously ${inside ? 'inside' : 'outside'} the zone`,
  };
  return {
    inside,
    title: `${inside ? 'Inside' : 'Outside'} sample safe zone`,
    description: inside ? 'A sample GPS point within the boundary.' : 'A sample GPS point beyond the boundary.',
    label: `${inside ? 'Inside' : 'Outside'} safe zone`,
  };
}

export const alertStages = [
  { name: 'idle', badge: 'READY TO EXPLORE', title: 'A little more prepared.', description: 'Create a sample alert to see what comes next.', action: '' },
  { name: 'received', badge: 'SAMPLE SOS · CARMEN SANTOS', title: 'A sample alert has arrived.', description: 'First, review the linked senior and the incident details.', action: 'Review the example' },
  { name: 'reviewed', badge: 'THE NEXT STEP IS A CHECK-IN', title: 'Check on your loved one.', description: 'In a real incident, contact your senior before confirming a response in the app.', action: 'Confirm sample response' },
  { name: 'confirmed', badge: 'SAMPLE RESPONSE CONFIRMED', title: 'A clearer next step. Taken.', description: 'This example is complete. No real alert was sent and no record was saved.', action: 'Reset the example' },
];
export function nextAlertStage(stage) { return stage >= alertStages.length - 1 ? 0 : stage + 1; }

export const installScenes = {
  iphone: [
    { title: '1. Open the family app in Safari', caption: 'Start with the actual family app’s page on your iPhone.' },
    { title: '2. Share → Add to Home Screen', caption: 'Open Share, or More then Share. Choose Add to Home Screen.' },
    { title: '3. Enable Open as Web App, then Add', caption: 'Turn on Open as Web App if shown, then confirm Add.' },
  ],
  android: [
    { title: '1. Open the family app in Chrome', caption: 'Start with the actual family app’s page on your Android phone.' },
    { title: '2. Menu → Install and create shortcut', caption: 'Your Chrome version may instead show Install app or Add to Home screen.' },
    { title: '3. Confirm the installation', caption: 'Follow Chrome’s installation prompt to add the real app.' },
  ],
};
export function installationScene(device, step) {
  if (step >= 3) return { title: 'Walkthrough complete. Your next step is the real app.', caption: 'Use Open SafeWatch to install, then follow the steps on your phone.' };
  return installScenes[device === 'android' ? 'android' : 'iphone'][clamp(step, 0, 2)];
}

export const tourSteps = [
  { view: 'home', name: 'YOUR FAMILY SPACE', title: 'One family.\nOne clear view.', description: 'Choose a linked senior and see the latest health, location, and safety information together.', hint: 'Try switching the sample senior.' },
  { view: 'health', name: 'HEALTH WITH CONTEXT', title: 'The reading.\nAnd when it arrived.', description: 'Pulse rate and blood oxygen sit together. In the real app, read each measurement alongside its last-update time.', hint: 'Scroll the preview to explore the health view.' },
  { view: 'location', name: 'LOCATION WITH CONTEXT', title: 'A place.\nA little perspective.', description: 'Check the watch’s location and safe-zone status. Current and last-known points have different meanings.', hint: 'This map is illustrative, not a real GPS position.' },
  { view: 'alerts', name: 'SAFETY WITH A NEXT STEP', title: 'See the incident.\nKnow what to check.', description: 'This is a sample SOS. The real app keeps safety incidents and response controls in one place.', hint: 'Try clearing the sample alert inside the phone.' },
  { view: 'profile', name: 'YOUR CONNECTED FAMILY', title: 'More than one senior.\nOne family account.', description: 'Monitor multiple approved senior links. Barangay staff review new watch-access requests before data become available.', hint: 'Use the tabs to explore any other view.' },
];
