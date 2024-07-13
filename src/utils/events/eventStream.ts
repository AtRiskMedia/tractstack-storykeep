import { CONCIERGE_SYNC_INTERVAL } from "../../constants";
import { events } from "../../store/events";
import { eventSync } from "./eventSync";

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export function eventStream() {
  async function init() {
    try {
      const payload = events.get();
      if (payload.length) {
        events.set([]);
        const result = await eventSync(payload);
        if (!result) {
          console.log(`sync failed; events re-queued`);
          events.set([...events.get(), ...payload]);
        }
      }
    } catch (e) {
      console.log(`error establishing concierge eventStream`, e);
    } finally {
      timeoutId = setTimeout(init, CONCIERGE_SYNC_INTERVAL);
    }
  }

  if (!timeoutId) {
    timeoutId = setTimeout(init, CONCIERGE_SYNC_INTERVAL);
  }

  return {
    stop: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}
