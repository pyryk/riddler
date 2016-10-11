/* Replace with your SQL commands */
CREATE TABLE questions (
    "id" serial NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"creator" text references users(username) on delete set null,
	PRIMARY KEY ("id")
);
