import { describe, expect, it } from "vitest";
import { deriveInstancePolicy } from "./utils";

describe("deriveInstancePolicy", () => {
  describe("spacesAlwaysShared", () => {
    it("forces every space to be shared on a self-hosted instance", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: true,
          whiteLabelAddon: false,
          requireOidcToVote: false,
        }).spacesAlwaysShared,
      ).toBe(true);
    });

    it("leaves sharing to each space on cloud", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: false,
          whiteLabelAddon: false,
          requireOidcToVote: false,
        }).spacesAlwaysShared,
      ).toBe(false);
    });
  });

  describe("spaceBrandingAllowed", () => {
    it("suppresses space branding on a white label instance", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: true,
          whiteLabelAddon: true,
          requireOidcToVote: false,
        }).spaceBrandingAllowed,
      ).toBe(false);
    });

    it("allows space branding on a self-hosted instance without the addon", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: true,
          whiteLabelAddon: false,
          requireOidcToVote: false,
        }).spaceBrandingAllowed,
      ).toBe(true);
    });

    it("allows space branding on cloud", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: false,
          whiteLabelAddon: false,
          requireOidcToVote: false,
        }).spaceBrandingAllowed,
      ).toBe(true);
    });
  });

  describe("spaceAttributionConfigurable", () => {
    it("is licensed at instance level on a self-hosted instance", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: true,
          whiteLabelAddon: false,
          requireOidcToVote: false,
        }).spaceAttributionConfigurable,
      ).toBe(false);
    });

    it("is a per-space setting on cloud", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: false,
          whiteLabelAddon: false,
          requireOidcToVote: false,
        }).spaceAttributionConfigurable,
      ).toBe(true);
    });
  });

  describe("votingRequiresOidc", () => {
    it("is on when a self-hosted operator requires login", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: true,
          whiteLabelAddon: false,
          requireOidcToVote: true,
        }).votingRequiresOidc,
      ).toBe(true);
    });

    it("is off by default on a self-hosted instance", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: true,
          whiteLabelAddon: false,
          requireOidcToVote: false,
        }).votingRequiresOidc,
      ).toBe(false);
    });

    it("ignores the setting on cloud", () => {
      expect(
        deriveInstancePolicy({
          isSelfHosted: false,
          whiteLabelAddon: false,
          requireOidcToVote: true,
        }).votingRequiresOidc,
      ).toBe(false);
    });
  });
});
