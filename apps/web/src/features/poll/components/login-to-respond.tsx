"use client";

import { Button } from "@rallly/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@rallly/ui/dialog";
import { usePathname, useSearchParams } from "next/navigation";
import { Trans } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";

export const LoginToRespond = () => {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <Trans i18nKey="loginToRespondTitle" defaults="Log in to respond" />
        </DialogTitle>
        <DialogDescription>
          <Trans
            i18nKey="loginToRespondDescription"
            defaults="This instance only accepts responses from users who log in with their organization account. Your selection is not saved, so you will need to vote again after logging in."
          />
        </DialogDescription>
      </DialogHeader>
      <Button
        variant="primary"
        size="lg"
        onClick={() => {
          authClient.signIn.oauth2({
            providerId: "oidc",
            callbackURL: search ? `${pathname}?${search}` : pathname,
            errorCallbackURL: "/login",
          });
        }}
      >
        <Trans i18nKey="login" defaults="Login" />
      </Button>
    </>
  );
};
