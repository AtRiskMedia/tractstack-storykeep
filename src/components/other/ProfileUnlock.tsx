import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { classNames } from "../../utils/helpers";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  auth,
  profile,
  error,
  success,
  loading,
  referrer,
} from "../../store/auth";
import { getTokens } from "../../api/axiosClient";

export async function goUnlockProfile(payload: {
  email: string;
  codeword: string;
}) {
  try {
    const ref = referrer.get();
    const settings = { ...payload, referrer: ref };
    const conciergeSync = await getTokens(settings);
    if (conciergeSync?.error) {
      error.set(true);
      success.set(false);
      loading.set(undefined);
      profile.set({
        firstname: undefined,
        contactPersona: undefined,
        email: undefined,
        shortBio: undefined,
      });
      auth.setKey(`unlockedProfile`, undefined);
      return false;
    }
    if (conciergeSync?.auth) {
      auth.setKey(`unlockedProfile`, `1`);
      auth.setKey(`hasProfile`, `1`);
    }
    if (conciergeSync?.encryptedEmail) {
      auth.setKey(`encryptedEmail`, conciergeSync.encryptedEmail);
    }
    if (conciergeSync?.encryptedCode) {
      auth.setKey(`encryptedCode`, conciergeSync.encryptedCode);
    }
    auth.setKey(`active`, Date.now().toString());
    if (conciergeSync?.jwt) {
      auth.setKey(`token`, conciergeSync.jwt);
    }
    if (conciergeSync?.refreshToken) {
      auth.setKey(`refreshToken`, conciergeSync.refreshToken);
    }
    if (conciergeSync?.fingerprint) {
      auth.setKey(`key`, conciergeSync.fingerprint);
    }
    success.set(true);
    loading.set(false);
    return true;
    /* eslint-disable @typescript-eslint/no-explicit-any */
  } catch (e: any) {
    error.set(true);
    success.set(false);
    loading.set(undefined);
    profile.set({
      firstname: undefined,
      contactPersona: undefined,
      email: undefined,
      shortBio: undefined,
    });
    auth.setKey(`unlockedProfile`, undefined);
    auth.setKey(`hasProfile`, undefined);
    console.log(`error`, e);
    return false;
  }
}

export const ProfileUnlock = () => {
  const [submitted, setSubmitted] = useState<boolean | undefined>(undefined);
  const [email, setEmail] = useState(``);
  const [badLogin, setBadLogin] = useState(false);
  const [codeword, setCodeword] = useState(``);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBadLogin(false);
    setSubmitted(true);
    if (codeword && email) {
      const payload = {
        email,
        codeword,
      };
      /* eslint-disable @typescript-eslint/no-explicit-any */
      goUnlockProfile(payload).then((res: any) => {
        if (!res) setBadLogin(true);
      });
    }
  };

  useEffect(() => {
    if (badLogin) {
      setTimeout(() => setBadLogin(false), 7000);
    }
  }, [badLogin]);

  return (
    <>
      <h3 className="font-action text-xl py-6 text-myblue">
        Welcome Back. Unlock your profile &gt;
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 pt-6 px-4">
            <label htmlFor="email" className="block text-sm text-mydarkgrey">
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              defaultValue={email}
              onChange={e => setEmail(e.target.value)}
              className={classNames(
                `text-md bg-white p-3 mt-2 block w-full rounded-md shadow-sm focus:border-myorange focus:ring-myorange`,
                submitted && email === ``
                  ? `border-red-500`
                  : `border-mydarkgrey`
              )}
            />
            {submitted && email === `` && (
              <span className="text-xs px-4 text-red-500">Required field.</span>
            )}
          </div>

          <div className="col-span-3 pt-6 px-4">
            <label htmlFor="codeword" className="block text-sm text-mydarkgrey">
              Enter your secret code word to unlock your account:
            </label>
            <input
              type="password"
              name="codeword"
              id="codeword"
              autoComplete="off"
              defaultValue={codeword}
              onChange={e => setCodeword(e.target.value)}
              className={classNames(
                `text-md bg-white p-3 mt-2 block w-full rounded-md shadow-sm focus:border-myorange focus:ring-myorange`,
                submitted && codeword === ``
                  ? `border-red-500`
                  : `border-mydarkgrey`
              )}
            />
            {submitted && codeword === `` && (
              <span className="text-xs px-4 text-red-500">Required field.</span>
            )}
          </div>
          {badLogin ? (
            <div className="col-span-3 flex justify-center align-center py-12 font-action text-red-500">
              BAD LOGIN
            </div>
          ) : null}

          {codeword !== `` ? (
            <div className="col-span-3 flex justify-center align-center py-12">
              <button
                type="submit"
                className="inline-flex rounded-md bg-myorange/10 hover:bg-black hover:text-white px-3.5 py-1.5 text-base leading-7 text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange"
              >
                <span className="pr-4">Unlock Profile</span>
                <ChevronRightIcon className="h-5 w-5 mr-3" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </form>
    </>
  );
};
