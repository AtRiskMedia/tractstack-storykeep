import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ChevronUpIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import TursoConnectionForm from "../fields/TursoConnectionForm";
import DatabaseBootstrap from "../components/DatabaseBootstrap";
import EnvironmentSettings from "../fields/EnvironmentSettings";
import type { ReactNode } from "react";
import type { FullContentMap } from "../../../types";

// Components remain unchanged
const NeedsConcierge = () => (
  <div className="space-y-4">
    <p>
      Set up your Story Keep installation to start building your digital story.
    </p>
    <p>
      Please visit{" "}
      <a
        className="text-myblue font-bold underline hover:text-myorange"
        href="https://tractstack.org"
      >
        our docs
      </a>{" "}
      for install recipies.
    </p>
  </div>
);

const Login = () => (
  <div className="text-xl md:text-2xl">
    Amazing! You are ready to{" "}
    <a
      className="font-bold underline hover:text-myorange"
      href="/storykeep/login?force=true"
    >
      Login-in
    </a>{" "}
    to continue.
  </div>
);

const NeedsContent = () => (
  <div>Create and publish your first piece of content.</div>
);

interface SiteWizardProps {
  hasConcierge: boolean;
  hasTurso: boolean;
  hasTursoReady: boolean;
  hasBranding: boolean;
  hasContent: boolean;
  hasAuth: boolean;
  contentMap: FullContentMap[];
}

type StepStatus = "completed" | "current" | "locked";

interface SetupStep {
  title: string;
  description: ReactNode;
  isComplete: boolean;
  status: StepStatus;
}

export default function SiteWizard({
  hasConcierge,
  hasTurso,
  hasTursoReady,
  hasBranding,
  hasContent,
  hasAuth,
  contentMap,
}: SiteWizardProps) {
  const [gotTurso, setGotTurso] = useState(false);
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({});

  const getStepStatus = (index: number): StepStatus => {
    const completionStates = [
      hasConcierge,
      hasAuth,
      hasTurso || gotTurso,
      hasBranding,
      hasTursoReady,
      hasContent,
    ];
    const isCompleted = completionStates[index];
    const allPreviousCompleted = completionStates
      .slice(0, index)
      .every(state => state);

    if (!allPreviousCompleted) return "locked";
    if (isCompleted) return "completed";
    return "current";
  };

  // Setup steps configuration
  const setupSteps: SetupStep[] = [
    {
      title: "Install the Story Keep",
      description: <NeedsConcierge />,
      isComplete: hasConcierge,
      status: getStepStatus(0),
    },
    {
      title: "Login",
      description: <Login />,
      isComplete: hasAuth,
      status: getStepStatus(1),
    },
    {
      title: "Connect your Turso database",
      description: <TursoConnectionForm setGotTurso={setGotTurso} />,
      isComplete: hasTurso || gotTurso,
      status: getStepStatus(2),
    },
    {
      title: "Make it your own",
      description: (
        <EnvironmentSettings contentMap={contentMap} showOnlyGroup="Brand" />
      ),
      isComplete: hasBranding,
      status: getStepStatus(3),
    },
    {
      title: "Bootstrap your database",
      description: <DatabaseBootstrap />,
      isComplete: hasTursoReady,
      status: getStepStatus(4),
    },
    {
      title: "Publish your first page!",
      description: <NeedsContent />,
      isComplete: hasContent,
      status: getStepStatus(5),
    },
  ];

  // Effect to manage step visibility
  useEffect(() => {
    const completionStates = [
      hasConcierge,
      hasAuth,
      hasTurso || gotTurso,
      hasBranding,
      hasTursoReady,
      hasContent,
    ];

    const newOpenSteps: Record<number, boolean> = {};
    let foundCurrent = false;

    completionStates.forEach((isComplete, index) => {
      if (!isComplete && !foundCurrent) {
        newOpenSteps[index] = true;
        foundCurrent = true;
      } else {
        newOpenSteps[index] = false;
      }
    });

    setOpenSteps(newOpenSteps);
  }, [
    hasConcierge,
    hasAuth,
    hasTurso,
    gotTurso,
    hasBranding,
    hasTursoReady,
    hasContent,
  ]);

  const getStepIcon = (step: SetupStep): ReactNode => {
    if (step.status === "locked") {
      return <LockClosedIcon className="h-6 w-6 text-mydarkgrey/30" />;
    }
    if (step.isComplete) {
      return <CheckCircleIcon className="h-6 w-6 text-mygreen" />;
    }
    return <XCircleIcon className="h-6 w-6 text-myorange" />;
  };

  const toggleStep = (index: number) => {
    setOpenSteps(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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
              Hello world!
            </h2>
          </div>

          <div className="flex flex-col space-y-4">
            {setupSteps.map((step, index) => (
              <div
                key={index}
                className={`border rounded-lg transition-colors ${
                  step.status === "locked"
                    ? "border-mylightgrey/10 bg-mylightgrey/5"
                    : "border-mylightgrey/20 bg-white"
                }`}
              >
                <button
                  className={`flex w-full justify-between rounded-lg px-4 py-4 text-left ${
                    step.status === "locked"
                      ? "cursor-not-allowed"
                      : "hover:bg-mylightgrey/10"
                  }`}
                  disabled={step.status === "locked"}
                  onClick={() => toggleStep(index)}
                >
                  <div className="flex items-center space-x-3">
                    {getStepIcon(step)}
                    <span
                      className={`text-lg font-bold ${
                        step.status === "locked"
                          ? "text-mydarkgrey/30"
                          : "text-mydarkgrey"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <ChevronUpIcon
                    className={`${
                      openSteps[index] ? "rotate-180 transform" : ""
                    } h-5 w-5 ${
                      step.status === "locked"
                        ? "text-mydarkgrey/30"
                        : "text-mydarkgrey"
                    }`}
                  />
                </button>
                {openSteps[index] && (
                  <div className="px-4 pb-4 pt-2">
                    <div
                      className={`${
                        step.status === "locked"
                          ? "text-mydarkgrey/30"
                          : "text-mydarkgrey"
                      }`}
                    >
                      {step.description}
                      {step.status === "locked" && (
                        <p className="mt-2 text-sm italic">
                          Complete the previous steps to unlock this step.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
