import { client } from "./axiosClient";
import type {
  IAxiosProfileProps,
  IAxiosRegisterProps,
  Events,
  EventNodes,
  Referrer,
} from "../types";

export async function conciergeSync({
  codeword,
  email,
  encryptedEmail,
  encryptedCode,
  referrer,
  fingerprint,
}: IAxiosRegisterProps) {
  const payload =
    referrer.httpReferrer === ``
      ? {
          codeword,
          email,
          encryptedEmail,
          encryptedCode,
          fingerprint,
        }
      : {
          codeword,
          email,
          encryptedEmail,
          encryptedCode,
          referrer,
          fingerprint,
        };
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const options: any = { authorization: false };
  return client.post(`/auth/sync`, payload, options);
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
  return client.post(`/users/eventStream`, {
    nodes,
    events,
    referrer,
  });
}

export async function getGraph() {
  return client.get(`/users/graph`);
}

export async function loadProfile() {
  return client.get(`/users/profile`);
}

export async function saveProfile({ profile }: IAxiosProfileProps) {
  return client.post(`/users/profile`, profile);
}
