import { Download, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { AppId } from "@/lib/api/types";
import { contentEase, emptyState, emptyStateChild } from "@/lib/motion";

interface ProviderEmptyStateProps {
  appId: AppId;
  onCreate?: () => void;
  onImport?: () => void;
}

export function ProviderEmptyState({
  appId,
  onCreate,
  onImport,
}: ProviderEmptyStateProps) {
  const { t } = useTranslation();
  const showSnippetHint =
    appId === "claude" || appId === "codex" || appId === "gemini";

  return (
    <motion.div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-10 text-center"
      variants={emptyState}
      initial="initial"
      animate="animate"
      transition={contentEase}
    >
      <motion.div
        variants={emptyStateChild}
        initial="initial"
        animate="animate"
        transition={{ ...contentEase, delay: 0.04 }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
      >
        <Users className="h-7 w-7 text-muted-foreground" />
      </motion.div>
      <h3 className="text-lg font-semibold">{t("provider.noProviders")}</h3>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        {t("provider.noProvidersDescription")}
      </p>
      {showSnippetHint && (
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          {t("provider.noProvidersDescriptionSnippet")}
        </p>
      )}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...contentEase, delay: 0.1 }}
        className="mt-6 flex flex-col gap-2"
      >
        {onImport && (
          <Button onClick={onImport}>
            <Download className="mr-2 h-4 w-4" />
            {appId === "claude-desktop"
              ? t("provider.importFromClaude", {
                  defaultValue: "将 Claude Code 中已有的供应商导入",
                })
              : t("provider.importCurrent")}
          </Button>
        )}
        {onCreate && (
          <Button variant={onImport ? "outline" : "default"} onClick={onCreate}>
            {t("provider.addProvider")}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
