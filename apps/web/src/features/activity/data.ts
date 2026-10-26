import "server-only";

import { prisma } from "@rallly/database";
import type { AuthorizedSpaceId } from "@/features/space/types";
import { parsePollActivity } from "./schema";

/**
 * Latest activity for a poll, newest first; every row when no limit is
 * given. Rows whose type or payload this
 * version of the vocabulary can't interpret are skipped rather than failing
 * the feed.
 */
export async function listPollActivity({
  pollId,
  spaceId,
  participantId,
  excludeParticipantActivity,
  limit,
}: {
  pollId: string;
  spaceId: AuthorizedSpaceId;
  /** Only the events about this response. */
  participantId?: string;
  /** Hide response-specific history from organizers of anonymous polls. */
  excludeParticipantActivity?: boolean;
  limit?: number;
}) {
  const rows = await prisma.pollActivity.findMany({
    where: {
      pollId,
      ...(participantId && { participantId }),
      ...(excludeParticipantActivity && { participantId: null }),
      poll: {
        spaceId,
        deleted: false,
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });

  return rows.flatMap((row) => {
    const event = parsePollActivity(row);
    return event ? [{ id: row.id, createdAt: row.createdAt, event }] : [];
  });
}
