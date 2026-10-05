/* Local Web Audio synthesis: no autoplay and no sound asset download. */
export function createAmbience(button) {
  let context;
  let gain;
  let timer;
  let enabled = false;
  let beat = 0;
  const label = button.querySelector('.mono');

  function tick() {
    if (!enabled || document.hidden || !context || context.state !== 'running') return;
    const osc = context.createOscillator();
    const envelope = context.createGain();
    const now = context.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(beat++ % 2 ? 1750 : 2300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + .017);
    envelope.gain.setValueAtTime(.10, now);
    envelope.gain.exponentialRampToValueAtTime(.0001, now + .035);
    osc.connect(envelope); envelope.connect(gain);
    osc.start(now); osc.stop(now + .04);
    osc.onended = () => { osc.disconnect(); envelope.disconnect(); };
  }

  async function toggle() {
    try {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) { label.textContent = 'UNAVAILABLE'; return; }
        context = new AudioContext();
        gain = context.createGain();
        gain.gain.value = .25;
        gain.connect(context.destination);
      }
      enabled = !enabled;
      if (enabled) {
        await context.resume();
        tick();
        timer = window.setInterval(tick, 500);
      } else {
        clearInterval(timer);
        await context.suspend();
      }
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', enabled ? 'Mute mechanical ambience' : 'Enable mechanical ambience');
      label.textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
    } catch {
      enabled = false;
      clearInterval(timer);
      label.textContent = 'SOUND OFF';
      button.setAttribute('aria-pressed', 'false');
    }
  }
  button.addEventListener('click', toggle);
  return () => { clearInterval(timer); button.removeEventListener('click', toggle); context?.close(); };
}
