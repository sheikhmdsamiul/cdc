import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  const toggle = () => {
    i18n.changeLanguage(isBn ? "en" : "bn");
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        className="text-xs font-semibold h-7 px-2 gap-1"
        title={isBn ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
      >
        <Globe className="h-3.5 w-3.5" />
        {isBn ? "বাংলা" : "English"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="text-xs font-medium h-8 gap-1.5 flex-shrink-0"
      title={isBn ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
    >
      <Globe className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="hidden sm:inline">{isBn ? "বাংলা → English" : "English → বাংলা"}</span>
      <span className="sm:hidden">{isBn ? "EN" : "বাং"}</span>
    </Button>
  );
}