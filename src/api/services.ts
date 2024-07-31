import { fetchWithAuth } from "./fetchClient";
import { auth } from "../store/auth";
import type {
  IAxiosProfileProps,
  IAxiosRegisterProps,
  Events,
  EventNodes,
  Referrer,
} from "../types";

export async function conciergeSync(props: IAxiosRegisterProps) {
  return fetchWithAuth("/auth/sync", {
    method: "POST",
    body: JSON.stringify(props),
  });
}

export async function pushPayload({
  events,
  nodes,
  referrer,
}: {
  events: Events;
  nodes: EventNodes;
  referrer: Referrer;
}) {
  const refreshToken = auth.get().refreshToken;
  const response = await fetchWithAuth("/events/stream", {
    method: "POST",
    body: JSON.stringify({ nodes, events, referrer, refreshToken }),
  });

  if (response.newRefreshToken) {
    auth.setKey("refreshToken", response.newRefreshToken);
  }

  return response;
}

export async function getGraph() {
  return fetchWithAuth("/builder/graph");
}

export async function loadProfile() {
  return fetchWithAuth("/builder/profile");
}

export async function saveProfile({ profile }: IAxiosProfileProps) {
  return fetchWithAuth("/builder/profile", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}
