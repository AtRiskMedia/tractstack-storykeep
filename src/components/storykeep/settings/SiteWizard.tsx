import { Disclosure } from "@headlessui/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

interface SiteWizardProps {
  hasConcierge: boolean;
  hasTurso: boolean;
  hasBranding: boolean;
  hasContent: boolean;
}

export default function SiteWizard({
  hasConcierge,
  hasTurso,
  hasBranding,
  hasContent,
}: SiteWizardProps) {
  const setupSteps = [
    {
      title: "Install the Story Keep",
      isComplete: hasConcierge,
      defaultOpen: !hasConcierge,
    },
    {
      title: "Connect your database",
      isComplete: hasTurso,
      defaultOpen: !hasTurso,
    },
    {
      title: "Make it your own",
      isComplete: hasBranding,
      defaultOpen: !hasBranding,
    },
    {
      title: "Publish your first page!",
      isComplete: hasContent,
      defaultOpen: !hasContent,
    },
  ];

  return (
    <div
      className="outline-2 outline-dashed outline-myblue/10 outline-offset-[-2px] my-4 bg-myblue/20 py-4"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)",
      }}
    >
      <div className="rounded-lg px-3.5 py-6 shadow-inner bg-white mx-4">
        <div className="flex flex-col space-y-8">
          <div className="relative">
            <h2 className="inline-block font-action text-myblue text-2xl md:text-3xl">
              Welcome to your Story Keep
            </h2>
          </div>

          <div className="flex flex-col space-y-4">
            {setupSteps.map((step, index) => (
              <Disclosure key={index} defaultOpen={step.defaultOpen}>
                {({ open }) => (
                  <div className="border border-mylightgrey/20 rounded-lg">
                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-white px-4 py-4 text-left hover:bg-mylightgrey/10">
                      <div className="flex items-center space-x-3">
                        {step.isComplete ? (
                          <CheckCircleIcon className="h-6 w-6 text-mygreen" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-myorange" />
                        )}
                        <span className="text-lg font-bold text-mydarkgrey">
                          {step.title}
                        </span>
                      </div>
                      <ChevronUpIcon
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } h-5 w-5 text-mydarkgrey`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pb-4 pt-2">
                      <div className="text-mydarkgrey">
                        {/* Content placeholder - will be added in next phase */}
                        <p>Configuration steps will be added here...</p>
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
