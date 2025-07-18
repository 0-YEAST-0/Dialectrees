CREATE TABLE "VoteCache" (
	"node_id" integer PRIMARY KEY NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"dislikes" integer DEFAULT 0 NOT NULL,
	"community" integer DEFAULT 0 NOT NULL,
	"opposing" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Likes" RENAME TO "Votes";--> statement-breakpoint
ALTER TABLE "Members" RENAME COLUMN "admin_rank" TO "permission_rank";--> statement-breakpoint
ALTER TABLE "Votes" DROP CONSTRAINT "Likes_user_id_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "Votes" DROP CONSTRAINT "Likes_node_id_Nodes_id_fk";
--> statement-breakpoint
ALTER TABLE "Votes" DROP CONSTRAINT "Likes_user_id_node_id_pk";--> statement-breakpoint
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_user_id_node_id_pk" PRIMARY KEY("user_id","node_id");--> statement-breakpoint
ALTER TABLE "Votes" ADD COLUMN "is_stance" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "Votes" ADD COLUMN "is_positive" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "VoteCache" ADD CONSTRAINT "VoteCache_node_id_Nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."Nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_node_id_Nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."Nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_is_stance_node_id_user_id_unique" UNIQUE("is_stance","node_id","user_id");