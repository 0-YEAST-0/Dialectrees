CREATE TYPE "public"."node_type" AS ENUM('post', 'header', 'group');--> statement-breakpoint
CREATE TABLE "Likes" (
	"user_id" varchar(64) NOT NULL,
	"node_id" integer NOT NULL,
	CONSTRAINT "Likes_user_id_node_id_pk" PRIMARY KEY("user_id","node_id")
);
--> statement-breakpoint
CREATE TABLE "Members" (
	"user_id" varchar(64) PRIMARY KEY NOT NULL,
	"admin_rank" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "Nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"author" varchar(64) NOT NULL,
	"title" varchar(128) NOT NULL,
	"type" "node_type" NOT NULL,
	"parent" integer,
	"content" text,
	"pinned" boolean DEFAULT false,
	"created" timestamp DEFAULT now(),
	"last_edited" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"email" varchar(64) NOT NULL,
	"username" varchar(24) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_node_id_Nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."Nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Members" ADD CONSTRAINT "Members_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Nodes" ADD CONSTRAINT "Nodes_author_Users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Nodes" ADD CONSTRAINT "Nodes_parent_Nodes_id_fk" FOREIGN KEY ("parent") REFERENCES "public"."Nodes"("id") ON DELETE cascade ON UPDATE no action;