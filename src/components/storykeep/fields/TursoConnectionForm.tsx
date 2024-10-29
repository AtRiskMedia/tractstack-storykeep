import { useState } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { Disclosure } from "@headlessui/react";

const TursoConnectionForm = () => {
  const [credentials, setCredentials] = useState({
    databaseUrl: "",
    authToken: "",
  });

  const handleChange = (field: "databaseUrl" | "authToken", value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Turso Credentials:", credentials);
  };

  const isValid =
    credentials.databaseUrl.trim() !== "" &&
    credentials.authToken.trim() !== "";

  return (
    <div className="border rounded-lg transition-colors border-mylightgrey/20 bg-white">
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-4 text-left hover:bg-mylightgrey/10">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-mydarkgrey">
                  Connect your database
                </span>
              </div>
              <ChevronUpIcon
                className={`${
                  open ? "rotate-180 transform" : ""
                } h-5 w-5 text-mydarkgrey`}
              />
            </Disclosure.Button>

            <Disclosure.Panel className="px-4 pb-4 pt-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-mydarkgrey mb-1">
                    Turso Database URL
                  </label>
                  <input
                    type="text"
                    value={credentials.databaseUrl}
                    onChange={e => handleChange("databaseUrl", e.target.value)}
                    placeholder="libsql://your-database.turso.io"
                    className="w-full rounded-md border-mylightgrey/20 shadow-sm focus:border-myblue focus:ring-myblue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-mydarkgrey mb-1">
                    Turso Auth Token
                  </label>
                  <input
                    type="password"
                    value={credentials.authToken}
                    onChange={e => handleChange("authToken", e.target.value)}
                    placeholder="Enter your Turso auth token"
                    className="w-full rounded-md border-mylightgrey/20 shadow-sm focus:border-myblue focus:ring-myblue"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className={`w-full rounded-md px-4 py-2 text-white ${
                      isValid
                        ? "bg-myorange hover:bg-myblue"
                        : "bg-mydarkgrey/50 cursor-not-allowed"
                    }`}
                  >
                    Connect Database
                  </button>
                </div>

                <p className="text-sm text-mydarkgrey mt-2">
                  Need help? Visit{" "}
                  <a
                    href="https://docs.turso.tech/reference/turso-cli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-myblue hover:text-myorange"
                  >
                    Turso documentation
                  </a>{" "}
                  to learn how to get your credentials.
                </p>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};

export default TursoConnectionForm;
