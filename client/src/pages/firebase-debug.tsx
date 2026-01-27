import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testCrash, sendTestLog, logError } from "@/lib/firebase";
import { Capacitor } from "@capacitor/core";
import { ArrowLeft } from "lucide-react";

export default function FirebaseDebug() {
  const handleTestCrash = async () => {
    if (confirm("This will crash the app. Continue?")) {
      await testCrash();
    }
  };

  const handleTestLog = async () => {
    await sendTestLog();
    alert("Test log sent! Check Firebase Console in 5 minutes.");
  };

  const handleTestError = async () => {
    try {
      throw new Error("Test error from Firebase Debug page");
    } catch (error) {
      await logError(error as Error, "Firebase Debug Test");
      alert("Error logged! Check Firebase Console in 5 minutes.");
    }
  };

  const handleJavaScriptError = () => {
    // This will cause a JavaScript error
    const obj: any = null;
    obj.nonExistentMethod();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>🔥 Firebase Crashlytics Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Platform:</strong> {Capacitor.getPlatform()}
              </p>
              <p className="text-sm text-blue-900">
                <strong>Native:</strong> {Capacitor.isNativePlatform() ? "Yes ✅" : "No ❌"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Test Crashlytics</h3>
              
              <Button
                onClick={handleTestLog}
                className="w-full"
                variant="outline"
              >
                📝 Send Test Log
              </Button>

              <Button
                onClick={handleTestError}
                className="w-full"
                variant="outline"
              >
                ⚠️ Log Test Error (Non-Fatal)
              </Button>

              <Button
                onClick={handleJavaScriptError}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                💥 Trigger JavaScript Error
              </Button>

              <Button
                onClick={handleTestCrash}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                🔥 Test Crash (Fatal)
              </Button>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">⏱️ Important:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-900">
                <li>Crashes appear in Firebase Console within 5-10 minutes</li>
                <li>First crash may take up to 15 minutes</li>
                <li>App must have internet connection</li>
                <li>Only works on Android device/emulator (not web)</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">✅ How to Verify:</p>
              <ol className="list-decimal list-inside space-y-1 text-green-900">
                <li>Click "Send Test Log" or "Test Crash"</li>
                <li>Wait 5-10 minutes</li>
                <li>Go to Firebase Console → Crashlytics</li>
                <li>Check for crash reports or logs</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
