import { useEffect, useState, Fragment } from "react";
import type { FormEvent } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useStore } from "@nanostores/react";
import { classNames } from "../../utils/helpers";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  ArrowPathRoundedSquareIcon,
  BellSlashIcon,
  BoltIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/outline";
import {
  newProfile,
  sync,
  auth,
  profile,
  error,
  success,
  loading,
} from "../../store/auth";
import { loadProfile, saveProfile } from "../../api/services";
import { contactPersona } from "../../assets/contactPersona";
import type { ContactPersona } from "../../types";

async function goSaveProfile(payload: {
  firstname: string;
  email: string;
  codeword: string;
  persona: string;
  bio: string;
  init: boolean;
}) {
  try {
    const response = await saveProfile({ profile: payload });
    profile.set({
      firstname: payload.firstname,
      contactPersona: payload.persona,
      email: payload.email,
      shortBio: payload.bio,
    });
    if (response?.data?.knownLead) {
      auth.setKey(`hasProfile`, `1`);
      auth.setKey(`consent`, `1`);
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

async function goLoadProfile() {
  try {
    const response = await loadProfile();
    profile.set({
      firstname: response?.data?.firstname || undefined,
      contactPersona: response?.data?.contactPersona || undefined,
      email: response?.data?.email || undefined,
      shortBio: response?.data?.shortBio || undefined,
    });
    if (response?.data?.knownLead) {
      auth.setKey(`hasProfile`, `1`);
      auth.setKey(`consent`, `1`);
    }
    if (typeof response?.data?.auth !== `undefined` && response.data.auth)
      auth.setKey(`unlockedProfile`, `1`);
    success.set(true);
    loading.set(false);
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
  }
}

export const ProfileEdit = () => {
  const [submitted, setSubmitted] = useState<boolean | undefined>(undefined);
  const [email, setEmail] = useState(``);
  const [firstname, setFirstname] = useState(``);
  const [bio, setBio] = useState(``);
  const [codeword, setCodeword] = useState(``);
  const [saved, setSaved] = useState(false);
  const [personaSelected, setPersonaSelected] = useState<ContactPersona>(
    contactPersona[0]
  );
  const $authPayload = useStore(auth);
  const $profile = useStore(profile);
  const $error = useStore(error);
  const $loading = useStore(loading);
  const $success = useStore(success);
  const $sync = useStore(sync);

  const Icon =
    personaSelected.title === `DMs open`
      ? ChatBubbleBottomCenterIcon
      : personaSelected.title === `Major Updates Only`
        ? ArrowPathRoundedSquareIcon
        : personaSelected.title === `All Updates`
          ? BoltIcon
          : BellSlashIcon;
  const iconClass =
    personaSelected.title === `DMs open`
      ? `text-black`
      : personaSelected.title === `Major Updates Only`
        ? `text-mydarkgrey`
        : personaSelected.title === `All Updates`
          ? `text-myorange`
          : `text-mydarkgrey`;
  const barClass =
    personaSelected.title === `DMs open`
      ? `bg-mygreen/80`
      : personaSelected.title === `All Updates`
        ? `bg-myorange/80`
        : personaSelected.title === `Major Updates Only`
          ? `bg-myorange/50`
          : `bg-mydarkgrey/5`;
  const barWidth =
    personaSelected.title === `DMs open`
      ? `100%`
      : personaSelected.title === `All Updates`
        ? `100%`
        : personaSelected.title === `Major Updates Only`
          ? `50%`
          : `2%`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (firstname && codeword && email && bio && personaSelected.id) {
      const payload = {
        firstname,
        email,
        codeword,
        bio,
        persona: personaSelected.id,
        init: false,
      };
      goSaveProfile(payload).then((res: any) => {
        if (res) setSaved(true);
      });
    }
  };

  useEffect(() => {
    // triggers "saved" alert if coming from ProfileCreate
    if (newProfile.get()) {
      newProfile.set(false);
      setSaved(true);
    }
  }, []);

  useEffect(() => {
    if (saved) {
      setTimeout(() => setSaved(false), 7000);
    }
  }, [saved]);

  useEffect(() => {
    // on init, load profile from concierge
    if (
      $sync &&
      typeof $success == `undefined` &&
      typeof $error === `undefined` &&
      typeof $loading === `undefined` &&
      typeof submitted === `undefined` &&
      import.meta.env.PROD &&
      $authPayload?.token
    ) {
      const checkProfile = profile.get();
      if (
        !checkProfile.firstname ||
        !checkProfile.contactPersona ||
        !checkProfile.email
      ) {
        error.set(false);
        loading.set(true);
        goLoadProfile();
      } else {
        error.set(false);
        loading.set(false);
        success.set(true);
      }
    } else if (
      $sync &&
      typeof $success == `boolean` &&
      $success &&
      typeof $error === `boolean` &&
      !$error &&
      typeof $loading === `boolean` &&
      !$loading &&
      typeof submitted === `undefined` &&
      import.meta.env.PROD
    ) {
      setSubmitted(false);
      const val = profile.get();
      if (val.firstname) setFirstname(val.firstname);
      if (val.email) setEmail(val.email);
      if (val.shortBio) setBio(val.shortBio);
      const pref = contactPersona
        .filter(p => p.id === val.contactPersona)
        .at(0)!;
      if (pref) setPersonaSelected(pref);
      error.set(undefined);
      success.set(true);
      loading.set(undefined);
    } else if (
      typeof submitted === `undefined` &&
      $error &&
      typeof $loading === `undefined` &&
      !$success
    ) {
      error.set(undefined);
      success.set(undefined);
      if (!$sync) window.location.reload();
    }
  }, [$sync, $success, $authPayload?.token, $error, submitted, $loading]);

  if (typeof submitted === `undefined`) return <div />;
  return (
    <>
      <h3 className="font-action text-xl py-6 text-myblue">
        Welcome to Tract Stack
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-4">
          {!personaSelected?.disabled ? (
            <>
              <div className="col-span-3 md:col-span-1 pt-6 px-4">
                <label
                  htmlFor="firstname"
                  className="block text-sm text-mydarkgrey"
                >
                  First name
                </label>
                <input
                  type="text"
                  name="firstname"
                  id="firstname"
                  autoComplete="given-name"
                  defaultValue={$profile.firstname || ``}
                  onChange={e => setFirstname(e.target.value)}
                  className={classNames(
                    `text-md bg-white p-3 mt-2 block w-full rounded-md shadow-sm focus:border-myorange focus:ring-myorange`,
                    submitted && firstname === ``
                      ? `border-red-500`
                      : `border-mydarkgrey`
                  )}
                />
                {submitted && firstname === `` && (
                  <span className="text-xs px-4 text-red-500">
                    Required field.
                  </span>
                )}
              </div>

              <div className="col-span-3 md:col-span-2 pt-6 px-4">
                <label
                  htmlFor="email"
                  className="block text-sm text-mydarkgrey"
                >
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  defaultValue={$profile.email || ``}
                  onChange={e => setEmail(e.target.value)}
                  className={classNames(
                    `text-md bg-white p-3 mt-2 block w-full rounded-md shadow-sm focus:border-myorange focus:ring-myorange`,
                    submitted && email === ``
                      ? `border-red-500`
                      : `border-mydarkgrey`
                  )}
                />
                {submitted && email === `` && (
                  <span className="text-xs px-4 text-red-500">
                    Required field.
                  </span>
                )}
              </div>
            </>
          ) : null}

          <div className="col-span-3 pt-6 px-4">
            <div className="flex items-center text-sm">
              <div className="pr-8 text-sm text-black">
                <Listbox value={personaSelected} onChange={setPersonaSelected}>
                  {({ open }) => (
                    <>
                      <Listbox.Label className="block text-sm text-mydarkgrey mb-2">
                        Choose your level of consent:
                      </Listbox.Label>

                      <div className="relative mt-2">
                        <Listbox.Button className="text-md relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-black shadow-sm ring-1 ring-inset ring-myorange focus:outline-none focus:ring-2 focus:ring-myorange leading-6">
                          <span className="block truncate p-2">
                            {personaSelected.title}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDownIcon
                              className="h-5 w-5 text-mydarkgrey"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-2 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {contactPersona.map(option => (
                              <Listbox.Option
                                key={option.id}
                                className={({ active }) =>
                                  classNames(
                                    active
                                      ? `text-black bg-slate-100`
                                      : `text-black`,
                                    `cursor-default select-none p-2 text-sm`
                                  )
                                }
                                value={option}
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={classNames(
                                        selected ? `underline` : ``,
                                        `block truncate`
                                      )}
                                    >
                                      {option.title}
                                    </span>
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </>
                  )}
                </Listbox>
              </div>
              <div className="flex flex-1 items-center">
                <div
                  aria-hidden="true"
                  className="ml-1 flex flex-1 items-center"
                >
                  <Icon
                    className={classNames(iconClass, `flex-shrink-0 h-5 w-5`)}
                    aria-hidden="true"
                  />
                  <div className="relative ml-3 flex-1">
                    <div className="h-7 rounded-full border border-mydarkgrey/20" />
                    <div
                      className={classNames(
                        `absolute inset-y-0 rounded-full border-mydarkgrey/20`,
                        barClass
                      )}
                      style={{ width: barWidth }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-right text-mydarkgrey">
              {personaSelected.description}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-3 pt-6 px-4">
            <label htmlFor="bio" className="block text-sm text-mydarkgrey">
              Hello {firstname}. Is there anything else you would like to share?
            </label>
            <div className="mt-2">
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={280}
                className="text-md bg-white p-3 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myorange focus:ring-myorange"
                placeholder="Your one-liner bio"
                defaultValue={$profile.shortBio || ``}
                onChange={e => setBio(e.target.value)}
              />
            </div>
          </div>

          <div className="col-span-1 pt-6 px-4">
            <label htmlFor="codeword" className="block text-sm text-mydarkgrey">
              Re-Enter your secret code word to allow save any changes:
            </label>
            <input
              type="password"
              name="codeword"
              id="codeword"
              autoComplete="off"
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

          {saved ? (
            <div className="col-span-3 flex justify-center align-center py-12 font-action text-red-500">
              Profile Saved
            </div>
          ) : null}

          {codeword !== `` ? (
            <div className="col-span-3 flex justify-center align-center py-12">
              {!personaSelected?.disabled ? (
                <button
                  type="submit"
                  className="inline-flex rounded-md bg-myorange/10 hover:bg-black hover:text-white px-3.5 py-1.5 text-base leading-7 text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange"
                >
                  <span className="pr-4">Save Profile</span>
                  <ChevronRightIcon
                    className="h-5 w-5 mr-3"
                    aria-hidden="true"
                  />
                </button>
              ) : (
                `Profile disabled. (Privacy mode enabled)`
              )}
            </div>
          ) : null}
        </div>
      </form>
    </>
  );
};
