CREATE TYPE "public"."node_stance" AS ENUM('community', 'neutral', 'opposing');--> statement-breakpoint
ALTER TABLE "Nodes" ADD COLUMN "stance" "node_stance" DEFAULT 'neutral' NOT NULL;