"use client";

import { useState } from "react";
import {
  Scissors,
  Store,
  Building2,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
} from "lucide-react";
import Rating from "./Rating";

type Role = "tailor" | "vendor" | "employer";

interface WizardData {
  role: Role | null;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  businessName: string;
}

const roles = [
  {
    value: "tailor" as Role,
    label: "Tailor",
    description: "I create and alter clothing",
    icon: Scissors,
    color: "from-orange-400 to-amber-500",
  },
  {
    value: "vendor" as Role,
    label: "Vendor",
    description: "I sell fabrics and accessories",
    icon: Store,
    color: "from-green-400 to-emerald-500",
  },
  {
    value: "employer" as Role,
    label: "Employer",
    description: "I hire tailoring professionals",
    icon: Building2,
    color: "from-blue-400 to-indigo-500",
  },
];

const steps = ["Who are you?", "Add a photo", "Your details", "Publish"];

export default function ProfileSetupWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    role: null,
    avatar: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    businessName: "",
  });

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.role !== null;
      case 2:
        return true;
      case 3:
        return data.name && data.email && data.location;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handlePublish = () => {
    console.log("Publishing profile:", data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-10 px-4">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === step;
          const isComplete = stepNum < step;

          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isComplete
                      ? "bg-orange-500 text-white"
                      : isActive
                      ? "bg-orange-100 text-orange-600 ring-2 ring-orange-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isComplete ? <Check className="w-5 h-5" /> : stepNum}
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden sm:block ${
                    isActive ? "text-orange-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-2 ${
                    stepNum < step ? "bg-orange-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[360px]">
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Who are you?</h2>
            <p className="text-gray-500 mb-8">
              Choose the option that best describes you
            </p>
            <div className="grid gap-4">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setData({ ...data, role: role.value })}
                  className={`flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left ${
                    data.role === role.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center shrink-0`}
                  >
                    <role.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {role.label}
                    </div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                  {data.role === role.value && (
                    <div className="ml-auto">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Photo Upload */}
        {step === 2 && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add a photo</h2>
            <p className="text-gray-500 mb-8 text-center">
              A great photo helps people connect with you
            </p>
            <div className="relative mb-6">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-3xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-orange-300" />
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-colors">
                <Upload className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400 text-center">
              JPG, PNG or GIF. Max size 5MB.
            </p>
            <button
              onClick={() => setData({ ...data, avatar: "/default-avatar.png" })}
              className="mt-6 text-sm text-orange-600 font-medium hover:text-orange-700"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your details</h2>
            <p className="text-gray-500 mb-8">
              Tell us about {data.role === "employer" ? "your company" : "yourself"}
            </p>
            <div className="space-y-5">
              {(data.role === "tailor" || data.role === "vendor") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fashion House Lagos"
                    value={data.businessName}
                    onChange={(e) => setData({ ...data, businessName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Publish */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to publish!</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Your profile is all set. Once published, other users can find and connect with you on D Tailors Marketplace.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-sm mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  {data.role === "tailor" && <Scissors className="w-7 h-7 text-orange-500" />}
                  {data.role === "vendor" && <Store className="w-7 h-7 text-green-500" />}
                  {data.role === "employer" && <Building2 className="w-7 h-7 text-blue-500" />}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">
                    {data.businessName || data.name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{data.role}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handlePublish}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
            >
              Publish Profile
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => setStep(Math.min(4, step + 1))}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {step === 3 ? "Review" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
