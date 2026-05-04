import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              {isBn ? "৪০৪ — পৃষ্ঠা পাওয়া যায়নি" : "404 Page Not Found"}
            </h1>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            {isBn ? "অনুরোধকৃত পৃষ্ঠাটি বিদ্যমান নেই।" : "Did you forget to add the page to the router?"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
