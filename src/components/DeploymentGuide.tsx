import React, { useState } from 'react';
import { CheckCircle2, Circle, ExternalLink, ShieldAlert, Sparkles, Terminal, Copy, ArrowRight, HelpCircle } from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const steps = [
    {
      num: 1,
      title: 'Create a Google Sheet & Open Apps Script',
      description: 'Open a new or existing Google Sheet. From the top menu bar, click Extensions > Apps Script.',
      details: [
        'Go to Google Sheets (sheets.new) and name your spreadsheet "Feedback Master Database".',
        'In the menu bar, click "Extensions" -> "Apps Script". A new tab will open with the Google Apps Script code editor.',
      ],
    },
    {
      num: 2,
      title: 'Paste Backend Code into Code.gs',
      description: 'Delete any existing code in Code.gs and replace it with the generated Code.gs snippet.',
      details: [
        'In the left sidebar of the Apps Script editor, click on "Code.gs".',
        'Select all existing text and paste the generated Code.gs script.',
        'Click the floppy disk icon (Save project) or press Ctrl+S / Cmd+S.',
      ],
    },
    {
      num: 3,
      title: 'Create Index.html File in Editor',
      description: 'Add an HTML file named Index in the Apps Script project sidebar.',
      details: [
        'In the Apps Script left panel, click the "+" icon next to Files.',
        'Select "HTML" and name the file exactly "Index" (without the .html extension).',
        'Paste the generated Index.html code into this file and save.',
      ],
    },
    {
      num: 4,
      title: 'Run setupSheet() to Initialize Headers',
      description: 'Execute setupSheet() once from the editor to generate sheet headers automatically.',
      details: [
        'At the top toolbar in Apps Script, select "setupSheet" from the function dropdown.',
        'Click "Run". Apps Script will request permissions on first run.',
        'Grant permissions ("Review permissions" -> select Google account -> "Advanced" -> "Go to Feedback Tracker (unsafe)" -> "Allow").',
        'Verify your Google Sheet now has headers: ID, Date, Area, Type, Feedback Detail, Action Taken, Status.',
      ],
    },
    {
      num: 5,
      title: 'Deploy as Web App',
      description: 'Publish your script as a standalone Web App accessible by your team.',
      details: [
        'In the top right, click Deploy -> New deployment.',
        'Click the gear icon next to "Select type" and choose "Web app".',
        'Description: "Feedback Tracker Web App v1"',
        'Execute as: "Me (your email address)" [CRITICAL]',
        'Who has access: "Anyone" (or "Anyone within your organization")',
        'Click "Deploy".',
      ],
    },
    {
      num: 6,
      title: 'Authorize & Copy Your Web App URL',
      description: 'Copy the generated Web App URL and share it with your team or test it directly in the browser.',
      details: [
        'Click "Authorize access" when prompted and approve permissions.',
        'Copy the "Web app URL" (ends in /exec).',
        'Open the URL in your browser or paste it into the Connect field in this demo app to run live backend tests!',
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-md border border-blue-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg">
            <Terminal className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Step-by-Step Google Apps Script Deployment Guide</h2>
        </div>
        <p className="text-xs text-blue-200 leading-relaxed max-w-2xl">
          Follow these 6 simple steps to turn your Google Sheet into a full production feedback management Web App.
          Mark steps complete as you go!
        </p>
      </div>

      {/* Step Checklist Card */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isDone = Boolean(completedSteps[step.num]);
          return (
            <div
              key={step.num}
              className={`bg-white rounded-xl border p-5 transition shadow-sm ${
                isDone ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleStep(step.num)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono text-xs font-bold rounded">
                      Step {step.num}
                    </span>
                    <h3 className={`text-sm font-bold ${isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 font-medium">{step.description}</p>

                  <ul className="mt-3 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Important Security & Permissions Callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Crucial Apps Script Permissions & Updates Note</span>
        </div>
        <p>
          1. <strong>"Execute as me" requirement:</strong> Ensure you choose "Execute as: Me" when deploying. This grants the web app permission to write to your Google Sheet on behalf of uploading users without requiring every team member to authorise code.
        </p>
        <p>
          2. <strong>Redeploying changes:</strong> Whenever you modify <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">Code.gs</code> or <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">Index.html</code> in Apps Script, you MUST click <strong>Deploy &gt; Manage deployments &gt; Pencil icon (Edit) &gt; Version: New Version &gt; Deploy</strong> for changes to take effect on the live URL.
        </p>
      </div>
    </div>
  );
};
