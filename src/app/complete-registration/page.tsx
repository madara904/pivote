import { RegistrationCompletion } from "./components/registration/registration-completion";




export default function CompleteRegistrationPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Registrierung abschließen</h1>
          <p className="text-slate-600">Lassen Sie uns Ihr Unternehmen einrichten, um zu beginnen</p>
        </div>
        <RegistrationCompletion />
      </div>
    </div>
  )
}
