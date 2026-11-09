"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiDatabase,
  FiGlobe,
  FiLoader,
  FiShield,
  FiSettings,
} from "react-icons/fi";

const steps = [
  { title: "Welcome", icon: FiGlobe },
  { title: "Database", icon: FiDatabase },
  { title: "Forum details", icon: FiSettings },
  { title: "Administrator", icon: FiShield },
  { title: "Review", icon: FiCheck },
];

type SetupValues = {
  databaseType: "postgresql" | "mysql";
  databaseHost: string;
  databasePort: string;
  databaseName: string;
  databaseUser: string;
  databasePassword: string;
  tablePrefix: string;
  forumName: string;
  forumUrl: string;
  contactEmail: string;
  timezone: string;
  adminUsername: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  autoMigrate: boolean;
};

const initialValues: SetupValues = {
  databaseType: "postgresql",
  databaseHost: "localhost",
  databasePort: "5432",
  databaseName: "",
  databaseUser: "",
  databasePassword: "",
  tablePrefix: "forum_",
  forumName: "",
  forumUrl: "",
  contactEmail: "",
  timezone: "UTC",
  adminUsername: "",
  adminEmail: "",
  adminPassword: "",
  confirmPassword: "",
  autoMigrate: false,
};

type ConnectionStatus = "idle" | "testing" | "connected" | "failed";
type MigrationStatus = "idle" | "running" | "complete" | "failed";

type MigrationEvent =
  | { type: "start"; completed: string[]; pending: string[] }
  | { type: "migration-complete"; name: string }
  | { type: "complete"; batch: number; completed: string[] }
  | { type: "error"; message: string };

type MigrationSnapshot = {
  currentVersion: string;
  completed: string[];
  pending: string[];
};

function parseMigrationEvent(value: unknown): MigrationEvent | null {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return null;
  }

  if (
    value.type === "start" &&
    "completed" in value &&
    Array.isArray(value.completed) &&
    value.completed.every((name) => typeof name === "string") &&
    "pending" in value &&
    Array.isArray(value.pending) &&
    value.pending.every((name) => typeof name === "string")
  ) {
    return {
      type: "start",
      completed: value.completed,
      pending: value.pending,
    };
  }

  if (
    value.type === "migration-complete" &&
    "name" in value &&
    typeof value.name === "string"
  ) {
    return { type: "migration-complete", name: value.name };
  }

  if (
    value.type === "complete" &&
    "batch" in value &&
    typeof value.batch === "number" &&
    "completed" in value &&
    Array.isArray(value.completed) &&
    value.completed.every((name) => typeof name === "string")
  ) {
    return {
      type: "complete",
      batch: value.batch,
      completed: value.completed,
    };
  }

  if (
    value.type === "error" &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return { type: "error", message: value.message };
  }

  return null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const inputClassName =
  "mt-1 block w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#327db4] focus:ring-2 focus:ring-[#327db4]/10";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] leading-4 text-slate-400">{hint}</p>}
    </div>
  );
}

export default function InitWizard({
  setupTokenRequired,
}: {
  setupTokenRequired: boolean;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [connectionError, setConnectionError] = useState("");
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>("idle");
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [completedMigrations, setCompletedMigrations] = useState<string[]>([]);
  const [pendingMigrations, setPendingMigrations] = useState<string[]>([]);
  const [migrationError, setMigrationError] = useState("");
  const databaseBusy =
    connectionStatus === "testing" || migrationStatus === "running";

  function update<K extends keyof SetupValues>(key: K, value: SetupValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
    if (
      key === "databaseType" ||
      key === "databaseHost" ||
      key === "databasePort" ||
      key === "databaseName" ||
      key === "databaseUser" ||
      key === "databasePassword" ||
      key === "tablePrefix"
    ) {
      setConnectionStatus("idle");
      setConnectionError("");
      setMigrationStatus("idle");
      setMigrationProgress(0);
      setCompletedMigrations([]);
      setPendingMigrations([]);
      setMigrationError("");
    }
  }

  function databasePayload() {
    return {
      database: {
        type: values.databaseType,
        host: values.databaseHost,
        port: Number(values.databasePort),
        database: values.databaseName,
        username: values.databaseUser,
        password: values.databasePassword,
      },
    };
  }

  function requestHeaders() {
    return {
      "Content-Type": "application/json",
      ...(setupToken ? { "X-Forum-Setup-Token": setupToken } : {}),
    };
  }

  function validateCurrentStep() {
    if (step === 1) {
      if (!values.databaseHost.trim() || !values.databaseName.trim() || !values.databaseUser.trim()) {
        return "Enter the database host, name, and username to continue.";
      }
      if (!/^\d+$/.test(values.databasePort) || Number(values.databasePort) < 1 || Number(values.databasePort) > 65535) {
        return "Enter a valid database port (1–65535).";
      }
      if (values.tablePrefix && !/^[a-zA-Z0-9_]+$/.test(values.tablePrefix)) {
        return "The table prefix can contain only letters, numbers, and underscores.";
      }
      if (connectionStatus !== "connected") {
        return "Test the database connection before continuing.";
      }
      if (migrationStatus !== "complete") {
        return "Run the migrations before continuing.";
      }
    }

    if (step === 2) {
      if (!values.forumName.trim() || !values.forumUrl.trim() || !values.contactEmail.trim()) {
        return "Complete the forum name, URL, and contact email to continue.";
      }
      if (!isValidEmail(values.contactEmail)) {
        return "Enter a valid contact email address.";
      }
      try {
        const url = new URL(values.forumUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          return "The forum URL must start with http:// or https://.";
        }
      } catch {
        return "Enter a valid forum URL, including http:// or https://.";
      }
    }

    if (step === 3) {
      if (!values.adminUsername.trim() || !values.adminEmail.trim() || !values.adminPassword) {
        return "Complete the administrator username, email, and password to continue.";
      }
      if (!isValidEmail(values.adminEmail)) {
        return "Enter a valid administrator email address.";
      }
      if (values.adminPassword.length < 8) {
        return "Choose an administrator password with at least 8 characters.";
      }
      if (values.adminPassword !== values.confirmPassword) {
        return "The administrator passwords do not match.";
      }
    }

    return "";
  }

  function goNext() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function testConnection() {
    const invalidDatabaseSettings =
      !values.databaseHost.trim() ||
      !values.databaseName.trim() ||
      !values.databaseUser.trim() ||
      !/^\d+$/.test(values.databasePort) ||
      Number(values.databasePort) < 1 ||
      Number(values.databasePort) > 65535;

    if (invalidDatabaseSettings) {
      setError("Enter valid database connection details before testing.");
      return;
    }

    setError("");
    setConnectionError("");
    setConnectionStatus("testing");
    setMigrationStatus("idle");
    setCompletedMigrations([]);
    setPendingMigrations([]);
    setMigrationProgress(0);
    setMigrationError("");

    let connectionTestSucceeded = false;
    try {
      const response = await fetch("/api/init/test-connection", {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(databasePayload()),
      });

      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Database connection test failed.";
        throw new Error(message);
      }

      setConnectionStatus("connected");
      connectionTestSucceeded = true;
      const migrationResponse = await fetch("/api/init/migrations/status", {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(databasePayload()),
      });
      const migrationResult: unknown = await migrationResponse.json();
      if (!migrationResponse.ok) {
        const message =
          typeof migrationResult === "object" &&
          migrationResult !== null &&
          "error" in migrationResult &&
          typeof migrationResult.error === "string"
            ? migrationResult.error
            : "Could not read the migration status.";
        throw new Error(message);
      }

      if (
        typeof migrationResult !== "object" ||
        migrationResult === null ||
        !("completed" in migrationResult) ||
        !Array.isArray(migrationResult.completed) ||
        !migrationResult.completed.every((name) => typeof name === "string") ||
        !("pending" in migrationResult) ||
        !Array.isArray(migrationResult.pending) ||
        !migrationResult.pending.every((name) => typeof name === "string")
      ) {
        throw new Error("The server returned an invalid migration status.");
      }

      const snapshot = migrationResult as MigrationSnapshot;
      setCompletedMigrations(snapshot.completed);
      setPendingMigrations(snapshot.pending);
      const total = snapshot.completed.length + snapshot.pending.length;
      setMigrationProgress(
        total === 0 ? 100 : Math.round((snapshot.completed.length / total) * 100),
      );
      setMigrationStatus(snapshot.pending.length === 0 ? "complete" : "idle");
    } catch (connectionFailure) {
      const message =
        connectionFailure instanceof Error
          ? connectionFailure.message
          : "Database connection test failed. Try again.";
      if (!connectionTestSucceeded) {
        setConnectionStatus("failed");
        setConnectionError(message);
      } else {
        setMigrationStatus("failed");
        setMigrationError(message);
      }
    }
  }

  async function runMigrations() {
    if (connectionStatus !== "connected" || migrationStatus === "running") return;

    setError("");
    setMigrationError("");
    setMigrationStatus("running");
    try {
      const response = await fetch("/api/init/migrations/run", {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(databasePayload()),
      });

      if (!response.ok) {
        const result: unknown = await response.json();
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not start database migrations.";
        throw new Error(message);
      }
      if (!response.body) {
        throw new Error("The migration response did not contain a progress stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedCompletion = false;
      let receivedError = false;
      let completedCount = completedMigrations.length;
      let totalCount = completedMigrations.length + pendingMigrations.length;

      const handleEvent = (event: MigrationEvent) => {
        if (event.type === "start") {
          completedCount = event.completed.length;
          totalCount = event.completed.length + event.pending.length;
          setCompletedMigrations(event.completed);
          setPendingMigrations(event.pending);
          setMigrationProgress(
            totalCount === 0
              ? 100
              : Math.round((completedCount / totalCount) * 100),
          );
        } else if (event.type === "migration-complete") {
          completedCount += 1;
          setCompletedMigrations((current) =>
            current.includes(event.name) ? current : [...current, event.name],
          );
          setPendingMigrations((current) => current.filter((name) => name !== event.name));
          setMigrationProgress(
            totalCount === 0
              ? 100
              : Math.min(
                  100,
                  Math.round((completedCount / totalCount) * 100),
                ),
          );
        } else if (event.type === "complete") {
          receivedCompletion = true;
          setCompletedMigrations(event.completed);
          setPendingMigrations([]);
          setMigrationProgress(100);
          setMigrationStatus("complete");
        } else {
          receivedError = true;
          setMigrationError(event.message);
          setMigrationStatus("failed");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";

        for (const message of messages) {
          const dataLine = message.split("\n").find((line) => line.startsWith("data: "));
          if (!dataLine) continue;

          let event: unknown;
          try {
            event = JSON.parse(dataLine.slice(6));
          } catch {
            throw new Error("The migration server sent invalid progress data.");
          }
          const parsedEvent = parseMigrationEvent(event);
          if (!parsedEvent) {
            throw new Error("The migration server sent invalid progress data.");
          }
          handleEvent(parsedEvent);
        }

        if (done) break;
      }

      if (!receivedCompletion && !receivedError) {
        throw new Error("The migration process ended before reporting completion.");
      }
    } catch (migrationFailure) {
      setMigrationStatus("failed");
      setMigrationError(
        migrationFailure instanceof Error
          ? migrationFailure.message
          : "Database migrations failed.",
      );
    }
  }

  function goBack() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  function submitSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-8 text-slate-700 sm:py-12">
      <div className="mx-auto max-w-[920px]">
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <nav aria-label="Installation progress" className="border-b border-slate-200 bg-slate-50">
            <ol className="grid grid-cols-2 sm:grid-cols-5">
              {steps.map(({ title, icon: Icon }, index) => {
                const isCurrent = index === step;
                const isComplete = index < step;

                return (
                  <li
                    key={title}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex min-h-14 items-center gap-2 border-b-2 px-3 py-2.5 text-xs sm:justify-center ${
                      isCurrent
                        ? "border-b-[#327db4] bg-white font-medium text-[#327db4]"
                        : isComplete
                          ? "border-b-transparent text-slate-600"
                          : "border-b-transparent text-slate-400"
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                        isCurrent
                          ? "border-[#327db4] bg-[#327db4] text-white"
                          : isComplete
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                      }`}
                    >
                      {isComplete ? (
                        <FiCheck className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Icon className="size-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <span>{title}</span>
                  </li>
                );
              })}
            </ol>
          </nav>

          <form onSubmit={submitSetup}>
            <div className="min-h-[390px] px-5 py-6 sm:px-8">
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Welcome</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Configure your database, forum, and administrator account.
                  </p>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Database connection</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the connection settings for the database this forum will use.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {setupTokenRequired && (
                      <div className="sm:col-span-2">
                        <Field
                          label="Setup access token"
                          htmlFor="setupToken"
                          hint="Enter the token configured by the server administrator."
                        >
                          <input
                            id="setupToken"
                            type="password"
                            autoComplete="off"
                            required
                            value={setupToken}
                            onChange={(event) => {
                              setSetupToken(event.target.value);
                              setConnectionStatus("idle");
                              setConnectionError("");
                              setMigrationStatus("idle");
                              setMigrationError("");
                              setCompletedMigrations([]);
                              setPendingMigrations([]);
                              setMigrationProgress(0);
                            }}
                            disabled={databaseBusy}
                            className={inputClassName}
                          />
                        </Field>
                      </div>
                    )}
                    <Field label="Database type" htmlFor="databaseType">
                      <select
                        id="databaseType"
                        value={values.databaseType}
                        onChange={(event) => {
                          const type = event.target.value as SetupValues["databaseType"];
                          update("databaseType", type);
                          update("databasePort", type === "postgresql" ? "5432" : "3306");
                        }}
                        disabled={databaseBusy}
                        className={inputClassName}
                      >
                        <option value="postgresql">PostgreSQL</option>
                        <option value="mysql">MySQL / MariaDB</option>
                      </select>
                    </Field>
                    <Field label="Host" htmlFor="databaseHost">
                      <input
                        id="databaseHost"
                        autoComplete="off"
                        required
                        value={values.databaseHost}
                        onChange={(event) => update("databaseHost", event.target.value)}
                        disabled={databaseBusy}
                        className={inputClassName}
                        placeholder="localhost"
                      />
                    </Field>
                    <Field label="Port" htmlFor="databasePort">
                      <input
                        id="databasePort"
                        inputMode="numeric"
                        required
                        value={values.databasePort}
                        onChange={(event) => update("databasePort", event.target.value)}
                        disabled={databaseBusy}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Database name" htmlFor="databaseName">
                      <input
                        id="databaseName"
                        autoComplete="off"
                        required
                        value={values.databaseName}
                        onChange={(event) => update("databaseName", event.target.value)}
                        disabled={databaseBusy}
                        className={inputClassName}
                        placeholder="forum"
                      />
                    </Field>
                    <Field label="Database username" htmlFor="databaseUser">
                      <input
                        id="databaseUser"
                        autoComplete="off"
                        required
                        value={values.databaseUser}
                        onChange={(event) => update("databaseUser", event.target.value)}
                        disabled={databaseBusy}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Database password" htmlFor="databasePassword">
                      <input
                        id="databasePassword"
                        type="password"
                        autoComplete="new-password"
                        value={values.databasePassword}
                        onChange={(event) => update("databasePassword", event.target.value)}
                        disabled={databaseBusy}
                        className={inputClassName}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field
                        label="Table prefix"
                        htmlFor="tablePrefix"
                        hint="Use a short prefix if this database is shared with another application."
                      >
                        <input
                          id="tablePrefix"
                          value={values.tablePrefix}
                          onChange={(event) => update("tablePrefix", event.target.value)}
                          disabled={databaseBusy}
                          className={inputClassName}
                        />
                      </Field>
                    </div>
                  </div>

                  <section className="mt-6 border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                      <h3 className="text-xs font-medium text-slate-600">Database setup</h3>
                    </div>

                    <div className="space-y-4 p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-700">Connection test</p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {connectionStatus === "connected"
                              ? "Connection successful"
                              : connectionStatus === "testing"
                                ? "Connecting to database..."
                                : connectionStatus === "failed"
                                  ? "Connection failed"
                                : "Check the database settings"}
                          </p>
                          {connectionError && (
                            <p className="mt-1 max-w-xl text-[11px] leading-4 text-red-700" role="alert">
                              {connectionError}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={connectionStatus === "testing"}
                          onClick={testConnection}
                          className="inline-flex shrink-0 items-center justify-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
                        >
                          {connectionStatus === "testing" ? (
                            <FiLoader className="size-3.5 animate-spin" aria-hidden="true" />
                          ) : connectionStatus === "connected" ? (
                            <FiCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
                          ) : (
                            <FiDatabase className="size-3.5" aria-hidden="true" />
                          )}
                          {connectionStatus === "testing"
                            ? "Testing..."
                            : connectionStatus === "connected"
                              ? "Test again"
                              : "Test connection"}
                        </button>
                      </div>

                      {connectionStatus === "testing" && (
                        <div
                          aria-label="Connection test progress"
                          className="h-1.5 overflow-hidden bg-slate-100"
                          role="progressbar"
                        >
                          <div
                            className="h-full w-1/3 animate-pulse bg-[#327db4]"
                          />
                        </div>
                      )}

                      <div className="border-t border-slate-200 pt-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-700">Database migrations</p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {migrationStatus === "complete"
                                  ? `${completedMigrations.length} migrations complete`
                                : migrationStatus === "running"
                                    ? `Completed ${completedMigrations.length} of ${completedMigrations.length + pendingMigrations.length}`
                                    : migrationStatus === "failed"
                                      ? "Migration failed"
                                      : pendingMigrations.length > 0
                                        ? `${pendingMigrations.length} pending`
                                        : connectionStatus === "connected"
                                          ? "Database is up to date"
                                          : "Test the database connection first"}
                            </p>
                            {migrationError && (
                              <p className="mt-1 max-w-xl text-[11px] leading-4 text-red-700" role="alert">
                                {migrationError}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={
                              connectionStatus !== "connected" ||
                              migrationStatus === "running" ||
                              migrationStatus === "complete" ||
                              pendingMigrations.length === 0
                            }
                            onClick={runMigrations}
                            className="inline-flex shrink-0 items-center justify-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {migrationStatus === "running" ? (
                              <FiLoader className="size-3.5 animate-spin" aria-hidden="true" />
                            ) : migrationStatus === "complete" ? (
                              <FiCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
                            ) : (
                              <FiSettings className="size-3.5" aria-hidden="true" />
                            )}
                            {migrationStatus === "running"
                              ? "Migrating..."
                              : migrationStatus === "complete"
                                ? "Complete"
                                : migrationStatus === "failed"
                                  ? "Retry migrations"
                                  : "Run migrations"}
                          </button>
                        </div>

                        {connectionStatus === "connected" &&
                          (completedMigrations.length > 0 || pendingMigrations.length > 0) && (
                          <div className="mt-3 space-y-3">
                            <div
                              aria-label="Migration progress"
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={migrationProgress}
                              className="h-1.5 overflow-hidden bg-slate-100"
                              role="progressbar"
                            >
                              <div
                                className="h-full bg-emerald-500 transition-[width] duration-300"
                                style={{ width: `${migrationProgress}%` }}
                              />
                            </div>
                            <ol className="space-y-1.5">
                              {[...completedMigrations, ...pendingMigrations].map((name, index) => {
                                const isDone = index < completedMigrations.length;
                                const isCurrent = migrationStatus === "running" &&
                                  name === pendingMigrations[0];

                                return (
                                  <li
                                    key={name}
                                    className={`flex items-center gap-2 text-[11px] ${
                                      isDone ? "text-slate-600" : "text-slate-400"
                                    }`}
                                  >
                                    {isDone ? (
                                      <FiCheck
                                        className="size-3.5 text-emerald-600"
                                        aria-hidden="true"
                                      />
                                    ) : isCurrent ? (
                                      <FiLoader
                                        className="size-3.5 animate-spin text-[#327db4]"
                                        aria-hidden="true"
                                      />
                                    ) : (
                                      <span className="size-3.5 rounded-full border border-slate-300" />
                                    )}
                                    {name}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        )}
                      </div>

                      <label className="flex items-start gap-2 border-t border-slate-200 pt-3">
                        <input
                          type="checkbox"
                          checked={values.autoMigrate}
                          onChange={(event) => update("autoMigrate", event.target.checked)}
                          className="mt-0.5 accent-[#327db4]"
                        />
                        <span>
                          <span className="block text-xs font-medium text-slate-700">
                            Auto-run migrations on startup
                          </span>
                          <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                            Apply new migrations automatically when the forum starts.
                          </span>
                        </span>
                      </label>
                    </div>
                  </section>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Forum details</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Set the name and basic contact information shown to your community.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Forum name" htmlFor="forumName">
                      <input
                        id="forumName"
                        required
                        value={values.forumName}
                        onChange={(event) => update("forumName", event.target.value)}
                        className={inputClassName}
                        placeholder="My Community"
                      />
                    </Field>
                    <Field label="Contact email" htmlFor="contactEmail">
                      <input
                        id="contactEmail"
                        type="email"
                        required
                        value={values.contactEmail}
                        onChange={(event) => update("contactEmail", event.target.value)}
                        className={inputClassName}
                        placeholder="hello@example.com"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field
                        label="Forum URL"
                        htmlFor="forumUrl"
                        hint="Include the protocol, for example https://forum.example.com"
                      >
                        <input
                          id="forumUrl"
                          type="url"
                          required
                          value={values.forumUrl}
                          onChange={(event) => update("forumUrl", event.target.value)}
                          className={inputClassName}
                          placeholder="https://forum.example.com"
                        />
                      </Field>
                    </div>
                    <Field label="Default timezone" htmlFor="timezone">
                      <select
                        id="timezone"
                        value={values.timezone}
                        onChange={(event) => update("timezone", event.target.value)}
                        className={inputClassName}
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/Los_Angeles">America/Los_Angeles</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                        <option value="Australia/Sydney">Australia/Sydney</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Administrator account</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Create the first account. It will have full forum administration permissions.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Username" htmlFor="adminUsername">
                      <input
                        id="adminUsername"
                        autoComplete="username"
                        required
                        value={values.adminUsername}
                        onChange={(event) => update("adminUsername", event.target.value)}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Email address" htmlFor="adminEmail">
                      <input
                        id="adminEmail"
                        type="email"
                        autoComplete="email"
                        required
                        value={values.adminEmail}
                        onChange={(event) => update("adminEmail", event.target.value)}
                        className={inputClassName}
                      />
                    </Field>
                    <Field
                      label="Password"
                      htmlFor="adminPassword"
                      hint="Use at least 8 characters."
                    >
                      <input
                        id="adminPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={values.adminPassword}
                        onChange={(event) => update("adminPassword", event.target.value)}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Confirm password" htmlFor="confirmPassword">
                      <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={values.confirmPassword}
                        onChange={(event) => update("confirmPassword", event.target.value)}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Review your settings</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Check the details before handing them to the installer.
                  </p>
                  <div className="mt-6 divide-y divide-slate-200 border border-slate-200">
                    <ReviewSection title="Database">
                      <ReviewRow label="Type" value={values.databaseType === "postgresql" ? "PostgreSQL" : "MySQL / MariaDB"} />
                      <ReviewRow label="Host" value={`${values.databaseHost}:${values.databasePort}`} />
                      <ReviewRow label="Database" value={values.databaseName} />
                      <ReviewRow label="Username" value={values.databaseUser} />
                      <ReviewRow label="Table prefix" value={values.tablePrefix || "(none)"} />
                      <ReviewRow label="Password" value={values.databasePassword ? "Provided" : "Not provided"} />
                      <ReviewRow label="Auto-migrate on startup" value={values.autoMigrate ? "Enabled" : "Disabled"} />
                    </ReviewSection>
                    <ReviewSection title="Forum">
                      <ReviewRow label="Name" value={values.forumName} />
                      <ReviewRow label="URL" value={values.forumUrl} />
                      <ReviewRow label="Contact email" value={values.contactEmail} />
                      <ReviewRow label="Timezone" value={values.timezone} />
                    </ReviewSection>
                    <ReviewSection title="Administrator">
                      <ReviewRow label="Username" value={values.adminUsername} />
                      <ReviewRow label="Email" value={values.adminEmail} />
                      <ReviewRow label="Password" value="Set (hidden)" />
                    </ReviewSection>
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-5 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
                  {error}
                </p>
              )}
            </div>

            <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-8">
              {step > 0 ? (
                <button
                  type="button"
                  disabled={databaseBusy}
                  onClick={goBack}
                  className="inline-flex items-center gap-1 border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                >
                  <FiChevronLeft aria-hidden="true" />
                  Back
                </button>
              ) : (
                <span />
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  disabled={databaseBusy}
                  onClick={goNext}
                  className="inline-flex items-center gap-1 border border-[#286a9b] bg-[#327db4] px-4 py-2 text-xs font-medium text-white hover:bg-[#286a9b] disabled:cursor-wait disabled:opacity-60"
                >
                  {step === 0 ? "Start installation" : "Continue"}
                  <FiChevronRight aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 border border-[#286a9b] bg-[#327db4] px-4 py-2 text-xs font-medium text-white hover:bg-[#286a9b]"
                >
                  Finish setup
                  <FiCheck aria-hidden="true" />
                </button>
              )}
            </footer>
          </form>
        </section>

        <a
          href="https://github.com/olliedean/forum"
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-[#327db4]"
          target="_blank"
          rel="noreferrer"
        >
          <FaGithub aria-hidden="true" className="size-4" />
          olliedean/forum
        </a>
      </div>
    </main>
  );
}

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
        {title}
      </h3>
      <dl className="grid gap-x-4 gap-y-2 px-3 py-3 text-xs sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-3">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-slate-700">{value}</dd>
    </div>
  );
}
